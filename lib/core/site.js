var Collection = require('./collection');
var CollectionType = require('../type/collection_type');
var SiteData = require('../model/site_data');
var SiteValidator = require('../validator/site_validator');


function Site(network, data) {
	this.network = network;
    this.data = data;
}
module.exports = Site;


Site.init = function init(network, id, key) {
    var data = new SiteData(id, key);
    return new Site(network, SiteValidator.validate(data));
};


Site.prototype.buildLiveBlogCollection = function buildLiveBlogCollection(title, articleId, url) {
    return this.buildCollection(CollectionType.LIVEBLOG, title, articleId, url);
};


Site.prototype.buildLiveChatCollection = function buildLiveChatCollection(title, articleId, url) {
    return this.buildCollection(CollectionType.LIVECHAT, title, articleId, url);
};


Site.prototype.buildLiveCommentsCollection = function buildLiveCommentsCollection(title, articleId, url) {
    return this.buildCollection(CollectionType.LIVECOMMENTS, title, articleId, url);
};


Site.prototype.buildCountingCollection = function buildCountingCollection(title, articleId, url) {
    return this.buildCollection(CollectionType.COUNTING, title, articleId, url);
};


Site.prototype.buildRatingsCollection = function buildRatingsCollection(title, articleId, url) {
    return this.buildCollection(CollectionType.RATINGS, title, articleId, url);
};


Site.prototype.buildReviewsCollection = function buildReviewsCollection(title, articleId, url) {
    return this.buildCollection(CollectionType.REVIEWS, title, articleId, url);
};


Site.prototype.buildSidenotesCollection = function buildSidenotesCollection(title, articleId, url) {
    return this.buildCollection(CollectionType.SIDENOTES, title, articleId, url);
};


Site.prototype.buildCollection = function buildCollection(type, title, articleId, url) {
    return Collection.init(this, type, title, articleId, url);
};


Site.prototype.getUrn = function getUrn() {
    return this.network.getUrn() + ':site=' + this.data.id;
};