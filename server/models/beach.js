var mongoose = require('mongoose');

var BeachSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number,
    cond : {type: mongoose.Schema.ObjectId, ref: 'weatherCond'}
},
    {collection : "beaches"}
);

module.exports = mongoose.model('Beach', BeachSchema);