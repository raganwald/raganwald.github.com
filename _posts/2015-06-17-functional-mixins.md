---
title: "Functional Mixins in ECMAScript 2015"
layout: default
tags: allonge
---

In [Prototypes are Objects](http://raganwald.com/2015/06/10/mixins.html), we saw that you can emulate "mixins" using `Object.assign` on the prototypes that underly JavaScript "classes." We'll revisit this subject now and spend more time looking at mixing functionality into classes.

First, a quick recap: In JavaScript, a "class" is implemented as a constructor function and its prototype, whether you write it directly, or use the `class` keyword. Instances of the class are created by calling the constructor with `new`. They "inherit" shared behaviour from the constructor's `prototype` property.[^delegate]

[^delegate]: A much better way to put it is that objects with a prototype *delegate* behaviour to their prototype (and that may in turn delegate behaviour to its prototype if it has one, and so on).

### the object mixin pattern

One way to share behaviour scattered across multiple classes, or to untangle behaviour by factoring it out of an overweight prototype, is to extend a prototype with a *mixin*.

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

[![Macchiato](/assets/images/macchiato.jpg)](https://www.flickr.com/photos/chrisjrn/3771031871)

### functional mixins

The object mixin we have above works properly, but our little recipe had two distinct steps: Define the mixin and then extend the class prototype. Angus Croll pointed out that it's more elegant to define a mixin as a function rather than an object. He calls this a [functional mixin][fm]. Here's `Coloured` again, recast in functional form:

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

We can make ourselves a *factory function* that also names the pattern:

{% highlight javascript %}
const FunctionalMixin = (behaviour) =>
  target => Object.assign(target, behaviour);
{% endhighlight %}

This allows us to define functional mixins neatly:

{% highlight javascript %}
const Coloured = FunctionalMixin({
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

Our object mixin pattern does not work this way, the methods defined in a mixin *are* enumerable by default, and if we carefully defined them to be non-enumerable, `Object.assign` wouldn't mix them into the target prototype, because `Object.assign` only assigns enumerable properties.

And thus:

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

As we can see, the `setColourRGB` and `getColourRGB` methods are enumerated, although the `do` and `undo` methods are not. This can be a problem with naïve code: we can't always rewrite all the *other* code to carefully use `.hasOwnProperty`.

One benefit of functional mixins is that we can solve this problem and transparently make mixins behave like `class`:

{% highlight javascript %}
const FunctionalMixin = (behaviour) =>
  function (target) {
    for (let property of Reflect.ownKeys(behaviour))
      Object.defineProperty(target, property, { value: behaviour[property] })
    return target;
  }
{% endhighlight %}

Writing this out as a pattern would be tedious and error-prone. Encapsulating the behaviour into a function is a small win.

[![Just Below the Surface](/assets/images/jbts.jpg)](https://www.flickr.com/photos/yellowskyphotography/7449919584)

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

We can't really do the same thing with simple mixins, because all of the properties in a simple mixin end up being mixed into the prototype of instances we create by default. For example, let's say we want to define `Coloured.RED`, `Coloured.GREEN`, and `Coloured.BLUE`. But we don't want any specific coloured instance to define `RED`, `GREEN`, or `BLUE`.

Again, we can solve this problem by building a functional mixin. Our `FunctionalMixin` factory function will accept an optional dictionary of read-only mixin properties, provided they are associated with a special key:

{% highlight javascript %}
const shared = Symbol("shared");

function FunctionalMixin (behaviour) {
  const instanceKeys = Reflect.ownKeys(behaviour)
    .filter(key => key !== shared);
  const sharedBehaviour = behaviour[shared] || {};
  const sharedKeys = Reflect.ownKeys(sharedBehaviour);

  function mixin (target) {
    for (let property of instanceKeys)
      Object.defineProperty(target, property, { value: behaviour[property] });
    return target;
  }
  for (let property of sharedKeys)
    Object.defineProperty(mixin, property, {
      value: sharedBehaviour[property],
      enumerable: sharedBehaviour.propertyIsEnumerable(property)
    });
  return mixin;
}

FunctionalMixin.shared = shared;
{% endhighlight %}

And now we can write:

{% highlight javascript %}
const Coloured = FunctionalMixin({
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  },
  [FunctionalMixin.shared]: {
    RED:   { r: 255, g: 0,   b: 0   },
    GREEN: { r: 0,   g: 255, b: 0   },
    BLUE:  { r: 0,   g: 0,   b: 255 },
  }
});

Coloured(Todo.prototype)

const urgent = new Todo("finish blog post");
urgent.setColourRGB(Coloured.RED);

urgent.getColourRGB()
  //=> {"r":255,"g":0,"b":0}
{% endhighlight %}

### mixin methods

Such properties need not be values. Sometimes, classes have methods. And likewise, sometimes it makes sense for a mixin to have its own methods. One example concerns `instanceof`.

In earlier versions of ECMAScript, `instanceof` is an operator that checks to see whether the prototype of an instance matches the prototype of a constructor function. It works just fine with "classes," but it does not work "out of the box" with mixins:

{% highlight javascript %}
urgent instanceof Todo
  //=> true

urgent instanceof Coloured
  //=> false
{% endhighlight %}

To handle this and some other issues where programmers are creating their own notion of dynamic types, or managing prototypes directly with `Object.create` and `Object.setPrototypeOf`, ECMAScript 2015 provides a way to override the built-in `instanceof` behaviour: An object can define a method associated with a well-known symbol, `Symbol.hasInstance`.

We can test this quickly:[^but]

[^but]: This may **not** work with various transpilers and other incomplete ECMAScript 2015 implementations. Check the documentation. For example, you must enable the "high compliancy" mode in [BabelJS](http://babeljs.io). This is off by default to provide the highest possible performance for code bases that do not need to use features like this.

{% highlight javascript %}
Coloured[Symbol.hasInstance] = (instance) => true
urgent instanceof Coloured
  //=> true
{} instanceof Coloured
  //=> true
{% endhighlight %}

Of course, that is not semantically correct. But using this technique, we can write:

{% highlight javascript %}
const shared = Symbol("shared");

function FunctionalMixin (behaviour) {
  const instanceKeys = Reflect.ownKeys(behaviour)
    .filter(key => key !== shared);
  const sharedBehaviour = behaviour[shared] || {};
  const sharedKeys = Reflect.ownKeys(sharedBehaviour);
  const typeTag = Symbol("isA");

  function mixin (target) {
    for (let property of instanceKeys)
      Object.defineProperty(target, property, { value: behaviour[property] });
    target[typeTag] = true;
    return target;
  }
  for (let property of sharedKeys)
    Object.defineProperty(mixin, property, {
      value: sharedBehaviour[property],
      enumerable: sharedBehaviour.propertyIsEnumerable(property)
    });
  mixin[Symbol.hasInstance] = (instance) => !!instance[typeTag];
  return mixin;
}

FunctionalMixin.shared = shared;

urgent instanceof Coloured
  //=> true
{} instanceof Coloured
  //=> false
{% endhighlight %}

Do you need to implement `instanceof`? Quite possibly not. "Rolling your own polymorphism" is usually a last resort. But it can be handy for writing test cases, and a few daring framework developers might be working on multiple dispatch and pattern-matching for functions.

### summary

The charm of the object mixin pattern is its simplicity: It really does not need an abstraction wrapped around an object literal and `Object.assign`.

However, behaviour defined with the mixin pattern is *slightly* different than behaviour defined with the `class` keyword. Two examples of these differences are enumerability and mixin properties (such as constants and mixin methods like `[Symbol.hasInstance]`).

Functional mixins provide an opportunity to implement such functionality, at the cost of some complexity in the `FunctionalMixin` function that creates functional mixins.

As a general rule, it's best to have things behave as similarly as possible in the domain code, and this sometimes does involve some extra complexity in the infrastructure code. But that is more of a guideline than a hard-and-fast rule, and for this reason there is a place for both the object mixin pattern *and* functional mixins in JavaScript.

(discuss on [hacker news](https://news.ycombinator.com/item?id=9734774) and [/r/javascript](http://www.reddit.com/r/javascript/comments/3a7hxz/functional_mixins_in_ecmascript_2015/))

*follow-up*: [Purely Functional Composition](http://raganwald.com/2015/06/20/purely-functional-composition.html)

---

more reading:

- [Prototypes are Objects (and why that matters)](http://raganwald.com/2015/06/10/mixins.html)
- [Classes are Expressions (and why that matters)](http://raganwald.com/2015/06/04/classes-are-expressions.html)
- [Functional Mixins in ECMAScript 2015](http://raganwald.com/2015/06/17/functional-mixins.html)
- [Using ES.later Decorators as Mixins](http://raganwald.com/2015/06/26/decorators-in-es7.html)
- [Method Advice in Modern JavaScript](http://raganwald.com/2015/08/05/method-advice.html)
- [`super()` considered hmmm-ful](http://raganwald.com/2015/12/23/super-considered-hmmmful.html)
- [JavaScript Mixins, Subclass Factories, and Method Advice][mi-sf-ma]

[mi-sf-ma]: http://raganwald.com/2015/12/28/mixins-subclass-factories-and-method-advice.html

notes:


[^iife]: "Immediately Invoked Function Expressions"
[ja6]: https://leanpub.com/javascriptallongesix
[fm]: https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/ "A fresh look at JavaScript Mixins"
