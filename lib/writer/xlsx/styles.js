"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

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
        fills,
        border,
        relId;
    
    xml.addAttribute('xmlns','http://schemas.openxmlformats.org/spreadsheetml/2006/main');
    xml.addAttribute('xml:space','preserve');

    font = xml.addElement('fonts').addAttribute('count','1').addElement('font');
        
    font.addElement('name').addAttribute('val','Calibri');
    font.addElement('sz').addAttribute('val','12');
    font.addElement('color').addAttribute('theme','1');
    font.addElement('family').addAttribute('val','2');
    font.addElement('scheme').addAttribute('val','minor');
     
    
    fills = xml.addElement('fills').addAttribute('count','2');
    fills.addElement('fill').addElement('patternFill').addAttribute('patternType','none');
    fills.addElement('fill').addElement('patternFill').addAttribute('patternType','gray125');
    
    
    border = xml.addElement('borders').addAttribute('count','1').addElement('border');
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
    
    xml.addElement('cellXfs').addAttribute('count','1')
        .addElement('xf')
        .addAttribute('numFmtId','0')
        .addAttribute('fontId','0')
        .addAttribute('fillId','0')
        .addAttribute('borderId','0')
        .addAttribute('xfId','0');

    
    xml.addElement('cellStyles').addAttribute('count','1')
        .addElement('cellStyle')
        .addAttribute('name','Standard')
        .addAttribute('xfId','0')
        .addAttribute('builtinId','0');
    
    xml.addElement('dxfs').addAttribute('count','0');
    
    xml.addElement('tableStyles').addAttribute('count','0')
        .addAttribute('defaultTableStyle','TableStyleMedium9')
        .addAttribute('defaultPivotStyle','PivotStyleMedium4');

    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + xml.toXMLString(true);
    console.log(me._data);
    
    
    fileName = '/xl/styles.xml';
    me._contents.addPart(fileName,'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml');
    relId = me._relation.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',fileName.replace(/^\/xl\//,''));
    me._writer.zip.addFile(fileName.replace(/^\//,''),new Buffer(me._data,'utf8'));
    me.emit('ready',me);
}


exports.StylesWriter = StylesWriter;
