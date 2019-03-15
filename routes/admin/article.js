var router = require('koa-router')();

var DB = require('../../model/db.js');
var tools = require('../../model/tools.js');

router.get('/', async (ctx)=>{
    let page = ctx.query.page ||1;
    let pageSize = 8;

    let count= await DB.count('article',{});
    let result = await DB.find('article',{},{},{
        page:page,
        pageSize:pageSize,
        sortJson:{
            'add_time':-1
        }
    });
    await ctx.render('admin/article/index',{
        list: result,
        page,
        totalPages:Math.ceil(count/pageSize)

    });
});

router.get('/add', async (ctx)=>{
    let tags = await DB.find('tag',{});
    await ctx.render('admin/article/add',{
        tags: tags
    });
});

router.post('/doAdd', async (ctx)=>{
    console.log(ctx.request);
    let data = ctx.request.body

    let title = data.title;
    let content = data.content;
    let status = data.status;
    let keywords = data.keywords;
    let description = data.description;

    let tags = tools.tagList(data);
    let add_time = tools.getTime();

    await DB.insert('article', {
        title,
        tags,
        content,
        status,
        keywords,
        description,
        add_time        
    });

    ctx.redirect(ctx.state.__HOST__+'/admin/article');
});

router.get('/edit', async (ctx)=>{
    let tags = await DB.find('tag',{});
    let id = ctx.query.id;
    
    let result = await DB.find('article',{'_id':DB.getObjectId(id)})
    await ctx.render('admin/article/edit',{
        tags: tags,
        list: result[0],
        prevPage: ctx.state.G.prevPage
    });
});

router.post('/doEdit', async (ctx)=>{
    console.log(ctx.request);
    let data = ctx.request.body

    let id = data.id;
    let title = data.title;
    let content = data.content;
    let status = data.status;
    let keywords = data.keywords;
    let description = data.description;
    let prevPage = data.prevPage;

    let tags = tools.tagList(data);
    

    await DB.update('article',{'_id':DB.getObjectId(id)}, {
        title,
        tags,
        content,
        status,
        keywords,
        description
    });

    if( prevPage ) {
        ctx.redirect(prevPage);
    } else {
        ctx.redirect(ctx.state.__HOST__+'/admin/article');
    }
});

module.exports = router.routes();