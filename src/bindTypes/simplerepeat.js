simpleBind = (function(w,d,util,pub){
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
        if(typeof state.boundObjects[objName] != 'undefined') delete state.boundObjects[objName];
        if(typeof state.boundObjectsLast[objName] != 'undefined') delete state.boundObjectsLast[objName];
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

  var bindingRoutine = function(config,obj,flush){
    // binding routine, the function that determines how binding is done for this bind type
    var arrToBind = util.get(obj,config.objKey) || []; 
    if(typeof arrToBind['length'] != 'undefined') { 
      scaleRepeat(config,arrToBind.length); 
      for(var i=0; i < arrToBind.length; ++i) { 
        pub.bind(getNewBindingName(config,i),arrToBind[i]); 
      }
    } 
  }; 

  pub.registerBindType('simplerepeat',collectionRoutine,bindingRoutine); 

  pub.rewriteBindings = function(elems,originalObjName,newObjName) { 
    rewriteBindings(elems,originalObjName,newObjName);
  }; 

  return pub; 
})(window,document,simpleBind.util,simpleBind||{}); 