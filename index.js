const Koa = require('koa');
const cors = require('kcors');
const got = require('got');
const isNumber = require('is-number');
const NodeCache = require('node-cache');

const app = module.exports = new Koa();
app.use(cors());

const myCache = new NodeCache({ stdTTL: 21600 });

const opt = {
  method: 'HEAD',
  timeout: 900,
  retries: 2,
  encoding: null,
};
const DEFAULT_AVATAR = 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

function getAvatar(url) {
  return got(url, opt)
    .then((res) => {
      return res.url;
    })
    .catch(() => {
      return DEFAULT_AVATAR;
    });
}

app.use((ctx, next) => {
  ctx.assert(ctx.req.url.length < 11, 400, 'invalid length');
  const str = ctx.req.url.split('/')[1];
  ctx.assert(isNumber(str), 200, DEFAULT_AVATAR);
  const accountId = parseInt(ctx.req.url.split('/')[1], 10);
  const cached = myCache.get(accountId);
  if (cached) {
    ctx.body = cached;
    return next();
  }
  const url = `https://www.heroesofnewerth.com/getAvatar_SSL.php?id=${accountId}`;
  return getAvatar(url)
    .then((link) => {
      ctx.body = link;
      myCache.set(accountId, link, 21600);
      return next();
    });
});

/* istanbul ignore if */
if (!module.parent) {
  app.listen(5000);
  console.log('Listening on 5000');
}
