import state from '../state';
import simpleBind from '../simpleBind';

state.filters = { };

var getFilteredValue = function(val,filterStr) {
  filterStr = filterStr.split(',');
  for(var i=0; i < filterStr.length; ++i) {
    if(typeof state.filters[filterStr[i]] != 'undefined') {
      val = state.filters[filterStr[i]](val)
    }
  }
  return val;
};

var registerFilter = function(filterName,fn) {
  if(typeof fn == 'function') {
    state.filters[filterName] = fn;
  }
};

simpleBind.extendNamespace('getFilteredValue',getFilteredValue);
simpleBind.extendNamespace('registerFilter',registerFilter);
