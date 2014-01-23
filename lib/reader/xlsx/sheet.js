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
        }
        if ( inRow>0 && (currentCell!=null) && (inValue)){
            currentCell.value = t;
        }
        if ( inRow>0 && (currentCell!=null) && (inText)){
            currentCell.value = t;
            //me.emit('debug',t);
        }
    };
//    <c r="A1" t="inlineStr"><is><t>Ident</t></is></c><c r="B1" t="inlineStr"><is><t>Name1</t></is></c><c r="C1" t="inlineStr"><is><t>Name2</t></is></c><c r="D1" t="inlineStr"><is><t>name3</t></is></c><c r="E1" t="inlineStr"><is><t>name4</t></is></c><c r="F1" t="inlineStr"><is><t>Str</t></is></c><c r="G1" t="inlineStr"><is><t>Ort</t></is></c><c r="H1" t="inlineStr"><is><t>VV WG</t></is></c><c r="I1" t="inlineStr"><is><t>RA</t></is></c><c r="J1" t="inlineStr"><is><t>RA WG</t></is></c><c r="K1" t="inlineStr"><is><t>Pers_Ident</t></is></c><c r="L1" t="inlineStr"><is><t>Pers_Name</t></is></c><c r="M1" t="inlineStr"><is><t>funktion</t></is></c><c r="N1" t="inlineStr"><is><t>Funktion</t></is></c></row>

    parser.onclosetag = function () {
        /*
        console.log({
            inRow: inRow,
            inFormula: inFormula,
            inValue: inValue,
            inCell: inCell,
            inSheetData: inSheetData
        })
        */
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
            //if (currentCell.r.length<2)
            //console.log(currentCell.r);
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