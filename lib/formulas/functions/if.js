var parser = require('../formulas');

module.exports = {
	name: 'IF',
	aliases: [
		'WENN'
	],
	call: function(cell,token_list){
		var condition=new parser.TokenList(),
				true_term,
				false_term,
				current,
				cond_value,
				arg_index=0;
		while(token_list.moveNext()){
			current = token_list.current();
			if (current.type==='argument'){
				arg_index+=1;
				if (arg_index===1){
					true_term=new parser.TokenList();
				}
				if (arg_index===2){
					false_term=new parser.TokenList();
				}
				continue;
			}
			if (arg_index===0){
				condition.add(current.value,current.type,current.subtype);
				continue;
			}else if (arg_index===1){
				true_term.add(current.value,current.type,current.subtype);
				continue;
			}else if (arg_index===2){
				false_term.add(current.value,current.type,current.subtype);
				continue;
			}
		}
		cond_value = parser.execute(cell,condition);
		if (cond_value===true){
			if (typeof true_term==='undefined'){
				return '';
			}
			return parser.execute(cell,true_term);
		}else{
			if (typeof false_term==='undefined'){
				return '';
			}
			return parser.execute(cell,false_term);
		}
	}
}