var simpleBindUtil = (function(pub){

  var extendProperty = function(propFrom,propTo) { 
    if(typeof propFrom == 'object' && typeof propTo == 'object') { 
      return pub.extend(propTo,propFrom);
    } else { 
      return propFrom; 
    }
  }; 

  pub.extend = function() { 
    for(var i=arguments.length; i > 0; --i) { 
      for(var key in arguments[i]) { 
        arguments[i-1][key] = extendProperty(arguments[i][key],arguments[i-1][key]); 
      }
    }
    return arguments[0];
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
  pub.set = function(obj,str,val) {
    str = str.split('.');
    while(str.length > 1) {
      obj = obj[str.shift()];
    }
    return obj[str.shift()] = val;
  };

  // Same as above but retrieves the value
  // instead of setting it:
  pub.get = function(obj,str) {
    if(str == '$base' || str === '') return obj;
    str = str.split('.');
    for(var i=0; i < str.length; ++i) {
      if(str[i] == '$base') { 
        return obj; 
      } else if(typeof obj[str[i]] == 'undefined') {
        return '';
      } else {
        obj = obj[str[i]];
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
      // we have either a bindhandler, simpledata, simpleevent, or simplerepeat
      switch(bindType) { 
        case 'simplebindhandler': 
        case 'simpledata': 
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
      }
    } else { 
      // we have a simplebind or simplebindvalue
      str = replaceObjNameInStandardFormat(str,oldObj,newObj); 
    }
    // console.log('replacing "' + oldObj+'" with "' + newObj + '" in "' + origStr + '".','returning:',str); 
    return str; 
  }; 

  return pub; 
})({}); 