"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var RelationWriter =  function(writer){
    this._data;
    this._writer = writer;
    
    this._rels = [];
}


sheeter_utils.inherits(RelationWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

});

RelationWriter.prototype.addRelation =  function(Type,Target){
    this._rels.push({
        Id: 'rId'+(this._rels.length+1),
        Type: Type,
        Target: Target
    });
    return this._rels[this._rels.length-1].Id;
}

RelationWriter.prototype.process = function(){
    var xml = new XML('Relationships'),
        i,
        fileName,
        me=this;
    xml.addAttribute('xmlns','http://schemas.openxmlformats.org/package/2006/relationships');
    
    for(i in me._rels){
        xml.addElement('Relationship')
            .addAttribute('Id',me._rels[i].Id)
            .addAttribute('Type',me._rels[i].Type)
            .addAttribute('Target',me._rels[i].Target);
    }
    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n" + xml.toXMLString(true);
     
    
    
    
    fileName = '/xl/_rels/workbook.xml.rels';
    me._writer.zip.addFile(fileName,new Buffer(me._data,'utf8'));
    me.emit('ready',me,fileName);
}



exports.RelationWriter = RelationWriter;