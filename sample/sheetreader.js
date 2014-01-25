var SheetReader = require('../lib/reader/xlsx/sheet').SheetReader;
var sheeter_utils = require('../lib/utils/utils');
var fs = require('fs');
var path = require('path');
var start = (new Date()).getTime();
var sax = require('sax');
var XSAX = require('./testparser').XSAX;
var xsax = new XSAX();
var end;

var d = fs.readFileSync(path.join(__dirname,'..','tmp','xl','worksheets','sheet1.xml'));
end = (new Date()).getTime();
console.log('done ',(end-start)/1000,'ms');
start = (new Date()).getTime();
xsax.on('tag',function(stack,tag){
    //if (tag=='t'){
       //console.log(tag,stack);
       //console.log(stack[stack.length-1].value);
    //}
})
xsax.parse(d);


end = (new Date()).getTime();
console.log('done ',(end-start)/1000,'s');

start = (new Date()).getTime();
parser = sax.parser(true);
parser.write(d.toString()).close();
end = (new Date()).getTime();
console.log('done ',(end-start)/1000,'s');
