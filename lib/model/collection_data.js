function CollectionData(type, title, articleId, url) {
    this.type = type;
    this.title = title;
    this.articleId = articleId;
    this.url = url;
}
module.exports = CollectionData;


//TODO
CollectionData.prototype.toJSON = function toJSON() {
    return '';
};