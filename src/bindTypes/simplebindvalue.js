simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState(); 
  var changeInitiatorMarker = 'data-simplebindvaluechanger';
  var handleInput = function() { 
    var binding = this.getAttribute('data-simplebindvalue').split('.')
      , objName = binding.shift(); 
    util.set(state.boundObjects[objName],binding.join('.'),this.value);     
    pub.bind(objName,state.boundObjects[objName]);
  }; 
  pub.registerBindType('simplebindvalue',function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    opts.simplebindvalue = opts.simplebindvalue.split('.'); 
    var configObj = { 
      elem: elem,
      objName: opts.simplebindvalue.shift(), 
      objKey: opts.simplebindvalue.join('.')
    }; 
    $(elem).on('keyup',handleInput);
    pub.addToBoundElems('simplebindvalue',configObj.objName,configObj); 
  },function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    if(config.elem.getAttribute(changeInitiatorMarker)) { 
      config.elem.removeAttribute(changeInitiatorMarker);
    } else { 
      config.elem.value = util.get(obj,config.objKey);
    }
  }); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 