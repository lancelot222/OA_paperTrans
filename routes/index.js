var express = require('express');
var profiles    = require('../database/db').profiles;
var loginchecks = require('../database/db').loginchecks;
var processes   = require('../database/db').processes;
var notices     = require('../database/db').notices;
var tables      = require('../database/db').tables;
var workflows   = require('../database/db').workflows;
var marked      = require( "marked" );
var formidable  = require('formidable'), util = require('util');
var uuid    = require('node-uuid');
var moment  = require('moment');
var fs      = require("fs");
var config  = require('../config');

var router = express.Router();

var loginfilter  = function(req, res, next){
    var session = req.session
    if(session.nickname){
        next();
    }else{
        res.render('login');
    }
};

/* GET home page. */
router.get('/', loginfilter, function(req, res, next) {
    res.render('worktop', {
        nickname: req.session.nickname,
        logopath: req.session.logopath,
        active: 'worktop'
    });
});

router.get('/notice', loginfilter, function(req, res, next){
    res.render('notice', {
        nickname: req.session.nickname,
        logopath: req.session.logopath,
        active: 'notice'
    });
});

router.get('/notice/:id', loginfilter, function(req, res, next){
    notices.findOne({noticeID: req.params.id}, function(err, doc){
        if(doc)
            res.render('notice_detail', {
                nickname: req.session.nickname,
                logopath: req.session.logopath,
                active: 'notice',
                notice_title: doc.title,
                notice_content: doc.detail
            });
        else
            res.json({result: 'Nothing founded'});
    });
});

router.post('/notice_upload', loginfilter, function(req, res, next){
    var str_id  = uuid.v1();
    var notice  = new notices({
        noticeID:   str_id,
        category:   req.body.notice_category,
        detail:     marked(req.body.notice_content),
        title:      '<a href="/notice/' + str_id + '">' + req.body.notice_title + '</a>',
        startDate:  moment().format('YYYY-MM-DD HH:mm:ss')
    });
    notice.save(function(err){
        res.redirect('/notice');
    });
});

router.get('/processAgree', loginfilter, function(req, res, next){
    console.log(req.session.nowHandleProcessID);
    processes.findOne({processID: req.session.nowHandleProcessID}, function(err, process){
        if(process){
            var schedule    = process.schedule.split(',');
            var stepsCnt    = schedule.length;
            var nextStep    = parseInt(process.nextStep);
            process.progress= process.nextStep + "/" + stepsCnt.toString();
            if(nextStep < stepsCnt){ // 还有流程节点
                profiles.findOne({username: process.startUser}, function(err, profile){
                    var pos = profile.position;
                    if(schedule[nextStep] == "1"){
                        if(parseInt(pos) == "0")
                            pos = "131";
                        else if(parseInt(pos) <= 14)
                            pos = "11";
                        else if(parseInt(pos) <= 100)
                            pos = "1" + pos;
                        else
                            pos = pos.substring(0,2);
                    }else {
                        pos = schedule[nextStep];
                    }
                    process.nowOperator = pos;
                    process.status      = "待 " + config.positionJson[pos] + " 审批";
                    process.nextStep = (nextStep+1).toString();
                    console.log(process);
                    processes.update({processID:req.session.nowHandleProcessID}, process, function(err) {
                        if(err) console.log(err);
                        else res.redirect('/');
                    });
                });
            }else {  //已经走完所有流程节点
                process.status      = "待 流程发起人 确认";
                process.nowOperator = process.startUser;
                process.nextStep    = "-1";
                processes.update({processID:req.session.nowHandleProcessID}, process, function(err) {
                    if(err) console.log(err);
                    else res.redirect('/');
                });
            }
        }
    });
});

router.get('/processRegect', loginfilter, function(req, res, next){
    processes.findOne({processID: req.session.nowHandleProcessID}, function(err, process){
        if(process){
            process.status      = "被 " + config.positionJson[process.nowOperator] + " 拒绝申请";
            process.nowOperator = process.startUser;
            process.nextStep    = "-2";
            processes.update({processID: req.session.nowHandleProcessID}, process, function(err) {
                if(err) console.log(err);
                else res.redirect('/');
            });
        }
    });
});

router.get('/processCheck', loginfilter, function(req, res, next){
    processes.findOne({processID: req.session.nowHandleProcessID}, function(err, process){
        if(process){
            if(process.nextStep == "-1")
                process.status = "流程完毕 全部通过";
            process.nextStep = "-3";
            process.progress = "done";
            processes.update({processID: req.session.nowHandleProcessID}, process, function(err) {
                if(err) console.log(err);
                else res.redirect('/');
            });
        }
    });
});

router.get('/approve/:id', loginfilter, function(req, res, next){
    req.session.nowHandleProcessID = req.params.id;
    processes.findOne({processID: req.params.id}, function(err, process){
        if(process){
            tables.findOne({tableID: process.tableID}, function(err, table){
                if(table){
                    var canHandle = "F", wait4check = "F";
                    if(process.nowOperator == req.session.position)
                        canHandle = "T";
                    if(process.nextStep == "-1" || process.nextStep == "-2")
                        wait4check = "T";
                    res.render('approve_detail', {
                        nickname:   req.session.nickname,
                        logopath:   req.session.logopath,
                        active:     'approve',
                        table_title:    table.title,
                        table_content:  table.detail,
                        data:       JSON.stringify(process.data),
                        canHandle:  canHandle,
                        wait4check: wait4check
                    });
                }
            });
        }else
            res.json({result: 'Nothing founded'});
    });
});

router.post('/approve_upload', loginfilter, function(req, res, next){
    var str_id  = uuid.v1();

    var process = new processes({
        processID:  str_id,
        tableID:    req.session.table_tableID,
        category:   req.session.table_category,
        data:       req.body,
        title:      "",
        status:     "",
        startDate:  moment().format('YYYY-MM-DD HH:mm:ss'),
        startUser:  req.session.username,
        schedule:   "",
        progress:   "",
        nowOperator:"",
        nextStep:   "1"
    });

    workflows.findOne({workflowID: req.session.workflow_workflowID}, function(err, workflow) {
        if(err){
            console.log(err);
            res.redirect('/');
        }else {
            schedule = workflow.detail.split(',');
            process.schedule    = workflow.detail;
            process.progress    = "0/" + (process.schedule.split(',').length.toString());
            var pos = req.session.position;
            if(schedule[0] == "1"){
                if(parseInt(pos) == "0")
                    pos = "131";
                else if(parseInt(pos) <= 14)
                    pos = "11";
                else if(parseInt(pos) <= 100)
                    pos = "1" + pos;
                else
                    pos = pos.substring(0,2);
            }else{
                pos = schedule[0];
            }
            process.nowOperator = pos;
            process.status      = "待 " + config.positionJson[pos] + " 审批";
            process.title       = '<a href="/approve/' + str_id + '">' + workflow.title + '</a>';

            process.save(function(err){
                res.redirect('/');
            });
        }
    });
});

router.get('/approve', loginfilter, function(req, res, next){
    res.render('approve', {
        nickname: req.session.nickname,
        logopath: req.session.logopath,
        active: 'approve'
    });
})

router.get('/archive', loginfilter, function(req, res, next){
    res.render('archive', {
        nickname: req.session.nickname,
        logopath: req.session.logopath,
        active: 'archive'
    });
})

// 展示关于页面
router.get('/about', loginfilter, function(req, res, next) {

    var rmd = function(doc) {
        res.render('about', {
            nickname:   req.session.nickname,
            position:   config.positionJson[doc.position],
            personinfo: marked(doc.personinfo),
            mainwork:   marked(doc.mainwork),
            teamwork:   marked(doc.teamwork),
            skilllist:  marked(doc.skilllist),
            backpath:   doc.backpath,
            logopath:   req.session.logopath});
    }

    profiles.find({username:req.session.username}, function(err, docs){
        if(docs.length != 0){
            rmd( docs[0] );
        }else{
            profiles.find({username: config.defaultSearchUsername}, function(err, docs){
                if(docs.length != 0){
                    rmd( docs[0] );
                }else{
                    console.log('Default profile NOT found!!!!!!!!!!!!!')
                    res.redirect('/');
                }
            });
        }
    });
});

// 设置关于界面的展示
router.get('/setting', loginfilter, function(req, res, next){

    var rmd = function(doc) {
        res.render('setting', {
            nickname:   req.session.nickname,
            logopath:   req.session.logopath,
            active:     'setting',
            // 以下是setting展示，用以更改参考 markdown原文
            position:   config.positionJson[doc.position],
            personinfo: doc.personinfo,
            mainwork:   doc.mainwork,
            teamwork:   doc.teamwork,
            skilllist:  doc.skilllist});
    }

    profiles.find({username:req.session.username}, function(err, docs){
        if(docs.length != 0){
            rmd( docs[0] );
        }else{
            profiles.find({username: config.defaultSearchUsername}, function(err, docs){
                if(docs.length != 0){
                    rmd( docs[0] );
                }else{
                    console.log('Default profile NOT found!!!!!!!!!!!!!')
                    res.redirect('/');
                }
            });
        }
    });
});

// 设置相关信息的修改
router.post('/setting_upload', loginfilter, function(req, res, next){
    var form = new formidable.IncomingForm();
    form.uploadDir = config.tmpUploadDir;
    form.keepExtensions = true;	 //保留后缀

    form.parse(req, function(err, fields, files) {
        var query_json  = {username: req.session.username};
        var profileJson = {username: req.session.username};
        var loginJson   = {username: req.session.username};

        if(files.logoup.size != 0){
            var strsLogo = files.logoup.path.split(/[\\;\/]/);
            var newLogoPos = form.uploadDir + 'logoups/' + strsLogo[strsLogo.length-1];
            fs.renameSync(files.logoup.path, newLogoPos);
            loginJson.logopath = config.logoStoreDir + strsLogo[strsLogo.length-1];
            profileJson.logopath = loginJson.logopath;
            req.session.logopath = loginJson.logopath;
        }else
            fs.unlink(files.logoup.path);

        if(files.backup.size != 0){
            var strsBack = files.backup.path.split(/[\\;\/]/);
            var newBackPos = form.uploadDir + 'backups/' + strsBack[strsBack.length-1];
            fs.renameSync(files.backup.path, newBackPos);
            profileJson.backpath = config.backStoreDir + strsBack[strsBack.length-1];
        }else
            fs.unlink(files.backup.path);

        for (var md_name in fields)
            profileJson[md_name] = fields[md_name];

        console.log('----------------loginchecks-changed------------------');
        console.log(loginJson);
        console.log('-----------------------------------------------------');
        console.log('------------------profile-changed--------------------');
        console.log(profileJson);
        console.log('-----------------------------------------------------');

        loginchecks.update(query_json, loginJson, function(err){
            if(err) console.log(err);
        });
        profiles.count(query_json, function(err, cnt){
            if(cnt){
                profiles.update(query_json, profileJson, function(err){
                    if(err) console.log(err);
                });
            }else{
                var profile = new profiles(profileJson);
                profile.save();
            }
        });
        res.redirect('/setting');
    });
});

router.get('/tableDesign', function(req, res, next){
    tables.find({})
          .select('tableID title category -_id')
          .exec(function(err, docs) {
              res.render('tableDesign', {
                  nickname: req.session.nickname,
                  logopath: req.session.logopath,
                  active: 'tableDesign',
                  tables: docs
              });
          });
});

router.post('/tableDesign', function(req, res, next){
    console.log('--------------------------- tableDesign in');
    console.log(req.body.tableTitle);
    console.log(req.body.tableCategary);
    console.log(req.body.tableContent);
    console.log('--------------------------- tableDesign out');

    var str_id  = uuid.v1();
    var table  = new tables({
        tableID:    str_id,
        title:      req.body.tableTitle,
        category:   req.body.tableCategary,
        detail:     req.body.tableContent,
        link:       '<a href="/table/' + str_id + '">发起申请</a>'
    });
    table.save(function(err){
        if(err) console.log(err);
    });
});

router.get('/workflowDesign', loginfilter, function(req, res, next){
    tables.find({})
          .select('tableID title category -_id')
          .exec(function(err, docs) {
              res.render('workflowDesign', {
                  nickname: req.session.nickname,
                  logopath: req.session.logopath,
                  active: 'workflowDesign',
                  tables: docs,
                  posJson: JSON.stringify(config.positionJson)
              });
          });
});

router.post('/workflowDesign', loginfilter, function(req, res, next){
    console.log('--------------------------- workflowDesign in');
    console.log(req.body.workflowTitle);
    console.log(req.body.workflowCategary);
    console.log(req.body.workflowDetail);
    console.log(req.body.tableID);
    console.log('--------------------------- workflowDesign out');

    var str_id  = uuid.v1();
    var workflow  = new workflows({
        workflowID: str_id,
        tableID:    req.body.tableID,
        title:      req.body.workflowTitle,
        category:   req.body.workflowCategary,
        detail:     req.body.workflowDetail,
        link:       '<a href="/workflow/' + str_id + '">发起流程</a>'
    });
    workflow.save(function(err){
        if(err) console.log(err);
    });
});

router.get('/workflow/:id', loginfilter, function(req, res, next){
    workflows.findOne({workflowID: req.params.id}, function(err, doc){
        if(doc){
            req.session.workflow_workflowID = doc.workflowID;
            res.redirect('/table/' + doc.tableID);
        }
    });
});

router.get('/table/:id', loginfilter, function(req, res, next){
    tables.findOne({tableID: req.params.id}, function(err, doc){
        if(doc){
            req.session.table_title     = doc.title;
            req.session.table_category  = doc.category;
            req.session.table_tableID   = doc.tableID;

            res.render('table_detail', {
                nickname: req.session.nickname,
                logopath: req.session.logopath,
                active:   'worktop',
                table_title:    doc.title,
                table_category: doc.category,
                table_content:  doc.detail
            });
        }else
            res.json({result: 'Nothing founded'});
    });
});


module.exports = router;
