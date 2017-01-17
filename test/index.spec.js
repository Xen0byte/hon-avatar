const request = require('supertest');

const app = require('../index');

describe('avatar', () => {
  it('should return avatar', () => {
    return request(app.listen())
      .get('/7619944')
      .expect(200, 'https://s3.amazonaws.com/naeu-icb2/icons/7/619/7619944/1.cai');
  });
  it('should return default', () => {
    return request(app.listen())
      .get('/12345')
      .expect(200, 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png');
  });
  it('should catch default', () => {
    return request(app.listen())
      .get('/2')
      .expect(200, 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png');
  });
  it('should check length', () => {
    return request(app.listen())
      .get('/1234544444/345345')
      .expect(400);
  });
  it('should check length', () => {
    return request(app.listen())
      .get('/1234544444/345345')
      .expect(400);
  });
  it('should check is number', () => {
    return request(app.listen())
      .get('/hello')
      .expect(400);
  });
});
