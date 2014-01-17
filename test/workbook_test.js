var Workbook = require('../lib/workbook/workbook.js').Workbook;


exports.workbook = {
	simple_formula_calculation: function(test){
		var v;
		test.expect(2);
		var workbook = new Workbook();
		var sheet = workbook.createWorkSheet();
		sheet.getCell('A1').value=1;
		sheet.getCell('A2').value=2;
		sheet.getCell('A3').value=-1;
		sheet.getCell('A4').value=5;
		sheet.getCell('A5').value=6;
		sheet.getCell('A6').value=1;

		sheet.getCell('B1').formula = '=A1+A3*A5';
		sheet.getCell('B2').formula = '=(A1+A3)*A5';
		
		test.ok(sheet.getCell('B1').value=== (sheet.getCell('A1').value + sheet.getCell('A3').value * sheet.getCell('A5').value ));
		test.ok(sheet.getCell('B2').value=== ( (sheet.getCell('A1').value + sheet.getCell('A3').value) * sheet.getCell('A5').value ));
		test.done();
	},
	if_function: function(test){
		var v;
		test.expect(5);
		var workbook = new Workbook();
		var sheet = workbook.createWorkSheet();
		sheet.getCell('A1').value=1;
		sheet.getCell('A2').value=2;
		sheet.getCell('A3').value=-1;
		sheet.getCell('A4').value=5;
		sheet.getCell('A5').value=6;
		sheet.getCell('A6').value=1;
		sheet.getCell('A7').value=0;
		sheet.getCell('B1').formula = '=IF(1=2;3;4)';
		sheet.getCell('B2').formula = '=IF(1=2;3)';
		sheet.getCell('B3').formula = '=IF(1=A1;A7;-1)';
		sheet.getCell('B4').formula = '=SUM(A1:A3)';
		sheet.getCell('B5').formula = '=AVG(A1:A3)';
		test.ok(sheet.getCell('B1').value == 4);
		test.ok(sheet.getCell('B2').value === '');
		test.ok(sheet.getCell('B3').value == 0);
		test.ok(sheet.getCell('B4').value == 2);
		test.ok(sheet.getCell('B5').value == 2/3);
		test.done();
	},
}