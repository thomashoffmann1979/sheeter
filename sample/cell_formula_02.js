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
cell = sheet.getCell('A1');
cell.on('changed',function(evt){
	//console.log(evt.cell.id,'changed to',evt.cell.value);
})
cell.value=5;

sheet.getCell('A2').value=2;
sheet.getCell('A3').value=3;
cell = sheet.getCell('A4');

cell.on('changed',function(evt){
	console.log(evt.cell.id,'changed to',evt.cell.value);
});

cell.formula ='=A3+(A1*A2)';



sheet.getCell('A1').value=1;
sheet.getCell('A2').value=3;

cell.formula ='=A3*A1+A2';

/*
var str = '= if(1<>2;1;0) ';
var v = formulas.parse(str);
console.log('calculating "'+str+'", the result is: '+formulas.execute({
	
},v) );
*/
