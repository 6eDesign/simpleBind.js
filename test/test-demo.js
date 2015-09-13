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

$(document).ready(function(){
  for(var i=0; i < 100; ++i) { 
    example.arrays.items.push($.extend({},example.arrays.items[0]));
  }
  simpleBind.bind('example',example);
}); 