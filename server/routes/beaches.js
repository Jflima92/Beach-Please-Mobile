var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var beach = require('../models/beach.js');
var weatherCond = require('../models/weatherCond.js');
var request = require('request');
var comment = require('../models/comment.js');
var usr = require('../models/user.js');
var like = require('../models/like.js');
var async = require('async');
/* GET /todos listing. */
router.get('/', function(req, res, next) {
    beach.find(function (err, todos) {
        if (err) return next(err);
        console.log(todos);
        var coords= "";

        for(var u =0;u<todos.length-1;u++){
            coords += todos[u]["lat"] + ","+todos[u]["lng"]+ "|" ;
        }

        coords += todos[todos.length-1]["lat"] + ","+todos[todos.length-1]["lng"] ;

        var url;

        if(req.query.lat != undefined && req.query.long!= undefined){
            console.log("aqui");
            url = "http://maps.googleapis.com/maps/api/distancematrix/json?origins=" + req.query.lat + "," + req.query.long + "&destinations="+ coords;
            console.log(url);
        }
        else{
            console.log("aquiiii2");
            url = "http://maps.googleapis.com/maps/api/distancematrix/json?origins=" + "41.1778751,-8.597915999999941"+ "&destinations="+ coords;
        }

        var cenas ={
            "coords": coords,
            "url": url
        };

        request(url, function (error, response, body) {
            console.log(url);
            if (!error && response.statusCode == 200) {
                data = JSON.parse(body);

                var results = [];
                var aux = todos.slice();

                //Verifies de query to the beaches and applies it, according to the max distance chosen : localhost:3000/beaches?dist=10000
                if (req.query.dist != undefined) {

                    for (var i = 0; i < data["rows"][0]["elements"].length; i++) {

                        var dist = data["rows"][0]["elements"][i]["distance"]["value"];

                        if (data["rows"][0]["elements"][i]["distance"]["value"] < req.query.dist) {

                            results.push({
                                "_id": aux[i]._id,
                                "name": aux[i].name,
                                "lat": aux[i].lat,
                                "lng": aux[i].lng,
                                "cond": aux[i].cond,
                                "dist": dist,
                                "thumbUrl": aux[i].thumbUrl,
                                "picUrls": aux[i].picUrls
                            });
                        }
                    }
                }
                else{
                    for (var i = 0; i < data["rows"][0]["elements"].length; i++) {

                        var dist = data["rows"][0]["elements"][i]["distance"]["value"];

                        if (data["rows"][0]["elements"][i]["distance"]["value"] < 50000) {

                            results.push({
                                "_id": aux[i]._id,
                                "name": aux[i].name,
                                "lat": aux[i].lat,
                                "lng": aux[i].lng,
                                "cond": aux[i].cond,
                                "dist": dist,
                                "thumbUrl": aux[i].thumbUrl,
                                "picUrls": aux[i].picUrls
                            });
                        }
                    }
                }
                results.sort(function(a,b) { return a.dist - b.dist } );

                res.json(results);
            }
        })
        //res.json(cenas);
    });
});


router.post('/', function(req, res, next) {
    beach.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.get('/:id', function(req, res, next) {
    beach.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.put('/:id', function(req, res, next) {
    beach.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.get('/weatherReq/:id', function(req, res, next) {
    //data2["data"]["weather"][0]["hourly"][0]["waterTemp_C"] temperatura da agua
    beach.findById(req.params.id, function (err, beach) {
        if (err) return next(err);

        weatherCond.findById(beach["cond"], function (err, cond) {

            if(cond["temperature"] == undefined || (Date.now()-cond["time"]>=1800000)){//cond["temperature"] == undefined
                var url ="https://api.worldweatheronline.com/free/v2/marine.ashx?q="+beach["lat"]+"%2C"+beach["lng"]+"&format=json&includelocation=yes&key=f481a5493db3b99e22c792d558eae";
                request(url, function (error, response, apiret) {
                    if (!error && response.statusCode == 200) {
                        data2 = JSON.parse(apiret);
                        console.log(JSON.stringify(data2));

                        var hour =new Date().getHours();
                        var div = (Math.floor((hour)/3));

                        cond.waterTemperature=data2["data"]["weather"][0]["hourly"][div]["waterTemp_C"];
                        cond.temperature=data2["data"]["weather"][0]["hourly"][div]["tempC"];
                        cond.windspeedKmph=data2["data"]["weather"][0]["hourly"][div]["windspeedKmph"];
                        cond.swellHeight_m=data2["data"]["weather"][0]["hourly"][div]["swellHeight_m"];
                        cond.time = Date.now();
                        cond.save(function (err) {
                            if(err) {
                                console.error('ERROR!');
                            } else {
                                res.json(cond);
                            }
                        });
                    }else
                        console.error('ERROR1!');
                });
            }else res.json(cond);
        });
    });
});




router.post('/getFeedMsg', function(req, res) {
    var coursename = req.body.course;
    var messages = [];

    Course.findOne({name : coursename}).exec(function (err, course) {
        Feed.findById(course.feed).populate('messages').exec( function (err, feed) {
            async.forEach(feed.messages, function(item,callback) {
                FeedMessage
                    .populate(item, {'path': 'answers'}, function(err,output){
                        if(err) throw err;
                        callback();
                    });
            }, function(err){
                res.send(feed.messages);
            });
        });
    });
});


router.get('/:name/comments', function(req, res, next) {
    beach.findOne({name:req.params.name}).populate("comments").exec(function(err,beach) {
        if (err) return err;

        async.forEach(beach.comments,function(item,callback){
            comment
                .populate(item, {'path': 'user'}, function(err,output){
                    if(err) throw err;
                    callback();
                });
        },function(error){
            res.send(beach.comments);
        })

    });
});

router.post('/comment', function(req, res) {

    console.log(req.body);
    var _data = req.body.data;
    var _usrid = req.body.usrid;
    var _name = req.body.name;

    usr.findById(_usrid,function(err,userret){
        if(err) return next(err);

        var cenas = new comment({
            name : _name,
            user: userret,
            commenttext : _data
        });
        cenas.save();

        beach.findOneAndUpdate({name:_name},{$push :{comments:cenas}},{safe: true,upsert: true},
            function(err, model) {
                console.log(err);
            });
    })

    res.send("success");
});


router.post('/comment/addlike', function(req, res) {

    var _cmntid = req.body.cmntid;
    var _usrid = req.body.usrid;




    comment.findOne({_id:_cmntid},function(err, model, next){
        if(err) return next(err);
        if(model!=null) {
            var repeated = false;
            var likeid;
            usr.findOne({id: _usrid}, function (err, userret) {
                if (err) return console.log(err);
                if(userret!=null) {
                    model.likes.forEach(function (likee) {
                        if (likee.usr.id == _usrid) {
                            repeated = true;
                            like.findOneAndRemove({_id: likee._id}, function (err) {
                                if (err) return console.log("like remove error");
                            });
                            likeid = likee._id;
                            return;
                        }
                    });

                    if (!repeated) {
                        var _like = new like({
                            usr: userret
                        });

                        _like.save();


                        model.update({$push: {likes: _like}}, {safe: true, upsert: true}, function (err) {
                            if (err) return console.log("erro");
                            res.send((model.likes.length + 1).toString());
                        });


                    }
                    else {
                        model.update({$pull: {likes: {_id: likeid}}}, function (err) {
                            if (err) return console.log("erro");
                            res.send((model.likes.length - 1).toString());
                        });
                    }
                }else {
                    res.send("user not registed");
                }});

        }
        else{
            res.send("comment not found");
        }});

});

router.post('/comment/removecomment', function(req, res) {
    var _cmntid = req.body.cmntid;
    var _usrid = req.body.usrid;

    comment.findOne({_id:_cmntid,'user':_usrid},function(err, model, next) {
        if (err) return next(err);
        console.log(model);


        model.likes.forEach(function (likee) {
            like.findOneAndRemove({_id: likee._id}, function (err) {
                if (err) return console.log("like remove error");
            });
        });
        model.remove();
        res.send("comment removed");
    });
});

module.exports = router;