"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var StringWriter =  function(writer){
    this._data;
    this._writer = writer;
    this._contents = writer.contentWriter;
    this._relation = writer.relationWriter;
    this._strings = [];
    this._stringsIndex = -1;
    this._stringsCount = 0;
}


sheeter_utils.inherits(StringWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

})

StringWriter.prototype.add=function(str){
    var i = this._strings.indexOf(str);
    
    this._stringsCount += 1;
    if (i < 0){
        this._strings.push(str);
        return this._strings.length - 1;
    }else{
        return i;
    }
}

StringWriter.prototype.process=function(){
    var me = this,
        i,
        xml = new XML('sst'),
        fileName,
        relId;

    
        me._data = '';
        me._data += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

        xml.addAttribute('xmlns','http://schemas.openxmlformats.org/spreadsheetml/2006/main');
        xml.addAttribute('count',this._stringsCount);
        xml.addAttribute('uniqueCount',this._strings.length);

    if (this._strings.length>0){
        for( i in this._strings ){
            xml.addElement('si')
            .addElement('t',this._strings[i])
        }
    }else{
    
            xml.addElement('si')
            .addElement('t')
    }
        me._data += xml.toXMLString(true);

        fileName = '/xl/sharedStrings.xml';
        me._contents.addPart(fileName,'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml');
        relId = me._relation.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',fileName.replace(/^\/xl\//,''));

        me._writer.folder_xl.file('sharedStrings.xml',me._data);
    //me._writer.zip.addFile(fileName.replace(/^\//,''),new Buffer(me._data,'utf8'));
    
    
    me.emit('ready',me,relId,fileName);
}

exports.StringWriter = StringWriter;