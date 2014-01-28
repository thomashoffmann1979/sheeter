"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../utils/utils'),
    fs = require('fs'),
    Cell = require('../cell/cell').Cell,
    TextParser = require('./xsv/parser').TextParser;


var XSVReader = function (config){
    this._filename;
    this._workbook;
    this._cellDefault = {};
    if (typeof config==='undefined'){
        config = {};
    }
    if (typeof config.filename!=='undefined'){
        this.filename = config.filename;
    }
    if (typeof config.workbook!=='undefined'){
        this.workbook = config.workbook;
    }
    if (typeof config.cellDefault!=='undefined'){
        this._cellDefault = config.cellDefault;
    }
    
    this._intend = 0;
    this._textParser = new TextParser();
    if ( (typeof config.tab!=='undefined') && (config.tab === true) ){
        this._textParser.separation = "\t";
    }
    if ( (typeof config.csv!=='undefined') && (config.csv === true) ){
        this._textParser.separation = ";";
    }
    return this;
}

sheeter_utils.inherits(XSVReader,EventEmitter,{
    get filename () { return this._filename; },
    set filename (fn) { this._filename=fn; return this; },
    
    get workbook () { return this._workbook; },
    set workbook (fn) { this._workbook=fn; return this; },
    
    get cellDefault() { return this._cellDefault; },
    set cellDefault (fn) { this._cellDefault=fn; return this; },
    
    get textReader() { return this._textParser; }
});



XSVReader.prototype.open = function (config,cb){
    var sheet,
        me=this;
    
    if ( (typeof config !== 'undefined') && (typeof config.filename!=='undefined')){
        this.filename = config.filename;
    }
    
    
    fs.readFile(this.filename,function(err,data){
        if (err) throw err;
        
        me.textReader.data = data;
        
        sheet = me.workbook.createWorkSheet({
            id: 1,
            title: me.filename,
            cellDefault: me.cellDefault
        });

        me.textReader.on('cell',function(c){
            /* sheet.getCell(c.id,c); */
            var cell;
            cell = new Cell(me.cellDefault);
            cell.id = c.id;
            cell.worksheet = sheet;
            cell.value = c.value;
            sheet._cellHash[c.id] = cell; /*not nice, but it speed's it up */ 
            
        });

        me.textReader.on('mainReady',function(c){
            me.emit('mainReady');
        });



        me.textReader.parse();

    });
    
    
}


exports.XSVReader = XSVReader;