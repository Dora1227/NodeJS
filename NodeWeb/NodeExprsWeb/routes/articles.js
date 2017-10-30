var express = require('express');
var router = express.Router();
//新增
var Article = require('../models/article');


module.exports = function (app) {
    /* GET articles page. */
    // app.get('/articles', checkNotLogin);
    var str = "";
    var rs = "";
    //app.all("/article", function (req, res,next) {    // 从home页面跳转到user页面，发表个人动态信息
    //    res.render("article", { title: '发表文章', result : rs});//页面显示,html渲染
    //    next();
    //});
    //查询所有文章信息
    app.get("/article", function (req, res) {

        //获取当前用户
        var currUser = req.session.user;
        debugger;
        //var artic = req.body.article;//获取页面表单信息    
        var uname = currUser.name;

        Article.find({ name: uname }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
            if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                //res.send(500 + " Network Error!");
                req.session.error = '网络异常错误！';
                rs = "网络异常错误";
                res.redirect("/home");
            } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                req.session.error = '用户名不存在！';
                //res.send(404 + "Customer is null!");  
                rs = "用户名不存在";
                res.redirect("/login");
            } else {
                if (doc == "" || doc == null) {
                    rs = "该用户还没有发表过文章哦~";
                    console.log(rs);
                }
                else {
                    //信息匹配成功，则将此对象（匹配到的Articles) 赋给session.Articles  并返回成功
                    rs = "";
                    req.session.article = doc;
                    console.log("user中article 的session：" + req.session.article);

                    str = req.session.article;//JSON.stringify(doc);
                    //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息 
                }
            }
            res.render("article", { title: '发表文章', articleList: str, result: rs });//页面显示,html渲染
        });

    }); 

    //发表文章
    app.post("/article", function (req, res) {
        //var Articles = global.dbHandel.getModel('articles');
        //获取当前用户
        var currUser = req.session.user
        var article = req.body.article;//获取页面表单信息
        var title = req.body.title;
        var uname = currUser.name;
        var date = new Date();
        var update = getTime(date);

        var activity = new Article({ 
            name: currUser.name,//[new DBRef('users',currUser._id)],
            content: article,
            updateTime: update,
            artcTitle: title
        });
        //Articles.create({
        //    name: currUser.name,
        //    content: req.body.article,
        //    updateTime: getTime(new Date())

        //}, 
        activity.save(function (err) {
            if (err) {
                req.session.message = err.message;
                 
                return res.redirect('/article');
            } else {
                req.session.success = "发表成功";
                console.log("发表成功！");                
                res.redirect('/user');
            }
        });
    }); 

    //查看文章详情
    app.get("/details", function (req, res) {

        var actId = req.query.articleId; //获取查询参数id的值 
         
        Article.find({ _id: actId }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
            if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                //res.send(500 + " Network Error!");
                req.session.error = '网络异常错误！';
                rs = "网络异常错误";
                res.redirect("/home");
            } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                req.session.error = '用户名不存在！';
                //res.send(404 + "Customer is null!");  
                rs = "用户名不存在";
                res.redirect("/login");
            } else {
                if (doc == "" || doc == null) {
                    rs = "该用户还没有发表过文章哦~";
                    console.log(rs);
                }
                else {
                    //信息匹配成功，则将此对象（匹配到的Articles) 赋给session.Articles  并返回成功
                    rs = "";
                    req.session.article = doc;
                    console.log("显示详情中的session：" + req.session.article);
                    
                    str = req.session.article;//JSON.stringify(doc);
                    //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息 
                }
               
            }
            res.render("details", { title: "文章详情" , articleDetails: str, result: rs });//页面显示,html渲染  
            
        }); 
    });

    //获取要修改的文章信息
    app.get("/editor", function (req, res) { 
        //var dateTime = req.query.dateTime; //获取查询参数id的值
        var atcId = req.query.articleId;
        var currUser = req.session.user;
        var uname = currUser.name;

        Article.find({ _id: atcId, name: uname }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
            if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                //res.send(500 + " Network Error!");
                req.session.error = '网络异常错误！';
                rs = "网络异常错误";
                res.redirect("/home");
            } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                req.session.error = '用户名不存在！';
                //res.send(404 + "Customer is null!");  
                rs = "用户名不存在";
                res.redirect("/login");
            } else {
                if (doc == "" || doc == null) {
                    rs = "您要修改的文章不存在，请重新选择需要修改的文章！";
                    console.log(rs);
                }
                else {
                    //信息匹配成功，则将此对象（匹配到的Articles) 赋给session.Articles  并返回成功
                    rs = "";
                    req.session.article = doc;
                    console.log("显示详情中的session：" + req.session.article);

                    str = req.session.article;//JSON.stringify(doc);
                    //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息 
                }

            }
            res.render("editor", { title: "编辑文章", articleDetails: str, result: rs });//页面显示,html渲染  

        });
    });

    //修改文章信息
    app.post("/editor", function (req, res) {
        var atcId = req.query.articleId;
        var currUser = req.session.user;
        var uname = currUser.name;
        var article = req.body.article;//获取页面表单信息
        var title = req.body.title; 
        article = article.replace(/\n|\r\n/g, "<br>");

        Article.update({ _id: atcId ,name:uname}, { content: article, artcTitle: title }, function (err, doc) {
            if (err) {
                req.session.message = err.message;
                console.log("修改失败：" + err.message);
                return res.redirect('/article');
            } else {
                req.session.success = "发表成功";
                console.log("修改后返回数据："+doc); 
                res.redirect('/user');
            }
        });
    });


    function getTime(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? ('0' + minute) : minute;
        var se = date.getSeconds();
        se = se < 10 ? ('0' + se) : se;
        var milli = date.getMilliseconds();

        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + se + ':' + milli; 
    }

    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登入');
            return res.redirect('/login');
        }
        next();
    }
    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登入');
            return res.redirect('/');
        }
        next();
    }

};
