var router = require('koa-router')();
var DB = require('../../model/db.js');

router.get('/', async ctx => {
    let result = await DB.find('tag',{});
    await ctx.render('admin/tag/index',{
        list: result
    });
});

router.get('/add', async (ctx)=>{
    await ctx.render('admin/tag/add');
});

router.post('/doAdd', async (ctx)=>{
    await DB.insert('tag', ctx.request.body);

    ctx.redirect(ctx.state.__HOST__+'/admin/tag');
});

router.get('/edit', async (ctx)=>{
    let id = ctx.query.id;
    let result = await DB.find('tag',{'_id': DB.getObjectId(id)})
    console.log(result)

    await ctx.render('admin/tag/edit',{
        list: result[0],
        prevPage: ctx.state.G.prevPage
    });
});

router.post('/doEdit', async (ctx)=>{

    let tagname = ctx.request.body.tagname;
    let id = ctx.request.body.id;
    let status = ctx.request.body.status;
    let prevPage = ctx.request.body.prevPage;

    await DB.update('tag', {'_id':  DB.getObjectId(id)}, {tagname,status})

    if( prevPage ) {
        ctx.redirect(prevPage);
    } else {
        ctx.redirect(ctx.state.__HOST__+'/admin/tag');
    }
});

module.exports = router.routes();