var request = require('request');
var mimeMagic = require('node-ee-mime-magic');

var isTest = function() {
  return process.env.NODE_ENV === 'test';
};

var log = function() {
  if (!isTest()) {
    console.log.apply(console, arguments);
  }
};

var imageCache = {};

var imageRequest = function(options) {
  options = options || {};

  var host = options.host || 'http://dummyimage.com';
  var uri = host;

  if (options.path) {
    uri += options.path;
  } else if (options.width && options.height) {
    uri += '/' + options.width + 'x' + options.height;
  } else if (options.width) {
    uri += '/' + options.width;
  }

  return new Promise((resolve, reject) => {
    request(
      {
        uri: uri,
        encoding: 'binary'
      },
      function(error, response, body) {
        if (error) {
          return reject(error);
        }

        if (!error && response.statusCode === 200) {
          var imageBuffer = Buffer.from(body, 'binary');

          mimeMagic(imageBuffer, function(error, result) {
            if (error) {
              return reject(error);
            }

            resolve({
              mimeType: result ? result.mime : null,
              buffer: imageBuffer
            });
          });
        }
      }
    );
  });
};

var asMiddleware = function(req, res, next) {
  var path = req.url.replace('/image', '');

  log('[dyson-image] Resolving response for', req.url, imageCache[path] ? '(cached)' : '');

  if (!imageCache[path]) {
    imageCache[path] = imageRequest({ path: path });
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
