---
title: Duck Monads in Underscore-Contrib
layout: default
tags: allonge, funjs, noindex
published: false
---

### underscore-contrib

[Underscore-Contrib], created by Michael Fogus and Jeremy Ashkenas, is an extension of the [underscore.js] library. Underscore.js is a relatively small library containing carefully chosen functions that appeal to a wide variety of programmers working with a variety of different programming paradigms. It's excellent.

However, it deliberately avoids diving deeply into any one paradigm. It has the more widely used functions for working with collections in a functional style. It has a few extremely useful function decorators like `_.once`. It has one or two functions associated with programming in a pure functional style like `_.partial`. And so forth.

Underscore-Contrib provides a home for the functions that don't (yet) fit into underscore.js. The gate for making contributions is deliberately lower so that a community can coalesce around it. In the fullness of time, the more broadly applicable contributions may make their way into underscore.js.

[Underscore-Contrib]: https://github.com/documentcloud/underscore-contrib
[underscore.js]: http://underscorejs.org

In this post, we're going to look at some code that solves a common (albeit advanced) problem: Managing some computations that have to be performed in order.

### three ways to order computations

Normally, ordering computations in JavaScript is very easy. You simply write what you want done as separate statements, like this:

    doThis();
    thenDoThis();
    doThisLast();
    
Like most non-esoteric languages, `doThis` happens before `thenDoThis`, which in turn happens before `doThisLast`. JavaScript has other ways to accomplish the same result. Uncommonly used but semantically familiar to Rubyists and Schemers, you can use the comma operator:

    (doThis(), thenDoThis(), doThisLast())

The comma operator makes these three invocations an expression that returns the value of `doThisLast()`. That's similar to Scheme's `begin` macro and Ruby's `begin... end`. We're going to consider a third way of accomplishing this, by *composing* functions, like this:

    doThisLast(thenDoThis(doThis()))
    
This also acts as an expression. Unlike the comma operator, it passes the value of `doThis()` to `thenDoThis`. It then passes the value of `thendoThis(doThis())` to `doThisLast`. Each function can use that value or ignore it as it sees fit, but the three will be evaluated in order as we want.

### compose

Here are some simple functions we'll use:

    function plusOne (n) { return n + 1; }
    function minusTwo (n) { return n - 2; }
    function triple (n) { return n * 3; }
    function square (n) { return n * n; }
    function k (n) { return function () { return n; } }

So our last example might look a little like this:

    minusTwo(triple(plusOne(2)))
      //=> 7

For many reasons, this kind of thing is common enough that Underscore contains the `_.compose` method just for chaining methods like this together:

    _.compose(minusTwo, triple, plusOne)(2)
      //=> 7

`compose` returns a function that is the composition of the functions you pass as arguments.

### pipeline

The trouble with compose is that for Western readers, we read from left-to-right, but the order of computation is from right-to-left. So `_.compose(minusTwo, triple, plusOne)(2)` subtracts two from the triple of, adding one to, whatever argument you provide.

Underscore-Contrib provides a function called `pipeline` that works just like `compose`, but the order of computation is from left-to-right:

    _.pipeline(minusTwo, triple, plusOne)(2)
      //=> 1
      
Now it subtracts two from the number your provide, triples that result, and then adds one to the next result. It is so named because it "pipes" a value through the functions.

Now just to emphasize what's going on, in JavaScript everything is a value, including functions. So `_.compose` and `_.pipeline` both take functions as arguments and return a function. We happen to be invoking that function immediately, but you needn't:

    var privilegesFromUserId = _compose(privileges, userFromId);
    
This is equivalent to writing something like:

    function privilegesFromUserId (id) {
      return privileges(userFromId(id));
    }
    
### summing up
    
We've seen that in JavaScript, we can use syntax to invoke functions in order, such as:

    one();
    two();
    three();
    
Or:

    one(two(three()));
    
We can use Underscore-Contrib to compose functions, such as:

    var privilegesFromUserId = _compose(privileges, userFromId);
    
Which is equivalent to:

    function privilegesFromUserId (id) {
      return privileges(userFromId(id));
    }

This is basic and intermediate stuff. Now to progress gently into advanced territory...

### call me maybe

When pipelining several functions together, we sometimes want to add some "special sauce." Here's a very common bit of special sauce. Instead of:

    function privilegesFromUserId (id) {
      return privileges(userFromId(id));
    }
    
We write:

    function privilegesFromUserId (id) {
      var user;
      
      if (id != null) {
        user = userFromId(id);
        if (user != null) {
          return privileges(user);
        }
      }
    }
    
There's a fairly obvious thing going on here: We are composing the functions `userFromId` and `privileges`, but for each function, we only want to invoke the function if the value being passed to it is "existy" as we say in underscore-contrib lingo (meaning, neither `null` not `undefined`).

This pattern comes up a lot: chaining things provided that the value is existy. For various reasons that do not concern us right now, this pattern is called *Maybe*, and a value that either exists or can not exist is said to be a "maybe" value.

We would rewrite `compose` or `pipeline` to handle it for us. Here's `pipeline`:

    function pipeline (/*, funs */){
      var funs = arguments;

      return function (argument) {
        return _.reduce(funs,
                        function (value, eachFun) { 
                          return eachFun(value); 
                        },
                        seed);
      };
    }

And here we have it converted:

    function pipelineMaybe (/*, funs */){
      var funs = arguments;

      return function (argument) {
        return _.reduce(funs,
                        function (value, eachFun) {
                          if (value != null) {
                            return eachFun(value);
                          }
                        },
                        seed);
      };
    }
    
Now we can write `pipeline(userFromId, privileges)` for normal use or `pipelineMaybe(userFromId, privileges)` when we want Maybe semantics applied to the value being pipelined.

### but does it <strike>blend</strike> scale?

This seems like an interesting idea, but instructive examples are always a little dangerous: They have to be simple enough to show how the mechanism works, but then we wonder whether it's worth the bother?

Well, this structure of pipelining values through a function and then applying semantics can be used to solve many different problems. We won't look at the exact code here, there's an example of this technique in [recursiveuniver.se](http://recursiveuniver.se). This is a high-speed Game of Life engine that uses extensive caching to achieve an exponential speedup for regular patterns.

The cache will grow in an unbounded way for high-entropy patterns, so the engine must perform continuous cache eviction, using a reference counting algorithm. It looks something like this. First, there is a regular pipeline method (it's called `sequence` in the engine for historical reasons):

    Cache.prototype.sequence = function (/*, funs */){
      var funs = arguments;

      return function (argument) {
        return _.reduce(funs,
                        function (value, eachFun) { 
                          return eachFun(value); 
                        },
                        seed);
      };
    }

When cache eviction is needed, the sequence function is overwritten, it looks something like this:

    Cache.prototype.sequence = function (/*, funs */){
      var funs = arguments;

      return function (argument) {
        return _.reduce(funs,
                        function (value, eachFun) { 
                          var result;
                          
                          value.incrementReferenceCount();
                          
                          result = eachFun(value);
                          
                          result.incrementReferenceCount();
                          value.decementReferenceCount();
                          
                          if (Cache.size() > Cache.triggerThreshold()) {
                            Cache.gc();
                          }
                          return result;
                        },
                        seed);
      };
    }

However, the code that actually performs the invocation simply invokes `sequence` and does not concern itself with cache eviction.