const crypto = require("crypto");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

module.exports = class TokenManager {
  constructor(filePath, tokenTimeoutInMinutes) {
    this.filePath = filePath;
    this.tokenTimeoutInMinutes = tokenTimeoutInMinutes;
  }

  generateUniqueToken() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(48, (err, buffer) => {
        if (err) {
          err.message = "Failed to generate token: " + err.message;
          reject(err);
        }
        resolve(buffer.toString("hex"));
      })
    });
  }
  
  async saveTokenData(token, data) {
    await this._ensureDirectoryExists(this.filePath);
  
    await this._saveData(this.filePath, token, data);
  }
  
  loadTokenData(token) {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(this.filePath, token), 
        "utf-8", (err, data) => {
        if (err) {
          err.message = "Failed to load token data: " + err.message;
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      })
    });
  }

  isTokenDataValid(data) {
    let res = false;
    if (data) {
      let now = Date.now();
      let then = data.created;
      let maxTimeInMillis = this.tokenTimeoutInMinutes * 60 * 1000;
      res = (data && Math.abs(now - then) < maxTimeInMillis);
    }
    return res;
  }

  async removeExpiredTokens() {
    let now = Date.now();

    let files = await fsPromises.readdir(this.filePath);

    let toBeRemoved = [];
    let maxTimeInMillis = this.tokenTimeoutInMinutes * 60 * 1000;
    for (let i=0; i<files.length; i++) {
      let file = files[i];
      let data = JSON.parse(await fsPromises.readFile(
        path.join(this.filePath, file), "utf-8"));
      let timeDiffInMillis = Math.abs(now - data.created);
      if (timeDiffInMillis > maxTimeInMillis) {
        toBeRemoved.push(file);
      }
    }

    for (let i=0; i<toBeRemoved.length; i++) {
      let filename = toBeRemoved[i];
      await fsPromises.unlink(path.join(this.filePath, filename));
    }
  }

  _ensureDirectoryExists(path) {
    return new Promise((resolve) => {
      fs.mkdir(path, { recursive: true}, err => {
        resolve();
      });
    });
  }

  _saveData(filePath, filename, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(filePath, filename), 
        JSON.stringify(data), err => {
          if (err) {
            err.message = "Failed to save data to file: " + err.message;
            reject(err);
          } else {
            resolve();
          }
        })
    });
  }
}