var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
        name: String,
        id: String
    },
    {collection : "users"}
);

module.exports = mongoose.model('user', UserSchema);