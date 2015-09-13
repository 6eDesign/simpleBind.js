simpleBind.registerBindHandler('logValueBH',function(elem,value){
	// console.log(elem,value);
}); 
var example = {
  text: 'hello world',
  arrays: { 
    items: [ 
      { prop1: Math.round(Math.random()*10) },
      { prop1: Math.round(Math.random()*10) },
      { prop1: Math.round(Math.random()*10) },
      { prop1: Math.round(Math.random()*10) },
      { prop1: Math.round(Math.random()*10) },  
      { prop1: Math.round(Math.random()*10) }
    ]
  }
}; 

$(document).ready(function(){
  for(var i=0; i < 1000; ++i) { 
    example.arrays.items.push(example.arrays.items[0]);
  }
  simpleBind.bind('example',example);
}); 