var simpleBindUtil = (function(pub){
  pub.getKeys = function(obj) {
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

  pub.getData = function(elem) {
    var attrs, keys, data = { };
    attrs = pub.getAttrs(elem);
    keys = pub.getKeys(attrs);
    for(var i=0; i < keys.length; ++i) {
      if(keys[i].indexOf('data-') === 0) {
        data[keys[i].substring(5,keys[i].length)] = attrs[keys[i]];
      }
    }
    return data;
  };

  pub.getAttrs = function(elem) {
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
  pub.set = function(obj,str,val) {
    str = str.split('.');
    while(str.length > 1) {
      obj = obj[str.shift()];
    }
    return obj[str.shift()] = val;
  };

  // Same as above but retrieves the value
  // instead of setting it:
  pub.get = function(obj,str) {
    if(str == '$base' || str === '') return obj;
    str = str.split('.');
    for(var i=0; i < str.length; ++i) {
      if(typeof obj[str[i]] == 'undefined') {
        return '';
      } else {
        if(str[i] == '$base') return obj;
        obj = obj[str[i]];
      }
    }
    return obj;
  };

  var standardObjNameRegex = new RegExp(/^[^\.]*/); 
  var replaceObjNameInStandardFormat = function(str,oldObj,newObj) { 
    if(str == oldObj) { 
      str = newObj; 
    } else if(str.indexOf(oldObj + '.') == 0) {
      // console.log('yip',str,oldObj,newObj);
      str = str.replace(standardObjNameRegex,newObj)
    }; 
    return str; 
  }; 

  pub.replaceObjNameInBindingStr = function(str,bindType,oldObj,newObj) { 
    // console.log(str);
    var origStr = str + '';
    if(str.indexOf(':') > -1) { 
      // we have either a bindhandler, simpledata, simpleevent, or simplerepeat
      console.log('got here',bindType,str);
      switch(bindType) { 
        case 'simplebindhandler': 
        case 'simpledata': 
          str = str.split(','); 
          for(var i=0; i < str.length; ++i) { 
            console.log('ye');
            str[i] = str[i].split(':'); 
            if(str[i].length > 1) {
              console.log(str[i][1]);
              str[i][1] = replaceObjNameInStandardFormat(str[i][1],oldObj,newObj)
            }; 
            str[i] = str[i].join(':');
          }
          str = str.join(','); 
          break; 
        case 'simplerepeat': 
          str = str.split(':'); 
          str[1] = replaceObjNameInStandardFormat(str[1],oldObj,newObj); 
          str = str.join(':'); 
          break; 
        case 'simpeevent': 
          str = str.split(':'); 
          if(str.length >= 3) { 
            str[2] = replaceObjNameInStandardFormat(str[2],oldObj,newObj); 
          }
          str = str.join(':');
          break; 
      }
    } else { 
      // we have a simplebind or simplebindvalue
      str = replaceObjNameInStandardFormat(str,oldObj,newObj); 
    }
    // console.log('replacing "' + oldObj+'" with "' + newObj + '" in "' + origStr + '".','returning:',str); 
    return str; 
  }; 

  return pub; 
})({}); 
var simpleBind = (function(w,d,$,util,pub){
  var state = { 
    bindTypes: [ ], 
    bindTypeOpts: { }, 
    boundElems: { }, 
    boundObjects: { }, 
    boundObjectsLast: { }, 
    ready: false,
    beforeReadyBindQueue: [ ], 
    autoReBinding: false, 
    autoReBindingQueue: { }
  }; 

  var init = function() { 
    domCollection();
    state.ready = true; 
    if(state.beforeReadyBindQueue.length) { 
      for(var i=0; i < state.beforeReadyBindQueue.length; ++i) { 
        pub.bind(state.beforeReadyBindQueue[i].name,state.beforeReadyBindQueue[i].obj);
      }
    }
  }; 

  var domCollection = function(base,autoReBind) { 
    autoReBind = (typeof autoReBind == 'undefined') ? false : autoReBind; 
    if(autoReBind) { 
      state.autoReBinding = true; 
      state.autoReBindingQueue = { }; 
    } 
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
    processBoundElems(state.boundElems[objName],obj); 
    
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
    configObj.bindType = bindType; 
    if(typeof state.boundElems[objName] == 'undefined') state.boundElems[objName] = []; 
    if(state.autoReBinding) { 
      if(typeof state.autoReBindingQueue[objName] == 'undefined') state.autoReBindingQueue[objName] = []; 
      state.autoReBindingQueue[objName].push(configObj);      
    }
    state.boundElems[objName].push(configObj); 
  }; 

  pub.recollectDOM = function(context,autoReBind) { 
    domCollection(context,autoReBind);
  }; 

  pub.bind = function(objName,obj) { 
    if(typeof objName == 'string' && typeof obj == 'object') {
      if(typeof state.boundElems[objName] == 'undefined') state.boundElems[objName] = [];
      if(state.ready) { 
        processBindings(objName,obj);
      } else { 
        state.beforeReadyBindQueue.push({name: objName, obj: obj});
      }
    }
  }; 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 
simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState();

  var collectionRoutine = function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    opts.simplebind = opts.simplebind.split('.'); 
    var configObj = { 
      elem: elem,
      objName: opts.simplebind.shift(), 
      objKey: opts.simplebind.join('.'), 
      opts: opts
    }; 
    pub.addToBoundElems('simplebind',configObj.objName,configObj); 
  };

  var bindingRoutine = function(config,obj,flush){
    if(flush) console.log('flush',flush);
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey); 
    var oldVal = util.get(state.boundObjectsLast[config.objName],config.objKey); 
    if(val !== oldVal || flush) { 
      if(typeof config.opts['simplefilter'] != 'undefined') { 
        val = pub.getFilteredValue(val,config.opts.simplefilter);
      }
      val = typeof val == 'string' ? val : JSON.stringify(val,null,2);
      if(typeof config.opts['simplebindhtml'] != 'undefined' && config.opts.simplebindhtml=="true") { 
        config.elem.innerHTML = val;
      } else { 
        if(config.elem.childNodes.length) { 
          config.elem.childNodes[0].nodeValue = val; 
        } else { 
          config.elem.appendChild(d.createTextNode(val)); 
        }
      }
    }
  };

  // var objNameReplaceRe = new RegExp(/^[^\.]*/);
  // // ex: replaceObjName('someObjName.key1.key2','someObjName','newObjName') => 'newObjName.key1.key2'
  // var replaceObjName = function(binding,oldObjName,newObjName) { 
  //   if(binding.indexOf(oldObjName+'.') === 0) { 
  //     binding = binding.replace(objNameReplaceRe,newObjName); 
  //   }
  //   return binding;
  // }; 

  // pub.registerBindType('simplebind',collectionRoutine,bindingRoutine,replaceObjName); 
  pub.registerBindType('simplebind',collectionRoutine,bindingRoutine); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 
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
      };
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
  // var replaceObjName = function(binding,oldObjName,newObjName) { 
  //   return binding.replace(new RegExp(':'+oldObjName+'\\.','g'),':'+newObjName+'.'); 
  // }; 

  pub.registerBindType('simplebindhandler',collectionRoutine,bindingRoutine); 

  pub.registerBindHandler = function(handlerName,func) { 
    if(typeof func == 'function') { 
      state.bindHandlers[handlerName] = func;
    }
  }; 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 
simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState(); 
  var changeInitiatorMarker = 'data-simplebindvaluechanger';
  /**
   * handleInput() is an event callback to handle changes to simplebindvalue-bound inputs
   */
  var handleInput = function() { 
    var binding = this.getAttribute('data-simplebindvalue').split('.')
      , objName = binding.shift(); 
    util.set(state.boundObjects[objName],binding.join('.'),getInputValueByType(this));     
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

  var getInputValueByType = function(elem) { 
    var type = getInputType(elem); 
    switch(type) { 
      case 'checkbox': 
        return elem.checked;
      case 'type': 
      default: 
        return elem.value; 
    } 
  }; 

  var attachAppropriateEventHandlers = function(elem,inputType) { 
    switch(inputType) { 
      case 'text': 
        $(elem).on('keyup',handleInput);
        break; 
      default: 
        $(elem).on('change',handleInput);
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

  var bindingRoutine = function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey);
    // if(val != config.elem.value) { 
    //   config.elem.value = val;
    // }
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
        if(val != config.elem.value) { 
          config.elem.value = val; 
        }
        break; 
    }
  };

  // var objNameReplaceRe = new RegExp(/^[^\.]*/);
  // // ex: replaceObjName('someObjName.key1.key2','someObjName','newObjName') => 'newObjName.key1.key2'
  // var replaceObjName = function(binding,oldObjName,newObjName) { 
  //   if(binding.indexOf(oldObjName+'.') === 0) { 
  //     binding = binding.replace(objNameReplaceRe,newObjName); 
  //   }
  //   return binding;
  // }; 

  // pub.registerBindType('simplebindvalue',collectionRoutine,bindingRoutine,replaceObjName); 
  pub.registerBindType('simplebindvalue',collectionRoutine,bindingRoutine); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{});
simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState(); 
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
          // var newBindingVal = state.bindTypeOpts[state.bindTypes[j]].objNameReplaceFn(binding,originalObjName,newObjName);
          // var newBindingVal = state.bindTypeOpts[state.bindTypes[j]].objNameReplaceFn(binding,originalObjName,newObjName);
          var newBindingVal = util.replaceObjNameInBindingStr(binding,state.bindTypes[j],originalObjName,newObjName);
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
      var frag = d.createDocumentFragment(); 
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
      pub.recollectDOM(config.elem,true);
    } else { 
      // need to remove elems
      delta = config.repeatedElems.length - num; 
      for(var i=0; i < delta; ++i) { 
        var removed = config.repeatedElems.pop(); 
        var objName  = getNewBindingName(config,config.repeatedElems.length);
        removed.parentNode.removeChild(removed);
        if(typeof state.boundElems[objName] != 'undefined') delete state.boundElems[objName]; 
      }
    }
  }; 

  var collectionRoutine = function(elem,opts){
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
    pub.addToBoundElems('simplerepeat',configObj.objName,configObj); 
  };

  var bindingRoutine = function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    var arrToBind = util.get(obj,config.objKey) || []; 
    if(typeof arrToBind['length'] != 'undefined') { 
      scaleRepeat(config,arrToBind.length); 
      for(var i=0; i < arrToBind.length; ++i) { 
        pub.bind(getNewBindingName(config,i),arrToBind[i]); 
      }
    } 
  }; 

  // var replaceObjName = function(binding,oldObjName,newObjName) { 
  //   return binding.replace(new RegExp(':'+oldObjName),':'+newObjName); 
  // }; 

  pub.registerBindType('simplerepeat',collectionRoutine,bindingRoutine); 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 
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

simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState();
  state.eventHandlers = { }; 


  var collectionRoutine = function(elem,opts) { 
    var events = opts.simpleevent.split(','); 
    for(var i=0; i < events.length; ++i) { 
      var eventArr = events[i].split(':') 
        , eventName = eventArr.shift()
        , eventHandler = eventArr.shift(); 
      var objNameAndKey = eventArr.length ? eventArr.shift().split('.') : false; 
      if(objNameAndKey) { 
        var objName = objNameAndKey.shift()
          , objKey = objNameAndKey.join('.'); 
      }

      elem.addEventListener(eventName,function(evt){
        if(typeof state.eventHandlers[eventHandler] != 'undefined') { 
          if(objNameAndKey) { 
            if(typeof state.boundObjects[objName] != 'undefined') { 
              state.eventHandlers[eventHandler].call(this,evt,util.get(state.boundObjects[objName],objKey));
              return;
            }
          }  
          return state.eventHandlers[eventHandler].call(this,evt,undefined)
        }
      }); 
    }
  }; 

  // ex: 
  //   handler = 'click:clickHandler:someObj.key.key,hover:hoverHandler,submit:submitHandler:someObj2.key,doubleclick:clickHandler:someObj.key'
  //   replaceObjName(handler,'someObj','newObj')
  // tougher ex: 
  //   handler = 'click:clickHandler:someObj.key.key,hover:hoverHandler,submit:submitHandler:someObj2.key,doubleclick:clickHandler:someObj.key'
  //   replaceObjName(handler,'someObj','newObj')
  var replaceObjName = function(binding,oldObjName,newObjName) { 
    binding = binding.split(','); 
    for(var i=0; i < binding.length; ++i) { 
      binding[i] = binding[i].split(':'); 
      if(binding[i].length > 2) { 
        // if this evaluates truthy then a simple .replace(old,new) will work here: 
        if(binding[i][2].indexOf(oldObjName+'.') == 0) binding[i][2] = binding[i][2].replace(oldObjName,newObjName); 
      }
      binding[i] = binding[i].join(':');
    }
    return binding.join(','); 
  }; 

  pub.registerBindType('simpleevent',collectionRoutine,null,replaceObjName); 

  pub.registerEvent = function(eventName,func) { 
    state.eventHandlers[eventName] = func; 
  }; 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 
simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState();

  // takes form: data-simpledata="thisProp:objName.objKey,otherProp:objName.objKey"
  var collectionRoutine = function(elem,opts){
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
      }
      pub.addToBoundElems('simpledata',configObj.objName,configObj);
    }
  };

  var bindingRoutine = function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    var prop = 'data-' + config.prop.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2');
    config.elem.setAttribute(prop, util.get(obj,config.objKey));
  };

  // ex: replaceObjName('thisProp:objName.objKey,otherProp:objName2.objKey','objName2','newObj')
  // var replaceObjName = function(binding,oldObjName,newObjName) { 
  //   return binding.replace(new RegExp(':'+oldObjName+'\\.','g'),':'+newObjName+'.'); 
  // }; 

  // pub.registerBindType('simpledata',collectionRoutine,bindingRoutine,replaceObjName); 
  pub.registerBindType('simpledata',collectionRoutine,bindingRoutine); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 
simpleBind = (function(w,d,$,pub){
  state = pub.getState(); 
  state.filters = { };
  pub.getFilteredValue = function(val,filterStr) { 
    filterStr = filterStr.split(','); 
    for(var i=0; i < filterStr.length; ++i) { 
      if(typeof state.filters[filterStr[i]] != 'undefined') { 
        val = state.filters[filterStr[i]](val)
      }
    }
    return val; 
  }; 
  pub.registerFilter = function(filterName,fn) { 
    if(typeof fn == 'function') { 
      state.filters[filterName] = fn; 
    }
  };   
  return pub; 
})(window,document,jQuery,simpleBind||{}); 