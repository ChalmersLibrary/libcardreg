const texts = {
    languageCode: "sv-SE",

    //Entry view
    libraryAccountRegistration: "Skapa bibliotekskonto",
    createALibraryAccount: "Skapa ett bibliotekskonto!",
    welcomeText: "<p>Här kan du skapa ett bibliotekskonto för att låna och reservera böcker på Chalmers bibliotek. \
                    Alla är välkomna att låna böcker hos oss. </p> \
                    <p>Du kan börja reservera så fort du är klar med registreringen. </p> \
                    <p>Börja med att logga in med Chalmers ID (CID) eller registrera dig som allmänhet.</p>",             
      chalmersButton: "Logga in med CID",
      publicButton: "Allmänhet",

    //Registration form
    registrationForm: "Registrering",
    personNummer: "Personnummer",
    firstName: "Förnamn",
    lastName: "Efternamn",
    eMailAdress: "Mejladress",
    iAcceptTheTermsOfUse: "Jag godkänner <a href='http://www.lib.chalmers.se/paa-biblioteket/anvaendarregler/' target='_blank'>användarvillkoren</a>",
    send: "Skicka",
    pinCode: "PIN-kod",
    pinCodeRepeat: "Upprepa PIN-kod",
    pinCodeAuthenticated: "PIN-kod (för låneautomater)",
    pinCodeExplanatoryText: "Välj ett 6-siffrigt nummer som PIN-kod. Det får inte vara samma som ditt födelsedatum.",
    chooseLanguage: "Välj språk",

    //Receipt view
    accountActivatedHeader: "Ditt bibliotekskonto är nu aktiverat!",
    accountActivatedTextChalmers: "Ditt konto är aktiverat och du kan nu börja reservera böcker.<p> \
                                   Fortsätt till <a href='http://www.lib.chalmers.se/'>www.lib.chalmers.se</a> om du vill söka litteratur.</p>",
    accountActivatedTextPublic: "Ditt konto är aktiverat och du kan nu börja reservera böcker. \
                                 Ta med ditt ID-kort till biblioteket för att aktivera kontot även för lån.<p> \
                                 Fortsätt till <a href='http://www.lib.chalmers.se/'>www.lib.chalmers.se</a> om du vill söka litteratur.</p>",

    //Done
    donePageTitle: "Ditt bibliotekskonto är nu aktiverat",
    //Not used libraryAccountActivated: "Ditt bibliotekskonto är nu aktiverat,",
    //Not used continueToLibChalmersSe: "Fortsätt till <a href='http://www.lib.chalmers.se/'>www.lib.chalmers.se</a> för att söka litteratur!",
    
    //Footer   
    forgotPin: "Har du ett bibliotekskonto, men har glömt din PIN-kod? <a href='/pin-reset-request?language=sv-SE' title='Reset PIN'>Återställ din PIN-kod här</a>.",
    moreInfo: "Mer om att <a href='http://www.lib.chalmers.se/paa-biblioteket/laana/' title='About borrowing' target='_blank'>låna böcker</a>.",
    needHelp: "Behöver du hjälp? <a href='http://www.lib.chalmers.se/hjaelp/' target='_blank'>Kontakta oss</a>.",

    //Error
    errorTitleGeneral: "Något gick fel.",
    helpWhenSomethingWentWrong: "<a href='http://www.lib.chalmers.se/hjaelp/' target='_blank'>Kontakta biblioteket</a> för hjälp.",

    //Created mail
    createdMailSubject: "Ditt biliotekskonto på Chalmers bibliotek",

    //PIN reset page
    requestResetPinHeader: "Återställ din PIN-kod",
    requestResetPinText: "Skriv in ditt personnummer här nedan, så skickar vi ett återställningsmail till din registrerade mejladress.",
    getReset: "Begär ett återställningsmejl",
    resetEmailSentHeader: "Återställningsmejl begärt!",
    resetEmailSentText: "Om du har ett bibliotekskonto har ett återställningsmejl skickats till mejladressen som är kopplad till det kontot. Återställningslänken i mejlet är giltig under 30 minuter.",
    newPinHeader: "Välj en ny PIN-kod",
    newPinSuccessHeader: "Din PIN-kod har uppdaterats!",
    newinSuccessText: "Du kan nu börja använda din nya PIN-kod.",

    temporaryEmailIssue: "Vi har just nu problem med mejl som inte levereras. Kontakta biblioteket för hjälp om du inte fått ett mejl inom några minuter.",


    //PIN-reset mail
    pinResetMailSubject: "PIN-reset",

    //Form error message
    personnummerErrorMessage: "Personnumret är felaktigt. Har du inte svenskt personnummer, kom till biblioteket för ett konto!",
    firstNameErrorMessage: "Har du glömt fylla i förnamn?",
    lastNameErrorMessage: "Har du glömt fylla i efternamn?",
    emailErrorMessage: "Något är fel med epost-adressen.",
    pinOneErrorMessage: "PIN-koden måste vara 6 siffror och får inte vara ditt födelsedatum.",
    pinRepeatErrorMessage: "PIN-koden inte likadan som ovan.",
}

Object.assign(
  texts,
  require("./mail/mailHtmlChalmersSve"),
  require("./mail/mailHtmlPublicSve"),
  require("./mail/MailTextChalmersSve"),
  require("./mail/MailTextPublicSve"),
  require("./mail/pinResetHtmlChalmersSve"),
  require("./mail/pinResetTextChalmersSve")
)

module.exports = texts;