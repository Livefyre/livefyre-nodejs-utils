function Constants() {
    try {
        var env = 'prod';
        var props = require('../testproperties.json');

        this.NETWORK_NAME = props[env]['NETWORK_NAME'];
        this.NETWORK_KEY = props[env]['NETWORK_KEY'];
        this.SITE_ID = props[env]['SITE_ID'];
        this.SITE_KEY = props[env]['SITE_KEY'];
        this.COLLECTION_ID = props[env]['COLLECTION_ID'];
        this.USER_ID = props[env]['USER_ID'];
        this.ARTICLE_ID = props[env]['ARTICLE_ID'];
    } catch (err) {
        this.NETWORK_NAME = process.env.NETWORK_NAME || '<NETWORK-NAME>';
        this.NETWORK_KEY = process.env.NETWORK_KEY || '<NETWORK-KEY>';
        this.SITE_ID = process.env.SITE_ID || '<SITE-ID>';
        this.SITE_KEY = process.env.SITE_KEY || '<SITE-KEY>';
        this.COLLECTION_ID = process.env.COLLECTION_ID || '<COLLECTION-ID>';
        this.USER_ID = process.env.USER_ID || '<USER-ID>';
        this.ARTICLE_ID = process.env.ARTICLE_ID || '<ARTICLE-ID>';
    }
    this.URL = 'http://answers.livefyre.com/NODE';
    this.USER_ID = 'apitester';
    this.TITLE = 'NodeTest';
}

Constants.Environments = Object.freeze({qa: 'qa', uat: 'uat', prod: 'prod'});

module.exports = new Constants();