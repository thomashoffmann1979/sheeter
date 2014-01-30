"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var SheetWriter =  function(writer){
    this._data;
    this._writer = writer;
    this._strings = writer.stringWriter;
    this._contents = writer.contentWriter;
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
        }),
        xml = new XML('worksheet'),
        sd,
        rd,
        cd;
    
    xml.addElement('dimension')
        .addAttribute('ref',sheeter_utils.columnStringFromIndex(dim.min_column)+dim.min_row+':'+sheeter_utils.columnStringFromIndex(dim.max_column)+dim.max_row);
    sd = xml.addElement('sheetData');
    
    for(r=0,m=byRow.length; r<m; r+=1){
        rd = sd.addElement('row');
        rd.addAttribute('r',(r+1));
        
        row = byRow[r];
        for(c=0,cc=row.length; c<cc; c+=1){
            if (row[c] != null){
                cd = rd.addElement('c');
                cd.addAttribute('r',row[c].id);
                if (typeof row[c].value == 'number'){
                  cd.addElement('v',row[c].value);
                }else{
                   cd.addAttribute('t','s');
                   cd.addElement('v',this._strings.add(row[c].value));
                }
                if (typeof row[c].formula !== 'undefined'){
                    cd.addElement('f',row[c].formula.replace(/^=/,''));
                }
            }
        }
    }
    
    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n" + xml.toXMLString(true);
    
    me._contents.addPart('/xl/worksheets/sheet1.xml','application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');
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