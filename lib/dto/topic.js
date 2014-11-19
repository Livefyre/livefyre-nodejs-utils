var TOPIC_IDEN = ":topic=";


function Topic(id, label, createdAt, modifiedAt) {
	this.id = id;
	this.label = label;
	if (typeof createdAt != 'undefined' && createdAt) {
		this.createdAt = createdAt;
	}
	if (typeof modifiedAt != 'undefined' && modifiedAt) {
		this.modifiedAt = modifiedAt;
	}
}
module.exports = Topic;


Topic.create = function create(core, id, label) {
	return new Topic(Topic.generateUrn(core, id), label);
};


Topic.generateUrn = function generateUrn(core, id) {
	return core.getUrn() + TOPIC_IDEN + id;
};


Topic.serializeFromJson = function serializeFrom(json) {
	return new Topic(json.id, json.label, json.createdAt, json.modifiedAt);
};


Topic.prototype.truncatedId = function truncatedId() {
    return this.id.substring(this.id.indexOf(TOPIC_IDEN) + TOPIC_IDEN.length);
};