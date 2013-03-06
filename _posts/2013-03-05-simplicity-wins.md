---
title: Simplicity Wins
layout: tactile
published: false
---

(This post is my first crack at some material I'd like to try out during a lightning talk at some point.)

In [Combinator Recipes for Working With Objects in JavaScript](/2012/12/01/combinators-in-js.html), we had a look at `splat`, a recipe for applying a function to each element in a list. To whit:

{% highlight javascript %}
function splat (fn) {
  return function (list) {
    return Array.prototype.map.call(list, fn);
  };
};
{% endhighlight %}

Splat works a lot like `Array.prototype.map`, but instead of being a function that takes two or three arguments and produces a result, it's a *combinator* that takes a unary function and returns a mapper function that applies your function to every element of an array.

For example:

{% highlight javascript %}
var squares = splat(function (n) { return n*n; });

squares([1, 2, 3, 4, 5]);
  //=> 1
  //   4
  //   9
  //   16
  //   25
{% endhighlight %}

If we think of splat as a specialization of map, we get something interesting: Splat is a *partial application* of map. Meaning, map takes two arguments[^maparity], and we convert it into a function that takes one argument by applying one of the arguments.

[^maparity]: Technically, either two or three in JavaScript, but we're ignoring contexts in this article, so we only care about two of them.

So there's this idea that if we have a function taking two arguments, we apply one argument and end up with a function that takes just one argument:

fn<sub>2</sub> + arg<sub>1</sub> -> fn<sub>1</sub>