---
layout: default
published: true
tags: [allonge, spessore]
---

Many people can and do say that "JavaScript has classes." As a very rough, hand-wavy way of saying that "JavaScript has things that define the characteristics of one or more objects," this is true. And many people lead healthy, happy, and productive lives without caring whether this statement is actually true, or a wrong but convenient shorthand.

[![Duty Calls](http://imgs.xkcd.com/comics/duty_calls.png)](http://xkcd.org/386)

But it *is* wrong. JavaScript does not have classes. JavaScript has prototypes, and prototypes are not classes. And understanding *why* JavaScript's prototypes are not classes can be helpful for understanding how to "Think in JavaScript" and indeed how to "Think in Objects."

So let's go:

### what is a class?

Let's look at a language that everyone agrees has classes: Ruby (SmallTalk is a better example, but a little less familiar these days). Ruby's classes are also Ruby objects, they have responsibilities and methods just like any other object. What are their responsibilities?

1. Manufacture new objects
2. Define the behaviour of the objects they manufacture

So far, so good. Now let's look at JavaScript

### what is a constructor?

A constructor in JavaScript is a function. When used in conjunction with the `new` keyword, it makes a new object and initializes the new object with a prototype. Here's an example in use:

    function MovieCharacter (firstName, lastName) {
      this.firstName = firstName;
      this.lastName = lastName;
    };

    MovieCharacter.prototype.fullName = function () {
      return this.firstName + " " + this.lastName;
    };

    var jm = new MovieCharacter('John', 'Murdoch')
      //=> { firstName: 'John', lastName: 'Murdoch' }

    MovieCharacter.prototype.isPrototypeOf(jm)
      //=> true

When programmed in this way, JavaScript has two parts that interact: a constructor function and a prototype:

1. The constructor manufactures new objects
2. The prototype defines the behaviour of new objects manufactured by the constructor

These are the same points we made when looking at SmallTalk classes. What's the difference?

### what methods do prototypes and classes have?

To see the difference, let's focus on the responsibility for defining the behaviour of objects. Classes do it one way, prototypes do it another, and the difference is substantial.

Let's revisit our example. To make things clearer, we'll pull the prototype out:

    function MovieCharacter (firstName, lastName) {
      this.firstName = firstName;
      this.lastName = lastName;
    };

    var MovieCharacterPrototype = MovieCharacter.prototype;

    MovieCharacterPrototype.fullName = function () {
      return this.firstName + " " + this.lastName;
    };

What are the prototype's methods?

    Object.keys(MovieCharacterPrototype).filter(function (key) {
      return typeof(MovieCharacter.prototype[key]) === 'function'
    });
      //=> [ 'fullName' ]

In JavaScript, `fullName` is a method of `MovieCharacter`'s prototype. The prototype's methods are the behaviour we're defining for `MovieCharacter` objects. Let's say that again: In JavaScript, the methods of a prototype are the methods of the objects it defines.

Now let's compare this to a "class." JavaScript doesn't have classes right out of the box, so we'll compare the prototype's methods to the methods of an equivalent Ruby class as an example:

    class MovieCharacter

      def initialize(first_name, last_name)
        @first_name, @last_name = first_name, last_name
      end

      def full_name
        "#{first_name} #{last_name}"
      end

    end

    MovieCharacter.methods - Object.instance_methods
    #=> [ :allocate, :new, :superclass, :<, :<=, :>, :>=, :included_modules, :include?,
          :name, :ancestors, :instance_methods, :public_instance_methods,
          :protected_instance_methods, :private_instance_methods, :constants, :const_get,
          :const_set, :const_defined?, :const_missing, :class_variables,
          :remove_class_variable, :class_variable_get, :class_variable_set,
          :class_variable_defined?, :public_constant, :private_constant, :module_exec,
          :class_exec, :module_eval, :class_eval, :method_defined?, :public_method_defined?,
          :private_method_defined?, :protected_method_defined?, :public_class_method,
          :private_class_method, :autoload, :autoload?, :instance_method,
          :public_instance_method ]

In Ruby, `full_name` isn't a method of the `MovieCharacter` class, and unlike JavaScript, the class has lots and lots of methods that are specific to the business of being a class that aren't shared by "ordinary" objects.

JavaScript prototypes look just like "ordinary" objects, while Ruby classes don't look anything like "ordinary" objects.

### classes

When programming "ordinary" or "domain" objects, we typically attempt to hide internal state. Objects present an abstraction to other objects by providing a collection of methods that match the concerns the other objects manage. Objects then implement those methods by manipulating their internal, hidden state.

If we look at a Ruby class as an object, we see this in action. Obviously, there is a list of methods inside it somewhere. If you want it, you ask for it with `.instance_methods` (Let's ignore specializations for filtering by access level).  You can query other things, like `.ancestors`. Defining methods is also accomplished with a method, `define_method` (which private, but that's another story).

These are not "class methods," they are instance methods of every class object. They are the way in which Ruby programs interact with Ruby classes, and rightly or wrongly, they are "OO" way to meta-program, to write programs that modify themselves.

And where do these "instance methods of a class" come from? How is it that the class `Object` and the class `String` both have methods like `.const_defined?` If you don't already know, the answer is the same as if we asked why two different `MovieCharacter` instances both have a `.fullName` method: All classes in Ruby are instances of the `Class` (and by extension, `Module`) *metaclasses*. There is a class that defines the behaviour of every class, just like we can write a `MovieCharacterPrototype` to define the behaviour of every `MovieCharacter`.

Ruby classes thus have two interesting characteristics:

1. They encapsulate their internal state, presenting an interface for querying and updating object behaviour through methods, and;
2. Like other specialized objects in an OO program, their behaviour is defined by a class. Since they are classes, the convention is to call a class's class a "metaclass."

### prototypes

JavaScript prototypes are also objects. But unlike Ruby's classes, they provide nearly *zero* encapsulation of their internal state. Methods and other properties are exposed and accessed directly. This is by design, if you try to add an `.instance_methods` method to a prototype, it would instantly become a method of its objects, and that's unlikely to be what you want.

Furthermore, prototypes by default do not inherit behavior from a specialized prototype. There is no `meta-prototype`. Prototypes by default inherit from `Object.prototype`, just like an object you'd create with literal object syntax.

A prototype is really a representation of private internal state that a class would manage. Only instead of wrapping that in a class and presenting an interface for manipulating behaviour, JavaScript puts the data structure, naked, on the table for JavaScript programs to manipulate directly.

JavaScript and Ruby use *completely different* approaches. This is not surprising when you learn that Ruby was inspired by [Smalltalk][], a language that emphasized classes, while JavaScript was inspired by  [Self][], a successor to Smalltalk that used prototypes instead of classes.

[Self]: https://en.wikipedia.org/wiki/Self_programming_language
[Smalltalk]: https://en.wikipedia.org/wiki/Smalltalk

### metaobjects

Despite the fact that prototypes are not classes, both prototypes and classes accomplish the same thing. If they aren't "classes," what word describes what they have in common?

**Metaobjects**. Prototypes and classes are both metaobjects, objects that define objects.

> In computer science, a **metaobject** is an object that manipulates, creates, describes, or implements other objects (including itself). The object that the metaobject is about is called the base object. Some information that a metaobject might store is the base object's type, interface, class, methods, attributes, parse tree, etc.—[Wikipedia](https://en.wikipedia.org/wiki/Metaobject)

(To be pedantic, some languages have things they call classes that aren't metaobjects. To be a metaobject, the entity must be an object in the language. SmallTalk, Java and Ruby classes are metaobjects. [C++] classes are not.)

### can we build classes in javascript?

Well of course! And the conventional approach of writing a constructor is kind-of sort-of a first step towards that. You can make things more explicit using `Object.create`:

    var MovieCharacterClass = {
      create: function create (firstName, lastName) {
        var mc = Object.create(MovieCharacterClass.prototype);
        mc.firstName = firstName;
        mc.lastName = lastName;
        return mc;
      },
      prototype: {
        fullName: function fullName () {
          return this.firstName + " " + this.lastName;
        }
      }
    }

This is extremely minimalist. Is it a class? Not yet. To be a class, you would need to build upwards from it by creating a metaobject that defined the common behaviour for all classes. Once you do that, you have enshrined in your program the idea that classes are a kind thing that is distinct from the kinds of things you use in your program's domain logic.

### good or bad?

Prototypes are *not* classes, and neither are constructor functions bundled with prototypes. They don't encapsulate their private data, and they don't have a metaclass object defining their behaviour.

A prototype is to a class as a database record is to a model object. Is this a good thing or a bad thing? That is a question for each programmer to answer for themselves. If you embrace the notion that OO programming is about encapsulating internal state, direct manipulation of prototypes is a blatant violation of this core principle.

On the other hand, you may not be trying to write "OO" programs. or you may be more relaxed about picking and choosing your principles. Either way, sometimes someone will say that a JavaScript prototype (or a JavaScript constructor function plus its embedded prototype) is a class.

What they *really mean* is that JavaScript has metaobjects, not classes.

[C++]: https://en.wikipedia.org/wiki/C%2B%2B

(discussions on [hacker news](https://news.ycombinator.com/item?id=7084794) and [reddit](http://www.reddit.com/r/javascript/comments/1vlm6f/prototypes_are_not_classes/))
