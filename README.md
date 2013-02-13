# dyson-image

Image proxy and base64 string generator.

Requests are proxied to [http://dummyimage.com](http://dummyimage.com) by default.

Used by [dyson-generators](http://github.com/webpro/dyson-generators) (for base64 image strings) and [dyson](http://github.com/webpro/dyson) (as middleware).

## Installation

Install dyson-image locally by including it in `package.json` as a `devDependency`:

    "devDependencies": {
        "dyson-image": "~0.1"
    }

## Examples

### Image buffer

The `image.request()` method returns a promise which gets resolved with an object containing `mimeType` and `buffer`.

The examples below both create a base64 string representation of a 300x200 image:

    var image = require('dyson-image');

    image.request({
        host: 'http://dummyimage.com',
        path: '/300x200'
    }).then(function(imageObj) {
        var imgBase64 = imageObj.buffer.toString('base64');
        console.log('data:' + imageObj.mimeType + ';base64,' + imgBase64);
    });

    image.request({
        width: 300,
        height: 200
    }).then(function(imageObj) {
        //
    });

### Middleware for Express

    var image = require('dyson-image');

    app.get('/image/*', image.asMiddleware);

A request to `/image/300x200` will be proxied to `http://dummyimage.com/300x200`, and served as image.

## Development & run tests

    git clone git@github.com:webpro/dyson-image.git
    cd dyson-image
    npm install
    npm test
