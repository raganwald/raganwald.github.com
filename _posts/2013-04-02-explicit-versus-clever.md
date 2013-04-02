---
layout: default
tags: [programming, effectivejs]
---

> "Proud to say I work with a team of developers who value explicit code over clever code"--[Michael R. Bernstein](http://michaelrbernste.in)

Me too! And if we are all thinking the exact same thing when we read or write the words "explicit" and "clever," there is nothing else to say on the subject. But consider this piece of code in JavaScript:

{% highlight javascript %}
var splat = require'allong.es').splat;

var totals = splat('total')(orders);
{% endhighlight %}

`splat('total')(orders)` is not explicit if your knowledge of JavaScript is limited to the syntax, semantics, and standard libraries. To understand it, you need to know that `splat` is a function that produces a `flatMap`, and you need to know enough about functional programming to know what a flatMap is, or be able to relate it to `Array.prototype.map`.

If you're working all those out for the first time, it probably seems inordinately clever and an exercise in wankery.

On the other hand, if you do think in terms of Higher-Order Functions ("HOFs"), `splat` is a small incremental improvement on `map`, and a variation on this code that uses the deservedly popular [Underscore](http://underscorejs.org) library:

{% highlight javascript %}
var _ = require('underscore');

var totals = _.pluck(orders, 'total');
{% endhighlight %}

And by "variation," I really do mean variation. `splat` is a composition of `get` with the left partial application of `map` to the right partial application function. If that seems like gobbledegook to you, it's because I'm using *jargon*.

I'll say that again, explicitly:

{% highlight javascript %}
function get (propertyName) {
  return function (object) {
    return object[propertyName];
  }
};

function splat (propertyName) {
  var getter = get(propertyName);
  
  return function (mappable) {
    return mappable.map(getter);
  }
};
{% endhighlight %}

Is that better? Yes when you're learning about HOFs in JavaScript, but quite possibly no when you're encountering the same pattern for the twelfth time in  code base, each time written out slightly differently, and one of them has a bug because the person writing it out was on their fourteenth straight hour programming things like this explicitly.

Technicians who work in a homogenous culture use jargon as a form of compression. Jargon is not clever, it is simply unfamiliar to those not immersed in its culture. Being "explicit" instead of using "jargon" is appropriate for audiences who are simultaneously unfamiliar with the jargon and unwilling to learn it.

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

Clearly, "explicit" and "clever" are not a dichotomy. Code that is not "explicit" may be jargon. Or it may be an abstraction. And yes, it may also be too clever for its own good.