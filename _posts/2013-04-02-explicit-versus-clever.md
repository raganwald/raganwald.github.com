---
layout: default
title: Explicit vs. Clever
tags: [allonge, LiSP]
---

*Revised to change some of the nomenclature!*

> "Proud to say I work with a team of developers who value explicit code over clever code"--[Michael R. Bernstein](https://twitter.com/mrb_bk/status/319127230905208832)

Me too! And if we are all thinking the exact same thing when we read or write the words "explicit" and "clever," there is nothing else to say on the subject. But consider this piece of code in JavaScript:

{% highlight javascript %}
var mapWith = require('allong.es').mapWith,
    attrWith = require('allong.es').attrWith;

var totaller = mapWith(attrWith('total'));

// ...

var orderTotals = totaller(orders);
{% endhighlight %}

`mapWith(attrWith('total'))` is not explicit if your knowledge of JavaScript is limited to the syntax, semantics, and standard libraries. To understand it, you need to know that `mapWith` is a function that produces a `map`, that `attrWith` turns a string into a property accessor, and you need to know enough about functional programming to know what a map is, or be able to relate it to `Array.prototype.map`.

If you're working all those out for the first time, it probably seems inordinately clever and an exercise in wankery.

On the other hand, if you do think in terms of Higher-Order Functions ("HOFs"), `mapWith` is a small incremental improvement on `.map`, and it's also a variation on this code that uses the deservedly popular [Underscore](http://underscorejs.org) library:[^pluck]

{% highlight javascript %}
var _ = require('underscore');

var orderTotals = _.pluck(orders, 'total');
{% endhighlight %}

[^pluck]: So why not use `_.pluck`? It's even simpler! The benefit of `mapWith` and `attrWith` when used consistently in a codebase is that they *compose* very nicely because they're written to take a single value as an argument and return a function. `mapWith` and `attrWith` are shown here to illustrate the opacity of jargon to those who are not immersed in its culture. In actual fact, the `allong.es` library does include its own version of pluck, and the definition is a one-liner: `var pluck = compose(mapWith, attrWith)`.

### jargon

 `mapWith` is the self-curried right partial application of the `map` function. If that seems like gobbledegook to you, it's because I'm using *jargon*.

Here's the jargon in JavaScript:

{% highlight javascript %}
var applyLast = require('allong.es').applyLast,
    map = require('underscore').map;
    
var mapWith = applyLast(map);
{% endhighlight %}

I'll say that again in JavaScript, this time explicitly:

{% highlight javascript %}
function map (list, fn) {
  return Array.prototype.map.call(list, fn);
};

function mapWith (fn) {
  return function (list) {
    return map(list, function (something) {
      return fn(something) 
    });
  };
};
{% endhighlight %}

Is the second, most explicit form better? *Yes* when you're learning about HOFs in JavaScript, but quite possibly *no* when you're encountering a similar pattern for the twelfth time in the same code base, each time written out slightly differently, and one of them has a bug because the person writing it out was on their fourteenth straight hour programming things like this explicitly.

And of course, there's no point in having *inconsistent* jargon, or one-offs here and there in a code base. Jargon is only a win when it's used consistently.

### jargon is not clever, and it's also not abstraction

An abstraction is a construct designed to separate implementation from contracted behaviour. If `map` happens to be implemented as an iteration, that is an implementation detail. Programmers are not expected to write programs that presume that side-effects will be executed in strict order.

The point of an abstraction is to relieve the programmer of thinking about the implementation and to give the implementors freedom to experiment with other implementations. Perhaps `map` will one day evaluate in parallel, who knows?

Jargon, on the other hand, is simply a shortcut to save time and to eliminate errors in transcription. `forEach` is more jargon than `map`, in that its main purpose is to eliminate off-by-one errors.

Abstraction is also not clever. It may be a good abstraction or a poor one, it may leak or be opaque, but abstraction in and of itself is not clever. Mind you, you can't just throw abstractions into code for the sheer pleasure of baking a layer cake.

> Every problem can be solved by adding another layer of abstraction, except for the problem of coding in Java.

Poorly chosen abstractions or rampant over-abstractions are problems, of course, but they are hardly "clever," they're just poorly chosen. Abstractions are a win when either of two things occur:

1. The effort to learn the abstraction is an order of magnitude less than the effort to reproduce the underlying mechanism, or;
2. You have correctly predicted in advance that the implementation will need to change and can do so without breaking the rest of the application.

Something like `map` can be said to be an abstraction that attempts to win via the first metric: Using `map` is all about not writing `for` loops everywhere.

Something like ActiveRecord can be said to be an abstraction that attempts to win via the second metric as well: Many large projects do have different databases in development than in production, or change database horses mid-project. Since the code is written against ActiveRecord's interface, it does not need to change.

### so, when is something explicit and when is it clever?

Clearly, "explicit" and "clever" are not a dichotomy. Code that is not explicit may be jargon. Or it may be an abstraction. And yes, it may also be too clever for its own good.

(discuss on [/r/javascript](http://www.reddit.com/r/javascript/comments/1bl24h/explicit_vs_clever/))

---

notes: