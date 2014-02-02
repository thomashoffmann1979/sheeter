var parser = require('../formulas');

module.exports = {
    name: 'RIGHT',
    aliases: [
        'RECHTS'
    ],
    call: function(cell,token_list){
        var args = [],
            current;
            
        args.push(new parser.TokenList());
        while(token_list.moveNext()){
            current = token_list.current();
            if (current.type==='argument'){
                args.push(new parser.TokenList());
            }else{
                args[args.length-1].add(current.value,current.type,current.subtype);
            }
        }
        
        if (args.length!=2){
            throw new Error('Invalid number of arguments.');
        }
        
        args[0] = parser.execute(cell,args[0]);
        args[1] = parser.execute(cell,args[1]);
        
        if ( typeof args[0] != 'string' ){
            throw new Error('Invalid argument (1).');
        }
        if ( isNaN(args[1]) ){
            throw new Error('Invalid argument (2).');
        }
        return args[0].substring(args[0].length-args[1]*1);
    }
}