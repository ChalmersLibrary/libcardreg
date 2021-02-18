const languageCode = require("./languageCodeEnums");

const images = {
    svSE: "language-icon-sv.png",
    enGB: "language-icon-en.png"
}

exports.changeFlagImage = (selectedLanguageCode) => {
    return selectedLanguageCode === languageCode.SVSE ? images.enGB : images.svSE;
}
