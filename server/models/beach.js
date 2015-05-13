var mongoose = require('mongoose');

var BeachSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lng: Number
});

module.exports = mongoose.model('Beach', BeachSchema);