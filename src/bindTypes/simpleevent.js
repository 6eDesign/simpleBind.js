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

simpleBind = (function(w,d,util,pub){
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
})(window,document,simpleBind.util,simpleBind||{});