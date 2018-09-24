var todoObj = { 
	newItem: {
		text: '', 
		priority: 'low'
	}, 
	tasks: [ 
		{ 
			id: new Date().getTime(),
			description: 'make simpleBind more awesome', 
			completed: false, 
			priority: 'high'
		}, { 
			id: new Date().getTime() + 1,
			description: 'make simpleBind more modular', 
			completed: true, 
			priority: 'high'
		}, { 
			id: new Date().getTime() + 2,
			description: 'make simpleBind faster', 
			completed: false, 
			priority: 'high'
		}, { 
			id: new Date().getTime() + 3,
			description: 'make simpleBind smaller', 
			completed: false, 
			priority: 'high'
		}
	]
}; 

simpleBind.registerEvent('addNewItem',function(evt,newItem){
	if(newItem.text) { 
		todoObj.tasks.push({
			id: new Date().getTime(),
			completed: false,
			priority: newItem.priority,
			description: newItem.text
		}); 
		todoObj.newItem.text = '';
		simpleBind.bind('todo',todoObj);
	}
	evt.preventDefault();
}); 

var taskIs = function(key,val) { return function(task) { return task[key] === val; }};
var taskIsNot = function(key,val) { return function(task) { console.log(`${task[key]} vs ${val}`); return task[key] !== val; }};

simpleBind.registerEvent('removeItem',function(evt,todoID){
	console.log(todoObj,todoID);
	todoObj.tasks = todoObj.tasks.filter(taskIsNot('id',todoID));
	simpleBind.bind('todo',todoObj);
});

simpleBind.registerEvent('removeCompleted',function(evt){
	var numRemoved = 0; 
	for(var len = todoObj.tasks.length, i=0; i < len; ++i) { 
		if(todoObj.tasks[i-numRemoved].completed) { 
			todoObj.tasks.splice(i-numRemoved,1);
			++numRemoved;
		}
	}
	if(numRemoved) simpleBind.bind('todo',todoObj);
}); 

simpleBind.registerBindHandler('taskCompletedHandler',function(elem,completed){
	elem.className = completed ? 'complete' : ''; 
}); 

var todo = (function(w,d,pub){
	var init = function(){ 
		simpleBind.bind('todo',todoObj); 
	};
	d.addEventListener('DOMContentLoaded',init); 
	return pub; 
})(window,document,{}); 