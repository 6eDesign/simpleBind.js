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