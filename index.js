var http = require('http'),
    request = require('request'),
    when = require('when'),
    mimeMagic = require('node-ee-mime-magic');

var mimeDetectFn = mimeMagic;
var getMimeType = function(result) {
    return result.mime;
};

try {

    var mmm = require('mmmagic'),
        magic = new mmm.Magic(mmm.MAGIC_MIME);

    mimeDetectFn = magic.detect;
    getMimeType = function(result) {
        return result.split(';')[0]
    };

    console.log('[dyson-image] Using "mmmagic" for detecting image mime-type.');

} catch(error) {

    console.log('[dyson-image] Falling back to "node-ee-mime-magic" for detecting image mime-type.');

}

var imageCache = {};

var imageRequest = function(options) {

    options = options || {};

    var host = options.host || 'http://dummyimage.com',
        uri = host,
        deferred = when.defer();

    if(options.path) {
        uri += options.path;
    } else if(options.width && options.height) {
        uri += '/' + options.width + 'x' + options.height;
    } else if(options.width) {
        uri += '/' + options.width;
    }

    request({
        uri: uri,
        encoding: 'binary'
    }, function(error, response, body) {

        if(error) {
            deferred.reject(error);
        }

        if(!error && response.statusCode === 200) {

            var imageBuffer = new Buffer(body, 'binary');

            mimeDetectFn(imageBuffer, function(error, result) {

                if(error) {
                    deferred.reject(error);
                }

                deferred.resolve({
                    mimeType: getMimeType(result),
                    buffer: imageBuffer
                });
            });
        }
    });

    return deferred.promise;
};

var asMiddleware = function(req, res, next) {

    var path = req.url.replace('/image', '');

    console.log('Resolving response for', req.url, imageCache[path] ? '(cached)' : '');

    if(!imageCache[path]) {
        imageCache[path] = imageRequest({path: path});
    }

    imageCache[path].then(function(image) {
        res.setHeader('Content-Type', image.mimeType);
        res.write(image.buffer);
        res.send();
    });
};

module.exports = {
    request: imageRequest,
    asMiddleware: asMiddleware
};
