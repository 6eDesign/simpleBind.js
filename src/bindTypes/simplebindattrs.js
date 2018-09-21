import state from '../state';
import simpleBind from '../simpleBind';

var collectionRoutine = function(elem,opts){
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
    simpleBind.addToBoundElems('simplebindattrs',configObj.objName,configObj);
  }
};

var bindingRoutine = function(config,obj,flush){
  // binding routine, the function that determines how binding is done for this bind type
  var val = simpleBind.util.get(obj,config.objKey)
    , oldVal = simpleBind.util.get(state.boundObjectsLast[config.objName],config.objKey);
  if(val != oldVal || flush) {
    config.elem.setAttribute(config.attr,val);
  }
};

simpleBind.registerBindType('simplebindattrs',collectionRoutine,bindingRoutine);