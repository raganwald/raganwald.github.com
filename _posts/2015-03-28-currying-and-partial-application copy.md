---
title: What's the difference between Currying and Partial Application in ECMAScript 2015?
layout: default
tags: javascript
published: false
---

*[This post was originally written in 2013](http://raganwald.com/2013/03/07/currying-and-partial-application.html). Here it is again, in ECMAScript 2015 syntax.*

---
 
I was participating in [wroc_love.rb] last week-end, and [Steve Klabnik](http://steveklabnik.com) put up a slide mentioning [partial application] and [currying]. "The difference between them is not important right now," he said, pressing on. And it wasn't.

[partial application]: https://en.wikipedia.org/wiki/Partial_application
[currying]: https://en.wikipedia.org/wiki/Currying
[wroc_love.rb]: http://wrocloverb.com

But here we are, it's a brand new day, and we've already read five different explanations of `this` and closures this week, but only three or four about currying, so let's get into it.

### arity

Before we jump in, let's get some terminology straight. Functions have *arity*, meaning the number of arguments they accept. A "unary" function accepts one argument, a "polyadic" function takes more than one argument. There are specialized terms we can use: A "binary" function accepts two, a "ternary" function accepts three, and you can rustle about with greek or latin words and invent names for functions that accept more than three arguments.

Some functions accept a variable number of arguments, we call them *variadic*, although variadic functions and functions taking no arguments aren't our primary focus in this essay.

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

{% highlight javascript %}
const leftPartialApply =
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

### currying

First up, we can write a function that returns a wrapper function. Sticking with binary function, we start with this:

{% highlight javascript %}
function wrapper (unaryFn) {
  return function (list) {
    return map(list, unaryFn);
  };
};
{% endhighlight %}

Rename `map` and the two arguments:

{% highlight javascript %}
function wrapper (secondArg) {
  return function (firstArg) {
    return binaryFn(firstArg, secondArg);
  };
};
{% endhighlight %}

And now we can wrap the whole thing in a function that takes `binaryFn` as an argument:

{% highlight javascript %}
function rightmostCurry (binaryFn) {
  return function (secondArg) {
    return function (firstArg) {
      return binaryFn(firstArg, secondArg);
    };
  };
};
{% endhighlight %}

So now we've 'abstracted' our little pattern. We can use it like this:

{% highlight javascript %}
var rightmostCurriedMap = rightmostCurry(map);

var squareAll = rightmostCurriedMap(square);

squareAll([1, 4, 9]);
  //=> [1, 4, 9]
squareAll([5, 7, 5]);
  //=> [25, 49, 25]
{% endhighlight %}

Converting a polyadic function into a nested series of unary functions is called **currying**, after Haskell Curry, who popularized the technique. He actually rediscovered the combinatory logic work of [Moses Schönfinkel][moses], so we could easily call it "schönfinkeling."[^birds]

[moses]: https://en.wikipedia.org/wiki/Moses_Schönfinkel
[^birds]: When Raymond Smullyan wrote his seminal introduction to combinatory logic, he called it "To Mock a Mockingbird" and used forests of birds as his central metaphor to pay tribute to Schönfinkel. Schön means "beautiful" and Fink means "finch" in German, although Finkl may be Yiddish for "sparkle." So his name may mean "beautiful finch," or it may mean "beautiful sparkle."

Our `rightmostCurry` function curries any binary function into a chain of unary functions starting with the second argument. This is a "rightmost" curry because it starts at the right.

The opposite order would be a "leftmost" curry. Most logicians work with leftmost currying, so when we write a leftmost curry, most people just call it "curry:"

{% highlight javascript %}
function curry (binaryFn) {
  return function (firstArg) {
    return function (secondArg) {
      return binaryFn(firstArg, secondArg);
    };
  };
};

var curriedMap = curry(map),
    double = function (n) { return n + n; };

var oneToThreeEach = curriedMap([1, 2, 3]);

oneToThreeEach(square);
  //=> [1, 4, 9]
oneToThreeEach(double);
  //=> [2, 4, 6]
{% endhighlight %}

When would you use a regular curry and when would you use a rightmost curry? It really depends on your usage. In our binary function example, we're emulating a kind of subject-object grammar. The first argument we want to use is going to be the subject, the second is going to be the object.

So when we use a rightmost curry on `map`, we are setting up a "sentence" that makes the mapping function the subject.

So we read `squareAll([1, 2, 3])` as "square all the elements of the array [1, 2, 3]." By using a rightmost curry, we made "squaring" the subject and the list the object. Whereas when we used a regular curry, the list became the subject and the mapper function became the object.

Another way to look at it that is a little more like "patterns and programming" is to think about what you want to name and/or reuse. Having both kinds of currying lets you name and/or reuse either the mapping function or the list.

### partial application

So many words about currying! What about "partial application?" Well, if you have currying you don't need partial application. And conversely, if you have partial application you don't need currying. So when you write this kind of essay, it's easy to spend a lot of words describing one of these two things and then explain everything else on top of what you already have.

Let's look at our rightmost curry again:

{% highlight javascript %}
function rightmostCurry (binaryFn) {
  return function (secondArg) {
    return function (firstArg) {
      return binaryFn(firstArg, secondArg);
    };
  };
};
{% endhighlight %}

You might find yourself writing code like this over and over again:

{% highlight javascript %}
var squareAll = rightmostCurry(map)(square),
    doubleAll = rightmostCurry(map)(double);
{% endhighlight %}

This business of making a rightmost curry and then immediately applying an argument to it is extremely common, and when something's common we humans like to name it. And it has a name, it's called a *rightmost unary partial application of the map function*.

What a mouthful. Let's take it step by step:

1. rightmost: From the right.
2. unary: One argument.
3. partial application: Not applying all of the arguments.
4. map: To the map function.

So what we're really doing is applying one argument to the map function. It's a binary function, so that means what we're left with is a unary function. Again, functional languages and libraries almost always include a first-class function to do this for us.

We *could* build one out of a rightmost curry:

{% highlight javascript %}
function rightmostUnaryPartialApplication (binaryFn, secondArg) {
  return rightmostCurry(binaryFn)(secondArg);
};
{% endhighlight %}

However it is usually implemented in more direct fashion:[^caveat]

{% highlight javascript %}
function rightmostUnaryPartialApplication (binaryFn, secondArg) {
  return function (firstArg) {
    return binaryFn(firstArg, secondArg);
  };
};
{% endhighlight %}

[^caveat]: All of our implementations are grossly simplified. Full implementations can handle polyadic functions with more than two arguments and are context-agnostic.

`rightmostUnaryPartialApplication` is a bit much, so we'll alias it `applyLast`:

{% highlight javascript %}
var applyLast = rightmostUnaryPartialApplication;
{% endhighlight %}

And here're our `squareAll` and `doubleAll` functions built with `applyLast`:

{% highlight javascript %}
var squareAll = applyLast(map, square),
    doubleAll = applyLast(map, double);
{% endhighlight %}

You can also make an `applyFirst` function (we'll skip calling it "leftmostUnaryPartialApplication"):

{% highlight javascript %}
function applyFirst (binaryFn, firstArg) {
  return function (secondArg) {
    return binaryFn(firstArg, secondArg);
  };
};
{% endhighlight %}

As with leftmost and rightmost currying, you want to have both in your toolbox so that you can choose what you are naming and/or reusing.

### so what's the difference between currying and partial application?

"Currying is the decomposition of a polyadic function into a chain of nested unary functions. Thus decomposed, you can partially apply one or more arguments,[^also] although the curry operation itself does not apply any arguments to the function."

"Partial application is the conversion of a polyadic function into a function taking fewer arguments arguments by providing one or more arguments in advance."

### is that all there is?

Yes. And no. Here are some further directions to explore on your own:

1. We saw how to use currying to implement partial application. Is it possible to use partial application to implement currying? Why? Why not?[^tao]
2. All of our examples of partial application have concerned converting binary functions into unary functions by providing one argument. Write more general versions of `applyFirst` and `applyLast` that provide one argument to any polyadic function. For example, if you have a function that takes four arguments, `applyFirst` should return a function taking three arguments.
3. When you have `applyFirst` and `applyLast` working with all polyadic functions, try implementing `applyLeft` and `applyRight`: `applyLeft` takes a polyadic function and one *or more* arguments and leftmost partially applies them. So if you provide it with a ternary function and two arguments, it should return a unary function. `applyRight` does the same with rightmost application.
4. Rewrite curry and rightmostCurry to accept any polyadic function. So just as a binary function curries into two nested unary functions, a ternary function should curry into three nested unary functions and so on.
5. Review the source code for [allong.es], the functional programming library extracted from [JavaScript Allongé][ja], especially [partial_application.js][pa].

Thanks for reading, if you discover a bug in the code, please either [fork the repo][repo] and submit a pull request, or [submit an issue on Github][issue].

p.s. Another essay you might find interesting: [Practical Applications of Partial Application](http://raganwald.com/2013/01/05/practical-applications-of-partial-application.html).

([discuss](http://www.reddit.com/r/javascript/comments/19urej/whats_the_difference_between_currying_and_partial/))

---

notes:

[^tao]: A Taoist ordered a vegetarian hot dog from a street vendor: "Make me one with everything," he requested politely.
[^also]: There are a lot of other reasons to curry functions, but this is an article about the relationship between currying and partial application, not an introduction to combinatory logic and functional programming :-)
[allong.es]: http://allong.es
[ja]: http://leanpub.com/javascript-allonge
[pa]: https://github.com/raganwald/allong.es/blob/master/lib/partial_application.js
[repo]: https://github.com/raganwald/raganwald.github.com
[issue]: https://github.com/raganwald/raganwald.github.com/issues
