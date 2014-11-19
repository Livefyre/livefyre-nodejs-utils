function Subscription(to, by, type, createdAt) {
	this.to = to;
	this.by = by;
	this.type = type;
	if (typeof createdAt != 'undefined' && createdAt) {
		this.createdAt = createdAt;
	}
}
module.exports = Subscription;


Subscription.serializeFromJson = function serializeFrom(json) {
	return new Subscription(json.to, json.by, json.type, json.createdAt);
};