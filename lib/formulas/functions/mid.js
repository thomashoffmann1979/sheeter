var parser = require('../formulas');

module.exports = {
    name: 'MID',
    aliases: [
        'TEIL'
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
        
        if (args.length!=3){
            throw new Error('Invalid number of arguments.');
        }
        
        args[0] = parser.execute(cell,args[0]);
        args[1] = parser.execute(cell,args[1]);
        args[2] = parser.execute(cell,args[2]);
        
        if ( typeof args[0] != 'string' ){
            throw new Error('Invalid argument (1).');
        }
        if ( isNaN(args[1]) ){
            throw new Error('Invalid argument (2).');
        }
        if ( isNaN(args[2]) ){
            throw new Error('Invalid argument (3).');
        }
        return args[0].substring(args[1]*1-1,args[1]*1-1+args[2]*1);
    }
}