var formulas = require('../lib/formulas/formulas');

// `expected_parser_results` defines the testcases
// for the parser and their TokenList-Items. 
var expected_parser_results = {
	' = IF(A1=B2;1;2)': [ 
		{ value: 'IF', type: 'function', subtype: 'start' },
		{ value: 'A1', type: 'literal', subtype: 'range' },
		{ value: '=', type: 'operand', subtype: 'logical' },
		{ value: 'B2', type: 'literal', subtype: 'range' },
		{ value: ',', type: 'argument', subtype: '' },
		{ value: '1', type: 'literal', subtype: 'number' },
		{ value: ',', type: 'argument', subtype: '' },
		{ value: '2', type: 'literal', subtype: 'number' },
		{ value: '', type: 'function', subtype: 'stop' } 
	],
	'=IF(A1=B2;1;2) + -1 * (B2+SUM( A2:D2 )) ': [ 
		{ value: 'IF', type: 'function', subtype: 'start' },
		{ value: 'A1', type: 'literal', subtype: 'range' },
		{ value: '=', type: 'operand', subtype: 'logical' },
		{ value: 'B2', type: 'literal', subtype: 'range' },
		{ value: ',', type: 'argument', subtype: '' },
		{ value: '1', type: 'literal', subtype: 'number' },
		{ value: ',', type: 'argument', subtype: '' },
		{ value: '2', type: 'literal', subtype: 'number' },
		{ value: '', type: 'function', subtype: 'stop' },
		{ value: '+', type: 'operand', subtype: 'math' },
		{ value: '-1', type: 'literal', subtype: 'number' },
		{ value: '*', type: 'operand', subtype: 'math' },
		{ value: '', type: 'subexpression', subtype: 'start' },
		{ value: 'B2', type: 'literal', subtype: 'range' },
		{ value: '+', type: 'operand', subtype: 'math' },
		{ value: 'SUM', type: 'function', subtype: 'start' },
		{ value: 'A2:D2', type: 'literal', subtype: 'range' },
		{ value: '', type: 'function', subtype: 'stop' },
		{ value: '', type: 'subexpression', subtype: 'stop' } 
	]
};

var expected_calculation_results = {
	'=1': 1,
	'=1+(2*3)': 7,
	'=1+2*3': 7,
	'=1+-2*-3': 7,
	'=1+A1': '#VALUE!', //should not work, because no cell are available
	'=SUM(A1:A3)': '#VALUE!'
}
		

module.exports.parser ={
	"parsing formulas": function(test) {
		var v;
		test.expect(expected_parser_results.length);
		for(var i in expected_parser_results){
			 v = formulas.parse(i);
			test.deepEqual(expected_parser_results[i],v._items,i);
		}
		test.done();
	},
	"checking calculations": function(test){
		var v,p;
		test.expect(expected_calculation_results.length);
		for(var i in expected_calculation_results){
			p = formulas.parse(i);
			v = formulas.execute({},p);
			test.equals(expected_calculation_results[i],v,i);
		}
		test.done();
	}
};

													 /*
console.log(formulas);
//console.log(Parser.parse('=A1+/+N'));
exports.formulas_parser = {
	simpleTest: function(test){
		
		
		
		var v;
		test.expect(5);
		v= formulas.parse('=A1');
		//test.equals(v,{});
		test.ok(typeof v.items!=='undefined');
		test.ok(v.items.length===1,'no single item');
		test.ok(v.items[0].value==='A1','field A1 not found');
		test.ok(v.items[0].type==='operand','invalid type');
		test.ok(v.items[0].subtype==='range','invalid subtype');
		test.done();
	}
}
*/