const request = require('request-promise-native');
const isNumber = require('is-number');
const Hapi = require('hapi');
const Joi = require('joi');

const server = Hapi.server({ port: 5000 });

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
const DEFAULT_AVATAR = 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

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

let cache;
server.route({
  method: 'GET',
  path: '/{id?}',
  options: {
    cors: { origin: 'ignore' },
    validate: {
      params: {
        id: Joi.string()
          .min(0)
          .max(11),
      },
    },
    cache: {
      expiresIn: 60 * 120 * 1000, // 120 min
    },
    async handler(req) {
      if (!isNumber(req.params.id)) {
        return DEFAULT_AVATAR;
      }
      const value = await cache
        .get({
          id: String(req.params.id),
          segment: 'avatar',
        })
        .catch(console.error);
      if (value) {
        return value;
      }
      const avatar = await getAvatar(req.params.id);
      await cache.set(
        { id: String(req.params.id), segment: 'avatar' },
        avatar,
        60 * 120 * 1000,
      );
      return avatar;
    },
  },
});

async function init() {
  cache = server.cache({ segment: 'avatar', expiresIn: 60 * 120 * 1000 });
  await server.initialize();
  return server;
}
module.exports = init;

/* istanbul ignore if */
if (!module.parent) {
  init()
    .then(svr => svr.start())
    .catch(console.error);
  console.log('Listening on http://localhost:5000');
}
