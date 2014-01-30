"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var StringWriter =  function(writer){
    this._data;
    this._writer = writer;
    this._strings = [];
    this._stringsIndex = -1;
}


sheeter_utils.inherits(StringWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

})

StringWriter.prototype.add=function(str){
    var i = this._strings.indexOf(str);
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
        xml = new XML('sst');

    me._data = '';
    me._data += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n";

    xml.addAttribute('xmlns','http://schemas.openxmlformats.org/spreadsheetml/2006/main');
    xml.addAttribute('count',this._strings.length);
    xml.addAttribute('uniqueCount',this._strings.length);

    for( i in this._strings ){
        xml.addElement('si')
            .addElement('t',this._strings[i])
    }
    me._data += xml.toXMLString(true);
    me.emit('ready',me);
}

exports.StringWriter = StringWriter;