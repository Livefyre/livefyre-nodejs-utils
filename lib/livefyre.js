var validator = require('validator'),
		jwt = require('jwt-simple'),
		rest = require('restler'),
		util = require('util');

var livefyre = module.exports;

// Returns a new Network with provided networkName and networkKey.
// Please refer to the [docs](http://livefyre.github.io/livefyre-nodejs-utils/) for more info.
livefyre.getNetwork = function getNetwork(networkName, networkKey) {
	return new Network(networkName, networkKey);
}

function Network(networkName, networkKey) {
	this.networkName = networkName,
	this.networkKey = networkKey,
	this.DEFAULT_USER = 'system',
	this.DEFAULT_EXPIRES = 86400;
}

function Site(networkName, siteId, siteKey) {
	this.networkName = networkName;
	this.siteId = siteId;
	this.siteKey = siteKey;
}

Network.prototype = {
	// **setUserSyncUrl:** Set the URL that Livefyre will use to fetch user profile info from your user management
	// system. Be sure to set urlTemplate with a working endpoint (see Remote Profiles) before
	// making calls to updateRemoteUser().
	//  
	// The registered “urlTemplate” must contain the string "{id}" which will be replaced with
	// the ID of the user that’s being updated.
	//  
	// ex. urlTemplate = “http://example.com/users/get_remote_profile?id={id}”
	//  
	// It is recommended that the user sends in a callback to handle the response, otherwise the
	// method will console.log the output.
	// A successful response will return a status code of 204.
	setUserSyncUrl: function(urlTemplate, callback) {
		if (!validator.contains(urlTemplate, '{id}')) {
			return null;
		}

		callback = callback || function(data, response) {
			if (response.statusCode == 204) {
				console.log('livefyre.network.setUserSyncUrl succeeded.');
			} else {
				console.log('livefyre.network.setUserSyncUrl failed.');
			}
		}

		rest.post(util.format('http://%s', this.networkName), {
			data: { actor_token: this.buildLfToken(), pull_profile_url: urlTemplate },
		}).on('complete', callback);
	},

	// **syncUser:** Pings Livefyre with a user id stored in your user management system, prompting Livefyre to
	// pull the latest user profile data from the customer user management system.
	//  
	// See the setUserSyncUrl() method to add your pull URL to Livefyre.
	//  
	// It is recommended that the user sends in a callback to handle the response, otherwise the
	// method will console.log the output.
	// A successful response will return a status code of 200.
	syncUser: function(userId, callback) {
		callback = callback || function(data, response) {
			if (response.statusCode == 200) {
				console.log('livefyre.network.syncUser succeeded.');
			} else {
				console.log('livefyre.network.syncUser failed.');
			}
		}

		rest.post(util.format('http://%s/api/v3_0/user/%s/refresh', this.networkName, userId), {
			data: { lftoken: this.buildLfToken() },
		}).on('complete', callback);
	},

	// **buildLfToken:** Creates a Livefyre token. It is needed for interacting with a lot of Livefyre API endpoints.
	buildLfToken: function() {
		return this.buildUserAuthToken(this.DEFAULT_USER, this.DEFAULT_USER, this.DEFAULT_EXPIRES);
	},

	// **buildUserAuthToken:** Creates a Livefyre user token. It is recommended that this is called after the user
	// is authenticated.
	buildUserAuthToken: function(userId, displayName, expires) {
		if (!validator.isAlphanumeric(userId)) {
			return null;
		}
		var payload = {
			domain: this.networkName,
			user_id: userId,
			display_name: displayName,
			expires: (new Date).getTime()/1000 +expires
		};
		return jwt.encode(payload, this.networkKey);
	},

	// **validateLivefyreToken:** Validates a Livefyre token as a valid token for this Network.
	validateLivefyreToken: function(lfToken) {
		var attr = jwt.decode(lfToken, this.networkKey);

		return attr['domain'] == this.networkName
			&& attr['user_id'] == this.DEFAULT_USER
			&& attr['expires'] >= (new Date).getTime()/1000;
	},

	// **getSite:** Returns a new Site class with given siteId and key.
	getSite: function(siteId, siteKey) {
		return new Site(this.networkName, siteId, siteKey);
	}
}

Site.prototype = {
	// **buildCollectionMetaToken:** Creates a Livefyre collection meta token. Pass this token to any page on your site that displays a Livefyre app 
	// (comment, blog, reviews, etc.).
	//  
	// In particular, Livefyre uses the token to instantiate a new collection on your pages.
	// If the collection exists already, Livefyre will update the collection with the latest values in the token.
	buildCollectionMetaToken: function(title, articleId, url, tags, stream) {
		stream = stream || null;
		if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }) || title.length > 255) {
			return null;
		}
		var payload = {
			title: title,
			url: url,
			tags: tags,
			articleId: articleId,
			type: stream
		};
		return jwt.encode(payload, this.siteKey);
	},
	// **getCollectionContent:** Gets collection content (SEO) for this Site. siteKey must be set before calling this method.
	// Get user generated content for a pre-existing collection. Returns user generated content (UGC) as an HTML fragment.
	// Customers can embed the UGC on the page that’s returned in the initial response so crawlers can index the UGC
	// content without executing javascript.
	//  
	// Note, only use getContent if you want to make UGC available to crawlers that don’t execute javascript.
	// livefyre.js handles displaying collection content on article pages otherwise.
	//  
	// GET http://bootstrap.{network}/bs3/{network}/{siteId}/{b64articleId}/init
	//  
	// This method requires the user to send in a callback to handle the response. A successful response will send a status
	// code of 200.
	getCollectionContent: function(articleId, callback) {
		var uri = util.format('http://bootstrap.%s/bs3/%s/%s/%s/init',
			this.networkName, this.networkName, this.siteId, new Buffer(articleId.toString()).toString('base64'));
		rest.get(uri).on('complete', callback);
	}
}