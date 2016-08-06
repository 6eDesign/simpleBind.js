simpleBind = (function(w,d,util,pub){
  var state = pub.getState();
  console.log('i\'m on your page');
  var collectionRoutine = function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    opts.simpleeditable = opts.simpleeditable.split('.');
    var configObj = {
      elem: elem,
      objName: opts.simpleeditable.shift(),
      objKey: opts.simpleeditable.join('.'),
      opts: opts
    };
    pub.addToBoundElems('simpleeditable',configObj.objName,configObj);
  };

  var bindingRoutine = function(config,obj,flush){
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey);
    var currVal = config.elem.innerHTML;
    // console.log(val,'vs',currVal); 
    if(val != currVal) config.elem.innerHTML = val;
  };
  pub.registerBindType('simpleeditable',collectionRoutine,bindingRoutine);
  return pub;
})(window,document,simpleBind.util,simpleBind||{});