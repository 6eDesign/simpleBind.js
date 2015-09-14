var simpleBind = (function(w,d,$,util,pub){
  var state = { 
    bindTypes: [ ], 
    bindTypeOpts: { }, 
    boundElems: { }, 
    boundObjects: { }, 
    boundObjectsLast: { }
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
            // console.log("FOUND ELEMENT of bindType '" + state.bindTypes[j] + "'",all[i]); 
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
  }; 

  var processBindings = function(objName,obj) { 
    if(typeof state.boundObjectsLast[objName] == 'undefined') state.boundObjectsLast[objName] = { }; 
    state.boundObjects[objName] = obj; 
    for(var i=0; i < state.boundElems[objName].length; ++i) { 
      if(state.bindTypeOpts[state.boundElems[objName][i].bindType].binding) { 
        state.bindTypeOpts[state.boundElems[objName][i].bindType].binding(state.boundElems[objName][i],obj); 
      }
    }
    state.boundObjectsLast[objName] = $.extend({},obj);
  }; 

  $(d).ready(init); 

  pub.getState = function() { 
    return state;
  }; 

  pub.registerBindType = function(selector,collectionRoutine,bindingRoutine,objNameReplaceFn) { 
    if(typeof state.bindTypeOpts[selector] == 'undefined') { 
      state.bindTypeOpts[selector] = { }; 
      state.bindTypes.push(selector); 
    }
    state.bindTypeOpts[selector].collection = collectionRoutine; 
    state.bindTypeOpts[selector].binding = bindingRoutine; 
    state.bindTypeOpts[selector].objNameReplaceFn = objNameReplaceFn;
  }; 

  pub.addToBoundElems = function(bindType,objName,configObj) { 
    if(typeof state.boundElems[objName] == 'undefined') state.boundElems[objName] = []; 
    configObj.bindType = bindType; 
    state.boundElems[objName].push(configObj); 
  }; 

  pub.recollectDOM = function(context) { 
    domCollection(context);
  }; 

  pub.bind = function(objName,obj) { 
    if(typeof state.boundElems[objName] != 'undefined' && typeof obj == 'object') {
      processBindings(objName,obj);
    }
  }; 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 