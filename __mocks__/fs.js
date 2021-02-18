const fs = jest.genMockFromModule("fs");

let data = {};

fs.promises = {};

fs.promises.readdir = async function(path) {
  return Object.keys(data);
}

fs.promises.readFile = async function(path) {
  return JSON.stringify(data[path]);
}

fs.promises.unlink = async function(path) {
  delete data[path];
}

fs.__setMockedData = function(newData) {
  data = newData;
}

fs.__getMockedData = function() {
  return data;
}

module.exports = fs;