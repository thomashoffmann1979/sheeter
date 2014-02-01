"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var SheetWriter =  function(writer){
    this._data;
    this._writer = writer;
    this._strings = writer.stringWriter;
    this._relation = writer.relationWriter;
    
    this._contents = writer.contentWriter;
}


sheeter_utils.inherits(SheetWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }
});


SheetWriter.prototype.process = function(sheet,index){
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
        cd,
        fileName,
        relId;
    
        xml.addAttribute('xmlns','http://schemas.openxmlformats.org/spreadsheetml/2006/main');
    xml.addAttribute('xmlns:r','http://schemas.openxmlformats.org/officeDocument/2006/relationships');
    xml.addAttribute('xmlns:mc','http://schemas.openxmlformats.org/markup-compatibility/2006');
    
    xml.addAttribute('mc:Ignorable','x14ac');
    xml.addAttribute('xmlns:x14ac','http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac');

    xml.addElement('dimension')
        .addAttribute('ref',sheeter_utils.columnStringFromIndex(dim.min_column)+dim.min_row+':'+sheeter_utils.columnStringFromIndex(dim.max_column)+dim.max_row);
    
    xml.addElement('sheetViews').addElement('sheetView').addAttribute('workbookViewId','0');
    xml.addElement('sheetFormatPr').addAttribute('defaultRowHeight','15')
        .addAttribute('x14ac:dyDescent','0.25');
    
    sd = xml.addElement('sheetData');
    
    for(r=0,m=byRow.length; r<m; r+=1){
        rd = sd.addElement('row');
        rd.addAttribute('r',(r+1));
        rd.addAttribute('x14ac:dyDescent','0.25');
        
        row = byRow[r];
        for(c=0,cc=row.length; c<cc; c+=1){
            if (row[c] != null){
                cd = rd.addElement('c');
                cd.addAttribute('r',row[c].id);
                cd.addAttribute('s','1');
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
    
        
    xml.addElement('pageMargins')
        .addAttribute('left','0.7')
        .addAttribute('right','0.7')
        .addAttribute('top','0.75')
        .addAttribute('bottom','0.75')
        .addAttribute('header','0.3')
        .addAttribute('footer','0.3');
    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + xml.toXMLString(true);
    //me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><dimension ref="A1:B1"/><sheetViews><sheetView  workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><sheetData><row r="1" x14ac:dyDescent="0.25"><c r="A1" s="1"><v>1</v></c><c r="B1" s="1"><v>2</v></c></row></sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>';
    fileName = '/xl/worksheets/sheet'+index+'.xml';
    relId = me._relation.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',fileName.replace(/^\/xl\//,''));
    me._contents.addPart(fileName,'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml');
    
    
    me._writer.folder_worksheets.file('sheet'+index+'.xml',me._data);
    //me._writer.zip.addFile(fileName.replace(/^\//,''),new Buffer(me._data,'utf8'));
    me.emit('ready',me,index,sheet.title,relId,fileName);
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