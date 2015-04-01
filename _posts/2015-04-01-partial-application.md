---
title: "Partial Application in ECMAScript 2015"
layout: default
tags: javascript
published: true
---



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
