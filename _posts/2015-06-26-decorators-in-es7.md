---
title: "Using ES.later Decorators as Mixins"
layout: default
tags: allonge
---

In [Functional Mixins], we discussed mixing functionality *into* JavaScript classes, changing the class. We observed that this has pitfalls when applied to a class that might already be in use elsewhere, but is perfectly cromulant when used as a technique to build a class from scratch. When used strictly to build a class, mixins help us decompose classes into smaller entities with focused responsibilities that can be shared between classes as necessary.

[Functional Mixins]: http://raganwald.com/2015/06/17/functional-mixins.html

Let's recall our helper for making a functional mixin. We'll just call it `mixin`:

{% highlight javascript %}
function mixin (behaviour, sharedBehaviour = {}) {
  const instanceKeys = Reflect.ownKeys(behaviour);
  const sharedKeys = Reflect.ownKeys(sharedBehaviour);
  const typeTag = Symbol('isa');

  function _mixin (target) {
    for (let property of instanceKeys)
      Object.defineProperty(target, property, { value: behaviour[property] });
    Object.defineProperty(target, typeTag, { value: true });
    return target;
  }
  for (let property of sharedKeys)
    Object.defineProperty(_mixin, property, {
      value: sharedBehaviour[property],
      enumerable: sharedBehaviour.propertyIsEnumerable(property)
    });
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: (i) => !!i[typeTag]
  });
  return _mixin;
}
{% endhighlight %}

This creates a function that mixes behaviour into any target, be it a class prototype or a standalone object. There is a convenience capability of making "static" or "shared" properties of the the function, and it even adds some simple `hasInstance` handling so that the `instanceof` operator will work.

Here we are using it on a class' prototype:

{% highlight javascript %}
const BookCollector = mixin({
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
};

BookCollector(Person.prototype);

const president = new Person('Barak', 'Obama')

president
  .addToCollection("JavaScript Allongé")
  .addToCollection("Kestrels, Quirky Birds, and Hopeless Egocentricity");

president.collection()
  //=> ["JavaScript Allongé","Kestrels, Quirky Birds, and Hopeless Egocentricity"]
{% endhighlight %}

### mixins just for classes

It's very nice that our mixins support any kind of target, but let's make them class-specific:

{% highlight javascript %}
function mixin (behaviour, sharedBehaviour = {}) {
  const instanceKeys = Reflect.ownKeys(behaviour);
  const sharedKeys = Reflect.ownKeys(sharedBehaviour);
  const typeTag = Symbol('isa');

  function _mixin (clazz) {
    for (let property of instanceKeys)
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour[property],
        writable: true
      });
    Object.defineProperty(clazz.prototype, typeTag, { value: true });
    return clazz;
  }
  for (let property of sharedKeys)
    Object.defineProperty(_mixin, property, {
      value: sharedBehaviour[property],
      enumerable: sharedBehaviour.propertyIsEnumerable(property)
    });
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: (i) => !!i[typeTag]
  });
  return _mixin;
}
{% endhighlight %}

This version's `_mixin` function mixes instance behaviour into a class's prototype, so we gain convenience at the expense of flexibility:

{% highlight javascript %}
const BookCollector = mixin({
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
};

BookCollector(Person);

const president = new Person('Barak', 'Obama')

president
  .addToCollection("JavaScript Allongé")
  .addToCollection("Kestrels, Quirky Birds, and Hopeless Egocentricity");

president.collection()
  //=> ["JavaScript Allongé","Kestrels, Quirky Birds, and Hopeless Egocentricity"]
{% endhighlight %}

So far, nice, but it feels a bit bolted-on-after-the-fact. Let's take advantage of the fact that [Classes are Expressions]:

[Classes are Expressions]: http://raganwald.com/2015/06/04/classes-are-expressions.html

{% highlight javascript %}
const BookCollector = mixin({
  addToCollection (name) {
    this.collection().push(name);
    return this;
  },
  collection () {
    return this._collected_books || (this._collected_books = []);
  }
});

const Person = BookCollector(class {
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
});
{% endhighlight %}

This is structurally nicer, it binds the mixing in of behaviour with the class declaration in one expression, so we're getting away from this idea of mixing things into classes after they're created.

But (there's always a but), our pattern has three different elements (the name being bound, the mixin, and the class being declared). And if we wanted to mix two or more behaviours in, we'd have to nest the functions like this:

{% highlight javascript %}
const Author = mixin({
  writeBook (name) {
    this.books().push(name);
    return this;
  },
  books () {
    return this._books_written || (this._books_written = []);
  }
});

const Person = Author(BookCollector(class {
  // ...
}));
{% endhighlight %}

Some people find this "clear as day," arguing that this is a simple expression taking advantage of JavaScript's simplicity. The code behind `mixin` is simple and easy to read, and if you understand prototypes, you understand everything in this expression.

But others want a language to give them "magic," an abstraction that they learn on the outside. At the moment, JavaScript has no "magic" for mixing functionality into classes. But what if there were?

### class decorators

There is a well-regarded proposal to add Python-style [class decorators] to JavaScript in the next major revision after ECMAScript 2015.

[class decorators]: https://github.com/wycats/javascript-decorators

A decorator is a function that operates on a class. Here's a very simple example from the aforelinked implementation:

{% highlight javascript %}
function annotation(target) {
   // Add a property on target
   target.annotated = true;
}

@annotation
class MyClass {
  // ...
}

MyClass.annotated
  //=> true
{% endhighlight %}

As you can see, `annotation` is a class decorator, and it takes a class as an argument. The function can do anything, including modifying the class or the class's prototype. If the decorator function doesn't return anything, the class' name is bound to the modified class.[^adv]

[^adv]: Although this example doesn't show it, if it returns a constructor function, that is what will be assigned to the class' name. This allows the creation of purely functional mixins and other interesting techniques that are beyond the scope of this post.

A class is "decorated" with the function by preceding the definition with `@` and an expression evaluating to the decorator. in the simple example, we use a variable name.

Hmmm. A function that modifies a class, you say? Let's try it:

{% highlight javascript %}
const BookCollector = mixin({
  addToCollection (name) {
    this.collection().push(name);
    return this;
  },
  collection () {
    return this._collected_books || (this._collected_books = []);
  }
});

@BookCollector
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
};

const president = new Person('Barak', 'Obama')

president
  .addToCollection("JavaScript Allongé")
  .addToCollection("Kestrels, Quirky Birds, and Hopeless Egocentricity");

president.collection()
  //=> ["JavaScript Allongé","Kestrels, Quirky Birds, and Hopeless Egocentricity"]
{% endhighlight %}

You can also mix in multiple behaviours with decorators:

{% highlight javascript %}
const BookCollector = mixin({
  addToCollection (name) {
    this.collection().push(name);
    return this;
  },
  collection () {
    return this._collected_books || (this._collected_books = []);
  }
});

const Author = mixin({
  writeBook (name) {
    this.books().push(name);
    return this;
  },
  books () {
    return this._books_written || (this._books_written = []);
  }
});

@BookCollector @Author
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
};
{% endhighlight %}

And if you want to use decorators to emulate [Purely Functional Composition], it's a fairly simple pattern:

[Purely Functional Composition]: http://raganwald.com/2015/06/20/purely-functional-composition.html

{% highlight javascript %}
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
};

@BookCollector @Author
class BookLover extends Person {};
{% endhighlight %}

Class decorators provide a compact, "magic" syntax that is closely tied to the construction of the class. They also require understanding one more kind of syntax. But some argue that having different syntax for different things aids understandability, and that having both `@foo` for decoration and `bar(...)` for function invocation is a win.

### using decorators

Decorators have not been formally approved, however there are various implementations available for transpiling decorator syntax to ES5 syntax. The examples in this post were evaluated with [Babel](http://babeljs.io).

If you prefer syntactic sugar that gives the appearance of a declarative construct, combining a `mixin` function with [ES.later]'s class decorators does the trick.[^ESdotlater]

(discuss on [hacker news](https://news.ycombinator.com/item?id=9786706))

---

[^ESdotlater]: By "ES.later," we mean some future version of ECMAScript that is likely to be approved eventually, but for the moment exists only in transpilers like [Babel](http://babeljs.io). Obviously, using any ES.later feature in production is a complex decision requiring many more considerations than can be enumerated in a blog post.
