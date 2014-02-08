var parser = require('../formulas');
var sheeter_utils = require('../../utils/utils');

module.exports = {
    name: 'COLUMN',
    aliases: [
        'SPALTE'
    ],
    call: function(cell,token_list){
        
        var args = parser.toArgs(token_list);
        
        if (args.length>0){
            throw new Error('Invalid number of arguments.');
        }
        return sheeter_utils.columnIndexFromString(cell.id);
    }
}