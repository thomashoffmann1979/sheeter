var SheetReader = require('../lib/reader/xlsx/sheet').SheetReader;
var sheeter_utils = require('../lib/utils/utils');
var fs = require('fs');
var path = require('path');
var start = (new Date()).getTime();
var SAX = require('./testparser').XSAX;
var sax = new SAX();
var end;
/*
var reader = new SheetReader();
var d = fs.readFileSync(path.join(__dirname,'..','tmp','xl','worksheets','sheet1.xml'));
reader.data = d.toString();
reader.on('debug',function(t){
    console.log(t);
})
reader.on('ready',function(){
    var end = (new Date()).getTime();
    console.log('done ',(end-start)/1000,'ms');
});
reader.parse();
*/
var d = fs.readFileSync(path.join(__dirname,'..','tmp','xl','worksheets','sheet1.xml'));
end = (new Date()).getTime();
console.log('done ',(end-start)/1000,'ms');

sax.on('tag',function(path,tag){
    //if (tag=='row'){
        //console.log(tag);
        
    //}
})
sax.parse(d);

end = (new Date()).getTime();
console.log('done ',(end-start)/1000,'ms');
