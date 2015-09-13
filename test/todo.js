var todoObj = { 
	newItem: '', 
	tasks: [ ]
}; 
simpleBind.registerEvent('addNewItem',function(evt,taskDescription){
	if(taskDescription) { 
		todoObj.tasks.push({
			completed: false,
			description: taskDescription
		}); 
		todoObj.newItem = '';
		simpleBind.bind('todo',todoObj);
	}
	evt.preventDefault();
})
var todo = (function(w,d,$,pub){
	var init = function(){ 
		simpleBind.bind('todo',todoObj); 
	};
	$(d).ready(init); 
	return pub; 
})(window,document,jQuery,{}); 