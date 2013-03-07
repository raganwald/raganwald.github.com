---
title: What's the difference between Partial Application and Currying?
layout: default
ad: javascript-allonge
publish: false
---

*And: Why does it really matter?*

I was participating in [wroc_love.rb] last week-end, and one of the presenters put up a slide mentioning [partial application] and [currying]. "The difference between them is not important right now," he said, and pressed on. And it wasn't.

[partial application]: https://en.wikipedia.org/wiki/Partial_application
[currying]: https://en.wikipedia.org/wiki/Currying
[wroc_love.rb]: http://wrocloverb.com

But here we are, it's a brand new day, and we've already read five different explanations of `this` and closures this week, but only three or four about currying, so let's get into it.

### arity

Before we jump in, let's get some terminology straight. Functions have *arity*, meaning the number of arguments they accept. A "unary" function accepts one argument, a "polyary" function takes more than one argument. There are specialized terms we can use: A "binary" function accepts two, a "ternary" function accepts three, and you can rustle about with greek or latin words and invent names for functions that accept more than three arguments. I often use *n-ary* notation for such functions, as in "7-ary" rather than "heptary."

Some functions accept a variable number of arguments, we call them *variadic*, although variadic functions and functions taking no arguments aren't our primary focus in this essay.

### partial application

Partial application is straightforward. We could start with addition or some such completely trivial example, but if you don't mind we'll have a look at something from the [allong.es] JavaScript library that is of actual use in daily programming.

[allong.es]: http://allong.es

As a preamble, let's make ourselves a `map` function that maps another function over a list:

{% highlight javascript %}
var __map = [].map;

function map (list, unaryFn) {
  return __map.call(list, unaryFn);
};

function square (n) {
  return n * n;
};

map([1, 2, 3], square);
  //=> [1, 4, 9]
{% endhighlight %}

`map` is obviously a binary function, `square` is a unary function. When we called `map` with arguments `[1, 2, 3]` and `square`, we *applied* the arguments to the function and got our result.

Since `map` takes two arguments, and we supplied two arguments, we *fully applied* the arguments to the function. So what's partial application? Supplying fewer arguments. Like supplying one argument to `map`.

Now what happens if we supply one argument to `map`? We can't get a result without the other argument, so what we get back is a unary function that takes the other argument and produces the result we want.

If we're going to apply one argument to `map`, let's make it the `unaryFn`. We'll start with the end result and work backwards. First thing we do, is set up a wrapper around map:

{% highlight javascript %}
function mapWrapper (list, unaryFn) {
  return map(list, unaryFn);
};
{% endhighlight %}

Now we'll \_\_\_\_\_\_ our wrapper, breaking it into two nested functions that each take one function:

{% highlight javascript %}
function mapWrapper (unaryFn) {
  return function (list) {
    return map(list, unaryFn);
  };
};
{% endhighlight %}

Now we can supply our arguments one at a time:

{% highlight javascript %}
mapWrapper(square)([1, 2, 3]);
  //=> [1, 4, 9]
{% endhighlight %}

Instead of a binary map function that returns our result, we now have a unary function that returns a unary function that returns our result. So where's the partial application? Let's get our hands on the second unary function:

{% highlight javascript %}
var squareAll = mapWrapper(square);
  //=> [function]

squareAll([1, 4, 9]);
  //=> [1, 4, 9]
squareAll([5, 7, 5]);
  //=> [25, 49, 25]
{% endhighlight %}

We've just partially applied the value `square` to the function `map`. We got back a unary function, `squareAll`, that we could use as we liked. Partially applying `map` in this fashion is handy, so much so that the [allong.es] library includes a function called `splat` that does this exact thing.

[allong.es]: http://allong.es

If we had to physically write ourselves a wrapper function every time we want to do some partial application, we'd never bother. Being programmers though, we can automate this. There are two ways to do it.

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
function rightCurry (binaryFn) {
  return function (secondArg) {
    return function (firstArg) {
      return binaryFn(firstArg, secondArg);
    };
  };
};
{% endhighlight %}

So now we've 'abstracted' our little pattern. We can use it like this:

{% highlight javascript %}
var curriedMap = rightCurry(map);

var squareAll = curriedMap(square);

squareAll([1, 4, 9]);
  //=> [1, 4, 9]
squareAll([5, 7, 5]);
  //=> [25, 49, 25]
{% endhighlight %}

Converting a polyary function into a nested series of unary functions is called **currying**, after Haskell Curry, who popularized the technique. He actually rediscovered the combinatory logic work of [Moses Schönfinkel][moses], so we could easily call it "schönfinkeling."[^birds]

[moses]: https://en.wikipedia.org/wiki/Moses_Schönfinkel
[^birds]: When Raymond Smullyan wrote his seminal introduction to combinatory logic, he called it "To Mock a Mockingbird" and used forests of birds as his central metaphor to pay tribute to Schönfinkel, whose name means "Beautiful Bird" in German.

### partial application

