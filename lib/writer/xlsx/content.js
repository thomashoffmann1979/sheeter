"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var ContentWriter =  function(writer){
    this._data;
    this._writer = writer;
    
    this._parts = [];
    
}


sheeter_utils.inherits(ContentWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

})


ContentWriter.prototype.addPart =  function(partName,contentType){
    this._parts.push({
        PartName: partName,
        ContentType: contentType
    });
}

ContentWriter.prototype.process = function(){
    var xml = new XML('Types'),
        i,
        fileName,
        me = this;
    xml.addAttribute('xmlns','http://schemas.openxmlformats.org/package/2006/content-types');
    xml.addElement('Default')
        .addAttribute('Extension','xml')
        .addAttribute('ContentType','application/xml');
    xml.addElement('Default')
        .addAttribute('Extension','rels')
        .addAttribute('ContentType','application/vnd.openxmlformats-package.relationships+xml');
    /*
    xml.addElement('Default')
        .addAttribute('Extension','jpeg')
        .addAttribute('ContentType','image/jpeg');
    */
    for(i in me._parts){
        xml.addElement('Override')
            .addAttribute('PartName',me._parts[i].PartName)
            .addAttribute('ContentType',me._parts[i].ContentType);
    }
    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + xml.toXMLString(true);
    
    fileName = '/[Content_Types].xml';
    //me._writer.zip.file('[Content_Types].xml',me._data);
    me._writer.zip.addFile(fileName.replace(/^\//,''),new Buffer(me._data,'utf8'));
    me.emit('ready',me);
}

exports.ContentWriter = ContentWriter;
                       