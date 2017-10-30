var express = require('express');
var router = express.Router();
//新增
var crypto = require('crypto');
var User = require('../models/user');
var Article = require('../models/article');
var mult = require('multiparty');//上传文件插件
var fs = require('fs');//Node.js的文件系统

//设置返回值变量，了解当前操作结果
var rs = "";
var str = "";

module.exports = function (app) {

    app.get('/login', function (req, res) {//到达此路径则渲染login文件，并传出title值供 login.html使用
        res.render("login", { title: '用户登录', result: "" });
    });

    app.post('/login', function (req, res) {                        // 从此路径检测到post方式则进行post数据的处理操作
        //get User info
        //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现) 
        var uname = req.body.username;                //获取post上来的 data数据中 uname的值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        User.findOne({ name: uname }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
            if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                //res.send(500 + " Network Error!");
                req.session.error = '网络异常错误！';
                console.log(err);
                rs = '网络异常错误！';//500代表异常错误
                res.redirect("/login");
            } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                req.session.error = '用户名不存在！';
                //res.send(404 + "Customer is null!"); 
                rs = '用户名不存在！';//    状态码返回404
                res.redirect("/login");
            } else {
                if (password != doc.pwd) {     //查询到匹配用户名的信息，但相应的password属性不匹配
                    req.session.error = "密码错误！";
                    //res.send(404 + "Pawssord is error!");
                    rs = "密码错误！";
                    res.redirect("/login");
                } else {                                     //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                    req.session.user = doc;
                    console.log("登录中的session：" + req.session.user);
                    //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息
                    rs = "";
                    res.redirect("/");//20170505
                    //path = "home";
                }
            }
            // res.render(path, { title: '用户登录', result: rs});
        });
    });

    // app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        var nrs = "", iprs = "", rprs = "";
        // 到达此路径则渲染register文件，并传出title值供 register.html使用
        res.render("reg", { title: '用户注册', result: "", namers: nrs, inpwdrs: iprs, repwdrs: rprs });
    });

    // app.post('/reg', checkNotLogin);
    app.post('/reg', function (req, res) {
        //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现) 
        //var User = global.dbHandel.getModel('users');
        var uname = req.body.username;//获取页面表单信息
        var inpwd = req.body.password;
        var repwd = req.body.passwordconf;
        var uintro = req.body.txtintro;
        var date = new Date();
        var regTime = getTime(date);

        var md5 = crypto.createHash('md5');
        var upwd = md5.update(inpwd).digest('base64');
        //console.log("判断密码是否一致！");
        var nrs = "", iprs = "", rprs = "";
        var flag = true;

        if (uname == "" || uname == null) {
            req.session.error = "用户名不能为空！";
            nrs = "用户名不能为空！";
            flag = false;
        }
        if (inpwd == "" || inpwd == null) {
            req.session.error = "密码不能为空！";
            iprs = "密码不能为空！";
            flag = false;
        }
        if (inpwd != repwd) {
            req.session.error = "两次密码不一致！";
            rprs = "两次密码不一致！";
            flag = false;
        }

        if (flag == false) {
            res.render("reg", { title: '用户注册', result: rs, namers: nrs, inpwdrs: iprs, repwdrs: rprs });

        } else {
            var newUser = new User({
                name: uname,
                pwd: upwd,
                introinfo: uintro,
                regDate: regTime
            });
            //console.log("判断账户是否存在！");
            User.findOne({ name: uname }, function (err, doc) {   // 同理 /login 路径的处理方式
                if (err) {
                    //res.send(500 + " Network Error!");
                    rs = '网络异常错误！';
                    req.session.error = '网络异常错误！';
                    console.log(err + "网络异常错误！");
                    // res.redirect('/reg'); 
                } else if (doc) {
                    rs = "用户名已存在！";
                    req.session.error = "用户名已存在！";//'用户名已存在！';
                    //res.send(500 + " Customer already existence!"); 
                    console.log("用户名已存在！");
                    //res.redirect('/reg'); 
                } else {
                    //User.create({
                    //    name: uname,
                    //    pwd:upwd
                    //}, 
                    newUser.save(function (err) {
                        if (err) {
                            //res.send(500 + " Insert data fail!");
                            rs = "插入数据失败！";
                            req.session.error = "插入数据失败！";//err.message;
                            console.log(err + "插入数据失败！");
                            //res.redirect('/reg');
                            // res.render("reg", { title: '用户注册', result: rs });
                        } else {
                            rs = "";
                            req.session.user = newUser;
                            req.session.success = "注册成功！";//"注册成功";
                            //res.send(200 + " Register success!");                    
                            //res.redirect('/login'); 
                            console.log("用户创建成功！");
                        }
                    });
                }
                res.render("login", { title: '用户登录', result: rs, namers: nrs, inpwdrs: iprs, repwdrs: rprs });
            });
        }
    });

    //app.get('/home', checkNotLogin); 20170505
    //app.get("/", function (req, res) {
    //    if (!req.session.user) {                     //到达/home路径首先判断是否已经登录
    //        req.session.error = "请先登录";
    //        console.log("请先登录！");
    //        res.redirect("/login");                //未登录则重定向到 /login 路径
    //    }
    //    else {//获取当前用户
    //        var currUser = req.session.user;
    //        var uname = currUser.name;

    //        Article.find({ name: uname }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
    //            if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
    //                //res.send(500 + " Network Error!");
    //                req.session.error = '网络异常错误！';
    //                rs = "网络异常错误";
    //                // res.redirect("/home");

    //            } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
    //                req.session.error = '用户名不存在！';
    //                //res.send(404 + "Customer is null!");  
    //                rs = "用户名不存在！";
    //                res.redirect("/login");
    //            } else {
    //                if (doc == "" || doc == null) {
    //                    rs = "该用户还没有发表过文章哦~";
    //                    console.log(str);
    //                }
    //                    //信息匹配成功，则将此对象（匹配到的Articles) 赋给session.Articles  并返回成功
    //                else {
    //                    rs = "";
    //                    req.session.article = doc;
    //                    console.log("user中article 的session：" + req.session.article);
    //                    str = req.session.article;//JSON.stringify(doc);
    //                    //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息 
    //                }

    //            }
    //            //查找数据之后放入页面显示
    //            res.render("index", { title: '主页信息', contList: str, result: rs });//页面显示,html渲染
    //        });
    //    }
    //    //res.render("home", { title: '主页信息', result: rs });         //已登录则渲染home页面
    //});

    //app.get('/user', checkNotLogin); 

    //删除文章   
    app.get("/user", function (req, res, next) {
        //获取当前用户
        var currUser = req.session.user;
        //var artic = req.body.article;//获取页面表单信息    
        var uname = currUser.name;
        var queryLimit = req.query.articleId;

        //判断是否有传参要求删除文件
        if (queryLimit != "" && queryLimit != null && queryLimit != "undefined") {
            Article.remove({ name: uname, _id: queryLimit }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
                if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                    //res.send(500 + " Network Error!");
                    req.session.error = '网络异常错误！';
                    rs = "网络异常错误";
                    res.redirect("/");//home20170505
                } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                    req.session.error = '用户名不存在！';
                    //res.send(404 + "Customer is null!");  
                    rs = "用户名不存在！";
                    res.redirect("/login");
                } else {
                    if (doc == "" || doc == null) {
                        rs = "查无此文章，删除失败！";
                        console.log(str);
                    }
                        //信息匹配成功，则将此对象（匹配到的Articles) 赋给session.Articles  并返回成功
                    else {
                        rs = "";
                        req.session.article = doc;
                        // console.log("user中article 的session：" + req.session.article);
                        str = req.session.article;//JSON.stringify(doc);
                        console.log("文章删除成功！");
                        //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息 
                    }

                }
                //查找数据之后放入页面显示
                // res.render("user", { title: '个人主页', contList: str, result: rs });//页面显示,html渲染
            });
        }
        //同一路径绑定多个响应函数的方法，通过调用 next() 转移控制权
        next();
    });

    app.get("/user", function (req, res) {
        //获取当前用户
        var currUser = req.session.user;
        //var artic = req.body.article;//获取页面表单信息 
        var uId = currUser._id;
        User.findOne({ _id: uId }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
            if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                //res.send(500 + " Network Error!");
                req.session.error = '网络异常错误！';
                console.log(err);
                rs = '网络异常错误！';//500代表异常错误
                res.redirect("/login");
            } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                req.session.error = '用户名不存在！';
                //res.send(404 + "Customer is null!"); 
                rs = '用户名不存在！';//    状态码返回404
                res.redirect("/login");
            } else {
                rs = "";
                //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                req.session.user = doc;
                console.log("user中的session：" + req.session.user);
                //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息                
            }
            // res.render(path, { title: '用户登录', result: rs});
        });
        var uname = currUser.name;
        Article.find({ name: uname }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
            if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                //res.send(500 + " Network Error!");
                req.session.error = '网络异常错误！';
                rs = "网络异常错误";
                res.redirect("/");//home20170505
            } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                req.session.error = '用户名不存在！';
                //res.send(404 + "Customer is null!");  
                rs = "用户名不存在！";
                res.redirect("/login");
            } else {
                if (doc == "" || doc == null) {
                    rs = "该用户还没有发表过文章哦~";
                    console.log(rs);
                }
                    //信息匹配成功，则将此对象（匹配到的Articles) 赋给session.Articles  并返回成功
                else {
                    rs = "";
                    req.session.article = doc;
                    console.log("user中article 的session：" + req.session.article);
                    str = req.session.article;//JSON.stringify(doc);
                    //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息 
                }
            }
            //查找数据之后放入页面显示
            res.render("user", { title: '个人主页', contList: str, result: rs });//页面显示,html渲染
        });
    });

    //获取要修改的用户信息
    app.get("/edtUsInfo", function (req, res) {
        var usId = req.query.userId;
        var oldstr, newstr= "";

        User.find({ _id: usId }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
            if (err) {                                   //错误就返回给原post处（login.html) 状态码为500的错误
                //res.send(500 + " Network Error!");
                req.session.error = '网络异常错误！';
                rs = "网络异常错误";
                res.redirect("/");//home20170505
            } else if (!doc) {                           //查询不到用户名匹配信息，则用户名不存在
                req.session.error = '用户名不存在！';
                //res.send(404 + "Customer is null!");  
                rs = "用户名不存在";
                res.redirect("/login");
            } else {
                if (doc == "" || doc == null) {
                    rs = "您要修改的账户信息不存在，请重新选择需要修改的账户！";
                    console.log(rs);
                }
                else {
                    //信息匹配成功，则将此对象（匹配到的Articles) 赋给session.Articles  并返回成功
                    rs = "";
                    //req.session.user = doc;
                    console.log("显示用户信息的session：" + req.session.user);

                    str = doc;//JSON.stringify(doc);
                    //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息 
                }
            }
            res.render("edtUsInfo", { title: "用户信息", userInfo: str, result: rs, oldpwd: oldstr, newpwd: newstr });//页面显示,html渲染  

        });
    });

    //修改用户信息
    app.post("/edtUsInfo", function (req, res) {
        var userinfo = req.session.user;
        var userId = req.query.userId;//获取用户id
        var info = req.body.txtintro;//获取页面表单信息 
        var opwd = req.body.oldpwd;
        var npwd = req.body.newpwd;
        var userimg = req.query.param;//获取上传成功的头像参数
       
        //var md5 = crypto.createHash('md5');
        var md_npwd = crypto.createHash('md5').update(npwd).digest('base64');
        var md_opwd = crypto.createHash('md5').update(opwd).digest('base64');
        var opwdstr = "", npwdstr = "";
 
        //判断是否修改了头像,没有修改则将原来的值赋值上去
        if (userimg == "" || userimg == null) {
            userimg = userinfo.userImg;
        }

        if ((opwd != "" && opwd != null) || (npwd != "" && npwd != null)) {
            if ((npwd == "" || npwd == null)) {
                req.session.error = "新密码不能为空，请重新输入！";
                npwdstr = "新密码不能为空，请重新输入！";
                res.render("edtUsInfo", { title: '用户信息编辑', userInfo: str, result: "", oldpwd: opwdstr, newpwd: npwdstr});
            }
            else if (md_opwd != userinfo.pwd) {
                req.session.error = "输入的旧密码错误，请重新输入！";
                opwdstr = "输入的旧密码错误，请重新输入！";
                res.render("edtUsInfo", { title: '用户信息编辑', userInfo: str, result: "", oldpwd: opwdstr, newpwd: npwdstr });

            } else {
               
                User.update({ _id: userId }, { pwd: md_npwd, introinfo: info, userImg: userimg }, function (err, doc) {
                    if (err) {
                        req.session.message = err.message;
                        console.log("修改失败：" + err.message);
                        return res.redirect('/edtUsInfo');
                    } else {
                        req.session.success = "发表成功";
                        //修改成功后更新user的session的信息，方便页面加载时显示修改后的数据
                        User.findOne({ _id: userId }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
                            if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                                //res.send(500 + " Network Error!");
                                req.session.error = '网络异常错误！';
                                console.log(err);
                                rs = '网络异常错误！';//500代表异常错误
                                res.redirect("/login");
                            } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                                req.session.error = '用户名不存在！';
                                //res.send(404 + "Customer is null!"); 
                                rs = '用户名不存在！';//    状态码返回404
                                res.redirect("/login");
                            } else {
                                rs = "";
                                //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                                req.session.user = doc;
                                console.log("修改密码后返回的数据：" + req.session.user);
                                //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息                
                            }
                            // res.render(path, { title: '用户登录', result: rs});
                            res.redirect("user");
                        });
                    }
                    //res.render("user");
                });
            }
        } else {
            User.update({ _id: userId }, { introinfo: info, userImg: userimg }, function (err, doc) {
                if (err) {
                    req.session.message = err.message;
                    console.log("修改失败：" + err.message);
                    return res.redirect('/edtUsInfo');
                } else {
                    req.session.success = "发表成功";
                    //修改成功后更新user的session的信息，方便页面加载时显示修改后的数据
                    User.findOne({ _id: userId }, function (err, doc) {   //通过此model以用户名的条件 查询数据库中的匹配信息
                        if (err) {                                         //错误就返回给原post处（login.html) 状态码为500的错误
                            //res.send(500 + " Network Error!");
                            req.session.error = '网络异常错误！';
                            console.log(err);
                            rs = '网络异常错误！';//500代表异常错误
                            res.redirect("/login");
                        } else if (!doc) {                                 //查询不到用户名匹配信息，则用户名不存在
                            req.session.error = '用户名不存在！';
                            //res.send(404 + "Customer is null!"); 
                            rs = '用户名不存在！';//    状态码返回404
                            res.redirect("/login");
                        } else {
                            rs = "";
                            //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                            req.session.user = doc;
                            console.log("未修改密码后返回的数据：" + req.session.user);
                            //res.send(200 + "Login success!");//);重定向与send不能同时运用，send是发送到页面显示信息                
                        }
                        // res.render(path, { title: '用户登录', result: rs});
                        res.redirect("user");
                    });
                }
                //res.render("user");
            });
        }

    });

    //上传用户头像
    app.post("/uploadImg", function (req,res, next) {
        //生成multiparty对象，并配置上传目标路径
        var form = new mult.Form();
        var date = new Date();
        var imgname = "";

        //设置编辑
        form.encoding = 'utf-8';
        //设置图片存储路径
        form.uploadDir = "./public/upload/imgs/tempImg";
        form.keepExtensions = true; //保留后缀
        form.maxFieldsSize = 2 * 1024 * 1024; //内存大小
        form.maxFilesSize = 5 * 1024 * 1024;//文件字节大小限制，超出会报错err
        //上传完成后处理
        form.parse(req, function (err, fields, files) {
             
                var filesTmp = JSON.stringify(files, null, 2);
                //filesTmp = eval(filesTmp.uploadImg);
                console.log("文件信息："+filesTmp);
                if (err) {
                    console.log('parse error: ' + err);
                    var u = { "error": 1, "message": '请上传5M以下图片' };
                    console.log(JSON.stringify(u));
                    return false;
                } else { 
                    //var inputFile = filesTmp.inputFile[0];
                    //console.log('parse files: ' + inputFile);
                    //var uploadedPath = inputFile.path;
                    //console.log('旧路径：' + uploadedPath);
                    //var dstPath = './public/files/' + inputFile.originalFilename;
                    ////重命名为真实文件名
                    //fs.rename(uploadedPath, dstPath, function (err) {
                    //    if (err) {
                    //        console.log('rename error: ' + err);
                    //    } else {
                    //        console.log('rename ok');
                    //    }
                    //});
                
                    //获取路径
                    var oldpath = files.uploadImg[0].path;//uploadImg转换后的数组名字
                    console.log("旧路径："+oldpath);
                    //文件夹名称和文件名称
                    var filename = getFileName(date);
                    var folder = filename.substr(0, 6) + "/";

                    //文件后缀处理格式
                    if (oldpath.indexOf('.jpg') >= 0) {
                        var suffix = '.jpg';
                    } else if (oldpath.indexOf('.png') >= 0){
                        var suffix = '.png';
                    } else if (oldpath.indexOf('.gif') >= 0){
                        var suffix = '.gif';
                    } else {
                        var u = { "error": 1, "message": '请上传正确格式' };
                        console.log(JSON.stringify(u));
                        return false;
                    }
                    var folderpath = './public/upload/imgs/' + folder;
                   
                    //if (!fs.exists(folderpath, function (err) {throw err;})) {
                    //    fs.mkdir(folderpath);                        
                    //};
                    var url = folderpath + filename + suffix; 

                    //判断文件夹是否存在，不存在则进行新建 
                    fs.exists(folderpath, function (exists) {
                        if (exists) {
                            console.log("指定路径已存在！");
                           } else {
                            fs.mkdir(folderpath);
                            console.log("已创建文件夹！"); 
                        }
                    });

                    //给图片修改名称
                    fs.rename(oldpath, url);
                    //var u = {"error": 0, "url": '/' + url }
                    imgname = folder+filename + suffix;
                    console.log("上传成功！"); 
                    //return true; 
                }
                //重定向到编辑页面，显示是否上传成功，并将参数传递过去，方便用户添加
                res.redirect('/edtUsInfo?userId=' + req.session.user._id + '&param=' + imgname); 
        });  
    });

    //app.post('/user', checkNotLogin);  
    /* GET logout page. */
    app.get("/logout", function (req, res) {    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
        req.session.user = null;
        req.session.article = null;
        req.session.searchrs = null;
        req.session.counts = null;
        req.session.error = null;
        req.session.success = null;
        res.redirect("/");
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

    function getFileName(date) {
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

        return y +  m +  d + h + minute + se + milli;
    }

    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.session.error = 'error', '未登入';
            return res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.session.error = 'error', '已登入';
            return res.redirect('/');
        }
        next();
    }

};
