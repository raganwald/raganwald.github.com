---
title: super() considered hmmm-ful
layout: default
tags: [allonge]
---

[![Threat Display](/assets/images/threat-display.jpg)](https://www.flickr.com/photos/winnu/7292115026)

I highly recommend reading Justin Fagnani's ["Real" Mixins with JavaScript Classes](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/). To summarize my understanding, Justin likes using "mixins," but takes issue with the way they are implemented as described in things like [Using ES7 Decorators as Mixins](http://raganwald.com/2015/06/26/decorators-in-es7.html).[^personal]

- Justin wants to be able to have a fully open many-to-many relationship between meta-objects and objects.
- Justin also wants to have mixins be much more equivalent to classes, especially with respect to being able to override a method from either a mixin or a class, and to be able to call `super()` in such a method to call the mixin's original definition, just as you would for a class.
- Finally, Justin wants to create code that existing engines can optimize easily, and avoid changing the "shape" of prototypes.

[^personal]: I don't treat these objections as personal criticism: They describe what Justin needs from a tool they intend to use in production, while I am giving examples of tools for the purpose of understanding how pieces of the language can fit together in extremely simple and elegant ways.

One of the things I like the most about Justin's article is that it shines a light on two longstanding debates in OOP, both going back at least as far as Smalltalk. The first is about deep class hierarchies. My opinion can be expressed in three words: [Don't do that!](http://raganwald.com/2014/03/31/class-hierarchies-dont-do-that.html) Just about everyone agrees that flattened hierarchies are superior to deep hierarchies, especially when the deep hierarchies are an accidental complexity created by trying to fake a many-to-many relationship using a tree.

The second debate is more subtle, and it concerns overriding methods. It's a massive oversimplification to suggest that there are only two sides to that debate, but for the purpose of this discussion, there are two different OOP tribes. One of them is called **virtual-by-default**, and the other is called **final-by-default**.

### virtual-by-default

In languages like Smalltalk and almost every other "dynamically typed" OO descendent, including JavaScript, you can override any method at any level in the class hierarchy. In languages like Javascript and Ruby, you can even override a method within a single object.

When the method is invoked on an object, the most-specific version of the method is invoked. The other versions are available via various methods, from denoting them by absolute name (e.g. `SomeSuperclassName.prototype.foo.call(this, 'bar', 'baz')`) or using a magic keyword, `super` (e.g. `super('bar', 'baz')`).

The canonical name for this is [Dynamic Dispatch], because the method invocation is dynamically dispatched to the most appropriate method implementation. Such methods or functions are often called [virtual functions][virtual function], and thus a language where methods are automatically virtual is called "virtual-by-default."

[Dynamic Dispatch]: https://en.wikipedia.org/wiki/Dynamic_dispatch
[virtual function]: https://en.wikipedia.org/wiki/Virtual_function

JavaScript out of the box is very definitely virtual-by-default. The technical opposite of a virtual-by-default language is a *static-by-default* language. In a static-by-default language, no matter whether the function is overridden or not, the implementation to be used is chosen at compile time based on the declared class of the receiver.

For example, making up our own little JavaScript flavour that has manifest typing:

{% highlight javascript %}
class Foo {
  toString () {
    return "foo";
  }
}

class Bar extends Foo {
  toString () {
    return "bar";
  }
}

Foo f = new Bar();
console.log(f.toString());
{% endhighlight %}

In a virtual-by-default language, the console logs `bar`. In a static-by-default language, the console logs `foo`, because even though the object `f` is a `Bar`, it is declared as a `Foo`, and the compiler translates `f.toString()` into roughly `Foo.prototype.toString.call(f)`.

C++ is a static-by-default language. If you want dynamic dispatching, you use a special `virtual` keyword to indicate which functions should be dynamically dispatched. If our hypothetical JavaScript flavour was static-by-default and we wanted `toString()` to be a virtual function, we would write:

{% highlight javascript %}
class Foo {
  virtual toString () {
    return "foo";
  }
}

class Bar extends Foo {
  virtual toString () {
    return "bar";
  }
}

Foo f = new Bar();
console.log(f.toString());
{% endhighlight %}

After much experience with errors from forgetting to use the `virtual` keyword, most programming languages abandoned static-by-default and went with virtual-by-default.

### final-by-default

If most languages are settled on virtual-by-default, how can there be another tribe? Well, the static-by-default people had two excellent reasons for liking static dispatch. The first was speed, and they loved speed. But as things got faster, that implementation consideration became less-and-less persuasive.

But there was another argument, a semantic argument. The argument was this. If we write:

{% highlight javascript %}
class Foo {
  toString () {
    return "foo";
  }
}
{% endhighlight %}
We are defining `Foo` to be:

1. A class
2. That has a method, `toString`
3. That returns `"foo"`

Everyone agrees on the first two points, but OO programmers are split on the third point. Some say that a `Foo` is defined to return `"foo"`, others say that it returns `"foo"` by *default*, but any subclass of `Foo` can override this, and it could return anything, raise an exception, or erase your hard drive and email 419 scam letters to everyone in your contacts, you can't tell unless you examine an individual object that happens to be declared to be a `Foo` and see how it actually behaves.

When the Java language was released, it was virtual-by-default, but it didn't ignore this question. Java introduced the `final` keyword. When a method was declared `final`, it was *illegal to override it*, and if you tried, you got a compiler error.

If our imaginary JavaScript dialog worked this way, this code would not compile at all:

{% highlight javascript %}
class Foo {
  final toString () {
    return "foo";
  }
}

class Bar extends Foo {
  toString () {
    return "bar";
  }
}
// => Error: Method toString of superclass Foo is final and cannot be overridden.
{% endhighlight %}

In Java, `final` was the way you wrote: "This class has a method, and you can be sure that all subclasses implement this method in this way." In Java, `final` was optional. So whether by intent or by sheer laziness, most Java methods in the wild are not final.

But many people felt that like C++, the designers got it backwards. They felt that by default, all methods should be final. The special treatment should be for virtual methods, not for final methods.

If our dialect worked like that, all methods would be virtual, but if we wanted to allow a method to be overridden, we would use a special keyword, like `default`:

{% highlight javascript %}
class Foo {
  toString () {
    return "foo";
  }
}

class Bar extends Foo {
  toString () {
    return "bar";
  }
}
// => Error: Method toString of superclass Foo is final and cannot be overridden.
{% endhighlight %}

{% highlight javascript %}
class Foo {
  default toString () {
    return "foo";
  }
}

class Bar extends Foo {
  toString () {
    return "bar";
  }
}
//=> No errors, because Foo#toString is a default method.
{% endhighlight %}

In essence, the "final-by-default" tribe believe that methods *can* override each other, but that it should be rare, not common. So when a final-by-default programmer writes this code:

{% highlight javascript %}
class Foo {
  toString () {
    return "foo";
  }
}
{% endhighlight %}

They are defining the behaviour of all instances of `Foo`. If they need to override `toString` later, they will come back and declare it to be `default toString () { ... }`. That makes it easier to reason about the behaviour of the code, because when you look at at the code for `Foo`, you know what a `Foo` is and does, not what it might do but nobody-really-knows-without-reading-every-possible-subclass.

We can think of final-by-default as *The paranoid fringe of the virtual-by-default tribe*.

The "virtual-by-default" tribe are not impressed. They ask, "if you can't override, what makes you think you have polymorphism?" Of course, you can have two different subclasses each implement the same method without one overriding the other. And with "dynamic" languages and duck typing, you can have completely different classes implement the same "interface" without any overriding whatsoever. Or you can do all kinds of monkeying about with private methods but always expose the same public behaviour.

In the end, the "final-by-default" people are just as OO as the "virtual-by-default" people, but they spend a lot more time trying to keep their inheritance hierarchies "clean."

### the academic basis for final-by-default

Overriding methods is often taught as a central plank of OOP. So why would there by a hardy band of dissenting final-by-default people?

The problem final-by-default tries to solve is called the [Liskov Substitution Principle] or "LSP." It states that if a `Bar` is-a `Foo`, you ought to be able to take any piece of code that works for a `Foo`, and substitute a `Bar`, and it should just work.

[Liskov Substitution Principle]: https://en.wikipedia.org/wiki/Liskov_substitution_principle

Overriding public methods is the easiest way to break LSP. Not always, of course. If you have a `HashMap`, you might override the implementation of its `[]` and `[]=` methods in such a way that it has the exact same external behaviour.

But in general, if you treat methods as "defaults, open to overriding in any arbitrary way," you are abandoning LSP. Is that a bad thing? Well, many people feel that it makes object-oriented programs very difficult to reason about. Or in plain English, *prone to defects*.

Another principle you will hear discussed in this vein is called the [Open-Closed Principle]: "Software entities (classes, modules, functions, etc.) should be open for extension, but closed for modification."

[Open-Closed Principle]: https://en.wikipedia.org/wiki/Open/closed_principle

In our examples above, overriding `toString` in `Bar` modifies the definition of `Foo`, because it changes the definition of the behaviour of objects that are instances of `Foo`. Whereas, if we write:

{% highlight javascript %}
class Bar extends Foo {
  toArray () {
    return this.toString().split('');
  }
}
{% endhighlight %}

Now we are extending `Foo` for those objects that are both a `Foo` and a `Bar`, but not modifying the definition of `Foo`.[^well-actually]

[^well-actually]: As originally professed, the Open-Closed Principle had more to do with saying that a language or system should allow things to be modified by adding subclasses and so forth, while strongly discouraging changing original things. So in the late eighties and early nineties, overriding methods was in keeping with the Open/Closed Principle, because superclasses remain closed to modification. This was a good idea at the time, because it encouraged building systems that didn't have [brittle dependencies](https://en.wikipedia.org/wiki/Fragile_base_class). It has since evolved to have much more in common with LSP.

The "final-by-default" tribe of OO programmers like their programs to confirm to LSP and Open/Closed. This makes them nervous of language features that encourage overriding methods.

[![Reconfiguring the Station](/assets/images/reconfiguring.jpg)](https://www.flickr.com/photos/gsfc/6377206309)

### mixins and final-by-default

If you're a member of the final-by-default tribe, you don't want a lot of overriding of methods. You don't want mixins to blindly copy over an existing prototype's methods just as you don't want a classes' methods to will-nilly override a superclass's methods or a mixin's methods.

If you're a member of the final-by-default tribe, every time you see the `super()` keyword, you stare at it long and hard, and work out the tradeoff of convenience now versus potential for bugs down the road.

If you're a member of the final-by-default tribe, your `mixin` implementation will throw an error if a mixin and a class's method clash:

{% highlight javascript %}
let HappyObjects = final_by_default_mixin({
  toString () {
    return "I'm a happy object!";
  }
});

@HappyObjects
class Foo {
  toString () {
    return "foo";
  }
};
// => Error: HappyObjects and Foo both define toString
{% endhighlight %}

Members of the final-by-default tribe want `HappyObjects` to describe all happy objects, and `Foo` to define all instances of `Foo`. Blindly copying methods won't protect against naming clashes like this.

Of course, setting mixins up as subclass factories won't do that either. With subclass factories, we would actually write something like:

{% highlight javascript %}
let HappyObjects = subclass_factory_mixin({
  toString () {
    return 'happy';
  }
});

class HappyFoo extends HappyObjects(Object) {
  toString () {
    return `${super()} foo`;
  }
};

let f = new HappyFoo();
f.toString()
  //=> happy foo
{% endhighlight %}

With a subclass factory, you have everything virtual-by-default and overridable-by-default. Which is fine if you aren't a member of the final-by-default tribe.

### there has to be a catch

So, if there are these fancy "Liskov Substitution Principles" and "Open/Closed Principles" arguing for not encouraging overriding methods, what is the catch? Why doesn't everyone program this way?

Well, convenience. If you can't override methods (because that modifies the meaning of the superclass or mixin), you need to do something else when you want to extend the behaviour of a superclass or mixin. For example, if you want the mixin for implementation convenience but aren't trying to imply that a `Foo` is-a `HappyObject`, you would use delegation, like this:

{% highlight javascript %}
class HappyObjects {
  toString () {
    return 'happy';
  }
};

class HappyFoo {
  constructor () {
    this.happiness = new HappyObjects();
  }

  toString () {
    return `${this.happiness.toString()} foo`;
  }
};

let f = new HappyFoo();
f.toString()
  //=> I'm a happy foo!
{% endhighlight %}
A `HappyFoo` delegates part of its behaviour to an instance of `HappyObjects` that it owns. Some people find this kind of things more trouble than its worth, no matter how many times they hear grizzled veterans intoning "[Prefer Composition Over Inheritance][coi]."

[coi]: https://en.wikipedia.org/wiki/Composition_over_inheritance

Another technique that final-by-default tribe members use is to focus on extending superclass methods rather than replacing them outright. [Method Advice] can help. In the Ruby on Rails framework, for example, you can add behaviour to existing methods that is run before, after, or around methods, without overriding the methods themselves.

In this example, decorators add behaviour to methods that could be inherited from a superclass or mixed in:

{% highlight javascript %}
@before(validatePersonhood, 'setName', 'setAge', 'age')
@before(mustBeLoggedIn, 'fullName')
class User extends Person {
 // ...
};
{% endhighlight %}

Using method advice adds some semantic complexity in terms of learning what decorators like `before` or `after` might do, but encourages writing code where behaviour is extended rather than overridden. On larger and more complicated code bases, this can be a win.

[Method Advice]: http://raganwald.com/2015/08/05/method-advice.html

People have also investigated other ways of composing metaobjects. One promising direction is [traits]: A trait is like a mixin, but when it is applied, there is a name resolution policy that determines whether conflicting names should override or act like method advice.

Traits are very much from the "final by default" school, but instead of simply preventing name overriding and leaving it up to the programmer to find another way forward, traits provide mechanisms for composing both metaobjects (like classes and mixins) as well as the methods they define.

[traits]: https://en.wikipedia.org/wiki/Trait_(computer_programming)

[![Thinking, please wait](/assets/images/thinking-please-wait.jpg)](https://www.flickr.com/photos/karola/3623768629)

### is super() considered hmmm-ful?

The expression `super()` is how ES6 denotes a method that overrides another method, and invokes the method it overrides from within its body. Overriding any arbitrary method and calling the overridden method when and how you like obviously provides maximum flexibility and convenience. It's characteristic of the virtual-by-default mindset: Everything can be overridden, in any arbitrary way.

Replacing `super()` with method advice, for example, requires careful design, but offers an easier way to reason about the code: Looking at a `Foo` class, you can have confidence that instances of `Foo` might extend its methods, but you will have a higher degree of confidence how they will behave.

The "Liskov Substitution" and "Open/Closed" principles are guidelines for writing software that is extensible and maintainable, just as "Prefer Composition over Inheritance" expresses a preference, not an ironclad rule to never inherit when you could compose.

[considered harmful]: http://meyerweb.com/eric/comment/chech.html

So: Is [`super()` considered harmful][considered harmful]? No. Like anything else, it depends upon how you use it. Pragmatically, we shouldn't reject all uses of `super()`. But we can always stop for a moment and ask ourselves if it's the best way to accomplish a particular objective. And we ought to understand the alternatives available to us.

(discuss on [hacker news](https://news.ycombinator.com/item?id=10786168))

---

more reading:

- [Prototypes are Objects (and why that matters)](http://raganwald.com/2015/06/10/mixins.html)
- [Classes are Expressions (and why that matters)](http://raganwald.com/2015/06/04/classes-are-expressions.html)
- [Functional Mixins in ECMAScript 2015](http://raganwald.com/2015/06/17/functional-mixins.html)
- [Using ES.later Decorators as Mixins](http://raganwald.com/2015/06/26/decorators-in-es7.html)
- [Method Advice in Modern JavaScript](http://raganwald.com/2015/08/05/method-advice.html)
- [`super()` considered hmmm-ful](http://raganwald.com/2015/12/23/super-considered-hmmmful.html)
- [JavaScript Mixins, Subclass Factories, and Method Advice](http://raganwald.com/2015/12/28/mixins-subclass-factories-and-method-advice.html)

notes:
