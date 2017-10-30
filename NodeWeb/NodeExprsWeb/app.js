var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes');
//var users = require('./routes/users');

var app = express();

//新增  导入mongoose模块：
var mongoose = require('mongoose');
var partials = require('express-partials');

var session = require("express-session");//加入缓存，保存用户登录信息
var MongoStore = require('connect-mongo')(session);//该模块用于将session存入mongo中
var settings = require("./settings");

//新增MongoDB数据库，
//var multer = require('multer');//文件上传插件

//修改默认文件为html
var ejs = require('ejs');
// view engine setup
app.set('views', path.join(__dirname, 'views'));//放模板文件的目录

//修改默认文件为html
app.engine('.html', ejs.__express);
app.set('view engine', 'html');//模板引擎    //app.set('view engine', 'ejs');

//添加片断视图插件
app.use(partials()); 

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());//node.js 中间件，用于处理 JSON, Raw, Text 和 URL 编码的数据。
//获取req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());//一个解析Cookie的工具。通过req.cookies可以取到传过来的cookie，并把它们转成对象。
app.use(express.static(path.join(__dirname, 'public')));

//新增MongoDB数据库
//新增session 将session存入mongo中
app.use(session({
    //secret: settings.cookie_secret,
    //store: new MongoStore({
    //    //mongooseConnection: db.dbCon
    //    db:settings.db
    //})
    secret: 'NodeWebCookie',//需要与setting中设置的cookie_screct名字一致
    key: settings.db,//cookie name
    cookie: { maxAge: null},//改为1天的期限则过期。30 days:maxAge: 1000 * 60 * 60 * 24 * 30,null时默认关闭浏览器的时候则清除session和cookie
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        /*db: settings.db,
        host: settings.host,
        port: settings.port*/
        url: 'mongodb://localhost:27017/NodeExprsDB'
    })
}));

//创建数据库连接
//mongoose.connect('mongodb://localhost/myDB') //连接本地数据库
//创建缓存信息
app.use(function (req, res, next) {
    res.locals.user = req.session.user;   // 从session 获取 user对象
    res.locals.article = req.session.article;//从session获取article对象。注册session实例
    res.locals.searchrs = req.session.searchrs; //session获取searchrs对象，保存搜索结果
    res.locals.counts = req.session.counts;//将查询的总数报错到session中
    var err = req.session.error;   //获取错误信息
    delete req.session.success;//清除session
    delete req.session.error;
    delete req.session.message;
     
    res.locals.message = "";   // 展示的信息 message

    if (err) {
        res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">' + err + '</div>';
    }
    next();  //中间件传递
});

//app.use(function (req, res, next) {
//    //    res.locals.user=req.session.user;
//    var err = req.session.error;
//    var success = req.session.success;
//    var user = req.session.user;
//    var mess = req.session.message;
//    var artcile = req.session.artcile;
//    delete req.session.success;
//    delete req.session.error;
//    delete req.session.message;
//    delete req.session.artcile;
//    if (err) {
//        res.locals.message = "*" + err;
//    }
//    if (mess) {
//        res.locals.message = "*" + mess;
//    }
//    if (success) {
//        res.locals.success = success;
//    }
//    if (user) {
//        res.locals.user = user.name;
//    }
//    if (artcile) {
//        res.locals.artcile = artcile.name;
//    }
//    next();
//});
routes(app);
//users(app);
//app.use('/', routes);  // 即为为路径 / 设置路由
//app.use('/users', users); // 即为为路径 /users 设置路由
//新增
//app.use('/login', routes); // 即为为路径 /login 设置路由
//app.use('/reg', routes); // 即为为路径 /register 设置路由
//app.use('/home', routes); // 即为为路径 /home 设置路由
//app.use("/logout", routes); // 即为为路径 /logout 设置路由

//global.dbHandel = require('./database/dbHandel');//引入加载数据模型的js文件
global.db = require('./database/db');//引入链接数据库的js文件

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
}); 

//app.dynamicHelpers({
//    user: function(req, res) {
//        return req.session.user;
//    },
//    error: function(req, res) {
//        var err = req.flash('error');
//        if (err.length)
//            return err;
//        else
//            return null;
//    },
//    success: function (req, res) {
//        var succ = req.flash('success');
//        if (succ.length)
//            return succ;
//        else
//            return null;
//    },
//});
module.exports = app;
