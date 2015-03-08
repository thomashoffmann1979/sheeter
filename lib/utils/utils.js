var sax = require('sax');
// This module contains all widely used function of the sheeter package.
//

//
// The `columnIndexFromString` function returns the corresponding number for the given column string.
//
// Arguments:
// * *str* the string of the column representation.

exports.columnIndexFromString = function(str){
    var index,i,m,c,e;
    str = str.toUpperCase();
    str = str.replace(/[^A-Z]/g,'');
    index = 0;
    m = str.length;
    for(i=m;i>0;i-=1){
        c=str.charCodeAt(i-1) - 64;
        e=m-i;
        index +=c*(Math.pow(26,e));
    }
    return index;
}

// The `columnStringFromIndex` function return the column string for the given index.
//
// Arguments:
// * *index* the index for the column, must be greater than 0.

exports.columnStringFromIndex = function(index){
    var cl,m,i,result = '';
    if (index<1){
        throw Error('invalid index');
    }

    cl = index;
    while(cl>26){

        i = Math.floor(cl / 26);
        result += String.fromCharCode( i + 64);
        cl -= i * 26;
    }
    result += String.fromCharCode( cl + 64);
    /*
    cl = index.toString(26);
    //console.log('cl',cl);

    m=cl.length;
    result='';
    for(i=0;i<m;i+=1){
        result+= String.fromCharCode(parseInt(cl.charAt(i))+64);
    }
    */
    return result;
}

//
// The `getColumnAndRow` function extracts the column and row.
//
// Arguments:
// * *cell* the string to be checked.
//
// The function return an object containing the  column-letter
// (*column*) the column-index (*columnIndex*) and the rownumber (*row*).

exports.getColumnAndRow = function(query){
    var cell_query, table_query,column,index,row,res, parts=query.split('!');
    switch (parts.length){
        case 1:
            cell_query = parts[0];
            break;
        case 2:
            table_query = parts[0];
            table_query = table_query.replace(/^\[/,'').replace(/\]$/,'')
            cell_query = parts[1];
            break;
        default:
            throw new Error('Invalid identifiyer: '+query);
    }


    if (!exports.isCellNotation(cell_query)){
        throw Error('not a valid cell notation');
    }
    cell_query = cell_query.toUpperCase();
    column = cell_query.replace(/[^A-Z]/g,'');
    row = 1*cell_query.replace(/[^0-9]/g,'');

    res = {
        column: column,
        columnIndex: exports.columnIndexFromString(column),
        row: row
    }
    if (typeof table_query!=='undefined'){
        res.table = table_query.toUpperCase();
    }
    return res;
}

// The `isCellNotation` function checks a given string,
// if it is a valid cell notation (eg. "B1").
//
// Arguments:
// * *cell* the string to be checked.
//
// The function returns *true* if the given string is a valid
// cell string. Otherwise *false*.
exports.isCellNotation = function(query){
    var cell_query, table_query, parts=query.split('!');
    switch (parts.length){
        case 1:
            cell_query = parts[0];
            break;
        case 2:
            table_query = parts[0];
            cell_query = parts[1];
            break;
        default:
            false;
    }

    var r = /([a-z])([a-z])*([1-9])([0-9])*/i;
    var not_allowed = /[^a-z0-9]/i;
    if (r.test(cell_query)){
        if (not_allowed.test(cell_query)){
            return false;
        }else{
            return true;
        }
    }else{
        return false;
    }
}

// The `isRangeNotaion` function checks a given string,
// if it is a valid range notation (eg. "A1:A321").
// *A valid range can also be a range to as single cell (eg. "A1:A1")*
//
// Arguments:
// * *rangeString* the string to be checked.
//
// The function returns *true* if the given string is a valid
// range string. Otherwise *false*.
exports.isRangeNotation = function(rangeString){
    var parts,cell1,cell2;

    parts= rangeString.split(':');
    if (parts.length===2){
        cell1=exports.getColumnAndRow(parts[0]);
        cell2=exports.getColumnAndRow(parts[1]);
        if ( (cell1.row===cell2.row) && (cell1.column!==cell2.column) ||
            (cell1.row!==cell2.row) && (cell1.column===cell2.column) ||
            (cell1.row===cell2.row) && (cell1.column===cell2.column)
           ){
            return true;
        }
    }
    return false;
}

exports.rangeToArray = function(rangeString){
    if (exports.isRangeNotation(rangeString)){
        var parts,cell1,cell2,result,min_n,max_n,i,cn;

        parts= rangeString.split(':');
        if (parts.length===2){
            cell1=exports.getColumnAndRow(parts[0]);
            cell2=exports.getColumnAndRow(parts[1]);
            if ( (typeof cell1.table==='undefined') && (typeof cell2.table!=='undefined')){
                cell1.table = cell2.table;
            }
            if ( (cell1.row===cell2.row) && (cell1.column!==cell2.column) ){
                min_n = Math.min(cell1.columnIndex,cell2.columnIndex);
                max_n = Math.max(cell1.columnIndex,cell2.columnIndex);
                result = [];
                for(i=min_n;i<=max_n;i+=1){
                    cn=[];
                    if (typeof cell1.table!=='undefined'){
                        cn.push(cell1.table);
                        cn.push('!');
                    }
                    cn.push(exports.columnStringFromIndex(i));
                    cn.push(cell1.row);
                    result.push( cn.join('') );
                }
                return result;
            }else if ( ( cell1.row!==cell2.row) && (cell1.column===cell2.column) ){
                min_n = Math.min(cell1.row,cell2.row);
                max_n = Math.max(cell1.row,cell2.row);
                result = [];

                for(i=min_n;i<=max_n;i+=1){
                    cn=[];
                    if (typeof cell1.table!=='undefined'){
                        cn.push(cell1.table);
                        cn.push('!');
                    }
                    cn.push(cell1.column);
                    cn.push(i);
                    result.push( cn.join('') );
                }
                return result;
            }else{
                return [parts[0]];
            }
        }
    }else{
        throw new TypeError('Invalid Range');
    }
}

exports.inherits=function(ctor, superCtor, proto) {

    var props = {
        constructor: { value: ctor, writable: true, configurable: true }
    };
    Object.getOwnPropertyNames(proto).forEach(function(name) {
        props[name] = Object.getOwnPropertyDescriptor(proto, name);
    });
    ctor.prototype = Object.create(superCtor.prototype, props);
    ctor.super_ = superCtor;
}

// `xmlToJSON(data,callback)` reads ansyncron a xml string and calls the
// callback(err,json) function.
exports.xmlToJSON = function(data,callback,debug){
    var json={},
        currentNode,
        parentNode,
        rootNode,
        intend=0,
        parser = sax.parser(true);


    parser.onerror = function (e) {
        // an error happened.
        callback(e,null);
    };

    parser.ontext = function (t) {
        if (typeof currentNode !== 'undefined' ){
           currentNode.text = t;
        }
    };

    parser.onclosetag = function () {
        var tmp;
        if(debug===true){
            var intendStr = '';
            for(var i=0;i<intend;i++){
                intendStr+='    ';
            }
            //console.log(intendStr+'--');
            intend--;
        }
        //currentNode = parentNode;
        tmp = currentNode;
        currentNode = currentNode._parent;
        delete tmp['_parent'];
    };

    parser.onopentag = function (n) {
        intend++;
        parentNode = currentNode;
        currentNode = n;
        currentNode._parent = parentNode;
        if (typeof parentNode !== 'undefined' ){
            if (typeof parentNode.childs == 'undefined' ){
                parentNode.childs = [currentNode];
            }else{
                parentNode.childs.push(currentNode);
            }
        }else{
            rootNode = currentNode;
        }
        if(debug===true){
            var intendStr = '';
            for(var i=0;i<intend;i++){
                intendStr+='    ';
            }
            console.log(intendStr+n.name+' ('+  ((typeof parentNode !== 'undefined' )?parentNode.name:'_none')+')');
        }
    };

    parser.onattribute = function (attr) {

    };

    parser.onend = function () {
        // parser stream is done, and ready to have more stuff written to it.
        //console.log(parentNode);

        callback(null,rootNode);
    };

    parser.write(data).close();

}

exports.alignString = function(str,align,width,spacer){
    if (typeof spacer == 'undefined'){
        spacer = ' ';
    }
    switch(align){
        case 'r':
            while(str.length<width){
                str = spacer + str;
            }
            if (str.length > width){
                str = str.substring(str.length-width,str.length);
            }
            break;
        case 'c':
            while(str.length<width){
                str = spacer + str + spacer;
            }
            if (str.length > width){
                str = str.substring(0,width);
            }
            break;
        default:
            while(str.length<width){
                str = str + spacer;
            }
            if (str.length > width){
                str = str.substring(0,width);
            }
            break;
    }
    return str;
}
