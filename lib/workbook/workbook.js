// The `Workbook` object conains all worksheets.

var EventEmitter = process.EventEmitter,
		util = require('util'),
		Cell = require('../cell/cell').Cell,
		Cell = require('../cell/cell').Cell,
		Worksheet = require('../worksheet/worksheet').Worksheet,
		FunctionStore = require('../formulas/functions').FunctionStore;


var Workbook = function(){
	this._worksheetHash	=	{};
	this._worksheetIndex = 0;
	this._worksheetDefaultName = 'Table';
	
	this.functionStore = new FunctionStore();
}
util.inherits(Workbook,EventEmitter);
// `createWorkSheet()`
Workbook.prototype.createWorkSheet =  function(config){
	this._worksheetIndex+=1;
	
	if (typeof config==='undefined'){
		config={};
	}
	
	if (typeof config.id==='undefined'){
		config.id=this._worksheetIndex;
	}
	
	if (typeof config.title==='undefined'){
		config.title=[this._worksheetDefaultName,this._worksheetIndex].join(' ');
	}
	
	config.workbook = this;
	var sheet = new Worksheet(config);
	
	return sheet;
}


exports.Workbook = Workbook;