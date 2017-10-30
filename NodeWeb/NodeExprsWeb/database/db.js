var settings = require("../settings");
var mongoose = require('mongoose');

//var DB_CONN_STR = "mongodb://" + settings.ip + "/" + settings.db;
mongoose.connect("mongodb://" + settings.ip + "/" + settings.db);

//增加测试
mongoose.connection.on('connected', function () {
    console.log('Connection success!');
})

mongoose.connection.on('error', function (err) {
    console.log('Connection error:'+err);
})

mongoose.connection.on('disconnected', function () {
    console.log('Connection disconnected!');
})

//var settings = require('../settings');
//var Db = require('mongodb').Db;
//var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
//module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {}));

//var db = mongoose.connection;
//module.exports = {
//    "dbCon": db,
//    "mongoose": mongoose
//};

//var MongoClient = require('mongodb').MongoClient;
//var DB_CONN_STR = 'mongodb://localhost:27017/runoob'; // 数据库为 runoob
//查询数据
//var selectData = function (db, callback) {
//    //连接到表  
//    var collection = db.collection('persons');
//    //查询数据
//    var whereStr = { "name": 'Joke' };
//    collection.find(whereStr).toArray(function (err, result) {
//        if (err) {
//            console.log('Error:' + err);
//            return;
//        }
//        callback(result);
//    });
//}

////更新数据
//var updateData = function (db, callback) {
//    //连接到表  
//    var collection = db.collection('persons');
//    //更新数据
//    var whereStr = { "name": 'Joke' };
//    var updateStr = { $set: { "age": "20" } };
//    collection.update(whereStr, updateStr, function (err, result) {
//        if (err) {
//            console.log('Error:' + err);
//            return;
//        }
//        callback(result);
//    });
//}


//mongoose.connect(DB_CONN_STR, function (err, db) {
//    console.log("连接成功！");
//    selectData(db, function (result) {
//        console.log(result);
//        db.close();
//    });
//});

module.exports = mongoose;