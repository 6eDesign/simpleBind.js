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

  var bindingRoutine = function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey); 
    var oldVal = util.get(state.boundObjectsLast[config.objName],config.objKey); 
    if(val != oldVal) { 
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

  var objNameReplaceRe = new RegExp(/^[^\.]*/);
  // ex: replaceObjName('someObjName.key1.key2','someObjName','newObjName') => 'newObjName.key1.key2'
  var replaceObjName = function(binding,oldObjName,newObjName) { 
    if(binding.indexOf(oldObjName+'.') == 0) { 
      binding = binding.replace(objNameReplaceRe,newObjName); 
    }
    return binding;
  }; 

  pub.registerBindType('simplebind',collectionRoutine,bindingRoutine,replaceObjName); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 