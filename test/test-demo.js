simpleBind.registerBindHandler('logValueBH',function(evt,value){
	console.log('bind handler called for', arguments);
}); 
simpleBind.registerEvent('alertHello',function(evt,value){
  alert('Hello World, ' + value);
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
    value: 'count 0'
  }, { 
    count: 1, 
    value: 'count 1'
  }, { 
    count: 2, 
    value: 'count 2'
  }, { 
    count: 3, 
    value: 'count 3'
  }
]; 

document.addEventListener('DOMContentLoaded',function(){
  simpleBind.bind('example',example);
  simpleBind.bind('arrayObject',arrayExample);  
}); 