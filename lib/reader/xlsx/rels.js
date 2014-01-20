"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var RelationReader =  function(){
    this._data; 
    return this;
}


sheeter_utils.inherits(RelationReader,EventEmitter,{

    get data () { return this._data; },
    set data (d) { this._data = d; return this; },
    
});

RelationReader.prototype.parse = function(callback){
    var me=this;
    sheeter_utils.xmlToJSON(this._data,function(err,data){
        var i,
            m,
            node;

        if(err){ 
            callback(err);
        }
        console.log(data);
        callback(null);
    });
}
exports.RelationReader = RelationReader;