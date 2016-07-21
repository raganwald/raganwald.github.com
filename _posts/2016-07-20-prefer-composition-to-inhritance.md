---
layout: default
tags: [allonge, noindex]
---

### preamble

In [Why Are Mixins Considered Harmful][harmful], we saw that concatenative sharing--as exemplified by mixins--leads to snowballing complexity because of three effects:

[harmful]: http://raganwald.com/2016/07/16/why-are-mixins-considered-harmful.html)

0. Lack of Encapsulation
0. Implicit Dependencies
0. Name Clashes

We looked at some variations on creating encapsulation to help reduce the "surface area" for dependencies to grow and names to clash, but noted that this merely slows down the growth of the problem, it does not fix it.

That being said, that doesn't mean that mixins are terrible. Mixins are simple to understand and to implement. As we'll see in this essay, it is straightforward to refactor away from mixins, and then we can work on reducing our code's complexity.

For many projects, mixins are the right choice right now, the important thing is to understand their limitations and the problems that may arise, so that we can know when to incorporate a heavier, but more complexity-taming architecture.

It is more important to know how to refactor to a particular architecture, than to know in advance which architecture can serve all of our needs now, and in the future.

---

### what mixins have in common with inheritance

The problems outlined with mixins are the same as the problems we have discovered with inheritance over the last 30+ years. Subclasses have implicit dependencies on their superclasses. This makes superclasses extremely fragile: One little change could break code in a subclass that is in an entirely different file, what we call "action at a distance," or its more pejorative term, "coupling." Likewise, naming conflicts can easily occur between subclasses and superclasses.

the root cause is the lack of encapsulation in the relationship between subclasses and superclasses. This is the exact same problem between classes and mixins: The lack of encapsulation.

In OOP, the unit of encapsulation is the object. An object has a defined interface of public methods, and behind this public interface, it has methods and properties that implement its interface. Other objects are supposed to interact only with the public methods.

JavaScript, by design, makes the interface/implementation barrier extremely porous. But we have techniques for making it difficult to circumvent the interface. And this is usually enough: After all, if some future developer wants, they can always rewrite the code to open up any interface yoy may design. So the key is to document your intent and make it extremely obvious when code violates the documented intent.

Mixins can encapsulate

---

### encapsulating mixins

Although mixins make it very easy to separate responsibilities, mixins permit--or even encourage--snowballing complexity as code grows in time, space, and team. Today we are going to look at how we can separate responsibilities using composition, and how that can be engineered to solve the encapsulation, implicit dependencies, and name clash problems.

And because we are interested in refactoring mixins to composition, we will emphasize an architecture that makes the migration from mixin to composition smooth.

In [Why Are Mixins Considered Harmful][harmful], we illustrated the simplest and most naïve mixin pattern, using `Object.assign` to copy mixin properties into a class' prototype. This is not ho mixins are normally incorporated in the wild. Typically, there are two approaches.

First, sometimes people use a `mixin` function that mixes a mixin into a class. So instead of:

```javascript
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

new Todo('test')
  .setColourRGB({r: 1, g: 2, b: 3})
  //=> {"name":"test","done":false,"colourCode":{"r":1,"g":2,"b":3}}
```

We write something like:

```javascript
const Coloured = {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  }
};

function mixin (...mixinsAndClass) {
  const numberOfMixins = mixinsAndClass.length - 1;
  const clazz = mixinsAndClass[numberOfMixins];
  const mixins = mixinsAndClass.slice(0, numberOfMixins);

  for (const mixin of mixins) {
    Object.assign(clazz.prototype, mixin);
  }

  return clazz;
}

const Todo = mixin(Coloured, class {
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
});
```

Typically, there is more functionality than just `Object.assign` at work. For example, the mixing in may be performed using a [`subclassFactory`][subclassFactory] to permit the use of `super` and for performance reasons with optimizing JITs. Methods may be made non-enumerable. Or there may be support for `instanceof` baked in. But the basic principle to note here is that the mixin itself is just a plain object, the functionality of mixing in happens in a single `mixin` function.

[subclassFactory]: http://raganwald.com/2015/12/28/mixins-subclass-factories-and-method-advice.html

The other way forward is to turn the mixin into a function that is applied to transform a class, like this:

```javascript
const FunctionalMixin = (behaviour) =>
  target => {
    Object.assign(target.prototype, behaviour);
    return target;
  };

const Coloured = FunctionalMixin({
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  }
});

const Todo = Coloured(class {
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
});
```

Angus Croll calls this a [functional mixin][croll], and [they work very well in ES6][fmes6].

[fmes6]: http://raganwald.com/2015/06/17/functional-mixins.html "Functional Mixins in ECMAScript 2015"

[croll]: https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/

If we are adventurous, we might use a compiler that supports proposed--but unratified--JavaScript features like class decorators. If we do, functional mixins are very elegant:

```javascript
@Coloured
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
};
```

For the rest of this essay, we will presume that we are using the functional mixin approach. For those code cases using other approaches, the good news is that these refactorings can be applied with minimal modification: The underlying ideas are the same regardless of the implementation details.

---

### prefe

---

### have your say

...

---

### notes
