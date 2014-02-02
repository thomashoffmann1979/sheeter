var Workbook = require('../lib/workbook/workbook').Workbook;


var workbook = new Workbook();
var sheet = workbook.createWorkSheet();
sheet.on('formulaError',function(evt){
	console.log('formulaError',evt);
});
sheet.on('formulaSyntaxError',function(evt){
	console.log('formulaSyntaxError',evt);
});
var cell;
sheet.getCell('A2').value=5;
sheet.getCell('A2').value=2;
sheet.getCell('A3').value=3;
cell = sheet.getCell('B4');
cell.on('changed',function(evt){
	console.log(evt.cell.id,'changed to',evt.cell.value);
});
cell.formula ='=INDIRECT("A" & 2)';

workbook.output({nice:true});
