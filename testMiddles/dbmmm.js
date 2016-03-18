var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
    console.log('connection completed');
});

var kidsSchema = mongoose.Schema({
    name:   String,
    sex:    String
});

var kids    = mongoose.model('kids', kidsSchema);

var kid_xm  = new kids({name:'Xiao Ming', sex: 'Nan'});
var kid_xh  = new kids({name:'Xiao Hua',  sex: 'Nv'});

kid_xm.save(function(err){
    if(err) console.log('save error!!!!!!!');
});
kid_xh.save();
