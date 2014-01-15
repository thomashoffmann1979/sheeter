// The cell is the smalles unit, with that the user can interact.
// This object represents the datastructe of that cell. That cell
// inherits the functions from the EventEmitter, so it is event-driven.
// 
// Events
// ------
// Every event fires only one argument. That argument is an object with 
// detailed information to that event. At least that object has two properties.
// *id* is cell-id of the cell, within the current worksheet. *worksheet* is the worksheet-id, 
// within the current worksheet. If an event is fired up by some calcuations, there can also
// be the *triggerID*-property. That property will be used to determine circut-calculations.
//
// * **changed** fires, if the value of that cell has been changed
// * **formulaError** fires, if an error occurs in the formula-calculation
// * **formulaSyntaxError** fires, if the syntax is not valid
// * **unkownFunction** fires, if there is an unkown function in the formula

var util = require('util'),
		EventEmitter = require('events').EventEmitter,
		sheeter_utils= require('../utils/utils.js');

var Cell = function(){
	this._cellID;
	this._value = 0;
	this._formula;
	this._worksheet;
	this._workbook;
	this._isActive=true; // default, true
	this._triggerIndex=0;
	this._connected_cells = [];
	this._referenced_cells = [];
}
util.inherits(Cell,EventEmitter);

Cell.prototype = {
	get id () { return this._cellID; },
	set id (i) { 
		if (sheeter_utils.isCellNotation(i)){
			this._cellID = i; 
		}else{
			throw Error('There is no valid ID given');
		}
		return this; 
	},
	
	get active () { return this._isActive; },
	set active (v) { this._isActive = v; return this; },
	
	get value () { return this._value; },
	set value (v) { this._value = v; return this; },
	
	get formula () { return this._formula; },
	set formula (f) { this._formula = f; return this; },
	
	get table () { return this._table; },
	set table (t) { this._table = t; return this; },
	
	get worksheet () { return this._worksheet; },
	set worksheet (w) { this._worksheet = w; return this; },
	
	get workbook () { return this._workbook; },
	set workbook (w) { this._workbook = w; return this; }
	
}


Cell.prototype.calculate = function(){
	var triggerID,callback,i;
	for(i=0;i<arguments.length;i+=1){
		if (typeof arguments[i]==='function'){
			callback=arguments[i];
		}else{
			if (i===0){
				triggerID=arguments[i];
			}
		}
	}
	if (this.active){ // only calculate if the cell is activated, helpfull on loading sheets
		if(typeof triggerID === 'undefined'){
			triggerID = this._cellID+'.'+(this._triggerIndex++);
		}
	}
}
exports.Cell = Cell;