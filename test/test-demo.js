var test = (function(w,d,$,pub){
	var exampleArr = [ ]; 
	var boundRepresentation = [ ]; 
	var init = function() { 	
		simpleBind.bind('items',exampleArr); 
		iterate(0); 
	}; 
	var iterate = function(count) { 
		console.log('iterating');
		var num = Math.round(Math.random()*10); 
		exampleArr.splice(0,0,{prop1: num}); 
		boundRepresentation.splice(0,0,num); 
		simpleBind.bind('items',count%2?exampleArr:[]); 
		console.log('should show', boundRepresentation); 
		if(++count < 11) w.setTimeout(iterate,1500,count);
	}; 
	$(d).ready(init); 
	return pub; 
})(window,document,jQuery,test || {}); 
console.log('stuff');