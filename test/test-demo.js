simpleBind.registerBindHandler('logValueBH',function(elem,value){
	console.log('bind handler called for', arguments);
}); 
simpleBind.registerEvent('exampleClickEvent',function(val){
  console.log(this,val);
}); 
var example = {
  text: 'hello world',
  arrays: { 
    items: [ 
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: ''
      },
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: ''
      },
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: ''
      },
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: ''
      },
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: ''
      },  
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: ''
      }
    ]
  }
}; 

var arrayExample = [ 
  { 
    count: 0, 
    value: 'count 0 value'
  }, { 
    count: 1, 
    value: 'count 1 value'
  }, { 
    count: 2, 
    value: 'count 2 value'
  }, { 
    count: 3, 
    value: 'count 3 value'
  }
]; 

$(document).ready(function(){
  for(var i=0; i < 100; ++i) { 
    example.arrays.items.push($.extend({},example.arrays.items[0]));
  }
  simpleBind.bind('example',example);
  simpleBind.bind('arrayObject',arrayExample);
}); 