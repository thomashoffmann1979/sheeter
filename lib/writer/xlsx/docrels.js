"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var DocumentRelationWriter =  function(writer){
    this._data;
    this._writer = writer;
    
    this._rels = [];
}


sheeter_utils.inherits(DocumentRelationWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

});

DocumentRelationWriter.prototype.addRelation =  function(Type,Target){
    this._rels.push({
        Id: 'rId'+(this._rels.length+1),
        Type: Type,
        Target: Target
    });
    return this._rels[this._rels.length-1].Id;
}

DocumentRelationWriter.prototype.process = function(){
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
    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + xml.toXMLString(true);
    
    fileName = '/_rels/.rels';
    me._writer.zip.addFile(fileName.replace(/^\//,''),new Buffer(me._data,'utf8'));
    me.emit('ready',me,fileName);
}


/*
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/calcChain" Target="calcChain.xml"/>
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>
*/
exports.DocumentRelationWriter = DocumentRelationWriter;