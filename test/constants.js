function Constants() {
	this.NETWORK_NAME = '<NETWORK-NAME>';
	this.NETWORK_KEY = '<NETWORK-KEY>';
	this.SITE_ID = '<SITE-ID>';
	this.SITE_KEY = '<SITE-KEY>';
	this.COLLECTION_ID = '<COLLECTION-ID>';
	this.USER_ID = '<USER-ID>';
	this.ARTICLE_ID = '<ARTICLE-ID>';
}

Constants.prototype = {
	setPropValues: function(env) {
		try {
			var props = require('../testproperties.json');

			this.NETWORK_NAME = props[env]['NETWORK_NAME'];
			this.NETWORK_KEY = props[env]['NETWORK_KEY'];
			this.SITE_ID = props[env]['SITE_ID'];
			this.SITE_KEY = props[env]['SITE_KEY'];
			this.COLLECTION_ID = props[env]['COLLECTION_ID'];
			this.USER_ID = props[env]['USER_ID'];
			this.ARTICLE_ID = props[env]['ARTICLE_ID'];
		} catch (err) {
			return;
		}
	}
}

Constants.Environments = Object.freeze({qa: 'qa', uat: 'uat', prod: 'prod'});

module.exports = Constants;