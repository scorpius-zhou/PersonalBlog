var router = require('koa-router')();

var DB = require('../model/db.js');
var tools = require('../model/tools.js');

router.use(async (ctx,next)=>{
    //模板引擎配置全局的变量
    ctx.state.__HOST__='http://'+ctx.request.header.host;

    let result = await DB.find('tag',{});
    ctx.state.tags = result;

    await next();
});

router.get('/', async ctx => {

    let count= await DB.count('article',{});
    let result = await DB.find('article',{},{},{
        sortJson: {
            'add_time': -1
        }
    });

    ctx.render('default/index',{
        list: result
    });
});

router.get('/article/:id', async ctx=>{
    let id = ctx.params.id;

    let result = await DB.find('article',{'_id': DB.getObjectId(id)});

    console.log(result[0])
    ctx.render('default/article',{
        list: result
    });
});

router.get('/tags/:tagname', async ctx=>{
    console.log(ctx.params)
    let tag = ctx.params;

    let result = await DB.find('article',{'$text':{'$search':tag.tagname}},{},{
        sortJson:{
            'add_time': -1
        }
    });

    let list = tools.cateToYearList(result);
    console.log(list);
    ctx.render('default/tags',{
        list: list
    });
});

module.exports = router.routes()