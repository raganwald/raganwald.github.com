---
title: Solving the "Drunken Walk" problem with iterators
layout: default
tags : [homoiconic, javascript]
---

This is an example solution for [The "Drunken Walk" Programming Problem](http://raganwald.com/2013/02/17/a-drunken-walk.html). It demonstrates how refactoring the "Tortoise and Hare" algorithm to use iterables instead of directly manipulating linked list nodes allows it to be used to find loops in a path as well as loops in a linked list.

### problem statement

*Consider a finite checkerboard of unknown size. On each square we randomly place an arrow pointing to one of its four sides. For convenience, we shall uniformly label the directions: N, S, E, and W. A chequer is placed randomly on the checkerboard. Each move consists of moving the red chequer one square in the direction of the arrow in the square it occupies. If the arrow should cause the chequer to move off the edge of the board, the game halts.*

*As a player moves the chequer, he calls out the direction of movement, e.g. "N, E, N, S, N, E..." Write an algorithm that will determine whether the game halts strictly from the called out directions, in constant space.*

### suggested starting point

The suggested starting point is a "Game" object that randomly initializes the directions associated with each square and a randomly selected starting square. Games are iterables: Calling `.iterate()` on a game returns an iterator that represents the chequer's path from square to square, returning the direction. SO the results might be `N`, `E`, `N`, `S`, and so forth:

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

Finally, we are given `accumulate`, a version of `fold` that accumulates state and produces another iterator:

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

### solution with commentary

Our insight is that although we don't know the size of the board, there are two possibilities:

1. The chequer visits a finite number of unique squares, and then falls off the edge.
2. The chequer follows a path that revisits a square, which leads to it "looping" forever.

This is isomorphic to the problem of discovering whether a linked list loops, all we have to do is transform the game's iterator into an iterator that has the property that it uniquely identifies each square. As given, the iterator does not have this property: If it returns `N` twice, for example, this could be the same cell or two different cells that both have a spinner set to "N."

We aren't given the position of the chequer at any time, but what we can do is convert the directions we are given into a position relative to the starting square. One wrinkle: JavaScript does not do structural equivalence in comparisons, so we can't use an array or object to represent our relative position.[^canonical]

[^canonical]: We also can't canonicalize objects, because we are constrained to write a solution that requires constant space.

So instead, we represent positions as strings, and that adds some fiddling to translate back and forth from strings to numbers. We use `accumulate` to transform an iterator of directions into an iterator of offsets represented as strings. If our tortoise and hare ever end up with the same string representation, the path loops and the game does not terminate.

`RelativeIterator` is a function that converts a Game's iterator into a relative iterator.

{% highlight javascript %}
var RelativeIterator = (function () {
  var LOOKUP = (function () {
    var LOOKUP = {},
        i;
    for (i = 0; i < DIRECTIONS.length; ++i) {
      LOOKUP[DIRECTIONS[i].toString()] = DIRECTIONS[i];
    }
    return LOOKUP;
  })();
  function RelativeIterator (directionIterator) {
    return accumulate(directionIterator, function (relativePositionStr, directionStr) {
      var delta = LOOKUP[directionStr].delta,
          matchData = relativePositionStr.match(/(-?\d+) (-?\d+)/),
          relative0 = parseInt(matchData[1], 10),
          relative1 = parseInt(matchData[2], 10);
      return "" + (relative0 + delta[0]) + " " + (relative1 + delta[1]);
    }, "0 0")
  };
  
  return RelativeIterator;
  
})();
{% endhighlight %}

Finally, we need an iterable that returns RelativeIterators for `tortoiseAndHareLoopDetector`. `RelativeIterable` wraps a Game for exactly this purpose, and our `terminates` function uses this to answer whether a particular game ever terminates.

{% highlight javascript %}
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

function RelativeIterable (game) {
  return {
    iterator: function () {
      return RelativeIterator(game.iterator());
    }
  };
};

function terminates (game) {
  return !tortoiseAndHareLoopDetector(RelativeIterable(game));
}
{% endhighlight %}

### conclusion

Untangling the mechanism of following a linked list from the algorithm of searching for a loop allows us to repurpose the Tortoise and Hare algorithm to solve a question about a path looping.

Better factoring equals more reuse.

Win.

---