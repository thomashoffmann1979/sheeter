var STATES={
    NONE: 0,
    OPENSTARTTAG: 1, // <
    INSIDESTARTTAG: 2,
    OPENENDTAG: 3, // >
    INSIDEATTRIBUTE: 4
},
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

var XSAX = function(){
    return this;
}

util.inherits(XSAX,EventEmitter);


XSAX.prototype.shiftChars = function(lastChars,add){
    var t,i,m;
    for(i=1,m=lastChars.length;i<m;i+=1){
        lastChars[i-1]=lastChars[i];
    } 
    lastChars[lastChars.length-1] = t;
    return lastChars;
}

XSAX.prototype.parse = function(data){
    var length = data.length,
        current = 0,
        shift = 0,
        state=STATES.NONE,
        char,
        //lastChar = -1,
        lastChars = [-1,-1,-1,-1,-1,-1,-1,-1,-1], // <![CDATA[Inhalt]]>
        tag=[],
        temp=[],
        attrBuffer,
        stack=[],
        stag,
        attributeName,
        item,
        me = this;
        
    while( current < length ){
        char = data.readUInt8(current);
        switch (state){
            case STATES.NONE:
                if (char == 60){
                    state = STATES.OPENSTARTTAG;
                    lastChar = char;
                    char = data.readUInt8(current+1);
                    temp = [];
                    current+=1;
                }
                if (( lastChar == 60 ) && ( char == 47 )){
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
                if ( ( char == 62 ) && ( lastChar == 47 ) ){ 
                    // self closed tag without attributes;
                    tag = temp;
                    tag.pop();       
                    
                    stag = (new Buffer(tag)).toString();
                    me.emit('tag',stack,stag);
                    
                    temp = [];
                    state = STATES.NONE;
                }else if ( ( char == 62 )  && ( lastChar == 63 ) ){ // ?>
                    temp = [];
                    // starting <?xml .. ?> ---> do nothing!
                    state = STATES.NONE;
                }else if ( ( char == 62 )  ){ // >
                    // tag opened without attributes
                    tag = temp;  
                    stag = (new Buffer(tag)).toString();
                    stack.push({
                        tag:stag
                    });
                    temp = [];
                    state = STATES.NONE;
                }else if ( char == 32 ){ // * * Tagname found
                    // tag opened maybe with attributes
                    tag = temp;
                    stag = (new Buffer(tag)).toString();
                    stack.push({
                        tag:stag
                    });
                    temp = [];
                    state = STATES.INSIDESTARTTAG;
                }
                break;
            case STATES.INSIDESTARTTAG:
                while(char == 32){ // skipping whitespaces
                     current+=1;
                     char=data.readUInt8(current);
                     temp=[];
                }
                if (( lastChar == 61 ) && ( char == 34 )){
                    current += 1;
                    char = data.readUInt8(current);
                    attributeName = (new Buffer(temp)).toString('utf8', ( (temp[0]==32)?1:0 ) , temp.length - ( (temp[temp.length-1]==61)?1:0 )  ) ;
                    state = STATES.INSIDEATTRIBUTE;
                    temp=[];
                }else if ( ( char == 62 )  && ( lastChar == 63 ) ){ 
                    temp = [];
                    stack = [];
                    state = STATES.NONE;
                }else if ( char == 62 ){ // >
                    temp = [];
                    state = STATES.NONE;
                    if ( lastChar == 47 ){ // / <- self closed tag!
                        stag = (new Buffer(tag)).toString();
                        if (stag == stack[stack.length-1].tag){
                            stack.pop();
                            // self closed tag with attributes
                            me.emit('tag',stack,stag);
                        }else{
                            throw Error('invalid tag or syntax at postition '+current+' '+stag+' !== '+stack[stack.length-1]+' ');
                        }
                        temp = [];
                    }
                }
                break;
            case STATES.INSIDEATTRIBUTE:
                if ( char == 34 ){
                    state = STATES.INSIDESTARTTAG;
                    item = stack.pop();
                    if (typeof item.attr == 'undefined'){
                        item.attr = {};
                    }
                    item.attr[attributeName]=(new Buffer(temp)).toString();
                    stack.push(item);
                    //console.log('attribute', attributeName, );
                    temp = [];
                }
                break;
            case STATES.OPENENDTAG:
                if ( char == 62 ){
                    state = STATES.NONE;
                    tag = temp;
                    stag = (new Buffer(tag)).toString();
                    // closed tag
                    if (stag == stack[stack.length-1].tag){
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