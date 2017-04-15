---
title: "Disambiguating Left-Association, Right-Association, and the Associative Property"
layout: default
tags: [allonge]
---

[![Star](/assets/images/1024px-Thales_A_calculating_machine_2009-08-23.jpg)](https://commons.wikimedia.org/wiki/File:Thales_A_calculating_machine_2009-08-23.jpg)

In [A quick look at reduce, foldl, foldr, and associative order][foldl], we discussed `foldl` and `foldr`, and we said that `foldl` _left-associated_ its function, while `foldr` _right-associated_ its function.

These expressions sound familiar. In high school (perhaps sooner!), we learned that some mathematical operators, such as plus and multiply, are _associative_, or have the _associative property_. Is this the same thing?

The answer is short, and would fit in a footnote. They are not the same thing. But let's take our time, we can write some interesting code to demonstrate that they are not the same thing.

### the associative property

A binary operation is "associative" if, when there is an expression containing two or more occurrences in a row of the same associative operator, the order in which the operations are performed does not matter as long as the sequence of the operands is not changed.

Let's take "plus" as an example. If we want to add the numbers from one to four in JavaScript, we get the same answer no matter which one of these we write:

- `(((1 + 2) + 3) + 4)`
- `((1 + (2 + 3)) + 4)`
- `((1 + 2) + (3 + 4))`
- `(1 + ((2 + 3) + 4))`
- `(1 + (2 + (3 + 4)))`

Because we always get the same answer, we say that plus has the associative property. Other binary operators that have the associative property include multiplication and catenation (of strings arrays, or lists in general).

Not all binary operators have the associative property. Subtraction does not have the associative property: `((4 - 3) - 1)` is zero, but `(4 - (3 - 1))` is two. And as we saw in the [previous post][foldl], binary composition does not have the associative property.

### checking the associative property

The right thing to do when considering whether an operator has the associative property is to prove it. But we are software developers holding a test-driven hammer, and therefore every problem looks like a test-suite nail. So let's write a little checker for the associative property.

First things first, let's write a representation for the order of operations. We start with an example, let's say `((1 + (2 + 3)) + 4)`.

We'll rewrite it using brackets: `[[1 + [2 + 3]] + 4]`.

Then we'll remove the operators: `[[1 [2 3]] 4]`.

And add commas: `[[1, [2, 3]], 4]`.

We now have nested arrays. What do they represent? A binary tree:

```
 1   2   3   4
  \   \ /   /
   \   +   /
    \ /   /
     +   /
      \ /
       +
```

The leaves of the tree are the operands, and the nodes are the operation. Given this tree, we can write a function that applies a binary operation to it.

Naturally, we will represent the binary operation as a function:

```javascript
const applyOperator = (operator, [left, right]) => {
  if (left instanceof Array) {
    left = applyOperator(operator, left);
  }
  if (right instanceof Array) {
    right = applyOperator(operator, right);
  }
  return operator(left, right);
}

const plus = (a, b) => a + b;
```

And we can use our function to verify that `plus` has the associative property:

```javascript
applyOperator(plus, [[[1, 2], 3], 4])
  //=> 10

applyOperator(plus, [[1, [2, 3]], 4])
  //=> 10

applyOperator(plus, [[1, 2], [3, 4]])
  //=> 10

applyOperator(plus, [1, [[2, 3], 4]])
  //=> 10

applyOperator(plus, [1, [2, [3, 4]]])
  //=> 10
```

Unfortunately, our function won't work for operations that take arrays as operands, so here's a hacked up version using a `Tuple` subclass of `Array`, with an example of its use:[^obj]

[^obj]: We could, of course, simply use an object with `left` and `right` properties. We'll leave that as "an exercise for the reader."

```javascript
function Tuple (...elements) {
  if (this === undefined) {
    return Array.of.apply(Tuple, elements);
  }
}
Tuple.prototype = Object.create(Array.prototype);

const applyOperator = (operator, [left, right]) => {
  if (left instanceof Tuple) {
    left = applyOperator(operator, left);
  }
  if (right instanceof Tuple) {
    right = applyOperator(operator, right);
  }
  return operator(left, right);
}

const catenate = (a, b) => a.concat(b);

applyOperator(catenate, Tuple(Tuple(Tuple([1], [2]), [3]), [4]))
  //=> [1, 2, 3, 4]

applyOperator(catenate, Tuple(Tuple([1], Tuple([2], [3])), [4]))
  //=> [1, 2, 3, 4]

applyOperator(catenate, Tuple(Tuple([1], [2]), Tuple([3], [4])))
  //=> [1, 2, 3, 4]

applyOperator(catenate, Tuple([1], Tuple(Tuple([2], [3]), [4])))
  //=> [1, 2, 3, 4]

applyOperator(catenate, Tuple([1], Tuple([2], Tuple([3], [4]))))
  //=> [1, 2, 3, 4]
```

### associating an expression consisting of an operator and two or more operands

Now that we have a representation for the way we associate an expression, a tree of tuples, we can write functions that generate associations. Here's one that makes a left-associated tree for any number of operands:

```javascript
const leftAssociate = operands => {
  const [first, second, ...rest] = operands;
  const left = Tuple(first, second);

  if (rest.length === 0) {
    return left;
  } else {
    return leftAssociate([left, ...rest]);
  }
}

leftAssociate([1, 2, 3, 4)]
  //=> Tuple(Tuple(Tuple(1, 2), 3), 4)
```

And another that makes a right-associated tree for any number of operands:

```javascript
const rightAssociate = operands => {
  const rest = operands.slice(0, operands.length - 2);
  const secondLast = operands[operands.length - 2];
  const last = operands[operands.length - 1];
  const right = Tuple(secondLast, last);

  if (rest.length === 0) {
    return right;
  } else {
    return rightAssociate([...rest, right]);
  }
}

rightAssociate([1, 2, 3, 4])
  //=> Tuple(1, Tuple(2, Tuple(3, 4)))
```

Given these two functions, we can write a pair of application methods that apply an operator to a set of operands, either left-associated or right-associated:

```javascript
const leftApply = (operator, operands) =>
  applyOperator(operator, leftAssociate(operands));

const rightApply = (operator, operands) =>
  applyOperator(operator, rightAssociate(operands));
```

Of course, this makes no difference if, like `+`, the operator has the associative property:

```javascript
leftApply(plus, [4, 3, 2, 1])
  //=> 10

rightApply(plus, [4, 3, 2, 1])
  //=> 10
```

And every difference if the operator doesn't:

```javascript
const minus = (x, y) => x - y;

leftApply(minus, [4, 3, 2, 1])
  //=> -2

rightApply(minus, [4, 3, 2, 1])
  //=> 2
```

### back to foldl and foldr

So now we can revisit `foldl` and `foldr`, and underscore what we mean when we say that `foldl` left-associates the folding function we supply. We mean that if we write:

```javascript
foldl(minus, [4, 3, 2, 1])
foldr(minus, [4, 3, 2, 1])
```

We get the same results as if we write:

```javascript
leftApply(minus, [4, 3, 2, 1])
rightApply(minus, [4, 3, 2, 1])
```

The difference being, of course, that our `foldl` and `foldr` functions are written to incrementally consume their operands from any iterable, while `leftApply` and `rightApply` explicitly construct a binary tree of associations before evaluating anything.

And if someone asks us what this has to do with the associative property, we reply that an operator with the associative property is one for which for any association of operator and multiple operands, there is no difference to the computed result.

[foldl]: http://raganwald.com/2017/04/10/foldl-foldr.html

### this seems like a lot of bother

Yes, it **is** a lot of bother just to explain that left-associating and right-associating are related to, but not the same as, the associative property of operators.

But `foldl` and `foldr` implicitly associated their folding functions, and it is very interesting to write code that takes something implicit and makes it explicit, in this case, the association. It is also interesting to factor our code such that we separate the association and application from the operator and operands.

So really, all of this is just an excuse to get some practice thinking about how code can be rewritten to make the implicit, explicit. And that is one of the cornerstones of software design: Choosing what we make explicit, and what implicit goes along with choosing what we name, and what we do not name. Or what we becomes a first-class entity, and what is subordinate to other entities.

It's an excercise in deciding what we want our code to communicate, what we want our code to make flexible, and what we want our code to manipulate.

---

### notes

I'm working on a new book. Have a look at [Raganwald's Tooling for Turing Machines](https://leanpub.com/tooling) and let me know if you're interested. Thanks!


