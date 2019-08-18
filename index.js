const got = require('got');
const micro = require('micro');
const Joi = require('@hapi/joi');

const DEFAULT_AVATAR = 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

async function getAvatar(accountId) {
  const url = 'https://www.heroesofnewerth.com/getAvatar_SSL.php';
  try {
    const res = await got.head(url, {
      timeout: 400,
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
  .required();

module.exports = async (req, res) => {
  const url = req.url.replace('/', '').trim();
  const id = parseInt(url, 10);

  const result = Joi.validate(id, schema);
  if (result.error) {
    return micro.send(res, 500, result.error.message);
  }

  const avatar = await getAvatar(id);
  return micro.send(res, 200, avatar);
};
