var parser = require('../formulas');

module.exports = {
    name: 'LEFT',
    aliases: [
        'LINKS'
    ],
    call: function(cell,token_list){
        var args = parser.toArgs(token_list),
            current;
        
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
        return args[0].substring(0,args[1]*1);
    }
}