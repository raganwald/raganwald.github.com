---
title: "Method Advice in Modern JavaScript"
layout: default
tags: allonge
---

We've [previously](http://raganwald.com/2015/06/28/method-decorators.html) looked at using ES.later [method decorators] like this:[^ES.later]

[method decorators]: https://github.com/wycats/javascript-decorators

[^ES.later]: By "ES.later," we mean some future version of ECMAScript that is likely to be approved eventually, but for the moment exists only in transpilers like [Babel](http://babeljs.io). Obviously, using any ES.later feature in production is a complex decision requiring many more considerations than can be enumerated in a blog post.

{% highlight javascript %}
const wrapWith = (decorator) =>
  function (target, name, descriptor) {
    descriptor.value = decorator(descriptor.value);
  }

const fluent = (method) =>
  function (...args) {
    method.apply(this, args);
    return this;
  }

class Person {
  @wrapWith(fluent)
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }
};
{% endhighlight %}

The `wrapWith` function takes an ordinary method decorator and turns it into an ES.later method decorator. This is not necessary in production, as you can write your decorators directly for ES.later if you are using a Transpiler like [Babel]. But it does allow us to write decorators that work in ES6 and ES.later, so if you aren't targeting ES.later, you can write your code like this:

{% highlight javascript %}

const fluent = (method) =>
  function (...args) {
    method.apply(this, args);
    return this;
  }

class Person {
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }
};

Person.prototype.setName = fluent(Person.prototype.setName);
{% endhighlight %}

### what question do method decorators answer?

The ES.later method decorators put the decorations right next to the method body. This makes it easy to answer the question "What is the precise behaviour of this method?"

But sometimes, this is not what you want. Consider a responsibility like authentication. Let's imagine that we validate permissions in our model classes. We might write something like this:

{% highlight javascript %}
const wrapWith = (decorator) =>
  function (target, name, descriptor) {
    descriptor.value = decorator(descriptor.value);
  }

const mustBeMe = (method) =>
  function (...args) {
    if (currentUser() && currentUser().person().equals(this))
      return method.apply(this, args);
    else throw new PermissionsException("Must be me!");
  }

class Person {

  @wrapWith(mustBeMe)
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }

  @wrapWith(mustBeMe)
  setAge (age) {
    this.age = age;
  }

  @wrapWith(mustBeMe)
  age () {
    return this.age;
  }

};
{% endhighlight %}

(Obviously real permissions systems involve roles and all sorts of other important things.)

Now we can look at `setName` and see that users can only set their own name, likewise if we look at `setAge`, we see that users can only set their own age.

In a tiny toy example the next question is easy to answer: *What methods can only be invoked by the person themselves?* We see at a glance that the answer is `setName`, `setAge`, and `age`.

But as classes grow, this becomes more difficult to answer. This especially becomes difficult if we decompose classes using mixins. For example, what if `setAge` and `age` come from a mixin:

{% highlight javascript %}
@HasAge
class Person {

  @wrapWith(mustBeMe)
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }

};
{% endhighlight %}

Are they wrapped with `mustBeMe`? Quite possibly not, because the mixin is responsible for defining the behaviour, it's up to the model class to decide the permissions required. But how would you know?

Method decorators make it easy to answer the question "what is the behaviour of this method?" But they dont make it easy to answer the question "what methods share this behaviour?"

That question matters, because when decomposing responsibilities, we often decide that a *cross-cutting* responsibility like permissions should be distinct from an implementation responsibility like storing a name.

### cross-cutting method decorators

There is another way to decorate methods: We can decorate multiple methods in a single declaration. This is called providing *method advice*.

In JavaScript, we can implement method advice by decorating the entire class. A class decorator is nothing more than a function that takes a class as an argument and returns the same or a different class. We already have a combinator for making mixins (see [Using ES.later Decorators as Mixins](http://raganwald.com/2015/06/26/decorators-in-ES.later.html)):

{% highlight javascript %}
function mixin (behaviour, sharedBehaviour = {}) {
  const instanceKeys = Reflect.ownKeys(behaviour);
  const sharedKeys = Reflect.ownKeys(sharedBehaviour);
  const typeTag = Symbol('isa');

  function _mixin (clazz) {
    for (let property of instanceKeys)
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour[property],
        writable: true
      });
    Object.defineProperty(clazz.prototype, typeTag, { value: true });
    return clazz;
  }
  for (let property of sharedKeys)
    Object.defineProperty(_mixin, property, {
      value: sharedBehaviour[property],
      enumerable: sharedBehaviour.propertyIsEnumerable(property)
    });
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: (i) => !!i[typeTag]
  });
  return _mixin;
}

const HasAge = mixin({
  setAge (age) {
    this.age = age;
  },

  age () {
    return this.age;
  }
});

@HasAge
class Person {

  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }

};
{% endhighlight %}

We can use the same technique to write a class decorator that decorates one or more methods:

{% highlight javascript %}
const around = (behaviour, ...methodNames) =>
  (clazz) => {
    for (let methodName of methodNames)
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour(clazz.prototype[methodName]),
        writable: true
      });
    return clazz;
  }

@HasAge
@around(mustBeMe, 'setName', 'setAge', 'age')
class Person {

  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }

};
{% endhighlight %}

Now when you look at `setName`, you don't see what permissions apply. However, when we look at `@around(mustBeMe, 'setName', 'setAge', 'age')`, we see that we're wrapping `setName`, `setAge` and `age` with `mustBeMe`.

This focuses the responsibility for permissions in one place. Of course, we could make things simpler. For one thing, some actions are only performed *before* a method, and some only *after* a method:

{% highlight javascript %}
const before = (behaviour, ...methodNames) =>
  (clazz) => {
    for (let methodName of methodNames) {
      const method = clazz.prototype[methodName];

      Object.defineProperty(clazz.prototype, property, {
        value: function (...args) {
          behaviour.apply(this, args);
          return method.apply(this, args);
        },
        writable: true
      });
    }
    return clazz;
  }

const after = (behaviour, ...methodNames) =>
  (clazz) => {
    for (let methodName of methodNames) {
      const method = clazz.prototype[methodName];

      Object.defineProperty(clazz.prototype, property, {
        value: function (...args) {
          const returnValue = method.apply(this, args);

          behaviour.apply(this, args);
          return returnValue;
        },
        writable: true
      });
    }
    return clazz;
  }
{% endhighlight %}

Precondition checks like `mustBeMe` are good candidates for `before`. Here's `mustBeLoggedIn` and `mustBeMe` set up to use `before`. They're far simpler since `before` handles the wrapping:

{% highlight javascript %}
const mustBeLoggedIn = () => {
    if (currentUser() == null)
      throw new PermissionsException("Must be logged in!");
  }

const mustBeMe = () => {
    if (currentUser() == null || !currentUser().person().equals(this))
      throw new PermissionsException("Must be me!");
  }

@HasAge
@before(mustBeMe, 'setName', 'setAge', 'age')
@before(mustBeLoggedIn, 'fullName')
class Person {

  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }

};
{% endhighlight %}

This style of moving the responsibility for decorating methods to a single declaration will appear familiar to Ruby on Rails developers. As you can see, it does not require "deep magic" or complex libraries, it is a pattern that can be written out in just a few lines of code.

Mind you, there's always room for polish and gold plate. We could enhance `before`, `after`, and `around` to include conveniences like regular expressions to match method names, or special declarations like `except:` or `only:` if we so desired.

### final thought

Although decorating methods in bulk has appeared in other languages and paradigms, it's not something special and alien to JavaScript, it's really the same pattern we see over and over again: Programming by composing small and single-responsibility entities, and using functions to transform and combine the entities into their final form.

---

### a word about es6

Although ES.later has not been approved, there is extensive support for ES.later method decorators in transpilation tools. The examples in this post were evaluated with [Babel](http://babeljs.io). If we don't want to use ES.later decorators, we can use the exact same decorators as *ordinary functions*, like this:

{% highlight javascript %}
const mustBeLoggedIn = () => {
    if (currentUser() == null)
      throw new PermissionsException("Must be logged in!");
  }

const mustBeMe = () => {
    if (currentUser() == null || !currentUser().person().equals(this))
      throw new PermissionsException("Must be me!");
  }

const Person =
  HasAge(
  before(mustBeMe, 'setName', 'setAge', 'age')(
  before(mustBeLoggedIn, 'fullName')(
    class {
      setName (first, last) {
        this.firstName = first;
        this.lastName = last;
      }

      fullName () {
        return this.firstName + " " + this.lastName;
      }
    }
  )
  )
);
{% endhighlight %}

Composition could also help:

{% highlight javascript %}
const mustBeLoggedIn = () => {
    if (currentUser() == null)
      throw new PermissionsException("Must be logged in!");
  }

const mustBeMe = () => {
    if (currentUser() == null || !currentUser().person().equals(this))
      throw new PermissionsException("Must be me!");
  }

const Person = compose(
  HasAge,
  before(mustBeMe, 'setName', 'setAge', 'age'),
  before(mustBeLoggedIn, 'fullName'),
)(class {
  setName (first, last) {
    this.firstName = first;
    this.lastName = last;
  }

  fullName () {
    return this.firstName + " " + this.lastName;
  }
});
{% endhighlight %}

[Babel]: http://babeljs.io
