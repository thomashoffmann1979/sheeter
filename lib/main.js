"use strict";

var EventEmitter = process.EventEmitter,
    sheeter_utils= require('./utils/utils'),
    path = require('path'),
    fs = require('fs'),
    Workbook = require('./workbook/workbook').Workbook,
    Worksheet = require('./worksheet/worksheet').Worksheet,
    XLSXReader = require('./reader/xlsxreader').XLSXReader,
    XSVReader = require('./reader/xsvreader').XSVReader;

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
    this.workbook.active = this._active;
    this.emit('opened',this._reader.workbook);
}

Sheeter.prototype.open =  function(filename,active){
    if (typeof active == 'undefined'){
        active=true;
    }
    this._active = active;
    if (fs.existsSync(filename)){


      switch(path.extname(filename)){
          case '.xlsx':
              this._reader = new XLSXReader({
                  filename: filename,
                  workbook: new Workbook(),
                  cellDefault: {
                      active: this._active
                  }
              });
              break;
          case '.txt':
              this._reader = new XSVReader({
                  filename: filename,
                  workbook: new Workbook(),
                  tab: true,
                  cellDefault: {
                      active: this._active
                  }
              });

              break;
          case '.csv':
              this._reader = new XSVReader({
                  filename: filename,
                  workbook: new Workbook(),
                  csv: true,
                  cellDefault: {
                      active: this._active
                  }
              });

              break;
          default:
              throw Error('unsupported filetype');
      }
      this._reader.on('mainReady',this.onOpened.bind(this));
      this._reader.open();
    }else{
      var wb = new Workbook();
      var sh = wb.addWorkSheet(new Worksheet({title: 'Sheet1'}));
      var cl = sh.getCell("A1");
      cl.value="1";
      this.emit('opened',wb);
    }

    this.filename = filename;
}

exports.Sheeter = Sheeter;
