var parser = require('../formulas');
var sheeter_utils = require('../../utils/utils');
module.exports = {
	name: 'AVG',
	aliases: [
		'DRUCHSCHNITT'
	],
	call: function(cell,token_list){
		var sum=new parser.TokenList(),
				current,
				i,
				m;
		if(token_list.moveNext()){
			current = token_list.current();
		}
		
		var list = sheeter_utils.rangeToArray(current.value);
		for(i=0,m=list.length;i<m;i+=1){
			sum.add(list[i],'literal','range');
			if (i+1<m){
				sum.add('+','operand','math');
			}
		}
		var v = parser.execute(cell,sum);
		return v / list.length;
	}
}