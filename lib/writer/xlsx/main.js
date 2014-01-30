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
    me._data += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n";
    me._xml.addAttribute('xmlns','http://schemas.openxmlformats.org/spreadsheetml/2006/main');
    me._xml.addAttribute('xmlns:r','http://schemas.openxmlformats.org/officeDocument/2006/relationships');
    
    me._xml.addElement('fileVersion')
        .addAttribute('appName','xl')
        .addAttribute('lastEdited','1')
        .addAttribute('lowestEdited','1')
    
    
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
    
        console.log(wr.data);
    }
    
    
    if (me._writer.sheetListIndex < me._writer.sheetList.length - 1){
        
        me._writer.sheetListIndex += 1;
        me._sheetWriter.process( me._writer.sheetList[me._writer.sheetListIndex] ,me._writer.sheetListIndex+1 );
    }else{
        me._data += me._xml.toXMLString(true);
        
        
        //me._contents.addPart('/xl/sharedStrings.xml','application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml');
        //relId = me._relation.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',fileName);
    
        fileName = '/xl/workbook.xml';
        me._contents.addPart(fileName,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml');
        me._writer.zip.addFile(fileName,new Buffer(me._data,'utf8'));
        me.emit('ready',me,relId,fileName);
    }
}


/*
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="23206"/>
    <workbookPr showInkAnnotation="0" autoCompressPictures="0"/>
    <bookViews>
        <workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="14840" tabRatio="500"/>
    </bookViews>
    <sheets>
        <sheet name="Blatt1" sheetId="1" r:id="rId1"/>
    </sheets>
    <calcPr calcId="140000" concurrentCalc="0"/>
    <extLst>
    <ext uri="{7523E5D3-25F3-A5E0-1632-64F254C22452}" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main">
        <mx:ArchID Flags="2"/>
    </ext>
    </extLst>
</workbook>
*/
exports.MainWriter = MainWriter;