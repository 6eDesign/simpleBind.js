$(document).ready(function(){
	simpleBind.bind('example',{text: 'hello world'}); 
}); 
// var test = (function(w,d,$,pub){
// 	var exampleArr = [ ]; 
// 	var boundRepresentation = [ ]; 
// 	var init = function() { 	
// 		simpleBind.bind('items',exampleArr); 
// 		iterate(1); 
// 		simpleBind.bind('items',exampleArr); 
// 	}; 
// 	var iterate = function(count) { 
// 		var num = Math.round(Math.random()*10); 
// 		exampleArr.splice(0,0,{prop1: num}); 
// 		boundRepresentation.splice(0,0,num); 
// 		simpleBind.bind('items',count%2?exampleArr:[]); 
// 		if(++count < 5) iterate(count);
// 	}; 
// 	$(d).ready(init); 
// 	return pub; 
// })(window,document,jQuery,{}); 