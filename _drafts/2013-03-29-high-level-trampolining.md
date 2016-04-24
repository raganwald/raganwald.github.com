---
layout: default
---

<a href="http://www.flickr.com/photos/mr_tentacle/2834914130/" title="Gymnastics Venue with Trampolines by mr_tentacle, on Flickr"><img src="http://farm4.staticflickr.com/3057/2834914130_c3b6733551_z.jpg" alt="Gymnastics Venue with Trampolines"></a>

in [Trampolines in JavaScript][t], we used a ridiculously simple factorial function to understand how [trampolining] works. To recap, we started with:

[t]: http://raganwald.com/2013/03/28/trampolines-in-javascript.html
[trampolining]: https://en.wikipedia.org/wiki/Trampoline_(computing)

```javascript
function factorial (n) {
  return n
  ? n * factorial(n - 1)
  : 1
}
```

The major problem given for this code is that stack-based languages like JavaScript consume order *n* space to compute factorial. Some implementations will have a limited stack and fail, others will simply consume an unnecessary amount of memory to compute the desired result.

One solution presented was: 

```javascript
var variadic = require('allong.es').variadic;

function trampoline (fn) {
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
    return n > 0
    ? function () { return myself(acc * n, n - 1); }
    : acc
  });
  
  return _factorial(1, n);
};
```

(I have elided big integer support to highlight the trampolining mechanism).

Obviously we would not use this technique with a function like `factorial` outside of a tutorial. An alternative and vastly superior solution to the problem of stack space is coding it iteratively.

Is this a hint that trampolining is unnecessary for domain programming, a technique reserved for those who implement programming languages, not those who use them?

No. Trampolining does have practical applications, although like most "advanced" techniques, the trick is usually recognizing the appropriate place to use trampolining rather than knowing how to implement the pattern.

### tail-call elimination

Trampolining eliminates tail-calls and replaces them "behind-the-scenes" with an iterative loop that evaluates thunks. Looking at `factorial`, one can be forgiven for thinking that recursive functions are the only place we can use trampolining.

This not the case. Trampolining eliminates all calls in tail position, including calls to other functions. Consider this delightfully simple example of two co-recursive functions:

```javascript
function even (n) {
  return n == 0
    ? true
    : odd(n - 1);
};

function odd (n) {
  return n == 0
    ? false
    : even(n - 1);
};
```

Like our `factorial`, it consumes *n* stack space of alternating calls to `even` and `odd`:

```javascript
even(32768);
  //=> RangeError: Maximum call stack size exceeded
```

Obviously we can solve this problem with modulo arithmetic, but consider that what this shows is a pair of functions that call other functions in tail position, not just themselves.

As with factorial, we separate the public interface that is not trampolined from the trampolined implementation:

```javascript
var even = trampoline(_even),
    odd  = trampoline(_odd);

function _even (n) {
  return n == 0
    ? true
    : function () { return _odd(n - 1); };
};

function _odd (n) {
  return n == 0
    ? false
    : function () { return _even(n - 1); };
};
```

And presto:

```javascript
even(32768);
  //=> true
```

We can't overemphasize that **trampolining eliminates all tail calls, not just self-recursive calls**. That makes it suitable for replacing many control flow constructs with functions in tail position.

Trampolining is really a general-purpose control-flow construct, not just an implementation of tail-call elimination. And therein lies an important point: JavaScript has some unique considerations.

FOr starters, JavaScript is single-threaded and regardless of whether its stack can handle a deep series of calls, you may want to consider using something like `process.nextTick` to do the trampolining for you, with results passed back via queues or promises.

Likewise, you may be using something like promises to mediate control flow any ways, and mixing asynchronous-aware code with trampolining may be an attempt to solve the same problem with two different tools.

### tl;dr

Trampolining is most appropriate for complex function calls that do not easily resolve to an iterative snippet of code and do not conflict with other techniques for mediating control flow such as promises.