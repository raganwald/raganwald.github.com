---
layout: default
title: Writing OOP using OOP
tags: spessore
---

As many people have pointed out, if you turn your head sideways and squint, the following JavaScript can be considered a "class:"

    function QuadTree (nw, ne, se, sw) {
      this._nw = nw;
      this._ne = ne;
      this._se = se;
      this._sw = sw;
    }
    QuadTree.prototype.population = function () {
      return this._nw.population() +
             this._ne.population() +
             this._se.population() +
             this._sw.population();
    }

This is very different than the kind of class you find in Smalltalk, but it's "close enough for government work," so what's the big deal?

No big deal, really, there is plenty of excellent JavaScript software that uses this exact pattern for creating objects that delegate their behaviour to a common prototype. But we programmers have a voracious appetite for *learning*, so in the interests of understanding what we give up, here's an explanation of how JavaScript's simple out-of-the-box OO differs from Smalltalk-style OO, and why that might matter for some projects.

> Encapsulation is good: By hiding internal state and manipulation, you get delegation, you get polymorphism, you get code that is cohesive but not tightly coupled.

### the basic oo-proposition

The basic proposition of OO is that *objects encapsulate their private state*. They provide methods, and you query and update the objects by invoking methods. Objects do not directly access or manipulate each other's internal state. This system is held to lower coupling and increase flexibility, as the interactions between objects are understood to be limited entirely to the methods they expose.

In the `QuadTree` example above, although we don't know what kinds of things they store, we know that if you want to know a QuadTree's population, you don't muck about with its internal state, you call `.population()`, and it does the rest.

Another part of the proposition is that objects delegate their behaviour to some kind of metaobject, typically called a "class," although in JavaScript (and Self, the language that inspired it), metaobjects are actually called prototypes. This delegation is the most accessible way for two or more objects to share a common set of methods.

Most people who chose to program JavaScript in an OO style readily accept this proposition: Encapsulation is good: By hiding internal state and manipulation, you get delegation, you get polymorphism, you get code that is cohesive but not tightly coupled.

This is why they build "classes" representing the various entities in their problem domain. For a JavaScript implementation of HashLife, you might find `Cell` and `QuadTree` classes, for example.

And yet... When it comes to writing and manipulating their classes, does this code look like it encapsulates private state? Or does it look like code directly manipulates internal state?

    function Cell (population) {
      this._population = population;
    }
    Cell.prototype.population = function () {
      return this._population;
    }

Quite clearly, while this code supports OOP, it is itself written in a non-OOP manner, it is written with the expectation that other entities get to directly manipulate `Cell.prototype`.

What would this code look like if we took the basic proposition of OOP and applied it to writing classes and not just using classes?

### using oop to write oop

Quite obviously, classes would be objects that you manipulate with methods. Something like:

    Cell.defineMethod('population', function () {
      return this._population;
    });

Likewise, there is no `new Cell(1)` in a fully OO sense, we should not assume that `Cell` is some kind of function. So instead, we have:

    var empty = Cell.create(0);
    var occupied = Cell.create(1)

If `Cell` has methods like `defineMethod` and `create`, *it obviously is an object itself*. Now, `Cell.defineMethod` is presumed to exist, and so is `QuadTree.defineMethod`. How does OOP handle things when two or more objects share some method? Right! They are both instances of a class.

What is the class of `Cell` and of `QuadTree`? How about `Class`? Let us assume there is a `Class` class. How do we make `Cell` and `QuadTree` out of `Class`?

    var Cell = Class.create();
    var QuadTree = Class.create();

Naturally. Everything's an object, everything follows the same rules, we don't need to remember a bunch of special cases, because we aren't peeking at the implementation and directly manipulating an object's internal state.

> "You aren't serious about OOP until you subclass Class."

### going beyond

We haven't looked at `defineMethod`'s implementation, but presumably it looks something like this:

    Class.defineMethod('defineMethod', function (name, body) {
      this.prototype[name] = body;
      return this;
    });

It hardy seems worth the trouble to abstract this simple line of code away, however we have strong imaginations, let's use them. OOP allows us to create a subclass for the purpose of extending or sometimes overriding behaviour. So let's imagine that if we want, we can write something like:

    var MinimalQuadTree = Class.create(QuadTree);

This establishes that `MinimalQuadTree` is a subclass of `QuadTree`, and somewhere in the implementation of `.create` is the logic that correctly wires the appropriate prototypes up so that every instance of `MinimalQuadTree` can delegate `population()` to `QuadTree`'s implementation.

Ok, so we imagine we can make subclasses of classes. This does not require a strong imagination. Let us make up a problem, then use our imagination to solve it.

We start with:

    var Counter = Class.create();
    Counter
      .defineMethod('initialize', function () { this._count = 0; })
      .defineMethod('increment', function () { ++this._count; })
      .defineMethod('count', function () { return this._count; });

    var c = Counter.create();

(*Every essay should include a counter example*)

And we add a function written in continuation-passing-style:

    function log (message, callback) {
      console.log(message);
      return callback();
    }

Alas, we can't use our counter:

    log("doesn't work", c.increment);

The trouble is that the expression `c.increment` returns the body of the method, but when it is invoked using `callback()`, the original context of `c` has been lost. The usual solution is to write:

    log("works", c.increment.bind(c));

The `.bind` method binds the context permanently. Another solution is to write (or use a [function][_bind] to write):

[_bind]: http://underscorejs.org/#bind

    c.increment = c.increment.bind(c);

Then we can write:

    log("works without thinking about it", c.increment);

It seems like a lot of trouble to be writing this out everywhere, *especially* when the desired behaviour is nearly always that methods be bound. Is there a better way?

Recall from above that `Class` is a class. And that classes can be subclassed. Let's try it:

    var SelfBindingClass = Class.create(Class);

We can override methods in a subclass. Let's override `defineMethod` to add some custom semantics:

    SelfBindingClass.defineMethod( 'defineMethod', function (name, body) {
      Object.defineProperty(this.prototype, name, {
        get: function () {
          return body.bind(this);
        }
      });
      return this;
    });

Let's try our new subclass of `Class`:

    Counter = SelfBindingClass.create();

    c = Counter.create();

    log("still works without thinking about it", c.increment);

Classes that are instances of `SelfBindingClass` are now self-binding. Every one of their methods acts like it's bound to the instance without special handling.

### let's think about that again

This last example is small, but incredibly important. The proposition of OO is that by encapsulating internal state, you can decouple the what one object wants from the how another object gets it done. You can swap objects for each other using polymorphism. You can delegate.

The last example shows how using first-class objects for classes, objects that encapsulate their internal state and themselves are instances of classes, we can write code that implements new kinds of semantics--like binding methods to objects--without requiring all other code to be coupled to the exact representation employed.

This is certainly not *necessary* for writing good JavaScript programs. But if we do buy the proposition that OO is a good idea for our domain, shouldn't we ask ourselves why we aren't using it for our classes?

([discuss](http://www.reddit.com/r/programming/comments/203rlw/writing_oop_using_oop_javascript/))

---

    var MetaObjectPrototype = {
      create: function () {
        var instance = Object.create(this.prototype);
        Object.defineProperty(instance, 'constructor', {
          value: this
        });
        if (instance.initialize) {
          instance.initialize.apply(instance, arguments);
        }
        return instance;
      },
      defineMethod: function (name, body) {
        this.prototype[name] = body;
        return this;
      },
      initialize: function (superclass) {
        if (superclass != null && superclass.prototype != null) {
          this.prototype = Object.create(superclass.prototype);
        }
        else this.prototype = Object.create(null);
      }
    };

    var MetaClass = {
      create: function () {
        var klass = Object.create(this.prototype);
        Object.defineProperty(klass, 'constructor', {
          value: this
        });
        if (klass.initialize) {
          klass.initialize.apply(klass, arguments);
        }
        return klass;
      },
      prototype: MetaObjectPrototype
    };

    var Class = MetaClass.create(MetaClass);

    var QuadTree = Class.create();
    QuadTree
      .defineMethod('initialize', function (nw, new, se, sw) {
        this._nw = nw;
        this._ne = ne;
        this._se = se;
        this._sw = sw;
      })
      .defineMethod('population', function () {
        return this._nw.population() +
               this._ne.population() +
               this._se.population() +
               this._sw.population();
      });

    var Cell = Class.create();
    Cell
      .defineMethod('population', function () {
        return this._population;
      });

    var SelfBindingClass = Class.create(Class);
    SelfBindingClass
      .defineMethod( 'defineMethod', function (name, body) {
        Object.defineProperty(this.prototype, name, {
          get: function () {
            return body.bind(this);
          }
        });
        return this;
      });

    var Counter = SelfBindingClass.create();
    Counter
      .defineMethod('initialize', function () { this._count = 0; })
      .defineMethod('increment', function () { ++this._count; })
      .defineMethod('count', function () { return this._count; });

