"use strict";

var ENTITIES =
{ "amp" : "&"
, "gt" : ">"
, "lt" : "<"
, "quot" : "\""
, "apos" : "'"
}


var XML = function(name,value){
    this._name = name;
    this._value = value;
    this._childs = [];
    this._attr = {};
    return this;
}


XML.prototype = {
    get name() { return this._name; },
    set name(v) { this._name=v; return this._name; },
    
    get value() { return this._value; },
    set value(v) { this._value=v; return this._value; }
}



Object.keys(ENTITIES).forEach(function (key) {
    var e = ENTITIES[key]
    var s = typeof e === 'number' ? String.fromCharCode(e) : e;
    ENTITIES[s] = key;
});


XML.prototype.addAttribute = function(attrName,attrValue){
    this._attr[attrName] = attrValue;
    return this;
}

XML.prototype.addElement = function(name,value){
    var item = new XML(name,value);
    this._childs.push(item);
    return item;
}

XML.prototype.encodeEntity = function(value){
    var me = this,
        i,
        m,
        result = '';
    for(i=0,m=value.length;i<m;i++){
        
        if (typeof ENTITIES[value.charAt(i)] != 'undefined'){
            result+='&'+ENTITIES[value.charAt(i)]+';';
        }else{
            result+=value.charAt(i);
        }
    }
    return result;
}

XML.prototype.toXMLString = function(nice){
    var str = '',
        i,
        m,
        childs = '',
        end = '';// (nice)?"\n":"";
    for( i=0, m=this._childs.length; i<m; i+=1 ){
        childs += this._childs[i].toXMLString(nice);
    }
    if (( childs != '') || ( typeof this._value != 'undefined')){
        str += '<'+this._name+this.attributeString()+'>'+( ( typeof this._value != 'undefined')?'':end );
        str += childs;
        
        if ( typeof this._value != 'undefined'){
            if ( this._value != null ){
                str += this._value;
            }
        }
        
        str += '</'+this._name+'>'+end;
    }else{
        str += '<'+this._name+this.attributeString()+'/>'+end;
    }
    return str;
}

XML.prototype.attributeString = function(){
    var str='',
        i;
    
    for( i in this._attr ){
        if ( str != ''){
            str += ' ';
        }
        str+= i+'="'+this._attr[i]+'"';
    }
    return (str=='')?'':(' '+str);
}
exports.XML = XML;