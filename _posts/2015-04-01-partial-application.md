---
title: "Partial Application in ECMAScript 2015"
layout: default
tags: javascript
published: true
---



### partial application

Partial application is straightforward. We could start with addition or some such completely trivial example, but if you don't mind we'll have a look at something that is of actual use in daily programming.

As a preamble, let's make ourselves a `mapWith` function that maps a function over any collection that has a `.map` method:

{% highlight javascript %}
const mapWith = (unaryFn, collection) =>
  collection.map(unaryFn);

const square = (n) => n * n;

mapWith(square, [1, 2, 3])
  //=> [1, 4, 9]
{% endhighlight %}

`mapWith` is a binary function, `square` is a unary function. When we called `mapWith` with arguments `square` and `[1, 2, 3]` and `square`, we *applied* the arguments to the function and got our result.

Since `mapWith` takes two arguments, and we supplied two arguments, we *fully applied* the arguments to the function. So what's "partial" application? Supplying fewer arguments. Like supplying one argument to `mapWith`.

Now what happens if we supply one argument to `mapWith`? We can't get a result without the other argument, so as we've written it, it breaks:

{% highlight javascript %}
mapWith(square)
  //=> undefined is not an object (evaluating 'collection.map')
{% endhighlight %}

But let's imagine that we could apply fewer arguments. We wouldn't be fully applying `mapWith`, we'd be *partially applying* `mapWith`. What would we expect to get? Well, imagine we decide to buy a $2,000 bicycle. We go into the store, we give them $1,000. What do we get back? A pice of paper saying that we are doing a layaway program. The $1,000 is held in trust for us, when we come back with the other $1,000, we get the bicycle.

Putting down $1,000 on a $2,000 bicycle is partially buying a bicycle. What it gets us is the right to finish buying the bicycle later. It's the same with partial application. If we were able to partially apply the `mapWith` function, we'd get back the right to finish applying it later, with the other argument.

Something like this:

{% highlight javascript %}
const mapWith =
  (unaryFn) =>
    (collection) =>
      collection.map(unaryFn);

const square = (n) => n * n;

const partiallyAppliedMapWith = mapWith(square);

partiallyAppliedMapWith([1, 2, 3])
  //=> [1, 4, 9]
{% endhighlight %}

The thing is, we don't want to always write our functions in this way. So what we want is a function that takes this:

{% highlight javascript %}
const mapWith = (unaryFn, collection) =>
  collection.map(unaryFn);
{% endhighlight %}

And turns it into this:

{% highlight javascript %}
partiallyAppliedMapWith([1, 2, 3])
  //=> [1, 4, 9]
{% endhighlight %}

Working backwards:

{% highlight javascript %}
const partiallyAppliedMapWith = (collection) =>
  mapWith(unaryFn, collection);
{% endhighlight %}

The expression `(collection) => mapWith(unaryFn, collection)` has two free variables, `mapWith` and `unaryFn`. If we were using a fancy refactoring editor, we could extract a function. Let's do it by hand:

{% highlight javascript %}
const ____ = (mapWith, unaryFn) =>
  (collection) =>
    mapWith(unaryFn, collection);
{% endhighlight %}

What is this `_____` function? It takes the `mapWith` function and the `unaryFn`, and returns a function that takes a collection and returns the result of applying `unaryFn` and `collection` to `mapWith`. Let's make the names very generic, the function works no matter what we call the arguments:

{% highlight javascript %}
const ____ =
  (fn, x) =>
    (y) =>
      fn(x, y);
{% endhighlight %}

This is a function that takes a function and an argument, and returns a function that takes another argument, and applies both arguments to the function. So, we can write this:

{% highlight javascript %}
const mapWith = (unaryFn, collection) =>
  collection.map(unaryFn);
  
const square = (n) => n * n;

const ____ =
  (fn, x) =>
    (y) =>
      fn(x, y);
    
const partiallyAppliedMapWith = ____(mapWith, square);

partiallyAppliedMapWith([1, 2, 3])
  //=> [1, 4, 9]
{% endhighlight %}

So what is this `____` function? It partially applies one argument to any function that takes two arguments.

We can dress it up a bit. For one thing, it doesn't work with methods, it's strictly a <span style="color: blue;">blue</span> higher-order function. Let's make it <span style="color: #999900;">khaki</span> by passing `this` properly:

{% highlight javascript %}
const ____ =
  (fn, x) =>
    function (y) {
      return fn.call(this, x, y);
    };
{% endhighlight %}

Another problem is that it only works for binary functions. Let's make it so we can pass one argument and we get back a function that takes as many remaining arguments as we like:

{% highlight javascript %}
const ____ =
  (fn, x) =>
    function (...remainingArgs) {
      return fn.call(this, x, ...remainingArgs);
    };
    
const add = (verb, a, b) =>
  `The ${verb} of ${a} and ${b} is ${a + b}`
  
const summer = ____(add, 'sum');

summer(2, 3)
  //=> The sum of 2 and 3 is 5
{% endhighlight %}

And what if we want to partially apply more than one argument?

{% highlight javascript %}
const ____ =
  (fn, ...partiallyAppliedArgs) =>
    function (...remainingArgs) {
      return fn.apply(this, partiallyAppliedArgs.concat(remainingArgs));
    };
    
const add = (verb, a, b) =>
  `The ${verb} of ${a} and ${b} is ${a + b}`
  
const sum2 = ____(add, 'sum', 2);

sum2(3)
  //=> The sum of 2 and 3 is 5
{% endhighlight %}

What we have just written is a *left partial application* function: Given any function and some arguments, we partially apply those arguments and get back a function that applies those arguments and and more you supply to the original function.

Partial application is thus the application of part of the arguments of a function, and getting in return a function that takes the remaining arguments.

And here's our finished function, properly named:

{% highlight javascript %}
const leftPartialApply =
  (fn, ...partiallyAppliedArgs) =>
    function (...remainingArgs) {
      return fn.apply(this, partiallyAppliedArgs.concat(remainingArgs));
    };
    
const add = (verb, a, b) =>
  `The ${verb} of ${a} and ${b} is ${a + b}`
  
const sum2 = leftPartialApply(add, 'sum', 2);

sum2(3)
  //=> The sum of 2 and 3 is 5
{% endhighlight %}

### right partial application

It is very convenient to have a `mapWith` function, because you are far more likely to want to write something like:

{% highlight javascript %}
const squareAll = leftPartialApply(mapWith, x => x * x);
{% endhighlight %}

Than to write:

{% highlight javascript %}
const map123 = leftPartialApply(map, [1, 2, 3]);
{% endhighlight %}

But sometime you have `map` but not `mapWith`, or some other analagous situation where you want to apply the values *from the right* rather than the left. No problem:

{% highlight javascript %}
const rightPartialApply =
  (fn, ...partiallyAppliedArgs) =>
    function (...remainingArgs) {
      return fn.apply(this, remainingArgs.concat(partiallyAppliedArgs));
    };
{% endhighlight %}

### arbitrary partial application

What if you want to apply some, but not all of the arguments, and they may not be neatly lined up at the beginning or end? This is also prossible, provied we define a placeholder of some kind, and then write some code to "fill in the blanks".

This implementation takes a "template" of values, you insert placeholder values (traditionally `_`, but anything will do) where you want values to be supplied later.

{% highlight javascript %}
const div = (verbed, numerator, denominator) =>
  `${numerator} ${verbed} ${denominator} is ${numerator/denominator}`
  
div('divided by', 1, 3)
  //=> 1 divided by 3 is 0.3333333333333333
  
const arbitraryPartialApplication = (() => {
  const placeholder = {},
        arbitraryPartialApplication = (fn, ...template) => {
          let remainingArgIndex = 0;
          const mapper = template.map((templateArg) =>
                           templateArg === placeholder
                             ? ((i) => (args) => args[i])(remainingArgIndex++)
                             : (args) => templateArg);
          
          return function (...remainingArgs) {
            const composedArgs = mapper.map(f => f(remainingArgs));
            
            return fn.apply(this, composedArgs);
          }
          
        };
        
  arbitraryPartialApplication._ = placeholder;
  return arbitraryPartialApplication;
})();

const _ = arbitraryPartialApplication._;

const dividedByThree = arbitraryPartialApplication(div, 'divided by', _, 3);

dividedByThree(2)
  //=> 2 divided by 3 is 0.6666666666666666
{% endhighlight %}

Arbitrary partial application handles most of the cases for left- or right-partial application, but has more internal moving parts. It also doesn't handle cases involving an arbitrary number of parameters.

For example, the built-in function `Math.max` returns the largest of its arguments, or `null` if no arguments are supplied:

{% highlight javascript %}
Math.max(1, 2, 3)
  //=> 3
  
Math.max(-1, -2, -3)
  //=> -1
  
Math.max()
  //=> null
{% endhighlight %}

What if we want to have a default arument? For example, what if we want it tor return the largest number greater than or equal to `0`, or `0` if there aren't any? We can do that with `leftPartialApplication`, but we can't with `arbitraryPartialApplication`, because we want to accept an arbitrary number of arguments:

{% highlight javascript %}
const maxDefaultZero = leftPartialApply(Math.max, 0);

maxDefaultZero(1, 2, 3)
  //=> 3
  
Math.max(-1, -2, -3)
  //=> 0
  
maxDefaultZero()
  //=> 0
{% endhighlight %}

So there's good reason to have left-, right-, and arbitrary partial application functions in our toolbox.

### what's partial application again?

"Partial application is the conversion of a polyadic function into a function taking fewer arguments arguments by providing one or more arguments in advance." JavaScript does not have partial application built into the language (yet), but it is possible to write our own higher-order functions that perform left-, right-, or arbitrary partial application.

---

| [reddit](http://www.reddit.com/r/javascript/comments/312kvs/partial_application_in_ecmascript_2015/) | [edit this page](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2015-04-01-partial-application.md) |

---

This post was extracted from the in-progress book, [JavaScript Allongé, The "Six" Edition][ja6]. The extracts so far:

* [Partial Application in ECMAScript 2015](http://raganwald.com/2015/04/01/partial-application.html),
* [The Symmetry of JavaScript Functions](http://raganwald.com/2015/03/12/symmetry.html),
* [Lazy Iterables in JavaScript](http://raganwald.com/2015/02/17/lazy-iteratables-in-javascript.html),
* [The Quantum Electrodynamics of Functional JavaScript](http://raganwald.com/2015/02/13/functional-quantum-electrodynamics.html),
* [Tail Calls, Default Arguments, and Excessive Recycling in ES-6](http://raganwald.com/2015/02/07/tail-calls-defult-arguments-recycling.html), and:
* [Destructuring and Recursion in ES-6](http://raganwald.com/2015/02/02/destructuring.html).

Your [feedback](https://github.com/raganwald/raganwald.github.com/issues/new) improves the book for everyone, thank you!

[ja6]: https://leanpub.com/b/buyjavascriptallongthesixeditiongetjavascriptallongfree
