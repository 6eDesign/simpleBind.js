simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState();
  state.eventHandlers = { }; 

  var collectionRoutine = function(elem,opts) { 
    var events = opts.simpleevent.split(','); 
    for(var i=0; i < events.length; ++i) { 
      var eventArr = events[i].split(':') 
        , eventName = eventArr.shift()
        , eventHandler = eventArr.shift(); 

      elem.addEventListener(eventName,function(){
        if(typeof state.eventHandlers[eventHandler] != 'undefined') { 
          if(eventArr.length) { 
            var objNameAndKey = eventArr.shift().split('.') 
              , objName = objNameAndKey.shift() 
              , objKey = objNameAndKey.join('.'); 
            if(typeof state.boundObjects[objName] != 'undefined') { 
              state.eventHandlers[eventHandler].call(this,util.get(state.boundObjects[objName],objKey));
              return;
            }
          }  
          state.eventHandlers[eventHandler].call(this,undefined)
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