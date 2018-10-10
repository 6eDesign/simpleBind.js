simpleBind.js
======
A simple, modular, small, and optimized data-binding library.  

### Getting Started
**simpleBind.js** has no external dependencies.  Simply download or clone this repository and include the minified simpleBind.umd.js file in your document.

```
<script type='text/javascript' src='/simpleBind.umd.js'></script>	
``` 

You can also install simpleBind with NPM and use as either a Common JS (CJS) or ES Module: 

```
npm i --save simplebind.js
```

Common JS: 

```
var simpleBind = require('simplebind.js');
```

ES Module: 

```
import simpleBind from 'simplebind.js';
```

**simpleBind.js** is a minimal JavaScript data-binding framework. At the basic level it allows you to bind JSON objects to elements in your DOM. A rudimentary example would work like this:  

1. HTML

```
<h1 data-simplebind="basicExample.text"></h1>
```

2. JavaScript

```
simpleBind.bind('basicExample',{text: 'Welcome to SimpleBind.js'}); 
```

3. Result

```
<h1 data-simplebind="basicExample.text">Welcome to SimpleBind.js</h1>
```

While that is useful, that is just the most basic type of binding available in **simpleBind.js**.  You can also bind arrays and create "simplerepeat's", bind objects to inputs for bidirectional data-binding, map JSON attributes to DOM node attributes or data properties, and much more.  We've also included a simple event system to simplify working with bound-element's events and to more easily access important object values from event callbacks.  

### Binding Types
There are numerous binding types available and you can also extend **simpleBind.js** to support new binding types.  The base binding types are explained below: 


----------


#### simplebind 
###### **(data-simplebind=objName.objKey)**
**simplebind** is the base binding type used by **simpleBind.js**.  The default behavior for this bind type is to create and update text nodes in the DOM.  If you would like to use this method to bind the innerHTML of a node, you can enable by setting data-simplebindhtml="true" on the bound element. 

##### example: 
```
<!-- The values bound to this element will be assigned as text -->
<h1 data-simplebind="example.text"></h1>
<!-- The values bound to this element will be assigned as innerHTML -->
<h1 data-simplebind="example.html" data-simplebindhtml="true"></h1>
```


----------


#### simplerepeat
###### **(data-simplerepeat=innerName:objName.objKey)**
**simplerepeat** binds are made for looping over arrays of objects.  For instance, if you were given an array of the states in the USA: 
```
var states = [
	{
		name: "Alabama", 
		code: "AL"
	}, {
		name: "Alaska", 
		code: "AK"
	}, { 
		name: "Arizona", 
		code: "AZ"
	} // , ...
]; 
```
and you wanted to create an un-ordered list of these states in your document, you could create the following HTML: 
```
<ul data-simplerepeat="state:states">
	<li>
		<div>
			<span data-simplebind="state.name"></span>
			(<span data-simplebind="state.code"></span>)
		</div>
	</li>
</ul>
```
and then you could bind the 'states' object with the following JavaScript: 
```
simpleBind.bind('states',states);
```
which would populate your list with all of the states found in the array: 
```
<ul data-simplerepeat="state:states">
	<li>
		<div>
			<span data-simplebind="state.name">Alabama</span>
			(<span data-simplebind="state.code">AL</span>)
		</div>
	</li>
	<li>
		<div>
			<span data-simplebind="state.name">Alaska</span>
			(<span data-simplebind="state.code">AK</span>)
		</div>
	</li>
	<li>
		<div>
			<span data-simplebind="state.name">Arizona</span>
			(<span data-simplebind="state.code">AZ</span>)
		</div>
	</li>
	<!-- and so on... -->
</ul>
```
**note:** *simplerepeat* blocks must have a single child node.  This child node can have as many nested children as you would like but it should have no siblings, for example, this is OK: 
```
<ul data-simplerepeat="item:example.itemsArray"> <!-- has only one child -->
	<li>
		<div>
			<span data-simplebind="item.text"></span>
			<span data-simplebind="item.otherProp"></span>
		</div>
	</li>
</ul>
```
but this will not work: 
```
<div data-simplerepeat="item:example.itemsArray"> <!-- has 2 children -->
	<div data-simplebind="item.text"></div>
	<div data-simplebind="item.otherProp"></div>
</div>
```


----------

#### simpleevent
###### **(data-simpleevent=eventName:eventCallbackName:objName.objKey)**
With many dynamically bound elements and more complicated data-binding apps, managing events can become a hassle.  We wanted to create a declarative approach to managing these events within the HTML.  At the same time, we don't want this to be inefficient **or** overly confusing.  **simpleevent** is the result.  

The basic idea is simple, you attach a data-simpleevent property to an element, specifying at least an *eventName* ('click','hover','submit',etc.) and an *eventCallbackName* (as a string).  If you'd like, you can also specify a third parameter of an object name and/or key and the value of this will be passed to your event callback.

Event callbacks are registered by calling **simplebind.registerEvent(eventName,eventCallbackFn)**.  For example, we might  register a submit handler on a registration form in the HTML: 
```
<form data-simpleevent="submit:validateForm:registrationForm">
	<input type="text" data-simplebindvalue="registrationForm.username" />
	<input type="text" data-simplebindvalue="registrationForm.password" />
</form>
```  
You could then define and register an event handler/callback function in JavaScript and register it with **simpleBind**: 
```
var validateForm = function(event,form) { 
	// inside of this function, you will have access to the 'registrationForm' 
	// object (parameter 'form') and all of its bound values.
	if(form.password.length > 10 && isAvailable(form.username)) { 
		// allow form submission, do nothing..
	} else { 
		// show some errors or something
		// and use event argument to prevent form submission: 
		event.preventDefault();
	}
}; 
simpleBind.registerEvent('validateForm',validateForm); 
```
**simpleevent's** will work with any event type and, like all other bind types, can be safely nested inside of **simplerepeat's**.

----------


#### simplebindvalue 
###### **(data-simplebindvalue=objName.objKey)**
**simplebindvalue** is just like the **simplebind** binding type except for it is designed for inputs (text, textarea, select, radio, & checkbox).  The binding with **simplebindvalue** is bi-directional and changes made to these inputs will be reflected automatically and immediately in the bound object and in the DOM if other elements are bound to the changed object key.

##### text input example: 
```
<input type="text" data-simplebindvalue="example.nestedObject.someKey" />
```

##### select input example: 
**note:** the binding on a select will only work if the bound value is equal to the value of one of the select's options (otherwise selectedIndex will be set to -1).  In other words: **simpleBind.js** will not create new options for you (but if you want to extend this bind type to do so, then we'll talk more about that later in this README).
```
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
<label>
	<input type="checkbox" data-simplebindvalue="example.someBoolean" />
	Some Boolean?
</label>
```
```
// this will check the example checkbox: 
simpleBind.bind('example',{someBoolean: true}); 
```

----------

### simplebindclass
###### **(data-simplebindclass='some-class-name:objName.objKey')**
**simplebindclass** allows you to define a boolean attribute on your bound object which dictates whether a particular class ('some-class-name' in the above example) is applied or removed from an element.

----------

### simplebindattrs
###### **(data-simplebindattrs='attrName:objName.objKey,attrName2:objName.objKey')**
**simplebindattrs** allows you to bind element attributes (anything that can be set via element.setAttribute(key,val)).  Here is an example that will set the `href` property of an anchor element: 

HTML
```
<a data-simplebindattrs='href:exampleObj.linkHref'>Click this link</a>
```

JavaScript
```
simpleBind.bind('exampleObj',{ linkHref: 'http://www.google.com' });
```

----------


#### simplebindhandler
###### **(data-simplebindhandler=bindHandlerName:objName.objKey)**
**simplebindhandler** allows you to define and specify a function that will be called whenever the specified object or object property is updated in **simpleBind.js**.  The *bindhandler* function will be called with two arguments: *elem* (the element the *bindhandler* is attached to) and *value* (the value of the updated object or object property).  

This is a very useful aspect of **simpleBind.js** and can be used to do a wide variety  of things.  Here is a very simple example that will enable a submit button when a specific object property ('form.isValid') is set to **true** and disable that button in any other situation:

HTML
```
<button type="submit" data-simplebindhandler="enableWhenValid:form.isValid" />
```
JavaScript
```
var enableWhenValid = function(elem,valid) { 
	elem.setAttribute('disabled',valid ? 'false'  : 'true'); 
}; 
simpleBind.registerBindHandler('enableWhenValid',enableWhenValid); 
```

----------


#### simpledata
###### **(data-simpledata=dataProperty1:objName.objKey)**
**simplebinddata** allows you to quickly add data-attr's to an element and to set these attributes to specified *simplebound* objects.  In the following example, we will assume we have the following object bound to our document: 

JavaScript
```
var dataObj = { 
	enabled: true, 
	id: 239823
}; 
simpleBind.bind('theData',dataObj);
```

We could bind a single, *data-is-enabled* attribute to an element like this: 
```
<div data-simpledata="isEnabled:theData.enabled"></div>
```

**notice:** take note that you do not need to specify the 'data-' portion of the attribute that you want to bind and that the rest of the attribute string is converted from **snake-case** to **camelCase** when declaring the binding in the HTML.  

Similar to **simpleevent's** and **simplebindhandler's**, if you'd like to specify multiple bound data-attributes, you can do so by separating the attributes by a comma.  For example, to set both a *data-is-enabled* and a *data-id* attribute in the above example, we could use the following HTML: 

```
<div data-simpledata="isEnabled:theData.enabled,id:theData.id"></div>
```


### Extending **simpleBind.js**
You can also extend **simpleBind.js** to support new binding types.  In fact, all of the binding types described above are created using the extension guideline described below. 

To get started you will need to have cloned this github repository to your local machine.  This project uses Node.js and Gulp for linting, minifying, and testing purposes.  

Install the dependencies for this project with **npm install** and then run the **gulp** command to start the default Gulp task which will watch the files and auto lint and minify upon any changes.  All of the *bindType* modules are stored in *src/bindTypes* and each should be named after the data-attribute by which it is assigned.  (ex: data-simplebindhandler maps to *src/bindTypes/simplebindhandler.js*)

For this example, we will create a simplified version of the **data-simplebindvalue** bind type.  To begin, an overview of this process might be helpful:

1.  We define a collection function which will be passed elements from the DOM that contain the bind type we are creating.  This function is called just once per binding and is responsible for creating a configuration object that will be stored and used later when a value is bound to this element.  
2. Next we define the processing function.  This function will be called whenever an element's bound value is updated.  The arguments passed to this function include the *config* object created in the last step and the object that was bound. This function is responsible for updating the value of the element to the value of the bound object.
3. Finally, we register this bind type by calling:
```
simpleBind.registerBindType(bindType,collectionFn,processingFn)  
```

**Example**
*A simplified version of the **data-simplebindvalue** bind type*: 

####1. We can call *simpleBind.getState()* to retrieve globally available state-tracking object that **simpleBind.js** shares between bind type modules.  The returned object contains a number of useful things including current and previously-bound object states. 
```
var state = simpleBind.getState(); 
```
####2. We define our collection routine, the function that defines the object stored in *state.boundElems*.  The arguments are *elem* (the element that was found with this bind type), and *opts* (all of the data-attributes assigned to this element as an object).

We store references to the object name, the object key as a string of the format 'key.key.key' and then call *simpleBind.addToBoundElems()* to seal the binding on this element - if it did not meet our criteria we could skip this step and the element would never be called for processing:
```
var collectionRoutine = function(elem,opts){
  opts.simplebind = opts.simplebind.split('.'); 
  var configObj = { 
    elem: elem,
    objName: opts.simplebind.shift(), 
    objKey: opts.simplebind.join('.')
  }; 
  simpleBind.addToBoundElems('simplebind',configObj.objName,configObj); 
}; 
```
####3. Now we define our binding routine, the function that determines how binding is done for this bind type and is called whenever the bound value is updated. Arguments are *config* (the object stored to *state.boundElems* in the collection function), *obj* (the object that was bound), and *flush* (a Boolean value that tells us if we should force-apply this value to the object [even if we don't think the value has changed]). 

In this function we use simpleBindUtil's **get()** function which allows us to retrieve an object value by specifying the object and the desired key in dot-notation.  

**ex:** simpleBindUtil.get({hello:{world:123}},'hello.world') **returns ->** 123
	
We also access the state.boundObjectsLast object to determine the previously bound value of this object property to determine if it has changed and whether we should update the element's value.

& for this crude example, we just use innerHTML to set the new value of the element.
```
var bindingRoutine = function(config,obj,flush){
  var val = util.get(obj,config.objKey);
  var oldVal = util.get(state.boundObjectsLast,config.objKey); 
  if(val != oldVal || flush) { 
    config.elem.innerHTML = val; 
  }
};
```
####4. Finally, we register this bind type by calling: 
```
simpleBind.registerBindType('simplebind',collectionRoutine,bindingRoutine); 
```
