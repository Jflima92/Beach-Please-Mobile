var express = require('express');
var router = express.Router();
var multer = require('multer');
var beach = require('../models/beach.js');
var photo = require('../models/photo.js');
var mongoose = require('mongoose');
var request = require('request');
router.get('/', function(req, res) {

    res.send("api");

});

router.post('/', [ multer({ dest: './uploads/'}), function (req, res) {
    console.log("pintou");
    console.log(req.files);
    /*console.log("user");
    console.log(req.body.user.id);*/

    var praia =  req.body.beach;
    var fbid = req.body.user.id;
    beach.findOne({name:praia }, function (err, query) {

        var newphoto = new photo({
            name : req.files.file.name,
            user: fbid
        });

        newphoto.save();

        beach.findByIdAndUpdate(query, { $push: { photos: newphoto }}, function (err, photo) {
        });





    });
    res.sendStatus(200);
}]);

module.exports = router;

/*
{ file:{
    fieldname: 'file',
    originalname: '1432121034860.jpg',
    name: 'c01ae21aba06d90d84b133748e7f8563.jpg',
    mimetype: 'image/jpeg',
    path: 'uploads/c01ae21aba06d90d84b133748e7f8563.jpg',
    encoding: '7bit',
    extension: 'jpg',
    size: 616194,
    truncated: false,
    buffer: null }
}

    */

