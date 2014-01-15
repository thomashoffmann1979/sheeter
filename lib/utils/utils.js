// Utils
// -----
//
// This module contains all widely used function of that package.
//

//
// The `columnIndexFromString` function returns the corresponding number for the given column string.

exports.columnIndexFromString = function(str){
	var index,i,m;
	str = str.toUpperCase();
	str = str.replace(/[0-9]/,'');
	index = 0;
	for(i=0,m=str.length;i<m;i+=1){
		index += str.charCodeAt(i) - 64 + i*25;
	}
	return index;
}

//
// The `getColumnAndRow` function extracts the column and row.
// 
// Arguments:
// * *cell* the string to be checked.
//
// The function return an object containing the 
// column-letter *column*
// the column-index *columnIndex* and the
// rownumber *row*.
exports.getColumnAndRow = function(cell){
	var column,index,row;
	if (!exports.isCellNotation(cell)){
		throw Error('not a valid cell notation');
	}
	cell = cell.toUpperCase();
	column = cell.replace(/[0-9]/,'');
	
	row = 1*cell.replace(/[A-Z]/,'');
	
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
// 
// Arguments:
// * *rangeString* the string to be checked.
//
// The function returns *true* if the given string is a valid 
// range string. Otherwise *false*.
exports.isRangeNotaion = function(rangeString){
	var parts = rangeString.split(':');
	if (parts.length===2){
		if ( exports.isCellNotation(parts[0]) && exports.isCellNotation(parts[1]) ){
			return true;
		}
	}
	return false;
}