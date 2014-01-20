"use strict";
var Cell = require('../lib/cell/cell.js').Cell;

exports.cell = {
    setID: function (test) {
        var test_cell = new Cell();
        test.expect(1);
        test_cell.id = 'B3';
        test.ok(test_cell.id === 'B3');
        test.done();
    },
    setFormula: function (test) {
        var test_cell = new Cell({
            id: 'A1',
            formula: '=2+1'
        });
        test.expect(1);
        test.ok(test_cell.formula === '=2+1');
        test.done();
    }
};