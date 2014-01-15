var formulas = require('../lib/formulas/formulas');
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