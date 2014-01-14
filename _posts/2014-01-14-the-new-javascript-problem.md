---
layout: default
tags: [allonge, spessore]
---

The `new` keyword in JavaScript is very straightforward to use:

    function Rectangle (x, y) {
      this.x = x;
      this.y = y;
    }

    var rect = new Rectangle(2, 3);

    rect.x
      //=> 2

When a function is called with the `new` keyword, a new object is created and that object becomes the *context* of the function call. That context is available within the function using the `this` keyword. If the function does not explicitly return anything in its body, the result of evaluating the function with the `new` keyword will be the new object.

By default, all functions have a `prototype` property, and that prototype defaults to being a new, empty object:

    Rectangle.prototype
      //=> {}

Each function gets its own distinct prototype object:

    function A () {}
    function B () {}
    A.prototype === B.prototype
      //=> false

    A.prototype.foo = 'SNAFU';
    B.prototype.foo = 'FUBAR';
    A.prototype
      //=> { foo: 'SNAFU' }
    B.prototype
      //=> { foo: 'FUBAR' }

When you create a new object using the `new` keyword and a function, there is a *special relationship* established between the object and the function's prototype:

    var a = new A();
    Object.getPrototypeOf(a)
      //=> { foo: 'SNAFU' }
    A.prototype.isPrototypeOf(a)
      //=> true

That relationship is established at the time the object is created. If we replace the function's prototype, it doesn't affect the objects already created:

    A.prototype = { FUBAR: 'foo' }
    A.prototype.isPrototypeOf(a)
      //=> false

The special relationship goes further: Objects *inherit* the properties of their prototypes:

    var b = new B();

    b.foo
      //=> 'FUBAR'

JavaScript doesn't always show inherited properties to us in the console:

    b
      //=> {}

But they're still there!

    b.foo
      //=> 'FUBAR'

Prototypes are very useful for methods:

    function Rectangle (x, y) {
      this.x = x;
      this.y = y;
    }
    Rectangle.prototype.area = function () {
      return this.x * this.y;
    }

    var twoByThree = new Rectangle(2, 3);
    twoByThree.area()
      //=> 6

    var threeByFive = new Rectangle(3, 5);
    threeByFive.area()
      //=> 15

Reassigning prototypes allows us to share prototypes:

    function Square (x) {
      this.x = this.y = x;
    }
    Square.prototype = Rectangle.prototype;

    var fourByFour = new Square(4);
    fourByFour.area()
      //=> 16

This might or might not be a bad idea. Another way to accomplish the same objective is to note that a prototype can be any object, including an object created with a function. So:

    Square.prototype = new Rectangle();

Now Square has its own prototype that inherits from Rectangle's prototype, but it isn't the same object:

    Square.prototype === Rectangle.prototype
      //=> false

But we get the same behaviour we wanted:

    var fourByFour = new Square(4);
    fourByFour.area()
      //=> 16

Separating the two prototypes is superior if there is any difference between a square and a rectangle aside from how they are initialized. For example, if you ever want to write something like this:

    Rectange.prototype.toString = function () {
      return "I am a " + this.x + " by " + this.y + " rectangle";
    }

    Square.prototype.toString = function () {
      return "I am a " + this.x + " by " + this.y + " square";
    }

Then you need to have separate prototypes. On the other hand, you might decide to write this:

    function GoldenRectangle (x) {
      this.x = x;
      this.y = 1.6 * x;
    }
    GoldenRectangle.prototype = Rectangle.prototype;

Having multiple JavaScript functions share the same prototype serves the same purpose as one Java class having multiple constructor functions.

### Object.create

Constructors are not the only way to create JavaScript objects. `Object.create` creates a new JavaScript object and permits you to specify the prototype:

    var myPrototype = {
      name: "My Prototype"
    }

    var myObject = Object.create(myPrototype);
    Object.getPrototypeOf(myObject)
      //=> { name: 'My Prototype' }

Now that we know this, we can see that the `new` keyword is a kind of shorthand for:

    var pseudoNew = variadic(function (constructor, args) {
      var newObject = Object.create(constructor.prototype);
      var returnedObject = constructor.apply(newObject, args);
      if (typeof(returnedObject) ===  'undefined') {
        return newObject;
      }
      else return returnedObject
    });

Using `Object.create`, we can be explicit about what objects are create with what prototypes. Here we are using a `.create` method:

    var Circle = {
      prototype: {
        area: function () {
          return Math.PI * this.radius * this.radius;
        }
      },
      create: function (radius) {
        var circle = Object.create(this.prototype);
        circle.radius = radius;
        return circle;
      }
    }

    var fiver = Circle.create(5);
    fiver.area()
      //=> 78.53981633974483

So, you can use `new` or you can use `Object.create` to create new objects with prototypes. So far, so good.

But there are some clouds on the horizon.

### why instanceof might be a problem

JavaScript provides an `instanceof` keyword. It appears at first to be useful:

    fourByFour instanceof Rectangle
      //=> true

It is a kind of shorthand for:

    function instanceOf(object, constructor) {
      return constructor.prototype.isPrototypeOf(object)
    }

The trouble with `instanceof` is that it is unreliable whenever you use `Object.create` instead of the `new` keyword, or when you replace the prototype of a function used as a constructor. Semantically, the item of interest in the prototype, and therefore if you use `Object.create` instead of the `new` keyword, you must also use `.isPrototypeOf` instead of `instanceof`.

> Most OO programmers prefer using polymorphism to explicitly testing `instanceof`. Wide use of explicit type testing is generally a design smell, but nevertheless it is a useful tool in some circumstances.

### handling the case when we don't use `new`

When we choose to write our code to use the `new` keyword, we may want to consider taking precautions. As noted in [Effective JavaScript][ej], traditional constructors will usually fail in ugly ways if we accidentally invoke them without using the `new` keyword:

[ej]: http://www.amazon.com/gp/product/0321812182/ref=as_li_ss_tl?tag=raganwald001-20

    function Circle (radius) {
      this.radius = radius;
    }
    Circle.prototype.area = function () {
      return Math.PI * this.radius * this.radius;
    }

    new Circle(2).area()
      //=> 12.566370614359172

    Circle(2).area()
      //=> TypeError: Cannot call method 'area' of undefined

We can, of course, *not do that*. We can also code defensively:

    function Circle (radius) {
      var newObject = Circle.prototype.isPrototypeOf(this)
                      ? this
                      : new Circle();
      newObject.radius = radius;
      return newObject;
    }
    Circle.prototype.area = function () {
      return Math.PI * this.radius * this.radius;
    }

    new Circle(2).area()
      //=> 12.566370614359172

    Circle(2).area()
      //=> 12.566370614359172

Our rewritten constructor handles the case when `this` is not a new Circle instance by creating one before doing the initializing. It also explicitly returns the new object instead of relying on `new` to infer what we want when we don't return anything.

We now have a function we expected would be used with the new keyword, but it also handles the case where the new keyword isn't used.

### handling the case when we do use `new`

It goes the other way as well. Sometimes we write a function that we don't expect to be used with the new keyword, but we later discover that we'd like to invoke it with the new keyword. For example, we might choose to write a function decorator, as one might find in [this essay][be] or in libraries like [Method Combinators][mc]:

[be]: http://blakeembrey.com/articles/wrapping-javascript-functions/ "Wrapping JavaScript Functions"
[mc]: https://github.com/raganwald/method-combinators

    function before (fn, beforeAdvice) {
      return unvariadic(fn.length, function (args) {
        beforeAdvice.apply(this, arguments);
        return fn.apply(this, arguments);
      });
    }

    function add (x, y) {
      return x + y;
    }

    add(1, 1)
      //=> 2

    function preparation () {
      console.log('Hang on while I get a piece of paper. Ok, I\'m ready!');
    }

    var newAdd = before(add, preparation);

    newAdd(2, 2)
      //=>
        Hang on while I get a piece of paper. Ok, I'm ready!
        4

Alas, our decorator breaks down if we use it with a traditional constructor:

    function Square (side) {
      this.side = side;
    }
    Square.prototype.area = function () {
      return this.side * this.side;
    }

    new Square(1).area()
      //=> 1

    NewSquare = before(Square, preparation);

    new NewSquare(2).area()
      //=>
        Hang on while I get a piece of paper. Ok, I'm ready!
        TypeError: Object [object Object] has no method 'area'

Again, we can *not do that*: When we construct objects in our own functions or methods using `Object.create`, we don't need to take special precautions when writing decorators:

    var OurSquare = {
      create: function (side) {
        var newObject = Object.create(OurSquare.prototype);
        newObject.side = side;
        return newObject;
      },
      prototype: {
        area: function () {
          return this.side * this.side;
        }
      }
    }

    OurSquare.create(3).area()
      //=> 9

    OurSquare.create = before(OurSquare.create, preparation);

    OurSquare.create(4).area()
      //=>
        Hang on while I get a piece of paper. Ok, I'm ready!
        16

But if we wish to accommodate the `new` keyword when writing things like decorators, we can take precautions:

    // shim for Object.setPrototypeOf
    Object.setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
      obj.__proto__ = proto;
      return obj;
    }

    function defensiveBefore (fn, beforeAdvice) {
      return function wrapped () {
        if (Object.getPrototypeOf(this) === wrapped.prototype) {
          Object.setPrototypeOf(this, fn.prototype);
        }
        beforeAdvice.apply(this, arguments);
        return fn.apply(this, arguments);
      };
    }

    var NewestSquare = defensiveBefore(Square, preparation);
      //=>
        Hang on while I get a piece of paper. Ok, I'm ready!
        25

### so what's the problem?

The trouble with approaches like this is that precautions can pile up on top of precautions, until our original intent has been obscured. One solution is *don't do that*, as in, don't try to decorate constructor functions, and be sure you know when a function is designed to create an object with `new` and when it is called normally.

The other possibility is *don't do that*, as in, *don't use `new`*: Write functions and methods that explicitly call `Object.create`, and use `.isPrototypeOf` instead of `instanceof`. This is an equally straightforward approach, and resistant to the edge cases surrounding the `new` keyword when writing modern JavaScript.

([discuss on reddit](http://www.reddit.com/r/javascript/comments/1v7xu0/the_new_javascript_problem/))
