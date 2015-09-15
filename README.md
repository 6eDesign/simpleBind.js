simpleBind.js
======
A simple, modular, small, and optimized data-binding library.  

### Getting Started
**simpleBind.js** has no external dependencies.  Simply download or clone this repository and include the minified simpleBind.{Version}.min.js file in your document.

```
	<script type='text/javascript' src='simpleBind.2.0.min.js'></script>	
``` 

**simpleBind.js** is a minimal JavaScript data-binding framework. At the basic level it allows you to bind JSON objects to elements in your DOM. A rudimentary example would work like this.  

1. HTML

```
	<h1 data-simplebind="basicExample.text"></h1>
```

2. JavaScript

```
	document.addEventListener("DOMContentLoaded",function(){
		simpleBind.bind('basicExample',{text: 'Welcome to SimpleBind.js'}); 
	}); 
```

3. Result

```
	<h1 data-simplebind="basicExample.text">Welcome to SimpleBind.js</h1>
```

While that is useful, that is just the most basic type of binding available in **simpleBind.js**.  You can also bind arrays and create "simplerepeat's", bind objects to inputs for bidirectional data-binding, map JSON attributes to DOM node attributes or data properties, and much more.  We've also included a simple event system to simplify working with bound-element's events and to more easily access important object values from event callbacks.  

### Binding Types
There are numerous binding types available and you can also extend **simpleBind.js** to support new binding types.  The base binding types are explained below: 

#### simplebind 
####### **(data-simplebind=objName.objKey)**
**simplebind** is the base binding type used by **simpleBind.js**.  The default behavior for this bind type is to create and update text nodes in the DOM.  If you would like to use this method to bind the innerHTML of a node, you can enable by setting data-simplebindhtml="true" on the bound element. 

##### example: 
```
	<!-- The values bound to this element will be assigned as text -->
	<h1 data-simplebind="example.text"></h1>
	<!-- The values bound to this element will be assigned as innerHTML -->
	<h1 data-simplebind="example.html" data-simplebindhtml="true"></h1>
```

####

#### simplebindvalue 
####### **(data-simplebindvalue=objName.objKey)**
**simplebindvalue** is just like the **simplebind** binding type except for it is designed for inputs (text, textarea, select, radio, & checkbox).  The binding with **simplebindvalue** is bi-directional and changes made to these inputs will be reflected automatically and immediately in the bound object and in the DOM if other elements are bound to the changed object key.

##### text input example: 
```
	<!-- Basic Input -->
	<input type="text" data-simplebindvalue="example.nestedObject.someKey" />
```

##### select input example: 
**note:** the binding on a select will only work if the bound value is equal to the value of one of the select's options (otherwise selectedIndex will be set to -1).  In other words: **simpleBind.js** will not create new options for you (but if you want to extend this bind type to do so, then we'll talk more about that later in this README).
```
	<!-- Select -->
	<select data-simplebindvalue="example.someProp">
		<option value="0">Option 0 Selected</option>
		<option value="1">Option 1 Selected</option>
		<option value="2">Option 2 Selected</option>
		<option value="3">Option 3 Selected</option>
	</select>
```
```
	simpleBind.bind('example',{someProp: 2});
```

##### radio input example: 
**note:** like select binding, radio binding will not create new radio options for you.  If the radio's value attribute equals the bound value then it will become selected.  Similarly, if a radio button is selected this will update the bound value to the radio's value.  
```
	<!-- Radio -->
	<label>
		<input type="radio" data-simplebindvalue="example.someProp" value="0" />
		Option 0
	</label>
	<label>
		<input type="radio" data-simplebindvalue="example.someProp" value="1" />
		Option 1
	</label>
```
```
	simpleBind.bind('example',{someProp: 1});
```

##### checkbox input example: 
**note:** checkboxes are for boolean values.  If the bound value is true then the input will be checked, otherwise it will be unchecked.
```
	<!-- Checkbox -->
	<label>
		<input type="checkbox" data-simplebindvalue="example.someBoolean" />
		Some Boolean?
	</label>
```
```
	// this will check the example checkbox: 
	simpleBind.bind('example',{someBoolean: true}); 
```

