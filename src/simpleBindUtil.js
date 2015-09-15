var simpleBindUtil = (function(pub){
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
      if(typeof obj[str[i]] == 'undefined') {
        return '';
      } else {
        if(str[i] == '$base') return obj;
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
      // console.log('yip',str,oldObj,newObj);
      str = str.replace(standardObjNameRegex,newObj)
    }; 
    return str; 
  }; 

  pub.replaceObjNameInBindingStr = function(str,bindType,oldObj,newObj) { 
    // console.log(str);
    var origStr = str + '';
    if(str.indexOf(':') > -1) { 
      // we have either a bindhandler, simpledata, simpleevent, or simplerepeat
      console.log('got here',bindType,str);
      switch(bindType) { 
        case 'simplebindhandler': 
        case 'simpledata': 
          str = str.split(','); 
          for(var i=0; i < str.length; ++i) { 
            console.log('ye');
            str[i] = str[i].split(':'); 
            if(str[i].length > 1) {
              console.log(str[i][1]);
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
        case 'simpeevent': 
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