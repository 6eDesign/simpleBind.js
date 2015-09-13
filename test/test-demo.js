simpleBind.registerBindHandler('logValueBH',function(elem,value){
	// console.log(elem,value);
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
  simpleBind.bind('example',example);
}); 