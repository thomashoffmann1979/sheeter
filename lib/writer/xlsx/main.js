"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util'),
    SheetWriter = require('./sheet').SheetWriter;

var MainWriter =  function(writer){
    this._data;
    this._writer = writer;
    this._contents = writer.contentWriter;
    this._sheetWriter = new SheetWriter(writer);
    this._xml = new XML('workbook');
    this._xmlSheets = this._xml.addElement('sheets');
}


sheeter_utils.inherits(MainWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

});

MainWriter.prototype.process=function(){
    var me = this;

    me._data = '';
    me._data += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\r\n";
    me._xml.addAttribute('xmlns','http://schemas.openxmlformats.org/spreadsheetml/2006/main');
    me._xml.addAttribute('xmlns:r','http://schemas.openxmlformats.org/officeDocument/2006/relationships');
    
    me._xml.addElement('workbookPr')
        .addAttribute('codeName','ThisWorkbook');
    
    me._xml.addElement('bookViews')
        .addElement('workbookView')
            .addAttribute('activeTab','0')
            .addAttribute('autoFilterDateGrouping','1')
            .addAttribute('minimized','0')
            .addAttribute('showHorizontalScroll','1')
            .addAttribute('showSheetTabs','1')
            .addAttribute('tabRatio','600')
            .addAttribute('showVerticalScroll','1')
            .addAttribute('visibility','visibility');
    
    
    me._xml.addElement('fileVersion')
        .addAttribute('appName','xl')
        .addAttribute('lastEdited','4')
        .addAttribute('lowestEdited','4')
        .addAttribute('rupBuild','4505')
    
    me._xml.addElement('calcPr')
        .addAttribute('calcId','1')
        .addAttribute('calcMode','auto')
        .addAttribute('fullCalcOnLoad','1');
        
    me._sheetWriter.on('ready',me.sheetReady.bind(me));
    me.sheetReady();
}

MainWriter.prototype.sheetReady = function(wr,index,title,relation,filename){
    var me = this,
        sh,
        fileName,
        relId;
    if (me._writer.sheetListIndex > -1){
        this._xmlSheets.addElement('sheet')
            .addAttribute('name',title)
            .addAttribute('sheetId',index)
            .addAttribute('r:id',relation)
    
        
    }
    
    
    if (me._writer.sheetListIndex < me._writer.sheetList.length - 1){
        
        me._writer.sheetListIndex += 1;
        me._sheetWriter.process( me._writer.sheetList[me._writer.sheetListIndex] ,me._writer.sheetListIndex+1 );
    }else{
        me._data += me._xml.toXMLString(true);
        
        
        //me._contents.addPart('/xl/sharedStrings.xml','application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml');
        //relId = me._relation.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',fileName);
    
        fileName = '/xl/workbook.xml';
        console.log(me._data);
        me._contents.addPart(fileName,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml');
        me._writer.zip.addFile(fileName.replace(/^\//,''),new Buffer(me._data,'utf8'));
        me.emit('ready',me,relId,fileName);
    }
}


exports.MainWriter = MainWriter;