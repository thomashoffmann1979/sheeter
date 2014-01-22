// The `Workbook` object conains all worksheets.

var EventEmitter = process.EventEmitter,
    util = require('util'),
    Cell = require('../cell/cell').Cell,
    Cell = require('../cell/cell').Cell,
    Worksheet = require('../worksheet/worksheet').Worksheet,
    FunctionStore = require('../formulas/functions').FunctionStore;


var Workbook = function(){
    this._worksheetHash	=	{};
    this._worksheetIndex = 1;
    this._worksheetDefaultName = 'Table';

    this.functionStore = new FunctionStore();
}
util.inherits(Workbook,EventEmitter);

Workbook.prototype.addWorkSheet =  function(worksheet){
    var upperTitle = worksheet.title.toUpperCase();
    if (typeof this._worksheetHash[upperTitle]==='undefined'){
        this._worksheetHash[upperTitle] = worksheet;
        this._worksheetIndex+=1;
    }else{
        throw Error('There is allready a sheet with that title '+upperTitle);
    }
}

Workbook.prototype.getWorkSheet =  function(title){
    if (typeof this._worksheetHash[title]==='undefined'){
        throw ReferenzError('There is no sheet with the title '+title);
    }
    return this._worksheetHash[title];
}


Workbook.prototype.getWorkSheetList =  function(){
    var i,list=[];
    for(i in this._worksheetHash){
        list.push(this._worksheetHash[i]);
    }
    return list;
}

Workbook.prototype.output = function(config){
    var list = this.getWorkSheetList(),
        i,
        m,
        r,
        line,
        log,
        sheet;

    if (typeof config == 'undefined'){
        config = {};
    }
    if (typeof config.log == 'undefined'){
        config.log = console.log;
    }
    log = config.log;

    for(i in list){
        m = list[i].getMatrixByRow({nice:true,header:true,rows:true});
        if ((list.length !== 1) && (list[i].title!=sheet)){

            if (typeof sheet == 'undefined'){
                log(list[i].title);
            }

        }else{
            log(list[i].title+':');
            for( r in m ){
                line = '|'+m[r].join('|')+'|';
                if (( r == 0 )){
                    log(line.replace(/./gi, '_'));
                }
                log('|'+m[r].join('|')+'|');
                if (( r == 0 )|| ( r == m.length-1 )){
                    log(line.replace(/./gi, '_'));
                }
            }

        }
    }
}


// `createWorkSheet()`
Workbook.prototype.createWorkSheet =  function(config){


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
    this.addWorkSheet(sheet);
    return sheet;
}


exports.Workbook = Workbook;