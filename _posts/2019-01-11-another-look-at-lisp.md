---
layout: default
title: "Another Look at Lisp"
tags: [allonge, recursion, mermaid]
---

---

[![Symbolics "old style" keyboard](/assets/images/ayoayo/symbolics.jpg)](https://www.flickr.com/photos/mrbill/5336327890)

*[Symbolics, Inc.][Symbolics] was a computer manufacturer headquartered in Cambridge, Massachusetts, and later in Concord, Massachusetts, with manufacturing facilities in Chatsworth, California. Symbolics designed and manufactured a line of Lisp machines, single-user computers optimized to run the Lisp programming language.*

[Symbolics]: https://en.wikipedia.org/wiki/Symbolics

---

### operating on lists

As we can see, it was always fast to get the first element of a list and the rest of a list. Now, you could get every element of a list by traversing the list pointer by pointer. So if you wanted to do something with a list, like sum the elements of a list, you'd write a linearly recursive function like this:

```javascript
const cons = (a, d) => [a, d],
      car  = ([a, d]) => a,
      cdr  = ([a, d]) => d;

function sum (list, acc = 0) {
  if (list == null) {
    return acc;
  } else {
    const first = car(list);
    const rest = cdr(list);

    return sum(rest, acc + first);
  }
}

const oneToFive = cons(1, cons(2, cons(3, cons(4, cons(5, null)))));

sum(oneToFive)
  //=> 15
```

If we ignore the fact that the original cons cells were many many orders of magnitude faster than using arrays with two elements, we have the general idea:

> It was ridiculously fast to separate a list into the `first` and `rest`, and as a result, many linear algorithms written in Lisp were organized around repeatedly (by recursion or looping) getting the first and rest of a list.

---

![Garbage Day](/assets/images/garbage.jpg)

---

## Garbage, Garbage Everywhere

But what about today's JavaScript? Today, we can write a list with an array. And we can get the `first` and `rest` with destructuring:

```javascript
function sum (list, acc = 0) {
  if (list.length === 0) {
    return acc;
  } else {
    const [first, ...rest] = list;

    return sum(rest, acc + first);
  }
}

const oneToFive = [1, 2, 3, 4, 5];

sum(oneToFive)
  //=> 15
```

This is easier on the eyes, and just as mathematically elegant. But today, when we write something like `[first, ...rest] = list`, it's very fast to get `first`. But for `rest`, the system calls `.slice(1)`. That makes a new array that is a copy of the old array, omitting element `0`. That is much slower, and since these copies are temporary, hammers away at the garbage collector.

We're only working with five elements at a time, so we can afford to chuckle at the performance implications. But if we start operating on long lists, all that copying is going to bury us under a mound of garbage. Of course, we could switch to linked lists in JavaScript. But the cure would be worse than the disease.

Nobody wants to read code that lokks like `cons(1, cons(2, cons(3, cons(4, cons(5, null)))))`. And sometimes, we want to access arbitrary elements of an array. When we do, we have to traverse the list element by element to get it:

```javascript
function at (list, index) {
  if (list == null) {
    return undefined;
  } else if (index === 0) {
    return car(list);
  } else {
    return at(cdr(list), index - 1);
  }
}

const oneToFive = [1, 2, 3, 4, 5];

at(oneToFive, 4)
  //=> 5
```

Accessing arbitray elements of a linked list is the S"hlemiel The Painter" of the Computer Science universe:

> Shlemiel gets a job as a street painter, painting the dotted lines down the middle of the road. On the first day he takes a can of paint out to the road and finishes 300 yards of the road. "That's pretty good!" says his boss, "you're a fast worker!" and pays him a kopeck.
>
> The next day Shlemiel only gets 150 yards done. "Well, that's not nearly as good as yesterday, but you're still a fast worker. 150 yards is respectable," and pays him a kopeck.
>
> The next day Shlemiel paints 30 yards of the road. "Only 30!" shouts his boss. "That's unacceptable! On the first day you did ten times that much work! What's going on?" "I can't help it," says Shlemiel. "Every day I get farther and farther away from the paint can!"

_If only there was a way to have the elegance of Lisp, and the performance of Arrays when accessing arbitrary elements._


