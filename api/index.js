// @ts-check

const got = require('got').default;
const { send } = require('micro');
const Joi = require('@hapi/joi');

const DEFAULT_AVATAR = 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * @param {number} accountId
 */
async function getAvatar(accountId) {
  const url = 'http://www.heroesofnewerth.com/getAvatar_SSL.php';
  try {
    const res = await got.head(url, {
      timeout: 400,
      searchParams: {
        id: accountId,
      },
      retry: 0,
      followRedirect: false,
      decompress: false,
    });
    if (res.headers.location.includes('icons//')) {
      return res.headers.location.replace('icons//', 'icons/');
    }
    if (res.headers.location.includes('naeu-icb2')) {
      return res.headers.location;
    }
    return DEFAULT_AVATAR;
  } catch (e) {
    return DEFAULT_AVATAR;
  }
}

const schema = Joi.number()
  .positive()
  .integer()
  .max(1000000000)
  .message('invalid player id')
  .required();

/**
 * @typedef {import('micro').RequestHandler} RequestHandler
 * @type {RequestHandler}
 */
async function handleRequest(req, res) {
  const url = req.url.replace('/', '').trim();
  const id = parseInt(url, 10);
  const result = schema.validate(id);
  if (result.error) {
    return send(res, 200, DEFAULT_AVATAR);
  }

  const avatar = await getAvatar(id);
  return send(res, 200, avatar);
}

module.exports = handleRequest;
