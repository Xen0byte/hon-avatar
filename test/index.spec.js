const request = require('supertest');
const assert = require('assert');

const server = require('../index');

describe('avatar', function () {
  this.timeout(10000);
  it('should return avatar', function () {
    return request(server.listener)
      .get('/7619944')
      .expect(200)
      .then((res) => {
        console.log(res.text);
        assert(res.text.indexOf('7619944') !== -1);
      });
  });

  it('should return default', function () {
    return request(server.listener)
      .get('/12345')
      .expect(200, 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png');
  });

  it('should check length', function () {
    return request(server.listener)
      .get('/12345444441123')
      .expect(400);
  });

  it('should check is number', function () {
    return request(server.listener)
      .get('/hello')
      .expect(400);
  });
});
