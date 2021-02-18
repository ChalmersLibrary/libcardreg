const translation = require("./translation");
const languageCode = require("./languageCodeEnums");

describe("resources.translation", ()  => {
    describe("getTranslations in", () => {
        describe("swedish", () => {
            it("Should return Registrering", () => {
                const expected = "Registrering";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.registrationForm;

                expect(value).toBe(expected);
            });

            it("Should return Personnummer", () => {
                const expected = "Personnummer";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.personNummer;

                expect(value).toBe(expected);
            });


            it("Should return Förnamn", () => {
                const expected = "Förnamn";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.firstName;

                expect(value).toBe(expected);
            });

            it("Should return Efternamn", () => {
                const expected = "Efternamn";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.lastName;

                expect(value).toBe(expected);
            });

            it("Should return Mejladress", () => {
                const expected = "Mejladress";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.eMailAdress;

                expect(value).toBe(expected);
            });

            it("Should return Jag godkänner <a href='http://www.lib.chalmers.se/paa-biblioteket/anvaendarregler/' target='_blank'>användarvillkoren</a>", () => {
                const expected = "Jag godkänner <a href='http://www.lib.chalmers.se/paa-biblioteket/anvaendarregler/' target='_blank'>användarvillkoren</a>";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.iAcceptTheTermsOfUse;

                expect(value).toBe(expected);
            });

            it("Should return Skicka", () => {
                const expected = "Skicka";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.send;

                expect(value).toBe(expected);
            });

            it("Should return PIN-kod", () => {
                const expected = "PIN-kod";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.pinCode;

                expect(value).toBe(expected);
            });

            it("Should return Välj språk", () => {
                const expected = "Välj språk";

                const result = translation.getTranslations(languageCode.SVSE);
                const value = result.chooseLanguage;

                expect(value).toBe(expected);
            });
        });

        describe("english", () => {
            it("Should return Registration", () => {
                const expected = "Registration";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.registrationForm;

                expect(value).toBe(expected);
            });

            it("Should return Personnummer", () => {
                const expected = "Personnummer";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.personNummer;

                expect(value).toBe(expected);
            });


            it("Should return First name", () => {
                const expected = "First name";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.firstName;

                expect(value).toBe(expected);
            });

            it("Should return Last name", () => {
                const expected = "Last name";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.lastName;

                expect(value).toBe(expected);
            });

            it("Should return E-mail address", () => {
                const expected = "Email address";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.eMailAdress;

                expect(value).toBe(expected);
            });

            it("Should return I accept the <a href='http://www.lib.chalmers.se/en/at-the-library/anvaendarregler/' target='_blank'>Terms of Use</a>", () => {
                const expected = "I accept the <a href='http://www.lib.chalmers.se/en/at-the-library/anvaendarregler/' target='_blank'>Terms of Use</a>";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.iAcceptTheTermsOfUse;

                expect(value).toBe(expected);
            });

            it("Should return Send", () => {
                const expected = "Send";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.send;

                expect(value).toBe(expected);
            });

            it("Should return Choose a PIN code", () => {
                const expected = "Choose a PIN code";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.pinCode;

                expect(value).toBe(expected);
            });

            it("Should return Choose language", () => {
                const expected = "Choose language";

                const result = translation.getTranslations(languageCode.ENGB);
                const value = result.chooseLanguage;

                expect(value).toBe(expected);
            });
        });

        describe("Wrong argument inputs", () => {
            it("Empty argument, should use fallback and return english translation", () => {
                const expected = "Registration";

                const result = translation.getTranslations();
                const value = result.registrationForm;

                expect(value).toBe(expected);
            });

            it("Null argument, should use fallback and return english translation", () => {
                const expected = "Registration";

                const result = translation.getTranslations(null);
                const value = result.registrationForm;

                expect(value).toBe(expected);
            });

            it("Undefined argument, should use fallback and return english translation", () => {
                const expected = "Registration";

                const result = translation.getTranslations(undefined);
                const value = result.registrationForm;

                expect(value).toBe(expected);
            });

            it("Wrong language code argument, should use fallback and return english translation", () => {
                const expected = "Registration";

                const result = translation.getTranslations("gu-IN");
                const value = result.registrationForm;

                expect(value).toBe(expected);
            });

            it("Empty string, should use fallback and return english translation", () => {
                const expected = "Registration";

                const result = translation.getTranslations(" ");
                const value = result.registrationForm;

                expect(value).toBe(expected);
            });
        });
    });
});