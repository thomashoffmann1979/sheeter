"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var MainReader = function(config){
    this._data; 
    this._workbook;
    this._relations = {};
    
    if (typeof config==='undefined'){
        config = {};
    }
    if (typeof config.workbook!=='undefined'){
        this.workbook = config.workbook;
    }
    
    return this;
}


sheeter_utils.inherits(MainReader,EventEmitter,{

    get data () { return this._data; },
    set data (d) { this._data = d; return this; },

    get workbook () { return this._workbook; },
    set workbook (d) { this._workbook = d; return this; },
    
});



MainReader.prototype.parse = function(callback){
    var me=this;
    //console.log(this._data);
    sheeter_utils.xmlToJSON(this._data,function(err,data){
        var i,
            m,
            j,
            n,
            node;

        if(err){ 
            callback(err);
        }
        //console.log(data);
        
        if ( (typeof data.name != 'undefined' ) && (data.name == 'workbook') ){
            for(i=0,m=data.childs.length; i<m ; i+=1){
                node = data.childs[i];
                if (node.name=='sheets'){
                    for(j=0,n=node.childs.length; j<n; j+=1){
                        console.log(node.childs[j]);
                    }
                }
                
            }
        }else{
            callback(new Error('The given xml does not contain a workbook-element.'));
            return;
        }
        me.emit('ready');
        callback(null);
    },false);
}
exports.MainReader = MainReader;