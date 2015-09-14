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

3. ???

4. Profit.