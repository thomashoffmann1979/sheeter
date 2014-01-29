"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var SheetWriter =  function(writer){
    this._data;
    this._writer = writer;
}


sheeter_utils.inherits(SheetWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }
});

/*
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">
    <dimension ref="A1:C6"/>
    <sheetViews>
        <sheetView tabSelected="1" workbookViewId="0"><selection activeCell="C2" sqref="C2"/>
        </sheetView>
    </sheetViews>
    <sheetFormatPr baseColWidth="10" defaultRowHeight="15" x14ac:dyDescent="0"/>
    <sheetData>
        <row r="1" spans="1:3">
            <c r="A1"><v>1</v></c>
            <c r="B1" t="s"><v>0</v></c>
            <c r="C1"><f>SUM(A1:A6)</f><v>21</v></c>
        </row>
        <row r="2" spans="1:3"><c r="A2"><v>2</v></c></row>
        <row r="3" spans="1:3"><c r="A3"><v>3</v></c></row>
        <row r="4" spans="1:3"><c r="A4"><v>4</v></c></row>
        <row r="5" spans="1:3"><c r="A5"><v>5</v></c></row>
        <row r="6" spans="1:3"><c r="A6"><v>6</v></c></row>
    </sheetData>
    <pageMargins left="0.75" right="0.75" top="1" bottom="1" header="0.5" footer="0.5"/>
    <extLst>
        <ext uri="{64002731-A6B0-56B0-2670-7721B7C09600}" xmlns:mx="http://schemas.microsoft.com/office/mac/excel/2008/main">
            <mx:PLV Mode="0" OnePage="0" WScale="0"/>
        </ext>
    </extLst>
</worksheet>
*/

SheetWriter.prototype.process = function(sheet){
    var me = this,
        r,
        c,
        m,
        cc,
        row,
        memCells,
        str,
        byRow = sheet.getMatrixByRow({
            pureCell: true
        });
    me._data = '';
    me._data += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n";
    me._data += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'+"\n";
    me._data += '<dimension ref="A1:C6"/>'+"\n";
    
    

    me._data += '<sheetData>';
    for(r=0,m=byRow.length; r<m; r+=1){
        row = byRow[r];
        memCells = [];
        for(c=0,cc=row.length; c<cc; c+=1){
            if (row[c] != null){
                str = '';
                if (typeof row[c].value == 'number'){
                   str += '<v>'+row[c].value+'</v>';
                }else{
                   str += '<t>'+row[c].value+'</t>';
                }
                if (typeof row[c].formula !== 'undefined'){
                    str += '<f>'+(row[c].formula.replace(/^=/,''))+'</f>';
                }
                memCells.push( '<c r="'+row[c].id+'">'+str+'</c>' );
            }
        }
        me._data += '<row r="'+(r+1)+'">'+(memCells.join(''))+'</row>';
    }
    me._data += '</sheetData>';
    me._data += '</worksheet>';
    console.log(me._data);
    me.emit('ready');
}

exports.SheetWriter = SheetWriter;