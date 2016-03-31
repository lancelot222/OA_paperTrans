var express = require('express');
var processes   = require('../database/db').processes;
var notices     = require('../database/db').notices;
var tables      = require('../database/db').tables;
var workflows   = require('../database/db').workflows;
var formidable  = require('formidable'), util = require('util');
var uuid    = require('node-uuid');
var fs      = require("fs");
var config  = require('../config');

var router  = express.Router();

router.get('/not_done_data', function(req, res, next){
    processes.find({ $or: [{nowOperator:req.session.position},
                           {startUser:req.session.username}],
                     $nor:[{progress:'done'}]})
             .select('-_id')
             .exec(function(err, docs){
                 res.json({data: docs});
             });
});

router.get('/approve_data', function(req, res, next){
    processes.find({nowOperator:req.session.position,
                    $nor:[{progress:'done'}]})
             .select('-_id')
             .exec(function(err, docs){
                 res.json({data: docs});
             });
});

router.get('/archive_data', function(req, res, next){
    processes.find({progress:'done', startUser:req.session.username})
             .select('-_id')
             .exec(function(err, docs){
                 res.json({data: docs});
             });
});

router.get('/workflow_data', function(req, res, next){
    workflows.find({})
          .select('-_id -detail -workflowID -tableID')
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
});

router.post('/filedrop', function(req, res, next){

    var form = new formidable.IncomingForm();
    form.uploadDir = config.tmpUploadDir;
    form.keepExtensions = true;	 //保留后缀

    form.parse(req, function(err, fields, files) {
        if(files.filedrop.size != 0){
            var strsdrop = files.filedrop.path.split(/[\\;\/]/);
            var filename = uuid.v1() + strsdrop[strsdrop.length-1];
            var newdropPos = form.uploadDir + 'filedrop/' + filename;
            fs.renameSync(files.filedrop.path, newdropPos);
            res.json({src: config.dropStoreDir + filename});
        }else
            fs.unlink(files.filedrop.path);
    });
});

module.exports = router;
