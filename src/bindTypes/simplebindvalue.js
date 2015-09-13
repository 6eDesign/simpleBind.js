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
    var val = util.get(obj,config.objKey);
    if(val != config.elem.value) { 
      config.elem.value = val;
    }
  };

  pub.registerBindType('simplebindvalue',collectionRoutine,bindingRoutine); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 


/* 
var bindValue = function(boundObj,value) { 
  if(value) { 
    if(!boundObj.elem.getAttribute('data-simplebindvaluechangeinitiator')) { 
      switch(boundObj.inputType) { 
        case 'select': 
          var opts = boundObj.elem.getElementsByTagName('option'); 
          var selIndex = -1; 
          for(var i=0; i < opts.length; ++i) { 
            if(opts[i].value == value) { 
              selIndex = i;
              break; 
            }
          }
          boundObj.elem.selectedIndex = selIndex; 
          break; 
        case 'radio': 
          boundObj.elem.checked = boundObj.elem.getAttribute('value') == value;
          break; 
        case 'text': 
        default: 
          boundObj.elem.value = value;
          break;
      }
    } else { 
      boundObj.elem.removeAttribute('data-simplebindvaluechangeinitiator');  
    }; 
  }
};
*/