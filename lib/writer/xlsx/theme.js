"use strict";
var EventEmitter = process.EventEmitter,
    sheeter_utils= require('../../utils/utils'),
    XML= require('../../utils/xml').XML,
    util= require('util');

var ThemeWriter =  function(writer){
    this._data;
    this._writer = writer;
    this._contents = this._writer.contentWriter;
    this._relation = this._writer.relationWriter;
}


sheeter_utils.inherits(ThemeWriter,EventEmitter,{
    get data () { return this._data; },
    set data (d) { this._data = d; return this; }

})


ThemeWriter.prototype.addPart =  function(partName,contentType){
    this._parts.push({
        PartName: partName,
        ContentType: contentType
    });
}

ThemeWriter.prototype.process = function(){
    
    
    var xml = new XML('a:theme'),
        i,
        fileName,
        me = this,
        scheme,
        theme,
        el,
        lst,
        gs,
        gsscheme,
        grad,
        relId;
    
    xml.addAttribute('xmlns:a','http://schemas.openxmlformats.org/drawingml/2006/main');
    xml.addAttribute('name','Office Theme');

    theme = xml.addElement('a:themeElements');
    
    scheme = theme.addElement('a:clrScheme').addAttribute('name','Office');
    scheme.addElement('a:dk1').addElement('a:sysClr').addAttribute('val','windowText').addAttribute('lastClr','000000');
    scheme.addElement('a:dk2').addElement('a:srgbClr').addAttribute('val','1F497D');
    scheme.addElement('a:lt2').addElement('a:srgbClr').addAttribute('val','EEECE1');
    scheme.addElement('a:accent1').addElement('a:srgbClr').addAttribute('val','4F81BD');
    scheme.addElement('a:accent2').addElement('a:srgbClr').addAttribute('val','C0504D');
    scheme.addElement('a:accent3').addElement('a:srgbClr').addAttribute('val','9BBB59');
    scheme.addElement('a:accent4').addElement('a:srgbClr').addAttribute('val','8064A2');
    scheme.addElement('a:accent5').addElement('a:srgbClr').addAttribute('val','4BACC6');
    scheme.addElement('a:accent6').addElement('a:srgbClr').addAttribute('val','F79646');
    scheme.addElement('a:hlink').addElement('a:srgbClr').addAttribute('val','0000FF');
    scheme.addElement('a:folHlink').addElement('a:srgbClr').addAttribute('val','800080');
    
    
    scheme = theme.addElement('a:fontScheme').addAttribute('name','Office').addElement('a:majorFont');
    scheme.addElement('a:latin').addAttribute('typeface','Cambria');

    
    scheme = theme.addElement('a:fmtScheme').addAttribute('name','Office');
    el = scheme.addElement('a:fillStyleLst');
    el.addElement('a:solidFill').addElement('a:schemeClr').addAttribute('val','phClr');
    
    grad = el.addElement('a:gradFill').addAttribute('rotWithShape','1');
    lst = grad.addElement('a:gsLst');
    
    gs = lst.addElement('a:gs').addAttribute('pos','0');
    gsscheme = gs.addElement('a:schemeClr').addAttribute('val','phClr');
    gsscheme.addElement('a:tint').addAttribute('val','50000');
    gsscheme.addElement('a:satMod').addAttribute('val','300000');

    gs = lst.addElement('a:gs').addAttribute('pos','35000');;
    gsscheme = gs.addElement('a:schemeClr').addAttribute('val','phClr');
    gsscheme.addElement('a:tint').addAttribute('val','37000');
    gsscheme.addElement('a:satMod').addAttribute('val','300000');

    gs = lst.addElement('a:gs').addAttribute('pos','100000');;
    gsscheme = gs.addElement('a:schemeClr').addAttribute('val','phClr');
    gsscheme.addElement('a:tint').addAttribute('val','15000');
    gsscheme.addElement('a:satMod').addAttribute('val','350000');

    grad.addElement('a:lin').addAttribute('ang','16200000').addAttribute('scaled','1');

    
    grad = el.addElement('a:gradFill').addAttribute('rotWithShape','1');
    lst = grad.addElement('a:gsLst');
    
    gs = lst.addElement('a:gs').addAttribute('pos','0');
    gsscheme = gs.addElement('a:schemeClr').addAttribute('val','phClr');
    gsscheme.addElement('a:tint').addAttribute('val','51000');
    gsscheme.addElement('a:satMod').addAttribute('val','130000');

    gs = lst.addElement('a:gs').addAttribute('pos','80000');;
    gsscheme = gs.addElement('a:schemeClr').addAttribute('val','phClr');
    gsscheme.addElement('a:tint').addAttribute('val','93000');
    gsscheme.addElement('a:satMod').addAttribute('val','130000');

    gs = lst.addElement('a:gs').addAttribute('pos','100000');;
    gsscheme = gs.addElement('a:schemeClr').addAttribute('val','phClr');
    gsscheme.addElement('a:tint').addAttribute('val','94000');
    gsscheme.addElement('a:satMod').addAttribute('val','135000');

    grad.addElement('a:lin').addAttribute('ang','16200000').addAttribute('scaled','0');

    
    
    el = scheme.addElement('a:lnStyleLst');
    el = scheme.addElement('a:effectStyleLst');
    el = scheme.addElement('a:bgFillStyleLst');
    
    
    xml.addElement('a:objectDefaults');
    xml.addElement('a:extraClrSchemeLst');
    
    me._data = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+"\n" + xml.toXMLString(true);
    console.log('theme',me._data);
    
    
    fileName = '/xl/theme/theme1.xml';
    me._contents.addPart(fileName,'application/vnd.openxmlformats-officedocument.theme+xml');
    relId = me._relation.addRelation('http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',fileName.replace(/^\/xl\//,''));
    me._writer.zip.addFile(fileName,new Buffer(me._data,'utf8'));
    me.emit('ready',me,relId,fileName);
}


exports.ThemeWriter = ThemeWriter;
