#ConduitJS v0.3.2

ConduitJS can be used to *intercept* your methods and give them a pre- and post-invocation pipeline. You can think of it as targeted [AOP](http://en.wikipedia.org/wiki/Aspect-oriented_programming) for JavaScript methods or the [Decorator](http://en.wikipedia.org/wiki/Decorator_pattern) pattern used to target methods specifically. Need the ability to execute behavior just before or after a  method is invoked? Want to apply a predicate that determines if the method should actually fire? You can use ConduitJS to make that happen.

##Concepts
Conduit supports both asynchronous & synchronous &lt;airquotes&gt;pipelines&lt;/airquotes&gt;. (By "pipeline", I mean a series of functions that can be executed *before* and *after* the target method, where each step in the pipeline has the chance to mutate the args being passed to the next step.)

The primary difference(s) between async and sync Conduits, is that an asynchronous Conduit should be applied to a method that *does not return a value* and where you might want steps in the pipeline to be async (for example, a step might use `setTimeout` - the steps don't *have* to be async, though). Synchronous Conduits should be applied to methods that *return a value*, and by their nature, each step should be synchronous (so don't use async primitives like `setTimeout` and `setImmediate`, etc. in the steps of a sync Conduit). It's currently possible to abort the execution of an async Conduit, but the sync Conduits can't be aborted (this may change if the need arises). The step callbacks have slightly different method signatures in sync vs async Conduits, which we'll explore below.

 (where steps can optionally be async, and a `next` continuation callback is passed into each step, allowing you to determine when it proceeds to the next step) and synchronous pipelines (where a return value is expected, and each step is pased the prior step's return value, with the last return value being the result passed to the caller).

##Example Usage
###`Conduit.Async`
As we noted above, an async Conduit doesn't *have* to use async primitives in steps, but it should be able to handle them. It manages this by passing a `next` continuation argument to each step so that the step can invoke it when it's ready to proceed to the next step, etc. For example, adding a "before" step:

```javascript
obj.doStuff.before(function(next, someValue) {
    console.log("Pre-invocation step. We can see the value is: " + someValue);
    next(someValue);
});
```

Notice that the "before" step callback function's signature is *exactly the same as the target method, except the `next` callback is inserted as the first argument. Let's look at some more examples:

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
A Synchronous Conduit should be used when you need to capture (or mutate) the return value of the target method. The rules differ slightly with synchronous Conduits:

* "before" steps are allowed to mutate the arguments being fed to the target method by returning an array of new arguments that will be applied to the next "before" step (or the target method if that's the next method in the chain). If you don't want to override/mutate the arguments, simply don't return anything from the step. A "before" step's method signature matches the target method's.
* Once the target method is invoked, the return value is captured and then passed as the *first argument* to any "after" step.
* "after" steps can mutate the return value by returing a different value. If you don't want to mutate the return value in an "after" step, just don't return anything (or you can explicitly return the `returnValue` argument that was passed into the step as the first arg).

So, in a nutshell - with synchronous Conduits, "before" steps can mutate the arguments fed the target method and "after" steps can mutate the return value of the target method.


####Making a Method a Synchronous Conduit:
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
// Conduit's sync pipeline "before" steps are functions that match 
// whatever your original target method signature is. These steps
// can return an array of values that will be used as the new args
// for the next step in the chain
obj.doStuff.before(function(someValue) {
    console.log("Pre-invocation step. We can see the value is: " + someValue);
    return [someValue + 1];
});
var result = obj.doStuff(1);
/*
  result = "doStuff fn return value"
  Pre-invocation step. We can see the value is: 1 
  The actual method is doing stuff. The actual value is 2 
*/
```

####Add a post-invocation step to the pipeline:

```javascript
// Conduit's sync pipeline "after" steps are functions that match 
// whatever your original target method signature is, BUT with the
// return value of the target method or previous before step function
// as the first arg. These steps can return a value that will be
// used as the new return value, and fed to the next step in the chain.
obj.doStuff.after(function(returnValue, someValue) {
    console.log("Post-invocation step. We can see the value is: " + returnValue);
    return returnValue + " after step";
});
var result = obj.doStuff(1);
// result = "doStuff fn return value after step"
/*
 Pre-invocation step. We can see the value is: 1
 The actual method is doing stuff. The actual value is 2
 Post-invocation step. We can see the value is: doStuff fn return value
 doStuff fn return value after step 
*/
```

##License
It's MIT. Go forth and fork (please consider contributing back as well!).