var utils = require('../lib/utils/utils.js');

exports.cell = {
	isCellNotation: function(test){
		var v;
		test.expect(2);
		v = utils.isCellNotation('BY23');
		test.ok(v);
		v = utils.isCellNotation('BY012');
		test.ok(!v);
		test.done();
	},
	isRangeNotaion: function(test){
		var v;
		test.expect(4);
		v = utils.isRangeNotaion('BA12:BA1');
		test.ok(v,"same column, differnt rows");
		v = utils.isRangeNotaion('A1:Z1');
		test.ok(v,"same row, different column");
		v = utils.isRangeNotaion('A1:A1');
		test.ok(v,"same row, same column");
		v = utils.isRangeNotaion('BY12:BZ1');
		test.ok(!v,"different columns and rows (matrix) should fail");
		test.done();
	},
	getColumnAndRow: function(test){
		var v;
		test.expect(3);
		v = utils.getColumnAndRow('B3');
		test.deepEqual(v,{
			column: 'B',
			columnIndex: 2,
			row: 3
		});
		v = utils.getColumnAndRow('AA999');
		test.deepEqual(v,{
			column: 'AA',
			columnIndex: 27,
			row: 999
		});
		v = utils.getColumnAndRow('BA1');
		test.deepEqual(v,{
			column: 'BA',
			columnIndex: 53,
			row: 1
		});
		test.done();
	}
}