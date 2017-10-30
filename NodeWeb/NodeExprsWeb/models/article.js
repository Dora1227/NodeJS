//var mongoose = require('../database/db').mongoose;
var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

var schema = new mongoose.Schema({
    name: 'string',
    content: 'string',
    updateTime: 'string',
    artcTitle:'string'
});
var Article = mongoose.model('articles', schema);
module.exports = Article;

