---
title: super() considered hmmm-ful
layout: default
tags: [allonge, noindex]
---

[![Threat Display](/assets/images/threat-display.jpg)](https://www.flickr.com/photos/winnu/7292115026)

I highly recommend reading Justin Fagnani's ["Real" Mixins with JavaScript Classes](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/). To summarize my understanding, Justin likes using "mixins," but takes issues with the way they are implemented as described in things like [Using ES7 Decorators as Mixins](http://raganwald.com/2015/06/26/decorators-in-es7.html).

My understanding is that Justin wants to be able to have a fully open many-to-many relationship between meta-objects and objects, that's why Justin wants more than just a tree hierarchy of classes. This is great, just about everyone agrees that flattened hierarchies are superior to deep hierarchies, especially when the deep hierarchies are an accidental complexity created by trying to fake a many-to-many relationship using a tree.

Justin also wants to have mixins be much more equivalent to classes, especially with respect to being able to override a method from either a mixin or a class, and to be able to call `super()` in such a method to call the mixin's original definition, just as you would for a class.

Finally, Justin wants to create code that existing engines can optimize easily, and avoid changing the "shape" of prototypes.

I don't treat these objections as personal criticism: They describe what Justin needs from a tool they intend to use in production, while I am giving examples of tools for the purpose of understanding how pieces of the language can fit together in extremely simple and elegant ways.

One of the things I like the most about Justin's article is that it shines a light on two longstanding debates in OOP, both going back at least as far as Smalltalk. The first is about deep class hierarchies. My opinion can be expressed in three words: [Don't do that!](http://raganwald.com/2014/03/31/class-hierarchies-dont-do-that.html)

The second debate is more subtle, and it concerns overriding methods.

It's a massive oversimilification to suggest that there are only two sides to that debate, but for the purpose of this discussion, there are two different OOP tribes. One of them is called **virtual-by-default**, and the other is called **final-by-default**.

### virtual-by-default

In languages like Smalltalk and almost every other "dynamically typed" OO descendent, including JavaScript, you can override any method at any level in the class hierarchy. In languages like Javascript and Ruby, you can even override a method within a single object.

When the method is invoked on an object, the most-specific version of the method is invoked. The other versions are available via various methods, from denoting them by absolute name (e.g. `SomeSuperclassName.prototype.foo.call(this, 'bar', 'baz')`) or using a magic keyword, `super` (e.g. `super('bar', 'baz')`).

The canonical name for this is [Dynamic Dispatch], because the method invocation is dynamically dispatched to the most appripriate method implementation. Such methods or functions are often called [virtual functions], and thus a language where methods are automatically virtual is called "virtual-by-default."

[Dynamic Dispatch]: https://en.wikipedia.org/wiki/Dynamic_dispatch
[virtual function]: https://en.wikipedia.org/wiki/Virtual_function

JavaScript out of the box is very definately virtual-by-default. The technical opposite of a virtual-by-default language is a *static-by-default* language. In a static-by-default language, no matter whether the function is overridden or not, the implementation to be used is chosen at compile time based on the declared class of the receiver.

For example, making up our own little JavaScript flavour that has manifest typing:

```
class Foo {
  toString () {
    return "I am a foo";
  }
}

class Bar extends Foo {
  toString () {
    return "I am a bar";
  }
}

Foo f = new Bar();
console.log(f.toString());
```

In a virtual-by-default language, the console logs `I am a bar`. In a static-by-default language, the console logs `I am a foo`, because even though the object `f` is a `Bar`, it is declared as a `Foo`, and the compiler translates `f.toString()` into roughly `Foo.prototype.toString.call(f)`.

C++ is a static-by-default language. If you want dynamic dispatching, you use a special `virtual` keyword to indicate which functions should be dynamically dispatched. If our hypothetical JavaScript flavour was static-by-default and we wanted `toString()` to be a virtual function, we would write:

```
class Foo {
  virtual toString () {
    return "I am a foo";
  }
}

class Bar extends Foo {
  virtual toString () {
    return "I am a bar";
  }
}

Foo f = new Bar();
console.log(f.toString());
```

After much experience with errors from forgetting to use the `virtual` keyword, most programming languages abandoned static-by-default and went with virtual-by-default.

### final-by-default

If most languages are settled on virtual-by-default, how can there be another tribe? Well, the static-by-default people had two excellent reasons for liking static dispatch. The first was speed, and they loved speed. But as things got faster, that implementation consideration became less-and-less persuasive.

But there was another argument, a semantic argument. The argument was this. If we write:

```
class Foo {
  toString () {
    return "I am a foo";
  }
}
```
We are defining `Foo` to be:

1. A class
2. That has a method, `toString`
3. That returns `"I am a foo"`

Everyone agrees on the first two points, but OO programmers are split on the third point. Some say that a `Foo` is defined to return `"I am a foo"`, others say that it returns `"I am a foo"` by *default*, but any subclass of `Foo` can override this,a nd it could return anything, raise an exception, or erase your hard drive and email 419 scam letters to everyone in your contacts, you can't tell unless you examine an individual object that happens to be declared to be a `Foo` and see how it actually behaves.

When the Java language was released, it was virtual-by-default, but it didn't ignore this question. Java introduced the `final` keyword. When a method was declared `final`, it was *illegal to override it*, and if you tried, you got a compiler error.

If our imaginary JavaScript dialog worked this way, this code would not compile at all:

```
class Foo {
  final toString () {
    return "I am a foo";
  }
}

class Bar extends Foo {
  toString () {
    return "I am a bar";
  }
}
// => Error: Method toString of superclass Foo is final and cannot be overridden.
```

In Java, `final` was optional. But many people felt that like C++, the designers got it backwards. They felt that by default, all methods should be final. The special treatment should be for virtual methods, not for final methods.

If our dialect worked like that, all methods would be virtual, but if we wanted to allow a method to be overridden, we would use a special keyword, like `default`:

```
class Foo {
  toString () {
    return "I am a foo";
  }
}

class Bar extends Foo {
  toString () {
    return "I am a bar";
  }
}
// => Error: Method toString of superclass Foo is final and cannot be overridden.
```

```
class Foo {
  default toString () {
    return "I am a foo";
  }
}

class Bar extends Foo {
  toString () {
    return "I am a bar";
  }
}
//=> No errors, because Foo#toString is a default method.
```

### what's up with final-by-default

Overriding methods is often taught as a central plank of OOP. So why would there by a hardy band of dissenters?

The problem final-by-default tries to solve is called the [Liskov Substitution Principle] or "LSP." It states that if a `Bar` is-a `Foo`, you ought to be able to take any piece of code that works for a `Foo`, and substitute a `Bar`, and it should just work.

[Liskov Substitution Principle]: https://en.wikipedia.org/wiki/Liskov_substitution_principle

Overriding public methods is the easiest way to break LSP. Not always, of course. If you have a `HashMap`, you might override the implementation of its `[]` and `[]=` methods in such a way that it has the exact same external behaviour.

But in general, if you treat methods as "defaults, open to overriding in any arbitrary way," you are abandoning LSP. Is that a bad thing? Well, many people feel that it makes object-oriented programs very difficult to reason about. Or in plain English, *prone to defects*.

Another principle you will hear discussed in this vein is called the [Open-Closed Principle]: "Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification."

[Open-Closed Principle]: https://en.wikipedia.org/wiki/Open/closed_principle

In our examples above, overriding `toString` in `Bar` modifies the definition of `Foo`, because it changes the definition of the behaviour of objects that are instances of `Foo`. Whereas, if we write:

```
class Bar extends Foo {
  toArray () {
    return this.toString().split('');
  }
}
```

Now we are extending `Foo` for those objects that are both a `Foo` and a `Bar`, but not modifying the definition of `Foo`.[^well-actually]

[^well-actually]: As orginally professed, the Open-Closed Principle had more to do with saying that a language or system should allow things to be modified by adding subclasses and so forth, while strongly discouraging changing original things. So in the late eighties and early nineties, overriding methods was in keeping with the Open/Closed Principle, because superclasses remeain closed to modification. This was a good idea at the time, because it encouraged building systems that didn't have [brittle dependencies](https://en.wikipedia.org/wiki/Fragile_base_class). It has since evolved to have much more in common with LSP.

The "final-by-default" tribe of OO programmers like their programs to confirm to LSP and Open/Closed. This makes them nervious of language features that encourage violations.

### enter super()-man


---

notes:
