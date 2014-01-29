"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../utils/utils'),
    Zip = require('adm-zip'),
    fs = require('fs'),
    Cell = require('../cell/cell').Cell,
    ContentWriter = require('./xlsx/content').ContentWriter,
    RelationWriter = require('./xlsx/rels').RelationWriter,
    MainWriter = require('./xlsx/main').MainWriter,
    StringWriter = require('./xlsx/strings').StringWriter,
    SheetWriter = require('./xlsx/sheet').SheetWriter;

var XLSXWriter = function (config){
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
    
    this.zipEntries;
    this._contentWriter = new ContentWriter(this);
    this._relationWriter = new RelationWriter(this);
    this._mainWriter = new MainWriter(this);
    this._stringWriter = new StringWriter(this);
    this._sheetWriter = new SheetWriter(this);

    return this;
}


sheeter_utils.inherits(XLSXWriter,EventEmitter,{
    get filename () { return this._filename; },
    set filename (fn) { this._filename=fn; return this; },
    
    get workbook () { return this._workbook; },
    set workbook (fn) { this._workbook=fn; return this; },
    
    get cellDefault() { return this._cellDefault; },
    set cellDefault (fn) { this._cellDefault=fn; return this; },
    
    get contentWriter() { return this._contentWriter; },
    get relationWriter() { return this._relationWriter; },
    get mainWriter() { return this._mainWriter; },
    get stringWriter() { return this._stringWriter; }
});

XLSXWriter.prototype.save = function(){
    var me =this,
        sheetName,
        sheets = me.workbook.getSheetList();
    
    this._sheetWriter.process( sheets[0] );
    
}
//me.emit('sheetsReady');
exports.XLSXWriter = XLSXWriter;
