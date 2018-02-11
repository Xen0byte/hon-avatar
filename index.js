const request = require('request-promise-native');
const isNumber = require('is-number');
const Hapi = require('hapi');
const Joi = require('joi');

const server = Hapi.server({ port: 5000 });
module.exports = server;

const opt = {
  method: 'HEAD',
  timeout: 2000,
  uri: 'https://www.heroesofnewerth.com/getAvatar_SSL.php',
  qs: {
    id: '',
  },
  followRedirect: false,
  resolveWithFullResponse: true,
  simple: false,
};
const DEFAULT_AVATAR =
  'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

async function getAvatar(accountId) {
  opt.qs.id = accountId;
  try {
    const res = await request(opt);
    if (res.headers.location.includes('icons//')) {
      return res.headers.location.replace('icons//', 'icons/');
    }
    return DEFAULT_AVATAR;
  } catch (e) {
    return DEFAULT_AVATAR;
  }
}

server.route({
  method: 'GET',
  path: '/{id?}',
  config: {
    validate: {
      params: {
        id: Joi.string().min(0).max(11),
      },
    },
    cors: true,
    cache: {
      expiresIn: 7200, // 120 min
    },
    async handler(req) {
      if (!isNumber(req.params.id)) {
        return DEFAULT_AVATAR;
      }
      return getAvatar(req.params.id);
    },
  },
});

/* istanbul ignore if */
if (!module.parent) {
  server.start();
  console.log('Listening on http://localhost:5000');
}
