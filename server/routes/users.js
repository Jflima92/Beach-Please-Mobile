var express = require('express');
var router = express.Router();
var user = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
})

router.get('/:id', function(req, res) {
  user.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

router.post('/verify', function(req, res) {
var name = req.body.name;
  var _id = req.body.id;

  /*user.findById(req.body.fbid, function (err,post) {
    if (err) res.json(err);
/*
    if(err){
      var insertuser = new user({
        name: name,
        id: _id
      });
      insertuser.save();
      res.send("new user inserted");
    }
    res.json(post);
    res.send(post);
  });*/


  user.find({id : _id }, function (err, docs) {
    // docs is an array
    if (err) res.send("erro");
    if(docs.length==0){
      var insertuser = new user({
        name: name,
        id: _id
      });
      insertuser.save();
      res.send("new user inserted");
    }
    else res.send("already exists");
  });
});

module.exports = router;
