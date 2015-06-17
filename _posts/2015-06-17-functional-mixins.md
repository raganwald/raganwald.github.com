---
layout: default
tags: allonge
noindex: true
---

*Prerequisite: This post presumes that readers are familiar with JavaScript's objects, know how a prototype defines behaviour for an object, know what a constructor function is, and how a constructor's `.prototype` property is related to the objects it constructs. Passing familiarity with ECMAScript 2015 syntax will be  helpful.*

In [Prototypes are Objects (and why that matters)](http://raganwald.com/2015/06/10/mixins.html), we saw that you can emulate "mixins" using `Object.assign` on the prototypes that underly JavaScript "classes." We'll revisit this subject now and spend more time looking at mixing functionality into classes.

First, a quick recap: In JavaScript, a "class" is implemented as a constructor function and its prototype, whether you write it directly, or use the `class` keyword. Instances of the class are created by calling the constructor with `new`. They "inherit" shared behaviour from the constructor's `prototype` property.[^delegate]

[^delegate]: A much better way to put it is that objects with a prototype *delegate* behaviour to their prototype (and that may in turn delegate behaviour to its prototype if it has one, and so on).

One way to share behaviour scattered across multiple classes, or to untangle behaviour by factoring it out of an overweight prototype, is to extend a prototype with a mixin.

Here's a class of todo items:

{% highlight javascript %}
class Todo {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
}
{% endhighlight %}

And a "mixin" that is responsible for colour-coding:

{% highlight javascript %}
const Coloured = {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  }
};
{% endhighlight %}

Mixing colour coding into our Todo prototype is straightforward:

{% highlight javascript %}
Object.assign(Todo.prototype, Coloured);

new Todo('test')
  .setColourRGB({r: 1, g: 2, b: 3})
  //=> {"name":"test","done":false,"colourCode":{"r":1,"g":2,"b":3}}
{% endhighlight %}

We can "upgrade" it to have a [private property](http://raganwald.com/2015/06/04/classes-are-expressions.html) if we wish:

{% highlight javascript %}
const colourCode = Symbol("colourCode");

const Coloured = {
  setColourRGB ({r, g, b}) {
    this[colourCode]= {r, g, b};
    return this;
  },
  getColourRGB () {
    return this[colourCode];
  }
};
{% endhighlight %}

So far, very easy and very simple. This is a *pattern*, a recipe for solving a certain problem using a particular organization of code.

### functional mixins

The mixin we have above works properly, but our little recipe had two distinct steps: Define the mixin and then extend the class prototype. Angus Croll pointed out that it's far more elegant to define a mixin as a function rather than an object. He calls this a [functional mixin][fm]. Here's our `Coloured` recast in functional form:

{% highlight javascript %}
const Coloured = (clazz) =>
  Object.assign(Todo.prototype, {
    setColourRGB ({r, g, b}) {
      this.colourCode = {r, g, b};
      return this;
    },
    getColourRGB () {
      return this.colourCode;
    }
  });

Coloured(Todo);
{% endhighlight %}

The challenge with this approach is that it only works with constructor functions (and "classes," since they desugar to constructor functions). If we mix functionality directly into a target, we could mix functionality directly into an object if we so chose:

{% highlight javascript %}
const Coloured = (target) =>
  Object.assign(target, {
    setColourRGB ({r, g, b}) {
      this.colourCode = {r, g, b};
      return this;
    },
    getColourRGB () {
      return this.colourCode;
    }
  });

Coloured(Todo.prototype);
{% endhighlight %}

Either way, we can make ourselves a convenience function (that also names the pattern):

{% highlight javascript %}
const ClassMixin = (behaviour) =>
  clazz => Object.assign(clazz.prototype, behaviour);
{% endhighlight %}

or:

{% highlight javascript %}
const Mixin = (behaviour) =>
  target => Object.assign(target, behaviour);
{% endhighlight %}

This allows us to define functional mixins neatly:

{% highlight javascript %}
const Coloured = Mixin({
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  }
});
{% endhighlight %}

### enumerability

If we look at the way `class` defines prototypes, we find that the methods defined are not enumerable by default. This works around a common error where programmers iterate over the keys of an instance and fail to test for `.hasOwnProperty`.

Our simple mixin pattern does not work this way, the methods defined in a mixin *are* enumerable by default, and if we carefully defined them to be non-enumerable, `Object.assign` wouldn't mix them into the target prototype, because `Object.assign` only assigns enumerable properties.

Thus:

{% highlight javascript %}
Coloured(Todo.prototype)

const urgent = new Todo("finish blog post");
urgent.setColourRGB({r: 256, g: 0, b: 0});

for (let property in urgent) console.log(property);
  // =>
    name
    done
    colourCode
    setColourRGB
    getColourRGB
{% endhighlight %}

As we can see, the `setColourRGB` and `getColourRGB` methods are enumerated, although the `do` and `undo` methods are not. This can be a problem with naïve code, can we can't always rewrite all the *other* code to carefully use `.hasOwnProperty`.

One benefit of functional mixins is that we can solve this problem and transparently make mixins behave like `class`:

{% highlight javascript %}
const Mixin = (behaviour) =>
  function (target) {
    for (let property of Object.getOwnPropertyNames(behaviour))
      Object.defineProperty(target, property, { value: behaviour[property] })
    return target;
  }
{% endhighlight %}

Writing this out as a pattern would be tedious and error-prone. Encapsulating the behaviour into a function is a win.

### mixin responsibilities

Like classes, mixins are metaobjects: They define behaviour for instances. In addition to defining behaviour in the form of methods, classes are also responsible for initializing instances. But sometimes, classes and metaobjects handle additional responsibilities.

For example, sometimes a particular concept is associated with some well-known constants. When using a class, can be handy to namespace such values in the class itself:

{% highlight javascript %}
class Todo {
  constructor (name) {
    this.name = name || Todo.DEFAULT_NAME;
    this.done = false;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
}

Todo.DEFAULT_NAME = 'Untitled';
// If we are sticklers for read-only constants, we could write:
// Object.defineProperty(Todo, 'DEFAULT_NAME', {value: 'Untitled'});
{% endhighlight %}

We can't really do the same thing with simple mixins, because all of the properties in a simple mixin end up being mixed into the prototype of instances we create by default.

For example, let's say we want to define `Coloured.RED`, `Coloured.GREEN`, and `Coloured.BLUE`. But we don't want any specific coloured instance to define `RED`, `GREEN`, or `BLUE`. One way to do that is to take advantage of the separation between the behaviour being mixed in and the function that does the mixing in when we create a functional mixin:

{% highlight javascript %}
const Mixin = (instanceBehaviour) =>
  function (target) {
    for (let property of Object.getOwnPropertyNames(instanceBehaviour))
      Object.defineProperty(target, property, { value: instanceBehaviour[property] })
    return target;
  }
{% endhighlight %}

---

[^iife]: "Immediately Invoked Function Expressions"
[ja6]: https://leanpub.com/javascriptallongesix
