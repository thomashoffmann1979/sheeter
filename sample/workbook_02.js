var Workbook = require('../lib/workbook/workbook').Workbook;


var workbook = new Workbook();
var sheet = workbook.createWorkSheet();

sheet.getCell('A1',{value: 5});
sheet.getCell('A1').value=1;
sheet.getCell('A2',{value: 5});
sheet.getCell('A3',{value: 5});
sheet.getCell('A4',{value: 5});
sheet.getCell('A5',{value: 5});
sheet.getCell('A6',{formula:'=SUM(A1:A5)'});
console.log(sheet.getCell('A6').value);

sheet.getCell('A7',{formula:'=AVERAGE(A1:A5)'});
console.log(sheet.getCell('A7').value);

sheet.getCell('A7').formula ='=AVERAGE(A1;A4;A5)';
console.log(sheet.getCell('A7').value);


sheet.getCell('A8').formula ='=Max(A1;A2)';
console.log(sheet.getCell('A8').value);

sheet.getCell('A9').formula ='=Min(A1:A2)';
console.log(sheet.getCell('A9').value);
