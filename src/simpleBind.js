var simpleBind = (function(w,d,$,pub){
  var  domCollection, addToBoundElems, processBindings, setupRepeat, bindRepeat, rebind, get, set;
  var state = {
    boundElems: {},
    bindHandlers: {},
    repeatcount: 0,
    repeats: {},
    filters: {}
  };

  var init = function() {
    domCollection();
  };

  var getKeys = function(obj) {
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

  var getAttrs = function(elem) {
    var attrs, obj = {};
    attrs = elem.attributes;
    for(var i=0; i < attrs.length; ++i) {
      var attr = attrs.item(i);
      obj[attr.nodeName] = (attr.hasOwnProperty('value')) ? attr.value : attr.nodeValue;
    }
    return obj;
  };

  var getData = function(elem) {
    var attrs, keys, data = { };
    attrs = getAttrs(elem);
    keys = getKeys(attrs);
    for(var i=0; i < keys.length; ++i) {
      if(keys[i].indexOf('data-') == 0) {
        data[keys[i].substring(5,keys[i].length)] = attrs[keys[i]];
      }
    }
    return data;
  };



  var first = true;
  domCollection = function(base) {
    base = (typeof base == 'undefined') ? d : base;
    var all = base.getElementsByTagName('*');
    for(var i=0; i < all.length; ++i) {
      var opts = getData(all[i]);
      if(typeof opts['simplebindcollected'] == 'undefined') {
        if(typeof opts['simplebind'] != 'undefined') {
          opts.simplebind = opts.simplebind.split('.');
          var objName, objKey;
          objName = opts.simplebind.splice(0,1)[0];
          objKey = opts.simplebind.join('.');
          addToBoundElems('bind',all[i],objName,objKey,opts);
        }
        // bind handlers take the form:
        // data-simplebindhandler="handlerName:objName.key.key || data-simplebindhandler="handlerName:objName.$base"
        // the latter returns the whole object
        if(typeof opts['simplebindhandler'] != 'undefined') {
          var handlerName,objName,objKey;
          opts.simplebindhandler = opts.simplebindhandler.split(':');
          handlerName = opts.simplebindhandler.shift();
          opts.simplebindhandler = opts.simplebindhandler.shift().split('.');

          objName = opts.simplebindhandler.splice(0,1)[0];
          objKey = opts.simplebindhandler.join('.');

          addToBoundElems('bindhandler',all[i],objName,objKey,opts,handlerName);
        }
        if(typeof opts['simplerepeat'] != 'undefined') {
          var objName, objKey;
          opts.simplerepeat = opts.simplerepeat.split(':');
          objName = opts.simplerepeat[1];
          objKey = opts.simplerepeat[0];

          addToBoundElems('repeat',all[i],objName,objKey,opts);
        }
      }
    }
    first = false;
  };

  addToBoundElems = function(type,elem,objName,objKey,opts,bindHandlerName) {
    bindHandlerName = (typeof bindHandlerName == 'undefined') ? false : bindHandlerName;
    elem.setAttribute('data-simplebindcollected','true');
    if(typeof state.boundElems[objName] == 'undefined') {
      state.boundElems[objName] = [];
    }
    if(typeof opts['simplefilter'] != 'undefined') {

    }

    state.boundElems[objName].push({
      type: type,
      elem: elem,
      objName: objName,
      objKey: objKey,
      handler: bindHandlerName,
      filter: (typeof opts['simplefilter'] != 'undefined') ? opts['simplefilter'] : false
    });
  };

  var registeredUndefined = {};
  processBindings = function(objName,obj) {
    if(typeof state.boundElems[objName] == 'undefined') return false;
    for(var i=0; i < state.boundElems[objName].length; ++i) {
      switch(state.boundElems[objName][i].type) {
        case 'bind':
          // just a normal simple-bind here:
          var value = get(obj,state.boundElems[objName][i].objKey);
          if(state.boundElems[objName][i].filter) {
            if(typeof state.filters[state.boundElems[objName][i].filter] != 'undefined') {
              value = state.filters[state.boundElems[objName][i].filter](value);
            }
          }
          state.boundElems[objName][i].elem.innerHTML = value;
          break;
        case 'bindhandler':
          // a simple-bind-handler here:
          var handlerName = state.boundElems[objName][i].handler;
          if(typeof state.bindHandlers[handlerName] == 'function') {
            var data = (state.boundElems[objName][i].objKey == '$base') ? obj : get(obj,state.boundElems[objName][i].objKey);
            state.bindHandlers[handlerName](state.boundElems[objName][i].elem,data);
          } else {
            if(typeof registeredUndefined[handlerName] == 'undefined') {
              registeredUndefined[handlerName] = true;
              if(typeof window.s_env != 'undefined' && s_env == 'dev') {
                console.log("Handler '" + handlerName + "' is undefined.");
              }
            }
          }
          break;
        case 'repeat':
          var repeatIndex = setupRepeat(state.boundElems[objName][i],obj);
          bindRepeat(repeatIndex,state.boundElems[objName][i],obj);
          break;
        default:
          break;
      };
    }
  };

  setupRepeat = function(config,array) {
    if(typeof config['repeatindex'] == 'undefined') {
      config['repeatindex'] = 'repeat-' + (state.repeatcount);
      var repeated = config.elem.getElementsByTagName('*')[0];
      rebind(repeated,config.objKey,'__repeat-' + config.objName + '0',config.objName);
      domCollection(config.elem);
      repeated.style.display = 'none';
      state.repeats['repeat-' + state.repeatcount] = {
        container: config.elem,
        template: repeated,
        elems: [ repeated ],
        baseName: '__repeat-' + config.objName
      }
      ++state.repeatcount;
    }
    return config['repeatindex'];
  };

  bindRepeat = function(index,config,array) {
    var repeatInfo = state.repeats[index];
    if(repeatInfo.elems.length < array.length) {
      // add some elements
      var numToCreate = array.length - repeatInfo.elems.length;
      for(var i=0; i < numToCreate; ++i) {
        var newElem = repeatInfo.template.cloneNode(true);
        rebind(newElem,repeatInfo.baseName + '0', repeatInfo.baseName + '' + repeatInfo.elems.length,config.objName);
        repeatInfo.elems.push(repeatInfo.container.appendChild(newElem));
      }
      domCollection(repeatInfo.container);
    }

    if(repeatInfo.elems.length > array.length) {
      var numToRemove = repeatInfo.elems.length - array.length;
      for(var i = 0; i < numToRemove; ++i) {
        var removed = repeatInfo.elems.pop();
        repeatInfo.container.removeChild(removed);
      }
    }

    for(var i=0; i < array.length; ++i) {
      processBindings(repeatInfo.baseName + '' + i,array[i]);
      repeatInfo.elems[i].style.display = '';
    }
  };

  rebind = function(context,oldName,newName,objName) {
    var clean, all = context.getElementsByTagName('*');
    clean = function(elem) {
      var opts = getData(elem);
      if(typeof opts['simplebindhandler'] != 'undefined') {
        elem.setAttribute('data-simplebindhandler',opts['simplebindhandler'].replace(oldName,newName));
      }
      if(typeof opts['simplebind'] != 'undefined') {
        elem.setAttribute('data-simplebind',opts['simplebind'].replace(oldName,newName));
      }
      if(typeof opts['simplebindcollected'] != 'undefined') {
        elem.removeAttribute('data-simplebindcollected');
      }
    };
    clean(context);
    for(var i=0; i < all.length; ++i) {
      clean(all[i]);
    }
  };

  // A great function for setting object values
  // via a string with dot notation:
  // ex) set({x:{y:{z:2}}},'y.z',3)
  set = function(obj,str,val) {
    str = str.split('.');
    while(str.length > 1) {
      obj = obj[str.shift()];
    }
    return obj[str.shift()] = val;
  };

  // Same as above but retrieves the value
  // instead of setting it:
  get = function(obj,str) {
    str = str.split('.');
    for(var i=0; i < str.length; ++i) {
      if(!obj || typeof obj[str[i]] == 'undefined') {
        return '';
      } else {
        obj = obj[str[i]];
      }
    }
    return obj;
  };

  // PUBLIC METHODS:
  pub.bind = function(objName,obj) {
    if(typeof state.boundElems[objName] != 'undefined' && typeof obj == 'object') {
      processBindings(objName,obj);
    }
  };

  pub.registerBindHandler = function(handlerName,handlerFn) {
    if(typeof handlerName != 'undefined' && typeof handlerFn != 'undefined' && typeof handlerFn == 'function') {
      state.bindHandlers[handlerName] = handlerFn;
    }
  };

  pub.registerFilter = function(filterName,filterFn) {
    if(typeof filterName != 'undefined' && typeof filterFn != 'undefined' && typeof filterFn == 'function') {
      state.filters[filterName] = filterFn;
    }
  };

  pub.recollectDOM = function(base) {
    if(typeof base == 'undefined') {
      domCollection();
    } else {
      domCollection(base);
    }
  };

  $(d).ready(init);
  return pub;
})(window,document,jQuery,{});