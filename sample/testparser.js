var STATES={
    NONE: 0,
    OPENSTARTTAG: 1, // <
    INSIDESTARTTAG: 2,
    OPENENDTAG: 3 // >
},
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

var XSAX = function(){
    return this;
}

util.inherits(XSAX,EventEmitter);

XSAX.prototype.parse = function(data){
    var length = data.length,
        current = 0,
        shift = 0,
        state=STATES.NONE,
        char,
        lastChar = -1,
        tag=[],
        temp=[],
        stack=[],
        stag,
        me = this;
        
    while( current < length ){
        if (current>3000){ return; }
        char = data.readUInt8(current);
        switch (state){
            case STATES.NONE:
                if (char == 60){ // <
                    state = STATES.OPENSTARTTAG;
                    lastChar = char;
                    char = data.readUInt8(current+1);
                    temp = [];
                    current+=1;
                }
                if (( lastChar == 60 ) && ( char == 47 )){ // </
                    // closing tag
                    state = STATES.OPENENDTAG;
                    lastChar = char;
                    char = data.readUInt8(current+1);
                    temp = [];
                    current+=1;
                    temp = [];
                }
                break;
            case STATES.OPENSTARTTAG:
                if ( ( char == 62 ) && ( lastChar == 47 ) ){ // />
                    tag = temp;
                    tag.pop();       
                    //stack.push((new Buffer(tag)).toString());
                    stag = (new Buffer(tag)).toString();
                    me.emit('tag',stack,stag);
                    //console.log('start tag found: ',(new Buffer(tag)).toString());
                    //console.log('close tag found*: ',(new Buffer(tag)).toString());
                    temp = [];
                    state = STATES.NONE;
                }else if ( ( char == 62 )  && ( lastChar == 63 ) ){ // ?>
                    temp = [];
                    //console.log('here');
                    state = STATES.NONE;
                }else if ( ( char == 62 )  ){ // >
                    tag = temp;  
                    stack.push((new Buffer(tag)).toString());
                    //console.log('start tag found: ',(new Buffer(tag)).toString());
                    temp = [];
                    state = STATES.NONE;
                }else if ( char == 32 ){ // * * Tagname found
                    tag = temp;
                    stag = (new Buffer(tag)).toString();
                    stack.push(stag);
                    //console.log('start tag found: ',(new Buffer(tag)).toString());
                    temp = [];
                    state = STATES.INSIDESTARTTAG;
                }
                break;
            case STATES.INSIDESTARTTAG:
                if ( ( char == 62 )  && ( lastChar == 63 ) ){ // ?>
                    temp = [];
                    stack = [];
                    state = STATES.NONE;
                }else if ( char == 62 ){ // >
                    temp = [];
                    state = STATES.NONE;
                    if ( lastChar == 47 ){ // / <- self closed tag!
                        stag = (new Buffer(tag)).toString();
                        if (stag == stack[stack.length-1]){
                            stack.pop();
                        }else{
                            throw Error('invalid tag or syntax at postition '+current+' '+stag+' !== '+stack[stack.length-1]+' ');
                        }
                        me.emit('tag',stack,stag);
                        //console.log('close tag found*: ',(new Buffer(tag)).toString());
                        //tag = temp;
                        //tag.pop();                        
                        //console.log('tag closed');
                        temp = [];
                    }
                }
                break;
            case STATES.OPENENDTAG:
                if ( char == 62 ){ // >
                    state = STATES.NONE;
                    tag = temp;
                    stag = (new Buffer(tag)).toString();
                    if (stag == stack[stack.length-1]){
                        stack.pop();
                    }else{
                        throw Error('invalid tag or syntax at postition '+current+' '+stag+' !== '+stack[stack.length-1]+' ');
                    }
                    me.emit('tag',stack,stag);
                    //console.log('close tag found: ',(new Buffer(tag)).toString());
                    temp = [];
                    tag=[];
                }
                break;
        }
        lastChar = char;
        temp.push(char);
        current+=1;
    }
}
exports.XSAX = XSAX;