var list = require('./functions/index').basicList;

// `FunctionStore` is the formulas registry.
function FunctionStore(){
	this._functions={};
	this._aliasNames={};
	
	this.loadBasicFunctions();
}

// `byAlias(alias)` returns the real functionName for the given *alias*.
// If there is no such alias, the *alias* parameter will be returned.
FunctionStore.prototype.byAlias = function(alias){
	if (typeof this._aliasNames[alias.toUpperCase()] === 'string'){
		return this._aliasNames[alias.toUpperCase()];
	}
	return alias;
}

// `has(functionName)` checks if the function with the *functionName* is allready registered.
FunctionStore.prototype.has = function(functionName){
	var fn = this.byAlias(functionName.toUpperCase());
	if (typeof this._functions[fn] === 'function'){
		return true;
	}
	return false;
}

// `hasAlias(alias)` checks if the alias with the *alias* is allready registered.
FunctionStore.prototype.hasAlias = function(alias){
	if (typeof this._aliasNames[alias.toUpperCase()] === 'string'){
		return true;
	}
	return false;
}

// `register(functionName,aliases,fn)` registers the functionName, the aliases and the function.
FunctionStore.prototype.register = function(functionName,aliases,fn){
	var i,m;
	if (this.hasAlias(functionName)){
		throw Error('There is allready such an alias registered.');
	}
	if (this.has(functionName)){
		throw Error('There is allready such an function registered.');
	}
	if (typeof fn!=='function'){
		throw Error('There is no function given.');
	}
	try{
		functionName = functionName.toUpperCase();
		for(i=0,m=aliases.length; i<m; i+=1){
			this._aliasNames[aliases[i].toUpperCase()] = functionName;
		}
		this._functions[functionName]=fn;
	}catch(e){
		throw Error('Some input parameters are wrong.');
	}
}
// `loadBasicFunctions()` register all basic functions.
// This function will be called during the object initialization.
FunctionStore.prototype.loadBasicFunctions = function(){
	var i,m,f;
	for(i=0,m=list.length; i<m; i+=1){
		f = require('./functions/'+list[i]);
		if (typeof f!=='undefined'){
			if (typeof f.name!=='string'){
				throw('The basic function *'+list[i]+'* dont have the name string exported.');
			}
			if (typeof f.aliases==='undefined'){
				throw('The basic function *'+list[i]+'* dont have the alias array exported.');
			}
			if (typeof f.call!=='function'){
				throw('The basic function *'+list[i]+'* dont have the call function exported.');
			}
			this.register(f.name,f.aliases,f.call);
		}else{
			throw('The basic function *'+list[i]+'* could not be loaded.');
		}
	}
}


exports.FunctionStore = FunctionStore;