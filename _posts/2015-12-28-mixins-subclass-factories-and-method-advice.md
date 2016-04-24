---
title: "JavaScript Mixins, Subclass Factories, and Method Advice"
layout: default
tags: [allonge]
---

*Mixins* solve a very common problem in class-centric OOP: For non-trivial applications, there is a messy many-to-many relationship between behaviour and classes, and it does not neatly decompose into a tree. In this essay, we only touch lightly over the benefits of using mixins with classes, and in their stead we will focus on some of the limitations of mixins and ways to not just overcome them, but create designs that are superior to those created with classes alone.

(For more on why mixins matter in the first place, you may want to review [Prototypes are Objects (and why that matters)](http://raganwald.com/2015/06/10/mixins.html), [Functional Mixins in ECMAScript 2015](http://raganwald.com/2015/06/17/functional-mixins.html), and [Using ES.later Decorators as Mixins](http://raganwald.com/2015/06/26/decorators-in-es7.html).)

[![Crossed Wires](/assets/images/crossed-wires.jpg)](https://www.flickr.com/photos/howardlake/4834299551/)

### simple mixins

As noted above, for non-trivial applications, there is a messy many-to-many relationship between behaviour and classes. However, JavaScript's single-inheritance model forces us to organize behaviour in trees, which can only represent one-to-many relationships.

The mixin solution to this problem is to leave classes in a single inheritance hierarchy, and to mix additional behaviour into individual classes as needed. Here's a vastly simplified functional mixin for classes:[^simplified]

[^simplified]: A production-ready implementation would handle more than just methods. For example, it would allow you to mix getters and setters into a class, and it would allow us to attach properties or methods to the target class itself, and not just instances. But this simplified version handles methods, simple properties, "mixin properties," and `instanceof`, and that is enough for the purposes of investigating OO design questions.

```javascript
function mixin (behaviour) {
  let instanceKeys = Reflect.ownKeys(behaviour);
  let typeTag = Symbol('isa');

  function _mixin (clazz) {
    for (let property of instanceKeys)
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour[property],
        writable: true
      });
    Object.defineProperty(clazz.prototype, typeTag, { value: true });
    return clazz;
  }
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: (i) => !!i[typeTag]
  });
  return _mixin;
}
```

This is more than enough to do a lot of very good work in JavaScript, but it's just the starting point. Here's how we put it to work:

```javascript
let BookCollector = mixin({
  addToCollection (name) {
    this.collection().push(name);
    return this;
  },
  collection () {
    return this._collected_books || (this._collected_books = []);
  }
});

class Person {
  constructor (first, last) {
    this.rename(first, last);
  }
  fullName () {
    return this.firstName + " " + this.lastName;
  }
  rename (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }
}

let Executive = BookCollector(
  class extends Person {
    constructor (title, first, last) {
      super(first, last);
      this.title = title;
    }

    fullName () {
      return `${this.title} ${super.fullName()}`;
    }
  }
);

let president = new Executive('President', 'Barak', 'Obama');

president
  .addToCollection("JavaScript Allongé")
  .addToCollection("Kestrels, Quirky Birds, and Hopeless Egocentricity");

president.collection()
  //=> ["JavaScript Allongé","Kestrels, Quirky Birds, and Hopeless Egocentricity"]
```

[class decorators]: https://github.com/wycats/javascript-decorators

### multiple inheritance

If you want to mix behaviour into a class, mixins do the job very nicely. But sometimes, people want more. They want **multiple inheritance**. Meaning, what they really want is for class `Executive` to inherit from `Person` *and* from `BookCollector`.

What's the difference between `Executive` mixing `BookCollector` in and `Executive` inheriting from `BookCollector`?

0. If `Executive` mixes `BookCollector` in, the properties `addToCollection` and `collection` become own properties of `Executive`'s prototype. If `Executive` inherits from `BookCollector`, they don't.
0. If `Executive` mixes `BookCollector` in, `Executive` can't override methods of `BookCollector`. If `Executive` inherits from `BookCollector`, it can.
0. If `Executive` mixes `BookCollector` in, `Executive` can't override methods of `BookCollector`, and therefore it can't make a method that overrides a method of `BookCollector` and then uses `super` to call the original. If `Executive` inherits from `BookCollector`, it can.
