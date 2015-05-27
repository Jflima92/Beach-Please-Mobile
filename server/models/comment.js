var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
        usrid:String,
        commenttext: String,
        likes: {type : Array , "default" : []},
        time : { type: Date, default: Date.now }
    },
    {collection : "commentscol"}
);

module.exports = mongoose.model('Comment', CommentSchema);