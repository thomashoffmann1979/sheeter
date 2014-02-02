"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util'),
    comparestrings = require('../../utils/comparestrings').comparestrings;

var StylesWriter =  function(writer){
    this._data;
    this._writer = writer;
    this._contents = this._writer.contentWriter;
    this._relation = this._writer.relationWriter;
}


sheeter_utils.inherits(StylesWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

})


StylesWriter.prototype.addPart =  function(partName,contentType){
    this._parts.push({
        PartName: partName,
        ContentType: contentType
    });
}

StylesWriter.prototype.process = function(){
    var xml = new XML('styleSheet'),
        i,
        fileName,
        me = this,
        font,
        fonts,
        fills,
        border,
        relId,
        formats,
        borders,
        styles,
        style,
        extLst,
        ext;
    
    xml.addAttribute('xmlns','http://schemas.openxmlformats.org/spreadsheetml/2006/main');
    xml.addAttribute('xmlns:mc','http://schemas.openxmlformats.org/markup-compatibility/2006');
    xml.addAttribute('mc:Ignorable','x14ac');
    xml.addAttribute('xmlns:x14ac','http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac');
    
    //formats = xml.addElement('numFmts').addAttribute('count','0');
    
    
    fonts = xml.addElement('fonts').addAttribute('count','1').addAttribute('x14ac:knownFonts','1');
    font = fonts.addElement('font');
    font.addElement('sz').addAttribute('val','12');
    font.addElement('color').addAttribute('theme','1');
    font.addElement('name').addAttribute('val','Calibri');
    font.addElement('family').addAttribute('val','2');
    font.addElement('scheme').addAttribute('val','minor');
 
    
    fills = xml.addElement('fills').addAttribute('count','2');
    fills.addElement('fill').addElement('patternFill').addAttribute('patternType','none');
    fills.addElement('fill').addElement('patternFill').addAttribute('patternType','gray125');
    
    
    borders = xml.addElement('borders').addAttribute('count','1')
    border = borders.addElement('border');
    border.addElement('left');
    border.addElement('right');
    border.addElement('top');
    border.addElement('bottom');
    border.addElement('diagonal');
    
    
    xml.addElement('cellStyleXfs').addAttribute('count','1')
        .addElement('xf')
        .addAttribute('numFmtId','0')
        .addAttribute('fontId','0')
        .addAttribute('fillId','0')
        .addAttribute('borderId','0');
    
    
    // if one of the following styles is missing
    // the excel can't be opened on excel mac (2011)
    styles = xml.addElement('cellXfs').addAttribute('count','0');
    style = styles.addElement('xf');
    style.addAttribute('numFmtId','0');
    style.addAttribute('fontId','0');
    style.addAttribute('fillId','0');
    style.addAttribute('borderId','0');
    style.addAttribute('xfId','0');
    
    style = styles.addElement('xf',null);
    style.addAttribute('xfId','0');
    style.addAttribute('fillId','0');
    style.addAttribute('borderId','0');
    style.addAttribute('fontId','0');
    style.addAttribute('numFmtId','0');
    
    //<xf xfId="0" fillId="0" borderId="0" fontId="0" numFmtId="0"></xf>
    
    if (false){
    xml.addElement('cellStyles').addAttribute('count','1')
        .addElement('cellStyle')
        .addAttribute('name','Normal')
        .addAttribute('xfId','0')
        .addAttribute('builtinId','0');
    }
    
    if (false){
    xml.addElement('dxfs').addAttribute('count','0');
    }
    if (false){
    xml.addElement('tableStyles').addAttribute('count','0')
        .addAttribute('defaultTableStyle','TableStyleMedium2')
        .addAttribute('defaultPivotStyle','PivotStyleLight16');
    }
    if (false){
    extLst = xml.addElement('extLst');
    ext = extLst.addElement('tableStyles').addAttribute('uri','{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}')
        .addAttribute('xmlns:x14','http://schemas.microsoft.com/office/spreadsheetml/2009/9/main');
    ext.addElement('x14:slicerStyles').addAttribute('defaultSlicerStyle','SlicerStyleLight1');
    }

    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + xml.toXMLString(true);
    
    
    fileName = '/xl/styles.xml';
    me._contents.addPart(fileName,'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml');
    relId = me._relation.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',fileName.replace(/^\/xl\//,''));
    me._writer.folder_xl.file('styles.xml',me._data);
    //me._writer.zip.addFile(fileName.replace(/^\//,''),new Buffer(me._data,'utf8'));
    me.emit('ready',me);
}


exports.StylesWriter = StylesWriter;
