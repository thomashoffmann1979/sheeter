"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../utils/utils'),
    Zip = require('adm-zip'),
    sax = require('sax'),
    fs = require('fs'),
    ContentReader = require('./xlsx/content').ContentReader,
    RelationReader = require('./xlsx/rels').RelationReader;


var XLSXReader = function (config){
    this._filename;
    if (typeof config==='undefined'){
        config = {};
    }
    if (typeof config.filename!=='undefined'){
        this.filename = config.filename;
    }
    this._entrieIndex = -1;
    this._readingOrderIndex = -1;
    this.zipEntries;
    this._contentReader = new ContentReader();
    this._relationReader = new RelationReader();
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
    return this;
}

sheeter_utils.inherits(XLSXReader,EventEmitter,{
    get filename () { return this._filename; },
    set filename (fn) { this._filename=fn; return this; },
    
    get contentReader() { return this._contentReader; },
    get relationReader() { return this._relationReader; }
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
    this.readRequired(cb);
}
XLSXReader.prototype.readRequired=function(cb){
    var i,
        m,
        item,
        me=this;
    this._readingOrderIndex+=1;
    if (this._readingOrderIndex< this._readingOrder.length){
        item = this._readingOrder[this._readingOrderIndex];
        console.log(item);
        
        for(i=0,m=this.zipEntries.length;i<m;i+=1){
            
            if (this.zipEntries[i].entryName == item.file){
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