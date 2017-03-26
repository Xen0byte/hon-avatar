const request = require('supertest');
const assert = require('assert');

const app = require('../index');

describe('avatar', function () {
  this.timeout(10000);
  it('should return avatar', function () {
    return request(app.listen())
      .get('/7619944')
      .expect(200)
      .then((res) => {
        assert(res.text.indexOf('7619944') !== -1);
      });
  });
  it('should return default', function () {
    return request(app.listen())
      .get('/12345')
      .expect(200, 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png');
  });
  it('should catch default', function () {
    return request(app.listen())
      .get('/2')
      .expect(200, 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png');
  });
  it('should check length', function () {
    return request(app.listen())
      .get('/1234544444/345345')
      .expect(400);
  });
  it('should check length', function () {
    return request(app.listen())
      .get('/1234544444/345345')
      .expect(400);
  });
  it('should check is number', function () {
    return request(app.listen())
      .get('/hello')
      .expect(200, 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png');
  });
});
