"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var RelationReader =  function(){
    this._data; 
    this._relations = {};
    return this;
}


sheeter_utils.inherits(RelationReader,EventEmitter,{

    get data () { return this._data; },
    set data (d) { this._data = d; return this; },

});

RelationReader.prototype.relation = function(id){
    if (typeof this._relations[id]!='undefined'){
        return this._relations[id];
    }
    throw Error('The relation '+id+' was not found');
}

RelationReader.prototype.parse = function(){
    var me=this;
    sheeter_utils.xmlToJSON(this._data,function(err,data){
        var i,
            m,
            node;

        if(err){ 
            me.emit('error', err);
        }
        if ( (typeof data.name != 'undefined' ) && (data.name == 'Relationships') ){
            for(i=0,m=data.childs.length; i<m ; i++){
                /*uncomment here to see all types, console.log(data.childs[i]);*/
                node = data.childs[i];
                if (node.name=='Relationship'){
                    if (
                        (typeof node.attributes!='undefined') &&
                        (typeof node.attributes.Target!='undefined') &&
                        (typeof node.attributes.Id!='undefined')
                    ){
                        me._relations[node.attributes.Id]=node.attributes.Target;
                    }else{
                        //callback(new Error('invalid workbook.xml.rels'));
                        //return;
                    }
                }
                
            }
        }else{
            me.emit('error',  Error('The given xml does not contain a relationships-element.'));
            return;
        }
        me.emit('ready');
    });
}
exports.RelationReader = RelationReader;