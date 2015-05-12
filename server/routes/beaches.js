var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var beach = require('../models/beach.js');

/* GET /todos listing. */
router.get('/', function(req, res, next) {
    beach.find(function (err, todos) {
        if (err) return next(err);
        res.json(todos);
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