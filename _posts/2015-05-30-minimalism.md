---
layout: default
title: "Minimalism: On the necessity of `const`, `let`, and `var` in JavaScript"
tags: noindex
---

{% highlight javascript %}
{% endhighlight %}

*Disclaimer: JavaScript the language has some complicated edge cases, and as such, the following essay has some hand-wavey bits and some bits that are usually correct but wrong for certain edge cases. If it helps any, pretend that nearly every statement has an asterix and a footnote reading, "for most cases in practice, however \_\_\_\_\_\_."*

###  is `var` necessary?

Before there was a `let` or a `const` in JavaScript, there was `var`. Variables scoped with `var` were either *global* if they were evaluated at the top-level, or *function-scoped* if they appeared anywhere inside a function declaration or function expression.

As a thought experiment, let's ask ourselves: Is `var` really necessary? Can we write JavaScript without it? And let's make it interesting: Can we get rid of `var` without using `let`?

In principle, we can replace declared variables with *parameters*, initializing them to `undefined` if the original code didnt assign them a value. So:

{% highlight javascript %}
function callFirst (fn, larg) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    
    return fn.apply(this, [larg].concat(args))
  }
}
{% endhighlight %}

Becomes:

{% highlight javascript %}
function callFirstWithoutVar (fn, larg, args) {
  return function (args) {
    args = Array.prototype.slice.call(arguments, 0);
    
    return fn.apply(this, [larg].concat(args))
  }
}
{% endhighlight %}

We can manually hoist any `var` that doesn't appear at the top of the function, so:

{% highlight javascript %}
function maybe (fn) {
  return function () {
    
    if (arguments.length === 0) {
      return
    }
    else {
      var i;
      
      for (i = 0; i < arguments.length; ++i) {
        if (arguments[i] == null) return
      }
      return fn.apply(this, arguments)
    }
  }
}
{% endhighlight %}

Becomes:

{% highlight javascript %}
function maybeWithoutVar (fn, i) {
  return function () {
    i = undefined;
    
    if (arguments.length === 0) {
      return
    }
    else {
      for (i = 0; i < arguments.length; ++i) {
        if (arguments[i] == null) return
      }
      return fn.apply(this, arguments)
    }
  }
}
{% endhighlight %}

There are a few flaws with this approach, most significantly that the code we write is misleading to humn readers, as it clutters the function's signature with its local variables. Anotehr problem is that this changes the function's declared arity:

{% highlight javascript %}
callFirst.length
  //=> 2

callFirstWithoutVar
  //=> 3
{% endhighlight %}

Ok, we got rid of `const`. Can we get rid of `let`? Well, it's complicated, but if we go through our code base carefully, we can replace most of the `let`s with [IIFEs][^iife]. For example:

{% highlight javascript %}
function naivePower (n, p) {
  let result = 1;
  
  for(let i = 0; i < p; ++i) {
    result = result + n;
  }
  
  return result
}
{% endhighlight %}

Can be rewritten as:

{% highlight javascript %}
function naivePower (n, p, result, i) {
  result = 1;
  
  for(let i = 0; i < p; ++i) {
    result = result + n;
  }
  
  return result
}
{% endhighlight %}

### is `const` necessary?

Imagine, for a moment, that you have a large codebase written in ECMAScript-6. It contains both `const` and `let` declarations. We presume that the program is working. If we didn't want the `const` declarations, could we get rid of them?

Of course we could. If the program is correct, and we replace every `const` with `let`, it runs just fine. We can take something like this:

{% highlight javascript %}
function* Numbers (from = 0) {
  let number = from;
  while (true)
    yield number++;
};


const zipIterables = (...iterables) =>
  ({
    [Symbol.iterator]: function * () {
      const iterators = iterables.map(i => i[Symbol.iterator]());
      
      while (true) {
        const pairs = iterators.map(j => j.next()),
              dones = pairs.map(p => p.done),
              values = pairs.map(p => p.value);
        
        if (dones.indexOf(true) >= 0) break;
        yield values;
      }
    }
  });

const oldSeats = Numbers(0),
      newSeats = Numbers(1000000),
      correspondence = zipIterables(oldSeats, newSeats);

for (let pair of correspondence) {
  const [from, to] = pair;
  console.log(`${from} -> ${to}`);
}

//=>
  0 -> 1000000
  1 -> 1000001
  2 -> 1000002
  3 -> 1000003
  ...
{% endhighlight %}

And rewrite it to this:

{% highlight javascript %}
function* Numbers (from = 0) {
  let number = from;
  while (true)
    yield number++;
};


let zipIterables = (...iterables) =>
  ({
    [Symbol.iterator]: function * () {
      let iterators = iterables.map(i => i[Symbol.iterator]());
      
      while (true) {
        let pairs = iterators.map(j => j.next()),
            dones = pairs.map(p => p.done),
            values = pairs.map(p => p.value);
        
        if (dones.indexOf(true) >= 0) break;
        yield values;
      }
    }
  });

let oldSeats = Numbers(0),
    newSeats = Numbers(1000000),
    correspondence = zipIterables(oldSeats, newSeats);

for (let pair of correspondence) {
  let [from, to] = pair;
  console.log(`${from} -> ${to}`);
}

//=>
  0 -> 1000000
  1 -> 1000001
  2 -> 1000002
  3 -> 1000003
  ...
{% endhighlight %}

Same result. It seems that `const` doesn't change what the program does. Of course, it does change the way we are allowed to *change* the program, but as far as what the program does, `const` doesn't do anything except add two characters and annoy programmers who like all of their declarations to line up nicely in columns.


[^iife]: "Immediately Invoked Function Expressions"
  

---

This post was extracted from a draft of the book, [JavaScript Allongé, The "Six" Edition][ja6]. The extracts so far:

[ja6]: https://leanpub.com/javascriptallongesix

* [OOP, Javascript, and so-called Classes](http://raganwald.com/2015/05/11/javascript-classes.html),
* [Left-Variadic Functions in JavaScript](http://raganwald.com/2015/04/03/left-variadic.html),
* [Partial Application in ECMAScript 2015](http://raganwald.com/2015/04/01/partial-application.html),
* [The Symmetry of JavaScript Functions](http://raganwald.com/2015/03/12/symmetry.html),
* [Lazy Iterables in JavaScript](http://raganwald.com/2015/02/17/lazy-iteratables-in-javascript.html),
* [The Quantum Electrodynamics of Functional JavaScript](http://raganwald.com/2015/02/13/functional-quantum-electrodynamics.html),
* [Tail Calls, Default Arguments, and Excessive Recycling in ES-6](http://raganwald.com/2015/02/07/tail-calls-defult-arguments-recycling.html), and:
* [Destructuring and Recursion in ES-6](http://raganwald.com/2015/02/02/destructuring.html).

---
