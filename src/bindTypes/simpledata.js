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
  
  pub.registerBindType('simpledata',collectionRoutine,bindingRoutine); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 