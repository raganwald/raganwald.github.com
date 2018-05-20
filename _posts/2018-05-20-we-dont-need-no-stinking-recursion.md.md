---
title: "Recursion? We don't need no stinking recursion!"
published: false
tags: [noindex, allonge]
---

> Every recursive algorithm can be implemented with iteration

True.

Whether we _should_ implement a recursive algorithm with iteration is, as they say, "an open problem," and the factors going into that decision are so varied that there is no absolute "Always favour recursion" or "Never use recursion" answer.

However, what we can say with certainty is that knowing _how_ to implement a recursive algorithm with iteration is deeply interesting! And as a bonus, this knoweledge is useful when we do encounter one of the situations where we want to convert an algorithm that is normally recursive into an iterative algorithm.

So... We're off!

### recursion, see recursion

The shallow definition of a recursive algorithm is a function that directly or indirectly calls itself. Digging a little deeper, most recursive algorithms address the situation where the solution to a problem can be obtained by dividing it into smaller pieces that are similar to the initial problem, solving them, and then combining the solution.

This is known as "divide and conquer," and here is an example: Counting the number of leaves in a tree. Our tree is represented as an object of type `Tree` that contains one ore more children. Each child is either a single leaf, represented as an object of class `Leaf`, or a subtree, represented as another object of type `Tree`.

So a tree that conatins a single leaf is just `new Tree(new Leaf())`, while a tree contains three leaves might be `new Tree(new Leaf(), new Leaf(), new Leaf())`:

```
class Leaf {}

class Tree {
  constructor(...children) {
    this.children = children;
  }
}

function countLeaves(tree) {
  if (tree instanceof Tree) {
    return tree.children.reduce(
      (runningTotal, child) => runningTotal + countLeaves(child),
      0
    )
  } else if (tree instanceof Leaf) {
    return 1;
  }
}

const sapling = new Tree(
  new Leaf()
);

countLeaves(sapling)
  //=> 1

const tree = new Tree(
  new Tree(
    new Leaf(), new Leaf()
  ),
  new Tree(
    new Tree(
      new Leaf()
    ),
    new Tree(
      new Leaf(), new Leaf()
    ),
    new Leaf()
  )
);

countLeaves(tree)
  //=> 6
```

This is a classic divide-and-conquer: Divide a ree up into its children, and count the leaves in child, then sum them to get the count of the tree.

### iterative algorithms

For the vast majority of cases, recursive algorithms are just fine. This is especially true when the form of the algorithm matches teh form of the data being manipulated. A recursive algorithm to "fold" the elements of a tree makes a certain amount of sense because the definition of a tree is itself recursive: A tree is either a left or another tree. And the function we just saw either returns 1 or the count of leaves in a tree.

But sometimes people want iterative algorithms. It could be that recursion eats up to much stack space, and they would rather consume heap space. It could be that they just don't like recursive algorithms. Or... Who knows? Our purpose here is not to fall down a hole of discussing performance and optimization, we'd rather fall down a hole of exploring what kinds of interesting techniques we might use to transform recursion into iteration.

Let's start with the simplest, and one that works remarkably well:

### 1: hide the recursion with iterators

Our algorithm above interleaves the mechanics of visiting every node in a tree with the particulars of what we want to do with leaf nodes. Let's say that we want to be able to express that `countLeaves` is all about counting the number of nodes with a non-null `leaf` property, but we don't want to clutter that up with recursion.

The easiest way to do that is to keep using recursion, but separate the concern of how to visit all the nodes in a tree from the concern of what we want to do with them. In JavaScript, we can make our trees into [Iterables](https://leanpub.com/javascriptallongesix/read#collections):

```
class Tree {
  constructor(...children) {
    this.children = children;
  }

  *[Symbol.iterator]() {
    for (const child of this.children) {
      yield child;
      if (child instanceof Tree) {
        yield* child;
      }
    }
  }
}

function countLeaves(tree) {
  let runningTotal = 0;

  for (const child of tree) {
    if (child instanceof Leaf) {
      ++runningTotal;
    }
  }

  return runningTotal
}
```

Notice now that `countLeaves` is iterative. The recursion has been pushed into `Tree`'s iterator. It's still recursive in the whole, but the code that knows how to count leaves is certainly iterative.

Furthermore, this lets us mix-and-match different collection types. Here's a basket of yard waste:

```
class Twig {}

const yardWaste = new Set([
  new Leaf(),
  new Leaf(),
  new Leaf(),
  new Twig(),
  new Twig()
])



countLeaves(yardWaste)
  //=> 3
```

And of course, we can apply functions over iterables, for example:

```
function count (iterable) {
  let runningTotal = 0;

  for (const _ of iterable) {
    ++runningTotal;
  }

  return runningTotal;
}

function filter * (predicateFunction, iterable) {
  for (const element of iterable) {
    if (predicateFunction(element)) {
      yield element;
    }
  }
}

function countLeaves (iterable) {
  return count(
    filter(
      (element) => element instanceof Leaf,
      iterable
    )
  );
}
```

### 2. abstract the recursion with higher-order functions

Divide-and-conquer comes up a lot, but it's not always directly transferrable to iteration. For example, we might want to [recursively rotate a square][why]. If we want to separate the mechanics of recursion from the "business logic" of rotating a square, we could move some of the logic into a higher-order function, `multirec`:

[why]: http://raganwald.com/2016/12/27/recursive-data-structures.html "Why Recursive Data Structures?"

```
function mapWith (fn) {
  return function * (iterable) {
    for (const element of iterable) {
      yield fn(element);
    }
  };
}

function multirec({ indivisible, value, divide, combine }) {
  return function myself (input) {
    if (indivisible(input)) {
      return value(input);
    } else {
      const parts = divide(input);
      const solutions = mapWith(myself)(parts);

      return combine(solutions);
    }
  }
}
```

To use `multirec`, we need four pieces:

1. An `indivisible` predicate function. It should report whether the problem we're solving is too small to be divided. It's simplicity itself for our counting leaves problem: `node => node instanceof Leaf`.
2. A `value` function that determines what to do with a value that is indivisible. For counting, we return `1`: `leaf => 1`
3. A `divide` function that breaks a divisible problem into smaller pieces. `tree => tree.children`
4. A `combine` function that puts the result of dividing a problem up, back together. `counts => counts.reduce((acc, c) => acc + c, 0)`

Here we go:

```javascript
const countLeaves = multirec({
  indivisible: node => node instanceof Leaf,
  value: leaf => 1,
  divide: tree => tree.children,
  combine: counts => [...counts].reduce((acc, c) => acc + c, 0)
})
```

Now, this does separate the implementation of a divide-and-conquer recursive algorithm from what we want to accomplish, but it's still obvious that we're doing a divide and conquer algorithm. Balanced against that, `multirec` can do a lot more than we can accomplish with a recursive iterator, like rotating squares, or implementing [HashLife].

[HashLife]: http://raganwald.com/hashlife/

`multirec` isn't the only higher-order recursive function. `linrec` and `binrec` are pretty handy as shown [here](http://raganwald.com/2016/12/15/what-higher-order-functions-can-teach-us-about-libraries-and-frameworks.html). But let's move on and try something else.

Not all recursive algorithms map neatly to recursive data structures. For example, what about the [Towers of Hanoi]?

[Towers of Hanoi]: https://en.wikipedia.org/wiki/Tower_of_Hanoi

[![Towers of Hanoi](/assets/images/recursion.hanoi.jpg)][Towers of Hanoi]
