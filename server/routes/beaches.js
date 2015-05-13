var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var beach = require('../models/beach.js');
var weatherCond = require('../models/weatherCond.js');
var request = require('request');

/* GET /todos listing. */
router.get('/', function(req, res, next) {
    beach.find(function (err, todos) {
        if (err) return next(err);

        var coords= "";

        for(var u =0;u<todos.length-1;u++){
            coords += todos[u]["lat"] + ","+todos[u]["lng"]+ "|" ;
        }

        coords += todos[todos.length-1]["lat"] + ","+todos[todos.length-1]["lng"] ;

        var url;

        if(req.query.lat != undefined && req.query.long!= undefined){
            url = "http://maps.googleapis.com/maps/api/distancematrix/json?origins=" + req.query.lat + "," + req.query.long + "&destinations="+ coords;
        }
        else{
            url = "http://maps.googleapis.com/maps/api/distancematrix/json?origins=" + "41.1778751,-8.597915999999941"+ "&destinations="+ coords;
        }

        var cenas ={
            "coords": coords,
            "url": url
        };

        request(url, function (error, response, body) {

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
                                "dist": dist
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
                                "dist": dist
                            });
                        }
                    }
                }

                results.sort(function(a,b) { return b.dist - a.dist } );

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


            if(cond["temperature"] == undefined){
                var url ="http://api.worldweatheronline.com/free/v2/marine.ashx?q="+beach["lat"]+"%2C"+beach["lng"]+"&format=json&includelocation=yes&key=f481a5493db3b99e22c792d558eae";
                request(url, function (error, response, apiret) {
                    if (!error && response.statusCode == 200) {
                        data2 = JSON.parse(apiret);
                        console.log(data2["data"]["weather"][0]["hourly"][0]["waterTemp_C"]);
                        console.log(data2["data"]["weather"][0]["hourly"][0]["tempC"]);

                        res.json(apiret);
                    }else
                        res.json(apiret);
                });

            }
        });
    });
});

module.exports = router;