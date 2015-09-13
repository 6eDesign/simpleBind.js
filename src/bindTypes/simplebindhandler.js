simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState();
  state.bindHandlers = { }; 
  pub.registerBindType('simplebindhandler',function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    var bindHandlers = opts.simplebindhandler.split(','); 
    for(var i=0; i < bindHandlers.length; ++i) { 
      bindHandlers[i] =  bindHandlers[i].split(':'); 
      var configObj = { 
        elem: elem,
        handler: bindHandlers[i].shift() 
      }
      bindHandlers[i] = bindHandlers[i].shift().split('.'); 
      configObj.objName = bindHandlers[i].shift(); 
      configObj.objKey = bindHandlers[i].join('.'); 
      pub.addToBoundElems('simplebindhandler',configObj.objName,configObj); 
    }
  },function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    if(typeof state.bindHandlers[config.handler] != 'undefined') { 
      state.bindHandlers[config.handler](config.elem,util.get(obj,config.objKey)); 
    }
  }); 

  pub.registerBindHandler = function(handlerName,func) { 
    if(typeof func == 'function') { 
      state.bindHandlers[handlerName] = func;
    }
  }; 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 