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

eventEmitter.on('connecteded', function () {

    var Schema  = mongoose.Schema;
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

    processes   = mongoose.model('processes',   processesSchema);

    var process_Tmp    = {
        paperID: '123',
        category: '请假',
        detail: '',
        brief: 'XXX 请假 N 天',
        status: '<span class="label label-warning">pending</span>',
        startDate: '2016年3月15日',
        priority: '中',
        schedule: '10%',
        nowOperator: '874588994@qq.com'
    };

    var process = [];
    for(var i = 0; i < 100; i++)
    {
        process[i] = new processes(process_Tmp);
    }
    process_Tmp.schedule = '70%';
    process_Tmp.nowOperator = 'root@qq.com';
    for(var i = 100; i < 200; i++)
    {
        process[i] = new processes(process_Tmp);
    }

    for(var i = 0; i < 200; i++){
        process[i].save(function(err){
            if(err) console.log(err);
        });
        console.log('save succ ' + i);
    }
});
