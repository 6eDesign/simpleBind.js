simpleBind = (function(w,d,pub){
  state = pub.getState(); 
  state.filters = { };
  pub.getFilteredValue = function(val,filterStr) { 
    filterStr = filterStr.split(','); 
    for(var i=0; i < filterStr.length; ++i) { 
      if(typeof state.filters[filterStr[i]] != 'undefined') { 
        val = state.filters[filterStr[i]](val)
      }
    }
    return val; 
  }; 
  pub.registerFilter = function(filterName,fn) { 
    if(typeof fn == 'function') { 
      state.filters[filterName] = fn; 
    }
  };   
  return pub; 
})(window,document,simpleBind||{}); 