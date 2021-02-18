/*
  All messages and errors are compared against these
  error fragments. If they match, an email will not be 
  sent.

  All fragments in a list must match to make it a match.
*/
const DO_NOT_SEND_MAIL_FOR_ERROR_FRAGMENTS = [
  [ "pin reset token" ],
  [ "failed to load pin reset", "enoent" ],
  [ "failed to create new user", "already in folio" ],
  [ "received invalid personnummer" ],
  [ "missing required data when creating user"],
  [ "failed to build register form", "user: not authenticated"]
]

/*
  All messages and errors are compared against these
  error fragments. If they match, the texts to the users
  will be exchanged.
*/
const FRAGMENT_TO_USER_ERROR_MESSAGE = [
  {
    frags: [ "failed to create new user", "already in folio" ],
    texts: {
      "sv-SE": {
        title: "Misslyckades med att skapa nytt konto",
        body: "Det ser ut som om du redan har ett bibliotekskonto. Har du glömt din PIN-kod kan du återställa den <a href='/pin-reset-request?language=sv-SE'>här</a>."
      },
      "en-GB": {
        title: "Failed to create account",
        body: "It looks like you already have an account. If you have forgotten your PIN code you can reset it <a href='/pin-reset-request'>here</a>."
      }
    }
  },
  {
    frags: [ "failed to build register form", "user: not authenticated"],
    texts: {
      "sv-SE": {
        title: "Vi kan inte se att du är inloggad.",
        body: "Du borde fått logga in innan du kom till denna sidan. Försök gärna igen eller <a href='http://www.lib.chalmers.se/en/help/' target='_blank'>kontakta biblioteket</a> för hjälp."
      },
      "en-GB": {
        title: "We can't see that you are logged in.",
        body: "You should have been logged in before you came to this page. Please try again or <a href='http://www.lib.chalmers.se/en/help/' target='_blank'>contact the library</a> if you need help."
      }
    }
  },
  {
    frags: [ "failed to load token data"],
    texts: {
      "sv-SE": {
        title: "Återställningstiden har gått ut",
        body: "<span style='font-size:1.2em;'>Begär ett nytt <a href='/pin-reset-request?language=sv-SE'>återställningsmejl</a>.</span>"
      },
      "en-GB": {
        title: "Pin reset link has expired.",
        body: "<span style='font-size:1.2em;'>Request a new <a href='/pin-reset-request'>reset email</a>.</span>"
      }
    }
  }
]

const DO_NOT_SEND_MAIL_FOR_STATUS_CODE = [
  404
]

const STATUS_CODE_TO_ERROR_MESSAGE = {
  404: {
    texts: {
      "sv-SE": {
        title: "Kunde inte hitta sidan",
        body: "Vi kan inte hitta sidan du letar efter."
      },
      "en-GB": {
        title: "Page not found",
        body: "We can't find the page you are looking for."
      }
    }
  }
}

module.exports = class ErrorHandler {
  constructor(debug, mailingList, sgMail, senderEmail) {
    this.debug = debug;
    this.mailingList = mailingList;
    this.sgMail = sgMail;
    this.senderEmail = senderEmail;
  }
  
  handle(translation, httpResponse, error) {
    try {
      console.error(error);

      let status = error.status || 500;
      httpResponse.status(status);

      let titleToUser = translation.errorTitleGeneral;
      let bodyToUser = translation.helpWhenSomethingWentWrong;
  
      // Decide if we should send mail about this error
      let doSendMail = 
        DO_NOT_SEND_MAIL_FOR_STATUS_CODE
          .indexOf(status) === -1 &&
        !DO_NOT_SEND_MAIL_FOR_ERROR_FRAGMENTS
          .some(frag => this._matchesFragment(error, frag));

      // Change title and body that are shown to the user
      // to more helpful things here
      let fragToMessage = STATUS_CODE_TO_ERROR_MESSAGE[status];
      if (!fragToMessage) {
        fragToMessage = FRAGMENT_TO_USER_ERROR_MESSAGE
          .find(fragAndTexts => 
            this._matchesFragment(error, fragAndTexts.frags));
      }
      if (fragToMessage) {
        let fragTexts = fragToMessage.texts[translation.languageCode];
        titleToUser = fragTexts.title;
        bodyToUser = fragTexts.body;
      }

      // Send information about error to interested parties
      if (doSendMail) {
        this._sendToMailingList("Fel i tjänsten libcard",
          this._buildAdminErrorMessage(error, titleToUser, bodyToUser),
          this._buildAdminErrorMessageHtml(error, titleToUser, bodyToUser));
      }
  
      if (!this.debug) {
        httpResponse.render("error", {
          title: titleToUser,
          body: bodyToUser,
          translation: translation
        })
      } else {
        httpResponse.render("error", {
          title: titleToUser,
          body: bodyToUser,
          message: typeof error === "object" ? 
            error.message : error,
          error: this._serializeError(error),
          translation: translation
        })
      }
    } catch (errorHandlingError) {
      console.error("Encountered error when handling an error, oh the irony.", 
        errorHandlingError)
    }
  }

  _buildAdminErrorMessage(error, titleToUser, bodyToUser) {
    let message = typeof error === "object" ?
      error.message : error;
    return "Ett fel uppstod i tjänsten libcard.\n\n" + 
      "Användaren fick se följande:\n" +
      "Titel: " + titleToUser + "\n" + 
      "Brödtext: " + bodyToUser + "\n\n" +
      "Det riktiga felet vi fick in var följande.\n" + 
      "Meddelande: " + message + "\n" + 
      "Data från fel: " + this._serializeError(error) + "\n\n";
  }

  _buildAdminErrorMessageHtml(error, titleToUser, bodyToUser) {
    let message = typeof error === "object" ?
      error.message : error;
    return "<h1>Ett fel uppstod i tjänsten libcard.</h1>" + 
      "<h2>Användaren fick se</h2>" +
      "<strong>Titel</strong> " + titleToUser + "<br/>" + 
      "<strong>Brödtext</strong> " + bodyToUser + "<br/><br/>" +
      "<h2>Det riktiga felet vi fick in</h2>" + 
      "<strong>Meddelande</strong> " + message + "<br/>" + 
      "<strong>Data från fel</strong> " + this._serializeError(error) + "<br/><br/>";
  }

  _sendToMailingList(subject, text, html) {
    this.sgMail.sendMultiple({
      to: this.mailingList,
      from: this.senderEmail,
      subject: subject,
      text: text,
      html: html,
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
    })
  }

  _serializeError(error) {
    let res = error;
    let obj = error;
    if (error && typeof error === "object") {
      obj = {};
      Object.getOwnPropertyNames(error).forEach(prop => 
        obj[prop] = error[prop]);
      res = JSON.stringify(obj, null, 2);
    }
    return res;
  }

  _matchesFragment(error, frags) {
    let message = typeof error === "object" ? 
      error.message : error;
    let lcMessage = message.toLowerCase();
    console.log(`lcMessage: ${lcMessage}`)
    return frags.every(frag => lcMessage.indexOf(frag.toLowerCase()) > -1);
  }
}