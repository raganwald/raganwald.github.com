---
layout: default
title: "It's a Mad, Mad, Mad, Mad World: Scoping in CoffeeScript and JavaScript"
tags: [javascript, coffeescript]
---

> "I've been mad for fucking years, absolutely years, been over the edge for yonks, been working me buns off for bands..."

> "I've always been mad, I know I've been mad, like the most of us...very hard to explain why you're mad, even if you're not mad..."

>--"Speak to Me," Nick Mason

### coffeescript

CoffeeScript, as many people know, is a transpile-to-JavaScript language.[^trans] For the most part, it does not introduce major changes in semantics. For example, this:

{% highlight coffeescript %}
-> 'Hello, world'
{% endhighlight %}

Transpiles directly to:

{% highlight javascript %}
function () { return 'Hello, world'; }
{% endhighlight %}

This is convenient syntactic sugar, and by removing what some folks call the "syntactic vinegar" of extraneous symbols, it encourages the use of constructs that would otherwise make the code noisy and obscure the important meaning. The vast majority of features introduced by CoffeeScript are of this nature: They introduce local changes that transpile directly to JavaScript.[^rewrite]

[^trans]: Yes, "transpile" is a real word, or at least, a real piece of jargon. It's a contraction of "transcompiler," which is a compiler that translates one language to another language at a similar level of abstraction. There's room for debate over what constitutes a "similar level of abstraction." [https://en.wikipedia.org/wiki/Source-to-source_compiler](https://en.wikipedia.org/wiki/Source-to-source_compiler)

[^rewrite]: There are other possibilities: You could write a Tail-Call Optimized language that transpiles to JavaScript, however its changes wouldn't always be local: Some function calls would be rewritten substantially to use trampolining. Or adding continuations to a language might cause everything to be rewritten in continuation-passing style.

CoffeeScript also introduces features that don't exist in JavaScript, such as destructuring assignment and comprehensions. In each case, the features compile directly to JavaScript without introducing changes elsewhere in the program. And since they don't look like existing JavaScript features, little confusion is created.

### equals doesn't equal equals

One CoffeeScript feature does introduce confusion, and the more you know JavaScript the more confusion it introduces. This is the behaviour of the assignment operator, the lowly (and prevalent!) equals sign:

{% highlight coffeescript %}
foo = 'bar'
{% endhighlight %}
    
Although it *looks* almost identical to assignment in JavaScript:

{% highlight javascript %}
foo = 'bar';
{% endhighlight %}
    
It has *different semantics*. That's confusing. Oh wait, it's worse than that: *Sometimes* it has different semantics. Sometimes it doesn't.

**So what's the deal with that?**

Well, let's review the wonderful world of JavaScript. We'll pretend we're in a browser application, and we write:

{% highlight javascript %}
foo = 'bar';
{% endhighlight %}
    
What does this mean? Well, *it depends*: If this is in the top level of a file, and not inside of a function, then `foo` is a *global variable*. In JavaScript, global means global across all files, so you are now writing code that is coupled with every other file in your application or any vendored code you are loading.

But what if it's inside a function?

{% highlight javascript %}
function fiddleSticks (bar) {
  foo = bar;
  // ...
}
{% endhighlight %}

For another example, many people enclose file code in an Immediately Invoked Function Expression ("IIFE") like this:

{% highlight javascript %}
;(function () {
  foo = 'bar'
  // more code...
})();
{% endhighlight %}
    
What do `foo = 'bar';` or `foo = bar;` mean in these cases? Well, *it depends* as we say. It depends on whether `foo` is *declared* somewhere else in the same scope. For example:

{% highlight javascript %}
function fiddleSticks (bar) {
  var foo;
  foo = bar;
  // ...
}
{% endhighlight %}

Or:

{% highlight javascript %}
function fiddleSticks (bar) {
  foo = bar;
  // ...
  var foo = batzIndaBelfrie;
  // ...
} 
{% endhighlight %}
    
Or even:

{% highlight javascript %}
function fiddleSticks (bar) {
  foo = bar;
  // ...
  function foo () {
    // ...
  }
  // ...
}
{% endhighlight %}
    
Because of something called hoisting,[^hoist] these all mean the same this: `foo` is local to function `fiddleSticks`, and therefore it is NOT global and ISN'T magically coupled to every other file loaded whether written by yourself or someone else.

