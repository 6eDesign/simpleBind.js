const FIRST_IN_STRING = 'FIRST_IN_STRING';
const COLON_SEPARATED_SECOND_GROUP = 'COLON_SEPARATED_SECOND_GROUP';
const COLON_SEPARATED_THIRD_GROUP = 'COLON_SEPARATED_THIRD_GROUP';

var getType = function(variable) {
  var type = typeof variable;
  switch(type) {
    case 'object':
      if(variable == null) return 'null';
      return variable instanceof Array ? 'array' : type;
    default:
      return type;
  }
};

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

var copyArrayWithoutReferences = function (arr) {
  var toReturn = [];
  for (var i = 0; i < arr.length; ++i) {
    var type = getType(arr[i]);
    switch (type) {
      case 'object':
        toReturn.push(extend({}, arr[i]));
        break;
      case 'array':
        toReturn.push(copyArrayWithoutReferences(arr[i]));
        break;
      default:
        toReturn.push(arr[i]);
        break;
    }
  }
  return toReturn;
};

var extend = function() {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var src = arguments[i]
      , target = arguments[0];
    for (var key in src) {
      var isArrayPresent = getType(src[key]) === 'array';
      var simpleExtend = getType(target[key]) != 'object' && getType(src[key]) != 'object' && !isArrayPresent;
      if (simpleExtend) {
        target[key] = src[key];
      } else {
        target[key] = extend(typeof target[key] == 'undefined' ? { } : target[key],src[key]);
        if (isArrayPresent) {
          target[key] = copyArrayWithoutReferences(src[key]);
        } else {
          target[key] = extend(typeof target[key] == 'undefined' ? {} : target[key], src[key]);
        }
      }
    }
  }
  return arguments.length ? arguments[0] : { };
};

var getKeys = function(obj) {
  if(Object.keys) {
    return Object.keys(obj);
  } else {
    arr = [];
    for(var key in obj) {
      arr.push(key);
    }
    return arr;
  }
};

var getData = function(elem) {
  var attrs, keys, data = { };
  attrs = getAttrs(elem);
  keys = getKeys(attrs);
  for(var i=0; i < keys.length; ++i) {
    if(keys[i].indexOf('data-') === 0) {
      data[keys[i].substring(5,keys[i].length)] = attrs[keys[i]];
    }
  }
  return data;
};

var getAttrs = function(elem) {
  var attrs, obj = {};
  attrs = elem.attributes;
  for(var i=0; i < attrs.length; ++i) {
    var attr = attrs.item(i);
    obj[attr.nodeName] = (attr.hasOwnProperty('value')) ? attr.value : attr.nodeValue;
  }
  return obj;
};

// A great function for setting object values
// via a string with dot notation:
// ex) set({x:{y:{z:2}}},'y.z',3)

// set = function(obj,str,val) {
//   str = str.split('.');
//   while(str.length > 1) {
//     obj = obj[str.shift()];
//   }
//   obj[str.shift()] = val;
// };

// let's modify this function to be able to
// build an object so we could have SEO friendly
// binds and so that people don't have to rush
// to bind their objects immediately
var set = function(obj,str,val) {
  str = str.split('.');
  var finalProp = str.pop();
  while(str.length) {
    var key = str.shift();
    obj[key] = typeof obj[key] == 'undefined' ? { } : obj[key];
    obj = obj[key];
  }
  obj[finalProp] = val;
};

// Same as above but retrieves the value as a string or as an empty string
// if not set:
var get = function(obj,str) {
  if(str == '$base' || str === '') return obj;
  str = str.split('.');
  for(var i=0; i < str.length; ++i) {
    if(str[i] == '$base') {
      return obj;
    } else if(obj == null) {
      return '';
    } else if(typeof obj[str[i]] == 'undefined') {
      return '';
    } else {
      if(obj === null) {
        return '';
      } else {
        obj = obj[str[i]];
      }
    }
  }
  return obj;
};

let replaceObjNameInBindingStrSingular = (location,oldName,newName) => str => { 
  switch(location) { 
    case FIRST_IN_STRING: 
      str = str.replace(new RegExp(`^${oldName}(\.)?`), `${newName}$1`);
      return str; 
    case COLON_SEPARATED_SECOND_GROUP: 
      str = str.replace(new RegExp(`^([^:]+:)${oldName}(\\.)?`),`$1${newName}$2`);
      return str; 
    case COLON_SEPARATED_THIRD_GROUP: 
      str = str.replace(new RegExp(`^([^:]+:[^:]+:)${oldName}(\\.)?`),`$1${newName}$2`);
      return str; 
  }
};

function replaceObjNameInBindingStr(str,bindTypeOpts,oldName,newName) { 
  return str.split(',')
            .map(replaceObjNameInBindingStrSingular(bindTypeOpts.objNameLocation,oldName,newName))
            .join(','); 
}

var triggerEvent = function(elem,type){
  if('createEvent' in document) {
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent(type,false,true);
    elem.dispatchEvent(evt);
  } else {
    elem.fireEvent('on' + type);
  }
};

var util = /*#__PURE__*/Object.freeze({
  delay: delay,
  extend: extend,
  getKeys: getKeys,
  getData: getData,
  getAttrs: getAttrs,
  set: set,
  get: get,
  replaceObjNameInBindingStr: replaceObjNameInBindingStr,
  triggerEvent: triggerEvent
});

var state = { 
  bindTypes: [ ], 
  bindTypeOpts: { }, 
  boundElems: { }, 
  boundObjects: { }, 
  boundObjectsLast: { }, 
  ready: false,
  beforeReadyBindQueue: [ ], 
  autoReBinding: false, 
  autoReBindingQueue: { }, 
  isBindDueToDevTools: false
};

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({latency: 0});
devTools.subscribe((message,...args) => {
  if (message.type === 'DISPATCH' && message.state) {
    // console.log(args,'DevTools requested to change the state to', message.state);
    let newState = JSON.parse(message.state); 
    for(var key in newState) {
      state.isBindDueToDevTools = true;
      lib.bind(key,newState[key]);
    }
  }
});


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

var domCollection = function(base,autoReBind=false) { 
  if(autoReBind) { 
    state.autoReBinding = true; 
    state.autoReBindingQueue = { }; 
  } 
  base = (typeof base == 'undefined') ? d : base;
  var all = base.getElementsByTagName('*');
  for(var i=0; i < all.length; ++i) {
    var opts = getData(all[i]);
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
    state.boundObjectsLast[objName] = extend({},obj);
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

let defaultBindTypeOpts = { 
  binding: null
}; 

lib.registerBindType = function(selector,opts) { 
  if(typeof state.bindTypeOpts[selector] == 'undefined') { 
    state.bindTypeOpts[selector] = { }; 
    state.bindTypes.push(selector); 
  }
  extend(state.bindTypeOpts[selector],defaultBindTypeOpts,opts);
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

let isARepeatKey = name => name.indexOf('__repeat') == 0;

let removeRepeatsFromState = obj => { 
  let newObj = extend({},state.boundObjects); 
  Object.keys(newObj).filter(isARepeatKey).forEach(k => delete newObj[k]);
  return newObj;
}; 

lib.bind = function(objName,obj) {
  if(typeof objName == 'string' && typeof obj != 'undefined') {
    if(typeof state.boundElems[objName] == 'undefined') state.boundElems[objName] = [];
    if(state.ready) { 
      var eligibleForDevTools = state.isBindDueToDevTools == false; 
      if(state.isBindDueToDevTools) state.isBindDueToDevTools = false;
      processBindings(objName,obj);
      if(!eligibleForDevTools) return;
      if(!isARepeatKey(objName)) {
        devTools.send(`${objName}-bound`, removeRepeatsFromState(state.boundObjects));
      } 
    } else { 
      state.beforeReadyBindQueue.push({name: objName, obj: obj});
    }
  }
}; 

lib.extendNamespace = function(name,method) { 
  lib[name] = method;
};

var collection = function(elem,opts){
  // collection routine, the function that defines the object stored in boundElems
  opts.simplebind = opts.simplebind.split('.');
  var configObj = {
    elem: elem,
    objName: opts.simplebind.shift(),
    objKey: opts.simplebind.join('.'),
    opts: opts
  };
  lib.addToBoundElems('simplebind',configObj.objName,configObj);
};

var binding = function(config,obj,flush){
  // binding routine, the function that determines how binding is done for this bind type
  var val = lib.util.get(obj,config.objKey);
  var oldVal = lib.util.get(state.boundObjectsLast[config.objName],config.objKey);
  if(val !== oldVal || flush) {
    if(typeof config.opts['simplefilter'] != 'undefined') {
      val = lib.getFilteredValue(val,config.opts.simplefilter);
    }
    val = typeof val == 'string' ? val : JSON.stringify(val,null,2);
    if(typeof config.opts['simplebindhtml'] != 'undefined' && config.opts.simplebindhtml=="true") {
      config.elem.innerHTML = val;
    } else {
      if(config.elem.childNodes.length) {
        config.elem.childNodes[0].nodeValue = val;
      } else {
        config.elem.appendChild(document.createTextNode(val));
      }
    }
  }
};

// uses default objNameRegex ('data-simplebind="objName.objKey"')
lib.registerBindType('simplebind',{
  collection, 
  binding,
  objNameLocation: FIRST_IN_STRING
});

state.bindHandlers = { };

var collection$1 = function(elem,opts){
  // collection routine, the function that defines the object stored in boundElems
  var bindHandlers = opts.simplebindhandler.split(',');
  for(var i=0; i < bindHandlers.length; ++i) {
    bindHandlers[i] = bindHandlers[i].split(':');
    var configObj = {
      elem: elem,
      handler: bindHandlers[i].shift()
    };
    bindHandlers[i] = bindHandlers[i].shift().split('.');
    configObj.objName = bindHandlers[i].shift();
    configObj.objKey = bindHandlers[i].join('.');
    lib.addToBoundElems('simplebindhandler',configObj.objName,configObj);
  }
};

var binding$1 = function(config,obj,flush){
  // binding routine, the function that determines how binding is done for this bind type
  if(typeof state.bindHandlers[config.handler] != 'undefined') {
    var val = lib.util.get(obj,config.objKey)
      , oldVal = lib.util.get(state.boundObjectsLast[config.objName],config.objKey);
    var change = typeof val == 'object' ? JSON.stringify(val) != JSON.stringify(oldVal) : val != oldVal;
    if(change || flush) {
      state.bindHandlers[config.handler](config.elem,lib.util.get(obj,config.objKey),config.objName);
    }
  }
};

var registerBindHandler = function(handlerName,func) {
  if(typeof func == 'function') {
    state.bindHandlers[handlerName] = func;
  }
};


lib.registerBindType('simplebindhandler', {
  collection: collection$1,
  binding: binding$1,
  objNameLocation: COLON_SEPARATED_SECOND_GROUP
});
lib.extendNamespace('registerBindHandler', registerBindHandler);

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
  if(this.getAttribute(eventDispatchMarker)) return this.removeAttribute(eventDispatchMarker);
  // we are not, we need to update other items that are bound to same object.property: 
  var binding = this.getAttribute('data-simplebindvalue').split('.')
    , objName = binding.shift();
  // in case this object hasn't been set yet, for whatever reason, set it to a blank object:
  if(typeof state.boundObjects[objName] == 'undefined') state.boundObjects[objName] = {};
  this.setAttribute(changeInitiatorMarker,'true');
  lib.util.set(state.boundObjects[objName],binding.join('.'),getInputValue(this));
  lib.bind(objName,state.boundObjects[objName]);
  if(objName.indexOf('__repeat') > -1) {
    var originalObjName = state.repeatDictionary[objName.split('-').shift()];
    lib.bind(originalObjName,state.boundObjects[originalObjName]);
  }
};

var rateLimitInput = function() {
  var elem = this;
  lib.util.delay(function(){
    handleInput.call(elem);
  },50);
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
    case 'time':
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

var collection$2 = function(elem,opts){
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
  lib.addToBoundElems('simplebindvalue',configObj.objName,configObj);
};

var binding$2 = function(config,obj,flush){
  // binding routine, the function that determines how binding is done for this bind type
  var val = lib.util.get(obj,config.objKey);
  if(checkIfInputValueChanged(config.elem,val)) {
    // check if this is the element that invoked the change: 
    if(config.elem.getAttribute(changeInitiatorMarker)) {
      config.elem.removeAttribute(changeInitiatorMarker);
    } else {
      // it wasn't, so we need to trigger a change event:
      setValue(config,val);
      config.elem.setAttribute(eventDispatchMarker,'true');
      lib.util.triggerEvent(config.elem,'change');
    }
  } else {
    if(config.elem.getAttribute(changeInitiatorMarker)) {
      config.elem.removeAttribute(changeInitiatorMarker);
    }
  }
};

// uses default objNameRegex

lib.registerBindType('simplebindvalue',{
  collection: collection$2,
  binding: binding$2,
  objNameLocation: FIRST_IN_STRING
});

state.repeatCount = 0;
state.repeatDictionary = { };

var getNewBindingName = function(config,count) {
  return '__repeat' + config.repeatIndex + '-' + config.innerObjName + count;
};

/**
 * rewriteBindings() takes a list of elements and rewrites any simplebind binding
 * properties from a specified original object name to a specified new object name
 *
 * @param    {Array}     elems              Nodelist of elements to be processed
 * @param    {String}    originalObjName    Original objName to replace
 * @param    {String}    newObjName         New objName to replace original
 */
var rewriteBindings = function(elems,originalObjName,newObjName) {
  for(var i=0; i < elems.length; ++i) {
    for(var j=0; j < state.bindTypes.length; ++j) {
      var attr = 'data-' + state.bindTypes[j]
        , binding = elems[i].getAttribute(attr);
      if(binding) {
        var newBindingVal = lib.util.replaceObjNameInBindingStr(binding,state.bindTypeOpts[state.bindTypes[j]],originalObjName,newObjName);
        if(newBindingVal != binding) {
          elems[i].setAttribute(attr,newBindingVal);
          elems[i].removeAttribute('data-simplebindcollected');
        } else {
          // If we have made it this far then the element had a binding string on it but it was
          // not a member of the array that was bound.  nonetheless, it needs to be recollected
          // and rebound
          elems[i].removeAttribute('data-simplebindcollected');
        }
      }
    }
  }
};

/**
 * scaleRepeat takes a repeat block and scales the # of repeated elements up or down:
 *
 * @param    {Object}    config    simpleRepeat config object (stored in state.boundElems)
 * @param    {Number}    num       # of desired repeat elements
 */
var scaleRepeat = function(config,num) {
  if(config.repeatedElems.length == num) return;
  var delta;
  if(config.repeatedElems.length < num) {
    // need to add elems
    delta = num - config.repeatedElems.length;
    var frag = document.createDocumentFragment();
    for(var i=0; i < delta; ++i) {
      var newNode = config.repeatTemplate.cloneNode(true)
        , innards = newNode.getElementsByTagName('*')
        , origBind = getNewBindingName(config,0)
        , newBind = getNewBindingName(config,config.repeatedElems.length);
      // rebind the base-level node: 
      rewriteBindings([newNode],origBind,newBind);
      // & then the children: 
      rewriteBindings(innards,origBind,newBind);
      config.repeatedElems.push(newNode);
      frag.appendChild(newNode);
    }
    config.elem.appendChild(frag);
    lib.recollectDOM(config.elem,true);
  } else {
    // need to remove elems
    delta = config.repeatedElems.length - num;
    for(var i=0; i < delta; ++i) {
      var removed = config.repeatedElems.pop();
      var objName  = getNewBindingName(config,config.repeatedElems.length);
      removed.parentNode.removeChild(removed);
      if(typeof state.boundElems[objName] != 'undefined') delete state.boundElems[objName];
      if(typeof state.boundObjects[objName] != 'undefined') delete state.boundObjects[objName];
      if(typeof state.boundObjectsLast[objName] != 'undefined') delete state.boundObjectsLast[objName];
    }
  }
};

var collection$3 = function(elem,opts){
  // collection routine, the function that defines the object stored in boundElems
  opts.simplerepeat = opts.simplerepeat.split(':');
  var objNameAndKey = opts.simplerepeat.pop().split('.');
  var configObj = {
    elem: elem,
    objName: objNameAndKey.shift(),
    objKey: objNameAndKey.join('.'),
    innerObjName: opts.simplerepeat.shift(),
    repeatedElems: [ ],
    repeatIndex: state.repeatCount
  };
  var innerNodes = elem.getElementsByTagName('*');
  rewriteBindings(innerNodes,configObj.innerObjName,getNewBindingName(configObj,0));
  configObj.repeatTemplate = innerNodes[0].parentNode.removeChild(innerNodes[0]);
  state.repeatDictionary['__repeat' + configObj.repeatIndex] = configObj.objName;
  ++state.repeatCount;
  lib.addToBoundElems('simplerepeat',configObj.objName,configObj);
};

var binding$3 = function(config,obj,flush){
  // binding routine, the function that determines how binding is done for this bind type
  var arrToBind = lib.util.get(obj,config.objKey) || [];
  if(typeof arrToBind['length'] != 'undefined') {
    scaleRepeat(config,arrToBind.length);
    for(var i=0; i < arrToBind.length; ++i) {
      lib.bind(getNewBindingName(config,i),arrToBind[i]);
    }
  }
};

lib.registerBindType('simplerepeat', {
  collection: collection$3,
  binding: binding$3,
  objNameLocation: COLON_SEPARATED_SECOND_GROUP
});
lib.extendNamespace('rewriteBindings',rewriteBindings);

/*

  Events take the form: 'eventName:eventHandlerName:optionalObjName.key.key'
    ex: 'click:myClickHandler:someObj.key.key2'
    or
    ex: 'click:myClickHandler'     // omitting the object &
                                      key specifier if not needed

  In above examples, 'myClickHandler' must be registered by calling:
    ex: simpleBind.registerEvent('myClickHandler',function(event,value){});
    or
    ex: simpleBind.registerEvent('myClickHandler',function(event){});
  respectively.

  Multiple events can be specified as comma-separated values within
  the data-simpleevent parameter.
    ex: data-simpleevent="click:someEventHandler,hover:someOtherEventHandler"

  Whenever an event handler is called it will supply 'this' context to the
  element which emitted the event. (this == element)

*/

state.eventHandlers = { };

var addListener = function(elem,eventName,eventHandler,includeObjNameAndKey,objName,objKey) {
  elem.addEventListener(eventName,function(evt){
    if(typeof state.eventHandlers[eventHandler] != 'undefined') {
      if(includeObjNameAndKey) {
        if(typeof state.boundObjects[objName] != 'undefined') {
          state.eventHandlers[eventHandler].call(this,evt, lib.util.get(state.boundObjects[objName],objKey));
          return;
        }
      }
      // still call the event handler even if it obj is undefined
      return state.eventHandlers[eventHandler].call(this,evt,undefined);
    }
  });
};

var collection$4 = function(elem,opts) {
  var events = opts.simpleevent.split(',');
  for(var i=0; i < events.length; ++i) {
    var eventArr = events[i].split(':')
      , eventName = eventArr.shift()
      , eventHandler = eventArr.shift();
    var objNameAndKey = eventArr.length ? eventArr.shift().split('.') : false;
    if(objNameAndKey) {
      var objName = objNameAndKey.shift()
        , objKey = objNameAndKey.join('.');
        addListener(elem,eventName,eventHandler,objNameAndKey,objName,objKey);
    } else {
      addListener(elem,eventName,eventHandler,objNameAndKey);
    }
  }
};

var binding$4 = null;

var registerEvent = function(eventName,func) {
  state.eventHandlers[eventName] = func;
};

lib.registerBindType('simpleevent',{
  collection: collection$4,
  binding: binding$4,
  objNameLocation: COLON_SEPARATED_THIRD_GROUP
});
lib.extendNamespace('registerEvent', registerEvent);

var collection$5 = function(elem,opts){
  // collection routine, the function that defines the object stored in boundElems
  var boundAttrs = opts.simplebindattrs.split(',');
  for(var i=0; i < boundAttrs.length; ++i) {
    boundAttrs[i] =  boundAttrs[i].split(':');
    var configObj = {
      elem: elem,
      attr: boundAttrs[i].shift()
    };
    boundAttrs[i] = boundAttrs[i].shift().split('.');
    configObj.objName = boundAttrs[i].shift();
    configObj.objKey = boundAttrs[i].join('.');
    lib.addToBoundElems('simplebindattrs',configObj.objName,configObj);
  }
};

var binding$5 = function(config,obj,flush){
  // binding routine, the function that determines how binding is done for this bind type
  var val = lib.util.get(obj,config.objKey)
    , oldVal = lib.util.get(state.boundObjectsLast[config.objName],config.objKey);
  if(val != oldVal || flush) {
    config.elem.setAttribute(config.attr,val);
  }
};

lib.registerBindType('simplebindattrs',{
  collection: collection$5,
  binding: binding$5,
  objNameLocation: COLON_SEPARATED_SECOND_GROUP
});

// takes form: data-simpledata="thisProp:objName.objKey,otherProp:objName.objKey"
var collection$6 = function(elem,opts){
  // collection routine, the function that defines the object stored in boundElems
  var dataProps = opts.simpledata.split(',');
  for(var i=0; i < dataProps.length; ++i) {
    var arr = dataProps[i].split(':')
      , prop = arr.shift();
    arr = arr.shift().split('.');
    var configObj = {
      elem: elem,
      objName: arr.shift(),
      objKey: arr.join('.'),
      prop: prop
    };
    lib.addToBoundElems('simpledata',configObj.objName,configObj);
  }
};

var binding$6 = function(config,obj){
  // binding routine, the function that determines how binding is done for this bind type
  var prop = 'data-' + config.prop.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2');
  config.elem.setAttribute(prop, lib.util.get(obj,config.objKey));
};

lib.registerBindType('simpledata',{
  collection: collection$6,
  binding: binding$6,
  objNameLocation: COLON_SEPARATED_SECOND_GROUP
});

state.filters = { };

var getFilteredValue = function(val,filterStr) {
  filterStr = filterStr.split(',');
  for(var i=0; i < filterStr.length; ++i) {
    if(typeof state.filters[filterStr[i]] != 'undefined') {
      val = state.filters[filterStr[i]](val);
    }
  }
  return val;
};

var registerFilter = function(filterName,fn) {
  if(typeof fn == 'function') {
    state.filters[filterName] = fn;
  }
};

lib.extendNamespace('getFilteredValue',getFilteredValue);
lib.extendNamespace('registerFilter',registerFilter);

export default lib;
