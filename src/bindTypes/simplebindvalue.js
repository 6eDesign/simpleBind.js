simpleBind = (function(w,d,util,pub){
  var state = pub.getState(); 
  var changeInitiatorMarker = 'data-simplebindvaluechanger';
  /**
   * handleInput() is an event callback to handle changes to simplebindvalue-bound inputs
   */
  var handleInput = function() { 
    var binding = this.getAttribute('data-simplebindvalue').split('.')
      , objName = binding.shift(); 
    // in case this object hasn't been set yet, for whatever reason, set it to a blank object:
    if(typeof state.boundObjects[objName] == 'undefined') state.boundObjects[objName] = {}; 
    util.set(state.boundObjects[objName],binding.join('.'),getInputValueByType(this));     
    pub.bind(objName,state.boundObjects[objName]);
    this.setAttribute(changeInitiatorMarker,'true');
    if(objName.indexOf('__repeat') > -1) { 
      var originalObjName = state.repeatDictionary[objName.split('-').shift()];
      pub.bind(originalObjName,state.boundObjects[originalObjName]);
    }
  }; 

  var rateLimitInput = function() { 
    var elem = this; 
    util.delay(function(){
      handleInput.call(elem);
    },50)
  }; 

  var getInputType = function(elem) { 
    var type, tagName = elem.tagName.toLowerCase();
    switch(tagName) { 
     case 'input':     
       type = elem.getAttribute('type'); 
       return type; 
     default: 
       return tagName; 
    }
  };

  var getInputValueByType = function(elem) { 
    var type = getInputType(elem); 
    switch(type) { 
      case 'textarea': 
        return elem.innerHTML;
        break; 
      case 'checkbox': 
        return elem.checked;
        break; 
      default: 
        return elem.value; 
    } 
  }; 

  var attachAppropriateEventHandlers = function(elem,inputType) { 
    switch(inputType) { 
      case 'text':
      case 'password':
      case 'textarea':
        elem.addEventListener('keyup',rateLimitInput); 
      default: 
        elem.addEventListener('change',handleInput);
        break; 
    }
  }; 

  var collectionRoutine = function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    opts.simplebindvalue = opts.simplebindvalue.split('.'); 
    var configObj = { 
      elem: elem,
      objName: opts.simplebindvalue.shift(), 
      objKey: opts.simplebindvalue.join('.'), 
      inputType: getInputType(elem)
    }; 
    attachAppropriateEventHandlers(elem,configObj.inputType);
    pub.addToBoundElems('simplebindvalue',configObj.objName,configObj); 
  }; 

  var bindingRoutine = function(config,obj,flush){
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey);
    switch(config.inputType) { 
      case 'select': 
        var opts = config.elem.getElementsByTagName('option'); 
        var selIndex = -1; 
        for(var i=0; i < opts.length; ++i) { 
          if(opts[i].value == val) { 
            selIndex = i; 
            break; 
          }
        }
        config.elem.selectedIndex = i; 
        break; 
      case 'radio': 
        config.elem.checked = val == config.elem.value; 
        break; 
      case 'checkbox': 
        config.elem.checked = val; 
        break; 
      case 'text': 
      default: 
        if(val != config.elem.value || flush) { 
          config.elem.value = val; 
        }
        break; 
    }
  };

  pub.registerBindType('simplebindvalue',collectionRoutine,bindingRoutine); 
  return pub; 
})(window,document,simpleBindUtil,simpleBind||{});