var Cell = require('../lib/cell/cell.js').Cell;

exports.cell = {
	setID: function(test){
		var v;
		test.expect(1);
		var test_cell = new Cell();
		test_cell.id = 'B3';
		test.ok(test_cell.id==='B3');
		test.done();
	},
	setFormula: function(test){
		var v;
		test.expect(1);
		var test_cell = new Cell({
			id: 'A1',
			formula: '=2+1'
		});
		test.ok(test_cell.formula==='=2+1');
		test.done();
	}
}