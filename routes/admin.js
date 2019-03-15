var router = require('koa-router')();
var url = require('url');

var ueditor = require('koa2-ueditor')

//注意上传图片的路由   ueditor.config.js配置图片post的地址
router.all('/editorUpload', ueditor(['public',{
    "imageAllowFiles": [".png", ".jpg", ".jpeg"],
    "imagePathFormat": "/upload/ueditor/image/{yyyy}{mm}{dd}/{filename}" // 保存为原文件名
}]));

router.use(async (ctx, next)=>{

    //模板引擎配置全局的变量
    ctx.state.__HOST__='http://'+ctx.request.header.host;

    var pathname = url.parse(ctx.request.url).pathname.substring(1);

    var splitUrl = pathname.split('/');
    ctx.state.G={
        url: splitUrl,
        userinfo: ctx.session.userinfo,
        prevPage:ctx.request.headers['referer']   /*上一页的地址*/
    }

    // session 会话验证
    if( ctx.session.userinfo ) {
        await next();
    } else {
        if( pathname == 'admin/login' || pathname == 'admin/login/doLogin' || pathname == 'admin/login/code' ) {
            await next();
        } else {
            ctx.redirect('/admin/login');
        }
    }
});

var login = require('./admin/login.js');
var index = require('./admin/index.js');

var tag = require('./admin/tag.js');
var article = require('./admin/article.js')

router.use(index);
router.use('/login', login);
router.use('/tag', tag);
router.use('/article', article);

module.exports = router.routes()