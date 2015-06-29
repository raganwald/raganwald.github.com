---
title: "Method Decorators in ECMAScript 2015 (and beyond)"
layout: default
tags: allonge
---

Writing [higher-order functions][hof] in JavaScript is a long-established practice:

> A higher-order function is a function that takes one or more functions as arguments, returns a function, or both.

For example, `compose` is a higher-order function that takes two functions as arguments, and returns a function that represents the composition of the arguments:

{% highlight javascript %}
const compose = (a, b) => (c) => a(b(c));
{% endhighlight %}

[hof]: https://en.wikipedia.org/wiki/Higher-order_function

A particularly interesting subset of higher-order functions are higher-order functions that *decorate* a function. "Function Decorators" take a function as and argument, and return a new function that has semantically similar behaviour, but is "decorated" with some additional functionality.

For example, this very simple `maybe` function is a function decorator. It takes a function as an argument, and returns a version of that function that returns `undefined` or `null` (without any side-effects) if any of its arguments are `undefined` or `null`:

{% highlight javascript %}
const maybe = (fn) =>
  (...args) => {
    for (let arg of args) {
      if (arg == null) return arg;
    }
    return fn(...args);
  }

[1, null, 3, 4, null, 6, 7].map(maybe(x => x * x))
  //=> [1,null,9,16,null,36,49]
{% endhighlight %}

A similar decorator, `requireAll`, raises an exception if a function is invoked without at least as many arguments as declared parameters:

{% highlight javascript %}
const requireAll = (fn) =>
  function (...args) {
    if (args.length < fn.length)
      throw new Error('missing required arguments');
    else
      return fn(...args);
  }
{% endhighlight %}

[![Messerschmidt](/assets/images/messerschmidt.jpg)](https://www.flickr.com/photos/31265723@N04/8619634268)

### simple method decoration

As noted in [The Symmetry of JavaScript Functions][1], these simple decorators work and work well for ordinary functions. But in JavaScript, functions can be invoked in different ways, and some of those ways are slightly incompatible with each other.

[1]: /2015/03/12/symmetry.html

Of great interest to us are *methods* in JavaScript, functions that are used to define the behaviour of instances. When a function is invoked as a method, the name `this` is bound to the instance, and most methods rely on that binding to work properly.

Consider, for example `Person`:

{% highlight javascript %}
class Person {
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }
  fullName () {
    return this.firstName + " " + this.lastName;
  }
};

const thinker = new Person()
                  .setName('Albert', 'Einstein');

thinker.fullName()
  //=> 'Albert Einstein'

thinker.setName('Marie', 'Curie');

thinker.fullName()
  //=> 'Marie Curie'
{% endhighlight %}

The `setName` method is a function. Let's see what happens if we try to decorate it with `requireAll`:

{% highlight javascript %}
Object.defineProperty(Person.prototype, 'setName', { value: requireAll(Person.prototype.setName) });

const thinker = new Person()
                  .setName('Albert', 'Einstein');
  //=> Attempted to assign to readonly property.
{% endhighlight %}

WTF!?

After some inspection, we realize the problem: Before we decorated it, `setName` was invoked as a method, and thus `this` was bound to the `thinker` instance. But once wrapped in `requireAll`, our `setName` function is now invoked as an ordinary function with the line `return fn(...args);`, so `this` is set to the wrong thing.

If we want to use `requireAll` with methods, we have to write it in such a way that it preserves `this` when it invokes the underlying function:

{% highlight javascript %}
const requireAll = (fn) =>
  function (...args) {
    if (args.length < fn.length)
      throw new Error('missing required arguments');
    else
      return fn.apply(this, args);
  }

const thinker = new Person()
                  .setName('Prince');
  //=> missing required arguments
{% endhighlight %}

It now works properly, including ignoring invocations that do not pass all the arguments. But you have to be very careful when writing higher-order functions to make sure they work as both function decorators and as method decorators.

### the problem with stateful method decorators

Handling `this` properly is not the only way in which ordinary function decorators differ from method decorators. Some decorators are stateful, like `once`. Here's a version that correctly sets `this`:

{% highlight javascript %}
const once = (fn) => {
  let hasRun = false;

  return function (...args) {
    if (hasRun) return;
    hasRun = true;
    return fn.apply(this, args);
  }
}
{% endhighlight %}

Imagining for a moment that we wish to only allow a person to have their name set once, we might write:

{% highlight javascript %}
const once = (fn) => {
  let hasRun = false;

  return function (...args) {
    if (hasRun) return;
    hasRun = true;
    return fn.apply(this, args);
  }
}

class Person {
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }
  fullName () {
    return this.firstName + " " + this.lastName;
  }
};

Object.defineProperty(Person.prototype, 'setName', { value: once(Person.prototype.setName) });

const logician = new Person()
                   .setName('Raymond', 'Smullyan')
                   .setName('Haskell', 'Curry');

logician.fullName()
  //=> Raymond Smullyan
{% endhighlight %}

As we expect, only the first call to `.setName` has any effect, and it works on a method. But there is a subtle bug that could easily evade naïve attempts to write unit tests:

{% highlight javascript %}
const logician = new Person()
                   .setName('Raymond', 'Smullyan');

const musician = new Person()
                   .setName('Miles', 'Davis');

logician.fullName()
  //=> Raymond Smullyan

musician.fullName()
  //=> Raymond Smullyan
{% endhighlight %}

!?!?!?!

What has happened here is that when we write `Object.defineProperty(Person.prototype, 'setName', { value: once(Person.prototype.setName) });`, we wrapped a function bound to `Person.prototype`. That function is shared between all instances of `Person`. That's deliberate, it's the whole point of prototypical inheritance (and the "class-based inheritance" JavaScript builds with prototypes).

Since our `once` decorator returns a decorated function with private state (the `hasRun` variable), all the instances share the same private state, and thus the bug.

### stateful method decorators

If we don't need to use the same decorator for functions and for methods, we can rewrite our decorator to use a [WeakSet] to track whether a method has been invoked for an instance:

[WeakSet]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet

{% highlight javascript %}
const once = (fn) => {
  let invocations = new WeakSet();

  return function (...args) {
    if (invocations.has(this)) return;
    invocations.add(this);
    return fn.apply(this, args);
  }
}

const logician = new Person()
                   .setName('Raymond', 'Smullyan');

logician.setName('Haskell', 'Curry');

const musician = new Person()
                   .setName('Miles', 'Davis');

logician.fullName()
  //=> Raymond Smullyan

musician.fullName()
  //=> Miles Davis
{% endhighlight %}

Now each instance stores whether `.setName` has been invoked on each instance a `WeakSet`, so `logician` and `musician` can share the method without sharing its state.

### incompatibility

To handle methods, we have introduced "accidental complexity" to handle `this` and to handle state. Worse, our implementation of `once` for methods won't work properly with ordinary functions in "strict" mode:

{% highlight javascript %}
"use strict"

const hello = once(() => 'hello!');

hello()
  //=> undefined is not an object!
{% endhighlight %}

If you haven't invoked it as a method, `this` is bound to `undefined` in strict mode, and `undefined` cannot be added to a `WeakSet`.

Correcting our decorator to deal with `undefined` is straightforward:

{% highlight javascript %}
const once = (fn) => {
  let invocations = new WeakSet(),
      undefinedContext = Symbol('undefined-context');

  return function (...args) {
    const context = this === undefined
                    ? undefinedContext
                    : this;
    if (invocations.has(context)) return;
    invocations.add(context);
    return fn.apply(this, args);
  }
}
{% endhighlight %}

However, we're adding more accidental complexity to handle the fact that function invocation is <span style="color: blue;">blue</span>, and method invocation is <span style="color: #999900;">khaki</span>.[^colours]

[^colours]: See the aforelinked [The Symmetry of JavaScript Functions](/2015/03/12/symmetry.html)

In the end, we can either write specialized decorators designed specifically for methods, or tolerate the additional complexity of trying to handle method invocation and function invocation in the same decorator.

### summary

Function decorators can be used as method decorators, provided that we take care to handle `this` properly and manage state carefully. If we're using a transpilation tool, we may also choose to use ES7 method decorator syntax, although it is not required.

---

[![XFJ 022](/assets/images/xfj022.jpg)](https://www.flickr.com/photos/gi/199083883)

### bonus: method decorators in ES7

Before ECMAScript 2015 (a/k/a "ES6"), we decorated a method in a simple an direct way. Here's roughly how we used to write `Person`, using a pseudo-private property pattern:

{% highlight javascript %}
const once = (fn) => {
  let hasRunValue = false,
      hasRunProperty = "hasRun-" + fn.name + "-" + new Date().getTime();

  return function (...args) {
    if (this == null) {
      if (hasRunValue) return;
      hasRunValue = true;
    }
    else {
      if (this[hasRunProperty]) return;
      Object.defineProperty(this, hasRunProperty, { value: true });
    }
    return fn.apply(this, args);
  }
}

var Person = function () {};

Person.prototype.setName = once(function setName (first, last) {
  this.firstName = first;
  this.lastName = last;
  return this;
});

Person.prototype.fullName = function fullName () {
  return this.firstName + " " + this.lastName;
};
{% endhighlight %}

Our decoration was simply a function call at the exact point where we were associating a function with the prototype. However, this code is inelegant: It separates the creation of the "class" from the definition of each method.

If we had `Object.assign` or an equivalent, we we're able to define all of the methods, including decorators, in one step:

{% highlight javascript %}
var Person = function () {};

_.extend(Person.prototype, {

  setName: once(function setName (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }),

  fullName: function fullName () {
  return this.firstName + " " + this.lastName;
  }

});
{% endhighlight %}

Easy, peasy, lemon-squeezy. But the ECMAScript 2015 syntaxes for classes makes this a tiny bit awkward. When we use a compact method definition, we get things like the method being non-enumerable by default. So to get a similar result in ECMAScript 2015, we have to write some clumsy code after the class has been defined:

{% highlight javascript %}
Object.defineProperty(Person.prototype, 'setName', { value: once(Person.prototype.setName) });
{% endhighlight %}

This is weak for two reasons. First, it's fugly and full of accidental complexity. Second, modifying the prototype after defining the class separates two things that conceptually ought to be together. The `class` keyword giveth, but it also taketh away.

To solve a problem created by ECMAScript 2015, [method decorators] have been proposed for ES7. The syntax is similar to class decorators, but where a class decorator takes a class asan argument and returns the same (or a different) class, a method decorator actually intercedes when a property is defined on the prototype.

Thus, a `fluent` (a/k/a `chain`) decorator would look like this:

{% highlight javascript %}
function fluent (target, name, descriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args) {
    method.apply(this, args);
    return this;
  }
}
{% endhighlight %}

And we'd use it like this:

{% highlight javascript %}
class Person {

  @fluent
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }

};
{% endhighlight %}

Once again, we end up with two kinds of decorators: One for functions, and one for methods, with different structures. We need a new colour!

But since decorators are expressions, we can alleviate the pain with an adaptor:

{% highlight javascript %}
const wrapWith = (decorator) =>
  function (target, name, descriptor) {
    descriptor.value = decorator(descriptor.value);
  }

function fluent (method) {
  return function (...args) {
    method.apply(this, args);
    return this;
  }
}

class Person {

  @wrapWith(once)
  @wrapWith(fluent)
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }

};
{% endhighlight %}

[method decorators]: https://github.com/wycats/javascript-decorators

(Although ES7 has not been approved, there is extensive support for ES7 method decorators in transpilation tools. The examples in this post were evaluated with [Babel](http://babeljs.io).)

---
