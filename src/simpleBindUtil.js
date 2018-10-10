import * as objNameLocations from './bindTypes/const/objNameLocation';

var getType = function(variable) {
  var type = typeof variable;
  switch(type) {
    case 'object':
      if(variable == null) return 'null';
      return variable instanceof Array ? 'array' : type;
    default:
      return type;
  }
};

export var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

var copyArrayWithoutReferences = function (arr) {
  var toReturn = [];
  for (var i = 0; i < arr.length; ++i) {
    var type = getType(arr[i]);
    switch (type) {
      case 'object':
        toReturn.push(extend({}, arr[i]));
        break;
      case 'array':
        toReturn.push(copyArrayWithoutReferences(arr[i]));
        break;
      default:
        toReturn.push(arr[i]);
        break;
    }
  }
  return toReturn;
};

export var extend = function() {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var src = arguments[i]
      , target = arguments[0];
    for (var key in src) {
      var isArrayPresent = getType(src[key]) === 'array';
      var simpleExtend = getType(target[key]) != 'object' && getType(src[key]) != 'object' && !isArrayPresent;
      if (simpleExtend) {
        target[key] = src[key];
      } else {
        target[key] = extend(typeof target[key] == 'undefined' ? { } : target[key],src[key]);
        if (isArrayPresent) {
          target[key] = copyArrayWithoutReferences(src[key]);
        } else {
          target[key] = extend(typeof target[key] == 'undefined' ? {} : target[key], src[key]);
        }
      }
    }
  }
  return arguments.length ? arguments[0] : { };
};

export var getKeys = function(obj) {
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

export var getData = function(elem) {
  var attrs, keys, data = { };
  attrs = getAttrs(elem);
  keys = getKeys(attrs);
  for(var i=0; i < keys.length; ++i) {
    if(keys[i].indexOf('data-') === 0) {
      data[keys[i].substring(5,keys[i].length)] = attrs[keys[i]];
    }
  }
  return data;
};

export var getAttrs = function(elem) {
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

// set = function(obj,str,val) {
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
export var set = function(obj,str,val) {
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
export var get = function(obj,str) {
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

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

let replaceObjNameInBindingStrSingular = (location,oldName,newName) => str => { 
  switch(location) { 
    case objNameLocations.FIRST_IN_STRING: 
      str = str.replace(new RegExp(`^${escapeRegExp(oldName)}(\.)?`), `${newName}$1`);
      return str; 
    case objNameLocations.COLON_SEPARATED_SECOND_GROUP: 
      str = str.replace(new RegExp(`^([^:]+:)${escapeRegExp(oldName)}(\\.)?`),`$1${newName}$2`);
      return str; 
    case objNameLocations.COLON_SEPARATED_THIRD_GROUP: 
      str = str.replace(new RegExp(`^([^:]+:[^:]+:)${escapeRegExp(oldName)}(\\.)?`),`$1${newName}$2`);
      return str; 
  }
};

export function replaceObjNameInBindingStr(str,bindTypeOpts,oldName,newName) { 
  return str.split(',')
            .map(replaceObjNameInBindingStrSingular(bindTypeOpts.objNameLocation,oldName,newName))
            .join(','); 
}

export var triggerEvent = function(elem,type){
  if('createEvent' in document) {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent(type,false,true);
    elem.dispatchEvent(evt);
  } else {
    elem.fireEvent('on' + type);
  }
};