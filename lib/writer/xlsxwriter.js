"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../utils/utils'),
    //JSZip = require('node-zip'),
    AdmZip = require('adm-zip'),
    fs = require('fs'),
    Cell = require('../cell/cell').Cell,
    ContentWriter = require('./xlsx/content').ContentWriter,
    DocumentRelationWriter = require('./xlsx/docrels').DocumentRelationWriter,
    RelationWriter = require('./xlsx/rels').RelationWriter,
    MainWriter = require('./xlsx/main').MainWriter,
    StringWriter = require('./xlsx/strings').StringWriter,
    StylesWriter = require('./xlsx/styles').StylesWriter,
    ThemeWriter = require('./xlsx/theme').ThemeWriter,
    CoreWriter = require('./xlsx/core').CoreWriter,
    AppWriter = require('./xlsx/app').AppWriter,
    SheetWriter = require('./xlsx/sheet').SheetWriter;


var XLSXWriter = function (config){
    this._filename;
    this._workbook;
    this._cellDefault = {};
    
    this._zip = new AdmZip();
    
    
    this._zip.addFile('_rels/',new Buffer(0));
    this._zip.addFile('xl/',new Buffer(0));
    this._zip.addFile('docProps/',new Buffer(0));
    this._zip.addFile('xl/theme/',new Buffer(0));
    this._zip.addFile('xl/worksheets/',new Buffer(0));
    this._zip.addFile('xl/_rels/',new Buffer(0));
    
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
    
    this._contentWriter = new ContentWriter(this);
    this._relationWriter = new RelationWriter(this);
    this._documentRelationWriter = new DocumentRelationWriter(this);
    this._file_relationWriter = new RelationWriter(this);
    
    
    this._stringWriter = new StringWriter(this);
    this._styleWriter = new StylesWriter(this);
    this._themeWriter = new ThemeWriter(this);
    this._sheetWriter = new SheetWriter(this);

    this._mainWriter = new MainWriter(this);
    
    this._sheetList;
    this._sheetListIndex;
    
    
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
    get stringWriter() { return this._stringWriter; },
    get sheetList() { return this._sheetList; },
    
    get sheetListIndex() { return this._sheetListIndex; },
    set sheetListIndex(c) { this._sheetListIndex=c; return c; },
    
    get zip() { return this._zip; },
    set zip(c) { this._zip=c; return c; }
});

XLSXWriter.prototype.save = function(){
    var me =this,
        sheetName;
    
    this._sheetList = me.workbook.getSheetList();
    this._sheetListIndex = -1;
    this._relationWriter.on('ready',this.relationReady.bind(this));
    this._styleWriter.on('ready',this.styleReady.bind(this));
    this._stringWriter.on('ready',this.stringReady.bind(this));
    this._themeWriter.on('ready',this.themeReady.bind(this));
    this._contentWriter.on('ready',this.contentReady.bind(this));
    this._mainWriter.on('ready',this.mainReady.bind(this));
    this._documentRelationWriter.on('ready',this.documentRelationReady.bind(this))
    var core = new CoreWriter(this);
    core.process();
    var app = new AppWriter(this);
    app.process();
    this._documentRelationWriter.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument','xl/workbook.xml');
    this._documentRelationWriter.addRelation('http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties','docProps/core.xml');
    this._documentRelationWriter.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties','docProps/app.xml');
    this._mainWriter.process();
    
}

XLSXWriter.prototype.mainReady = function(wr){
    this._stringWriter.process();
}

XLSXWriter.prototype.styleReady = function(wr){
    this._themeWriter.process();
}
XLSXWriter.prototype.themeReady = function(wr){
     this._contentWriter.process();
}

XLSXWriter.prototype.stringReady = function(wr){
    this._contentWriter.addPart('/docProps/core.xml','application/vnd.openxmlformats-package.core-properties+xml');
    this._contentWriter.addPart('/docProps/app.xml','application/vnd.openxmlformats-officedocument.extended-properties+xml');
    this._styleWriter.process();
}


XLSXWriter.prototype.contentReady = function(wr){
    this._relationWriter.process();
}

XLSXWriter.prototype.relationReady = function(wr){
    this._documentRelationWriter.process();
}
XLSXWriter.prototype.documentRelationReady = function(wr){
    var scope = this;
    
    scope._zip.writeZip (scope.filename,function(){
        scope.emit('ready');
    });
}

exports.XLSXWriter = XLSXWriter;
