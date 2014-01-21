"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    util= require('util');

var ContentReader =  function(){
    this._mainfile;
    this._worksheets = [];
    this._sheets = [];
    this._main;
    this._themes = [];
    this._styles = [];
    this._strings = [];
    this._calcchains = [];
    this._coreproperties = [];
    this._extendedproperties = [];
    this._data; 
}


sheeter_utils.inherits(ContentReader,EventEmitter,{

    get data () { return this._data; },
    set data (d) { this._data = d; return this; },

    get sheets () { return this._sheets; },
    set sheets (s) { this._sheets = s; return this; },
    
    get themes () { return this._themes; },
    set themes (s) { this._themes = s; return this; },
    
    get styles () { return this._styles; },
    set styles (s) { this._styles = s; return this; },
    
    get strings () { return this._strings; },
    set strings (s) { this._strings = s; return this; },
    
    get calcchains () { return this._calcchains; },
    set calcchains (s) { this._calcchains = s; return this; },
    
    get coreproperties () { return this._coreproperties; },
    set coreproperties (s) { this._coreproperties = s; return this; },
    
    get extendedproperties () { return this._extendedproperties; },
    set extendedproperties (s) { this._extendedproperties = s; return this; },
    
    get main () { return this._main; },
    set main (s) { this._main = s; return this; }
    
});

ContentReader.prototype.parse = function(){
    var me=this;
    sheeter_utils.xmlToJSON(this._data,function(err,data){
        var i,
            m,
            node;

        if(err){ 
            me.emit('error', err);
            return;
        }
        
        if ( (typeof data.name != 'undefined' ) && (data.name == 'Types') ){
            for(i=0,m=data.childs.length; i<m ; i++){
                /*uncomment here to see all types, console.log(data.childs[i]);*/
                node = data.childs[i];
                if (node.name=='Override'){
                    if (
                        (typeof node.attributes!='undefined') &&
                        (typeof node.attributes.ContentType!='undefined')
                    ){
                        switch(node.attributes.ContentType){
                            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml':
                                me.sheets.push(node.attributes.PartName);
                                break;
                            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml':
                                me.main = (node.attributes.PartName);
                                break;
                            case 'application/vnd.openxmlformats-officedocument.theme+xml':
                                me.themes.push(node.attributes.PartName);
                                break;
                            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml':
                                me.styles.push(node.attributes.PartName);
                                break;
                            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml':
                                me.strings.push(node.attributes.PartName);
                                break;
                            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml':
                                me.calcchains.push(node.attributes.PartName);
                                break;
                            case 'application/vnd.openxmlformats-package.core-properties+xml':
                                me.coreproperties.push(node.attributes.PartName);
                                break;
                            case 'application/vnd.openxmlformats-officedocument.extended-properties+xml':
                                me.extendedproperties.push(node.attributes.PartName);
                                break;
                            default:
                                console.log('Not processed content-type:',node.attributes.ContentType,__filename);
                                break;
                        }
                    }else{
                        me.emit('error', Error('invalid [Content Types].xml'));
                        return;
                    }
                }
                
            }
        }else{
            me.emit('error', Error('The given xml does not contain a types-element.'));
            return;
        }
        me.emit('ready');
    });
}
exports.ContentReader = ContentReader;