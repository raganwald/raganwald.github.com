---
title: "Recursion? We don't need no stinking recursion!"
tags: [noindex, allonge]
---

> Every recursive algorithm can be implemented with iteration

True.

Whether we _should_ implement a recursive algorithm with iteration is, as they say, "an open problem," and the factors going into that decision are so varied that there is no absolute "Always favour recursion" or "Never use recursion" answer.

However, what we can say with certainty is that knowing _how_ to implement a recursive algorithm with iteration is deeply interesting! And as a bonus, this knoweledge is useful when we do encounter one of the situations where we want to convert an algorithm that is normally recursive into an iterative algorithm.

So... We're off!

---

[![GEB recursive](/assets/images/banner/geb-recursive.jpg)](https://www.flickr.com/photos/gadl/279433682)

*GEB Recursive, © 2006 Alexandre Duret-Lutz, [some rights reserved][cc-by-sa-2.0]*

### recursion, see recursion

The shallow definition of a recursive algorithm is a function that directly or indirectly calls itself. Digging a little deeper, most recursive algorithms address the situation where the solution to a problem can be obtained by dividing it into smaller pieces that are similar to the initial problem, solving them, and then combining the solution.

This is known as "divide and conquer," and here is an example: Counting the number of leaves in a tree. Our tree is represented as an object of type `Tree` that contains one ore more children. Each child is either a single leaf, represented as an object of class `Leaf`, or a subtree, represented as another object of type `Tree`.

So a tree that conatins a single leaf is just `new Tree(new Leaf())`, while a tree contains three leaves might be `new Tree(new Leaf(), new Leaf(), new Leaf())`:

```javascript
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

This is a classic divide-and-conquer: Divide a tree up into its children, and count the leaves in child, then sum them to get the count of leaves in the tree.

For the vast majority of cases, recursive algorithms are just fine. This is especially true when the form of the algorithm matches teh form of the data being manipulated. A recursive algorithm to "fold" the elements of a tree makes a certain amount of sense because the definition of a tree is itself recursive: A tree is either a left or another tree. And the function we just saw either returns 1 or the count of leaves in a tree.

But sometimes people want iterative algorithms. It could be that recursion eats up to much stack space, and they would rather consume heap space. It could be that they just don't like recursive algorithms. Or... Who knows? Our purpose here is not to fall down a hole of discussing performance and optimization, we'd rather fall down a hole of exploring what kinds of interesting techniques we might use to transform recursion into iteration.

Let's start with the simplest, and one that works remarkably well:

---

[![Ferris Wheel](/assets/images/recursion/ferris-wheel.jpg)](https://www.flickr.com/photos/darwinist/23358909)

### 1: hide the recursion with iterators

Our algorithm above interleaves the mechanics of visiting every node in a tree with the particulars of what we want to do with leaf nodes. Let's say that we want to be able to express that `countLeaves` is all about counting the number of nodes with a non-null `leaf` property, but we don't want to clutter that up with recursion.

The easiest way to do that is to keep using recursion, but separate the concern of how to visit all the nodes in a tree from the concern of what we want to do with them. In JavaScript, we can make our trees into [Iterables](https://leanpub.com/javascriptallongesix/read#collections):

```javascript
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

```javascript
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

```javascript
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

This is great because our functions over iterables apply to a wide class of problems, not just recursive problems. So the takeaway is, one technique for turning recursive algorithms into iterative algorithms is to see whether we can recursively iterate. If so, separate the recursive iteration from the rest of the algorithm by writing an iterator.

---

[![Acid Tower 9](/assets/images/recursion/hof.jpg)](https://www.flickr.com/photos/maxim_mogilevskiy/33934812664)

### 2. abstract the recursion with higher-order recursive functions

Divide-and-conquer comes up a lot, but it's not always directly transferrable to iteration. For example, we might want to [recursively rotate a square][why]. If we want to separate the mechanics of recursion from the "business logic" of rotating a square, we could move some of the logic into a higher-order function, `multirec`:

[why]: http://raganwald.com/2016/12/27/recursive-data-structures.html "Why Recursive Data Structures?"

```javascript
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

`multirec` isn't the only higher-order recursive function. `linrec` and `binrec` are pretty handy as shown [here](http://raganwald.com/2016/12/15/what-higher-order-functions-can-teach-us-about-libraries-and-frameworks.html). But let's move on and try it on something else.

---


[![Towers of Hanoi](/assets/images/recursion/hanoi.jpg)][Towers of Hanoi]

### implementing the towers of hanoi with higher-order recursive functions

Not all recursive algorithms map neatly to recursive data structures. For example, what about the [Towers of Hanoi]?

[Towers of Hanoi]: https://en.wikipedia.org/wiki/Tower_of_Hanoi

let's start with the outline of what our function will look like:

```javascript
function hanoi (params) { // params = {disks, from, to, spare}
  // ...
}
```

We can use `multirec` for this as well. Let's consider our four elements:

1. An `indivisible` predicate function. In our case, `({disks}) => disks == 1`
2. A `value` function that determines what to do with a value that is indivisible: `({from, to}) => [from + " -> " + to]`
3. A `divide` function that breaks a divisible problem into smaller pieces. `({disks, from, to, spare}) => [{disks: disks - 1, from, to: spare, spare: to}, {disks: 1, from, to, spare}, {disks: disks - 1, from: spare, to, spare: from}]`
4. A `combine` function that puts the result of dividing a problem up, back together. `[...moves].reduce((acc, move) => acc.concat(move), [])`

Like so:

```javascript
const hanoi = multirec({
  indivisible: ({disks}) => disks == 1,
  value: ({from, to}) => [from + " -> " + to],
  divide: ({disks, from, to, spare}) => [
    {disks: disks - 1, from, to: spare, spare: to},
    {disks: 1, from, to, spare},
    {disks: disks - 1, from: spare, to, spare: from}
  ],
  combine: moves => [...moves].reduce((acc, move) => acc.concat(move), [])
});

hanoi({disks: 3, from: 1, to: 3, spare: 2})
  //=>
    ["1 -> 3", "1 -> 2", "3 -> 2", "1 -> 3", "2 -> 1", "2 -> 3", "1 -> 3"]
```

This is good stuff, and its important to know how to convert a recursive function into a function that uses a recursive iterator or a higher-order recursive function. We get the benefits of separating the mechanics of recursion from our code. But we may have other motivations for switching to iterative code, like preserving stack space. These methods hide the recursion, but it's still there.

How else can we get rid of recursion?

---

[![Stacked](/assets/images/recursion/stacked.jpg)](https://www.flickr.com/photos/loozrboy/4971412791)

### 3. greenspunning our own stack

One of the motivations for replacing recursion with iteration is to avoid making too many nested function calls. Each such call places a "frame" on the stack, and many programming languages allocated a fixed amount of memory for the stack. Therefore, if you exceed the amount of stack space, you get a "stack overflow."

Translating a recursive algorithm into an algorithm that uses a recursive iterator or a higher-order recursive function will not solve this problem. The simplest way to solve this problem is to use our own stack. Data structures we create and maintain are stored on the heap, and there is considerably more memory available on the heap than on the stack.

We could look at directly implementing something like Towers of Hanoi with a stack, but let's maintain our separation of concerns. Instead of impementing Towers of Hanoi directly, we'll implement `binrec` with a stack, and then trust that our existing Towers of Hanoi implementation will work without any changes.

That particular choice gives us the power of being able to _express_ Towers of Hanoi as a divide-and-conquer algorithm, while _implementing_ it using a stack on the heap. That's terrific if our only objection to `multirec` is the possibility of a stack overflow.[^because]

[^because]: Many, *many* years ago, I wanted to implement a Towers of Hanoi solver in BASIC. The implementation I was using allowed calling subroutines, however subroutines were non-reëntrant. So it was impossible for a subroutine to invoke itself. I wound up implementing a stack of my own in an array, and that, as they say, was that. (You read this note correctly: Forty years ago, non-reëntrant subroutines were a thing in widely available implementations.)

Our new `multirec` has its own stack, and is clearly iterative. It's one big loop:

```javascript
function multirec({ indivisible, value, divide, combine }) {
  return function (input) {
    const stack = [];

    if (indivisible(input)) {
      // the degenerate case
      return value(input);
    } else {
      // the iterative case
      const parts = divide(input);
      const solutions = [];
      stack.push({parts, solutions});
    }

    while (true) {
      const {parts, solutions} = stack[stack.length - 1];

      if (parts.length > 0) {
        const subproblem = parts.pop()

        if (indivisible(subproblem)) {
          solutions.unshift(value(subproblem));
        } else {
          // going deeper
          stack.push({
            parts: divide(subproblem),
            solutions: []
          })
        }
      } else {
        stack.pop(); // done with this frame

        const solution = combine(solutions);

        if (stack.length === 0) {
          return solution;
        } else {
          stack[stack.length - 1].solutions.unshift(solution);
        }
      }
    }
  }
}
```

With this version of `multirec`, our Towers of Hanoi _and_ `countLeaves` algorithms both have switched from being recursive to being iterative with their own stack. That's the power of separating the specification of the divide-and-conquer algorithm from its implementation.

---

## notes
