const Koa = require('koa');
const cors = require('kcors');
const got = require('got');
const isNumber = require('is-number');

const app = module.exports = new Koa();
app.use(cors());

const opt = { method: 'HEAD' };
const DEFAULT_AVATAR = 'https://s3.amazonaws.com/naeu-icb2/icons/default/account/default.png';

app.use((ctx, next) => {
  ctx.assert(ctx.req.url.length > 0 && ctx.req.url.length < 11, 400, 'invalid length');
  const str = ctx.req.url.split('/')[1];
  ctx.assert(isNumber(str), 400, 'not a number');
  const accountId = parseInt(ctx.req.url.split('/')[1], 10);
  const url = `https://www.heroesofnewerth.com/getAvatar_SSL.php?id=${accountId}`;
  return got(url, opt).then((res) => {
    ctx.body = res.url;
    return next();
  }).catch(() => {
    ctx.body = DEFAULT_AVATAR;
    return next();
  });
});

/* istanbul ignore if */
if (!module.parent) {
  app.listen(5000);
  console.log('Listening on 5000');
}
