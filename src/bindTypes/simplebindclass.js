import simpleBind from '../simpleBind';
import { COLON_SEPARATED_SECOND_GROUP } from './const/objNameLocation';
let { addToBoundElems, registerBindType } = simpleBind;
let state = simpleBind.getState();

/**
 * Takes form: data-simplebindclass='a-class-name:objName.someBool,class-name2:objName.someBool2'
 * (when boolean is true, class name will be applied, otherwise removed)
 */

let conf = { 
  collection(elem,opts) { 
    opts.simplebindclass.split(',').forEach((str) => {
      let classNames = str.match(/^([^:]+):/);
      let objName = str.match(/:([^\.]+)\./);
      let objKey = str.match(/:[^\.]+\.(.*)$/);
      if(!classNames || !objName || !objKey) return;
      let configObj = { 
        elem: elem,
        classNames: classNames[1].split(/\s+/), 
        objName: objName[1],
        objKey: objKey[1]
      };
      addToBoundElems('simplebindclass',configObj.objName,configObj);
    });
  },
  binding(config,obj,flush) { 
    let val = simpleBind.util.get(obj,config.objKey)
      , oldVal = simpleBind.util.get(state.boundObjectsLast[config.objName],config.objKey);
    if(val != oldVal || flush) {
      config.elem.classList[val == true ? 'add' : 'remove'](...config.classNames);
    }
  },
  objNameLocation: COLON_SEPARATED_SECOND_GROUP
};

registerBindType('simplebindclass',conf);