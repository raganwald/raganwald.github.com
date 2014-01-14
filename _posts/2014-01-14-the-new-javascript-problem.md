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

Having multiple JavaScript functions share the same prototype serves the same purpose as one Java class having multiple constructor functions.### `Object.create`

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

> Most OO programmers prefer using polymorphism to explicitly testing `instanceof`. Wide use of explicit type testing is generally a design smell, but nevertheless it is a useful tool in some circumstances.

    fourByFour instanceof Rectangle
      //=> true

It is a kind of shorthand for:

    function instanceOf(object, constructor) {
      return constructor.prototype.isPrototypeOf(object)
    }

The trouble with `instanceof` is that it is unreliable whenever you use `Object.create` instead of the `new` keyword, or when you replace the prototype of a function used as a constructor. Semantically, the item of interest in the prototype, and therefore if you use `Object.create` instead of the `new` keyword, you must also use `.isPrototypeOf` instead of `instanceof`.

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

