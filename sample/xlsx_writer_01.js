var XLSXReader = require('../lib/reader/xlsxreader').XLSXReader,
    XLSXWriter = require('../lib/writer/xlsxwriter').XLSXWriter,
    path =  require('path'),
    writer,
    Workbook = require('../lib/workbook/workbook').Workbook,
    workbook = new Workbook(),
    sheet = workbook.createWorkSheet(),
    Zip = require('adm-zip');
sheet.title = 'Blatt1';
sheet.getCell('A1',{value: 1});
sheet.getCell('B1',{value: 2});
/*
sheet.getCell('A1').value=1;
sheet.getCell('A2',{value: 5});
sheet.getCell('A3',{value: 5});
sheet.getCell('A4',{value: 5});
sheet.getCell('A5',{value: 5});
sheet.getCell('A6',{formula:'=SUM(A1:A5)'});
sheet.getCell('A7',{formula:'=AVERAGE(A1:A5)'});
sheet.getCell('A7').formula ='=AVERAGE(A1;A4;A5)';
sheet.getCell('A8').formula ='=Max(A1;A2)';
sheet.getCell('A9').formula ='=Min(A1:A2)';
sheet.getCell('B1').value ='My Sample Text';
*/
/*
sheet = workbook.createWorkSheet();
sheet.getCell('A1',{value: 99});
*/
writer = new XLSXWriter({
    filename: path.join(path.sep,'tmp','test4.xlsx'),
    workbook: workbook
});

writer.save();

var zip = new Zip(path.join(path.sep,'tmp','test4.xlsx'));
zip.extractAllTo('/tmp/test4',true);
    
/*
reader = new XLSXReader({
    filename: writer.filename,
    workbook: new Workbook()
});

reader.on('sheetsReady', function(){
    var list = reader.workbook.getSheetList(),
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
*/