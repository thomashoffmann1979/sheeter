var Workbook = require('../lib/workbook/workbook.js').Workbook;

var cells =[
	{id: 'A1',value:3},
	{id: 'A2',value:1},
	{id: 'A3',value:0},
	{id: 'A4',value:2},
	{id: 'A5',value:5},
	{id: 'A6',value:7},
	{id: 'A7',value:''},
	{id: 'A8',value:1},
];
var sum_queries = [
	{
		test: '=SUM(A1:A5)',
		result: 3+1+2+5
	},
	{
		test: '=SUM(A1;A2;A3;A4;A5)',
		result: 3+1+2+5
	},
	{
	test: '=SUM(A6:A8)',
		result: 8
	}
];

var min_queries = [
	{
		test: '=MIN(A1:A5)',
		result:0
	},
	{
		test: '=MIN(A1;A2;A3;A4;A5)',
		result: 0
	},
	{
	test: '=MIN(A6:A8)',
		result: 0
	}
];

var max_queries = [
	{
		test: '=MAX(A1:A5)',
		result: 5
	},
	{
		test: '=MAX(A1;A2;A3;A4;A5)',
		result: 5
	},
	{
	test: '=MAX(A6:A8)',
		result: 7
	}
];
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
	
	sum_function: function(test){
		var v,i,m;
		test.expect(sum_queries.length);
		var workbook = new Workbook();
		var sheet = workbook.createWorkSheet();
		for(i=0,m=cells.length;i<m;i+=1){
			sheet.getCell(cells[i].id,cells[i]);
		}
		for(i=0,m=sum_queries.length;i<m;i+=1){
			sheet.getCell('B'+(i+1)).formula=sum_queries[i].test;
			test.equals(sheet.getCell('B'+(i+1)).value, sum_queries[i].result,sum_queries[i].test);
		}
		test.done();
	},
	
	min_function: function(test){
		var v,i,m;
		test.expect(min_queries.length);
		var workbook = new Workbook();
		var sheet = workbook.createWorkSheet();
		for(i=0,m=cells.length;i<m;i+=1){
			sheet.getCell(cells[i].id,cells[i]);
		}
		for(i=0,m=min_queries.length;i<m;i+=1){
			sheet.getCell('B'+(i+1)).formula=min_queries[i].test;
			test.equals(sheet.getCell('B'+(i+1)).value, min_queries[i].result,min_queries[i].test);
		}
		test.done();
	},
	
	min_function: function(test){
		var v,i,m;
		test.expect(max_queries.length);
		var workbook = new Workbook();
		var sheet = workbook.createWorkSheet();
		for(i=0,m=cells.length;i<m;i+=1){
			sheet.getCell(cells[i].id,cells[i]);
		}
		for(i=0,m=max_queries.length;i<m;i+=1){
			sheet.getCell('B'+(i+1)).formula=max_queries[i].test;
			test.equals(sheet.getCell('B'+(i+1)).value, max_queries[i].result,max_queries[i].test);
		}
		test.done();
	}
}