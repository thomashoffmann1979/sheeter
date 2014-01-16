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
	}
}