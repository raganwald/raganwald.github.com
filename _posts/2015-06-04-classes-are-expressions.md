---
layout: default
title: "Classes are Expressions (and why that matters)"
tags: allonge
---

*Prerequisite: This post presumes that readers are familiar with JavaScript's objects, know how a prototype defines behaviour for an object, know what a constructor function is, and how a constructor's `.prototype` property is related to the objects it constructs. Passing familiarity with ECMAScript 2015 syntax like `let` and gathering parameters will be extremely helpful.*

[![Vacuum](/assets/images/vacuum.jpg)](https://www.flickr.com/photos/viydook/7613217660)

We have always been able to create a JavaScript class like this:

{% highlight javascript %}
function Person (first, last) {
  this.rename(first, last);
}

Person.prototype.fullName: = function fullName () {
  return this.firstName + " " + this.lastName;
};


Person.prototype.rename = function rename (first, last) {
  this.firstName = first;
  this.lastName = last;
  return this;
}
{% endhighlight %}

`Person` is a constructor function, and it's also a class, [in the JavaScript sense of the word "class"][class]. As we've written it here, it's a *function declaration*. But let's rewrite it as a *function expression*. We'll use `let` just to get into the ECMAScript 2015 swing of things (many people would use `const`, that doesn't matter here):

[class]: http://raganwald.com/2015/05/11/javascript-classes.html

{% highlight javascript %}
let Person = function (first, last) {
  this.rename(first, last);
}

Person.prototype.fullName: = function fullName () {
  return this.firstName + " " + this.lastName;
};


Person.prototype.rename = function rename (first, last) {
  this.firstName = first;
  this.lastName = last;
  return this;
}
{% endhighlight %}

### classes with `class`

ECMAScript 2015 provides the `class` keyword and "compact method notation" as syntactic sugar for writing a function and assigning methods to its prototype (there is a little more involved, but that isn't relevant here). So we can now write our `Person` class like this:

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
{% endhighlight %}

Just like a function declaration, we can also write a *class expression*:

{% highlight javascript %}
let Person = class {
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

This is interesting, because it shows that creating a class in JavaScript (whether we write constructor functions or use the `class` keyword) is evaluating an expression. In this case, our class is created anonymously, we just happen to bind it to `Person`.[^infer] We can create classes, assign them to variables, pass them to functions, or return them from functions, just like any other value in JavaScript.

[^infer]: JavaScript engines will "infer" that the otherwise anonymous function expression should be named `Person` because it is immediately assigned to a variable of that name. There are ways to create a truly anonymous constructor function or "class" and bind it to a name, but that isn't relevant here.

That's a very powerful thing. Not all OOP languages do things that way, some have classes, but they aren't values. Some have classes with names, but the names like in a special space that is separate from the variables we bind. But having classes be "just a function" and having prototypes be "just an object" means they are "just values." And that lets us do anything with a class or a prototype we could do with any other value.

Like what? I'm glad you asked. First, let's review the ECMAScript 2015 `Symbol`:

### symbols

In its simplest form, `Symbol` is a function that returns a unique entity. No two symbols are alike, ever:

{% highlight javascript %}
Symbol() !=== Symbol()
{% endhighlight %}

Symbols have string representations, although they may appear cryptic:[^impl]

[^impl]: The exact representation depends upon the implementation

{% highlight javascript %}
Symbol().toString()
  //=> Symbol(undefined)_u.mwf0blvw5
Symbol().toString()
  //=> Symbol(undefined)_s.niklxrko8m
Symbol().toString()
  //=> Symbol(undefined)_s.mbsi4nduh
{% endhighlight %}

You can add your own text to help make it intelligible:

{% highlight javascript %}
Symbol("Allongé").toString()
  //=> Symbol(Allongé)_s.52x692eab
Symbol("Allongé").toString()
  //=> Symbol(Allongé)_s.q6hq5lx01p
Symbol("Allongé").toString()
  //=> Symbol(Allongé)_s.jii7eyiyza
{% endhighlight %}

There are some ways that JavaScript makes symbols especially handy. Using symbols as property names, for example.

### a problem with encapsulation

One of the huge problems with OOP in JavaScript is that it is very easy for code to become highly coupled. By default, all methods and properties are "public," any piece of code can read and write any property. In our `Person`, it looks very much to the eye like `firstName` and `lastName` are intended to be private, while other objects interact with a person using the `.rename` and `.fullName` methods.

The usual argument against other code reading or writing `.firstName` and `.lastName` directly is that makes it difficult to modify the `Person` class. Imagine that we wish to accommodate an optional middle name:

{% highlight javascript %}
class Person {
  constructor (first, last, middle) {
    this.rename(first, last, middle);
  }
  fullName () {
    return this.middleName
           ? (this.firstName + " " + this.middleName + " " + this.lastName)
           : (this.firstName + " " + this.lastName);
  }
  rename (first, last, middle) {
    this.firstName = first;
    this.lastName = last;
    this.middleName = last;
    return this;
  }
};
{% endhighlight %}

How awkward, but so far nothing breaks, not even the code that directly accesses `.firstName` and `.lastName`. Now we refactor:

{% highlight javascript %}
class Person {
  constructor (...names) {
    this.rename(...names);
  }
  fullName () {
    return this.names.join(" ");
  }
  rename (...names) {
    this.names = names;
    return this;
  }
};
{% endhighlight %}

Presto, we just broke everything that depends directly upon `.firstName` and `.lastName`.

The problem here is that all code has dependencies. The code using `Person` depends upon it's behaviour. The trouble is, code that manipulates `.firstName` and `.lastName` depends upon both the "interface" *and* the "implementation" of `Person`, which makes it difficult to change `Person` in the future. And it's not just `Person` that can't change. We won't write them out here, but every piece of code that *uses* `Person` depend upon each other using it correctly. If one writes the wrong thing in `.firstName` or `.lastName`, all the other pieces of code using `Person` could break.

This may seem very theoretical. But as applications and teams grow, and deadlines loom, and SEV-1 incidents occur, the best of intentions get watered down, and over time, the code gradually becomes fragile. This has been known since the 1960s, and gave rise to Modular Programming, where a hard separation was made between the implementation inside a module, and the interface it exposed to the rest of the code. "OOP" embraced this with the premise that *every object encapsulates its own implementation*.

But our `Person` class does not encapsulate its implementation. Let's use symbols to do so:

### using symbols to encapsulate private properties

In ECMAScript 2015, a symbol can be a property name. So if we arrange things such that a class's methods have a symbol in scope, but no other code has that symbol in scope, we can create relatively private properties.[^but]

[^but]: There are still ways to get around this form of privacy, but they are sufficiently awkward that they will discourage excessive coupling and stand out like a sore thumb at code reviews.

As you probably know, writing `foo.bar` is synonymous with `foo['bar']`. Same thing semantically. So let's begin by rewriting `Person` to use strings for property keys:

{% highlight javascript %}
class Person {
  constructor (first, last) {
    this.rename(first, last);
  }
  fullName () {
    return this['firstName'] + " " + this['lastName'];
  }
  rename (first, last) {
    this['firstName'] = first;
    this['lastName'] = last;
    return this;
  }
};
{% endhighlight %}

So far, exactly the same behaviour, any code that wants to, can access a person's `.firstname` or `.lastName`. Next, we'll extract some variables:

{% highlight javascript %}
let firstNameProperty = 'firstName',
    lastNameProperty  = 'lastName';

class Person {
  constructor (first, last) {
    this.rename(first, last);
  }
  fullName () {
    return this[firstNameProperty] + " " + this[lastNameProperty];
  }
  rename (first, last) {
    this[firstNameProperty] = first;
    this[lastNameProperty] = last;
    return this;
  }
};
{% endhighlight %}

Same thing, but we aren't done yet. Let's use symbols instead of strings:

{% highlight javascript %}
let firstNameProperty = Symbol('firstName'),
    lastNameProperty  = Symbol('lastName');

class Person {
  constructor (first, last) {
    this.rename(first, last);
  }
  fullName () {
    return this[firstNameProperty] + " " + this[lastNameProperty];
  }
  rename (first, last) {
    this[firstNameProperty] = first;
    this[lastNameProperty] = last;
    return this;
  }
};
{% endhighlight %}

This is different. Instances of `Person` won't have properties like `.lastName`, they will be properties like `['Symbol(lastName)_v.cn3u8ad08']`. Furthermore, JavaScript automatically makes these properties non-enumerable, so they won't show up should we use things like `for...in` loops.

So it will be difficult for other code to directly manipulate the properties we use for a person's first and last name. But that being said, we're "exposing" the `firstNameProperty` and `lastNameProperty` variables to the world. WE've encapsulated *instances* of `Person`, but not `Person` itself.

### encapsulating our class implementation

Recall that we said a class is a value that can be assigned to a variable or *returned from a function*. Functions are excellent mechanisms for encapsulating code. Let's start by changing our class declaration into a class expression. We'll make this one a *named class expression* to help with debugging and what-not:

{% highlight javascript %}
let firstNameProperty = Symbol('firstName'),
    lastNameProperty  = Symbol('lastName');

let Person = class Person {
  constructor (first, last) {
    this.rename(first, last);
  }
  fullName () {
    return this[firstNameProperty] + " " + this[lastNameProperty];
  }
  rename (first, last) {
    this[firstNameProperty] = first;
    this[lastNameProperty] = last;
    return this;
  }
};
{% endhighlight %}

Now we wrap the class in an IIFE[^iife]:

{% highlight javascript %}
let firstNameProperty = Symbol('firstName'),
    lastNameProperty  = Symbol('lastName');

let Person = (() = > {
  return class Person {
    constructor (first, last) {
      this.rename(first, last);
    }
    fullName () {
      return this[firstNameProperty] + " " + this[lastNameProperty];
    }
    rename (first, last) {
      this[firstNameProperty] = first;
      this[lastNameProperty] = last;
      return this;
    }
  };
)();
{% endhighlight %}

And finally, we move the property name variables inside the IIFE:

{% highlight javascript %}
let Person = (() = > {
  let firstNameProperty = Symbol('firstName'),
      lastNameProperty  = Symbol('lastName');

  return class Person {
    constructor (first, last) {
      this.rename(first, last);
    }
    fullName () {
      return this[firstNameProperty] + " " + this[lastNameProperty];
    }
    rename (first, last) {
      this[firstNameProperty] = first;
      this[lastNameProperty] = last;
      return this;
    }
  };
)();
{% endhighlight %}

Now this is different. Code outside the IIFE cannot see the property names. We construct a class and return it from the IIFE. We then assign it to the `Person` variable. It's mechanism has been completely encapsulated.

### commentary

Other languages have features like private instance variables, of course. But what makes JavaScript different from languages like Java or C++ is that JavaScript's flexibility gave us the tools to construct our own way to encapsulate properties inside an instance, and to encapsulate the construction of a class inside an IIFE.

This pattern of creating a class that has private variables emerged from combining a few things: The fact that instance variables are properties, the fact that we can use symbols as non-enumerable and hard-to-guess property keys, and the fact that `class` can be used as an expression.

There's no need to have special keywords or magic namespaces. That keeps the "surface area" of the language small, and provides a surprising amount of flexibility. If we want to, we can build mixins, traits, eigenclasses, and all sorts of other constructs that have to be baked into other languages.

(discuss on [hacker news](https://news.ycombinator.com/item?id=9660658))

---

[^iife]: "Immediately Invoked Function Expressions"
[ja6]: https://leanpub.com/javascriptallongesix
