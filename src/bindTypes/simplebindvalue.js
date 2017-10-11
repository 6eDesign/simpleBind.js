simpleBind = (function(w,d,util,pub){
  var state = pub.getState();

  // define two flags that are used to help us determine flow/bubbling and prevent indefinite recursion: 
  //  1. eventDispatchMarker: this is applied when we programatically trigger a change event on an input
  //  2. changeInitiatorMarker: this is applied to bindvalue input when it invokes a change 
  var eventDispatchMarker = 'data-simpleeventdispatch'
    , changeInitiatorMarker = 'data-simplebindvaluechanger';

  /**
   * handleInput() is an event callback to handle changes to simplebindvalue-bound inputs
   */
  var handleInput = function() {
    // check if we are simply dispatching an event from the bindingRoutine callback
    if(this.getAttribute(eventDispatchMarker)) {
      // we are
      this.removeAttribute(eventDispatchMarker);
    } else {
      // we are not, we need to update other items that are bound to same object.property: 
      var binding = this.getAttribute('data-simplebindvalue').split('.')
        , objName = binding.shift();
      // in case this object hasn't been set yet, for whatever reason, set it to a blank object:
      if(typeof state.boundObjects[objName] == 'undefined') state.boundObjects[objName] = {};
      util.set(state.boundObjects[objName],binding.join('.'),getInputValue(this));
      pub.bind(objName,state.boundObjects[objName]);
      this.setAttribute(changeInitiatorMarker,'true');
      if(objName.indexOf('__repeat') > -1) {
        var originalObjName = state.repeatDictionary[objName.split('-').shift()];
        pub.bind(originalObjName,state.boundObjects[originalObjName]);
      }
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

  var checkIfInputValueChanged = function(input,currVal) {
    var type = getInputType(input);
    // for checkboxes and radio inputs, it is necessary to account for 
    // string vs boolean comparisons since the value attribute on an 
    // input is always a string: 
    switch(type) {
      case 'checkbox':
        return String(input.checked) != String(currVal);
        return false;
      case 'radio':
        var radioVal = getInputValue(input);
        return (input.checked && radioVal != String(currVal)) || (!input.checked && radioVal == String(currVal));
      default:
        return currVal != getInputValue(input);
    }
  };

  var getInputValue = function(elem) {
    var type = getInputType(elem);
    switch(type) {
      case 'checkbox':
        return elem.checked;
      default:
        return elem.value;
    }
  };

  var attachAppropriateEventHandlers = function(elem,inputType) {
    switch(inputType) {
      case 'text':
      case 'tel':
      case 'password':
      case 'textarea':
      case 'number': 
      case 'email': 
      case 'zip':
        elem.addEventListener('keyup',rateLimitInput);
      default:
        elem.addEventListener('change',handleInput);
        break;
    }
  };

  var setValue = function(config,val) {
    switch(config.inputType) {
      case 'select':
        var opts = config.elem.getElementsByTagName('option');
        var selIndex = 0;
        for(var i=0; i < opts.length; ++i) {
          if(opts[i].value == val) {
            selIndex = i;
            break;
          }
        }
        config.elem.selectedIndex = selIndex;
        break;
      case 'radio':
        config.elem.checked = String(val) == config.elem.value;
        break;
      case 'checkbox':
        config.elem.checked = (val === true || val == 'true');
        break;
      case 'textarea':
        if(config.elem.innerHTML != val) {
          config.elem.innerHTML = val;
        }
        break;
      case 'text':
      default:
        if(val != config.elem.value || flush) {
          config.elem.value = val;
        }
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
      inputType: getInputType(elem),
      initiatedChange: false
    };
    attachAppropriateEventHandlers(elem,configObj.inputType);
    pub.addToBoundElems('simplebindvalue',configObj.objName,configObj);
  };

  var bindingRoutine = function(config,obj,flush){
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey);
    if(checkIfInputValueChanged(config.elem,val)) {
      // check if this is the element that invoked the change: 
      if(config.elem.getAttribute(changeInitiatorMarker)) {
        config.elem.removeAttribute(changeInitiatorMarker);
      } else {
        // it wasn't, so we need to trigger a change event:
        setValue(config,val);
        config.elem.setAttribute(eventDispatchMarker,'true');
        util.triggerEvent(config.elem,'change');
      }
    } else {
			if(config.elem.getAttribute(changeInitiatorMarker)) {
				config.elem.removeAttribute(changeInitiatorMarker);
			}
		}
  };

  pub.registerBindType('simplebindvalue',collectionRoutine,bindingRoutine);
  return pub;
})(window,document,simpleBind.util,simpleBind||{});