---
title: "Before you copy that code..."
layout: default
tags: allonge, noindex
---

This blog includes a lot of code examples. The vast majority have been tested and work as advertised. But before you copy anything and paste it into a production code base, consider the following:

This is a blog about software development in general. Although a particular post might be titled "Fooing with Bar in JavaScript," it's not about JavaScript: It's about `Foo`. And `Bar`. And it just *happens* to be written in JavaScript, because JavaScript is widely-understood language with a set of features that make explaining many things straightforward.

[![Copy Machine Operator](/assets/images/copy-machine-operator.jpg)](https://www.flickr.com/photos/wonderlane/3234368267)

Therefore, the code examples you find here are almost always going to focus on being a clear example of certain principles. This can be at the expense of writing code that is fast, or that is going to be familiar to programmers who don't care about the principles being illustrated.

Another issue is that production code often has to cover a number of use cases that may seem rare, but given a large enough audience, somebody cares about every case, no matter how "rare." Thus, a production implementation of a higher-order function might handle generators, methods, getters, setters, replicate a function's arity, and more.

Whereas for the purpose of illustration, a snippet of code here might simply be written as:

{% highlight javascript %}
const maybe = (fn) =>
  (...args) => {
    for (let arg of args) {
      if (arg == null) return arg;
    }
    return fn(...args);
  }
{% endhighlight %}

This implementation omits consideration of everything except for showing the idea behind a combinator. Extending it to handle methods, or explaining how a stateful combinator would work, or dealing with arity, are all ignored. And the performance implications of using `for(let arg of args)` is not a consideration.

So...

Before you copy code you find here, ask yourself if it wouldn't be easier to take a moment and look for an existing library that does what you want, and has been tested in the field. Wouldn't that be *even easier*?

---

