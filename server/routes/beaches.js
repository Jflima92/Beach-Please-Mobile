var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var beach = require('../models/beach.js');
var beach = require('../models/weatherCond.js');
var request = require('request');

/* GET /todos listing. */
router.get('/', function(req, res, next) {
    beach.find(function (err, todos) {
        if (err) return next(err);

        var coords= "";

        for(i=0;i<todos.length-1;i++){
            coords += todos[i]["lat"] + ","+todos[i]["lng"]+ "|" ;
        }

        coords += todos[todos.length-1]["lat"] + ","+todos[todos.length-1]["lng"] ;

        var url = "http://maps.googleapis.com/maps/api/distancematrix/json?origins=" + "41.1778751,-8.597915999999941"+ "&destinations="+ coords;

        var cenas ={
            "coords": coords,
            "url": url
        };

        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                data = JSON.parse(body);

                var results = [];

                console.log(data["rows"][0]["elements"]);

                //Verifies de query to the beaches and applies it, according to the max distance chosen : localhost:3000/beaches?dist=10000
                if (req.query.dist != undefined) {

                    for (var i = 0; i < data["rows"][0]["elements"].length; i++) {

                        console.log("fora");
                        console.log(data["rows"][0]["elements"][i]["distance"]["value"]);

                        if (data["rows"][0]["elements"][i]["distance"]["value"] < req.query.dist) {
                            console.log("entrou");
                            results.push(todos[i]);

                        }
                    }
                }
                else{
                    results = todos;  //if no queries are sent in url, return all available beaches
                }
                    console.log(results);

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

module.exports = router;