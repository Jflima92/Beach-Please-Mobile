var express = require('express');
var router = express.Router();
var multer = require('multer');
var beach = require('../models/beach.js');
var photo = require('../models/photo.js');
var users = require('../models/user.js');
var mongoose = require('mongoose');
var request = require('request');
var imgur = require('imgur');
var path = require('path');
var fs = require('fs');

router.get('/', function(req, res) {

    res.send("api");

});

var uploadToImgur = function(pic_url){
    console.log("pintated");
    imgur.uploadFile(pic_url)
        .then(function(json){
            console.log(json.data.link);
        })
        .catch(function(err){
            console.log(err.message);
        })
}

router.post('/', [ multer({ dest: './uploads/'}), function (req, res) {
    /*console.log("pintou");
     console.log(req.files);*/


    var uploadToImgur = function(pic_url, cb){
        console.log("pintated");
        imgur.uploadFile(pic_url)
            .then(function(json){
                console.log(json.data.link);
                cb(json.data.link);
            })
            .catch(function(err){
                console.log(err.message);
            })
    }
    var url_to_file = './uploads/' + req.files.file.name;



    var user_id = JSON.parse(req.body.user).id;
    console.log("user: " + user_id);


    var praia =  req.body.beach;

    console.log("praia: " +praia);
    beach.findOne({name: praia }, function (err, query) {


        users.findOne({id: user_id }, function (err, user) {

            uploadToImgur(url_to_file, function(link){
                var newphoto = new photo({
                    name : link,
                    user: user
                });

                newphoto.save();

                beach.findByIdAndUpdate(query, { $push: { photos: newphoto }}, function (err, photo) {
                });
            });
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

