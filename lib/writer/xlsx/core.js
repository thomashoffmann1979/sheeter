"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var CoreWriter =  function(writer){
    this._data;
    this._writer = writer;
    
    this._parts = [];
    
}


sheeter_utils.inherits(CoreWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

})


CoreWriter.prototype.addPart =  function(partName,contentType){
    this._parts.push({
        PartName: partName,
        ContentType: contentType
    });
}

CoreWriter.prototype.process = function(){
    var xml = new XML('cp:coreProperties'),
        i,
        fileName,
        me = this;
    xml.addAttribute('xmlns:cp','http://schemas.openxmlformats.org/package/2006/metadata/core-properties');
    xml.addAttribute('xmlns:dc','http://purl.org/dc/elements/1.1/');
    xml.addAttribute('xmlns:dcterms','http://purl.org/dc/terms/');
    xml.addAttribute('xmlns:dcmitype','http://purl.org/dc/dcmitype/');
    xml.addAttribute('xmlns:xsi','http://www.w3.org/2001/XMLSchema-instance');

    xml.addElement('dc:creator','Sheeter');
    xml.addElement('cp:lastModifiedBy','Sheeter');
    xml.addElement('dcterms:created','2014-01-30T09:59:52.000Z').addAttribute('xsi:type','dcterms:W3CDTF');
    xml.addElement('dcterms:modified','2014-01-30T10:01:17.000Z').addAttribute('xsi:type','dcterms:W3CDTF');
    /*
    xml.addElement('dc:title','Sheeter - title');
    xml.addElement('dc:subject','Sheeter - subject');
    xml.addElement('dc:description','Sheeter - description');
    xml.addElement('cp:keywords','Sheeter - keywords');
    xml.addElement('cp:category','Sheeter - category');
    */
    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + xml.toXMLString(true);
    
    
    fileName = '/docProps/core.xml';
    me._writer.zip.addFile(fileName.replace(/^\//,''),new Buffer(me._data,'utf8'));
    me.emit('ready',me);
}


exports.CoreWriter = CoreWriter;
                       