var XLSXReader = require('../lib/reader/xlsxreader').XLSXReader,
    path =  require('path'),
    reader,
    Workbook = require('../lib/workbook/workbook').Workbook;


reader = new XLSXReader({
    filename: path.join(__dirname,'sample_01.xlsx'),
    workbook: new Workbook()
});

reader.on('sheetsReady', function(){
    var list = reader.workbook.getWorkSheetList(),
        i,
        m,
        r;
    
    for(i in list){
        m = list[i].getMatrixByRow({nice:true,header:true,rows:true});
        console.log(list[i].title+':');
        for( r in m ){
            console.log('|'+m[r].join('|')+'|');
            if ( i == 0){
                
            }
        }
    }

});

reader.open({},function(err){
    if (err) throw err;
    //console.log('done');
});