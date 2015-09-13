simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState();

  var collectionRoutine = function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    opts.simplebind = opts.simplebind.split('.'); 
    var configObj = { 
      elem: elem,
      objName: opts.simplebind.shift(), 
      objKey: opts.simplebind.join('.')
    }; 
    pub.addToBoundElems('simplebind',configObj.objName,configObj); 
  };

  var bindingRoutine = function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey); 
    var oldVal = util.get(state.boundObjectsLast[config.objName],config.objKey); 
    if(val != oldVal) { 
      config.elem.innerHTML = typeof val == 'string' ? val : JSON.stringify(val,null,2);
    }
  };

  pub.registerBindType('simplebind',collectionRoutine,bindingRoutine); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 