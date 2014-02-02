var parser = require('../formulas');

module.exports = {
    name: 'INDIRECT',
    aliases: [
        'INDIREKT'
    ],
    call: function(cell,token_list){
        var condition=new parser.TokenList(),
            indirectValue,
            newTokenList;

        indirectValue = parser.execute(cell,token_list);
        newTokenList = parser.parse(indirectValue);
        return parser.execute(cell,newTokenList);
    }
}