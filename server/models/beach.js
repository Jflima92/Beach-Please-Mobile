var mongoose = require('mongoose');

var BeachSchema = new mongoose.Schema({
        name: String,
        lat: Number,
        lng: Number,
        cond : {type: mongoose.Schema.ObjectId, ref: 'weatherCond'},
        thumbUrl: String,
        picUrls: {type : Array , "default" : []}
    },
    {collection : "beaches"}
);

module.exports = mongoose.model('Beach', BeachSchema);