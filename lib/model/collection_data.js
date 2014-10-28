function CollectionData(type, title, articleId, url) {
    this.type = type;
    this.title = title;
    this.articleId = articleId;
    this.url = url;
}
module.exports = CollectionData;

//Manual for the time being.
CollectionData.prototype.toJsonString = function jsonString() {
    var json = '{"articleId":"'
        +this.articleId
        +'","';

    if (typeof this.extensions != 'undefined' && this.extensions.length > 0) {
        json += 'extensions":"'
            +this.extensions
            +'","';
    }
    if (typeof this.tags != 'undefined' && this.tags.length > 0) {
        json += 'tags":"'
            +this.tags
            +'","';
    }

    json += 'title":"'
        +this.title
        +'","';

    if (typeof this.topics != 'undefined' && this.topics.length > 0) {
        json += 'topics":"'
            +JSON.stringify(this.topics)
            +'","';
    }

    json += 'type":"'
        +this.type
        +'","url":"'
        +this.url
        +'"}';

    return json;
};