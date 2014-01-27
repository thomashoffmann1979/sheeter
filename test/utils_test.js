var utils = require('../lib/utils/utils.js');

var isCellNotation_Queries = [
    {
        test: 'A1',
        result: true
    },
    {
        test: 'BY23',
        result: true
    },
    {
        test: 'BY023',
        result: false
    },
    {
        test: '[Table 1]!BY23',
        result: true
    },
    {
        test: '[Table 1]![Table 2]!BY23',
        result: false
    }
];


var isRangeNotation_Queries = [
    {
        test: 'BA12:BA1',
        result: true
    },
    {
        test: 'A1:Z1',
        result: true
    },
    {
        test: 'A1:A1',
        result: true
    },
    {
        test: 'BY12:BZ1',
        result: false
    },
    {
        test: '[Table 1]!A1:A1',
        result: true
    }
];

exports.utils = {

    isCellNotation: function(test){
        var v,i,m;
        test.expect(isCellNotation_Queries.length);
        for(i=0,m=isCellNotation_Queries.length; i< m; i+=1){
            v = utils.isCellNotation(isCellNotation_Queries[i].test);
            test.ok(isCellNotation_Queries[i].result === v,'testing: '+isCellNotation_Queries[i].test);
        }
        test.done();
    },
    isRangeNotation: function(test){
        var v;
        test.expect(isRangeNotation_Queries.length);
        for(i=0,m=isRangeNotation_Queries.length; i< m; i+=1){
            v = utils.isRangeNotation(isRangeNotation_Queries[i].test);
            test.ok(isRangeNotation_Queries[i].result === v,'testing: '+isRangeNotation_Queries[i].test);
        }
        test.done();
    },
    getColumnAndRow: function(test){
        var v;
        test.expect(3);
        v = utils.getColumnAndRow('B3');
        test.deepEqual(v,{
            column: 'B',
            columnIndex: 2,
            row: 3
        });
        v = utils.getColumnAndRow('AA999');
        test.deepEqual(v,{
            column: 'AA',
            columnIndex: 27,
            row: 999
        });
        v = utils.getColumnAndRow('BA1');
        test.deepEqual(v,{
            column: 'BA',
            columnIndex: 53,
            row: 1
        });
        test.done();
    },

    columnStringFromIndex: function(test){
        var v;
        test.expect(2);
        v = utils.columnStringFromIndex(53);
        test.equals(v,'BA');
        v = utils.columnStringFromIndex(10);
        test.equals(v,'J');
        test.done();
    }
}