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

var EventEmitter = require('events').EventEmitter,
    sheeter_utils= require('../utils/utils');
formula_parser= require('../formulas/formulas');


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

// The Cell-object inherits the function-set from the EventEmitter
sheeter_utils.inherits(Cell,EventEmitter,{
    get id () { return this._id; },
    set id (i) { 

        if (sheeter_utils.isCellNotation(i)){
            this._id = i; 
        }else{
            throw new Error('The given id "'+i+'" has an invalid notation');
        }
        return this; 
    },

    get active () { return this._isActive; },
    set active (v) { this._isActive = v; return this; },

    get value () { return this._value; },
    set value (v) { return this._setValue(v); },

    get formula () { return this._formula; },
    set formula (f) { return this._setFormula(f); },

    get worksheet () { return this._worksheet; },
    set worksheet (w) { this._worksheet = w; return this; },

});

Cell.prototype._setFormula= function(f){
    var old,scope,current,list,i,m;
    scope = this;
    old = scope._parsed_formula;
    try{
        /*removeListener */
        if (typeof old!=='undefined'){
            while(old.moveNext()){
                current = old.current();
                if (
                    (current.type === 'literal') &&
                    (current.subtype === 'range')
                ){
                    if (sheeter_utils.isCellNotation(current.value)){
                        scope.worksheet.getCell(current.value).removeListener('changed',scope.calculate.bind(scope));
                    }
                    if (sheeter_utils.isRangeNotation(current.value)){
                        list = sheeter_utils.rangeToArray(current.value);
                        for(i=0,m=list.length;i<m;i+=1){
                            scope.worksheet.getCell(list[i]).removeListener('changed',scope.calculate.bind(scope));
                        }
                    }
                }
            }
            old.reset();
        }
        scope._parsed_formula = formula_parser.parse(f);
        while(scope._parsed_formula.moveNext()){
            current = scope._parsed_formula.current();
            if (
                (current.type === 'literal') &&
                (current.subtype === 'range')
            ){
                if (sheeter_utils.isCellNotation(current.value)){
                    scope.worksheet.getCell(current.value).on('changed',scope.calculate.bind(scope));
                }
                if (sheeter_utils.isRangeNotation(current.value)){
                    list = sheeter_utils.rangeToArray(current.value);
                    for(i=0,m=list.length;i<m;i+=1){
                        scope.worksheet.getCell(list[i]).on('changed',scope.calculate.bind(scope));
                    }
                }
            }
        }
        scope._parsed_formula.reset();
        //console.log(scope._parsed_formula._items);



    }catch(error){
        console.log(error);
        scope.emit('formulaSyntaxError',{
            cell: scope,
            error: error
        });
        scope._parsed_formula = old;
        return this;
    }

    try{
        scope.calculate(scope);
    }catch(error){
        scope.emit('formulaError',{
            cell: scope,
            error: error
        });
        scope._parsed_formula = old;
        return this;
    }

    scope._formula = f;
    return scope;

}

Cell.prototype._setValue= function(v,evt){
    this._isDirty = false;
    if(v!=this._value){
        this._value = v;
        if (typeof evt==='undefined'){
            evt = {
                startId: this.id // prevent circuts!
            }
        }
        evt.cell = this;
        this.emit('changed',evt);
    }
}
// The `calculate(evt)` function calculates the formula.
// If the formula-calculation was successfull, the beforeChange will be emitted.
// If no listener on that event returns false, the value will be written to the
// cells value. Only after that the changed-event will be emitted (see setter of value).
//
// Arguments:
// * *evt* optional, the event object can containt the triggerId for the circut-detection
Cell.prototype.calculate = function(evt){
    var i,m,pf,result=this._value;
    if (typeof evt!=='undefined'){
        if (evt.startId===this.id){
            //throw new Error('circut detected');
        }
    }
    if (this.active){ /* only calculate if the cell is activated, helpfull on loading sheets */
        result = formula_parser.execute(this,this._parsed_formula);
        this._parsed_formula.reset();
        this._setValue(result,evt);
    }else{
        this._isDirty=true;
    }
}

exports.Cell = Cell;