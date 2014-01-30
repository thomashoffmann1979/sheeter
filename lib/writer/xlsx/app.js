"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var AppWriter =  function(writer){
    this._data;
    this._writer = writer;
    
    this._parts = [];
    
}


sheeter_utils.inherits(AppWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

})


AppWriter.prototype.addPart =  function(partName,contentType){
    this._parts.push({
        PartName: partName,
        ContentType: contentType
    });
}

AppWriter.prototype.process = function(){
    var xml = new XML('Properties'),
        i,
        fileName,
        me = this;
    xml.addAttribute('xmlns','http://schemas.openxmlformats.org/officeDocument/2006/extended-properties');
    xml.addAttribute('xmlns:vt','http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes');

    xml.addElement('Application','Sheeter');
    xml.addElement('DocSecurity','0');
    xml.addElement('ScaleCrop','false');
    
    
    xml.addElement('HeadingPairs','false')
        .addElement('vt:vector')
            .addAttribute('size','1')
            .addAttribute('baseType','variant')
            .addElement('vt:variant')
                .addElement('vt:lpstr','Sheets')
            .addElement('vt:variant')
                .addElement('vt:i1','2')
    
    xml.addElement('TitlesOfParts')
        .addElement('vt:vector')
            .addAttribute('size','2')
            .addAttribute('baseType','lpstr')
            .addElement('vt:lpstr','Blatt1')
            .addElement('vt:lpstr','Blatt2')
    
    xml.addElement('Company','my firm');
    
    xml.addElement('LinksUpToDate','false');
    xml.addElement('SharedDoc','false');
    xml.addElement('HyperlinksChanged','false');
    xml.addElement('AppVersion','14.0300');
    
    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n" + xml.toXMLString(true);
    
    fileName = 'docProps/app.xml';
    me._writer.zip.addFile(fileName,new Buffer(me._data,'utf8'));
    me.emit('ready',me);
}


exports.AppWriter = AppWriter;
                       