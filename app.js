var Koa = require('koa'),
    path=require('path'),
    router = require('koa-router')(),
    static = require('koa-static'),
    render = require('koa-art-template'),
    session = require('koa-session'),
    sd = require('silly-datetime'),
    bodyParser = require('koa-bodyparser');

var app = new Koa();

app.use(bodyParser({
    formLimit: '50mb'
}));

//配置 session中间件
app.keys = ['some secret hurr']; 
const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}; 
app.use(session(CONFIG, app));

//配置 模板引擎
render(app, {
    root: path.join(__dirname, 'views'),
    extname: '.html',
    debug: process.env.NODE_ENV != 'production',
    dateFormat:dateFormat=function(value){
        return sd.format(value, 'YYYY-MM-DD HH:mm');
    }
})

//配置 静态资源中间件
app.use(static(__dirname + '/public'));

//引入模块
var admin = require('./routes/admin.js')
var index = require('./routes/index.js')

router.use('/admin', admin);
router.use(index);

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(8000);