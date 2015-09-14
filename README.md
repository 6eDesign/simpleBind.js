simpleBind.js
======
A simple, modular, small, optimized, and seo-friendly binding library.  

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

### Binding Types
There are numerous binding types available and you can also extend **simpleBind.js** to support new binding types.  The base binding types are explained below: 

#### simplebind (data-simplebind=objName.objKey)
**simplebind** is the base binding type used by **simpleBind.js**.  The default behavior for this bind type is to create and update text nodes in the DOM.  If you would like to use this method to bind the innerHTML of a node, you can enable by setting data-simplebindhtml="true" on the bound element. 

##### example: 
```
	<!-- The values bound to this element will be assigned as text -->
	<h1 data-simplebind="example.text"></h1>
	<!-- The values bound to this element will be assigned as innerHTML -->
	<h1 data-simplebind="example.html" data-simplebindhtml="true"></h1>
```

### simplebindvalue (data-simplebindvalue=objName.objKey)
**simplebindvalue** is just like the **simplebind** binding type except for it is designed for inputs (text, textarea, select, radio, & checkbox).  The binding with **simplebindvalue** is bi-directional and changes made to these inputs will be reflected automatically and immediately in the bound object and in the DOM if other elements are bound to the changed object key.  

