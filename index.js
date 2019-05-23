const got = require('got');
const Joi = require('@hapi/joi');

const DEFAULT_AVATAR = 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

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

const schema = Joi.number()
  .positive()
  .integer()
  .max(1000000000)
  .required();

module.exports = (req, res) => {
  const id = Number(req.url.replace('/', ''));

  const result = Joi.validate(id, schema);
  if (result.error) {
    res.statusCode = 500;
    return res.end(result.error.message);
  }

  return getAvatar().then(avatar => res.end(avatar));
};
