"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../utils/utils'),
    Zip = require('adm-zip'),
    sax = require('sax'),
    fs = require('fs'),
    ContentReader = require('./xlsx/content').ContentReader,
    RelationReader = require('./xlsx/rels').RelationReader,
    MainReader = require('./xlsx/main').MainReader,
    StringReader = require('./xlsx/strings').StringReader,
    SheetReader = require('./xlsx/sheet').SheetReader;


var XLSXReader = function (config){
    this._filename;
    this._workbook;
    if (typeof config==='undefined'){
        config = {};
    }
    if (typeof config.filename!=='undefined'){
        this.filename = config.filename;
    }
    if (typeof config.workbook!=='undefined'){
        this.workbook = config.workbook;
    }
    this._entrieIndex = -1;
    this._readingOrderIndex = -1;
    this._readRequiredStopped=true;
    this.zipEntries;
    this._contentReader = new ContentReader();
    this._relationReader = new RelationReader();
    this._mainReader = new MainReader();
    this._stringReader = new StringReader();
    this._intend = 0;
    /*
    this._mainReader.on('sheet',this.onSheetFound.bind(this));
    this._mainReader.on('ready',this.onMainReady.bind(this));
    this._contentReader.on('ready',this.onContentReady.bind(this));
    this._relationReader.on('ready',this.onRelationsReady.bind(this));
    */
    return this;
}

sheeter_utils.inherits(XLSXReader,EventEmitter,{
    get filename () { return this._filename; },
    set filename (fn) { this._filename=fn; return this; },
    
    get workbook () { return this._workbook; },
    set workbook (fn) { this._workbook=fn; return this; },
    
    get contentReader() { return this._contentReader; },
    get relationReader() { return this._relationReader; },
    get mainReader() { return this._mainReader; },
    get stringReader() { return this._stringReader; }
});



XLSXReader.prototype.open = function (config,cb){
    var zip,
        data,
        zipEntries,
        i,
        m;
    if (typeof config.filename!=='undefined'){
        this.filename = config.filename;
    }
    zip = new Zip(this.filename);
    this.zipEntries = zip.getEntries();
    this._openCallback = cb;
    
    
    this.contentReader.data = this.getEntry('[Content_Types].xml').toString();
    this.contentReader.on('ready',this.onContentReady.bind(this));
    this.contentReader.parse();
    
}

// `getEntry(filename)` returns the decompressed data Buffer of the filename.
// If the file can not be found an error will be thrown. 
XLSXReader.prototype.getEntry=function(filename){
    var i,
        m;
   
    for(i=0,m=this.zipEntries.length;i<m;i+=1){
        if (this.zipEntries[i].entryName == filename.replace(/^\//,'')){
            return this.zipEntries[i].getData();
        }
    }
    throw new Error(filename+' not found');
}

XLSXReader.prototype.onContentReady = function(){
    //console.log('content ready');
    this.stringReader.data = this.getEntry(this.contentReader.strings[0]).toString();
    this.stringReader.on('ready',this.onStringReady.bind(this));
    this.stringReader.parse();
}


XLSXReader.prototype.onStringReady = function(){
    //console.log('string ready');
    this.relationReader.data = this.getEntry('xl/_rels/workbook.xml.rels').toString();
    this.relationReader.on('ready',this.onRelationsReady.bind(this));
    this.relationReader.parse();
    
}

XLSXReader.prototype.onRelationsReady = function(){
    //console.log('rel ready');
    this.mainReader.data = this.getEntry(this.contentReader.main).toString();
    this.mainReader.on('ready',this.onMainReady.bind(this));
    this.mainReader.on('sheet',this.onSheetFound.bind(this));
    this.mainReader.parse();
    
}

XLSXReader.prototype.onMainReady = function(){
    var me = this;
    me.emit('mainReady');
}

XLSXReader.prototype.onSheetReady = function(){
    var me = this;
    me.emit('sheetsReady');
}



XLSXReader.prototype.onSheetFound = function(title,index,rid){
    var sheetreader = new SheetReader(),
        me = this,
        config,
        cx,
        sheet;
    
    if (typeof me.workbook!='undefined'){
        sheet = me.workbook.createWorkSheet({
            id: index,
            title: title
        });
    };
    me._intend += 1;
    sheetreader.on('ready',me.onSheetReady.bind(me));
    sheetreader.on('cell',function(c){
        if ((typeof c.t != 'undefined') && (c.t=='s')){
            c.value = me.stringReader.string(c.value);
        }
        if (typeof sheet!='undefined'){
            config = {
                id: c.r,
                value: c.value
            };
            if (typeof c.formula != 'undefined'){
                config.formula = c.formula;
            }
            cx = sheet.getCell(config.id,config);
            if (typeof c.formula == 'undefined'){
                cx.value = c.value;
            }
        }
    });
    sheetreader.data = me.getEntry('xl/'+me.relationReader.relation(rid)).toString();
    sheetreader.parse();
}




exports.XLSXReader = XLSXReader;