---
title: "Beyond Simple Mixins, Part I"
layout: default
tags: [allonge, noindex]
---

[![Crossed Wires](/assets/images/crossed-wires.jpg)](https://www.flickr.com/photos/howardlake/4834299551/)

*Mixins* solve a very common problem in class-centric OOP: For non-trivial applications, there is a very messy *many-to-many* relationship between behaviour and classes, and it does not neatly decompose into a tree.

The mixin solution to this problem is to leave classes in a single inheritance hierarchy, and to mix additional behaviour into individual classes as needed. Here's a vastly simplified functional mixin for classes:[^simplified]

[^simplified]: A production-ready implementation would handle more than just methods. For example, it would allow you to mix getters and setters into a class, and it would allow us to attach properties or methods to the target class itself, and not just instances. But this simplified version handles methods, simple properties, "mixin properties," and `instanceof`, and that is enough for the purposes of investigating OO design questions.

{% highlight javascript %}
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
{% endhighlight %}

This is more than enough to do a lot of very good work in JavaScript, but it's just the starting point. Here's how we put it to work:

{% highlight javascript %}
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
{% endhighlight %}

[class decorators]: https://github.com/wycats/javascript-decorators

### multiple inheritance

If you want to mix behaviour into a class, mixins do the job very nicely. But sometimes, people want more. They want **multiple inheritance**. Meaning, what they really want is for class `Executive` to inherit from `Person` *and* from `BookCollector`.

What's the difference between `Executive` mixing `BookCollector` in and `Executive` inheriting from `BookCollector`?

0. If `Executive` mixes `BookCollector` in, the properties `addToCollection` and `collection` become own properties of `Executive`'s prototype. If `Executive` inherits from `BookCollector`, they don't.
0. If `Executive` mixes `BookCollector` in, `Executive` can't override methods of `BookCollector`. If `Executive` inherits from `BookCollector`, it can.
0. If `Executive` mixes `BookCollector` in, `Executive` can't override methods of `BookCollector`, and therefore it can't make a method that overrides a method of `BookCollector` and then uses `super` to call the original. If `Executive` inherits from `BookCollector`, it can.

If JavaScript had multiple inheritance, we could extend a class with more than one superclass:

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
{% endhighlight %}

This hypothetical TimeSensitiveTodo` extends both `Todo` and `Coloured`, and it overrides `toHTML` from `Todo` as well as overriding `getColourRGB` from `Coloured`.

However, JavaScript does not have "true" multiple inheritance, and therefore this code does not work. But we can simulate multiple inheritance for cases like this. The way it works is to step back and ask ourselves, "What would we do if we didn't have mixins or multipel inheritance?"

The answer is, we'd create an arbitrary hierarchy, like this:

{% highlight javascript %}
class Todo {
  // ...
}

class ColouredTodo extends Todo {
  // ...
}

class TimeSensitiveTodo extends ColouredTodo {
  // ...
}
{% endhighlight %}

By making `ColouredTodo` extend `Todo`, `TimeSensitiveTodo` can extend `ColouredTodo` and override methods from both. This is exactly what most programmers do, and we know that it is an anti-pattern, as it leads to duplicated class behaviour and deep class hierarchies.

But.

What if, instead of manually creating this hierarchy, we use our simple mixins to do the work for us? We can take advantage of the fact that [classes are expressions](http://raganwald.com/2015/06/04/classes-are-expressions.html), like this:

{% highlight javascript %}
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
{% endhighlight %}

Thus, we have a `ColouredTodo` that we can extend and override, but we also have our `Coloured` behaviour in a mixin we can use anywhere we like without duplicating its functionality in our code. The full solution looks like this:

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
{% endhighlight %}

The key snippet is `let ColouredTodo = Coloured(class extends Todo {});`, it turns a mixin into a subclass that can be extended and overridden. We can turn this pattern into a function:

{%highlight javascript %}
let subclassFactory = (behaviour) => {
  let mixBehaviourInto = mixin(behaviour);

  return (superclazz) => mixBehaviourInto(class extends superclazz {});
}
{% endhighlight %}

Using `subclassFactory`, we wrap the class we want to extend, instead of the class we are declaring. Like this:

{% highlight javascript %}
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
{% endhighlight %}

The syntax of `class TimeSensitiveTodo extends ColouredAsWellAs(ToDo)` says exactly what we mean: We are extending our `Coloured` behaviour as well as extending `ToDo`.[^fagnani]

[^fagnani]: Justin Fagnani named this pattern "subclass factory" in his essay ["Real" Mixins with JavaScript Classes](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/). It's well worth a read, and his implementation touches on other matters such as optimizing performance on modern JavaScript engines.

### another way forward

The solution subclass factories offer is emulating inheritance from more than one superclass. That, in turn, makes it possible to override methods from our superclass as well as the behaviour we want to mix in. Which is fine, but we don't actually want multiple inheritance!

It's just that we're looking at an overriding/extending methods problem, but we're holding an inheritance-shaped hammer. So it looks like a multiple-inheritance nail. But what if we address the problem of overriding and extending methods directly, rather than indirectly via multiple inheritance?

### simple overwriting with simple mixins

The simplest start to this is to note that in the first pass of our `mixin` function, we blindly copy properties from the mixin into the class's prototype, whether the class defines those properties or not. So if we write:

{%highlight javascript %}
let RED        = { r: 'FF', g: '00', b: '00' },
    WHITE      = { r: 'FF', g: 'FF', b: 'FF' },
    ROYAL_BLUE = { r: '41', g: '69', b: 'E1' },
    LIGHT_BLUE = { r: 'AD', g: 'D8', b: 'E6' };

let BritishRoundel = mixin({
  shape () {
    return 'round';
  },

  roundels () {
    return [RED, WHITE, ROYAL_BLUE];
  }
})

let CanadianAirForceRoundel = BritishRoundel(class {
  roundels () {
    return [RED, WHITE, LIGHT_BLUE];
  }
});

new CanadianAirForceRoundel().roundels()
  //=> [
    {"r":"FF","g":"00","b":"00"},
    {"r":"FF","g":"FF","b":"FF"},
    {"r":"41","g":"69","b":"E1"}
  ]
{% endhighlight %}

Our `CanadianAirForceRoundel`'s third stripe winds up being regular blue instead of light blue, because the `roundels` method from the mixin `BritishRoundel` overwrites its own. (Yes, this is a ridiculous example, but it gets the point across.)

We can fix this by not overwriting a property if the class already defines it. That's not so hard:

{% highlight javascript %}
function mixin (behaviour) {
  let instanceKeys = Reflect.ownKeys(behaviour);
  let typeTag = Symbol('isa');

  function _mixin (clazz) {
    for (let property of instanceKeys)
      if (!clazz.prototype.hasOwnProperty(property)) {
        Object.defineProperty(clazz.prototype, property, {
          value: behaviour[property],
          writable: true
        });
      }
    Object.defineProperty(clazz.prototype, typeTag, { value: true });
    return clazz;
  }
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: (i) => !!i[typeTag]
  });
  return _mixin;
}
{% endhighlight %}

Now we can override `roundels` in `CanadianAirForceRoundel` while mixing `shape` in just fine:

{% highlight javascript %}
new CanadianAirForceRoundel().roundels()
  //=> [
    {"r":"FF","g":"00","b":"00"},
    {"r":"FF","g":"FF","b":"FF"},
    {"r":"AD","g":"D8","b":"E6"}
  ]
{% endhighlight %}

### combining advice with simple mixins

The above adjustment to 'mixin' is fine for simple overwriting, but what about when we wish to modify or extend a method's behaviour while still invoking the original? Recall that our `TimeSensitiveTodo` example performed a simple override of `getColourRGB`, but its implementation of `toHTML` used `super` to invoke the method it was overriding.

Our adjustment will not allow a method in the class to invoke the body of a method in a mixin.



---

### notes
