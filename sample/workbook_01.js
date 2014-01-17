var Workbook = require('../lib/workbook/workbook').Workbook;
var sheeter_utils = require('../lib/utils/utils');

console.log(sheeter_utils.isCellNotation('[Table 1]!A1'));
console.log(sheeter_utils.rangeToArray('[Table 1]!A1:[Table 1]!A5'));

var workbook = new Workbook();
var sheet = workbook.createWorkSheet();

sheet.getCell('A1',{value: 5});
sheet.getCell('A2',{value: 4});
sheet.getCell('A3',{value: 5});
sheet.getCell('A4',{value: 5});
sheet.getCell('A5',{value: 5});

//var cell = sheet.getCell('A6',{formula:'=IF(1=2;1;2)'});
cell = sheet.getCell('A6',{formula:'=IF(1=2;[Table 1]!A1;[Table 1]!A2)'});
//cell.formula = '=IF(1<>2;1;2)';

//console.log(sheet.getCell('A6').worksheet);
console.log(sheet.getCell('A6').value);
//console.log(sheet);