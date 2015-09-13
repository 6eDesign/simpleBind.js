simpleBind = (function(w,d,$,util,pub){
  var state = pub.getState(); 
  state.repeatCount = 0; 

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
      var eligibleAttrs = [].concat(state.bindTypes)
      for(var j=0; j < state.bindTypes.length; ++j) { 
        var attr = 'data-' + state.bindTypes[j]
          , binding = elems[i].getAttribute(attr); 
        if(binding) { 
          elems[i].removeAttribute('data-simplebindcollected');
          elems[i].setAttribute(attr,binding.replace(originalObjName,newObjName)); 
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
    if(config.repeatedElems.length < num) { 
      // need to add elems
      var delta = num - config.repeatedElems.length
        , frag = d.createDocumentFragment(); 
      for(var i=0; i < delta; ++i) {
        var newNode = config.repeatTemplate.cloneNode(true)
          , innards = newNode.getElementsByTagName('*'); 
        rewriteBindings(innards,getNewBindingName(config,0),getNewBindingName(config,config.repeatedElems.length)); 
        config.repeatedElems.push(newNode);
        frag.appendChild(newNode);
      }
      config.elem.appendChild(frag); 
      pub.recollectDOM(config.elem);
    } else { 
      // need to remove elems
      var delta = config.repeatedElems.length - num; 
      for(var i=0; i < delta; ++i) { 
        var removed = config.repeatedElems.pop(); 
        var objName  = getNewBindingName(config,config.repeatedElems.length);
        removed.parentNode.removeChild(removed);
        if(typeof state.boundElems[objName] != 'undefined') delete state.boundElems[objName]; 
      }
    }
  }; 

  pub.registerBindType('simplerepeat',function(elem,opts){
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
    ++state.repeatCount;
    pub.addToBoundElems('simplerepeat',configObj.objName,configObj); 
  },function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    var arrToBind = util.get(obj,config.objKey) || []; 
    if(typeof arrToBind['length'] != 'undefined') { 
      scaleRepeat(config,arrToBind.length); 
      for(var i=0; i < arrToBind.length; ++i) { 
        pub.bind(getNewBindingName(config,i),arrToBind[i]); 
      }
    } 
  }); 
  return pub; subl
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 