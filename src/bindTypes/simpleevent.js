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

  pub.registerBindType('simpleevent',collectionRoutine,null); 

  pub.registerEvent = function(eventName,func) { 
    state.eventHandlers[eventName] = func; 
  }; 

  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 