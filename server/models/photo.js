var mongoose = require('mongoose');

var PhotoSchema = new mongoose.Schema({
        name: String,
        user: {type: mongoose.Schema.ObjectId, ref: 'user'}

    },
    {collection : "photos"}
);

module.exports = mongoose.model('Beach', BeachSchema);