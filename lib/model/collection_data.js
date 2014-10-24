function CollectionData(type, title, articleId, url) {
    this.type = type;
    this.title = title;
    this.articleId = articleId;
    this.url = url;

    Object.defineProperties(this, {
        'topics': {
            value: undefined,
            writable: true
        },
        'extensions': {
            value: undefined,
            writable: true
        },
        'tags': {
            value: undefined,
            writable: true
        }
    });
}
module.exports = CollectionData;

//Manual for the time being.
CollectionData.prototype.toJSON = function JSON() {
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