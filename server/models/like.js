var mongoose = require('mongoose');

var LikeSchema = new mongoose.Schema({
        usr : {type: mongoose.Schema.ObjectId, ref: 'user'}
    },
    {collection : "likes"}
);

module.exports = mongoose.model('like', LikeSchema);