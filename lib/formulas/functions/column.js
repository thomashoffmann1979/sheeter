var parser = require('../formulas');
var sheeter_utils = require('../../utils/utils');

module.exports = {
    name: 'COLUMN',
    aliases: [
        'SPALTE'
    ],
    call: function(cell,token_list){
        return sheeter_utils.columnIndexFromString(cell.id);
    }
}