import state from '../state';
import simpleBind from '../simpleBind';
import { FIRST_IN_STRING } from './const/objNameLocation';

var collection = function(elem,opts){
  // collection routine, the function that defines the object stored in boundElems
  opts.simplebind = opts.simplebind.split('.');
  var configObj = {
    elem: elem,
    objName: opts.simplebind.shift(),
    objKey: opts.simplebind.join('.'),
    opts: opts
  };
  simpleBind.addToBoundElems('simplebind',configObj.objName,configObj);
};

var binding = function(config,obj,flush){
  // binding routine, the function that determines how binding is done for this bind type
  var val = simpleBind.util.get(obj,config.objKey);
  var oldVal = simpleBind.util.get(state.boundObjectsLast[config.objName],config.objKey);
  if(val !== oldVal || flush) {
    if(typeof config.opts['simplefilter'] != 'undefined') {
      val = simpleBind.getFilteredValue(val,config.opts.simplefilter);
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
simpleBind.registerBindType('simplebind',{
  collection, 
  binding,
  objNameLocation: FIRST_IN_STRING
});