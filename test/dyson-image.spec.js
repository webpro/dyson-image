var image = require('../index');
var express = require('express');
var request = require('supertest');

var imageDir = __dirname + '/dummy';

describe('dyson.image', function() {
  describe('.request', function() {
    it('should return a promise', function() {
      var actual = image.request();

      actual.should.have.property('then');
      actual.then.should.be.a.Function();
    });

    it('should resolve its promise with an object: {mimeType, buffer}', function(done) {
      // Serve an actual image at http://127.0.0.1:3001/image.png
      const app = express()
        .use(express.static(imageDir))
        .listen(3001);

      image
        .request({
          host: 'http://127.0.0.1:3001',
          path: '/image.png'
        })
        .then(function(actual) {
          actual.mimeType.should.equal('image/png');
          Buffer.isBuffer(actual.buffer).should.be.true;
          app.close();
          done();
        });
    });

    it('should respond with an image', function(done) {
      var app = express();

      app.get('/image/*', image.asMiddleware);

      request(app)
        .get('/image/300x200')
        .end(function(errors, res) {
          res.headers['content-type'].should.equal('image/png');
          done();
        });
    });
  });
});
