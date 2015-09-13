simpleBind = (function(w,d,$,util,pub){
  pub.registerBindType('simplebind',function(elem,opts){
    // collection routine, the function that defines the object stored in boundElems
    opts.simplebind = opts.simplebind.split('.'); 
    var configObj = { 
      elem: elem,
      objName: opts.simplebind.shift(), 
      objKey: opts.simplebind.join('.')
    }; 
    pub.addToBoundElems('simplebind',configObj.objName,configObj); 
  },function(config,obj){
    // binding routine, the function that determines how binding is done for this bind type
    var val = util.get(obj,config.objKey); 
    config.elem.innerHTML = typeof val == 'string' ? val : JSON.stringify(val,null,2);
  }); 
  return pub; 
})(window,document,jQuery,simpleBindUtil,simpleBind||{}); 