var SheetReader = require('../lib/reader/xlsx/sheet').SheetReader;
var sheeter_utils = require('../lib/utils/utils');
var fs = require('fs');
var path = require('path');
var start = (new Date()).getTime();
var SAX = require('./testparser').XSAX;
var sax = new SAX();
var end;

var d = fs.readFileSync(path.join(__dirname,'..','tmp','xl','worksheets','sheet1.xml'));
end = (new Date()).getTime();
console.log('done ',(end-start)/1000,'ms');

sax.on('tag',function(stack,tag){
    if (tag=='t'){
       //console.log(tag,stack);
       //console.log(stack[stack.length-1].value);
    }
})
sax.parse(d);

end = (new Date()).getTime();
console.log('done ',(end-start)/1000,'ms');
