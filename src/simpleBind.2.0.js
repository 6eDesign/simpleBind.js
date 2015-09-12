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

  return pub; 
})({}); 

var simpleBind = (function(w,d,$,util,pub){
  var state = { 
    bindTypes: [ ], 
    bindTypeOpts: { }, 
    boundElems: { }, 
  }; 

  var init = function() { 
    domCollection();
  }; 

  var domCollection = function(base) { 
    base = (typeof base == 'undefined') ? d : base;
    var all = base.getElementsByTagName('*');
    for(var i=0; i < all.length; ++i) {
      var opts = util.getData(all[i]);
      if(typeof opts['simplebindcollected'] == 'undefined') { 
        var foundBinding = false; 
        for(var j=0; j < state.bindTypes.length; ++j) { 
          if(typeof opts[state.bindTypes[j]] != 'undefined') { 
            console.log("FOUND ELEMENT of bindType '" + state.bindTypes[j] + "'",all[i]); 
            if(!foundBinding) { 
              foundBinding = true;  
              all[i].setAttribute('data-simplebindcollected','true'); 
            }
            state.bindTypeOpts[state.bindTypes[j]].collection(all[i],opts); 
          }
        }
      }
    }
  }; 

  $(d).ready(init); 

  pub.getState = function() { 
    return state;
  }; 

  pub.registerBindType = function(selector,collectionRoutine,bindingRoutine) { 
    if(typeof state.bindTypeOpts[selector] == 'undefined') { 
      state.bindTypeOpts[selector] = { }; 
      state.bindTypes.push(selector); 
    }
    state.bindTypeOpts[selector].collection = collectionRoutine; 
    state.bindTypeOpts[selector].binding = bindingRoutine; 
  }; 

  pub.addToBoundElems = function(objName,configObj) { 
    if(typeof state.boundElems[objName] == 'undefined') state.boundElems[objName] = []; 
    state.boundElems[objName].push(configObj); 
  }; 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 

simpleBind = (function(w,d,$,util,pub){
  pub.registerBindType('simplebind',function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    console.log('registering simplebind bind type func',elem,opts);
    var opts = { }; 
    return null; 
  },function(){
    // binding routine, the function that determines how binding is done for this bind type

  }); 

})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 

// var simpleBind = (function(w,d,$,pub){
//   var init, getKeys, getData, getAttrs, domCollection, addToBoundElems, processBindings, setupRepeat, bindRepeat, rebind, get, set;
//   var state = {
//     boundElems: {},
//     bindHandlers: {},
//     repeatcount: 0,
//     repeats: {},
//     filters: {}
//   };

//   // Initialization runs on DOM Ready event: 
//   init = function() {
//     // domCollection collects all bound elements
//     domCollection();
//   };

//   getKeys = function(obj) {
//     if(Object.keys) {
//       return Object.keys(obj);
//     } else {
//       arr = [];
//       for(var key in obj) {
//         arr.push(key);
//       }
//       return arr;
//     }
//   };

//   getData = function(elem) {
//     var attrs, keys, data = { };
//     attrs = getAttrs(elem);
//     keys = getKeys(attrs);
//     for(var i=0; i < keys.length; ++i) {
//       if(keys[i].indexOf('data-') == 0) {
//         data[keys[i].substring(5,keys[i].length)] = attrs[keys[i]];
//       }
//     }
//     return data;
//   };

//   getAttrs = function(elem) {
//     var attrs, obj = {};
//     attrs = elem.attributes;
//     for(var i=0; i < attrs.length; ++i) {
//       var attr = attrs.item(i);
//       obj[attr.nodeName] = (attr.hasOwnProperty('value')) ? attr.value : attr.nodeValue;
//     }
//     return obj;
//   };

//   domCollection = function(base) {
//     console.log('domCollection() called');
//     base = (typeof base == 'undefined') ? d : base;
//     var all = base.getElementsByTagName('*');
//     for(var i=0; i < all.length; ++i) {
//       var opts = getData(all[i]);
//       if(typeof opts['simplebindcollected'] == 'undefined') {
//         if(typeof opts['simplebind'] != 'undefined') {
//           all[i].setAttribute('data-simplebindcollected','true'); 
//           opts.simplebind = opts.simplebind.split('.');
//           var objName, objKey;
//           objName = opts.simplebind.splice(0,1)[0];
//           objKey = opts.simplebind.join('.');
//           addToBoundElems('bind',all[i],objName,objKey,opts);
//         }
//         // bind handlers take the form:
//         // data-simplebindhandler="handlerName:objName.key.key || data-simplebindhandler="handlerName:objName.$base"
//         // the latter returns the whole object
//         if(typeof opts['simplebindhandler'] != 'undefined') {
//           all[i].setAttribute('data-simplebindcollected','true'); 
//           var handlerName,objName,objKey;
//           opts.simplebindhandler = opts.simplebindhandler.split(':');
//           handlerName = opts.simplebindhandler.shift();
//           opts.simplebindhandler = opts.simplebindhandler.shift().split('.');

//           objName = opts.simplebindhandler.splice(0,1)[0];
//           objKey = opts.simplebindhandler.join('.');

//           addToBoundElems('bindhandler',all[i],objName,objKey,opts,handlerName);
//         }
//         if(typeof opts['simplerepeat'] != 'undefined') {
//           all[i].setAttribute('data-simplebindcollected','true'); 
//           var objName, objKey;
//           opts.simplerepeat = opts.simplerepeat.split(':');
//           objName = opts.simplerepeat[1];
//           objKey = opts.simplerepeat[0];
//           addToBoundElems('repeat',all[i],objName,objKey,opts);
//         }
//       }
//     }
//   };

//   addToBoundElems = function(type,elem,objName,objKey,opts,bindHandlerName) {
//     console.log('addToBoundElems()',arguments);
//     bindHandlerName = (typeof bindHandlerName == 'undefined') ? false : bindHandlerName;
//     elem.setAttribute('data-simplebindcollected','true');
//     if(typeof state.boundElems[objName] == 'undefined') {
//       state.boundElems[objName] = [];
//     }
//     var config = {
//       type: type,
//       elem: elem,
//       objName: objName,
//       objKey: objKey,
//       handler: bindHandlerName,
//       filter: (typeof opts['simplefilter'] != 'undefined') ? opts['simplefilter'] : false
//     };
//     if(type == 'repeat') { setupRepeat(config); }
//     state.boundElems[objName].push(config);
//   };

//   var registeredUndefined = {};
//   processBindings = function(objName,obj) {
//     if(typeof state.boundElems[objName] == 'undefined') return false;
//     for(var i=0; i < state.boundElems[objName].length; ++i) {
//       switch(state.boundElems[objName][i].type) {
//         case 'bind':
//           // just a normal simple-bind here:
//           var value = get(obj,state.boundElems[objName][i].objKey);
//           if(state.boundElems[objName][i].filter) {
//             if(typeof state.filters[state.boundElems[objName][i].filter] != 'undefined') {
//               value = state.filters[state.boundElems[objName][i].filter](value);
//             }
//           }
//           state.boundElems[objName][i].elem.innerHTML = value;
//           break;
//         case 'bindhandler':
//           // a simple-bind-handler here:
//           var handlerName = state.boundElems[objName][i].handler;
//           if(typeof state.bindHandlers[handlerName] == 'function') {
//             var data = (state.boundElems[objName][i].objKey == '$base') ? obj : get(obj,state.boundElems[objName][i].objKey);
//             state.bindHandlers[handlerName](state.boundElems[objName][i].elem,data);
//           } else {
//             if(typeof registeredUndefined[handlerName] == 'undefined') {
//               registeredUndefined[handlerName] = true;
//               if(s_env == 'dev') {
//                 console.log("Handler '" + handlerName + "' is undefined.");
//               }
//             }
//           }
//           break;
//         case 'repeat':
//           console.log('hit repeat case for objName ' + objName, state.boundElems[objName][i], 'binding', obj);
//           var repeatIndex = setupRepeat(state.boundElems[objName][i],obj);
//           bindRepeat(repeatIndex,state.boundElems[objName][i],obj);
//           break;
//         default:
//           break;
//       };
//     }
//   };

//   /*
//     setupRepeat(config)

//     config:    |   Object    |      Required     |      The config object stored in state.boundElems[objName][index]

//   */
//   setupRepeat = function(config,array) {
//     if(typeof config['repeatindex'] == 'undefined') {
//       config['repeatindex'] = 'repeat-' + (state.repeatcount);
//       var repeated = config.elem.getElementsByTagName('*')[0];
//       repeated = config.elem.removeChild(repeated);
//       rebind(repeated,config.objKey,'__repeat-' + config.objName + '0',config.objName);
//       domCollection(config.elem);
//       repeated.style.display = 'none';
//       state.repeats['repeat-' + state.repeatcount] = {
//         container: config.elem,
//         template: repeated,
//         elems: [ ],
//         baseName: '__repeat-' + config.objName
//       }
//       ++state.repeatcount;
//     }
//     return config['repeatindex'];
//   };



  
//     bindRepeat(index,config,array)

//     index:     |   String    |      Required     |      The key used in {state.repeats} used to accesss repeat settings
//     config:    |   Object    |      Required     |      The config object stored in state.boundElems[objName][index]
//     array:     |   Array     |      Required     |      The array to be bound

  

//   bindRepeat = function(index,config,array) {
//     var repeatInfo = state.repeats[index];
//     if(repeatInfo.elems.length < array.length) {
//       // add some elements
//       var numToCreate = array.length - repeatInfo.elems.length;
//       for(var i=0; i < numToCreate; ++i) {
//         var newElem = repeatInfo.template.cloneNode(true);
//         rebind(newElem,repeatInfo.baseName + '0', repeatInfo.baseName + '' + repeatInfo.elems.length,config.objName);
//         repeatInfo.elems.push(repeatInfo.container.appendChild(newElem));
//       }
//       console.log("CALLING domCollection from 'bindRepeat()");
//       domCollection(repeatInfo.container);
//     }

//     if(repeatInfo.elems.length > array.length) {
//       var numToRemove = repeatInfo.elems.length - array.length;
//       for(var i = 0; i < numToRemove; ++i) {
//         var removed = repeatInfo.elems.pop();
//         repeatInfo.container.removeChild(removed);
//       }
//       // console.log(repeatInfo,state.boundElems);
//     }

//     for(var i=0; i < array.length; ++i) {
//       processBindings(repeatInfo.baseName + '' + i,array[i]);
//       repeatInfo.elems[i].style.display = '';
//     }
//   };

//   /*
//     This rebind function is used for simple-repeats.  The repeat setup process clones the DOM
//     node of the provided repeat 'template'.  These DOM nodes have existing data-simplebind*
//     declarations.  This function removves the data-simplebindcollected flag and remaps any 
//     bindings from param.oldName to param.newName.  

//     For example, if we call the function like so:

//       rebind(document.getElementById('contextDiv'),'someObjName','someNewObjName')

//     Then the following HTML: 

//       <div id="contextDiv">
//         <p data-simplebindcollected data-simplebind="someObjName.someKey"></p>
//       </div>
    
//     Will be changed to:

//       <div id="contextDiv">
//         <p data-simplebind="someNewObjName.someKey"></p>  
//       </div>
    
//     This allows this HTML to be re-collected by domCollection (which also accepts a context
//     parameter).  Each object in an array is effectively bound using normal simplebind methodology
//     where the template binding is replaced with "originalBindingName${I}.originalBindingKey"
//     where ${I} represents the array index.


//     rebind(context,oldName,newName)

//     context:      |   Element   |      Required     |      The container element which you would like traversed and rebound
//     oldName:      |   String    |      Required     |      The original object name
//     newName:      |   String    |      Required     |      The new object name
  
//   */
//   var rebindCount =0; 
//   rebind = function(context,oldName,newName,objName) {
//     console.log('rebind count: ', ++rebindCount,context); 
//     var clean, all = context.getElementsByTagName('*');
//     clean = function(elem) {
//       var opts = getData(elem);
//       if(typeof opts['simplebindhandler'] != 'undefined') {
//         elem.setAttribute('data-simplebindhandler',opts['simplebindhandler'].replace(oldName,newName));
//       }
//       if(typeof opts['simplebind'] != 'undefined') {
//         elem.setAttribute('data-simplebind',opts['simplebind'].replace(oldName,newName));
//       }
//       if(typeof opts['simplebindcollected'] != 'undefined') {
//         elem.removeAttribute('data-simplebindcollected');
//       }
//     };
//     clean(context);
//     for(var i=0; i < all.length; ++i) {
//       clean(all[i]);
//     }
//   };

//   // A great function for setting object values
//   // via a string with dot notation:
//   // ex) set({x:{y:{z:2}}},'y.z',3)
//   set = function(obj,str,val) {
//     str = str.split('.');
//     while(str.length > 1) {
//       obj = obj[str.shift()];
//     }
//     return obj[str.shift()] = val;
//   };

//   // Same as above but retrieves the value
//   // instead of setting it:
//   get = function(obj,str) {
//     str = str.split('.');
//     for(var i=0; i < str.length; ++i) {
//       if(!obj || typeof obj[str[i]] == 'undefined') {
//         return '';
//       } else {
//         obj = obj[str[i]];
//       }
//     }
//     return obj;
//   };

//   /* =*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*
//     PUBLIC METHODS: 
//   =*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=* */

//   /*
//     simpleBind.bind(objName, obj)

//     objName:    |   String    |      Required     |      Should be a unique identifier for the bound object
//     obj:        |   Object    |      Required     |      A javascript object to be bound 

//   */
//   pub.bind = function(objName,obj) {
//     if(typeof state.boundElems[objName] != 'undefined' && typeof obj == 'object') {
//       processBindings(objName,obj);
//     }
//   };

//   /*
//     simpleBind.registerBindHandler(handlerName, handlerFn)

//     handlerName:    |     String      |     Required    |     Should be a unique identifier for your bind handler
//     handlerFn:      |     Function    |     Required    |     Callback function for handler, accepts arguments elem and value

//   */
//   pub.registerBindHandler = function(handlerName,handlerFn) {
//     if(typeof handlerName != 'undefined' && typeof handlerFn != 'undefined' && typeof handlerFn == 'function') {
//       state.bindHandlers[handlerName] = handlerFn;
//     }
//   };

//   /*
//     simpleBind.registerFilter(filterName,filterFn) 

//     filterName    |     String      |     Required     |      Should be a unique identifier for your filter 
//     filterFn      |     Function    |     Required     |      Callback function accepts argument value, returns filtered value

//   */
//   pub.registerFilter = function(filterName,filterFn) {
//     if(typeof filterName != 'undefined' && typeof filterFn != 'undefined' && typeof filterFn == 'function') {
//       state.filters[filterName] = filterFn;
//     }
//   };

//   /*
//     simpleBind.recollectDOM(context)

//     context      |    DOM Node    |     Optional      |     Optional parameter to specify which portion of DOM should be recollected.  
//   */
//   pub.recollectDOM = function(context) {
//     domCollection((typeof context == 'undefined') ? d.body : context); 
//   };

//   $(d).ready(init);
//   return pub;
// })(window,document,jQuery,{});

// simpleBind = (function(w,d,$,pub){
//   simpleBind.registerBindType({
    
//   });
//   return pub; 
// })(window,document,jQuery,simpleBind || {}); 