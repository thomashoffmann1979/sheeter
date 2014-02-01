var program = require('commander'),
    pjson = require('../../package.json'),
    sheeter_utils = require('../utils/utils'),
    SimpleSAX = require('../utils/simplesax').SimpleSAX,
    Zip = require('adm-zip'),
    firstFile,
    firstFileEntries,
    firstFilelist,
    firstFileHash={},
    secondFile,
    secondFileEntries,
    secondFilelist,
    secondFileHash={},
    sax,
    sIndex,
    sMax,
    fIndex,
    fMax,
    fName,
    fTagList,
    sTagList,
    compareIndex;

program
    .version(pjson.version)
    .description('comparing two Excel-Spreadsheet files')
    .usage('[options] <file1> <file2>')
    .parse(process.argv);

var end = function(){
    compareIndex--;
    if (compareIndex == 0){
        
        if (fTagList.sort().join('') ==  sTagList.sort().join('')){
            console.log(fName,'have the same content');  
            fIndex += 1;
            iterate();
        }else{
            console.log(fName,'are differnt'); 
            console.log(fTagList.sort().join(''));
            console.log(sTagList.sort().join(''));
            fIndex += 1;
            iterate();
        }
    }
}
var tagStr = function(tagItem){
    var at=[];
    var str = [];
    for(var i in tagItem.attr){
        at.push(i);
    }
    at = at.sort();
    for(var i in at){
        str.push( at[i] );
        str.push( tagItem.attr[at[i]] );
    }
    return str.join(':');
};
var tagAr = function(stack,tagName){
    var lastItem = stack[stack.length-1];
    var str = [];
    for(var i in stack){
        str.push(tagStr(stack[i]));
    }
    str.push( lastItem.value );
    return str;
}
var tag_f = function(stack,tagName){
    fTagList.push( (tagAr(stack,tagName)).join('>'));
}
var tag_s = function(stack,tagName){
    sTagList.push( (tagAr(stack,tagName)).join('>'));
}
var compare = function(bf,bs){
    var fx = new SimpleSAX(),
        sx = new SimpleSAX();
    fTagList = [];
    sTagList = [];
    compareIndex = 2;
    fx.on('tag',tag_f);
    fx.on('end',end);
    sx.on('tag',tag_s);
    sx.on('end',end);
    fx.parse(bf);
    sx.parse(bs);
}
var iterate = function(){
    fName = firstFilelist[fIndex];
    if (fIndex < firstFilelist.length){
        if (fName.substring(fName.length-1) == '/'){
            fIndex += 1;
            iterate();
        }else{
            console.log(fName);
            try{
            compare(firstFileEntries[firstFileHash[fName]].getData(),secondFileEntries[secondFileHash[fName]].getData());
            }catch(e){
                console.log(firstFileHash);
                console.log(secondFileHash);
            }
        }
    }else{
        console.log('DONE');
    }
    /*
    for(fIndex = 0, fMax = firstFilelist.length; fIndex < fMax; fIndex += 1){
        
        if (fName.substring(fName.length-1) == '/'){
            console.log('Directory found:',fName);
        }else{
            
            break;
        }
    }
    */
}
var  startPRG = function(){
    if ( (program.args.length == 2) ){

        firstFile = new Zip(program.args[program.args.length-2]);
        firstFileEntries = firstFile.getEntries();
        firstFilelist = [];
        for(fIndex = 0, fMax = firstFileEntries.length; fIndex < fMax; fIndex += 1){
            //console.log(secondFileEntries.getData());
            firstFilelist.push(firstFileEntries[fIndex].entryName);
            firstFileHash[firstFileEntries[fIndex].entryName] = fIndex;
        }
        secondFile = new Zip(program.args[program.args.length-1]);
        secondFileEntries = secondFile.getEntries();
        secondFilelist = [];
        for(sIndex = 0, sMax = secondFileEntries.length; sIndex < sMax; sIndex += 1){
            //console.log(secondFileEntries.getData());
            secondFilelist.push(secondFileEntries[sIndex].entryName);
            secondFileHash[secondFileEntries[sIndex].entryName] = sIndex;
        }
        firstFilelist = firstFilelist.sort();
        secondFilelist = secondFilelist.sort();
        
        if (secondFilelist.length!=firstFilelist.length){
            console.log('The Files doesn\'t have the same Etries in the zip File');
            console.log(program.args[program.args.length-2]+':',firstFilelist.sort().join("\n"));
            console.log(program.args[program.args.length-1]+':',secondFilelist.sort().join("\n"));
            process.exit();
        }

        fIndex = 0;
        iterate()

    }
}


startPRG();