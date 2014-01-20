var XLSXReader = require('../lib/reader/xlsxreader').XLSXReader,
    path =  require('path'),
    reader;


reader = new XLSXReader({
    filename: path.join(__dirname,'sample_01.xlsx')
});

reader.open({},function(err){
    if (err) throw err;
    //console.log('done');
});

