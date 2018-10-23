(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var todoObj = { 
		newItem: {
			text: '', 
			priority: 'low'
		}, 
		tasks: [ 
			{ 
				id: new Date().getTime(),
				description: 'use rollup to build simplebind.js', 
				completed: true, 
				priority: 'high'
			}, { 
				id: new Date().getTime() + 1,
				description: 'make it easier to create new simplebind bind types', 
				completed: true, 
				priority: 'high'
			}, { 
				id: new Date().getTime() + 2,
				description: 'use some es6 via buble', 
				completed: true, 
				priority: 'high'
			}, { 
				id: new Date().getTime() + 3,
				description: 'make simpleBind smaller with tree shaking', 
				completed: true, 
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
	var taskIsNot = function(key,val) { return function(task) { console.log(((task[key]) + " vs " + val)); return task[key] !== val; }};

	simpleBind.registerEvent('removeItem',function(evt,todoID){
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
		if(numRemoved) { simpleBind.bind('todo',todoObj); }
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

})));
//# sourceMappingURL=todo.js.map
