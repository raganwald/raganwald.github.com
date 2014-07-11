---
layout: default
title: "A JavaScript Constructor Problem, and Three Solutions"
tags: [spessore]
---

### preamble

As you know, you can create new objects in JavaScript using a *Constructor Function*, like this:

{% highlight javascript %}
function Fubar (foo, bar) {
  this._foo = foo;
  this._bar = bar;
}

var snafu = new Fubar("Situation Normal", "All Fsked Up");
{% endhighlight %}

When you "call" the constructor with the `new` keyword, you get a new object allocated, and the constructor is called with the new object as the current context. If you don't explicitly return anything from the constructor, you get the new object as the result.

Thus, the body of the constructor function is used to initialize the newly created object. There's another thing: The newly created object is initialized to have a prototype. What prototype? The contents of the constructor's `prototype` property. So we can write:

{% highlight javascript %}
Fubar.prototype.concatenated = function () {
  return this._foo + " " + this._bar;
}

snafu.concatenated()
  //=> 'Situation Normal All Fsked Up'
{% endhighlight %}

Thanks to the internal mechanics of JavaScript's `instanceof` operator, we can use it to test whether an object is likely to have been created with a particular constructor:

{% highlight javascript %}
snafu instanceof Fubar
  //=> true
{% endhighlight %}

(It's possible to "fool" `instanceof` when working with more advanced idioms, or if you're the kind of malicious troglodyte who collects language corner cases and enjoys inflicting them on candidates in job interviews. But it works well enough for our purposes.)

### the problem

What happens if we call the constructor, but accidentally omit the `new` keyword?

{% highlight javascript %}
var fubar = Fubar("Fsked Up", "Beyond All Recognition");

fubar
  //=> undefined
{% endhighlight %}

William-Thomas-Fredreich!? We've called an ordinary function that doesn't return anything. so `fubar` is undefined. That's not what we want. Actually, it's worse than that:

{% highlight javascript %}
_foo
  //=> 'Fsked Up'
{% endhighlight %}

JavaScript sets `this` to the global environment by default for calling an ordinary function, so we've just blundered about in the global environment. We can fix that somewhat:

{% highlight javascript %}
function Fubar (foo, bar) {
  "use strict"

  this._foo = foo;
  this._bar = bar;
}

Fubar("Situation Normal", "All Fsked Up");
  //=> TypeError: Cannot set property '_foo' of undefined
{% endhighlight %}

Although `"use strict"` might be omitted from code in blog posts and books (mea culpa!), in production it is very nearly mandatory for reasons just like this. But nevertheless, constructors that do not take into account the possibility of being called without the `new` keyword are a potential problem.

So what can we do?

### solution: auto-instantiation

In [Effective JavaScript], David Herman describes *auto-instantiation*. When we call a constructor with `new`, The pseudo-variable `this` is set to a new instance of our "class," so-to-speak. We can use this to detect whether our constructor has been called with `new`:

{% highlight javascript %}
function Fubar (foo, bar) {
  "use strict"

  var obj,
      ret;

  if (this instanceof Fubar) {
    this._foo = foo;
    this._bar = bar;
  }
  else return new Fubar(foo, bar);
}

Fubar("Situation Normal", "All Fsked Up");
  //=>
    { _foo: 'Situation Normal',
      _bar: 'All Fsked Up' }
{% endhighlight %}

[Effective JavaScript]: http://effectivejs.com

Why bother making it work without `new`? One problem this solves is that `new Fubar(...)` does not *compose*. Consider:

{% highlight javascript %}
function logsArguments (fn) {
  return function () {
    console.log.apply(this, arguments);
    return fn.apply(this, arguments)
  }
}

function sum2 (a, b) {
  return a + b;
}

var logsSum = logsArguments(sum2);

logsSum(2, 2)
  //=>
    2 2
    4
{% endhighlight %}

`logsArguments` decorates a function by returning a version of the function that logs its arguments. Let's try it on the original `Fubar`:

{% highlight javascript %}
function Fubar (foo, bar) {
  this._foo = foo;
  this._bar = bar;
}
Fubar.prototype.concatenated = function () {
  return this._foo + " " + this._bar;
}

var LoggingFubar = logsArguments(Fubar);

var snafu = new LoggingFubar("Situation Normal", "All Fsked Up");
  //=> Situation Normal All Fsked Up

snafu.concatenated()
  //=> TypeError: Object [object Object] has no method 'concatenated'
{% endhighlight %}

This doesn't work because `snafu` is actually an instance of `LoggingFubar`, not of `Fubar`. But if we use the auto-instantiating version of `Fubar`:

{% highlight javascript %}
function Fubar (foo, bar) {
  "use strict"

  var obj,
      ret;

  if (this instanceof Fubar) {
    this._foo = foo;
    this._bar = bar;
  }
  else {
    obj = new Fubar();
    ret = Fubar.apply(obj, arguments);
    return ret === undefined
           ? obj
           : ret;
  }
}
Fubar.prototype.concatenated = function () {
  return this._foo + " " + this._bar;
}

var LoggingFubar = logsArguments(Fubar);

var snafu = new LoggingFubar("Situation Normal", "All Fsked Up");
  //=> Situation Normal All Fsked Up

snafu.concatenated()
  //=> 'Situation Normal All Fsked Up'
{% endhighlight %}

Now it works, but of course `snafu` is an instance of `Fubar`, not of `LoggingFubar`. Is that what you want? Who knows!? This isn't a justification for the pattern, as much as an explanation that it is a useful, but leaky abstraction. It doesn't "just work," but it can make certain things possible (like decorating constructors) that are otherwise even more awkward to implement.

### solution: overload its meaning

It can be very handy to have a function that tests for an object being an instance of a particular class. If we can stomach the idea of one function doing two different things, we can make the constructor its own `instanceof` test:

{% highlight javascript %}
function Fubar (foo, bar) {
  "use strict"

  if (this instanceof Fubar) {
    this._foo = foo;
    this._bar = bar;
  }
  else return arguments[0] instanceof Fubar;
}

var snafu = new Fubar("Situation Normal", "All Fsked Up");

snafu
  //=>
    { _foo: 'Situation Normal',
      _bar: 'All Fsked Up' }

Fubar({})
  //=> false
Fubar(snafu)
  //=> true
{% endhighlight %}

This allows us to use the constructor as an argument in [predicate and multiple dispatch][2], or as a filter:

{% highlight javascript %}
var arrayOfSevereProblems = problems.filter(Fubar);
{% endhighlight %}

[2]:http://raganwald.com/2014/06/23/multiple-dispatch.html "Greenspunning Predicate and Multiple Dispatch in JavaScript"

### solution: kill it with fire

If we don't have some pressing need for auto-instantiation, and if we care not for overloaded functions, we may wish to avoid accidentally calling a constructor without using `new`. We saw that `"use strict"` can help, but it's not a panacea. It won't throw an error if we don't actually try to assign a value to the global environment. And if we try to do something *before* assigning a value, it will do that thing no matter what.

Perhaps it's better to take matters into our own hands. Olivier Scherrer [suggests][1] the following pattern:

[1]: http://podefr.tumblr.com/post/75666281033/the-auto-instantiating-javascript-constructor-is-an "The auto-instantiating JavaScript constructor is an anti-pattern"

{% highlight javascript %}
function Fubar (foo, bar) {
  "use strict"

  if (!(this instanceof Fubar)) {
      throw new Error("Fubar needs to be called with the new keyword");
  }

  this._foo = foo;
  this._bar = bar;
}

Fubar("Situation Normal", "All Fsked Up");
  //=> Error: Fubar needs to be called with the new keyword
{% endhighlight %}

Simple and safer than only relying on `"use strict"`. If you like having a simple `instanceof` test, you can bake it into the constructor as a function method:

{% highlight javascript %}
Fubar.is = function (obj) {
  return obj instanceof Fubar;
}

var arrayOfSevereProblems = problems.filter(Fubar.is);
{% endhighlight %}

---

There you have it: Constructors that fail when called without `new` are a potential problem, and three solutions we can use are, respectively, auto-instantiation, overloading the constructor, or killing such calls with fire.

(discuss on [reddit](http://www.reddit.com/r/javascript/comments/2acr9f/a_javascript_constructor_problem_and_three/))
