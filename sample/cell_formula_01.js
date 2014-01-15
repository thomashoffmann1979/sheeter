var Cell = require('../lib/cell/cell').Cell;
var formulas = require('../lib/formulas/formulas');
var Worksheet = require('../lib/worksheet/worksheet').Worksheet;

var v = formulas.parse('=IF(A1<B2;1;2)');
//var v = formulas.parse('= A1 - B2+SUM( A2:D2 ) + 18 + A1*B2 + A4+(A5*A3) + IF(A1<>B2;1;2)');
console.log(v);
formulas.execute(v);
// Testing a really simple formula
/*
if (false){
	var singleCell = new Cell({
		id: 'C1',
		formula: '=100+B1+SUM(C2:C5)+(A1*A2)'
	})
}

var worksheet = new Worksheet({
	id: 'myWorksheet',
	title: 'My Worksheet'
});

var B1 = worksheet.getCell('B1');
B1.value = 99;

var B2 = worksheet.getCell('B2');
B2.formula = '=100+B1+SUM(C2:C5)*(A1*A2)';
*/