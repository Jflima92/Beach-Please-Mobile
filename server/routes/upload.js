var express = require('express');
var router = express.Router();
var multer = require('multer');


router.get('/', function(req, res) {

    res.send("api");

});

router.post('/', [ multer({ dest: './uploads/'}), function (req, res) {
    console.log(req.body);
    console.log(req.files)
    res.sendStatus(200);
}]);

module.exports = router;