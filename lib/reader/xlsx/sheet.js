"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util'),
    sax = require('sax'); // Sheets may contain a lot of data's so we use the full power of the sax parser.

var SheetReader = function(config){
    this._data; 
    return this;
}


sheeter_utils.inherits(SheetReader,EventEmitter,{

    get data () { return this._data; },
    set data (d) { this._data = d; return this; }
    
});



SheetReader.prototype.parse = function(){
    var me=this,
        parser = sax.parser(true),
        inSheetData=false,
        inRow = -1,
        inValue = false,
        inFormula = false,
        inCell = false,
        inInlineString = false,
        inText = false,
        currentCell=null;
    

    
    parser.onerror = function (e) {
        me.emit('error',e);
    };
    
    parser.ontext = function (t) {
        if ( inRow>0 && (currentCell!=null) && (inFormula)){
            currentCell.formula = t;
            // maybe, replace ',' by ';'
        }
        if ( inRow>0 && (currentCell!=null) && (inValue)){
            currentCell.value = t;
        }
        if ( inRow>0 && (currentCell!=null) && (inText)){
            currentCell.value = t;
            //me.emit('debug',t);
        }
    };

    parser.onclosetag = function () {
        if ( inRow>0 && (inCell) && (inFormula) && (!inInlineString)){
            inFormula=false;
            return;
        }
        if ( inRow>0 && (inCell) && (inValue) && (!inInlineString)){
            inValue=false;
            return;
        }
        if ( inRow>0 && (inCell) && (inText) && (inInlineString)){
            inText=false;
            return;
        }
        if ( inRow>0 && (inCell) && (inInlineString)){
            inInlineString=false;
            return;
        }
        if (inRow>0 && (inCell)){
            me.emit('cell',currentCell);
            inCell = false;
            currentCell = {};
            return;
        }
        if (inSheetData && (inRow>0)){
            inRow = -1;
            return;
        }
        if (inSheetData){
            inSheetData=false;
            return;
        }
    };
    
    parser.onopentag = function (n) {
        if (n.name=='sheetData'){
            inSheetData=true;
        }
        if (inSheetData && (n.name=='row')){
            inRow = n.attributes.r;
        }
        if (inRow>0 && (n.name=='c')){
            inCell = true;
            currentCell= {
                r: n.attributes.r
            };
            if ( (typeof n.attributes.t!=='undefined') && (n.attributes.t=='s') ){
                currentCell.t = n.attributes.t;
            }

            //console.log(currentCell)
        }
        if ( inRow>0 && (inCell) && (n.name=='v')){
            inValue=true;
        }
        if ( inRow>0 && (inCell) && (n.name=='f')){
            inFormula=true;
        }
        if ( inRow>0 && (inCell) && (n.name=='is')){
            inInlineString=true;
        }
        if ( inRow>0 && (inInlineString) && (n.name=='t')){
            inText=true;
        }
    };
    
    parser.onattribute = function (attr) {
        
    };
    
    parser.onend = function () {
        me.emit('ready');
    };

    parser.write(me.data).close();

    
}
exports.SheetReader = SheetReader;