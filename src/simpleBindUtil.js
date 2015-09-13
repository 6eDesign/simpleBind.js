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
      if(keys[i].indexOf('data-') == 0) {
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
    if(str == '$base') return obj; 
    str = str.split('.');
    for(var i=0; i < str.length; ++i) {
      // if(!obj || typeof obj[str[i]] == 'undefined') {
      //   return '';
      // } else {
        if(str[i] == '$base') return obj; 
        obj = obj[str[i]];
      // }
    }
    return obj;
  };

  return pub; 
})({}); 