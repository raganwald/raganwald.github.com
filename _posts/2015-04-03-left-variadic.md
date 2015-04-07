---
layout: default
title: Left-Variadic Functions in JavaScript
tags: JavaScript, noindex
---

[![Football at Fenway](/assets/images/football-at-fenway.jpg)](https://www.flickr.com/photos/ekilby/7651165338 "Football at Fenway Pregame Lineups (c) 2012 Eric Kilby")

A *variadic function* is a function that is designed to accept a variable number of arguments.[^eng] In JavaScript, you can make a variadic function by gathering parameters. For example:

[^eng]: English is about as inconsistent as JavaScript: Functions with a fixed number of arguments can be unary, binary, ternary, and so forth. But can they be "variary?" No! They have to be "variadic."

{% highlight javascript %}
const abccc = (a, b, ...c) => {
  console.log(a);
  console.log(b);
  console.log(c);
};

abccc(1, 2, 3, 4, 5)
  1
  2
  [3,4,5]
{% endhighlight %}

This can be useful when writing certain kinds of destructuring algorithms. For example, we might want to have a function that builds some kind of team record. It accepts a coach, a captain, and an arbitrary number of players. Easy in ECMAScript 2015:

{% highlight javascript %}
function team(coach, captain, ...players) {
  console.log(`${captain} (captain)`);
  for (let player of players) {
    console.log(player);
  }
  console.log(`squad coached by ${coach}`);
}

team('Luis Enrique', 'Xavi Hernández', 'Marc-André ter Stegen', 'Martín Montoya', 'Gerard Piqué')
  //=>
    Xavi Hernández (captain)
    Marc-André ter Stegen
    Martín Montoya
    Gerard Piqué
    squad coached by Luis Enrique
{% endhighlight %}

But we can't go the other way around:

{% highlight javascript %}
function team2(...players, captain, coach) {
  console.log(`${captain} (captain)`);
  for (let player of players) {
    console.log(player);
  }
  console.log(`squad coached by ${coach}`);
}
//=> Unexpected token
{% endhighlight %}

ECMAScript 2015 only permits gathering parameters from the *end* of the parameter list. Not the beginning. What to do?

### a history lesson

In "Ye Olde Days,"[^ye] JavaScript could not gather parameters, and we had to either do backflips with `arguments` and `.slice`, or we wrote ourselves a `variadic` decorator that could gather arguments into the last declared parameter. Here it is:

[^ye]: Another history lesson. "Ye" in "Ye Olde," was not actually spelled with a "Y" in days of old, it was spelled with a [thorn](https://en.wikipedia.org/wiki/Thorn_(letter)), and is pronounced "the." Another word, "Ye" in "Ye of little programming faith," is pronounced "ye," but it's a different word altogether.

{% highlight javascript %}
var __slice = Array.prototype.slice;

function rightVariadic (fn) {
  if (fn.length < 1) return fn;

  return function () {
    var ordinaryArgs = (1 <= arguments.length ? 
          __slice.call(arguments, 0, fn.length - 1) : []),
        restOfTheArgsList = __slice.call(arguments, fn.length - 1),
        args = (fn.length <= arguments.length ?
          ordinaryArgs.concat([restOfTheArgsList]) : []);
    
    return fn.apply(this, args);
  }
};

var firstAndButFirst = rightVariadic(function test (first, butFirst) {
  return [first, butFirst]
});

firstAndButFirst('why', 'hello', 'there', 'little', 'droid')
  //=> ["why",["hello","there","little","droid"]]
{% endhighlight %}

We don't need `rightVariadic` any more, because instead of:

{% highlight javascript %}
var firstAndButFirst = rightVariadic(function test (first, butFirst) {
  return [first, butFirst]
});
{% endhighlight %}

We now simply write:

{% highlight javascript %}
const firstAndButFirst = (first, ...butFirst) => [first, butFirst];
{% endhighlight %}

This is a *right-variadic function*, meaning that it has one or more fixed arguments, and the rest are gathered into the rightmost argument.

### overcoming limitations

It's nice to have progress. But as noted above, we can't write:

{% highlight javascript %}
const butLastAndLast = (...butLast, last) => [butLast, last];
{% endhighlight %}

That's a *left-variadic function*. All left-variadic functions have one or more fixed arguments, and the rest are gathered into the leftmost argument. JavaScript doesn't do this. But if we wanted to write left-variadic functions, could we make ourselves a `leftVariadic` decorator to turn a function with one or more arguments into a left-variadic function?

We sure can, by using the techniques from `rightVariadic`. Mind you, we can take advantage of modern JavaScript to simplify the code:

{% highlight javascript %}
const leftVariadic = (fn) => {
  if (fn.length < 1) {
    return fn;
  }
  else {
    return function (...args) {
      return fn.apply(this, [args.slice(0, args.length - fn.length + 1)].concat(args.slice(args.length - fn.length + 1)))
    }
  }
};

const butLastAndLast = leftVariadic((butLast, last) => [butLast, last]);

butLastAndLast('why', 'hello', 'there', 'little', 'droid')
  //=> [["why","hello","there","little"],"droid"]
{% endhighlight %}

Our `leftVariadic` function is a decorator that turns any function into a function that gathers parameters *from the left*, instead of from the right.

### left-variadic destructuring

Gathering arguments for functions is one of the ways JavaScript can *destructure* arrays. Another way is when assigning variables, like this:

{% highlight javascript %}
const [first, ...butFirst] = ['why', 'hello', 'there', 'little', 'droid'];

first
  //=> 'why'
butFirst
  //=> ["hello","there","little","droid"]
{% endhighlight %}

As with parameters, we can't gather values from the left when destructuring an array:

{% highlight javascript %}
const [...butLast, last] = ['why', 'hello', 'there', 'little', 'droid'];
  //=> Unexpected token
{% endhighlight %}

We could use `leftVariadic` the hard way:

{% highlight javascript %}
const [butLast, last] = leftVariadic((butLast, last) => [butLast, last])(...['why', 'hello', 'there', 'little', 'droid']);

butLast
  //=> ['why', 'hello', 'there', 'little']

last
  //=> 'droid'
{% endhighlight %}

But we can write our own left-gathering function utility using the same principles without all the tedium:

{% highlight javascript %}
const leftGather = (outputArrayLength) => {
  return function (inputArray) {
    return [inputArray.slice(0, inputArray.length - outputArrayLength + 1)].concat(
      inputArray.slice(inputArray.length - outputArrayLength + 1)
    )
  }
};

const [butLast, last] = leftGather(2)(['why', 'hello', 'there', 'little', 'droid']);
  
butLast
  //=> ['why', 'hello', 'there', 'little']

last
  //=> 'droid'
{% endhighlight %}

With `leftGather`, we have to supply the length of the array we wish to use as the result, and it gathers excess arguments into it from the left, just like `leftVariadic` gathers excess parameters for a function.

### summary

ECMAScript 2015 makes it easy to gather parameters or array elements from the right. If we want to gather them from the left, we can roll our own left-variadic decorator for functions, or left-gatherer for destructuring arrays.