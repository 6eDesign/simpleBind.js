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

simpleBind.registerEvent('removeItem',function(evt,todoID){
	for(var i=0; i < todoObj.tasks.length; ++i) { 
		if(todoObj.tasks[i].id == todoID) { 
			todoObj.tasks.splice(i,1); 
			break; 
		}
	}
	simpleBind.bind('todo',todoObj);
});

var todo = (function(w,d,$,pub){
	var init = function(){ 
		simpleBind.bind('todo',todoObj); 
	};
	$(d).ready(init); 
	return pub; 
})(window,document,jQuery,{}); 