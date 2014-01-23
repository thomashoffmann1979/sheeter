var STATES={
    NONE: 0,
    OPENSTARTTAG: 1, // <
    INSIDESTARTTAG: 2,
    OPENENDTAG: 3, // >
    INSIDEATTRIBUTE: 4,
    INCDATA: 5
},
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

var XSAX = function(){
    return this;
}

util.inherits(XSAX,EventEmitter);


var shiftChars = function(lastChars,add){
    //slowdown 30%
    var i,m;
    for(i=1,m=lastChars.length;i<m;i+=1){
        lastChars[i-1]=lastChars[i];
    } 
    lastChars[lastChars.length-1] = add;
    return lastChars;
}

XSAX.prototype.parse = function(data){
    var length = data.length,
        current = 0,
        shift = 0,
        state=STATES.NONE,
        char,
        //lastChar = -1,
        lastChars = [-1,-1,-1,-1,-1,-1,-1,-1,-1], // for <![CDATA[ and ]]>
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
                if ((char == 60) && (data.readUInt8(current+1)!=47)){
                    
                    state = STATES.OPENSTARTTAG;
                    lastChars = shiftChars(lastChars,char);
                    char = data.readUInt8(current+1);
                    temp = [];
                    current+=1;
                }
                if (( lastChars[8] == 60 ) && ( char == 47 )){
                    // closing tag
                    if (stack.length>0){
                        //slowdown 30%
                        item = stack.pop();
                        item.value = (new Buffer(temp)).toString('utf8',1,temp.length-1);
                        stack.push(item);
                    }
                    state = STATES.OPENENDTAG;
                    lastChars = shiftChars(lastChars,char);
                    char = data.readUInt8(current+1);
                    current+=1;
                    temp = [];
                }
                break;
            case STATES.OPENSTARTTAG:
                if ( ( char == 62 ) && ( lastChars[8] == 47 ) ){ 
                    // self closed tag without attributes;
                    tag = temp;
                    tag.pop();       
                    
                    stag = (new Buffer(tag)).toString();
                    stack.push({
                        tag:stag
                    });
                    me.emit('tag',stack,stag);
                    stack.pop();
                    
                    temp = [];
                    state = STATES.NONE;
                }else if ( ( char == 62 )  && ( lastChars[8] == 63 ) ){ // ?>
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
                if (( lastChars[8] == 61 ) && ( char == 34 )){
                    current += 1;
                    char = data.readUInt8(current);
                    attributeName = (new Buffer(temp)).toString('utf8', ( (temp[0]==32)?1:0 ) , temp.length - ( (temp[temp.length-1]==61)?1:0 )  ) ;
                    state = STATES.INSIDEATTRIBUTE;
                    temp=[];
                }else if ( ( char == 62 )  && ( lastChars[8] == 63 ) ){ 
                    temp = [];
                    stack = [];
                    state = STATES.NONE;
                }else if ( char == 62 ){ // >
                    temp = [];
                    state = STATES.NONE;
                    if ( lastChars[8] == 47 ){ // / <- self closed tag!
                        stag = (new Buffer(tag)).toString();
                        if (stag == stack[stack.length-1].tag){
                            me.emit('tag',stack,stag);
                            stack.pop();
                            // self closed tag with attributes
                            
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
                        me.emit('tag',stack,stag);
                        stack.pop();
                    }else{
                        throw Error('invalid tag or syntax at postition '+current+' '+stag+' !== '+stack[stack.length-1]+' ');
                    }
                    
                    //console.log('close tag found: ',stag);
                    temp = [];
                    tag=[];
                }
                break;
        }
        lastChars = shiftChars(lastChars,char);
        //console.log(lastChars[8]);
        temp.push(char);
        current+=1;
    }
}
exports.XSAX = XSAX;