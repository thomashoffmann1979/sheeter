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

RelationReader.prototype.parse = function(callback){
    var me=this;
    sheeter_utils.xmlToJSON(this._data,function(err,data){
        var i,
            m,
            node;

        if(err){ 
            callback(err);
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
                    }else{
                        callback(new Error('invalid workbook.xml.rels'));
                        return;
                    }
                }
                
            }
        }else{
            callback(new Error('The given xml does not contain a relationships-element.'));
            return;
        }
        callback(null);
        callback(null);
    });
}
exports.RelationReader = RelationReader;