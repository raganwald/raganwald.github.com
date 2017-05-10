---
layout: default
title: "Greenspunning Predicate and Multiple Dispatch in JavaScript"
tags: ["allonge", "spessore"]
---

Pattern matching is a feature found (with considerable rigor) in functional languages like Erlang and Haskell. In mathematics, algorithms and problems can often be solved by breaking them down into simple cases. Sometimes, those cases are reductions of the original problem.

A famous example is the naïve expression of the [factorial] function. The factorial of a non-negative integer `n` is the product of all positive integers less than or equal to `n`. For example, `factorial(5)` is equal to `5 * 4 * 3 * 2 * 1`, or `120`.

[factorial]: https://en.wikipedia.org/wiki/Factorial

The algorithm to compute it can be expressed as two cases. Let's pretend that JavaScript has pattern-matching baked in:

```javascript
function factorial (1) {
  return 1;
}

function factorial (n > 1) {
  return n * factorial(n - 1);
}
```

This can be done with an `if` statement, of course, but the benefit of breaking problems down by cases is that we can combine small pieces of code in a way that does not tightly couple them.

We can fake a simple form of pattern matching in JavaScript, and we'll see later that it will be very useful for implementing multiple dispatch.

### prelude: return values

Let's start with a convention: Methods and functions must return *something* if they successfully handle a method invocation, or raise an exception if they catastrophically fail. They cannot return `undefined` (which in JavaScript, also includes not explicitly returning something).

For example:

```javascript
// returns a value, so it is successful
function sum (a, b) {
  return a + b;
}

// returns this, so it is successful
function fluent (x, y, z) {
  // do something
  return this;
}

// returns undefined, so it is not successful
function fail () {
  return undefined;
}

// decorates a function by making it into a fail
function dont (fn) {
  return fail;
}

// logs something and fails,
// because it doesn't explicitly return anything
function logToConsole () {
  console.log.apply(null, arguments);
}
```

### guarded functions

We can write ourself a simple method decorator that *guards* a function or method, and fails if the guard function fails on the arguments provided. It's self-currying to facilitate writing utility guards:

```javascript
function when (guardFn, optionalFn) {
  function guarded (fn) {
    return function () {
      if (guardFn.apply(this, arguments))
        return fn.apply(this, arguments);
    };
  }
  return optionalFn == null
         ? guarded
         : guarded(optionalFn);
}

when(function (x) {return x != null; })(function () { return "hello world"; })();
  //=> undefined

when(function (x) {return x != null; })(function () { return "hello world"; })(1);
  //=> 'hello world'
```

`when` is useful independently of our work here, and that's a good thing: Whenever possible, we don't just make complicated things out of simpler things, we make them out of *reusable* simpler things. Now we can compose our guarded functions. `Match` takes a list of methods, and apply them in order, stopping when one of the methods returns a value that is not `undefined`.

```javascript
function Match () {
  var fns = [].slice.call(arguments, 0);

  return function () {
    var i,
        value;

    for (i in fns) {
      value = fns[i].apply(this, arguments);

      if (value !== undefined) return value;
    }
  };
}

// Some predicates to make it easy to write patterns
function equals (x) {
  return function eq (y) { return (x === y); };
}

function greaterThan (x) {
  return function gt (y) { return (y > x); };
}

var factorial = Match(
  when(equals(1),      function (n) { return 1; }),
  when(greaterThan(1), function (n) { return n * factorial(n-1); })
);

factorial(5);
  //=> 120
```

This is called [predicate dispatch], we're dispatching a function call to another function based on a series of predicates we apply to the arguments. Predicate dispatch declutters individual cases and composes functions and methods from smaller, simpler components that are decoupled from each other.

[predicate dispatch]: https://en.wikipedia.org/wiki/Predicate_dispatch

## The Expression Problem {#expression-problem}

> The expression problem originated as follows: Given a set of entities and a set of operations on those entities, how do we add new entities and new operations, without recompiling, without unsafe operations like casts, and while maintaining type safety?
>
> The general form of the problem does not concern type safety, but does concern the elegance of the design.

The [Expression Problem] is a programming design challenge: Given two orthogonal concerns of equal importance, how do we express our programming solution in such a way that neither concern becomes secondary?

[Expression Problem]: https://en.wikipedia.org/wiki/Expression_problem

An example given in the [c2 wiki] concerns a set of shapes (circle, square) and a set of calculations on those shapes (circumference, area).  We could write this using metaobjects:

```javascript
var Square = encapsulate({
	constructor: function (length) {
		this.length = length;
	},
	circumference: function () {
		return this.length * 4;
	},
	area: function () {
		return this.length * this.length;
	}
});

var Circle = encapsulate({
	constructor: function (radius) {
		this.radius = radius;
	},
	circumference: function () {
		return Math.PI * 2.0 * this.radius;
	},
	area: function () {
		return Math.PI * this.radius * this.radius;
	}
});
```

Or functions on structs:

```javascript
var Square = Struct('Square', 'length');
var Circle = Struct('Circle', 'radius');

function circumference(shape) {
	if (Square(shape)) {
		return shape.length * 4;
	}
	else if (Circle(shape)) {
		return Math.PI * 2.0 * this.radius;
	}
}

function area (shape) {
	if (Square(shape)) {
		return this.length * this.length;
	}
	else if (Circle(shape)) {
		return Math.PI * this.radius * this.radius;
	}
}
```

Both of these operations make one thing a first-class citizen and the the other a second-class citizen. The object solution makes shapes first-class, and operations second-class. The function solution makes operations first-class, and shapes second-class. We can see this by adding new functionality:

1. If we add a new shape (e.f. `Triangle`), it's easy with the object solution: Everything you need to know about a triangle goes in one place. But it's hard with the function solution: We have to carefully add a case to each function covering triangles.
1. If we add a new operation, (e.g. `boundingBox` returns the smallest square that encloses the shape), it's easy with the function solution: we add a new function and make sure it has a case for each kind of shape. But it's hard with the object solution: We have to make sure that we add a new method to each object.

[c2 wiki]: http://c2.com/cgi/wiki?ExpressionProblem

In a simple (two objects and two methods) example, the expression problem does not seem like much of a stumbling block. But imagine we are operating at scale, with a hierarchy of classes that have methods at every level of the ontology. Adding new operations can be messy, especially in a language that does not have type checking to make sure we cover all of the appropriate cases.

And the functions-first approach is equally messy in contemporary software. It's a very sensible technique when we program with a handful of canonical data structures and want to make many operations on those data structures. This is why, despite decades of attempts to write Object-Relational Mapping libraries, [PL/SQL] is not going away. Given a slowly-changing database schema, it's far easier to write a new procedure that operates across tables, than to try to write methods on objects representing a single entity in a table.

[PL/SQL]: https://en.wikipedia.org/wiki/PL/SQL

### dispatches from space

There's a related problem. Consider some kind of game involving meteors that fall from the sky towards the Earth. You have fighters of some kind that fly around and try to shoot the meteors. We have an established way of handling a meteors hitting the Earth or a fighter flying into the ground and crashing: We write a `.hitsGround()` method for meteors and for fighters.

Whenever something hits the ground, we invoke its `.hitsGround()` method, and it handles the rest. A fighter hitting the ground will cost so many victory points and trigger a certain animation. A meteor hitting the ground will cost a different number of victory points and trigger a different animation.

And it's easy to add new kinds of things that can hit the ground. As long as they implement `.hitsGround()`, we're good. Each object knows what to do.

This resembles encapsulation, but it's actually called [ad hoc polymorphism]. It's not an object hiding its state from tampering, it's an object hiding its semantic type from the code that uses it. Fighters and meteors both have the same structural type, but different semantic types and different behaviour.

[ad hoc polymorphism]: https://en.wikipedia.org/wiki/Polymorphism_(computer_science)

"Standard" OO, as practiced by Smalltalk and its descendants on down to JavaScript, makes heavy use of polymorphism. The mechanism is known as *single dispatch* because given an expression like `a.b(c,d)`, The choice of method to invoke given the method `b` is made based on a single receiver, `a`. The identities of `c` and `d` are irrelevant to choosing the code to handle the method invocation.

Single-dispatch handles crashing into the ground brilliantly. It also handles things like adjusting the balance of a bank account brilliantly. But not everything fits the single dispatch model.

Consider a fighter crashing into a meteor. Or another fighter. Or a meteor crashing into a fighter. Or a meteor crashing into another meteor. If we write a method like `.crashInto(otherObject)`, then right away we have an antipattern, there are things that ought to be symmetrical, but we're forcing an asymmetry on them. This is vaguely like forcing class `A` to extend `B` because we don't have a convenient way to compose metaobjects.

In languages with no other option, we're forced to do things like have one object's method know an extraordinary amount of information about another object. For example, if a fighter's `.crashInto(otherObject)` method can handle crashing into meteors, we're imbuing fighters with knowledge about meteors.

### double dispatch

Over time, various ways to handle this problem with single dispatch have arisen. One way is to have a polymorphic method invoke another object's polymorphic methods. For example:

```javascript
var FighterPrototype = {
	crashInto: function (otherObject) {
		this.collide();
		otherObject.collide();
		this.destroyYourself();
		otherObject.destroyYourself();
	},
	collide: function () {
		// ...
	},
	destroyYourself: function () {
		// ...
	}
}
```

In this scheme, each object knows how to `collide` and how to destroy itself. So a fighter doesn't have to know about meteors, just to trust that they implement `.collide()` and `.destroyYourself()`. Of course, this presupposes that a collisions between objects can be subdivided into independent behaviour.

What if, for example, we have special scoring for ramming a meteor, or perhaps a sarcastic message to display? What if meteors are unharmed if they hit a fighter but shatter into fragments if they hit each other?

A pattern for handling this is called [double-dispatch]. It is a little more elegant in manifestly typed languages than in dynamically typed languages, but such superficial elegance is simply masking some underlying issues. Here's how we could implement collisions with special cases:

[double-dispatch]: https://en.wikipedia.org/wiki/Double_dispatch

```javascript
var FighterPrototype = {
	crashInto: function (objectThatCrashesIntoFighters) {
		return objectThatCrashesIntoFighters.isStruckByAFighter(this)
	},
	isStruckByAFighter: function (fighter) {
		// handle fighter-fighter collisions
	},
	isStruckByAMeteor: function (meteor) {
		// handle fighter-meteor collisions
	}
}

var MeteorPrototype = {
	crashInto: function (objectThatCrashesIntoMeteors) {
		return objectThatCrashesIntoMeteors.isStruckByAMeteor(this)
	},
	isStruckByAFighter: function (fighter) {
		// handle meteor-fighter collisions
	},
	isStruckByAMeteor: function (meteor) {
		// handle meteor-meteor collisions
	}
}

var someFighter = Object.create(FighterPrototype),
    someMeteor  = Object.create(MeteorPrototype);

someFighter.crashInto(someMeteor);
```

In this scheme, when we call `someFighter.crashInto(someMeteor)`, `FighterPrototype.crashInto` invokes `someMeteor.isStruckByAFighter(someFighter)`, and that handles the specific case of a meteor being struck by a fighter.

To make this work, both fighters and meteors need to know about each other. They are coupled. And as we add more types of objects (observation balloons? missiles? clouds? bolts of lightning?), our changes must be spread across our prototypes. It is obvious that this system is highly inflexible. The principle of messages and encapsulation is ignored, we are simply using JavaScript's method dispatch system to achieve a result, rather than modeling entities.

Generally speaking, double dispatch is considered a red flag. Sometimes it's the best technique to use, but often it's a sign that we have chosen the wrong abstractions.

## Multiple Dispatch

JavaScript's single-dispatch system makes it difficult to model interactions that varied on two (or more) semantic types. Our example was modeling collisions between fighters and meteors, where we want to have different outcomes depending upon whether a fighter or a meteor collided with another fighter or a meteor.

Languages such as [Common Lisp] bake support for this problem right in, by supporting multiple dispatch. With multiple dispatch, generic functions can be specialized depending upon any of their arguments. In this example, we're defining forms of `collide` to work with a meteors and fighters:

[Common Lisp]: https://en.wikipedia.org/wiki/Common_Lisp

```lisp
(defmethod collide ((object-1 meteor) (object-2 fighter))
   (format t "meteor ~a collides with fighter ~a" object-1 object-2))

(defmethod collide ((object-1 meteor) (object-2 meteor))
   (format t "meteor ~a collides with another meteor ~a" object-1 object-2))
```

Common Lisp's generic functions use dynamic dispatch on both `object-1` and `object-2` to determine which body of `collide` to evaluate. Meaning, both types are checked at run time, at the time when the function is invoked. Since more than one argument is checked dynamically, we say that Common Lisp has *multiple dispatch*.

Manifestly typed OO languages like Java *appear* to support multiple dispatch. You can create one method with several signatures, something like this:

```javascript
interface Collidable {
  public void crashInto(Meteor meteor);
  public void crashInto(Fighter fighter);
}

class Meteor implements Collidable {
  public void crashInto(Meteor meteor);
  public void crashInto(Fighter fighter);
}

class Fighter implements Collidable {
  public void crashInto(Meteor meteor);
  public void crashInto(Fighter fighter);
}
```

Alas this won't work. Although we can specialize `crashInto` by the type of its argument, the Java compiler resolves this specialization at compile time, not run time. It's *early bound*. Thus, if we write something like this pseudo-Java:

```javascript
Collidable thingOne = Math.random() < 0.5 ? new Meteor() : new Fighter(),
Collidable thingTwo = Math.random() < 0.5 ? new Meteor() : new Fighter();

thingOne.crashInto(thingTwo);
```

It won't even compile! The compiler can figure out that `thingOne` is a `Collidable` and that it has two different signatures for the `crashInto` method, but all it knows about `thingTwo` is that it's a `Collidable`, the compiler doesn't know if it should be compiling an invocation of `crashInto(Meteor meteor)` or `crashInto(Fighter fighter)`, so it refuses to compile this code.

Java's system uses dynamic dispatch for the receiver of a method: The class of the receiver is determined at run time and the appropriate method is determined based on that class. But it uses *static dispatch* for the specialization based on arguments: The compiler sorts out which specialization to invoke based on the declared type of the argument at compile time. If it can't sort that out, the code does not compile.

Java may have type signatures to specialize methods, but it is still *single dispatch*, just like JavaScript.

### emulating multiple dispatch

Javascript cannot do true multiple dispatch without some ridiculous greenspunning of method invocations. But we can fake it pretty reasonably using predicate dispatch.

We start with the same convention: Methods and functions must return *something* if they successfully hand a method invocation, or raise an exception if they catastrophically fail. They cannot return `undefined` (which in JavaScript, also includes not explicitly returning something).

Recall that this allowed us to write the `Match` function that took a serious of *guards*, functions that checked to see if the value of arguments was correct for each case. Our general-purpose guard, `when`, took all of the arguments as parameters.

What we want is to write guards for each argument. So we'll write `whenArgsAre`, a guard that takes predicates for each argument as well as the body of the function case:

```javascript
function whenArgsAre () {
  var matchers = [].slice.call(arguments, 0, arguments.length - 1),
      body     = arguments[arguments.length - 1];

  return function () {
    var i,
        arg,
        value;

    if (arguments.length != matchers.length) return;
    for (i in arguments) {
      arg = arguments[i];
      if (!matchers[i].call(this, arg)) return;
    }
    value = body.apply(this, arguments);
    return value === undefined
           ? null
           : value;
  };
}

// handy predicates for testing the "type" of arguments
function instanceOf (clazz) {
  return function (arg) {
    return arg instanceof clazz;
  };
}

function isOfType (type) {
  return function (arg) {
    return typeof(arg) === type;
  };
}

function isPrototypeOf (proto) {
  return Object.prototype.isPrototypeOf.bind(proto);
}

function Fighter () {};
function Meteor () {};

var handlesManyCases = Match(
  whenArgsAre(
    instanceOf(Fighter), instanceOf(Meteor),
    function (fighter, meteor) {
      return "a fighter has hit a meteor";
    }
  ),
  whenArgsAre(
    instanceOf(Fighter), instanceOf(Fighter),
    function (fighter, fighter) {
      return "a fighter has hit another fighter";
    }
  ),
  whenArgsAre(
    instanceOf(Meteor), instanceOf(Fighter),
    function (meteor, fighters) {
      return "a meteor has hit a fighter";
    }
  ),
  whenArgsAre(
    instanceOf(Meteor), instanceOf(Meteor),
    function (meteor, meteor) {
      return "a meteor has hit another meteor";
    }
  )
);

handlesManyCases(new Meteor(),  new Meteor());
  //=> 'a meteor has hit another meteor'
handlesManyCases(new Fighter(), new Meteor());
  //=> 'a fighter has hit a meteor'
```

Our `Match` function now allows us to build generic functions that dynamically dispatch on all of their arguments. They work just fine for creating multiply dispatched methods:

```javascript
var FighterPrototype = {},
    MeteorPrototype  = {};

FighterPrototype.crashInto = Match(
  whenArgsAre(
    isPrototypeOf(FighterPrototype),
    function (fighter) {
      return "fighter(fighter)";
    }
  ),
  whenArgsAre(
    isPrototypeOf(MeteorPrototype),
    function (fighter) {
      return "fighter(meteor)";
    }
  )
);

MeteorPrototype.crashInto = Match(
  whenArgsAre(
    isPrototypeOf(FighterPrototype),
    function (fighter) {
      return "meteor(fighter)";
    }
  ),
  whenArgsAre(
    isPrototypeOf(MeteorPrototype),
    function (meteor) {
      return "meteor(meteor)";
    }
  )
);

var someFighter = Object.create(FighterPrototype),
    someMeteor  = Object.create(MeteorPrototype);

someFighter.crashInto(someMeteor);
  //=> 'fighter(meteor)'
```

We now have usable dynamic multiple dispatch for generic functions and for methods. It's built on predicate dispatch, so it plays well with other kinds of predicates for each argument.

### caveat

Consider the following problem:

We wish to create a specialized entity, an `ArmoredFighter` that behaves just like a regular fighter, only when it strikes another fighter it has some special behaviour.

```javascript
var ArmoredFighterPrototype = Object.create(FighterPrototype);

ArmoredFighterPrototype.crashInto = Match(
  whenArgsAre(
    isPrototypeOf(FighterPrototype),
    function (fighter) {
      return "armored-fighter(fighter)";
    }
  )
);
```

Our thought is that we are "overriding" the behaviour of `crashInto` when an armored fighter crashes into any other kind of fighter. But we wish to retain the behaviour we have already designed when an armored fighter crashes into a meteor.

This is not going to work. Although we have written our code such that the various cases and predicates are laid out separately, at run time they are composed opaquely into functions. As far as JavaScript is concerned, we've written:

```javascript
var FighterPrototype = {};

FighterPrototype.crashInto = function (q) {
  // black box
};

var ArmoredFighterPrototype = Object.create(FighterPrototype);

ArmoredFighterPrototype.crashInto = function (q) {
  // black box
};
```

We've written code that composes, but it doesn't *decompose*. We've made it easy to manually take the code for these functions apart, inspect their contents, and put them back together in new ways, but it's impossible for us to write code that inspects and decomposes the code.

A better design might incorporate reflection and decomposition at run time.

(discuss on [reddit])

---

### post-scriptum

Our `Match` function is fairly simple, but it has a drawback: The functions it creates have no name and length. This means that it will not compose nicely with other JavaScript functional techniques such as creating variadic functions or currying.

To fix that, we can add some extra bits that extract the name and length from the cases we provide:

```javascript
// "nameAndLength" and "imitate" are not strictly necessary to understand what we're
// doing, but they do help us write functions that preserve the name and arity
// of functions we work with. This is very helpful if we combine these techniques
// with other utilities that performa partial application and/or currying.

function nameAndLength(name, length, body) {
  var abcs = [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
               'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
               'z', 'x', 'c', 'v', 'b', 'n', 'm' ],
      pars = abcs.slice(0, length),
      src  = "(function " + name + " (" + pars.join(',') + ") { return body.apply(this, arguments); })";

  return eval(src);
}

function imitate(exemplar, body) {
  return nameAndLength(exemplar.name, exemplar.length, body);
}

// "when" is our guard function
function when (guardFn, optionalFn) {
  function guarded (fn) {
    return imitate(fn, function () {
      if (guardFn.apply(this, arguments))
        return fn.apply(this, arguments);
    });
  }
  return optionalFn == null
         ? guarded
         : guarded(optionalFn);
}

// "getWith," "mapWith," and "pluckWith" can all be found in the allong.es
// library, https://github.com/raganwald/allong.es
function getWith (prop, obj) {
  function gets (obj) {
    return obj[prop];
  }

  return obj === undefined
         ? gets
         : gets(obj);
}

function mapWith (fn, mappable) {
  function maps (collection) {
    return collection.map(fn);
  }

  return mappable === undefined
         ? maps
         : maps(collection);
}

function pluckWith (prop, collection) {
  var plucker = mapWith(getWith(prop));

  return collection === undefined
         ? plucker
         : plucker(collection);
}

// Our pattern-matching function
function Match () {
  var fns     = [].slice.call(arguments, 0),
      lengths = pluckWith('length', fns),
      length  = Math.min.apply(null, lengths),
      names   = pluckWith('name', fns).filter(function (name) { return name !== ''; }),
      name    = names.length === 0
                ? ''
                : names[0];

  console.log(names)

  return nameAndLength(name, length, function () {
    var i,
        value;

    for (i in fns) {
      value = fns[i].apply(this, arguments);

      if (value !== undefined) return value;
    }
  });
}

// Some predicates to make it easy to write patterns
function equals (x) {
  return function eq (y) { return (x === y); };
}

function greaterThan (x) {
  return function gt (y) { return (y > x); };
}

var factorial = Match(
  when(equals(1),      function factorial (n) { return 1; }),
  when(greaterThan(1), function           (n) { return n * factorial(n-1); })
);

factorial(5);
  //=> 120
factorial.name;
  //=> 'factorial'
factorial.length;
  //=> 1

function whenArgsAre () {
  var matchers = [].slice.call(arguments, 0, arguments.length - 1),
      body     = arguments[arguments.length - 1];

  function typeChecked () {
    var i,
        arg,
        value;

    if (arguments.length != matchers.length) return;
    for (i in arguments) {
      arg = arguments[i];
      if (!matchers[i].call(this, arg)) return;
    }
    value = body.apply(this, arguments);
    return value === undefined
           ? null
           : value;
  }

  return imitate(body, typeChecked);
}
```

[reddit]: http://www.reddit.com/r/programming/comments/28wwab/greenspunning_patternmatching_and_multiple/