# PersonalBlog

[TOC]

# 项目初始化

- ```npm init```生成一个```package.json```配置文件
- 创建 ```model, routes, views, public```文件夹 和 ```app.js```文件
- 安装koa基础中间件 ```npm install <module name>```
```
    "koa": "^2.7.0",
    "koa-art-template": "^1.1.1",   //配置模板引擎
    "koa-bodyparser": "^4.2.1",     //表单数据
    "koa-router": "^7.4.0",         //koa 路由
    "koa-session": "^5.10.1",
    "koa-static": "^5.0.0",         //koa 静态文件服务
    "path": "^0.12.7",
    "silly-datetime": "^0.1.2"
```

# Mongndb 数据库配置
```java
/* module/db.js */

class Db {

    static getInstance() {}
    
    constructor() {}
    
    connect()
    
    find( collectionName, json1, json2, json3 ) {}
    
    ...
}
```
> admin 表

_id | username | password | status
---|---|---|---
1 | "admin" | "e10adc3949ba59abbe56e057f20f883e" | "1"



# app.js 配置、初始化中间件

# 后台 admin 路由实现
```java
/*app.js*/

//引入模块
var admin = require('./routes/admin.js')

router.use('/admin', admin);

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(8001);
```

## admin 用户验证
```java
/*admin.js*/

//admin 全局验证
router.use(async (ctx, next)=>{

    //模板引擎配置全局的变量
    ctx.state.__HOST__='http://'+ctx.request.header.host;
    
    var pathname = url.parse(ctx.request.url).pathname.substring(1);

    // session 会话验证
    if( ctx.session.userinfo ) {
        await next();
    } else {
        if( pathname == 'admin/login' || pathname == 'admin/login/doLogin' || pathname == 'admin/login/code' ) {
            await next();
        } else {
            ctx.redirect('/admin/login');   //跳转登录界面
        }
    }
});

module.exports = router.routes()
```

## 用户登录
> 添加 ```views/admin/login.html``` 用户登录界面模板
### 模板
```html
<form action="{{__HOST__}}/admin/login/doLogin" method="post" id="loginForm">
	<fieldset>
		<label class="...">
			<span class="...">
				<input id="username" type="text" name="username" class="form-control" placeholder="用户名" />
				<i class="..."></i>
			</span>
		</label>

		<label class="...">
			<span class="...">
				<input  id="password" type="password"  name="password" class="form-control" placeholder="密码" />
				<i class="..."></i>
			</span>
		</label>

		<label class="...">
			<span class="...">
				<input type="text" class="form-control" placeholder="验证吗" name="code" style="..." />
				<img id="code" src="{{__ROOT__}}/admin/login/code" alt="">
			</span>
		</label>

		<div class="..."></div>

		<div class="...">
			<label class="...">
				<input type="checkbox" class="ace" />
				<span class="lbl"> Remember Me</span>
			</label>

			<button type="submit" class="...">
				<i class="..."></i>
				登录
			</button>
		</div>

		<div class="..."></div>
	</fieldset>
</form>
```
### 数据库
```java
/* routes/admin/login.js */

let result = await DB.find('admin', {
    'username': username,
    'password': tools.md5(password)
});
```
### 验证码
```java
/* routes/admin/login.js */

//模板中获取验证码
router.get('/code', async (ctx)=>{
    var captcha = svgCaptcha.create({
        size: 4,
        fontSize: 50,
        width: 120,
        height: 34,
        background: "#cc9966"
    });

    ctx.session.code = captcha.text;    //存储当前验证码，用于验证时判断
    //设置响应头
    ctx.response.type = 'image/svg+xml';
    ctx.body=captcha.data;
});
```
```html
<label class="...">
	<span class="...">
		<input type="text" class="form-control" placeholder="验证吗" name="code" style="..." />
		<img id="code" src="{{__ROOT__}}/admin/login/code" alt="">
	</span>
</label>
```

### 登出
```java
/* routes/admin/login.js */

router.get('/loginOut', async (ctx)=>{
    ctx.session.userinfo = null;
    ctx.redirect(ctx.state.__HOST__+'/admin/login');
});
```

> 添加 ```views/admin/error.html```、```views/admin/index.html```

## 后台首页

> 配置后台模板中需要的用户数据 ```userinfo``` ， ```ctx.state.<name>``` 可自行编辑在模板中的变量，
当前配置中加了 ```__HOST__```、```G```;

```java
/* routes/admin.js */

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
```

## 标签页

> 准备： html文件，添加到```views/admin/tag```中， ```routes/admin/```中新增```tag.js```文件

### 数据库
> tag 表

id | tagname | status
---|---|---
1 | "NodeJs" | "1"
2 | "ffmpeg" | "1"
3 | "Qt" | "1"

### html模板
```html
<!-- views/admin/tag/index.html -->

{{each list}}
	<tr class="">
		<td >
			{{$value.tagname}}
		</td>
		<td class="center">
			{{if $value.status==1}}
				<img src="{{__HOST__}}/admin/images/yes.gif" onclick="app.toggle(this,'tag','status','{{@$value._id}}')" />
			{{else}}
				<img src="{{__HOST__}}/admin/images/no.gif" onclick="app.toggle(this,'tag','status','{{@$value._id}}')" />
			{{/if}}
		</td>
		<td>
			<div class="visible-md visible-lg hidden-sm hidden-xs btn-group center">
				<a href="{{__HOST__}}/admin/tag/edit?id={{@$value._id}}">
					<button class="btn btn-xs btn-info">
						<i class="icon-edit bigger-120"></i>
					</button>
				</a>
				<a class="delete" href="{{__HOST__}}/admin/remove?collection=tag&id={{@$value._id}}">
				<button class="btn btn-xs btn-danger">
						<i class="icon-trash bigger-120"></i>
					</button>

				</a>

			</div>

		</td>
	</tr>
{{/each}}
```

### 路由
```java
/* routes/admin/tag.js */

router.get('/', async ctx => {
    let result = await DB.find('tag',{});
    await ctx.render('admin/tag/index',{
        list: result
    });
});
```

### 标签的增删改

#### 增加

```java
/* routes/admin/tag.js */

router.get('/add', async (ctx)=>{
    await ctx.render('admin/tag/add');
});

router.post('/doAdd', async (ctx)=>{
    await DB.insert('tag', ctx.request.body);

    ctx.redirect(ctx.state.__HOST__+'/admin/tag');  //返回tab主页
});
```

#### 修改

```java
/* routes/admin/tag.js */

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

    // 返回上一页 或tag主页
    if( prevPage ) {
        ctx.redirect(prevPage);
    } else {
        ctx.redirect(ctx.state.__HOST__+'/admin/tag');
    }
});
```

#### 删除
> 这是一个```admin```对```tag```和```article```删除的共同路由接口，通过传递的```collection```来对指定的表删除
```java
/* routes/admin/index.js */

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
```

```html
<!-- views/admin/tag/index.html -->

<a class="delete" href="{{__HOST__}}/admin/remove?collection=tag&id={{@$value._id}}">
```

## 内容页

> 准备： html文件，添加到```views/admin/article```中， ```routes/admin/```中新增```article.js```文件

### 数据库
> article 表

id | title | tags | content | status
---|---|---|---|---
1 | "QML与ffmpeg实现简单视频播放" | ["ffmpeg","Qt"] | ... | "1"
2 | "..." | ["...","..."] | ... | "1"
3 | "..." | ["...","..."] | ... | "1"

### html 模板
```html
<!-- views/admin/article/index.html -->

{{each list}}
	<tr class="">
		<td>
			{{$value.title}}
		</td>
		<td>
			{{$value.tags}}
		</td>
		<td>
			{{if $value.add_time}}
					{{$value.add_time | dateFormat}}
			{{/if}}
		</td>
		<td>
			{{if $value.status==1}}
			<img src="{{__ROOT__}}/admin/images/yes.gif" onclick="app.toggle(this,'article','status','{{@$value._id}}')" />
			{{else}}
			<img src="{{__ROOT__}}/admin/images/no.gif" onclick="app.toggle(this,'article','status','{{@$value._id}}')" />
			{{/if}}
		</td>
		<td>
			<a href="{{__ROOT__}}/admin/article/edit?id={{@$value._id}}">
				<button class="btn btn-xs btn-info">
					<i class="icon-edit bigger-120"></i>
				</button>
			</a>
			&nbsp;&nbsp;
			<a class="delete" href="{{__ROOT__}}/admin/remove?collection=article&id={{@$value._id}}">
				<button class="btn btn-xs btn-danger">
					<i class="icon-trash bigger-120"></i>
				</button>
			</a>
		</td>
	</tr>
	{{/each}}
```

### 路由
```java
/* routes/admin/article.js */

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
```

### 内容的增删改

#### 增加
```java
/* routes/admin/article.js */

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
```

#### 修改
```java
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
```

#### 删除
同tag的删除

# 前端实现

> html 准备：在 ```views``` 下添加 ```default``` 文件夹，

## 主页
```java
/* routes/index.js */

// 前端界面左侧一直保留 tag 标签
router.use(async (ctx,next)=>{
    //模板引擎配置全局的变量
    ctx.state.__HOST__='http://'+ctx.request.header.host;

    let result = await DB.find('tag',{});
    ctx.state.tags = result;

    await next();
});

//获取内容列表
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
```

## 预览内容页面

```java
/* routes/index.js */

router.get('/article/:id', async ctx=>{
    let id = ctx.params.id;

    let result = await DB.find('article',{'_id': DB.getObjectId(id)});

    console.log(result[0])
    ctx.render('default/article',{
        list: result
    });
});
```

## 标签页面

```java
/* routes/index.js */

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
```