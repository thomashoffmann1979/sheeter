// This module contains the forumla parser.
//

var regexSN = /^[1-9]{1}(\.[0-9]+)?E{1}$/;
var errorRegEx = /#NULL!|#DIV\/0!|#VALUE!|#REF!|#NAME\?|#NUM!|#N\/A/g;
var scientific_notation = /\+\-/g;
var multi_comparators = />=|<=|<>/g;
var standard_operators = /\+|\-|\*|\/|\^|\&|=|>|</g;
var postfix_operators = /\%/g;

var keywords = {
	subtype: {
		start: 				'start',
		stop: 				'stop',
		number: 			 'number',
		text: 				'text',
		logical: 			 'logical',
		union: 				'union',
		math: 				'math',
		concat: 			 'concat',
		range: 			 	'range'
	},
	type: {
		'function': 		'function',
		subexpression:	 'subexpression',
		argument: 		  'argument',
		whitespace: 		'whitespace',
		literal: 			 'literal',
		postfix: 			 'postfix',
		prefix: 			 'prefix',
		operand: 			 'operand',
		intersect: 		  'intersect',
		unkown: 			 'unkown',
		noop: 				'noop'
	}
}

// An `Token` is the smallest part in a formula.
function Token(value, type, subtype) {
	this.value = value;
	this.type = type;
	this.subtype = (subtype)?subtype:'';
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
		if (this._cursor>=this._items.length-1) return true;
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

// `replaceTripple(new_token)` repalces the previous,current and next Token with the
// given new token. Throws an error if there is nor previous or next item.
TokenList.prototype.replaceTripple =  function(new_token){
	if (this._eol() || this._bol()){
		throw Error('The operation is not allowed at the current position');
	}
	var part1 = this._items.slice(0,this._cursor-1);
	var part2 = this._items.slice(this._cursor+2);
	this._items = part1;
	this.add(new_token);
	this._items = this._items.concat(part2);
	this._cursor-=1; // go one back!
}

// `shrink()` removes the first and the last element of the List.
// If there are not enough elements in the list an error will be thrown.
// If nessesary the cursor will be set to the last position.
TokenList.prototype.shrink = function(){
	if (this._items.length<2){
		throw Error('There are not enought element in the List.');
	}
	this._items = this._items.slice(1,this._items.length-1);
	if (this._cursor>this._items.length){
		this._cursor=this._items.length-2;
	}
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
	if(this._empty()){ throw Error('There are no elements in the TokenList'); }
	this._cursor = -1;
}

// `add()` add an element to the list.
TokenList.prototype.add = function(){
	if (arguments.length>0){
		if (typeof arguments[0]==='object'){
			this._items.push(arguments[0]);
			return arguments[0];
		}else{
			var token = new Token(arguments[0],arguments[1],arguments[2]);
			this._items.push(token);
			return token;
		}
	}
}

// `TokenStack()` is an internal object for stacking tokens.
function TokenStack(){
	this._items = [];
	
}

// `push(token)` pushes an element on the top of the stack.
TokenStack.prototype.push = function(token){
	if (typeof token==='undefined'){
		throw Error('undefiened tokens are not allowed');
	}
	this._items.push(token);
}

// `pop()` read the top element in the stack and removing it.
TokenStack.prototype.pop = function(){
	if (this._items.length===0){
		return null;
	}
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


// `parse(formula)` parses an as string given formula and returns a TokenList - object.
// If the argument is not as string, an error will be thrown.
function parse(formula){
	if (typeof formula!='string'){
		throw new TypeError('The given formula is not a string');
	}
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
	
	var leading_white_space = /^(\s)*\=/g;
	formula = formula.replace(leading_white_space,'');

	
	var current;
	while (!EOF()) {
		current = currentChar();
		if (in_string) {    
			if (current == '"') {
				if (nextChar() == '"') {
					token_value += '"';
					offset += 1;
				} else {
					in_string = false;
					token_list.add(token_value, keywords.type.literal, keywords.subtype.text);
					token_value = '';
				}      
			} else {
				token_value += current;
			}
			offset += 1;
			continue;    
		}
		if (in_path) {
			if (current == '\'') {
				if (nextChar() == '\'') {
					token_value += '\'';
					offset += 1;
				} else {
					in_path = false;
				}      
			} else {
				token_value += current;
			}
			offset += 1;
			continue;    
		}
		if (in_range) {
			if (current == ']') {
				in_range = false;
			}
			token_value += current;
			offset += 1;
			continue;
		}
		if (in_error) {
			token_value += current;
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
					token_value += current;
					offset += 1;
					continue;
				}
			}
		}
		/*################*/
		if (
			(current == '"') ||
			(current == '\'')
		) {  
			unexpected()
			in_string = true;
			offset += 1;
			continue;
		}
		
		if (current == '[') {
			in_range = true;
			token_value += current;
			offset += 1;
			continue;
		}
		
		if ( current == '#'){  
			unexpected()
			in_error = true;
			offset += 1;
			continue;
		}
		
		if (current == '{') {  
			unexpected()
			token_stack.push(token_list.add('ARRAY', keywords.type.function, keywords.type.start));
			token_stack.push(token_list.add('ARRAYROW', keywords.type.function, keywords.type.start));
			offset += 1;
			continue;
		}
		
		if (current == ';') {  
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_stack.pop();
			//token_list.add();
			token_list.add(',',  keywords.type.argument);
			token_stack.push(token_list.add('ARRAYROW', keywords.type.function, keywords.type.start));
			offset += 1;
			continue;
		}
		
		if (current == '}') {  
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add(token_stack.pop());
			token_list.add(token_stack.pop());
			offset += 1;
			continue;
		}
		
		if (current == ' ') {
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add('', keywords.type.whitespace);
			offset += 1;
			while (( (current=currentChar()) == ' ') && (!EOF())) { 
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
		
		if (standard_operators.test( current )){
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add(current, keywords.type.operand);
			offset += 1;
			continue;     
		}
		
		if (postfix_operators.test( current )){
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add(current, keywords.type.operand);
			offset += 1;
			continue;     
		}
		
		if (current == '(') {
			if (token_value.length > 0) {
				token_stack.push(token_list.add(token_value, keywords.type.function, keywords.subtype.start));
				token_value = '';
			} else {
				token_stack.push(token_list.add('', keywords.type.subexpression, keywords.subtype.start));
			}
			offset += 1;
			continue;
		}
		
		if (current == ',') {
			if (token_value.length > 0) {
				token_list.add(token_value,  keywords.type.literal);
				token_value = '';
			}
			if (!(token_stack.type() ==  keywords.type.function)) {
				token_list.add(current,  keywords.type.operand,  keywords.subtype.union);
			} else {
				token_list.add(current,  keywords.type.argument);
			}
			offset += 1;
			continue;
		}
		
		if (current == ')') {
			if (token_value.length > 0) {
				token_list.add(token_value, keywords.type.literal);
				token_value = '';
			}
			token_list.add(token_stack.pop());
			offset += 1;
			continue;
		}
		token_value += current;
		offset += 1;
	} /*while EOF*/
	if(token_value.length>0){
		token_list.add(token_value, keywords.type.literal);
		token_value='';
	}
	
	var temp_token_list = new TokenList();
	var token, prev, next;
	while (token_list.moveNext()) {
		token = token_list.current();
		
		if(token!=null){
			if (token.type == keywords.type.whitespace) {
				
					prev = token_list.previous();
					next = token_list.next();
					if (typeof next!=='undefined'){
						if ((token_list._bol()) || (token_list._eol())) {
							/*do nothing*/
							
						}else if (!(
							((prev.type == keywords.type.function) && (prev.subtype == keywords.subtype.stop)) || 
							((prev.type == keywords.type.subexpression) && (prev.subtype == keywords.subtype.stop)) || 
							(prev.type == keywords.type.literal)
						)
										 ) {
							/*do nothing*/
							
						}else if (!(
							((next.type == keywords.type.function) && (next.subtype == keywords.subtype.start)) || 
							((next.type == keywords.type.subexpression) && (next.subtype == keywords.subtype.start)) ||
							(next.type == keywords.type.literal)
						)
										 ){
							/*do nothing*/
						}else{
							temp_token_list.add(token.value, keywords.type.operand, keywords.subtype.intersect);
						}
					}
			}else{
				temp_token_list.add(token);
			}
		}// is null
	}
	temp_token_list.reset();
	
	
	while (temp_token_list.moveNext()) {
		token = temp_token_list.current();
		
		if (token!=null){
			prev = temp_token_list.previous();
			
			if ((token.type == keywords.type.operand) && (token.value == "-")) {
				
				if (temp_token_list._bol()){
					token.type = keywords.type.prefix;
				}else if (
					((prev.type == keywords.type.function) && (prev.subtype == keywords.subtype.stop)) || 
					((prev.type == keywords.type.subexpression) && (prev.subtype == keywords.subtype.stop)) || 
					(prev.type == keywords.type.postfix) || 
					(prev.type == keywords.type.literal)
				){
					token.subtype = keywords.subtype.math;
				}else{
					token.type = keywords.type.prefix;
				}
				continue;
			}
			
			if ((token.type == keywords.type.operand) && (token.value == "+")) {
				if (temp_token_list._bol()){
					token.type = keywords.type.noop;
				}else if (
					((prev.type == keywords.type.function) && (prev.subtype == keywords.subtype.stop)) || 
					((prev.type == keywords.type.subexpression) && (prev.subtype == keywords.subtype.stop)) || 
					(prev.type == keywords.type.postfix) || 
					(prev.type == keywords.type.literal)
				){
					token.subtype = keywords.subtype.math;
				}else{
					token.type = keywords.type.noop;
				}
				continue;
			}
			if ((token.type == keywords.type.operand) && (token.subtype.length == 0)) {
				if (("<>=").indexOf(token.value.substr(0, 1)) != -1){
					token.subtype = keywords.subtype.logical;
				}else if (token.value == "&"){
					token.subtype = keywords.subtype.concat;
				}else{
					token.subtype = keywords.subtype.math;
				}
				continue;
			}
			
			if ((token.type == keywords.type.literal) && (token.subtype.length == 0)) {
				if (isNaN(parseFloat(token.value))){
					if ((token.value == 'TRUE') || (token.value == 'FALSE')){
						token.subtype = keywords.subtype.logical;
					}else{
						token.subtype = keywords.subtype.range;
					}
				}else{
					token.subtype = keywords.subtype.number;
				}
				continue;
			}
			
			if (token.type == token.type.function) {
				if (token.value.substr(0, 1) == "@"){
					token.value = token.value.substr(1);
				}
				continue;
			}
		} // is null
	}
	temp_token_list.reset();
	token_list = new TokenList();
	while (temp_token_list.moveNext()) {
		current = temp_token_list.current();
		if ( 
				(current!=null) && 
				(current.type != keywords.type.noob)  && 
				(current.value !='ARRAYROW')
			){
			token_list.add(current);
		}
	}  
	
	token_list.reset();
	
	return token_list;
}


// `executeTokenList(cell,token_list)` executes the given token_list base on the given cell.
// The result of that function is the single value, calculated by the formula.
function execute(cell,token_list){
	var state = '',
			intend=0,
			m,
			i,
			token,
			previous,
			current,
			next,
			subtokens= new TokenList(),
			result_tokens= new TokenList();
	
	while (token_list.moveNext()) {
		token = token_list.current();
		
		
		if (token===null){
			continue;
		}
		if ( (token.type===keywords.type.function) && (token.subtype===keywords.subtype.start)){
			intend+=1;
		}
		if ( (token.type===keywords.type.subexpression) && (token.subtype===keywords.subtype.start)){
			intend+=1;
		}
		 
		if (intend>0){
			subtokens.add(token.value,token.type,token.subtype);
		}else{
			if (
				(token.type===keywords.type.literal) &&
				(token.subtype===keywords.subtype.range)  // change here to support, strings and so on ...
			){
				try{
					var c2 = cell.worksheet.getCell(token.value);
					result_tokens.add(c2.value,"literal",keywords.subtype.number);
				}catch(error){
					//console.log(error);
					return '#REF!'; /*could not fine that cell*/
				}
			}else if (
				(token.type===keywords.type.literal) &&
				(token.subtype===keywords.subtype.number)  // change here to support, strings and so on ...
			){
				result_tokens.add(token.value,keywords.type.literal,keywords.subtype.number);
			}else{
				result_tokens.add(token.value,token.type,token.subtype);
			}
		}
		
		if ( (token.type===keywords.type.subexpression) && (token.subtype===keywords.subtype.stop)){
			intend-=1;
			if (intend===0){
				subtokens.shrink();
				var calculated_value=execute(cell,subtokens);
				if (isNaN(calculated_value)){
					if (errorRegEx.test(calculated_value)){
						return calculated_value;
					}
				}
				subtokens= new TokenList();
				result_tokens.add(calculated_value,keywords.type.literal,keywords.subtype.number);
			}
		}
		
		if ( (token.type===keywords.type.function) && (token.subtype===keywords.subtype.stop)){
			intend-=1;
			if (intend===0){
				calculated_value = executeFunction(cell,subtokens);
				subtokens= new TokenList();
				result_tokens.add(calculated_value,keywords.type.literal,keywords.subtype.number);
			}
		}
		
		
	}
	
	
	
	result_tokens.reset();
	while(result_tokens.moveNext()){
		previous = result_tokens.previous();
		current = result_tokens.current();
		next = result_tokens.next();
		if (
			(previous!=null) ||
			(current!=null) || // should never be null!
			(next!=null)
		){
			if ( 
				(current.type === keywords.type.operand) &&
				(current.subtype === keywords.subtype.math)
			){
				switch(current.value){
					case '*': 
						if (previous.value==''){
							previous.value=0;
						}
						if (next.value==''){
							next.value=0;
						}
						if (isNaN(next.value)){
							return '#VALUE!';
						}
						result_tokens.replaceTripple(new Token(previous.value * next.value,keywords.type.literal,keywords.subtype.number));
						break;
					case '/': 
						if (previous.value==''){
							previous.value=0;
						}
						if (next.value==''){
							next.value=0;
						}
						if (next.value===0){
							return '#DIV/0!';
						}
						if (isNaN(next.value)){
							return '#VALUE!';
						}
						result_tokens.replaceTripple(new Token(previous.value / next.value,keywords.type.literal,keywords.subtype.number));
						break;
				}
			}
		}
		
	}
	result_tokens.reset();
	while(result_tokens.moveNext()){
		previous = result_tokens.previous();
		current = result_tokens.current();
		next = result_tokens.next();
		if (
			(previous!=null) ||
			(current!=null) || // should never be null!
			(next!=null)
		){
			if ( 
				(current.type === keywords.type.operand) &&
				(current.subtype === keywords.subtype.math)
			){
				switch(current.value){
					case '+': 
						if (next.value==''){
							next.value=0;
						}
						if (previous.value==''){
							previous.value=0;
						}
						if (isNaN(next.value)){
							return '#VALUE!';
						}
						result_tokens.replaceTripple(new Token(1*previous.value + 1*next.value,keywords.type.literal,keywords.subtype.number));
						break;
					case '-': 
						if (next.value==''){
							next.value=0;
						}
						if (previous.value==''){
							previous.value=0;
						}
						if (isNaN(next.value)){
							return '#VALUE!';
						}
						result_tokens.replaceTripple(new Token(1*previous.value - 1*next.value,keywords.type.literal,keywords.subtype.number));
						
						break;
					default:
						console.log('not supported math type '+current.value);
						return '#N/A';
						break;
				}
			}
			
			if ( 
				(current.type === keywords.type.operand) &&
				(current.subtype === keywords.subtype.concat)
			){
				switch(current.value){
					case '&': 
						
						result_tokens.replaceTripple(new Token( previous.value +''+ next.value,keywords.type.literal,keywords.subtype.string));
						break;
					default:
						console.log('not supported conact type '+current.value);
						return '#N/A';
						break;
				}
			}
			
			if ( 
				(current.type === keywords.type.operand) &&
				(current.subtype === keywords.subtype.logical)
			){
				switch(current.value){
					case '>': 
						result_tokens.replaceTripple(new Token( previous.value > next.value,keywords.type.literal,keywords.subtype.logical));
						break;
					case '<': 
						result_tokens.replaceTripple(new Token( previous.value < next.value,keywords.type.literal,keywords.subtype.logical));
						break;
					case '<>': 
						result_tokens.replaceTripple(new Token( previous.value != next.value,keywords.type.literal,keywords.subtype.logical));
						break;
					case '=': 
						result_tokens.replaceTripple(new Token( previous.value == next.value,keywords.type.literal,keywords.subtype.logical));
						break;
					default:
						console.log('not supported logical type '+current.value);
						return '#N/A';
						break;
				}
			}
		}
		
	}
	//console.log(result_tokens._items);
	if (result_tokens._bol() && result_tokens._eol()){
		current = result_tokens.current();
		if (current===null){
			return '#N/A';
		}
		return current.value;
	}
	return '#N/A';
	//console.log('calculate result_tokens');
}


function executeFunction(cell,token_list){
	token_list.reset();
	try{
		if(token_list.moveNext()){
			var current = token_list.current();
			if (cell.worksheet.workbook.functionStore.has(current.value)){
				token_list.reset();
				//console.log(cell.worksheet.workbook.functionStore.get(current.value));
				token_list.shrink();
				return cell.worksheet.workbook.functionStore.get(current.value)(cell,token_list);
			}else{
				return '#N/A';
			}
		}else{
			return '#REF!';
		}
	}catch(error){
		console.log(error);
	}
}

exports.TokenList = TokenList;
exports.keywords = keywords;
exports.parse = parse;
exports.execute = execute;