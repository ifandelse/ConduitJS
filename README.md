#ConduitJS

ConduitJS can be used to give your methods a pre- and post-invocation pipeline. Think of it as targeted AOP for JavaScript methods. Need the ability to execute behavior just before or after a  method is invoked? Want to apply a predicate that determines if the method should actually fire? You can use ConduitJS to make that happen.

##Example Usage
###Making a method a Conduit:

```javascript
var obj = {
    doStuff: function(someValue) {
        console.log("The actual method is doing stuff. The actual value is " + someValue);
    }
}
// make the doStuff method a conduit
obj.doStuff = new Conduit({ context: obj, target: obj.doStuff });
obj.doStuff(1);
// The actual method is doing stuff. The actual value is 1
```

###Add a pre-invocation step to the pipeline:

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

###Add a post-invocation step to the pipeline:

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

###Adding a pre-invocation step before other pre-invocation steps:

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

###Adding a post-invocation step before other post-invocation steps:

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

###Using a predicate to determine if steps should continue processing:

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

##License
It's MIT. Go forth and fork (please consider contributing back as well!).