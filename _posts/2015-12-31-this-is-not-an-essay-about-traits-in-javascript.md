---
title: "This is not an essay about 'Traits in Javascript' (updated)"
layout: default
tags: [allonge]
---

[![Scott Penkava, Untitled (Portrait of Felix in NY), 2009](/assets/images/lego-portrait.jpg)](https://www.flickr.com/photos/sixteen-miles/3757674953)

> A **trait** is a concept used in object-oriented programming: a trait represents a collection of methods that can be used to extend the functionality of a class. Essentially a trait is similar to a class made only of concrete methods that is used to extend another class with a mechanism similar to multiple inheritance, but paying attention to name conflicts, hence with some support from the language for a name-conflict resolution policy to use when merging.—[Wikipedia][wikitrait]

[wikitrait]: https://en.wikipedia.org/wiki/Trait_(computer_programming)

A trait is like a [mixin](http://raganwald.com/2015/06/26/decorators-in-es7.html), however with a trait, we can not just define new behaviour, but also define ways to extend or override existing behaviour. Traits are a first-class feature languages like [Scala](http://raganwald.com/2015/06/26/decorators-in-es7.html) and [Rust](https://doc.rust-lang.org/stable/book/traits.html). Traits are also available as a standard library in many other languages, including [Racket](http://docs.racket-lang.org/reference/trait.html). Most interestingly, traits are a feature of the [Self][self] programming language, one of the inspirations for JavaScript.

[self]: https://en.wikipedia.org/wiki/Self_(programming_language)#Traits

Traits are not built into JavaScript, and there is no TC-39 proposal for them yet, but we can make easily lightweight traits out of the features JavaScript already has.

> Our problem is that we want to be able to override or extend functionality from shared behaviour, whether that shared behaviour is defined as a class or as functionality to be mixed in.

### our toy problem

Here's a toy problem we solved elsewhere with a [subclass factory][mi-sf-ma] that in turn is made out of a an extremely simple mixin.[^extremely-simple]

[^extremely-simple]: The implementations given here are extremely simple in order to illustrate a larger principle of how the pieces fit together. A production library based on these principles would handle needs we've seen elsewhere, like defining "class" or "static" properties, making `instanceof` work, and appeasing the V8 compiler's optimizations.

To recapitulate from the very beginning, we have a `Todo` class:

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
{% endhighlight %}

And we have the idea of "things that are coloured:"

{% highlight javascript %}
class Coloured {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  }

  getColourRGB () {
    return this.colourCode;
  }
}
{% endhighlight %}

And we want to create a time-sensitive to-do that has colour according to whether it is overdue, close to its deadline, or has plenty of time left. If we had multiple inheritance, we would write:

{% highlight javascript %}
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

But we don't have multiple inheritance. In languages where mixing in functionality is difficult, we can fake a solution by having `ColouredTodo` inherit from `Todo`:

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
{% endhighlight %}

The drawback of this approach is that we can no longer make other kinds of things "coloured" without making them also todos. For example, if we had coloured meetings in a time management application, we'd have to write:

{% highlight javascript %}
class Meeting {
  // ...
}

class ColouredMeeting extends Meeting {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  }

  getColourRGB () {
    return this.colourCode;
  }
}
{% endhighlight %}

This forces us to duplicate "coloured" functionality throughout our code base. But thanks to mixins, we can have our cake and eat it to: We can make `ColouredAsWellAs` a kind of mixin that makes a new subclass and then mixes into the subclass. We call this a "subclass factory:"

{% highlight javascript %}
function ClassMixin (behaviour) {
  const instanceKeys = Reflect.ownKeys(behaviour);

  return function mixin (clazz) {
    for (let property of instanceKeys)
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour[property],
        writable: true
      });
    return clazz;
  }
}

const SubclassFactory = (behaviour) =>
  (superclazz) => ClassMixin(behaviour)(class extends superclazz {});

const ColouredAsWellAs = SubclassFactory({
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

This allows us to override both our `Todo` methods and the `ColourAsWellAs` methods. And elsewhere, we can write:

{% highlight javascript %}
const ColouredMeeting = ColouredAsWellAs(Meeting);
{% endhighlight %}

Or perhaps:

{% highlight javascript %}
class TimeSensitiveMeeting extends ColouredAsWellAs(Meeting) {
  // ...
}
{% endhighlight %}

To summarize, our problem is that we want to be able to override or extend functionality from shared behaviour, whether that shared behaviour is defined as a class or as functionality to be mixed in. Subclass factories are one way to solve that problem.

Now we'll solve the same problem with traits.

### defining lightweight traits

Let's start with our `ClassMixin`. We'll modify it slightly to insist that it never attempt to define a method that already exists, and we'll use that to create `Coloured`, a function that defines two methods:

{% highlight javascript %}
function Define (behaviour) {
  const instanceKeys = Reflect.ownKeys(behaviour);

  return function define (clazz) {
    for (let property of instanceKeys)
      if (!clazz.prototype[property]) {
        Object.defineProperty(clazz.prototype, property, {
          value: behaviour[property],
          writable: true
        });
      }
      else throw `illegal attempt to override ${property}, which already exists.
  }
}

const Coloured = Define({
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  }
});
{% endhighlight %}

`Coloured` is now a function that modifies a class, adding two methods provided that they don't already exist in the class.

But we need a variation that "overrides" `getColourRGB`. We can write a variation of `Define` that always overrides the target's methods, and passes in the original method as the first parameter. This is similar to "around" [method advice][ma-mj]:

{% highlight javascript %}
function Override (behaviour) {
  const instanceKeys = Reflect.ownKeys(behaviour);

  return function overrides (clazz) {
    for (let property of instanceKeys)
      if (!!clazz.prototype[property]) {
        let overriddenMethodFunction = clazz.prototype[property];

        Object.defineProperty(clazz.prototype, property, {
          value: function (...args) {
            return behaviour[property].call(this, overriddenMethodFunction.bind(this), ...args);
          },
          writable: true
        });
      }
      else throw `attempt to override non-existant method ${property}`;
    return clazz;
  }
}

const DeadlineSensitive = Override({
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
  },

  toHTML (original) {
    let rgb = this.getColourRGB();

    return `<span style="color: #${rgb.r}${rgb.g}${rgb.b};">${original()}</span>`;
  }
});
{% endhighlight %}

`Define` and `Override` are *protocols*: They define whether methods may conflict, and if they do, how that conflict is resolved. `Define` prohibits conflicts, forcing us to pick another protocol. `Override` permits us to write a method that overrides an existing method and (optionally) call the original.

### composing protocols

We *could* now write:

{% highlight javascript %}
const TimeSensitiveTodo = DeadlineSensitive(
  Coloured(
    class TimeSensitiveTodo extends ToDo {
      constructor (name, deadline) {
        super(name);
        this.deadline = deadline;
      }
    }
  )
);
{% endhighlight %}

Or:

{% highlight javascript %}
@DeadlineSensitive
@Coloured
class TimeSensitiveTodo extends ToDo {
  constructor (name, deadline) {
    super(name);
    this.deadline = deadline;
  }
}
{% endhighlight %}

But if we want to use `DeadlineSensitive` and `Coloured` together more than once, we can make a lightweight trait with simple function composition:

{% highlight javascript %}
const pipeline =
  (...fns) =>
    (value) =>
      fns.reduce((acc, fn) => fn(acc), value);

const SensitizeTodos = pipeline(Coloured, DeadlineSensitive);

@SensitizeTodos
class TimeSensitiveTodo extends ToDo {
  constructor (name, deadline) {
    super(name);
    this.deadline = deadline;
  }
}
{% endhighlight %}

Now `SensitizeTodos` combines defining methods with overriding existing methods: We've built a lightweight trait by composing protocols.

And that's all a trait is: The composition of protocols. And we don't need a bunch of new keywords or decorators (like @overrides) to do it, we just use the functional composition that is so easy and natural in JavaScript.

### other protocols

We can incorporate other protocols. Two of the most common are prepending behaviour to an existing method, or appending behaviour to an existing method:

{% highlight javascript %}
function Prepends (behaviour) {
  const instanceKeys = Reflect.ownKeys(behaviour);

  return function prepend (clazz) {
    for (let property of instanceKeys)
      if (!!clazz.prototype[property]) {
        let overriddenMethodFunction = clazz.prototype[property];

        Object.defineProperty(clazz.prototype, property, {
          value: function (...args) {
            const prependValue = behaviour[property].apply(this, args);

            if (prependValue === undefined || !!prependValue) {
              return overriddenMethodFunction.apply(this, args);;
            }
          },
          writable: true
        });
      }
      else throw `attempt to override non-existant method ${property}`;
    return clazz;
  }
}

function Append (behaviour) {
  const instanceKeys = Reflect.ownKeys(behaviour);

  function append (clazz) {
    for (let property of instanceKeys)
      if (!!clazz.prototype[property]) {
        let overriddenMethodFunction = clazz.prototype[property];

        Object.defineProperty(clazz.prototype, property, {
          value: function (...args) {
            const returnValue = overriddenMethodFunction.apply(this, args);

            behaviour[property].apply(this, args);
            return returnValue;
          },
          writable: true
        });
      }
      else throw `attempt to override non-existant method ${property}`;
    return clazz;
  }
}
{% endhighlight %}

We can compose a lightweight trait using any combination of `Define`, `Override`, `Prepend`, and `Append`, and the composition is handled by `pipeline`, a plain old function composition tool.

Lightweight traits are nothing more than protocols, composed in a simple and easy-to-understand way. And then applied to simple classes, in a direct and obvious manner.

### what do lightweight traits tell us?

Once again we have seen the strength of JavaScript: We don't need a lot of special language features baked in, provided we are careful to make our existing features out of functions and simple objects. We can then compose them at will using simple tools to make the language features we need.

Over time, when features become popular, those features will get added to the language. But like so many other things either added to ES6 or proposed for future versions, features begin with people rolling their own tools. JavaScript makes this exceptionally easy.

We just have to start with simple things, and combine them in simple ways.

[![Simplicity is the peak of civilization](/assets/images/simplicity.jpg)](https://www.flickr.com/photos/gi/361143108)

### the heavyweight. and the light.

When developing employing a new approach, like traits, there are two ways to do it. The heavyweight way, and the lightweight way.

The lightweight way, as shown here, attempts to be as "JavaScript-y" as possible. For example, using functions for protocols and composing them. With the lightweight way, everything is still just a function, or just an object, or just a class with just a prototype. Lightweight code interoperates 100% with code from other libraries. Lightweight approaches can be incrementally added to an existing code base, refactoring a bit here and a bit there.

The heavyweight way would [greenspun] a special class hierarchy with support for traits baked in. The heavyweight way would produce "classes" that don't easily interoperate with other libraries or code, so you can't incrementally make changes: You have to "boil the ocean" and commit 100% to the new approach. Heavyweight approaches often demand new kinds of tooling in the build pipeline.

[greenspun]: https://en.wikipedia.org/wiki/Greenspun%27s_tenth_rule

When we do things the lightweight way, we make very small bets on their benefits. It's easy to change our mind and abandon the approach in favour of something else. because we make small bets along the way, we collect on the small benefits continuously: We don't have to kick off a massive rewrite of our code base to start using lightweight traits, for example. We just start using them as little or as much as we like, and immediately start benefitting from them.

> "A language that doesn't affect the way you think about programming isn't worth learning."—Alan J. Perlis

Every tool affects the way we think about programming. But heavyweight tools force us to think about the heavyweight tooling. That thinking isn't always portable to another tool or another code base.

Whereas lightweight tools are simple things, composed together in simple ways. If we move to a different code base or tool, we can take our experience with the simple things along. With lightweight traits, for example, we are not teaching ourselves how to "program with traits," we're teaching ourselves how to "decompose behaviour," how to "compose functions" and how to "write functions that decorate entities."

These are all fundamental ideas that apply everywhere, even if we don't end up applying them to build traits every time we write code. Lightweight thinking is portable and future-proof.

This essay is not, in the end, about how to write traits in JavaScript. Traits are just an example of how the lightweight approach is particularly easy in JavaScript, and an explanation of why that matters.

*fin*.

---

### postscript from the author: "happy new year!"

As I write this on New Year's Eve, 2015, I am struck by how much this essay is the same as almost every other essay I've written about JavaScript. That's partly because my brain is shaped by "lightweight" thinking, and partly because JavaScript, for all of its faults, and despite attempts to write heavyweight frameworks for it, is a lightweight language.

People often say that JavaScript wants to be a functional programming language. I believe this is not the whole story: I believe JavaScript wants to be a lightweight programming language, and functions-as-first-class-entities is a deeply lightweight idea. the same is true of newer ideas like classes-as-expressions and decorators-as-functions.

But I repeat myself. Again.

Writing in this modern world is a conversation. With a language. With readers. With fellow language enthusiasts who also write. But conversations run their course. When you find yourself repeating repeating repeating yourself... Perhaps you have made your contribution and it's time to sidle out and order another whiskey.

I will never say "never again," but if you do not hear from me on the subject of JavaScript in the future, it is not because I have nothing to say, but rather because I think I have already tried to say it.

Thank you, and I am excited to see what **you** have to say, in words or in code, in 2016.

—Reginald Braithwaite, Toronto, 2015-12-31

---

more reading:

- [Prototypes are Objects (and why that matters)](http://raganwald.com/2015/06/10/mixins.html)
- [Classes are Expressions (and why that matters)](http://raganwald.com/2015/06/04/classes-are-expressions.html)
- [Functional Mixins in ECMAScript 2015](http://raganwald.com/2015/06/17/functional-mixins.html)
- [Using ES.later Decorators as Mixins](http://raganwald.com/2015/06/26/decorators-in-es7.html)
- [Method Advice in Modern JavaScript][ma-mj]
- [`super()` considered hmmm-ful](http://raganwald.com/2015/12/23/super-considered-hmmmful.html)
- [JavaScript Mixins, Subclass Factories, and Method Advice][mi-sf-ma]
- [This is not an essay about 'Traits in Javascript'][traits]

[traits]: http://raganwald.com/2015/12/31/this-is-not-an-essay-about-traits-in-javascript.html
[mi-sf-ma]: http://raganwald.com/2015/12/28/mixins-subclass-factories-and-method-advice.html
[ma-mj]: http://raganwald.com/2015/08/05/method-advice.html

notes:

