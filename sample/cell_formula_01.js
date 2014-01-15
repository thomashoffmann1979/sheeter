var Cell = require('../lib/cell/cell').Cell;
var Worksheet = require('../lib/worksheet/worksheet').Worksheet;
// Testing a really simple formula

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
