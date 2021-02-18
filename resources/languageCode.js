const languageCodes = require("./languageCodeEnums");

function isLanguageCodeValid(languageCode) {
    if (languageCode === null || languageCode === undefined || languageCode.length === 0) return false;

    const languageCodeExists = Object.keys(languageCodes).filter(key => languageCodes[key] == languageCode);
    if (languageCodeExists === undefined || languageCodeExists === null || languageCodeExists.length === 0) return false
  
    return true;
}
  
function languageCodeFallback(languageCode) {
    return isLanguageCodeValid(languageCode) ? languageCode : languageCodes.ENGB;
}

exports.changeLanguageCode = (languageCode) => {
    const validLanguageCode = languageCodeFallback(languageCode);
    return validLanguageCode === languageCodes.SVSE ? languageCodes.ENGB : languageCodes.SVSE;
}
