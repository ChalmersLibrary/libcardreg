const express = require("express");
const router = express.Router();
const stringify = require("json-stringify-safe");
const translation = require("../resources/translation");
const languageCodes = require("../resources/languageCode");
const flagImage = require("../resources/flagImage");
const languageCodeEnums = require("../resources/languageCodeEnums");
const sgMail = require("@sendgrid/mail");

const PdbCommunicator = require("../communication/pdbcommunicator");
const FolioCommunicator = require("../communication/foliocommunicator");
const TokenManager = require("../tokens/tokenManager");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const folio = new FolioCommunicator(
  process.env.okapiUrl,
  process.env.folioUsername,
  process.env.folioPassword,
  process.env.folioTenant
)

const tokenManager = new TokenManager(
  process.env.SAVE_LOCATION,
  30
)

const asyncMiddleware = fn => (req, res, next) => fn(req, res, next).catch(next);

router.get("/", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  const languageCode = languageCodes.changeLanguageCode(selectedLanguage);
  const flagImagePng = flagImage.changeFlagImage(selectedLanguage);

  res.render("index", {
    user: req.user,
    translation: translation.getTranslations(selectedLanguage),
    language: selectedLanguage || languageCodeEnums.ENGB,
    changeLanguage: {
      languageCode: languageCode,
      flagImage: flagImagePng,
      url: ""
    }
  });

  // Sneaky token cleanup here
  await tokenManager.removeExpiredTokens();
}));

router.get("/regform-authenticated", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  const languageCode = languageCodes.changeLanguageCode(selectedLanguage);
  const flagImagePng = flagImage.changeFlagImage(selectedLanguage);

  try {
    if (req.isAuthenticated()) {
      let cid = req.user.UID.split("@")[0];
      let person, personStr = "";

      let pdb = new PdbCommunicator(
        process.env.pdburl,
        process.env.pdbuser,
        process.env.pdbpassword
      )
      try {
        await pdb.connect();
        person = await pdb.getByCid(cid);
        personStr = stringify(person, null, 4);
        await pdb.closeConnection();
      } catch (error) {
        console.error("Failed when looking up CID.", error);
        res.redirect("/");
        try {
          await pdb.closeConnection();
        } catch (closeConnectionError) {
          console.error("Failed to close connection against PDB.",
            closeConnectionError);
        }
          error.message = "Failed to retrieve PDB data for authenticated user (" + cid + "): " +
          error.message;
          throw error;
      }

      let patronGroup = process.env.GROUP_STUDENT //Default patron group to Public

      if (person.current_groups) {
        let groups = person.current_groups
          .filter(group => group.name === 's_eresource_employee' || group.name === 's_eresource_student')
          .filter(group => group.time_active_now)

        if (groups.some(group => group.name === 's_eresource_employee')) {
          patronGroup = process.env.GROUP_STAFF //Set patron group to Staff
        } else if (groups.some(group => group.name === 's_eresource_student')) {
          patronGroup = process.env.GROUP_STUDENT //Set patron group to Student
        }
      } else {
        patronGroup = process.env.GROUP_STUDENT
        console.log("User with CID " + cid + " has no group in PDB. Will default to Student in FOLIO.")
      }

      res.render("regformAuthenticated", {
        person: {
          personNummerEditable: false,
          personString: personStr,
          firstName: person.firstname,
          lastName: person.lastname,
          personNummer: person.current_pnr,
          email: person.official_emails != undefined ? person.official_emails[0] : "",
          cid: cid,
          patronGroup: patronGroup
        },
        translation: translation.getTranslations(selectedLanguage),
        language: selectedLanguage || languageCodeEnums.ENGB,
        changeLanguage: {
          languageCode: languageCode,
          flagImage: flagImagePng,
          url: "regform-authenticated"
        }
      });
    } else {
      throw new Error("Not authenticated.");
    }
  } catch (error) {
    error.message = "Failed to build register form for authenticated user (" + req.user.UID.split("@")[0] + "): " +
      error.message;
    throw error;
  }
}))

router.get("/regform", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  const languageCode = languageCodes.changeLanguageCode(selectedLanguage);
  const flagImagePng = flagImage.changeFlagImage(selectedLanguage);

  try {
    res.render("regform", {
      person: {
        personNummerEditable: true,
        firstName: "",
        lastName: "",
        personNummer: "",
        email: "",
        personString: "",
        cid: ""
      },
      translation: translation.getTranslations(selectedLanguage),
      language: selectedLanguage || languageCodeEnums.ENGB,
      changeLanguage: {
        languageCode: languageCode,
        flagImage: flagImagePng,
        url: "regform"
      }
    });
  } catch (error) {
    error.message = "Failed to build register form: " + error.message;
    throw error;
  }
}));

router.post("/done", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  const text = translation.getTranslations(selectedLanguage);
  try {
    // Transfer fields when using honeypot
    if (!req.body.email) {
      req.body.email = req.body.fnbjm;
    }

    if (req.body.main) {
      // We got something in our honeypot.
      throw new Error("We got something in our honeypot.");
    } else if (!req.body.email ||
      !req.body.firstName || !req.body.lastName ||
      !req.body.personNummer) {
      let error = new Error("Missing required data when creating user.");
      error.status = 400;
      throw error;
    } else if (!req.body.cid && !isValidPersonnummer(req.body.personNummer)) {
      // We got an invalid personnummer proabably not from human.
      throw new Error("Received invalid personnummer when creating user.");
    } else {
      // Create expiration date
      let now = new Date();
      let threeYearsIntoTheFuture = new Date(
        now.getFullYear() + 3,
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      // Change personnummer to 10 digits without dash
      let fixedPersonnummer = folio.convertToUsername(
        req.body.personNummer);

      if (!req.body.patronGroup) {
        req.body.patronGroup = process.env.GROUP_PUBLIC
      }

      // Create the user in FOLIO.
      await folio.createUser({
        cid: req.body.cid,
        patronGroup: req.body.patronGroup,
        fname: req.body.firstName,
        lname: req.body.lastName,
        pnr: fixedPersonnummer,
        email: req.body.email,
        time_active: {
          stop: threeYearsIntoTheFuture.toISOString()
        },
        pinCode: req.body.pinCode
      });

      // Send mail to user about the account being created.
      await sgMail.send({
        to: req.body.email,
        from: process.env.SENDER_EMAIL,
        subject: text.createdMailSubject,
        text: req.body.cid ? text.createdMailTextChalmers : text.createdMailTextlPublic,
        html: req.body.cid ? text.createdMailHtmlChalmers : text.createdMailHtmlPublic,
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: false
          },
          subscriptionTracking: {
            enable: false
          }
        }
      });

      // Render the final done page for the user.
      res.render("done", {
        fname: req.body.firstName,
        lname: req.body.lastName,
        translation: text,
        isChalmersUser: req.body.cid ? true : false
      });
    }
  } catch (error) {
    error.message = "Failed to create new user: " + error.message;
    throw error;
  }
}));

router.get("/donetest", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  res.render("done", {
    fname: req.query.firstname,
    lname: req.query.lastname,
    translation: translation.getTranslations(selectedLanguage),
    isChalmersUser: req.query.chalmers === "true"
  });
}));

router.get("/pin-reset-request", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  const languageCode = languageCodes.changeLanguageCode(selectedLanguage);
  const flagImagePng = flagImage.changeFlagImage(selectedLanguage);
  res.render("pinResetRequest", {
    translation: translation.getTranslations(selectedLanguage),
    language: selectedLanguage || languageCodeEnums.ENGB,
    changeLanguage: {
      languageCode: languageCode,
      flagImage: flagImagePng,
      url: "pin-reset-request"
    }
  });
}));

router.post("/pin-reset-request", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  const text = translation.getTranslations(selectedLanguage);

  try {
    let username = folio.convertToUsername(req.body.personNummer);

    // Check if we have account with submitted personal identity number.
    let user = await folio.getUser(username);

    if (user && user.personal && user.personal.email) {
      // Generate a temporary password reset token.
      let creationTime = Date.now();
      let token = await tokenManager.generateUniqueToken();

      // Save that token in storage with creation time and username.
      await tokenManager.saveTokenData(token, {
        created: creationTime,
        username: username
      });

      // Send email with link to pin-reset with token in link.
      let url = process.env.BASE_URL + "/pin-reset?t=" + token;
      await sgMail.send({
        to: user.personal.email,
        from: process.env.SENDER_EMAIL,
        subject: text.pinResetMailSubject,
        text: text.pinResetMailText.replace("{{url}}", url),
        html: text.pinResetMailHtml.replace("{{url}}", url),
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: false
          },
          subscriptionTracking: {
            enable: false
          }
        }
      });

      res.render("pinResetRequestResult", {
        translation: text
      });
    } else {
      res.render("pinResetRequestResult", {
        translation: text
      });
    }
  } catch (error) {
    error.message = "Failed to request pin reset: " + error.message;
    throw error;
  }
}));

router.get("/pin-reset", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  const text = translation.getTranslations(selectedLanguage);

  try {
    // Render form if token exists and is valid.
    if (req.query.t) {
      let data = await tokenManager.loadTokenData(req.query.t);
      if (tokenManager.isTokenDataValid(data)) {
        res.render("pinReset", {
          translation: text,
          token: req.query.t,
          personNummer: data.username
        });
      } else {
        let error = new Error("Pin reset token is invalid.");
        error.status = 400;
        throw error;
      }
    } else {
      let error = new Error("Pin reset token is missing.");
      error.status = 400;
      throw error;
    }
  } catch (error) {
    error.message = "Failed to load pin reset: " + error.message;
    throw error;
  }
}));

router.post("/pin-reset", asyncMiddleware(async function (req, res, next) {
  const selectedLanguage = req.query.language;
  const text = translation.getTranslations(selectedLanguage);

  try {
    // Check if token exists and is valid
    if (req.body.t) {
      let data = await tokenManager.loadTokenData(req.body.t);
      if (tokenManager.isTokenDataValid(data)) {
        // Update PIN
        await folio.updatePassword(data.username, req.body.pinCode);

        res.render("pinResetResult", {
          translation: text
        });
      } else {
        throw new Error("Pin reset token is invalid at POST.");
      }
    } else {
      throw new Error("Pin reset token is missing at POST.");
    }
  } catch (error) {
    error.message = "Failed to update pin: " + error.message;
    throw error;
  }
}));

module.exports = router;


// Internal functions

function isValidPersonnummer(input) {
  if (input === null || input === undefined || input === "") return false;

  const temp = input.replace("-", "").trim();
  const personnummer = temp.length === 12 ? temp.substring(2) : temp;
  const isValid = /^\d+$/.test(personnummer) && personnummer.length === 10;

  if (!isValid) return false;

  let sum = 0;
  for (let i = 0; i < personnummer.length; i++) {
    if (i % 2 === 0) {
      const digit = parseInt(personnummer[i]) * 2;
      sum += digit > 9 ? (digit - 9) : digit;
    } else {
      sum += parseInt(personnummer[i]);
    }
  }

  return sum % 10 === 0;

}
