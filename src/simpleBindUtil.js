simpleBind.util = (function(d,pub){
  
  var getType = function(variable) { 
    var type = typeof variable; 
    switch(type) { 
      case 'object': 
        return variable instanceof Array ? 'array' : type;         
      default: 
        return type;       
    }
  }; 
    
  var extend = function(args) { 
    for(var i=1, len = args.length; i < len; ++i) { 
      var src = args[i]
        , target = args[0]; 
      for(var key in src) { 
        var simpleExtend = getType(target[key]) != 'object' && getType(src[key]) != 'object'; 
        if(simpleExtend) { 
          target[key] = src[key]; 
        } else { 
          target[key] = pub.extend(typeof target[key] == 'undefined' ? { } : target[key],src[key]); 
        }
      }
    }    
    return args.length ? args[0] : { }; 
  };

  pub.delay = (function(){
    var timer = 0;
    return function(callback, ms){
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
    };
  })();
  
  pub.extend = function() { 
    return extend(arguments);
  };

  pub.getKeys = function(obj) {
    if(Object.keys) {
      return Object.keys(obj);
    } else {
      arr = [];
      for(var key in obj) {
        arr.push(key);
      }
      return arr;
    }
  };

  pub.getData = function(elem) {
    var attrs, keys, data = { };
    attrs = pub.getAttrs(elem);
    keys = pub.getKeys(attrs);
    for(var i=0; i < keys.length; ++i) {
      if(keys[i].indexOf('data-') === 0) {
        data[keys[i].substring(5,keys[i].length)] = attrs[keys[i]];
      }
    }
    return data;
  };

  pub.getAttrs = function(elem) {
    var attrs, obj = {};
    attrs = elem.attributes;
    for(var i=0; i < attrs.length; ++i) {
      var attr = attrs.item(i);
      obj[attr.nodeName] = (attr.hasOwnProperty('value')) ? attr.value : attr.nodeValue;
    }
    return obj;
  };

  // A great function for setting object values
  // via a string with dot notation:
  // ex) set({x:{y:{z:2}}},'y.z',3)
 
  // pub.set = function(obj,str,val) {
  //   str = str.split('.');
  //   while(str.length > 1) {
  //     obj = obj[str.shift()];
  //   }
  //   obj[str.shift()] = val;
  // };

  // let's modify this function to be able to 
  // build an object so we could have SEO friendly
  // binds and so that people don't have to rush
  // to bind their objects immediately
  pub.set = function(obj,str,val) { 
    str = str.split('.'); 
    var finalProp = str.pop(); 
    while(str.length) { 
      var key = str.shift(); 
      obj[key] = typeof obj[key] == 'undefined' ? { } : obj[key]; 
      obj = obj[key];
    }
    obj[finalProp] = val; 
  }; 

  // Same as above but retrieves the value as a string or as an empty string
  // if not set: 
  pub.get = function(obj,str) {
    if(str == '$base' || str === '') return obj;
    str = str.split('.');
    for(var i=0; i < str.length; ++i) {
      if(str[i] == '$base') {
        return obj;
      } else if(obj == null) {
        return '';
      } else if(typeof obj[str[i]] == 'undefined') {
        return '';
      } else {
        if(obj === null) {
          return '';
        } else {
          obj = obj[str[i]];
        }
      }
    }
    return obj;
  };

  var standardObjNameRegex = new RegExp(/^[^\.]*/); 
  var replaceObjNameInStandardFormat = function(str,oldObj,newObj) { 
    if(str == oldObj) { 
      str = newObj; 
    } else if(str.indexOf(oldObj + '.') == 0) {
      str = str.replace(standardObjNameRegex,newObj)
    }; 
    return str; 
  }; 

  pub.replaceObjNameInBindingStr = function(str,bindType,oldObj,newObj) { 
    var origStr = str + '';
    if(str.indexOf(':') > -1) { 
      // we have either a bindhandler, simpledata, simpleevent, simplebindattrs, or simplerepeat
      switch(bindType) { 
        case 'simplerepeat': 
          str = str.split(':'); 
          str[1] = replaceObjNameInStandardFormat(str[1],oldObj,newObj); 
          str = str.join(':'); 
          break; 
        case 'simpleevent': 
          str = str.split(':'); 
          if(str.length >= 3) { 
            str[2] = replaceObjNameInStandardFormat(str[2],oldObj,newObj); 
          }
          str = str.join(':');
          break; 
        case 'simplebindhandler': 
        case 'simpledata': 
        case 'simplebindattrs':
        default:
          str = str.split(','); 
          for(var i=0; i < str.length; ++i) { 
            str[i] = str[i].split(':'); 
            if(str[i].length > 1) {
              str[i][1] = replaceObjNameInStandardFormat(str[i][1],oldObj,newObj)
            }; 
            str[i] = str[i].join(':');
          }
          str = str.join(','); 
          break; 
      }
    } else { 
      // we have a simplebind or simplebindvalue
      str = replaceObjNameInStandardFormat(str,oldObj,newObj); 
    }
    return str; 
  }; 

  pub.triggerEvent = function(elem,type){
    if('createEvent' in d) { 
      var evt = d.createEvent('HTMLEvents'); 
      evt.initEvent(type,false,true); 
      elem.dispatchEvent(evt); 
    } else { 
      elem.fireEvent('on' + type); 
    }
  }; 

  return pub; 
})(document,{}); 