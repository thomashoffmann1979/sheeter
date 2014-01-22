var SheetReader = require('../lib/reader/xlsx/sheet').SheetReader;
var sheeter_utils = require('../lib/utils/utils');
var fs = require('fs');
var path = require('path');


var reader = new SheetReader();
var d = fs.readFileSync(path.join(__dirname,'..','tmp','xl','worksheets','sheet1.xml'));
reader.data = d.toString();
var start = (new Date()).getTime();
reader.on('debug',function(t){
    console.log(t);
})
reader.on('ready',function(){
    var end = (new Date()).getTime();
    console.log('done ',(end-start)/1000,'ms');
});
reader.parse();

