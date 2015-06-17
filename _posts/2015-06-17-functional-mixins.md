---
layout: default
tags: allonge
noindex: true
---

*Prerequisite: This post presumes that readers are familiar with JavaScript's objects, know how a prototype defines behaviour for an object, know what a constructor function is, and how a constructor's `.prototype` property is related to the objects it constructs. Passing familiarity with ECMAScript 2015 syntax will be  helpful.*

n [Prototypes are Objects (and why that matters)](https://raganwald.com/2015/06/17/functional-mixins.html), we saw that you can emulate "mixins" using `Object.assign` on the prototypes that underly JavaScript "classes." We'll revisit this subject now and spend more time looking at mixing functionality into classes.

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

And a "mixin" that is responsible for color-coding:

{% highlight javascript %}
const ColourCoded = {
  setColourRGB: function (r, g, b) {
    this.colourCode = { r: r, g: g, b: b };
    return this;
  },
  getColourRGB: function () {
    return this.colourCode;
  }
};
{% endhighlight %}

Mixing colour coding into our Todo prototype is straightforward:

{% highlight javascript %}
Object.assign(Todo.prototype, ColourCoded);

new Todo('test')
  .setColourRGB(1, 2, 3)
  //=> {"name":"test","done":false,"colourCode":{"r":1,"g":2,"b":3}}
{% endhighlight %}

We can "upgrade" it to have a private property if we wish:

{% highlight javascript %}
const colourCode = Symbol("colourCode");

const ColourCoded = {
  setColourRGB: function (r, g, b) {
    this[colourCode ]= { r: r, g: g, b: b };
    return this;
  },
  getColourRGB: function () {
    return this[colourCode];
  }
};
{% endhighlight %}

So far, very easy and very simple. This is a *pattern*, a recipe for solving a certain problem using a particular organiztaion of code.

### functional mixins

The mixin we have above works properly, but our little recipe had two distinct steps: Define the mixin and then extend the class prototype. Angus Croll pointed out that it's far more elegant to define a mixin as a function rather than an object. He calls this a [functional mixin][fm]. Here's our `ColourCoded` recast in functional form:

{% highlight javascript %}
const becomeColourCoded = (clazz) =>
  Object.assign(Todo.prototype, {
    setColourRGB: function (r, g, b) {
      this.colourCode = { r: r, g: g, b: b };
      return this;
    },
    getColourRGB: function () {
      return this.colourCode;
    }
  })
{% endhighlight %}

becomeColourCoded(Todo);

The challenge with this approach is that it only works with constructor functions (and "classes," since they desugar to constructor functions). If we mix functionality directly into a target, we could mix functionality directly into an object if we so chose:

{% highlight javascript %}
const becomeColourCoded = (behaviour) =>
  Object.assign(behaviour, {
    setColourRGB: function (r, g, b) {
      this.colourCode = { r: r, g: g, b: b };
      return this;
    },
    getColourRGB: function () {
      return this.colourCode;
    }
  })

becomeColourCoded(Todo.prototype);
{% endhighlight %}

Either way, we can make ourselves a convenience function (that also names the pattern):

{% highlight javascript %}
const fClassMixin = (mixin) =>
  clazz => Object.assign(clazz.prototype, mixin);
{% endhighlight %}

or:

{% highlight javascript %}
const fMixin = (mixin) =>
  behaviour => Object.assign(behaviour, mixin);
{% endhighlight %}

This allows us to define functional mixins neatly:

{% highlight javascript %}
const becomeColourCoded = fMixin({
  setColourRGB: function (r, g, b) {
    this.colourCode = { r: r, g: g, b: b };
    return this;
  },
  getColourRGB: function () {
    return this.colourCode;
  }
});
{% endhighlight %}

---

[^iife]: "Immediately Invoked Function Expressions"
[ja6]: https://leanpub.com/javascriptallongesix
