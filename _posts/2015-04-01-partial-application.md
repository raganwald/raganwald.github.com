---
title: "Partial Application in ECMAScript 2015"
layout: default
tags: javascript
published: true
---

*Some of this material originally appeared in [What's the difference between Currying and Partial Application?](http://raganwald.com/2013/03/07/currying-and-partial-application.html) Here it is again, in ECMAScript 2015 syntax.*

---
 
What is [Partial Application][partial application]? Good question!

[partial application]: https://en.wikipedia.org/wiki/Partial_application

### arity

Before we jump in, let's get some terminology straight. Functions have *arity*, meaning the number of arguments they accept. A "unary" function accepts one argument, a "polyadic" function takes more than one argument. There are specialized terms we can use: A "binary" function accepts two, a "ternary" function accepts three, and you can rustle about with greek or latin words and invent names for functions that accept more than three arguments.

(Some functions accept a variable number of arguments, we call them *variadic*, although variadic functions and functions taking no arguments aren't our primary focus in this essay.)

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