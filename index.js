const Hapi = require('hapi');
const Joi = require('joi');
const got = require('got');

const server = Hapi.server({ port: 5000 });

const DEFAULT_AVATAR =  'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

async function getAvatar(accountId) {
  const url = 'https://www.heroesofnewerth.com/getAvatar_SSL.php';
  try {
    const res = await got.head(url, {
      timeout: 2000,
      query: {
        id: accountId,
      },
      retry: 0,
      followRedirect: false,
      decompress: false,
    });
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
  options: {
    cors: { origin: 'ignore' },
    validate: {
      params: {
        id: Joi.number()
          .required()
          .max(1000000000),
      },
    },
    cache: {
      expiresIn: 60 * 120 * 1000, // 120 min
    },
    async handler(req) {
      const avatar = await getAvatar(req.params.id);
      return avatar;
    },
  },
});

async function init() {
  await server.initialize();
  return server;
}
module.exports = init;

if (!module.parent) {
  server.start();
  console.log('Listening on http://localhost:5000');
}

module.exports = server;
