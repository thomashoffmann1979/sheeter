var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

exports.comparestrings= function(string1,string2){
    var result = '',
        i,
        m;
    for( i=0,m=string1.length; i < m; i += 1){
        if (string1.charAt(i) == string2.charAt(i)){
            result += string1.charAt(i).data;
        }else{
            result += string1.charAt(i).warn;
        }
    }
    console.log(result);
}