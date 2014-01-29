"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var ContentWriter =  function(writer){
    this._data;
    this._writer = writer;
}


sheeter_utils.inherits(ContentWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

})

exports.ContentWriter = ContentWriter;
                       