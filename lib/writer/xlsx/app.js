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
        me = this,
        head,
        vector,
        title;
    xml.addAttribute('xmlns','http://schemas.openxmlformats.org/officeDocument/2006/extended-properties');
    xml.addAttribute('xmlns:vt','http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes');

    xml.addElement('Application','Sheeter');
    xml.addElement('DocSecurity','0');
    xml.addElement('ScaleCrop','false');


    head = xml.addElement('HeadingPairs','false');

    vector = head.addElement('vt:vector').addAttribute('size','2').addAttribute('baseType','variant');
    vector.addElement('vt:variant').addElement('vt:lpstr','Worksheets')
    vector.addElement('vt:variant').addElement('vt:i1','1') // set this value!!

    title = xml.addElement('TitlesOfParts');
    vector = title.addElement('vt:vector').addAttribute('baseType','lpstr').addAttribute('size','1');
    vector.addElement('vt:lpstr','Blatt1')

    xml.addElement('Company','my firm');

    xml.addElement('LinksUpToDate','false');
    xml.addElement('SharedDoc','false');
    xml.addElement('HyperlinksChanged','false');
    xml.addElement('AppVersion','12.0000');

    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n" + xml.toXMLString(true);

    fileName = '/docProps/app.xml';
    me._writer.zip.addFile(fileName,new Buffer(me._data,'utf8'));
    me.emit('ready',me);
}


exports.AppWriter = AppWriter;
