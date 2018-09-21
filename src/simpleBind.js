import * as util from './simpleBindUtil';
import state from './state';

var d = document;

var init = function() { 
  domCollection();
  state.ready = true; 
  if(state.beforeReadyBindQueue.length) { 
    for(var i=0; i < state.beforeReadyBindQueue.length; ++i) { 
      lib.bind(state.beforeReadyBindQueue[i].name,state.beforeReadyBindQueue[i].obj);
    }
  }
}; 

var domCollection = function(base,autoReBind) { 
  autoReBind = (typeof autoReBind == 'undefined') ? false : autoReBind; 
  if(autoReBind) { 
    state.autoReBinding = true; 
    state.autoReBindingQueue = { }; 
  } 
  base = (typeof base == 'undefined') ? d : base;
  var all = base.getElementsByTagName('*');
  for(var i=0; i < all.length; ++i) {
    var opts = util.getData(all[i]);
    if(typeof opts['simplebindcollected'] == 'undefined') { 
      var foundBinding = false; 
      for(var j=0; j < state.bindTypes.length; ++j) { 
        if(typeof opts[state.bindTypes[j]] != 'undefined') { 
          if(!foundBinding) { 
            foundBinding = true;  
            all[i].setAttribute('data-simplebindcollected','true'); 
          }
          opts.bindType = state.bindTypes[j]; 
          state.bindTypeOpts[state.bindTypes[j]].collection(all[i],opts); 
        }
      }
    }
  }
  if(autoReBind) { 
    state.autoReBinding = false; 
    processAutoRebindingQueue(); 
  } 
}; 

var processBoundElems = function(elems,obj,flush) { 
  flush = typeof flush == 'undefined' ? false : flush;
  for(var i=0; i < elems.length; ++i) { 
    if(state.bindTypeOpts[elems[i].bindType].binding) { 
      state.bindTypeOpts[elems[i].bindType].binding(elems[i],obj,flush); 
    }
  }
}; 

var processAutoRebindingQueue = function() { 
  for(var key in state.autoReBindingQueue) { 
    if(typeof state.boundObjects[key] != 'undefined') { 
      processBoundElems(state.autoReBindingQueue[key],state.boundObjects[key],true);
    }
  }
}; 

var processBindings = function(objName,obj) { 
  if(typeof state.boundObjectsLast[objName] == 'undefined') state.boundObjectsLast[objName] = { }; 
  state.boundObjects[objName] = obj; 
  if(typeof state.boundElems[objName] != 'undefined') { 
    processBoundElems(state.boundElems[objName],obj); 
    state.boundObjectsLast[objName] = util.extend({},obj);
  }
}; 

d.addEventListener('DOMContentLoaded',function(){
  init();
}); 

var lib = window.simpleBind || {}; 

lib.util = util;

lib.getState = function() { 
  return state;
}; 

lib.registerBindType = function(selector,collectionRoutine,bindingRoutine) { 
  if(typeof state.bindTypeOpts[selector] == 'undefined') { 
    state.bindTypeOpts[selector] = { }; 
    state.bindTypes.push(selector); 
  }
  state.bindTypeOpts[selector].collection = collectionRoutine; 
  state.bindTypeOpts[selector].binding = bindingRoutine; 
}; 

lib.addToBoundElems = function(bindType,objName,configObj) { 
  configObj.bindType = bindType; 
  if(typeof state.boundElems[objName] == 'undefined') state.boundElems[objName] = []; 
  if(state.autoReBinding) { 
    if(typeof state.autoReBindingQueue[objName] == 'undefined') state.autoReBindingQueue[objName] = []; 
    state.autoReBindingQueue[objName].push(configObj);      
  }
  state.boundElems[objName].push(configObj); 
}; 

lib.recollectDOM = function(context,autoReBind) { 
  domCollection(context,autoReBind);
}; 

lib.bind = function(objName,obj) {
  if(typeof objName == 'string' && typeof obj == 'object') {
    if(typeof state.boundElems[objName] == 'undefined') state.boundElems[objName] = [];
    if(state.ready) { 
      processBindings(objName,obj);
    } else { 
      state.beforeReadyBindQueue.push({name: objName, obj: obj});
    }
  }
}; 

lib.extendNamespace = function(name,method) { 
  lib[name] = method;
}; 

export default lib; 