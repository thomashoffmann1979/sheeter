var Cell = require('../lib/cell/cell').Cell;
var formulas = require('../lib/formulas/formulas');
var Worksheet = require('../lib/worksheet/worksheet').Worksheet;

var str = '= 1+(2*3) ';
var v = formulas.parse(str);
console.log('calculating "'+str+'", the result is: '+formulas.execute({},v) );
