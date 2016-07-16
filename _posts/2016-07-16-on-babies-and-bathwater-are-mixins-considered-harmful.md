---
title: "On Babies and Bathwater: Are Mixins Considered Harmful?"
layout: default
tags: [allonge, noindex]
---

(*This is a work-in-progress, feel free to read and even submit an edit, but do not post on Reddit or Hacker News, thank you.*)

Are [Mixins Considered Harmful](https://facebook.github.io/react/blog/2016/07/13/mixins-considered-harmful.html)?

Dan Abramov wrote something that sounds familiar to everyone[^everyone] who works with legacy applications:

[^everyone]: Yes, I said _everyone_, I didn't cover my ass with a phrase like "many people." Everyone.

> However it’s inevitable that some of our code using React gradually became incomprehensible. Occasionally, the React team would see groups of components in different projects that people were afraid to touch. These components were too easy to break accidentally, were confusing to new developers, and eventually became just as confusing to the people who wrote them in the first place.

You can ignore out the word "React:" All legacy applications exhibit this behaviour: They accumulate chunks of code that are easy to break and confusing to everyone, even the original authors. Worse, such chunks of code tend to grow over time, they are infectious: People write code to work around the incomprehensible code instead of refactoring it, and the workarounds become easy to break accidentally and confusing in their own right. The problems grow over time.

How do mixins figure into this? Dan articulated three issues with mixins:

0. Mixins introduce implicit dependencies
0. Mixins cause name clashes
0. Mixins cause snowballing complexity

He's 100% right!

### implicit dependencies

Mixins do introduce implicit dependencies. The simplest form of mixin is to use `Object.assign` to mix a template object into a class's prototype. Here's a class of todo items:

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
```

And a "mixin" that is responsible for colour-coding:

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
```

Mixing colour coding into our Todo prototype is straightforward:

```javascript
Object.assign(Todo.prototype, Coloured);

new Todo('test')
  .setColourRGB({r: 1, g: 2, b: 3})
  //=> {"name":"test","done":false,"colourCode":{"r":1,"g":2,"b":3}}
```

Note that our mixin simply grows our class' prototype via copying. Because the mixin's methods wind up being the prototype's methods, this is really no different than simply "fattening" our classes by hand.

The consequence is that every method can access every other method and every property. So a mixin's methods can refer to methods belonging to the original class, and the class's methdos can refer to methods in a mixin. And if a class has more than one mixin, mixin methods can refer to each other and depend on each other.

Over time, dependencies grow, and with them, fragility and incomprehensibility.

### name clashes

Since class methods and mixin methods wind up all being properties of the class prototype, you cannot give any method or property any name you like. In one big class file, you have the same problem: The various methods and properties needed all must have the same name.

WHat makes mixins different, is that in a single class you can easily inspect the code and determine which property and method names are already in use. But when modifying a mixin, you cannot easily determine which class or classes may already depend on this mixin. The name clashes reach out between files. Mixins create "action-at-a-distance," and the name clashes happen at a distance as well.

For example, what happens if we decide that we ought to be able to name colours instead of using their RGB values?

```javascript
const Coloured = {
  setColourName (name) {
    this.name = name;
  },
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourName () {
    return this.name;
  },
  getColourRGB () {
    return this.colourCode;
  }
};
```

Oops. We just broke `Todo`.

### snowballing complexity

Dan wrote:

> Every new requirement makes the mixins harder to understand. Components using the same mixin become increasingly coupled with time. Any new capability gets added to all of the components using that mixin. There is no way to split a “simpler” part of the mixin without either duplicating the code or introducing more dependencies and indirection between mixins. Gradually, the encapsulation boundaries erode, and since it’s hard to change or remove the existing mixins, they keep getting more abstract until nobody understands how they work.

This makes sense. If we write a `Coloured` mixin for `Todo` entities, we can reuse it for `Notes`:

```javascript
class Note {
  constructor (text) {
    this.text = text || '';
  }
}

Object.assign(Note.prototype, Coloured);

new Note('first actual noting')
  .setColourRGB({r: 1, g: 2, b: 3})
  //=> {"text":"first actual noting","colourCode":{"r":1,"g":2,"b":3}}
```

Now


---

### important message

(*This is a work-in-progress, feel free to read and even submit an edit, but do not post on Reddit or Hacker News, thank you.*)

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-05-07-javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.md))

---

### notes
