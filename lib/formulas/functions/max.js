var parser = require('../formulas');
var sheeter_utils = require('../../utils/utils');
module.exports = {
	name: 'MAX',
	aliases: [
	],
	call: function(cell,token_list){
		var t_list,
				current,
				i,
				m,
				v,
				value,
				count=0;
		while(token_list.moveNext()){
			current = token_list.current();
			if (current.type === parser.keywords.type.literal){
				if (sheeter_utils.isRangeNotation(current.value)){
					var list = sheeter_utils.rangeToArray(current.value);
					for(i=0,m=list.length;i<m;i+=1){
						
						t_list =new parser.TokenList();
						t_list.add(list[i],parser.keywords.type.literal,parser.keywords.subtype.range);
						v = parser.execute(cell,t_list);
						if ((count===0) || (v > value)){
							value = v;
						}
						count+=1;
					}
				}else{
					t_list =new parser.TokenList();
					t_list.add(current.value,parser.keywords.type.literal,parser.keywords.subtype.range);
					v = parser.execute(cell,t_list);
					if ((count===0) || (v > value)){
						value = v;
					}
					count+=1;
				}
			}
		}
		
		return value;
	}
}