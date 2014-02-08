var parser = require('../formulas');
var sheeter_utils = require('../../utils/utils');

module.exports = {
    name: 'ROW',
    aliases: [
        'ZEILE'
    ],
    call: function(cell,token_list){
        return (sheeter_utils.getColumnAndRow(cell.id)).row;
    }
}