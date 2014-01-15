// This module contains the forumla parser.
//

var keywords = {
	subtype: {
		start: 'start',
		stop: 'stop',
		number: 'number',
		text: 'text',
		logical: 'logical',
		union: 'union'
	},
	type: {
		'function': 'function',
		subexpression: 'subexpression',
		argument: 'argument',
		whitespace: 'whitespace',
		literal: 'literal',
		operand: 'operand',
		unkown: 'unkown'
	}
}

// An `Token` is the smallest part in a formula.
function Token(value, type, subtype) {
	this.value = value;
	this.type = type;
	this.subtype = subtype;
}

// The `TokenList` contains a collection of Tokens.
// You can add new Tokens, and navigate through them.
function TokenList(){
	this._items = [];
	this._cursor = -1; /*the current position in the list*/
}

// `_bol()` checks if we are at the begining of the list.
// This function is only for internal use, and may be changed 
// in the future.
TokenList.prototype._bol = function(){
	if (this._cursor<=0) return true;
	return false;
}

// `_eol()` checks if we have reached the end of the list.
// This function is only for internal use, and may be changed 
// in the future.
TokenList.prototype._eol = function(){
	if (this._cursor>this._items.length-1) return true;
	return false;
}

// `_empty()` checks if thee list is empty.
// This function is only for internal use, and may be changed 
// in the future.
TokenList.prototype._empty = function(){
	return this._items.length===0;
}

// The `moveNext()` functions moves the cursor to the next
// position in the list. If the end of the list is reached
// *false* will be returned, otherwise *true*.
TokenList.prototype.moveNext = function(){
	if (this._eol()){
		return false; /*the end is reached*/
	}
	this._cursor++;
	return true;
}

// `current()` returns the current token at the cursor position.
// If the cursor is out of the range *null* will be returned.
TokenList.prototype.current =  function(){
	if (typeof this._items[this._cursor]==='undefined'){
		return null;
	}
	return this._items[this._cursor];
}

// `next()` get the next element in the tokenlist or null.
TokenList.prototype.next = function(){
	if (this._eol()||this._empty()){ return null; }
	return this._items[this._cursor+1];
}

// `previous()` get the previous element in the tokenlist or null.
TokenList.prototype.previous = function(){
	if (this._cursor<1){ return null; }
	return this._items[this._cursor-1];
}
// `reset()` set the cursor at the first position.
TokenList.prototype.reset = function(){
	if(this._empty()){ throw Error('Ther are no elements in the TokenList'); }
	this._cursor = 0;
}

// `add()` add an element to the list.
TokenList.prototype.add = function(){
	if (arguments.length>0){
		if (typeof arguments[0]==='object'){
			this._items.push(arguments[0]);
		}else{
			this._items.push(new Token(arguments[0],arguments[1],arguments[2]));
		}
	}
}

// `TokenStack()` is an internal object for stacking tokens.
function TokenStack(){
	this._items = [];
	
}

// `push(token)` pushes an element on the top of the stack.
TokenStack.prototype.push = function(token){
	this._items.push(token);
}

// `pop()` read the top element in the stack and removing it.
TokenStack.prototype.pop = function(){
	var token = this._items.pop();
	return new Token('',token.type,keywords.subtype.stop);
}

// `last()` read the top element in the stack, without removing it.
TokenStack.prototype.last = function(){
	return ((this._items.length > 0) ? this._items[this._items.length - 1] : null);
}

// `value()` read the value of top element in the stack.
TokenStack.prototype.value = function(){
	return ((this._items.length > 0) ? this._items[this._items.length - 1].value : '');
}

// `type()` read the type of top element in the stack.
TokenStack.prototype.type = function(){
	return ((this._items.length > 0) ? this._items[this._items.length - 1].type : '');
}

// `subtype()` read the type of top element in the stack.
TokenStack.prototype.subtype = function(){
	return ((this._items.length > 0) ? this._items[this._items.length - 1].subtype : '');
}


function parse(formula){
	var token_list = new TokenList();
	var token_stack = new TokenStack();
	var token_value = '';
	var offset = 0;
	
	var in_string = false;
	var in_path = false;
	var in_range = false;
	var in_error = false;
	
	var currentChar = function() { return formula.substr(offset, 1); };
	var doubleChar  = function() { return formula.substr(offset, 2); };
	var nextChar    = function() { return formula.substr(offset + 1, 1); };
	var EOF         = function() { return (offset >= formula.length); };
	var unexpected  = function() {
		if (token_value.length > 0) {
			// not expected
			token_list.add(token_value, keywords.type.unkown);
			token_value = '';
		}
	}
	
	var leading_white_space = /(\s)+\=/g;
	formula = formula.replace(leading_white_space,'');
	
	var regexSN = /^[1-9]{1}(\.[0-9]+)?E{1}$/;
	var errorRegEx = /#NULL!|#DIV\/0!|#VALUE!|#REF!|#NAME\?|#NUM!|#N\/A/g;
	var scientific_notation = /\+\-/g;
	var multi_comparators = />=|<=|<>/g;
	var standard_operators = /\+|\-|\*|\/|\^|\&|=|>|</g;
	var postfix_operators = /\%/g;
	while (!EOF()) {
		if (in_string) {    
			if (currentChar() == '"') {
				if (nextChar() == '"') {
					token_value += '"';
					offset += 1;
				} else {
					in_string = false;
					token_list.add(token_value, keywords.type.literal, keywords.subtype.text);
					token_value = '';
				}      
			} else {
				token_value += currentChar();
			}
			offset += 1;
			continue;    
		}
		if (in_path) {
			if (currentChar() == '\'') {
				if (nextChar() == '\'') {
					token_value += '\'';
					offset += 1;
				} else {
					in_path = false;
				}      
			} else {
				token_value += currentChar();
			}
			offset += 1;
			continue;    
		}
		if (in_range) {
			if (currentChar() == ']') {
				in_range = false;
			}
			token_value += currentChar();
			offset += 1;
			continue;
		}
		if (in_error) {
			token_value += currentChar();
			offset += 1;
			if (errorRegEx.test(token_value)){
				in_error=false;
				token_list.add(token_value,keywords.type.literal,keywords.subtype.error);
				token_value = '';
			}
			continue;
		}
		/*scientific notation*/
		if (scientific_notation.test(token_value)){
			if (token_value.length > 1) {
				if (token_value.match(regexSN)) {
					token_value += currentChar();
					offset += 1;
					continue;
				}
			}
		}
		/*################*/
		if (
			(currentChar() == '"') ||
			(currentChar() == '\'')
		) {  
			unexpected()
			in_string = true;
			offset += 1;
			continue;
		}
		
		if (currentChar() == '[') {
			in_range = true;
			token_value += currentChar();
			offset += 1;
			continue;
		}
		
		if ( currentChar() == '#'){  
			unexpected()
			in_error = true;
			offset += 1;
			continue;
		}
		
		if (currentChar() == '{') {  
			unexpected()
			token_stack.push(token_list.add('ARRAY', keywords.type.function, keywords.type.start));
			token_stack.push(token_list.add('ARRAYROW', keywords.type.function, keywords.type.start));
			offset += 1;
			continue;
		}
		
		if (currentChar() == ';') {  
			unexpected()
			token_list.add(token_stack.pop());
			token_list.add(',',  keywords.type.argument);
			token_stack.push(token_list.add('ARRAYROW', keywords.type.function, keywords.type.start));
			offset += 1;
			continue;
		}
		
		if (currentChar() == '}') {  
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add(token_stack.pop());
			token_list.add(token_stack.pop());
			offset += 1;
			continue;
		}
		
		if (currentChar() == ' ') {
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add('', keywords.type.whitespace);
			offset += 1;
			while ((currentChar() == ' ') && (!EOF())) { 
				offset += 1; 
			}
			continue;     
		}
		if (multi_comparators.test( doubleChar() )){
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add(doubleChar(), keywords.type.operand, keywords.subtype.logical);
			offset += 2;
			continue;     
		}
		
		if (standard_operators.test( currentChar() )){
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add(currentChar(), keywords.type.operand);
			offset += 1;
			continue;     
		}
		
		if (postfix_operators.test( currentChar() )){
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add(currentChar(), keywords.type.operand);
			offset += 1;
			continue;     
		}
		
		if (currentChar() == '(') {
			if (token_value.length > 0) {
				token_stack.push(token_list.add(token_value, keywords.type.function, keywords.subtype.start));
				token_value = '';
			} else {
				token_stack.push(token_list.add("", keywords.type.subexpression, keywords.subtype.start));
			}
			offset += 1;
			continue;
		}
		
		if (currentChar() == ',') {
			if (token_value.length > 0) {
				token_list.add(token_value,  keywords.type.literal);
				token_value = '';
			}
			if (!(token_stack.type() ==  keywords.type.function)) {
				token_list.add(currentChar(),  keywords.type.operand,  keywords.subtype.union);
			} else {
				token_list.add(currentChar(),  keywords.type.argument);
			}
			offset += 1;
			continue;
		}
		
		if (currentChar() == ')') {
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.operand);
				token_value = '';
			}
			token_list.add(token_stack.pop());
			offset += 1;
			continue;
		}
		token_value += currentChar();
		offset += 1;
	} /*while EOF*/
}

exports.parse = parse;