var express = require('express');
var processes   = require('../database/db').processes;
var notices = require('../database/db').notices;
var router  = express.Router();

router.get('/not_done_data', function(req, res, next){
    processes.find({nowOperator:req.session.username})
             .select('-_id')
             .exec(function(err, docs){
                 res.json({data: docs});
             });
});

router.get('/notice_data', function(req, res, next){
    notices.find({})
           .select('-_id')
           .exec(function(err, docs){
               res.json({data: docs});
           });
})

module.exports = router;
