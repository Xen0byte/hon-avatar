const Koa = require('koa');
const cors = require('kcors');
const got = require('got');
const isNumber = require('is-number');
const redis = require('redis');

const app = new Koa();
module.exports = app;
app.use(cors());

const client = redis.createClient({
  url: process.env.REDIS_URL || null,
});

const opt = {
  method: 'HEAD',
  timeout: 900,
  retries: 2,
  encoding: null,
};
const DEFAULT_AVATAR = 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

function getAvatar(accountId) {
  const url = `https://www.heroesofnewerth.com/getAvatar_SSL.php?id=${accountId}`;
  return got(url, opt)
    .then((res) => {
      return res.url;
    })
    .catch(() => {
      return DEFAULT_AVATAR;
    });
}

function findOrGet(accountId) {
  return new Promise((resolve) => {
    client.get(accountId, (err, reply) => {
      resolve(reply);
    });
  }).then((link) => {
    if (!link) {
      return getAvatar(accountId);
    }
    return link;
  });
}

app.use(async (ctx, next) => {
  ctx.assert(ctx.req.url.length < 11, 400, 'invalid length');
  const str = ctx.req.url.split('/')[1];
  if (!isNumber(str)) {
    ctx.body = DEFAULT_AVATAR;
    return next();
  }
  const accountId = parseInt(ctx.req.url.split('/')[1], 10);
  ctx.body = await findOrGet(accountId);
  client.set(accountId, ctx.body, 'PX', 86400000, 'NX');
  return next();
});

/* istanbul ignore if */
if (!module.parent) {
  app.listen(5000);
  console.log('Listening on 5000');
}
