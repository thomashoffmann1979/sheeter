"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../utils/utils'),
    Zip = require('adm-zip'),
    sax = require('sax'),
    fs = require('fs'),
    ContentReader = require('./xlsx/content').ContentReader,
    RelationReader = require('./xlsx/rels').RelationReader,
    MainReader = require('./xlsx/main').MainReader,
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
    this.zipEntries;
    this._contentReader = new ContentReader();
    this._relationReader = new RelationReader();
    this._mainReader = new MainReader();
    this._readingOrder = [
        {
            file:'[Content_Types].xml',
            reader: this._contentReader
        },
        {
            file:'xl/_rels/workbook.xml.rels',
            reader: this._relationReader
        }
    ];
    this._mainReader.on('sheet',this.onSheetFound.bind(this));
    this._contentReader.on('ready',this.onContentReady.bind(this));
    this._relationReader.on('ready',this.onRelationsReady.bind(this));
    return this;
}

sheeter_utils.inherits(XLSXReader,EventEmitter,{
    get filename () { return this._filename; },
    set filename (fn) { this._filename=fn; return this; },
    
    get workbook () { return this._workbook; },
    set workbook (fn) { this._workbook=fn; return this; },
    
    get contentReader() { return this._contentReader; },
    get relationReader() { return this._relationReader; }
});

XLSXReader.prototype.onSheetFound = function(title,index,rid){
    console.log(title,index,rid);
    
    var sheetreader = new SheetReader(),
        me = this,
        config,
        sheet;
    
    if (typeof me.workbook!='undefined'){
        sheet = me.workbook.createWorkSheet({
            id: index,
            title: title
        });
    };
    sheetreader.on('ready',function(){
        //console.log('sheet done');
    });
    sheetreader.on('cell',function(c){
        if (typeof sheet!='undefined'){
            config = {
                id: c.r,
                value: c.value
            };
            if (typeof c.formula != 'undefined'){
                config.formula = c.formula;
            }
            sheet.getCell(config)
        } 
        console.log('Cell',c);
    });
    this._readingOrder.push({
        file: 'xl/'+this.relationReader.relation(rid),
        reader: sheetreader
    })
}

XLSXReader.prototype.onCellFound = function(id,value,formula){
    console.log(title,index,rid);
}

XLSXReader.prototype.onContentReady = function(){
    //console.log(this._contentReader.main);
    this._readingOrder.push({
        file: this._contentReader.main,
        reader: this._mainReader
    })
}


XLSXReader.prototype.onRelationsReady = function(){
    //console.log(this._contentReader.main);
}

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
    this.readRequired(cb);
}

// `readRequired(callback)` read asyncronly all files from the
// `_readingOrder` array. This array contains some needed
// files basicly, but it may be grow up during reading 
// catalog files (and so on ..).
// On an error reading the files will be stoped and the callback
// will be executed with the thrown error `callback(error)`
XLSXReader.prototype.readRequired=function(cb){
    var i,
        m,
        item,
        me=this;
    this._readingOrderIndex+=1;
    if (this._readingOrderIndex< this._readingOrder.length){
        item = this._readingOrder[this._readingOrderIndex];
        
        for(i=0,m=this.zipEntries.length;i<m;i+=1){
            if (this.zipEntries[i].entryName == item.file.replace(/^\//,'')){
                item.reader.data = this.zipEntries[i].getData().toString();
                item.reader.parse(function(err){
                    if (err){
                        return cb(err);
                    }
                    me.readRequired(cb);
                });
                return;
            }
        }
        return cb(new Error('the required file '+item.file+' is missing'));
    }else{
        return cb(null);
    }
}



exports.XLSXReader = XLSXReader;