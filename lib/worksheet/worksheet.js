"use strict"

var EventEmitter = process.EventEmitter;
var util = require('util');


var randomString =  function(){
	return "abc0123";
}

var Worksheet = function(){
	this._id = randomString();
	this._title;
	
	this._cellHash={};
	
}

Worksheet.prototype = {
	get title () { return this._title; },
	set title (t) { this._title = t; return this; },
	
	get workbook () { return this._workbook; },
	set workbook (w) { this._workbook = w; return this; }

}

Worksheet.prototype.getCell = function(id){
	if (typeof this._cellHash[id]==='undefined'){
		this._cellHash[id] = new Cell();
		this._cellHash[id].id = id;
		this._cellHash[id].worksheet = this.worksheet;
		this._cellHash[id].workbook = this.workbook;
	}
	
	return this._cellHash[id];
}