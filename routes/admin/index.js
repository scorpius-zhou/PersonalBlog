var router = require('koa-router')();

router.get('/', async (ctx)=>{
    await ctx.render('admin/index');
});

router.get('/remove', async (ctx) => {
    try {

        var collection = ctx.query.collection;
        var id = ctx.query.id;
    
        DB.remove( collection, { '_id':DB.getObjectId(id) });

        ctx.redirect(ctx.state.G.prevPage);
    }catch(err){
        ctx.redirect(ctx.state.G.prevPage);
    }
});

module.exports = router.routes();