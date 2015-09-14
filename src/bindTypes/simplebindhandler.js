simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState();
  state.bindHandlers = { }; 

  var collectionRoutine = function(elem,opts){
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
  }; 

  var bindingRoutine = function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    if(typeof state.bindHandlers[config.handler] != 'undefined') { 
      var val = util.get(obj,config.objKey)
        , oldVal = util.get(state.boundObjectsLast[config.objName],config.objKey); 
      if(val != oldVal) { 
        state.bindHandlers[config.handler](config.elem,util.get(obj,config.objKey)); 
      }
    }
  };

  // var objNameReplaceRe = new RegExp(/^[^\.]*/);
  // ex: replaceObjName('bindHandlerName:someObjName.key1','someObjName','newObjName') 
  //        => 'bindHandlerNamenewObjName.key1.key2'
  // 
  // bindhandlers can be comma-separated, ie: 'handler:obj.key,handler1:obj.key2'
  // ex: replaceObjName('handler:obj.key,handler1:obj2.key2','obj','newObj')
  //        => 'handler:newObj.key,handler1:obj2.key2'
  //        
  var replaceObjName = function(binding,oldObjName,newObjName) { 
    return binding.replace(new RegExp(':'+oldObjName+'\\.','g'),':'+newObjName+'.'); 
  }; 

  pub.registerBindType('simplebindhandler',collectionRoutine,bindingRoutine,replaceObjName); 

  pub.registerBindHandler = function(handlerName,func) { 
    if(typeof func == 'function') { 
      state.bindHandlers[handlerName] = func;
    }
  }; 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 