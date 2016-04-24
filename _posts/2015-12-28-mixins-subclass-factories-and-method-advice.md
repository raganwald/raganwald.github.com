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

0. If `Executive` mixes `BookCollector` in, the properties `addToCollection` and `collection` become own properties of `Executive`'s prototype. If `Executive` inherits from `BookCollector`, they don't.<br/><br/>
0. If `Executive` mixes `BookCollector` in, `Executive` can't override methods of `BookCollector`. If `Executive` inherits from `BookCollector`, it can.<br/><br/>
0. If `Executive` mixes `BookCollector` in, `Executive` can't override methods of `BookCollector`, and therefore it can't make a method that overrides a method of `BookCollector` and then uses `super` to call the original. If `Executive` inherits from `BookCollector`, it can.

If JavaScript had multiple inheritance, we could extend a class with more than one superclass:

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

  toHTML () {
    return this.name; // highly insecure
  }
}

class Coloured {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  }

  getColourRGB () {
    return this.colourCode;
  }
}

let yellow = {r: 'FF', g: 'FF', b: '00'},
    red    = {r: 'FF', g: '00', b: '00'},
    green  = {r: '00', g: 'FF', b: '00'},
    grey   = {r: '80', g: '80', b: '80'};

let oneDayInMilliseconds = 1000 * 60 * 60 * 24;

class TimeSensitiveTodo extends Todo, Coloured {
  constructor (name, deadline) {
    super(name);
    this.deadline = deadline;
  }

  getColourRGB () {
    let slack = this.deadline - Date.now();

    if (this.done) {
      return grey;
    }
    else if (slack <= 0) {
      return red;
    }
    else if (slack <= oneDayInMilliseconds){
      return yellow;
    }
    else return green;
  }

  toHTML () {
    let rgb = this.getColourRGB();

    return `<span style="color: #${rgb.r}${rgb.g}${rgb.b};">${super.toHTML()}</span>`;
  }
}
```

This hypothetical `TimeSensitiveTodo` extends both `Todo` and `Coloured`, and it overrides `toHTML` from `Todo` as well as overriding `getColourRGB` from `Coloured`.

[![Boeing Factory](/assets/images/boeing-factory.jpg)](https://www.flickr.com/photos/jetstarairways/9130160595)


### subclass factories

However, JavaScript does not have "true" multiple inheritance, and therefore this code does not work. But we can simulate multiple inheritance for cases like this. The way it works is to step back and ask ourselves, "What would we do if we didn't have mixins or multiple inheritance?"

The answer is, we'd force a square multiple inheritance peg into a round single inheritance hole, like this:

```javascript
class Todo {
  // ...
}

class ColouredTodo extends Todo {
  // ...
}

class TimeSensitiveTodo extends ColouredTodo {
  // ...
}
```

By making `ColouredTodo` extend `Todo`, `TimeSensitiveTodo` can extend `ColouredTodo` and override methods from both. This is exactly what most programmers do, and we know that it is an anti-pattern, as it leads to duplicated class behaviour and deep class hierarchies.

But.

What if, instead of manually creating this hierarchy, we use our simple mixins to do the work for us? We can take advantage of the fact that [classes are expressions](http://raganwald.com/2015/06/04/classes-are-expressions.html), like this:

```javascript
let Coloured = mixin({
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },

  getColourRGB () {
    return this.colourCode;
  }
});

let ColouredTodo = Coloured(class extends Todo {});
```

Thus, we have a `ColouredTodo` that we can extend and override, but we also have our `Coloured` behaviour in a mixin we can use anywhere we like without duplicating its functionality in our code. The full solution looks like this:

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

  toHTML () {
    return this.name; // highly insecure
  }
}

let Coloured = mixin({
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },

  getColourRGB () {
    return this.colourCode;
  }
});

let ColouredTodo = Coloured(class extends Todo {});

let yellow = {r: 'FF', g: 'FF', b: '00'},
    red    = {r: 'FF', g: '00', b: '00'},
    green  = {r: '00', g: 'FF', b: '00'},
    grey   = {r: '80', g: '80', b: '80'};

let oneDayInMilliseconds = 1000 * 60 * 60 * 24;

class TimeSensitiveTodo extends ColouredTodo {
  constructor (name, deadline) {
    super(name);
    this.deadline = deadline;
  }

  getColourRGB () {
    let slack = this.deadline - Date.now();

    if (this.done) {
      return grey;
    }
    else if (slack <= 0) {
      return red;
    }
    else if (slack <= oneDayInMilliseconds){
      return yellow;
    }
    else return green;
  }

  toHTML () {
    let rgb = this.getColourRGB();

    return `<span style="color: #${rgb.r}${rgb.g}${rgb.b};">${super.toHTML()}</span>`;
  }
}

let task = new TimeSensitiveTodo('Finish blog post', Date.now() + oneDayInMilliseconds);

task.toHTML()
  //=> <span style="color: #FFFF00;">Finish blog post</span>
```

The key snippet is `let ColouredTodo = Coloured(class extends Todo {});`, it turns behaviour into a subclass that can be extended and overridden. We can turn this pattern into a function:

```javascript
let subclassFactory = (behaviour) => {
  let mixBehaviourInto = mixin(behaviour);

  return (superclazz) => mixBehaviourInto(class extends superclazz {});
}
```

Using `subclassFactory`, we wrap the class we want to extend, instead of the class we are declaring. Like this:

```javascript
let subclassFactory = (behaviour) => {
  let mixBehaviourInto = mixin(behaviour);

  return (superclazz) => mixBehaviourInto(class extends superclazz {});
}

let ColouredAsWellAs = subclassFactory({
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },

  getColourRGB () {
    return this.colourCode;
  }
});

class TimeSensitiveTodo extends ColouredAsWellAs(ToDo) {
  constructor (name, deadline) {
    super(name);
    this.deadline = deadline;
  }

  getColourRGB () {
    let slack = this.deadline - Date.now();

    if (this.done) {
      return grey;
    }
    else if (slack <= 0) {
      return red;
    }
    else if (slack <= oneDayInMilliseconds){
      return yellow;
    }
    else return green;
  }

  toHTML () {
    let rgb = this.getColourRGB();

    return `<span style="color: #${rgb.r}${rgb.g}${rgb.b};">${super.toHTML()}</span>`;
  }
}
```
