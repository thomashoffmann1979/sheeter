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
            m,
            count=0;
        while(token_list.moveNext()){
            current = token_list.current();
            if (current.type === parser.keywords.type.argument){
                sum.add('+',parser.keywords.type.operand,parser.keywords.subtype.math);
            }else if (current.type === parser.keywords.type.literal){
                if (sheeter_utils.isRangeNotation(current.value)){
                    var list = sheeter_utils.rangeToArray(current.value);
                    for(i=0,m=list.length;i<m;i+=1){
                        sum.add(list[i],parser.keywords.type.literal,parser.keywords.subtype.range);
                        count+=1;
                        if (i+1<m){
                            sum.add('+',parser.keywords.type.operand,parser.keywords.subtype.math);
                        }
                    }
                }else{
                    sum.add(current.value,parser.keywords.type.literal,parser.keywords.subtype.range);
                    count+=1;
                }
            }
        }



        return (parser.execute(cell,sum) / count);
    }
}