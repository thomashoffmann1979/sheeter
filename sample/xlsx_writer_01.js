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
sheet.getCell('B3',{value: 5});

writer = new XLSXWriter({
    filename: path.join(path.sep,'tmp','test.xlsx'),
    workbook: workbook
});
writer.on('ready',function(){
    console.log('Done.');
})
writer.save();
