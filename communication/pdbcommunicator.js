var rp = require('request-promise');

module.exports = class PdbCommunicator {
    constructor(url, username, password) {
		this.url = url;
		this.username = username;
		this.password = password;
		this.sessionid = '';
  }

	async connect() {
		await this._startSession();
		await this._login();
	}

	async closeConnection() {
		if (this.sessionid) {
			await this._stopSession();
		}
	}

	get isOpen() {
		return this.sessionid;
	}
	
	async getByCid(cid) {
		let response = await rp({
			url: this.url,
			method: 'POST',
			headers: {'Content-Type' : 'application/json'},
			json: {
				'function': 'person_dig',
				'params': [
					{'cid': {'name': cid}},
					{
						'lastname': true,
						'firstname': true,
						'current_pnr': true,
						'all_pnrs': true,
						'birthdate': true,
						'categorizations': { 'time_active': true,
									'category': { 'name': true }	},
						'current_groups': {'time_active_now': true, 'name': true},
						'cid': { 'name': true },
						'official_emails': true
					}
				],
				'session': this.sessionid
			}
		});
		if (!response.result) {
			throw new Error("Invalid response from PDB when fetching by CID: " + 
				JSON.stringify(response));
		}
		else if (response.result.length === 0) {
			throw new Error("Person not found by CID in PDB.");
		}
		
		return response.result[0];
	} 
	
	async getByPnr(pnr) {
		let response = await rp({
			url: this.url,
			method: 'POST',
			headers: {'Content-Type' : 'application/json'},
			json: {
				'function': 'person_dig',
				'params': [
					{'all_pnrs': pnr},
					{
						'lastname': true,
						'firstname': true,
						'current_pnr': true,
						'all_pnrs': true,
						'birthdate': true,
						'categorizations': { 'time_active': true,
									'category': { 'name': true }	},
						'cid': { 'name': true },
						'official_emails': true
					}
				],
				'session': this.sessionid
			}
		});
		
		if (!response.result) {
			throw new Error("Invalid response from PDB when fetching by personnummer: " + 
				JSON.stringify(response));
		} else if (response.result.length === 0) {
			throw new Error("Person not found by personnummer in PDB.");
		}
		
		return response.result[0];
	} 
	
	async _startSession() {
		let response = await rp({
			url: this.url,
			method: 'POST',
			headers: {'Content-Type' : 'application/json'},
			json: { 
				'function': 'session_start', 
				'params': [] 
			}
		});
		this.sessionid = response.session;
	}

	async _stopSession() {
		let response = await rp({
			url: this.url,
			method: 'POST',
			headers: {'Content-Type' : 'application/json'},
			json: { 
				'function': 'session_stop', 
				'session': this.sessionid
			}
		});
		this.sessionid = "";
	}
	
	async _login() {
		let response = await rp({
			url: this.url,
			method: 'POST',
			headers: {'Content-Type' : 'application/json'},
			json: {
				"function": "session_auth_login",
				"params": [this.username, this.password],
				"session": this.sessionid
			}
		});
		
		if (!response.result) {
			throw new Error("Invalid response when logging in to PDB: " + 
				JSON.stringify(response));
		}
	}
}