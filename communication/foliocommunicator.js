var rp = require('request-promise')

module.exports = class FolioCommunicator {
  constructor(url, username, password, tenant) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.tenant = tenant;
    this.token = "";
  }

  convertToUsername(value) {
    let res = value.replace("-", "");
    if (res.length > 10) {
      res = res.substring(2);
    }
    return res;
  }

  async updatePassword(username, password) {
    let user = await this.getUser(username);
    return await this.createOrUpdateCredentials(user.id, password);
  }

  async blockUserLoans(userId) {
    let path = "/manualblocks";
    let body = {
      userId: userId,
      type: "Manual",
      desc: "Nyskapat konto. ID-koll behövs.",
      staffInformation: "Nyskapat konto. ID-koll behövs.",
      patronMessage: "Please contact the Main Library.",
      borrowing: true,
      renewals: false,
      requests: false
    }

    let response = await this._sendToFolioWithRetryOnInvalidToken(path, 
      "POST", body);
    if (response.userId !== userId) {
      throw new Error("FOLIO response was not correct when blocking: " + 
        JSON.stringify(response));
    }
  }

  async createOrUpdateCredentials(userId, password) {
    let credentialsExists = await this._getCredentialsExists(userId);

    if(credentialsExists) {
      await this._removeCredentials(userId);
    }

    let path = "/authn/credentials";
    let body = {
      userId: userId,
      password: password
    };

    let response = await this._sendToFolioWithRetryOnInvalidToken(path, "POST", body);
  }
  
  async createRequestPreference(userId) {
    let path = "/request-preference-storage/request-preference";
    let body = {
      userId: userId,
      holdShelf: true,
      delivery: false
    }

    let response = await this._sendToFolioWithRetryOnInvalidToken(path, "POST", body);
    if (response.userId !== userId) {
      throw new Error("FOLIO response was not correct when creating request preference: " + JSON.stringify(response));
    }
  }

  async createPermissionsObject(userId) {
    let path = "/perms/users";
    let body = {
      userId: userId,
      permissions: []
    };

    let response = await this._sendToFolioWithRetryOnInvalidToken(path, 
      "POST", body);

    if (response.userId !== userId) {
      throw new Error("FOLIO response was not correct when creating permissions object: " +
        JSON.stringify(response));
    }
  }

  async usernameExists(username) {
    let path = "/users?limit=0&query=";
    let query = '(username="' + username + '")';

    let data = await this._sendToFolioWithRetryOnInvalidToken(path + 
      query, "GET", null);

    return data.totalRecords > 0;
  }

  async getUser(username) {
    let path = "/users?limit=1&query=";
    let query = '(username="' + username + '")';

    let data = await this._sendToFolioWithRetryOnInvalidToken(path + 
      query, "GET", null);

    let res = null;
    if (data.totalRecords > 0) {
      res = data.users[0];
    }

    return res;
  }

  async createUser(user) {
    let userPayload = {
      username: user.pnr,
      externalSystemId: user.cid ? 
        `${user.cid}@chalmers.se` : user.pnr,
      active: true,
      personal: {
        lastName: user.lname,
        firstName: user.fname,
        email: user.email,
        preferredContactTypeId: "002"
      },
      expirationDate: user.time_active.stop.split("T")[0],
      barcode: user.pnr,
      patronGroup: user.patronGroup,
    };

    try {
      if (await this.usernameExists(userPayload.username)) {
        throw new Error("User is already in FOLIO!");
      } else {
        let response = await this._sendToFolioWithRetryOnInvalidToken("/users",
          "POST", userPayload);

        await this.createPermissionsObject(response.id);

        await this.createRequestPreference(response.id);

        if (!user.cid) {
          await this.blockUserLoans(response.id);
        }

        await this.createOrUpdateCredentials(response.id, user.pinCode);
      }
    } catch (error) {
      error.message = "Failed to create user in FOLIO: " + 
        error.message;
      throw error;
    }
  }

  async _login () {
    let path = '/authn/login'
    let data = {
      username: this.username,
      password: this.password
    }
    var options = {
      method: 'POST',
      uri: this.url + path,
      body: data,
      resolveWithFullResponse: true,
      headers: {
        'Content-Type': 'application/json',
        'x-okapi-tenant': this.tenant
      },
      json: true
    }

    try {
      let response = await rp(options);
      this.token = response.headers['x-okapi-token']
    } catch (error) {
      error.message = "Failed to login to FOLIO: " + error.message;
      throw error;
    }
  }


  async _getCredentialsExists(userId) {
    let path = "/authn/credentials-existence";
    let query = `?userId=${userId}`;

    let response = await this._sendToFolioWithRetryOnInvalidToken(path + query, "GET");

    return response.credentialsExist;
  }

  async _removeCredentials(userId) {
    let path = "/authn/credentials";
    let query = `?userId=${userId}`;

    let response = await this._sendToFolioWithRetryOnInvalidToken(path + query, "DELETE");   

    return response;
  }

  async _sendToFolioWithRetryOnInvalidToken(path, method, data) {
    let res;

    if (!this.token) {
      await this._login();
    }

    try {
      res = await this._send(path, method, data, true);
      if (res.statusCode >=400) {
        await this._login();
        res = await this._send(path, method, data);
      }
    } catch (error) {
      error.message = "Failed to send data to FOLIO: " + error.message;
      throw error;
    }

    return res.body;
  }

  async _send(path, method, data, silent = false) {
    let res = null;
    try {
      let options = {
        method: method,
        uri: this.url + path,
        body: data,
        resolveWithFullResponse: true,
        headers: {
          "x-okapi-token": this.token,
          "x-okapi-tenant": this.tenant,
          Accept: "application/json",
          "Content-type": "application/json"
        },
        json: true
      }
      res = await rp(options);
    } catch (error) {
      if (!silent) {
        throw error;
      }
    }
    return res;
  }
}
