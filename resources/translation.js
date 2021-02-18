const languageCodes = require('./languageCodeEnums');
const swedish = require('./languages/svSE');
const english = require('./languages/enGB');

exports.getTranslations = (languageCode) => {
  return languageCode === languageCodes.SVSE ? swedish : english;
}
