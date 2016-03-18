var express = require('express');
var loginchecks = require('../database/db').loginchecks;
var crypto  = require('crypto');
var router  = express.Router();

// 展示的登录界面
router.get('/login', function(req, res, next){
    res.render('login', {loginfailed:'no'});
});

// 处理登录表单
router.post('/login', function(req, res, next){
    var passHashed  = crypto.createHash('md5').update(req.body.password).digest('hex');
    var query_doc   = { username: req.body.username,
                        password: passHashed};

    loginchecks.find(query_doc, function(err, doc){
        if(doc.length != 0){
            console.log(query_doc.username + ": login success at " + new Date());
            req.session.nickname = doc[0].nickname;
            req.session.username = doc[0].username;
            req.session.logopath = doc[0].logopath;

            if(req.body.autologin){
                req.session.cookie.maxAge   = 1000 * 60 * 60 * 24 * 7; // 7天
            }

            res.redirect('/');
        }else{
            console.log(query_doc.username + ": login failed at " + new Date());
            res.render('login', {loginfailed:'yes'})
        }
    });
});

// 登出
router.get('/logout', function(req, res, next){
    req.session.destroy();
    res.redirect('/login');
});

// 展示的注册界面
router.get('/register', function(req, res, next){
    res.render('register', {registerfailed:'no'});
});

// 处理注册表单
router.post('/register', function(req, res, next){
    var passHashed  = crypto.createHash('md5').update(req.body.password).digest('hex');
    var query_doc = {username: req.body.username};
    loginchecks.count(query_doc, function(err, doc){
        if(doc == 0){
            var newAccount  = new loginchecks({
                username: req.body.username,
                password: passHashed,
                nickname: req.body.nickname
            });
            newAccount.save(function(err){
                if(err)
                    console.log("save faild");
                else
                    console.log('save succ');
            });

            req.session.nickname = req.body.nickname;
            req.session.username = req.body.username;
            req.session.logopath = newAccount.logopath;
            res.redirect('/');
        }else{
            res.render('register', {registerfailed:'yes'});
        }
    });
});


module.exports = router;
