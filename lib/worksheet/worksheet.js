"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../utils/utils'),
    Cell = require('../cell/cell').Cell;


var Worksheet = function(config){
    this._id = 'table1';
    this._title = 'Table 1';
    this._cellHash	=	{};

    if (typeof config!=='undefined'){
        if (typeof config.id!=='undefined'){
            this.id = config.id; /* using the regular setter function */
        }
        if (typeof config.title!=='undefined'){
            this.title = config.title; /* using the regular setter function */
        }
        if (typeof config.workbook!=='undefined'){
            this.workbook = config.workbook; /* using the regular setter function */
        }
    }
}


sheeter_utils.inherits(Worksheet,EventEmitter,{
    get id () { return this._id; },
    set id (t) { this._id = t; return this; },

    get title () { return this._title; },
    set title (t) { this._title = t; return this; },

    get workbook () { return this._workbook; },
    set workbook (w) { this._workbook = w; return this; }
});


Worksheet.prototype.getDimension = function(){
    var cr,
        min_column=999999,
        max_column = -1,
        min_row = 9999999,
        max_row = -1,
        id,
        me=this;
    
    for( id in this._cellHash ){
        cr = sheeter_utils.getColumnAndRow(id);
        if (cr.columnIndex < min_column){
            min_column = cr.columnIndex;
        }
        if (cr.columnIndex > max_column){
            max_column = cr.columnIndex;
        }
        if (cr.row < min_row){
            min_row = cr.row;
        }
        if (cr.row > max_row){
            max_row = cr.row;
        }
    }
    return {
        min_column: min_column,
        max_column: max_column,
        min_row: min_row,
        max_row: max_row
    }
}


Worksheet.prototype.getMatrixByRow = function(config){
    var dim = this.getDimension(),
        c,
        r,
        me = this,
        result = [],
        row,
        id,
        item;
    if (typeof config == 'undefined'){
        config = {}
    }

    if (typeof config.width == 'undefined'){
        config.width = 10;
    }
    
    for( r=dim.min_row; r <= dim.max_row; r+=1){
        row = [];
        if ((config.header === true) && (r == dim.min_row)){
            if (config.rows === true){
                item = sheeter_utils.alignString('.','c',(dim.max_row+'').length+1);
                row.push(item);
            }
            for( c=dim.min_column; c <= dim.max_column; c+=1){
                item = sheeter_utils.alignString(sheeter_utils.columnStringFromIndex(c)+'','c',config.width);
                row.push(item);  
            }
            result.push(row);
            row = [];
        }
        if (config.rows === true){
            item = sheeter_utils.alignString(r+' ','r',(dim.max_row+'').length+1);
            row.push(item);
        }
        for( c=dim.min_column; c <= dim.max_column; c+=1){
            id = sheeter_utils.columnStringFromIndex(c)+r;
            if (me.has(id)){
                if (config.nice === true){
                    item = (typeof me.getCell(id).value=='undefined')?'#NV':me.getCell(id).value;
                    item = sheeter_utils.alignString(item+'', (isNaN(item))?'l':'r',config.width);
                    row.push(item);
                }else{
                    row.push((typeof me.getCell(id).value=='undefined')?'#NV':me.getCell(id).value);
                }
            }else{
                if (config.nice === true){
                    item = (typeof me.getCell(id).value=='undefined')?'#NV':me.getCell(id).value;
                    item = sheeter_utils.alignString('', (typeof item == 'number')?'r':'l',config.width);
                    row.push(item);
                }else{
                    row.push(null);
                }
            }
        }
        result.push(row);
    }
    return result;
}
Worksheet.prototype.has =  function(id){
    return (typeof this._cellHash[id] != 'undefined');
}

// `getCell(id,config)` get the cell by id, if there is no such cell the cell will be created
Worksheet.prototype.getCell = function(id,/*optional*/config){
    var cell,col_row,scope = this;
    id = id.toUpperCase();

    if (sheeter_utils.isCellNotation(id)){

        col_row = sheeter_utils.getColumnAndRow(id);

        if (typeof col_row.table!=='undefined'){
            if (this.title.toUpperCase() != col_row.table){
                if (typeof this.workbook==='undefined'){
                    throw ReferenzError('There is no workbook for that sheet defined');
                }
                return this.workbook.getWorkSheet(col_row.table).getCell(id,config);
            }else{
                /*in the current sheet, but id did include the table name*/
                id = [col_row.column,col_row.row].join('');
            }
        }

        if (typeof scope._cellHash[id]==='undefined'){
            cell = new Cell();
            cell.id = id;
            cell.worksheet = scope;
            

            cell.on('formulaSyntaxError',function(evt){
                scope.emit('formulaSyntaxError',evt);
            });

            cell.on('formulaError',function(evt){
                scope.emit('formulaError',evt);
            });
            if (typeof config==='undefined'){
                config = {};
            }

            if (typeof config.id!=='undefined'){
                cell.id = config.id;
            }
            if (typeof config.worksheet!=='undefined'){
                cell.worksheet = config.worksheet;
            }
            if (typeof config.value!=='undefined'){
                cell.value = config.value;
            }
            if (typeof config.active!=='undefined'){
                cell.active = config.active;
            }
            if (typeof config.formula!=='undefined'){
                cell.formula = config.formula;
            }

            scope._cellHash[id] = cell;
        }else{
            cell = scope._cellHash[id];
        }
    }else{
        throw new Error('The given id "'+id+'" has an invalid notation');
    }

    return cell;
}


exports.Worksheet = Worksheet;