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
// * **beforeChange** fires, before the value of the cell will be changed.
// * **changed** fires, if the value of that cell has been changed.
// * **formulaError** fires, if an error occurs in the formula-calculation.
// * **formulaSyntaxError** fires, if the syntax is not valid.
// * **unkownFunction** fires, if there is an unkown function in the formula.

var util = require('util'),
		EventEmitter = require('events').EventEmitter,
		sheeter_utils= require('../utils/utils');
		formula_parser= require('../formulas/parser');


// The Cell constructer accepts one optional parameter, the configuration object.
// With that configuration you can set:
//
// **Configuration:**
// * *value* the value for that cell
// * *formula* the formula for that cell
// * *worksheet* the referenced worksheet
// * *active* the state for formula-calculations (defaults to true)
// * *id* the id of that cell, within the worksheet
// 
// Keep in mind, the configuration uses the default setter for the configured values.
// So in case of some mistakes, it may happen that some errors are thrown.

var Cell = function(config){//
	
	this._id;
	this._value;
	this._formula;
	this._parsed_formula;
	this._worksheet;
	this._isActive=true; /* default, true */
	this._isDirty = false; /* true if the cell is not active and a calculation was requested */
	this._triggerIndex=0; /* internal counter, for identifying calculation-circuts*/
	this._connected_cells = [];
	this._referenced_cells = [];
	
	if (typeof config!=='undefined'){
		/* take care, the configuration order must be keeped
		 the formula has to be set at the end, because of 
		 disabling calculations and keeping the value */
		if (typeof config.id!=='undefined'){
			this.id = config.id; /* using the regular setter function */
		}
		if (typeof config.worksheet!=='undefined'){
			this.worksheet = config.worksheet; /* using the regular setter function */
		}
		if (typeof config.value!=='undefined'){
			this.value = config.value; /* using the regular setter function */
		}
		if (typeof config.active!=='undefined'){
			this.active = config.active; /* using the regular setter function */
		}
		if (typeof config.formula!=='undefined'){
			this.formula = config.formula; /* using the regular setter function */
		}
	}
}
util.inherits(Cell,EventEmitter);

Cell.prototype = {
	get id () { return this._id; },
	set id (i) { 
		if (sheeter_utils.isCellNotation(i)){
			this._id = i; 
		}else{
			throw Error('There is no valid ID given');
		}
		return this; 
	},
	
	get active () { return this._isActive; },
	set active (v) { this._isActive = v; return this; },
	
	get value () { return this._value; },
	set value (v) { 
		this._isDirty = false;
		this._value = v; 
		//this.emit('changed',this,this);
		return this; 
	},
	
	get formula () { return this._formula; },
	set formula (f) { 
		var old,scope;
		scope = this;
		old = scope._parsed_formula;
		scope._parsed_formula = formula_parser.parse(f);
		scope.calculate(function(err){
			if (err){
				scope._parsed_formula = old;
			}else{
				scope._formula = f; 
			}
		})
	},
	
	get worksheet () { return this._worksheet; },
	set worksheet (w) { 
		this._worksheet = w; 
		return this; 
	},
	
}

// The `calculate([triggerID],[callback])` function calculates the formula.
// If the formula-calculation was successfull, the beforeChange will be emitted.
// If no listener on that event returns false, the value will be written to the
// cells value. Only after that the changed-event will be emitted.
//
// Arguments:
// * *triggerID* optional, the id for the circut-detection
// * *callback* optional, the callback for the calculation *function(err,cell){}*
Cell.prototype.calculate = function(){
	var triggerID,callback,i,m,pf,res;
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
			triggerID = this._id+'.'+(this._triggerIndex++);
		}
		
		// todo: calculation here!
		var result = this.parseTokenTree(this,this._parsed_formula);
		
		if (callback){
			callback(null,this);
		}
	}else{
		this._isDirty=true;
		if (callback){
			callback(null,this);
		}
	}
}
/* using cell argument for later movement */
Cell.prototype.parseTokenTree = function(cell,tokens){
	var state = '',
			intend=0,
			m,
			token,
			subtokens= new formula_parser.Tokens(),
			result_tokens= new formula_parser.Tokens();
	
	while (tokens.moveNext()) {
		token = tokens.current();
		if ( (token.type==='function') && (token.subtype==='start')){
			intend+=1;
		}
		if ( (token.type==='subexpression') && (token.subtype==='start')){
			intend+=1;
		}
		 
		if (intend>0){
			subtokens.add(token.value,token.type,token.subtype);
		}else{
			if (
				(token.type==='operand') &&
				(token.subtype==='range')  // change here to support, strings and so on ...
			){
				try{
					result_tokens.add(cell.worksheet.getCell(token.value).value,"operand","number");
				}catch(error){
					console.log(error);
					result_tokens.add('#NV',"operand","error");
				}
			}else if (
				(token.type==='operand') &&
				(token.subtype==='number')  // change here to support, strings and so on ...
			){
				result_tokens.add(token.value,"operand","number");
			}else{
				result_tokens.add(token.value,token.type,token.subtype);
			}
		}
		if ( (token.type==='subexpression') && (token.subtype==='stop')){
			intend-=1;
			var calculated_value=-1;
			result_tokens.add(calculated_value,"operand","number");
			console.log('sub_calculate EXPRESSION');
		}
		if ( (token.type==='function') && (token.subtype==='stop')){
			intend-=1;
			var calculated_value=2;
			result_tokens.add(calculated_value,"operand","number");
			console.log('sub_calculate FUNCTION');
		}
	}
	console.log(result_tokens.items);
	result_tokens = this.parseMultResultTokens(cell,result_tokens);
	console.log(result_tokens.items);
	result_tokens = this.parseSumResultTokens(cell,result_tokens);
	console.log(result_tokens.items);
	console.log('calculate result_tokens');
}

Cell.prototype.parseMultResultTokens = function(cell,tokens){
	var value,
			first,
			second,
			third,
			result_tokens= new formula_parser.Tokens();
	while(tokens.moveNext()){
		first = tokens.current();
		delete second;
		if (tokens.moveNext()){
			second = tokens.current();
		}else{
			//throw Error('Error in formula');
		}
		third = tokens.next();
		if (third!==null){ // the end is reached!
			if (
				(second!==null) &&
				(second.type === 'operator-infix') && 
				(second.subtype === 'math') &&
				
				(first.type === 'operand') && 
				(first.subtype === 'number') &&
				
				(third.type === 'operand') && 
				(third.subtype === 'number')
			){
				switch(second.value){
					case '*':
						value = first.value * third.value;
						result_tokens.add(value,'operand',"number");
						break;
					case '/': //todo catch DIV by 0!
						value = first.value / third.value;
						result_tokens.add(value,'operand',"number");
						break;
					default:
						result_tokens.add(first.value,first.type,first.subtype);
						result_tokens.add(second.value,second.type,second.subtype);
						//result_tokens.add(third.value,third.type,third.subtype);
						break;
				}
			}else{
				throw Error('Error in formula');
			}
		}
	}

	return result_tokens;
}

Cell.prototype.parseSumResultTokens = function(cell,tokens){
	var value,
			first,
			second,
			third,
			result_tokens= new formula_parser.Tokens();
	while(tokens.moveNext()){
		first = tokens.current();
		delete second;
		if (tokens.moveNext()){
			second = tokens.current();
		}else{
			console.log(first);
			//throw Error('Error in formula');
		}
		third = tokens.next();
		if (third!==null){ // the end is reached!
			if (
				(second!==null) &&
				(second.type === 'operator-infix') && 
				(second.subtype === 'math') &&
				
				(first.type === 'operand') && 
				(first.subtype === 'number') &&
				
				(third.type === 'operand') && 
				(third.subtype === 'number')
			){
				switch(second.value){
					case '+':
						value = (1*first.value) + (1*third.value);
						result_tokens.add(value,'operand',"number");
						break;
					case '-': //todo catch DIV by 0!
						value = (1*first.value) - (1*third.value);
						result_tokens.add(value,'operand',"number");
						break;
					default:
						result_tokens.add(first.value,first.type,first.subtype);
						result_tokens.add(second.value,second.type,second.subtype);
						//result_tokens.add(third.value,third.type,third.subtype);
						break;
				}
			}else{
				throw Error('Error in formula');
			}
		}
	}

	return result_tokens;
}

Cell.prototype.parseSummaryResultTokens = function(cell,tokens){
	var result_tokens= new formula_parser.Tokens();
	
	return result_tokens;
}
exports.Cell = Cell;