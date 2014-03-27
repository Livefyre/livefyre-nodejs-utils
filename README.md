# Livefyre NodeJS Utility Classes
[![NPM version](https://badge.fury.io/js/livefyre.png)](http://badge.fury.io/js/livefyre)

Livefyre's official library for common server-side tasks necessary for getting Livefyre apps (comments, reviews, etc.) working on your website.

## Installation

    npm install livefyre

## Usage

Creating tokens:

**Livefyre token:**

```node
var network = livefyre.getNetwork('networkName', 'networkKey');
network.buildLfToken();
```

**User auth token:**

```node
var network = livefyre.getNetwork(networkName, networkKey);
network.buildUserAuthToken('userId', 'displayName', expires);
```

**Collection meta token:**

```node
var network = livefyre.getNetwork('networkName', 'networkKey');

var site = network.getSite('siteId', 'siteKey');
site.getCollectionMetaToken('title', 'articleId', 'url', 'tag', 'stream');
```

To validate a Livefyre token:

```node
var network = livefyre.getNetwork('networkName', 'networkKey');
network.validateLivefyreToken('token');
```

To send Livefyre a user sync url and then have Livefyre pull user data from that url: (callbacks are optional for these two methods)

```node
var network = livefyre.getNetwork('networkName', 'networkKey');

network.setUserSyncUrl('http://thisisa.test.url/{id}/', callback);
network.syncUser('system', callback);
```

To retrieve content collection data:

```node
var network = livefyre.getNetwork('networkName', 'networkKey');

var site = network.getSite('siteId', 'siteKey');
site.getCollectionContent(articleId, callback);
```

## Documentation

Located [here](answers.livefyre.com/libraries).

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

Note: any feature update on any of Livefyre's libraries will need to be reflected on all language libraries. We will try and accommodate when we find a request useful, but please be aware of the time it may take.

License
=======

MIT