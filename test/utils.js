var utils = require('../lib/utils/utils.js');

exports.cell = {
	isCellNotation: function(test){
		var v = utils.isCellNotation('BY23');
		test.ok(v);
		test.done();
	},
	isNotCellNotation: function(test){
		var v = utils.isCellNotation('BY012');
		test.ok(!v);
		test.done();
	},
	isRangeNotaion: function(test){
		var v = utils.isRangeNotaion('BY12:BY1');
		test.ok(v);
		test.done();
	},
	isNotRangeNotaion: function(test){
		var v = utils.isRangeNotaion('BY12:BZ1');
		test.ok(!v);
		test.done();
	},
	getColumnAndRow: function(test){
		var v = utils.getColumnAndRow('BA3');
		test.deepEqual(v,{
			column: 'B',
			columnIndex: 2,
			row: 3
		});
		test.done();
	}
}