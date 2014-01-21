"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var StringReader =  function(){
    this._data; 
    this._string = [];
    return this;
}


sheeter_utils.inherits(StringReader,EventEmitter,{

    get data () { return this._data; },
    set data (d) { this._data = d; return this; },

});

StringReader.prototype.string = function(id){
    if (typeof this._string[id]!='undefined'){
        return this._string[id];
    }
    throw Error('The string '+id+' was not found');
}

StringReader.prototype.parse = function(){
    var me=this;
    sheeter_utils.xmlToJSON(this._data,function(err,data){
        var i,
            m,
            node;

        if(err){ 
            me.emit('error', err);
        }
        if ( (typeof data.name != 'undefined' ) && (data.name == 'sst') ){
            for(i=0,m=data.childs.length; i<m ; i++){
                /*uncomment here to see all types, console.log(data.childs[i]);*/
                node = data.childs[i];
                if (node.name=='si'){
                        me._string.push(node.childs[0].text);
                }
                
            }
        }else{
            me.emit('error',  Error('The given xml does not contain a sst-element.'));
            return;
        }
        me.emit('ready');
    });
}
exports.StringReader = StringReader;