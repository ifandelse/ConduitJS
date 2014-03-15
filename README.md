#ConduitJS

ConduitJS can be used to give your methods a pre- and post-invocation pipeline. You can think of it as targeted [AOP](http://en.wikipedia.org/wiki/Aspect-oriented_programming) for JavaScript methods or the [Decorator](http://en.wikipedia.org/wiki/Decorator_pattern) pattern used to target methods specifically. Need the ability to execute behavior just before or after a  method is invoked? Want to apply a predicate that determines if the method should actually fire? You can use ConduitJS to make that happen.

##Example Usage
Conduit supports both asynchronous pipelines (where steps can optionally be async, and a `next` continuation callback is passed into each step, allowing you to determine when it proceeds to the next step) and synchronous pipelines (where a return value is expected, and each step is pased the prior step's return value, with the last return value being the result passed to the caller).

###`Conduit.Async`
####Making a method an Async-Capable Conduit:

```javascript
var obj = {
    doStuff: function(someValue) {
        console.log("The actual method is doing stuff. The actual value is " + someValue);
    }
}
// make the doStuff method a conduit
obj.doStuff = new Conduit.Async({ context: obj, target: obj.doStuff });
obj.doStuff(1);
// The actual method is doing stuff. The actual value is 1
```

####Add a pre-invocation step to the pipeline:

```javascript
// Conduit's pipeline steps are functions that take a "next" continuation callback
// as the first argument. After that you can have 0-n arguments - whatever your
// original target method signature should be
obj.doStuff.before(function(next, someValue) {
    console.log("Pre-invocation step. We can see the value is: " + someValue);
    next(someValue);
});
obj.doStuff(1);
/*
  Pre-invocation step. We can see the value is: 1
  The actual method is doing stuff. The actual value is 1 
*/
```

####Add a post-invocation step to the pipeline:

```javascript
obj.doStuff.after(function(next, someValue) {
    console.log("Post-invocation step. We can see the value is: " + someValue);
    next(someValue);
}, { phase: "post" });
obj.doStuff(1);
/*
 Pre-invocation step. We can see the value is: 1
 The actual method is doing stuff. The actual value is 1
 Post-invocation step. We can see the value is: 1 
*/
```

####Adding a pre-invocation step before other pre-invocation steps:

```javascript
obj.doStuff.before(function(next, someValue) {
    console.log("Another Pre-invocation step. This should execute first...");
    next(someValue);
}, { prepend: true });
obj.doStuff(1)
/*
  Another Pre-invocation step. This should execute first... 
  Pre-invocation step. We can see the value is: 1
  The actual method is doing stuff. The actual value is 1
  Post-invocation step. We can see the value is: 1 
*/
```

####Adding a post-invocation step before other post-invocation steps:

```javascript
obj.doStuff.after(function(next, someValue) {
    console.log("Another Post-invocation step. This should execute before any other post-invocation steps...");
    next(someValue);
}, { prepend: true, phase: "post" });
obj.doStuff(1)
/*
  Another Pre-invocation step. This should execute first...
  Pre-invocation step. We can see the value is: 1
  The actual method is doing stuff. The actual value is 1
  Another Post-invocation step. This should execute before any other post-invocation steps...
  Post-invocation step. We can see the value is: 1 
*/
```

####Using a predicate to determine if steps should continue processing:

```javascript
var someFlag = false;
obj.doStuff.before(function(next, someValue) {
    console.log("Pre-invocation predicate. I will halt execution");
    if(someFlag) {
    	next(someValue);
   	}
});
obj.doStuff(1);
/*
  Another Pre-invocation step. This should execute first...
  Pre-invocation step. We can see the value is: 1
  Pre-invocation predicate. I will halt execution 
*/
```

####Steps can be Asynchronous with `Conduit.Async`

```javascript
obj.doStuff.after(function(next, someValue) {
	setTimeout(function() {
		console.log("Post-invocation step. We can see the value is: " + someValue);
	    next(someValue);
	}, 0);
}, { phase: "post" });
obj.doStuff(1);
```

###`Conduit.Sync`
Making a Method a Synchronous Conduit:
```javascript
var obj = {
    doStuff: function(someValue) {
        console.log("The actual method is doing stuff. The actual value is " + someValue);
        return "doStuff fn return value";
    }
}
// make the doStuff method a conduit
obj.doStuff = new Conduit.Sync({ context: obj, target: obj.doStuff });
var result = obj.doStuff(1);
// result = "doStuff fn return value"
// The actual method is doing stuff. The actual value is 1
```

####Add a pre-invocation step to a synchronous pipeline:

```javascript
// Conduit's sync pipeline steps are functions that take a "returnValue"
// (the result of the prio step) as the first argument. After that you can
// have 0-n arguments - whatever your original target method signature
// should be
obj.doStuff.before(function(returnValue, someValue) {
    console.log("Pre-invocation step. We can see the value is: " + someValue + " and the prior step's return value was " + returnValue);
    return someValue;
});
obj.doStuff(1);
/*
  Pre-invocation step. We can see the value is: 1 and the prior step's return value was undefined
  The actual method is doing stuff. The actual value is 1 

  (The prior step's value was undefined b/c this "before" step was the first step to execute)
*/
```

####Add a post-invocation step to the pipeline:

```javascript
obj.doStuff.after(function(returnValue, someValue) {
    console.log("Post-invocation step. We can see the value is: " + someValue + " and the prior step's return value was " + returnValue);
    return someValue + " after step";
});
var result = obj.doStuff(1);
// result = "1 after step"
/*
 Pre-invocation step. We can see the value is: 1 and the prior step's return value was "doStuff fn return value"
 The actual method is doing stuff. The actual value is 1
 Post-invocation step. We can see the value is: 1 
*/
```

##License
It's MIT. Go forth and fork (please consider contributing back as well!).