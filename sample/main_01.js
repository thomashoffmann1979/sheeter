var path =  require('path'),
    sheeter,
    Sheeter = require('../lib/main').Sheeter;



sheeter = new Sheeter();
sheeter.on('opened',function(wb){
    wb.output();
});
sheeter.open(path.join(__dirname,'sample_01.xlsx'));