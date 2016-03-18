var express = require('express');
var profiles    = require('../database/db').profiles;
var loginchecks = require('../database/db').loginchecks;
var processes   = require('../database/db').processes;
var notices     = require('../database/db').notices;
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

// 展示关于页面
router.get('/about', loginfilter, function(req, res, next) {

    var rmd = function(doc) {
        res.render('about', {
            nickname:   req.session.nickname,
            position:   doc.position,
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
            position:   doc.position,
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

module.exports = router;
