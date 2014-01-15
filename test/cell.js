var Cell = require('../lib/cell/cell.js');

exports.cell = {
	throwsErrorOnInvalidID: function(test){
		var v;
		test.expect(1);
		test.throws(function(){
			var test_cell = new Cell();
			test_cell.id = '12B3';
		});
		test.done();
	}
}