var Workbook = require('../lib/workbook/workbook').Workbook;


var workbook = new Workbook();
var sheet = workbook.createWorkSheet();

sheet.getCell('A1',{value: 5});
sheet.getCell('A2',{value: 5});
sheet.getCell('A3',{value: 5});
sheet.getCell('A4',{value: 5});
sheet.getCell('A5',{value: 5});

var cell = sheet.getCell('A6',{formula:'=IF(1<>2;1;2)'});
//cell.formula = '=IF(1<>2;1;2)';

//console.log(sheet.getCell('A6').worksheet);
console.log(sheet.getCell('A6').value);