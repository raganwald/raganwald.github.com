---
title: The "Drunken Walk" Programming Problem
layout: default
ad: javascript-allonge
---

In [Tortoises, Teleporting Turtles, and Iterators](http://raganwald.com/2013/02/15/turtles-and-iterators.js.html), we looked at the "Tortoise and Hare" algorithm for detecting a linked list. Like many such algorithms, it "tangles" two different concerns:

1. The mechanism for iterating over a list.
2. The algorithm for detecting a loop in a list.

{% highlight javascript %}
var LinkedList = (function() {

  function LinkedList(content, next) {
    this.content = content;
    this.next = next != null ? next : void 0;
  }

  LinkedList.prototype.appendTo = function(content) {
    return new LinkedList(content, this);
  };

  LinkedList.prototype.tailNode = function() {
    var nextThis;
    return ((nextThis = this.next) != null ? nextThis.tailNode() : void 0) || this;
  };

  return LinkedList;

})();

function tortoiseAndHareLoopDetector (list) {
  var hare, tortoise, nextHare;
  tortoise = list;
  hare = list.next;
  while ((tortoise != null) && (hare != null)) {
    if (tortoise === hare) {
      return true;
    }
    tortoise = tortoise.next;
    hare = (nextHare = hare.next) != null ? nextHare.next : void 0;
  }
  return false;
};
{% endhighlight %}

### functional iterators

We then went on to discuss how to use functional iterators to untangle concerns like this, and used taking the sum of a list as an example. A functional iterator is a stateful function that iterates over a data structure. Every time you call it, it returns the next element from the data structure. If and when it completes its traversal, it returns `undefined`.

For example, here is a function that takes an array and returns a functional iterator over the array:

{% highlight javascript %}
function ArrayIterator (array) {
  var index = 0;
  return function() {
    return array[index++];
  };
};
{% endhighlight %}

Iterators allow us to write (or refactor) functions to operate on iterators instead of data structures. That increases reuse. We can also write higher-order functions that operate directly on iterators such as mapping and selecting. That allows us to write lazy algorithms.

### refactoring the tortoise and hare

In [the previous post](http://raganwald.com/2013/02/15/turtles-and-iterators.js.html), we refactored other algorithms, but not the Tortoise and Hare. Let's do that now: We'll refactor it to use iterators instead of directly operate on linked lists. We'll add an `.iterator()` method to linked lists, and we'll rewrite our loop detector function to take an "iterable" instead of a list:

{% highlight javascript %}
LinkedList.prototype.iterator = function() {
  var list = this;
  return function() {
    var value = list != null ? list.content : void 0;
    list = list != null ? list.next : void 0;
    return value;
  };
};

function tortoiseAndHareLoopDetector (iterable) {
  var tortoise = iterable.iterator(),
      hare = iterable.iterator(), 
      tortoiseValue, 
      hareValue;
  while (((tortoiseValue = tortoise()) != null) && ((hare(), hareValue = hare()) != null)) {
    if (tortoiseValue === hareValue) {
      return true;
    }
  }
  return false;
};
{% endhighlight %}

We now have a function that will operate on anything that responds to the `.iterate()` method.[^not-exactly] It's classic "Duck Typed" Object-Orientation. So, how shall we put it to work?

[^not-exactly]: As Chris Johnsen [points out](https://github.com/braythwayt/braythwayt.github.com/commit/a92cb21fe8f16438ca5326161458f99101e0ded3#commitcomment-2672985): *The list-specific implementation of tortoiseAndHareLoopDetector (also in the prior post) compares “locations” (i.e. “cons cell” object identity), but this version compares values; this introduces a bug with respect to iterators whose values do not represent their “locations”. In particular, the LinkedList iterator can trigger this bug since its values do not (necessarily) represent their “locations”: when a list has identical values at positions N and 2N, the function will return true whether or not the list/iterable actually has a looping tail.* In other words, the iterable version only works for lists that have unique values for each "cell."

### a drunken walk

*Consider a finite checkerboard of unknown size. On each square we randomly place an arrow pointing to one of its four sides. For convenience, we shall uniformly label the directions: N, S, E, and W. A chequer is placed randomly on the checkerboard. Each move consists of moving the red chequer one square in the direction of the arrow in the square it occupies. If the arrow should cause the chequer to move off the edge of the board, the game halts.*

*As a player moves the chequer, he calls out the direction of movement, e.g. "N, E, N, S, N, E..." Write an algorithm that will determine whether the game halts strictly from the called out directions, in constant space.*

### hints

You'll need a "Board" and/or "Game" class that acts as iterable, along with some notion of directions. Here's one possible implementation:

{% highlight javascript %}
var DIRECTIONS = [
                   {
                     delta: [1, 0],
                     toString: function () { return 'N'; }
                   },
                   {
                     delta: [0, 1],
                     toString: function () { return 'E'; }
                   },
                   {
                     delta: [-1, 0],
                     toString: function () { return 'S'; }
                   },
                   {
                     delta: [0, -1],
                     toString: function () { return 'W'; }
                   }
                 ];

var Game = (function () {
  function Game () {
    var i,
        j;
    
    this.size = Math.floor(Math.random() * 8) + 8;
    this.board = [];
    for (i = 0; i < this.size; ++i) {
      this.board[i] = [];
      for (j = 0; j < this.size; ++j) {
        this.board[i][j] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      }
    }
    this.initialPosition = [
      2 + Math.floor(Math.random() * (this.size - 4)), 
      2 + Math.floor(Math.random() * (this.size - 4))
    ];
    return this;
  };
  
  Game.prototype.contains = function (position) {
    return position[0] >= 0 && position[0] < this.size && position[1] >= 0 && position[1] < this.size;
  };
  
  Game.prototype.iterator = function () {
    var position = [this.initialPosition[0], this.initialPosition[1]];
    return function () {
      var direction;
      if (this.contains(position)) {
        direction = this.board[position[0]][position[1]];
        position[0] += direction.delta[0];
        position[1] += direction.delta[1];
        return direction.toString();
      }
      else {
        return void 0;
      }
    }.bind(this);
  };
  
  return Game;
  
})();
{% endhighlight %}

In [Tortoises, Teleporting Turtles, and Iterators](http://raganwald.com/2013/02/15/turtles-and-iterators.js.html), we saw the `fold` function that converts a finite iterator into a value:

{% highlight javascript %}
function fold (iter, binaryFn, seed) {
  var acc, element;
  acc = seed;
  element = iter();
  while (element != null) {
    acc = binaryFn.call(element, acc, element);
    element = iter();
  }
  return acc;
};
{% endhighlight %}

There's a similar function that works with finite or infinite iterators, `accumulate`:

{% highlight javascript %}
function accumulate (iter, binaryFn, seed) {
  var acc = seed;
  return function () {
    element = iter();
    if (element == null) {
      return element;
    }
    else {
      return (acc = binaryFn.call(element, acc, element));
    }
  }
};
{% endhighlight %}

`accumulate` can be very handy for solving this problem. Like `fold`, accumulate takes an iterator, a binary function, and a seed. But instead of returning the final, accumulated value, it returns an iterator over the accumulated values. Compare and contrast:

{% highlight javascript %}
function sum (x, y) { return x + y; }

fold(ArrayIterator([1, 2, 3, 4, 5]), sum, 0);
  //=> 15

var i = accumulate(ArrayIterator([1, 2, 3, 4, 5]), sum, 0);
i();
  //=> 1
i();
  //=> 3
i();
  //=> 6
i();
  //=> 10
i();
  //=> 15
i();
  //=> undefined
{% endhighlight %}
  
`accumulate` can be thought of as iterating over the steps of a fold. Accumulate can also be thought of as a stateful map from one iterator to another.

### a solution

One possible solution is posted separately to prevent spoilers. Try at least thinking it through before peeking!

[Solving the "Drunken Walk" problem with iterators](http://raganwald.com/2013/02/18/drunken-walk-solution.html).