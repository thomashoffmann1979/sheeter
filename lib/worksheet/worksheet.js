"use strict"

var EventEmitter = process.EventEmitter,
		util = require('util'),
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

Worksheet.prototype = {
	get id () { return this._id; },
	set id (t) { this._id = t; return this; },

	get title () { return this._title; },
	set title (t) { this._title = t; return this; },
	
	get workbook () { return this._workbook; },
	set workbook (w) { this._workbook = w; return this; }
}

Worksheet.prototype.getCell = function(id){
	if (typeof this._cellHash[id]==='undefined'){
		this._cellHash[id] = new Cell();
		this._cellHash[id].id = id;
		this._cellHash[id].worksheet = this;
	}
	return this._cellHash[id];
}

exports.Worksheet = Worksheet;