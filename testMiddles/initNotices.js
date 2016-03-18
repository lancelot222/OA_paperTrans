var mongoose    = require('mongoose');
var config  = require('../config')
var fs = require("fs");
var markdown    = require( "markdown" ).markdown;

var buf = new Buffer(1024);
var buf2 = new Buffer(1024);

mongoose.connect(config.dataDb);
var db  = mongoose.connection;

var events = require('events');
// 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log('connection completed');
    eventEmitter.emit('connecteded');
});

eventEmitter.on('connecteded', function () {
    var Schema  = mongoose.Schema;
    var noticesSchema   = new Schema({
        noticeID:   String,
        category:   String,
        detail:     String,
        title:      String,
        startDate:  String
    });
    notices     = mongoose.model('notices',     noticesSchema);

    var f1 = '';
    fs.open('faq.md', 'r+', function(err, fd){
        fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
            if(bytes > 0){
               f1 += buf.slice(0, bytes).toString();
            }
            fs.close(fd);
            var faq = new notices({
                noticeID:   '1',
                category:   '注意',
                detail:     markdown.toHTML(f1),
                title:      '<a href="/notice/1">《FAQ》</a>',
                startDate:  '2016-03-15 14:39:28'
            });
            faq.save(function(err){
                if(!err) console.log('save succ');
            });
        });
    });

    var f2 = '';
    fs.open('structure.md', 'r+', function(err, fd){
        fs.read(fd, buf2, 0, buf2.length, 0, function(err, bytes){
            if(bytes > 0){
               f2 += buf2.slice(0, bytes).toString();
            }
            fs.close(fd);
            var struc = new notices({
                noticeID:   '2',
                category:   '重要',
                detail:     markdown.toHTML(f2),
                title:      '<a href="/notice/2">《公司组织职能架构公示》</a>',
                startDate:  '2016-03-15 14:39:27'
            });
            struc.save(function(err){
                if(!err) console.log('save succ');
            });
        });
    });

});
