"use strict"

var EventEmitter = process.EventEmitter,
		sheeter_utils= require('../utils/utils'),
		Cell = require('../cell/cell').Cell


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