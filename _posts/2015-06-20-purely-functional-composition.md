---
layout: default
tags: allonge
---

In [Functional Mixins], we discussed mixing functionality *into* JavaScript classes. The act of mixing functionality in changes the class. This approach maps well to idioms from other languages, such as Ruby's modules. It also helps us decompose classes into smaller entities with focused responsibilities that can be shared between classes as necessary.[^ES7]

[Functional Mixins]: http://raganwald.com/2015/06/17/functional-mixins.html

[^ES7]: Another, speculative benefit is that it maps well to features like [class decorators](https://github.com/wycats/javascript-decorators) or the [`with` keyword](https://github.com/WebReflection/es-class/blob/master/FEATURES.md#with), either of which may land in a future version of JavaScript or may be adopted by transpiling tools like Babel.

That being said, mutation has its drawbacks as well. People say, "it's hard to reason about code that mutates data," and when it comes to modifying classes they are often right: Experience has shown that classes are often global to an entire program, and changing a class in one place can break the functionality of another part of the program that expects the class to remain unmodified.

Of course, if the modifications are only made as part of building the class in the first place, these concerns really do not apply. But what if we wish to modify a class that was made somewhere else? What if we wish to make modifications in just one place?

[![Campos Macchiato](/assets/images/compos.jpg)](https://www.flickr.com/photos/profernity/3727948215)

### extension

Let's revisit our ridiculously trivial `Todo` class:

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

Now let us presume that this class is used throughout our application for various purposes. In one section of the code, we want `Todo` items that are also coloured. As we saw [previously][Functional Mixins], we can accomplish that with a simple mixin like this:

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

Object.assign(Todo.prototype, Coloured);
{% endhighlight %}

While this works just fine for all of the Todos we create in this part of the program, we may accidentally break `Todo` instances used elsewhere. What we really want is a `ColoredTodo` in one part of the program, and `Todo` everywhere else.

The `extends` keyword solves that problem in the trivial case:

{% highlight javascript %}
class ColouredTodo extends Todo {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  }
  getColourRGB () {
    return this.colourCode;
  }
}
{% endhighlight %}

A `ColouredTodo` is just like a `Todo`, but with added colour.

### sharing is caring

One oft-repeated drawback of using extension is that it is difficult to share the "colour" functionality with other classes. Extension forms a strict tree. Another drawback is that the functionality can only be tested in concert with `Todo`, whereas it is trivial to independently test a well-crafted mixin.

Our problem is that with extension, our colour functionality is coupled to the `Todo` class. With a mixin, it isn't. But with a mixin, our `Todo` class ended up coupled to `Coloured`. With extension, it wasn't.

What we want is to decouple `Todo` from `Coloured` with extension, and to decouple `Coloured` from `ColouredTodo` with a mixin:

{% highlight javascript %}
class ColouredTodo extends Todo {}

const Coloured = {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  }
};

Object.assign(ColouredTodo.prototype, Coloured);
{% endhighlight %}

We can write a simple function to encapsulate this pattern:

{% highlight javascript %}
function ComposeWithClass(clazz, ...mixins) {
  const subclazz = class extends clazz {};
  for (let mixin of mixins) {
    Object.assign(subclazz.prototype, mixin);
  }
  return subclazz;
}

const ColouredTodo = ComposeWithClass(Todo, Coloured);
{% endhighlight %}

The `ComposeWithClass` function returns a new class without modifying its arguments. In other words, it's *composing* behaviour with a class, not mixing behaviour into a class.

[![Cappuccinos and coffee cake, baked in capp cups](/assets/images/coffee-cake.jpg)](https://www.flickr.com/photos/insidious_plots/4561130216/)

### enhance

We can enhance `ComposeWithClass` to address some of the issues we noticed with mutating mixins, such as making methods non-enumerable:

{% highlight javascript %}
const shared = Symbol("shared");

function ComposeWithClass(clazz, ...mixins) {
  const subclazz = class extends clazz {};

  for (let mixin of mixins) {
    const instanceKeys = Object.getOwnPropertyNames(mixin)
      .concat(Object.getOwnPropertySymbols(mixin))
      .filter(key => key !== shared && key != Symbol.instanceOf);
    const sharedBehaviour = mixin[shared] || {};
    const sharedKeys = Object.getOwnPropertyNames(sharedBehaviour)
      .concat(Object.getOwnPropertySymbols(sharedBehaviour));

    for (let property of instanceKeys)
      Object.defineProperty(subclazz.prototype, property, { value: mixin[property] });
    for (let property of sharedKeys)
      Object.defineProperty(subclazz, property, {
        value: sharedBehaviour[property],
        enumerable: sharedBehaviour.propertyIsEnumerable(property)
      });
  }
  return subclazz;
}

ComposeWithClass.shared = shared;
{% endhighlight %}

Written like this, it's up to individual behaviours to sort out `instanceof`:

{% highlight javascript %}
const isaColoured = Symbol();

const Coloured = {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  },
  [isaColoured]: true,
  [Symbol.hasInstance] (instance) { return instance[isaColoured]; }
};
{% endhighlight %}

And that's something we can encapsulate, if we wish:

{% highlight javascript %}
function HasInstances (behaviour) {
  const typeTag = Symbol();
  return Object.assign({}, behaviour, {
    [typeTag]: true,
    [Symbol.hasInstance] (instance) { return instance[typeTag]; }
  })
}
{% endhighlight %}

### the complete composition

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

const Coloured = HasInstances({
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  }
});

const ColouredTodo = ComposeWithClass(Todo, Coloured);
{% endhighlight %}

### summary

A "purely functional" approach to composing functionality is appropriate when we wish to compose behaviour with classes, but do not wish to mutate a class that is used elsewhere. One approach is to extend the class into a subclass, and mix behaviour into the newly created subclass.

(discuss on [reddit](http://www.reddit.com/r/javascript/comments/3aj1t5/purely_functional_composition/))

---

[^iife]: "Immediately Invoked Function Expressions"
[ja6]: https://leanpub.com/javascriptallongesix
[fm]: https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/ "A fresh look at JavaScript Mixins"
