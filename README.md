# Livefyre NodeJS Utility Classes
[![NPM version](https://badge.fury.io/js/livefyre.png)](http://badge.fury.io/js/livefyre)

Livefyre's official library for common server-side tasks necessary for getting Livefyre apps (comments, reviews, etc.) working on your website.

## Installation

Run this line:

    $ npm install livefyre

## Usage

Instantiating a network object:

```node
var network = livefyre.getNetwork('networkName', 'networkKey');
```

Creating a Livefyre token:

```node
network.buildLivefyreToken();
```

Creating a user auth token:

```node
network.buildUserAuthToken('userId', 'displayName', expires);
```

To validate a Livefyre token:

```node
network.validateLivefyreToken('lfToken');
```

To send Livefyre a user sync url and then have Livefyre pull user data from that url:

```node
network.setUserSyncUrl(callback, 'urlTemplate');
network.syncUser(callback, 'userId');
```

Instantiating a site object:

```node
var site = network.getSite('siteId', 'siteKey');
```

Building a collection meta token:
*The {options} argument is optional.*

```node
site.buildCollectionMetaToken('title', 'articleId', 'url', {options});
```

Building a checksum:
*The 'tags' argument is optional.*

```node
site.buildChecksum('title', url', 'tags');
```

To retrieve content collection data:

```node
site.getCollectionContent(callback, 'articleId');
```

To get a content collection's id:

```Java
site.getCollectionId(callback, 'articleId');
```

## Additional Documentation

Located [here](http://answers.livefyre.com/developers/libraries).

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