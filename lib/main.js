"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('./utils/utils'),
    path = require('path'),
    Workbook = require('./workbook/workbook').Workbook,
    XLSXReader = require('./reader/xlsxreader').XLSXReader;

var Sheeter = function(){
    this._filename;
    this._reader;
}

sheeter_utils.inherits(Sheeter,EventEmitter,{
    get filename () { return this._filename; },
    set filename (t) { this._filename = t; return this; },
    
    get workbook () { return this._reader.workbook; },
});


Sheeter.prototype.onOpened = function(){
    this.emit('opened',this._reader.workbook);
}
Sheeter.prototype.open =  function(filename){
    switch(path.extname(filename)){
        case '.xlsx':
            this._reader = new XLSXReader({
                filename: filename,
                workbook: new Workbook()
            });
            
            break;
        default:
            throw Error('unsupported filetype');
    }
    this._reader.on('mainReady',this.onOpened.bind(this));
    this._reader.open();
    this.filename = filename;
}

exports.Sheeter = Sheeter;