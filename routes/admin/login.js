var router = require('koa-router')();
//验证码模块
var svgCaptcha = require('svg-captcha');
var DB = require('../../model/db.js');
var tools = require('../../model/tools.js');

router.get('/', async (ctx)=>{
    await ctx.render('admin/login')
});

//验证用户名密码
router.post('/doLogin', async (ctx)=>{

    let username = ctx.request.body.username;
    let password = ctx.request.body.password;
    let code = ctx.request.body.code;

    if( code.toLocaleLowerCase() == ctx.session.code.toLocaleLowerCase() ) {
        let result = await DB.find('admin', {
            'username': username,
            'password': tools.md5(password)
        });

        if( result.length > 0 ) {
            ctx.session.userinfo = result[0]
            ctx.redirect(ctx.state.__HOST__+'/admin');
        } else {
            await ctx.render('admin/error', {
                message: '用户名或者密码错误',
                redirect: ctx.state.__HOST__+'/admin/login'
            });
        }
    } else {
        await ctx.render('admin/error', {
            message: '验证码失败',
            redirect: ctx.state.__HOST__+'/admin/login'
        });
    }
});

//获取验证码
router.get('/code', async (ctx)=>{
    var captcha = svgCaptcha.create({
        size: 4,
        fontSize: 50,
        width: 120,
        height: 34,
        background: "#cc9966"
    });

    ctx.session.code = captcha.text;
    //设置响应头
    ctx.response.type = 'image/svg+xml';
    ctx.body=captcha.data;
});

//退出登录
router.get('/loginOut', async (ctx)=>{
    ctx.session.userinfo = null;
    ctx.redirect(ctx.state.__HOST__+'/admin/login');
});

module.exports=router.routes();