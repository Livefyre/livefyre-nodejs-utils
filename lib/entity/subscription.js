function Subscription(to, by, type, createdAt) {
	this.to = to;
	this.by = by;
	this.type = type;
	if (typeof createdAt != 'undefined' && createdAt) {
		this.createdAt = createdAt;
	}
}

Subscription.serializeFromJson = function(json) {
	return new Subscription(json.to, json.by, json.type, json.createdAt);
}

Subscription.Types = Object.freeze({personalStream: 1});

module.exports = Subscription;
