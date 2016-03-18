var mongoose    = require('mongoose');
var config  = require('../config')

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

var Schema  = mongoose.Schema;
var loginSchema = new Schema({
    username: {type: String, index: true},
    password: String,
    nickname: String,
    logopath: { type: String, default: config.defaultLogopath }
});

var profileSchema = new Schema({
    username:   { type: String, index: true },
    position:   { type: String, default: config.defaultPosition },
    personinfo: String,
    mainwork:   String,
    teamwork:   String,
    skilllist:  String,
    backpath:   { type: String, default: config.defaultBackpath }
});

var processesSchema = new Schema({
    paperID:    String,
    category:   String,
    detail:     String,
    brief:      String,
    status:     String,
    startDate:  String,
    priority:   String,
    schedule:   String,
    nowOperator:String
});

var noticesSchema   = new Schema({
    noticeID:   String,
    category:   String,
    detail:     String,
    title:      String,
    startDate:  String
});

exports.loginchecks = mongoose.model('loginchecks', loginSchema);
exports.profiles    = mongoose.model('profiles',    profileSchema);
exports.processes   = mongoose.model('processes',   processesSchema);
exports.notices     = mongoose.model('notices',     noticesSchema);
