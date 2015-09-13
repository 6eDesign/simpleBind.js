simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState(); 
  var changeInitiatorMarker = 'data-simplebindvaluechanger';
  /**
   * handleInput() is an event callback to handle changes to simplebindvalue-bound inputs
   */
  var handleInput = function() { 
    var binding = this.getAttribute('data-simplebindvalue').split('.')
      , objName = binding.shift(); 
    util.set(state.boundObjects[objName],binding.join('.'),this.value);     
    pub.bind(objName,state.boundObjects[objName]);
    this.setAttribute(changeInitiatorMarker,'true');
    if(objName.indexOf('__repeat') > -1) { 
      var originalObjName = state.repeatDictionary[objName.split('-').shift()];
      pub.bind(originalObjName,state.boundObjects[originalObjName]);
    }
  }; 

  var collectionRoutine = function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    opts.simplebindvalue = opts.simplebindvalue.split('.'); 
    var configObj = { 
      elem: elem,
      objName: opts.simplebindvalue.shift(), 
      objKey: opts.simplebindvalue.join('.')
    }; 
    $(elem).on('keyup',handleInput);
    pub.addToBoundElems('simplebindvalue',configObj.objName,configObj); 
  }; 

  var bindingRoutine = function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey)
      , oldVal = util.get(state.boundObjectsLast[config.objName],config.objKey);
    if(val != oldVal) { 
      config.elem.value = val;
    }
  };

  pub.registerBindType('simplebindvalue',collectionRoutine,bindingRoutine); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 