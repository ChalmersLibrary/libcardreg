var createError = require("http-errors");
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const saml = require("passport-saml");
const translation = require("./resources/translation");
const url = require("url");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const ErrorHandler = require("./errors/errorHandler");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const USE_SAML = process.env.NODE_ENV !== "development";
if (process.env.NODE_ENV === "development") {
  process.env.DEVELOPMENT = "1";
}

const errorHandler = new ErrorHandler(
  process.env.DEVELOPMENT,
  process.env.ERROR_MAILING_LIST.split("|"),
  sgMail,
  process.env.SENDER_EMAIL
)

const port = process.env.PORT || 3000;

console.log(process.env.NODE_ENV);

let saml_cert, saml_pvk, saml_callback, saml_issuer, 
 idp_cert1, idp_cert2, idp_entryPoint, sessionSecret,
 saml_strategy;

if (USE_SAML) {
  saml_cert = fs.readFileSync(process.env.certfile, "utf-8");
  saml_pvk = fs.readFileSync(process.env.keyfile, "utf-8");
  saml_callback = process.env.SAML_CALLBACK || null;
  saml_issuer = process.env.SAML_ISSUER || null;
  idp_cert1 = process.env.IDP1_CERT || null;
  idp_cert2 = process.env.IDP2_CERT || null;
  idp_entryPoint = process.env.IDP_ENTRYPOINT || null;
  sessionSecret = process.env.SESSION_SECRET || null;

  saml_strategy = new saml.Strategy(
    {
      callbackUrl: saml_callback,
      entryPoint: idp_entryPoint,
      issuer: saml_issuer,
      acceptedClockSkewMs: -1,
      decryptionPvk: saml_pvk,
      cert: [idp_cert1, idp_cert2],
      identifierFormat: null
    },
    function(profile, done) {
      return done(null, {
        UID: profile["urn:oid:1.3.6.1.4.1.5923.1.1.1.6"]
      });
    }
  );
  
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.use(saml_strategy);
}

var indexRouter = require("./routes/index");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

if (USE_SAML) {
  app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());
} else {
  app.use((req, res, next) => {
    req.isAuthenticated = () => process.env.DEVELOPMENT_CID !== "";
    req.user = { UID:process.env.DEVELOPMENT_CID }
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

if (USE_SAML) {
  app.get(
    "/login",
    (req, res, next) => {
      req.query.RelayState = req.query.language;
      passport.authenticate("saml")(req, res, next);
    }
  );
  
  app.post(
    "/login/callback",
    passport.authenticate("saml", { failureRedirect: "/", failureFlash: true }),
    function(req, res) {
      res.redirect(url.format({
        pathname: "/regform-authenticated",
        query: {
          language: req.body.RelayState
        }
      }));
    }
  );
  
  app.get("/logout", function(req, res) {
    passport._strategy("saml").logout(req, function(err, requestUrl) {
      req.logout();
      res.redirect("/");
    });
  });
  
  app.get("/saml/MetaData", (req, res) => {
    res.type("application/xml");
    res.send(saml_strategy.generateServiceProviderMetadata(saml_cert));
  });
} else {
  app.get("/login", (req, res) => res.redirect(`/regform-authenticated?language=${req.query.language}`));
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  const selectedLanguage = req.query.language;
  const text = translation.getTranslations(selectedLanguage)

  errorHandler.handle(text, res, err);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
