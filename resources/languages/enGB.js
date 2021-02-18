const texts = {
    languageCode: "en-GB",

    //Entry view
    libraryAccountRegistration: "Library Account Registration",
    createALibraryAccount: "Create a library account!",
    welcomeText: "<p>Register for a library account in order to borrow and request books at Chalmers Library. \
                    Everyone is welcome to borrow books.</p> \
                  <p>You can start requesting books as soon as the registration is done.</p> \
                  <p>To get started, log in with your Chalmers ID (CID) or register as a member of the general public.</p>",           
    chalmersButton: "Log in with CID",
    publicButton: "General public",

    //Registration form
    registrationForm: "Registration",
    personNummer:"Personnummer",
    firstName: "First name",
    lastName: "Last name",
    eMailAdress: "Email address",
    iAcceptTheTermsOfUse: "I accept the <a href='http://www.lib.chalmers.se/en/at-the-library/anvaendarregler/' target='_blank'>Terms of Use</a>",
    send: "Send",
    pinCode: "Choose a PIN code",
    pinCodeRepeat: "Repeat PIN code",
    pinCodeAuthenticated: "PIN code (for self check out machines)",
    pinCodeExplanatoryText: "Choose a 6 digit number as your PIN code. It may not be your date of birth.",
    chooseLanguage: "Choose language",

    //Receipt view
    accountActivatedHeader: "Your library account is now activated, ",
    accountActivatedTextChalmers: "Your account has been activated and you can start requesting books.<p> \
                                   Go to <a href='http://www.lib.chalmers.se/en/'>www.lib.chalmers.se</a> if you want to search for literature.</p>",
    accountActivatedTextPublic: "Your account has been activated and you can start requesting books. \
                                 Bring your ID-card to the library information desk to activate your card for borrowing books.<p> \
                                 Go to <a href='http://www.lib.chalmers.se/en/'>www.lib.chalmers.se</a> if you want to search for literature. </p>",

    //Done
    donePageTitle: "Registration successful!",
    //Not used      libraryAccountActivated: "Your library account is now activated and you can start requesting books.",
    //Not used      continueToLibChalmersSe: "Fortsätt till <a href='http://www.lib.chalmers.se/en/'>www.lib.chalmers.se</a> för att söka litteratur!",
        
    //Footer
    forgotPin: "Have a library account but forgot your PIN code? <a href='/pin-reset-request' title='Reset PIN'>Reset your PIN here</a>.",
    moreInfo: "More information about <a href='http://www.lib.chalmers.se/en/at-the-library/borrow/' title='About borrowing' target='_blank'>borrowing books</a>.",
    needHelp: "Need help? <a href='http://www.lib.chalmers.se/en/help/' target='_blank'>Contact us</a>.",

    //Error
    errorTitleGeneral: "Something went wrong.",
    helpWhenSomethingWentWrong: "<a href='http://www.lib.chalmers.se/en/help/' target='_blank'>Contact the library</a> for help.",

    //Created mail
    createdMailSubject: "Your library account at Chalmers Library",

    //PIN reset page
    requestResetPinHeader: "Reset your PIN code",
    requestResetPinText: "Type in your Swedish social security number (\"personnummer\") below, and we will send a reset PIN link to your registered email address.",
    getReset: "Request a reset email",
    resetEmailSentHeader: "Reset password email requested!",
    resetEmailSentText: "If you have a library account, a reset password email has been sent to the email address associated with your account. The reset password link in the email is valid for 30 minutes.",
    newPinHeader: "Choose a new PIN code",
    newPinSuccessHeader: "Your PIN code has been updated!",
    newPinSuccessText: "You can now start using your new PIN code.",

    temporaryEmailIssue: "We are currently having issues with emails not being delivered. Contact the library for help if you have not received an email within a few minutes.",

    //PIN-reset mail
    pinResetMailSubject: "PIN reset",

    //Form error message
    personnummerErrorMessage: "The personnummer is not correct. Don’t have a Swedish personnummer? Please come to the library to get an account.",
    firstNameErrorMessage: "Please fill in your first name.",
    lastNameErrorMessage: "Please fill in your last name.",
    emailErrorMessage: "Please provide a valid email address.",
    pinOneErrorMessage: "The PIN code must be 6 digits and not your date of birth.",
    pinRepeatErrorMessage: "The PIN code is not the same as above.",
}

Object.assign(
  texts,
  require("./mail/mailHtmlChalmersEng"),
  require("./mail/mailHtmlPublicEng"),
  require("./mail/MailTextChalmersEng"),
  require("./mail/MailTextPublicEng"),
  require("./mail/pinResetHtmlChalmersEng"),
  require("./mail/pinResetTextChalmersEng")
)

module.exports = texts;