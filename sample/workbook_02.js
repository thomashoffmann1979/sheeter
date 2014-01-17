var Workbook = require('../lib/workbook/workbook').Workbook;


var workbook = new Workbook();
var sheet = workbook.createWorkSheet();

sheet.getCell('A1',{value: 5});
sheet.getCell('A1').value=5;
sheet.getCell('A2',{value: 5});
sheet.getCell('A3',{value: 5});
sheet.getCell('A4',{value: 5});
sheet.getCell('A5',{value: 5});
sheet.getCell('A6',{formula:'=SUM(A1:A5)'});
console.log(sheet.getCell('A6').value);

sheet.getCell('A7',{formula:'=AVG(A1:A5)'});
console.log(sheet.getCell('A7').value);