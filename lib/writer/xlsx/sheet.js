"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var SheetWriter =  function(writer){
    this._data;
    this._writer = writer;
    this._strings = writer.stringWriter;
}


sheeter_utils.inherits(SheetWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }
});


SheetWriter.prototype.process = function(sheet){
    var me = this,
        r,
        c,
        m,
        cc,
        row,
        memCells,
        str,
        attr,
        rowAttr,
        dim = sheet.getDimension(),
        byRow = sheet.getMatrixByRow({
            pureCell: true
        });
    me._data = '';
    me._data += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n";
    me._data += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+"\n";
    me._data += '<dimension ref="'+sheeter_utils.columnStringFromIndex(dim.min_column)+dim.min_row+':'+sheeter_utils.columnStringFromIndex(dim.max_column)+dim.max_row+'"/>'+"\n";
    
    

    me._data += '<sheetData>'+"\n";;
    for(r=0,m=byRow.length; r<m; r+=1){
        row = byRow[r];
        memCells = [];
        rowAttr={};
        rowAttr.r = (r+1);
        for(c=0,cc=row.length; c<cc; c+=1){
            if (row[c] != null){
                attr = {};
                attr.r = row[c].id;
                
                str = '';
                if (typeof row[c].value == 'number'){
                   str += '<v>'+row[c].value+'</v>';
                }else{
                   attr.t = 's';
                   str += '<v>'+this._strings.add(row[c].value)+'</v>';
                }
                if (typeof row[c].formula !== 'undefined'){
                    str += '<f>'+(row[c].formula.replace(/^=/,''))+'</f>';
                }
                memCells.push( '<c '+me.attrString(attr)+'>'+str+'</c>' );
            }
        }
        me._data += '<row '+me.attrString(rowAttr)+'>'+(memCells.join(''))+'</row>'+"\n";;
    }
    me._data += '</sheetData>'+"\n";;
    me._data += '</worksheet>'+"\n";;
    me.emit('ready',me);
}
SheetWriter.prototype.attrString = function(attr){
    var str='',
        i;
    
    for( i in attr ){
        if ( str != ''){
            str += ' ';
        }
        str+= i+'="'+attr[i]+'"';
    }
    return str;
}
exports.SheetWriter = SheetWriter;