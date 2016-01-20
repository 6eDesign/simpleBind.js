simpleBind.registerBindHandler('logValueBH',function(evt,value){
	console.log('bind handler called for', arguments);
}); 
simpleBind.registerEvent('alertHello',function(evt,value){
  alert('Hello World, ' + value);
}); 
simpleBind.registerEvent('exampleClickEvent',function(val){
  console.log(this,val);
}); 
simpleBind.registerEvent('checkboxChecked',function(){
  console.log('checkbox checked');
});
var example = {
  text: 'hello world',
  arrays: { 
    items: [ 
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: '', 
        value: true
      },
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: '', 
        value: false
      },
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: '', 
        value: true
      },
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: '', 
        value: false
      },
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: '', 
        value: true
      },  
      { 
        prop1: Math.round(Math.random()*10), 
        prop2: '', 
        value: false
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

var pro = { }; 
pro.tasksForChosenZip = [ 
  { 
    description: '', 
    childTasks: [ 
      { taskOid: -1, description: 'Choose a Task' }
    ]
  },
  { 
    description: 'I am a parent task', 
    childTasks: [ 
      { taskOid: 2392398, description: 'I am a task, #1' },
      { taskOid: 2392399, description: 'I am a task, #2' },
      { taskOid: 2392400, description: 'I am a task, #3' },
    ] 
  }, { 
    description: 'I am another parent task', 
    childTasks: [ 
      { taskOid: 239823, description: 'I am a task, #4' },
      { taskOid: 239824, description: 'I am a task, #5' },
      { taskOid: 239825, description: 'I am a task, #6' },
    ] 
  }
]; 

document.addEventListener('DOMContentLoaded',function(){
  simpleBind.bind('example',example);
  simpleBind.bind('arrayObject',arrayExample);  
  simpleBind.bind('pro',pro);
}); 


