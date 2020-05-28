const http = require('http');
const micro = require('micro');
const test = require('ava');
const listen = require('test-listen');
const got = require('got');

const app = require('../api/index');

test('should return avatar', async (t) => {
  const service = new http.Server(micro(app));

  const url = await listen(service);
  const res = await got.get(`${url}/3313433`);

  t.assert(res.body.includes('iward'));
  service.close();
});

test('should check length', async (t) => {
  const service = new http.Server(micro(app));

  const url = await listen(service);
  const res = await got.get(`${url}/12345444441123`);

  t.is(res.body, 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png');
  service.close();
});

test('should return default', async (t) => {
  const service = new http.Server(micro(app));

  const url = await listen(service);
  const res = await got.get(`${url}/12345`);

  t.is(res.body, 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png');
  service.close();
});
