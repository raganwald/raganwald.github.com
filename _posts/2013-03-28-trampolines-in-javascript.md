---
title: Trampolines in JavaScript
layout: default
tags: [allonge, effectivejs, funjs]
---

> A trampoline is a loop that iteratively invokes [thunk]-returning functions ([continuation-passing style][cps]). A single trampoline is sufficient to express all control transfers of a program; a program so expressed is trampolined, or in trampolined style; converting a program to trampolined style is trampolining. Trampolined functions can be used to implement [tail-recursive] function calls in stack-oriented programming languages.--[Wikipedia][trampolining]

[thunk]: https://en.wikipedia.org/wiki/Thunk_(functional_programming)
[cps]: https://en.wikipedia.org/wiki/Continuation-passing_style
[tail-recursive]: https://en.wikipedia.org/wiki/Tail-recursive_function
[trampolining]: https://en.wikipedia.org/wiki/Trampoline_(computing)

This description is precise and appropriate for a reference work, but it is nearly impossible to go out and read about thunks, continuation-passing style, and tail-recursion without learning about trampolining along the way.

So it is exactly how one ought to answer the question "define trampolining" on an examination, because it demonstrates that you've learned the subject thoroughly. But if asked to *explain* trampolining, a more tutorial-focused approach is called for.

Let's begin with a use case.

### recursion, see recursion

You are asked to demonstrate that you know how to write a recursive function, perhaps in one of those job interviews where they like to take a small snippet of code and use it as an excuse to talk about programming philosophies.

The challenge is to implement factorial in recursive style.

You write:

```javascript
function factorial (n) {
  return n
  ? n * factorial(n - 1)
  : 1
}
```

The immediate limitation of this implementation is that since it calls itself *n* times, to get a result you need a stack on *n* stack frames in a typical stack-based programming language implementation. And JavaScript is such an implementation.

This creates two problems: First, we need space O*n* for all those stack frames. It's as if we actually wrote out `1 x 1 x 2 x 3 x 4 x ...` before doing any calculations. Second, most languages have a limit on the size of the stack much smaller than the limit on the amount of memory you need for data.

Trying this in Node, I get:

```javascript
factorial(10)
  //=> 3628800
factorial(32768)
  //=> RangeError: Maximum call stack size exceeded
```

We can easily rewrite this in iterative style, but there are other functions that aren't so amenable to rewriting and using a simple example allows us to concentrate on the mechanism rather than the "domain."

### tail-call elimination

Let's pretend you're told that you are now targeting a JavaScript implementation that implements [Tail-Call Optimization][tco]. Meaning, that when a function returns the result of calling itself, the language doesn't actually perform another function call, it turns the whole thing into a loop for you.

[tco]: https://en.wikipedia.org/wiki/Tail-call_optimization

As written, `factorial` cannot be optimized because it doesn't return the result of a function call, it performs a function call and then does something with the result. So it still needs stack frames.

Lisp programmers in days of yore would rewrite functions like this into "Tail Recursive Form," and that's what we're going to do. What we need to do is take the expression `n * factorial(n - 1)` and push it down into a function so we can just call it with parameters.

Now you have probably jumped directly to how to do this, but I am not so smart and when I first read about it my eyes glazed over and my head hurt for several days. The explanation is this. When a function is called, a *stack frame* is created that contains all the information needed to resume execution with the result. Stackframes hold a kind of pointer to where to carry on evaluating, the function parameters, and other bookkeeping information.[^bookkeeping]

[^bookkeeping]: Did you know that "bookkeeping" is the only word in the English language containing three consecutive letter pairs? You're welcome.

If we use the symbol `_` to represent a kind of "hole" in an expression where we plan to put the result, every time `factorial` calls itself, it needs to remember `n * _` so that when it gets a result back, it can multiply it by `n` and return that. So the first time it calls itself, it remembers `10 * _`, the second time it calls itself, it remembers `9 * _`, and all these things stack up like this when we call `factorial(10)`:

```javascript
 1 * _
 2 * _
 3 * _
 4 * _
 5 * _
 6 * _
 7 * _
 8 * _
 9 * _
10 * _
```

Finally, we call `factorial(0)` and it returns `1`. Then the top is popped off the stack, so we calculate `1 * 1`. It returns `1` again and we calculate `2 * 1`. That returns `2` and we calculate `3 * 2` and so on up the stack until we return `10 * 362880` and return `3628800`, which we print.

How can we get around this? Well, imagine if we don't have a hole in a computation to return. In that case, we wouldn't need to "remember" anything on the stack. To make this happen, we need to either return a value or return the result of calling another function without any further computation.

Such a call is said to be in "tail position" and to be a "tail call." The "elimination" of tail-call elimination means that we don't perform a full call including setting up a new stack frame. We perform the equivalent of a "jump." 

If we don't need to remember anything, we don't create another stack frame, we just re-use the one we currently have. And when I say "we," I mean the people writing the interpreter. This is generally a feature of the language, not of a program.

If we had an implementation of JavaScript capable of tail-call elimination, we would need to rewrite functions like `factorial` to take advantage of it. This is easy with a helper function. In production we'd use IIFEs and other techniques to encapsulate things and prevent the creation of a new closure every time we call `factorial`, but we aren't in production, so:

```javascript
function factorial (n) {
  var _factorial = function myself (acc, n) {
    return n
    ? myself(acc * n, n - 1)
    : acc
  };
  
  return _factorial(1, n);
}
```

Now our function either returns a value or it returns the result of calling another function without doing anything with that result. 

Sharp-eyed functional programmers will notice that we're basically rewriting this thing into a fold over a lazy sequence, but it is man's nature to find many paths to enlightenment, so let's push on.

It gives us the correct results, but we can see that Node doesn't perform this magic "tail-call elimination."

```javascript
factorial(10)
  //=> 3628800
factorial(32768)
  //=> RangeError: Maximum call stack size exceeded
```

So what to do? Well, naturally we're asked to Greenspun tail-call elimination on top of JavaScript.

> Greenspun's Tenth Rule: Any sufficiently complicated C or Fortran program contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of Common Lisp.

> Steele & Crockford's Corollary to Greenspun's Tenth Rule: Any sufficiently interesting JavaScript library contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of Haskell.[^corollary]

[^corollary]: I made that up. But I suspect that Oliver Steele, who wrote one of the first hard-core functional programming libraries for JavaScript, and Douglas Crockford, famous for "The Good Parts," would agree.

### trampolining

One way to implement tail-call elimination is also handy for many other general things we might want to do with computation, it's called *trampolining*. What we do is this:

When we call a function, it returns a *thunk* that we call to get a result. Of course, the thunk can return another thunk, so every time we get a result, we check to see if it's a thunk. If not, we have our final result.

What's a thunk? I didn't explain that? For our purposes, a *thunk* is a function taking no arguments that is intended purely for greenspunning features. For example, this is a thunk: `function () { return 'Hello World'; }`.

An extremely simple and useful implementation of trampolining can be found in the [Lemonad] library. It works provided that you want to trampoline a function that doesn't return a function. Here it is: 

[Lemonad]: http://fogus.github.com/lemonad/

```javascript
L.trampoline = function(fun /*, args */) {
  var result = fun.apply(fun, _.rest(arguments));

  while (_.isFunction(result)) {
    result = result();
  }

  return result;
};
```

We'll rewrite it in [allong.es] style for consistency with other posts in this blog. Meaning, we write it as a function decorator:

[allong.es]: https://github.com/raganwald/allong.es

```javascript
npm install allong.es

var variadic = require('allong.es').variadic;

var trampoline = function (fn) {
  return variadic( function (args) {
    var result = fn.apply(this, args);

    while (result instanceof Function) {
      result = result();
    }

    return result;
    
  });
};
```

Now here's our implementation of `factorial` that is wrapped around a trampolined tail recursive function:

```javascript
function factorial (n) {
  var _factorial = trampoline( function myself (acc, n) {
    return n
    ? function () { return myself(acc * n, n - 1); }
    : acc
  });
  
  return _factorial(1, n);
}

factorial(10);
  //=> 362800
factorial(32768);
  //=> Infinity
```

Presto, it runs for `n = 32768`. Now we'd better fix the "infinity" problem, caused by JavaScript's limitations on integers. Here's our finished work:

```javascript
npm install big-integer

var variadic = require('allong.es').variadic,
    bigInt = require("big-integer");

var trampoline = function (fn) {
  return variadic( function (args) {
    var result = fn.apply(this, args);

    while (result instanceof Function) {
      result = result();
    }

    return result;
    
  });
};

function factorial (n) {
  var _factorial = trampoline( function myself (acc, n) {
    return n.greater(0)
    ? function () { return myself(acc.times(n), n.minus(1)); }
    : acc
  });
  
  return _factorial(bigInt.one, bigInt(n));
}

factorial(10).toString()
  //=> '3628800'
factorial(32768)
  //=> GO FOR LUNCH
```

Well, it now takes a very long time to run, but it is going to get us the proper result and we can print that as a string, so we'll leave it calculating in another process and carry on.

And the implementation did not require much modification. This is good, converting to tail-call form was much more intrusive.

What we've done we've done is:

1. Rewrite our function in tail-recursive form, and;
2. Instead of returning the result of calling a ourselves, we've;
3. Returned a *thunk*, a function that calls ourself, and;
4. Called the `trampoline` decorator on it, and;
5. Converted to big integer arithmetic.

The limitation of this simple implementation is that because it tests for the function returning a function, it will not work for functions that return functions. If you want to trampoline a function that returns a function, you need a more sophisticated mechanism, such as the `trampoline` implementation in [bilby.js].

[bilby.js]: http://bilby.brianmckenna.org

Here's our factorial done with bilby:

```javascript
var B = require('bilby'),
    cont = B.cont,
    done = B.done,
    trampoline = B.trampoline;
    
function factorial (n) {
  var _factorial =  function myself (acc, n) {
    return n.greater(0)
    ? cont( function () { return myself(acc.times(n), n.minus(1)); })
    : done( acc )
  };
  
  return trampoline( _factorial(bigInt.one, bigInt(n)) );
}

factorial(10).toString();
  //=> '3628800'
factorial(32768);
  //=> GO FOR LUNCH
```

Bilby's approach has a few more moving parts, but they are very clear and the naming may help convey the intention. And as a benefit, there is no limitation that trampolined functions cannot return functions.

### summary

*Trampolining* is a technique for greenspunning tail-call elimination. Meaning, if you take a recursive function and rewrite it in tail-call form, you can eliminate the need to create a stack frame for every 'invocation'.

It is very handy in a language like JavaScript, in that it allows you to use a recursive style for functions without worrying about limitations on stack sizes.

---

Follow-up: [High Level Trampolining](/2013/03/29/high-level-trampolining.html)

---

notes:
