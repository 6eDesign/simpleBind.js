var simpleBind = (function(w,d,$,pub){
  var  domCollection, addToBoundElems, processBindings, setupRepeat, bindRepeat, rebind, get, set;
  var state = {
    boundElems: {},
    bindHandlers: {},
    repeatcount: 0,
    repeats: {},
    filters: {}
  };

  // Initialization runs on DOM Ready event: 
  var init = function() {
    // domCollection collects all bound elements
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

  var addLoadEvent = function(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
      window.onload = func;
    } else {
      window.onload = function() {
        if (oldonload) {
          oldonload();
        }
        func();
      }
    }
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
          // obj is an [array]: 
          var repeatIndex = setupRepeat(state.boundElems[objName][i]);
          bindRepeat(repeatIndex,state.boundElems[objName][i],obj);
          break;
        default:
          break;
      };
    }
  };

  /*
    setupRepeat(config)

    config:    |   Object    |      Required     |      The config object stored in state.boundElems[objName][index]

  */
  setupRepeat = function(config) {
    if(typeof config['repeatindex'] == 'undefined') {
      config['repeatindex'] = 'repeat-' + (state.repeatcount);
      var repeated = config.elem.getElementsByTagName('*')[0];
      rebind(repeated,config.objKey,'__repeat-' + config.objName + '0');
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


  /*
    bindRepeat(index,config,array)

    index:     |   String    |      Required     |      The key used in {state.repeats} used to accesss repeat settings
    config:    |   Object    |      Required     |      The config object stored in state.boundElems[objName][index]
    array:     |   Array     |      Required     |      The array to be bound

  */
  bindRepeat = function(index,config,array) {
    var repeatInfo = state.repeats[index];
    if(repeatInfo.elems.length < array.length) {
      // add some elements
      var numToCreate = array.length - repeatInfo.elems.length;
      for(var i=0; i < numToCreate; ++i) {
        var newElem = repeatInfo.template.cloneNode(true);
        rebind(newElem,repeatInfo.baseName + '0', repeatInfo.baseName + '' + repeatInfo.elems.length);
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

  /*
    This rebind function is used for simple-repeats.  The repeat setup process clones the DOM
    node of the provided repeat 'template'.  These DOM nodes have existing data-simplebind*
    declarations.  This function removves the data-simplebindcollected flag and remaps any 
    bindings from param.oldName to param.newName.  

    For example, if we call the function like so:

      rebind(document.getElementById('contextDiv'),'someObjName','someNewObjName')

    Then the following HTML: 

      <div id="contextDiv">
        <p data-simplebindcollected data-simplebind="someObjName.someKey"></p>
      </div>
    
    Will be changed to:

      <div id="contextDiv">
        <p data-simplebind="someNewObjName.someKey"></p>  
      </div>
    
    This allows this HTML to be re-collected by domCollection (which also accepts a context
    parameter).  Each object in an array is effectively bound using normal simplebind methodology
    where the template binding is replaced with "originalBindingName${I}.originalBindingKey"
    where ${I} represents the array index.


    rebind(context,oldName,newName)

    context:      |   Element   |      Required     |      The container element which you would like traversed and rebound
    oldName:      |   String    |      Required     |      The original object name
    newName:      |   String    |      Required     |      The new object name
  
  */
  rebind = function(context,oldName,newName) {
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


  /* =*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*
    PUBLIC METHODS: 
  =*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=* */

  /*
    simpleBind.bind(objName, obj)

    objName:    |   String    |      Required     |      Should be a unique identifier for the bound object
    obj:        |   Object    |      Required     |      A javascript object to be bound 

  */
  pub.bind = function(objName,obj) {
    if(typeof state.boundElems[objName] != 'undefined' && typeof obj == 'object') {
      processBindings(objName,obj);
    }
  };

  /*
    simpleBind.registerBindHandler(handlerName, handlerFn)

    handlerName:    |     String      |     Required    |     Should be a unique identifier for your bind handler
    handlerFn:      |     Function    |     Required    |     Callback function for handler, accepts arguments elem and value

  */
  pub.registerBindHandler = function(handlerName,handlerFn) {
    if(typeof handlerName != 'undefined' && typeof handlerFn != 'undefined' && typeof handlerFn == 'function') {
      state.bindHandlers[handlerName] = handlerFn;
    }
  };

  /*
    simpleBind.registerFilter(filterName,filterFn) 

    filterName    |     String      |     Required     |      Should be a unique identifier for your filter 
    filterFn      |     Function    |     Required     |      Callback function accepts argument value, returns filtered value

  */
  pub.registerFilter = function(filterName,filterFn) {
    if(typeof filterName != 'undefined' && typeof filterFn != 'undefined' && typeof filterFn == 'function') {
      state.filters[filterName] = filterFn;
    }
  };

  /*
    simpleBind.recollectDOM(context)

    context      |    DOM Node    |     Optional      |     Optional parameter to specify which portion of DOM should be recollected.  
  */
  pub.recollectDOM = function(context) {
    domCollection((typeof context == 'undefined') ? d.body : context); 
  };

  $(d).ready(init);
  return pub;
})(window,document,jQuery,{});
