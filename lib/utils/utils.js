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
	var cl,m,i,result;
	if (index<1){
		throw Error('invalid index');
	}
	cl = index.toString(26);
	m=cl.length;
	result='';
	for(i=0;i<m;i+=1){
		result+= String.fromCharCode(parseInt(cl.charAt(i))+64);
	}
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

exports.getColumnAndRow = function(cell){
	var column,index,row;
	if (!exports.isCellNotation(cell)){
		throw Error('not a valid cell notation');
	}
	cell = cell.toUpperCase();
	column = cell.replace(/[^A-Z]/g,'');
	row = 1*cell.replace(/[^0-9]/g,'');
	
	return {
		column: column,
		columnIndex: exports.columnIndexFromString(column),
		row: row
	}
}

// The `isCellNotation` function checks a given string, 
// if it is a valid cell notation (eg. "B1").
// 
// Arguments:
// * *cell* the string to be checked.
//
// The function returns *true* if the given string is a valid 
// cell string. Otherwise *false*.
exports.isCellNotation = function(cell){
	var r = /([a-z])([a-z])*([1-9])([0-9])*/i;
	var not_allowed = /[^a-z0-9]/i;
	if (r.test(cell)){
		if (not_allowed.test(cell)){
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
exports.isRangeNotaion = function(rangeString){
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