var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var beach = require('../models/beach.js');

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

        var http = require("http");

        var request = http.get(url, function (response) {
            // data is streamed in chunks from the server
            // so we have to handle the "data" event
            var buffer = "",
                data,
                route;

            response.on("data", function (chunk) {
                buffer += chunk;
            });

            response.on("end", function (err) {
                // finished transferring data
                // dump the raw data

                data = JSON.parse(buffer);

                var results = [];


                console.log(data["rows"][0]["elements"]);

                //rows = JSON.parse(data["rows"]);





                for(var i=0; i<data["rows"][0]["elements"].length;i++){


                    console.log("fora");
                    console.log(data["rows"][0]["elements"][i]["distance"]["value"]);
                    if (data["rows"][0]["elements"][i]["distance"]["value"]<20000){

                        console.log("entrou");
                        results.push(todos[i]);

                    }

                }

                res.json(results);

                // extract the distance and time

            });
        });


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