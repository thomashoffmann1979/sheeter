"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var TextParser = function(config){
    this._data; 
    this._separation = ';'; 
    this._textwrap = '"'; 
    this._lineend = "\r"; 
    return this;
}


sheeter_utils.inherits(TextParser,EventEmitter,{

    get data () { return this._data; },
    set data (d) { this._data = d; return this; },

    get textwrap () { return this._textwrap; },
    set textwrap (d) { this._textwrap = d; return this; },

    get separation () { return this._separation; },
    set separation (d) { this._separation = d; return this; },

    get lineend () { return this._lineend; },
    set lineend (d) { this._lineend = d; return this; }
    
});

TextParser.prototype.parse = function(){
    var self=this,
        m = self.data.length,
        i,
        c,
        temp=[],
        rowIndex = 1,
        cellIndex = 1,
        inText = false,
        tw = self.textwrap.charCodeAt(0),
        le = self.lineend.charCodeAt(0),
        sep = self.separation.charCodeAt(0);
    
    
    
    for(i=0;i<m;i+=1){
        c=self.data.readUInt8(i);
        if (inText && c === tw){
            inText = false;
        }else{
            switch(c){
                case le:
                    self.emit('cell',{
                        id: sheeter_utils.columnStringFromIndex(cellIndex)+rowIndex,
                        value:  (new Buffer(temp)).toString('utf8')
                    });
                    temp = [];
                    
                    rowIndex+=1;
                    cellIndex=1;
                    break;
                case sep:
                    self.emit('cell',{
                        id: sheeter_utils.columnStringFromIndex(cellIndex)+rowIndex,
                        value:  (new Buffer(temp)).toString('utf8')
                    });
                    temp = [];
                    cellIndex += 1;
                    break;
                case tw:
                    inText==true;
                    break;
                default:
                    temp.push(c);
            }
        }
    }
    
    self.emit('cell',{
        id: sheeter_utils.columnStringFromIndex(cellIndex)+rowIndex,
        value:  (new Buffer(temp)).toString('utf8')
    });
    
    self.emit('mainReady');
}

exports.TextParser = TextParser;