---
layout: default
tags: [allonge, noindex]
---

*Sit facilis perferendis ea esse qui. Voluptas delectus voluptatem sunt magnam illo eveniet repellendus. Ducimus consequatur laboriosam id omnis accusamus. Ab ad mollitia ipsum omnis sed blanditiis.*

[![ibm 360](/assets/images/banner/ibm-360.jpg)](https://www.flickr.com/photos/monchan/30781538732)

*IBM 360, © 2016 lk T, [some rights reserved][cc-by-2.0]*

---

### introduction: expressiveness and complexity

Consider [*Structured Programming*][sp], a technique arising in the late 1950s and exemplified in the ALGOL programming language. In structured programming, we write procedures that call other procedures by name.  Structured programming allows us to decompose procedures, and to extract and share common procedures, DRY-ing up our code and allowing us to name concepts.

[sp]: https://en.wikipedia.org/wiki/Structured_programming

When a function invokes other functions, and when one function can be invoked by more than one other function, we have a very good thing. We're going to focus on this idea today. When we have a *many-to-many* relationship between entities, we have a more expressive power than when we have a *one-to-many* relationship.

We have the ability to give each procedure a single responsibility, and name that responsibility. We also have the ability to ensure that one and only one procedure has that responsibility. A many-to-many relationship between procedures is what enables us to create a one-to-one relationship between procedures and responsibilities.

Programmers often speak of languages as being *expressive*. Although there is no single universal definition for this word, most programmers agree that an important aspect of "expressiveness" is that the language makes it easy to write programs that are not *unnecessarily* verbose.

Being able to create programs where you can write procedures that have a single responsibility, where each responsibility is implemented by a single procedure, is one important way to avoid unnecessary verbosity: If procedures have many responsibilities, they become large and unwieldy. If the same responsibility needs to be implemented more than once, there is de facto redundancy.

Thus, facilitating the many-to-many relationship between procedures makes it possible to write programs that are more expressive than those that do not have a many-to-many relationship between procedures.

However, "With great power comes great responsibility."[^quote] The downside of a many-to-many relationship between procedures is that the 'space of things a program might do' grows very rapidly as the size increases. "Expressiveness" is often in tension with "Perceived Complexity."

[^quote]: "Ils doivent envisager qu’une grande responsabilité est la suite inséparable d’un grand pouvoir."—http://quoteinvestigator.com/2015/07/23/great-power/

One way to think about this by analogy is to imagine we are drawing a graph. Each procedure is a vertex, and the calling relationship between them is an edge. Assuming that there is no "dead code," every structured program forms a [connected graph].

[![connected graph](/assets/images/6n-graf.svg.png)][connected graph]

[connected graph]: https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)

Given a known number of nodes, the number of different ways to draw a connected graph between them is the [A001187] integer sequence. Its first eleven terms are: `1, 1, 1, 4, 38, 728, 26704, 1866256, 251548592, 66296291072, 34496488594816`. Meaning that there are more than thirty-four *trillion* ways to organize a program with just ten procedures.

[A001187]: http://oeis.org/A001187

This explosion of flexibility is so great that programmers have to temper it. The benefits of creating one-to-one relationships between procedures and responsibilities can become overwhelmed by the difficulty of understanding programs with unconstrained potential complexity.

Of course, it's not that a program of a certain size *is* complex, it's just that a program of a certain size *could be* complex, and sorting out what it does, and how, is hard work.

So researchers looked for ways that programming languages could provide the benefits of structured programming, while limiting the potential complexity of programs. In the 1970s, there was an explosion of programming languages with mechanisms for limiting the possible many-to-many relationships.

For example, Pascal had an idea of nesting a procedure inside of another procedure. Such an "inner" procedure could be invoked by other "inner" procedures nested within the same "outer" procedure, but could not be invoked by procedures defined outside the outer procedure. Procedures created *namespaces*.

This idea of namespaces has carried forward to this day, in many forms. JavaScript's blocks create namespaces, and it has formal modules as well. It may soon have private object properties.

Namespaces constrain large graphs into many smaller graphs, each of which has a constrained set of ways they can be connected to other graphs. It's still a large graph, but the number of possible ways to draw it is smaller, and by analogy, it is easier to sort out what it does, and how.

What we have described is a heuristic for designing good software systems: **Provide the flexibility to use many-to-many relationships between entities, while simultaneously providing ways for programmers to intentionally limit the ways that entities can be connected**.

Now let's look at something a little more contemporary, higher-order functions.[^well-actually]

[^well-actually]: Well, actually, Higher-Order functions predate Structured Programming. They go back to the Lambda Calculus, and first appeared in Lisp in the early 1950s. So when we say they are a more contemporary idea, we mean that their mainstream acceptance is more contemporary.

---

### higher-order functions

Functions that accept functions as parameters, and/or return functions as values, are called *Higher-Order Functions*, or "HOFs." Languages that support HOFs also support the idea of *functions as first-class values*, and nearly always support the idea of *dynamically creating functions*.

HOFs give programmers even more ways to decompose and compose programs. Let's look at an oft-quoted example, `map`:

```javascript
function map (fn, iterable) {
  const mapped = [];

  for (const element of iterable) {
    mapped.push(fn(element));
  }
  return mapped;
}

map((x) => x * x, [1, 2, 3])
  //=> [1, 4, 9]
```

`map` takes a function as a parameter. If we curry it by hand, we get `mapWith`:

```javascript
function mapWith (fn) {
  return function (iterable) {
    const mapped = [];

    for (const element of iterable) {
      mapped.push(fn(element));
    }
    return mapped;
  };
}

mapWith((x) => x * x)([1, 2, 3])
  //=> [1, 4, 9]
```

`mapWith` takes a function as a parameter and returns a function. There are many such functions, but `mapWith` is a particularly interesting example of functions that take functions as arguments and return functions. Let's take another look at `mapWith`, with some spacing and parenthesis inserted:

```javascript
function mapWith (fn) { return(

  function (iterable) {
    const mapped = [];

    for (const element of iterable) {
      mapped.push(fn(element));
    }
    return mapped;
  }

);}
```

We can see that `mapWith` is a kind of *Template Function*: It returns a function, with its parameters (one in this case) inserted into the template.[^a-kind-of] Template strings provide the same functionality for string expressions:

```javascript
class User {
  fullName() {
    return `${this.firstName()} ${this.lastName}`;
  }
}
```

[^a-kind-of]: It's only a *kind of* template, to be a 100% honest true-blue template, we would need a language with macros. But this is close enough for our purposes today.

Templates are *de rigeur* in front-end development. Here's an example from [Ember], using the handlebars templating language:

[Ember]: http://emberjs.com/

```hbs
Hello, <strong>{{firstName}} {{lastName}}</strong>!
```

Programming with templates of any kind makes for particularly readable code, because the form of the program resembles its output. The handlebars code looks a lot like the HTML it produces, and the core of the `mapWith` function looks a lot like the function it produces.

And while writing functions that make other functions may be unfamiliar for programmers new to languages with functions-as-first-class-values, the idea of a "template" is particularly easy to grasp.

[![brown Mandelbrot](/assets/images/banner/brown-mandelbrot.png)](https://www.flickr.com/photos/docnic/2656653586)

*Brown Mandelbrot, © 2008 docnic, [Some rights reserved][cc-by-2.0]*

---

### linear recursion

Rumour has it that there are excellent companies that ask coöp students to write code as part of the interview process. A typical problem will ask the student to demonstrate their facility solving a problem that ought to be familiar to a computer science or computer engineering student.

For example, merging two sorted lists. This is something a student will have at least looked at, and it does have some applicability to modern service architectures. Here's a naïve implementation:

```javascript
function merge ({ list1, list2 }) {
  if (list1.length === 0 || list2.length === 0) {
    return list1.concat(list2);
  } else {
    let atom, remainder;

    if (list1[0] < list2[0]) {
      atom = list1[0];
      remainder = {
        list1: list1.slice(1),
        list2
      };
    } else {
      atom = list2[0],
      remainder = {
        list1,
        list2: list2.slice(1)
      };
    }
    const left = atom;
    const right = merge(remainder);

    return [left, ...right];
  }
}

merge({
  list1: [1, 2, 5, 8],
  list2: [3, 4, 6, 7]
})
  //=> [1, 2, 3, 4, 5, 6, 7, 8]
```

And here's a function that finds the sum of a list of numbers:

```javascript
function sum(list) {
  if (list.length === 0) {
    return 0;
  } else {
    const [atom, ...remainder] = list;
    const left = atom;
    const right = sum(remainder);

    return left + right;
  }
}

sum([42, 3, -1])
  //=> 44
```

We've written them so that both have the same structure, they are *linearly recursive*. Can we extract this structure and rewrite it as a template function?

---

### linrec

Linear recursion has a simple form:

1. Look at the input. Can we break an element off?
2. If not, what value do we return?
3. If we can break a chunk off, divide the input into the element and a remainder
4. Run our linearly recursive function on the remainder, then
5. Combine our chunk with the result of our linearly recursive function on the remainder

Both of our examples above have this form, and we will write a template function to implement linear recursion. To write a template function, it helps to take an example of the function we want to implement, and extract its future parameters as constants.

First, `indivisible` and `seed`:

```javascript
function sum(list) {
  const indivisible = (list) => list.length === 0;
  const seed = () => 0;

  if (indivisible(list)) {
    return seed(list);
  } else {
    const [atom, ...remainder] = list;
    const left = atom;
    const right = sum(remainder);

    return left + right;
  }
}
```

The next one, `value`, seems superfluous, but we'll hang onto it for later:

```javascript
function sum(list) {
  const indivisible = (list) => list.length === 0;
  const seed = () => 0;
  const value = (atom) => atom;

  if (indivisible(list)) {
    return seed(list);
  } else {
    const [atom, ...remainder] = list;
    const left = value(atom);
    const right = sum(remainder);

    return left + right;
  }
}
```

`divide`:

```javascript
function sum(list) {
  const indivisible = (list) => list.length === 0;
  const seed = () => 0;
  const value = (atom) => atom;
  const divide = (list) => {
    const [atom, ...remainder] = list;

    return  { atom, remainder }
  };

  if (indivisible(list)) {
    return seed(list);
  } else {
    const { atom, remainder } = divide(list);
    const left = value(atom);
    const right = sum(remainder);

    return left + right;
  }
}
```

And then `combine`:

```javascript
function sum(list) {
  const indivisible = (list) => list.length === 0;
  const seed = () => 0;
  const value = (atom) => atom;
  const divide = (list) => {
    const [atom, ...remainder] = list;

    return  { atom, remainder }
  };
  const combine = ({ left, right }) => left + right;

  if (indivisible(list)) {
    return seed(list);
  } else {
    const { atom, remainder } = divide(list);
    const left = value(atom);
    const right = sum(remainder);

    return combine({ left, right });
  }
}
```

we're just about ready to make a template function. Our penultimate step is to rename `sum` to `myself` and `list` to `input`:

```javascript
function myself (input) {
  const indivisible = (list) => list.length === 0;
  const seed = () => 0;
  const value = (atom) => atom;
  const divide = (list) => {
    const [atom, ...remainder] = list;

    return  { atom, remainder }
  };
  const combine = ({ left, right }) => left + right;

  if (indivisible(input)) {
    return seed(input);
  } else {
    const { atom, remainder } = divide(input);
    const left = value(atom);
    const right = myself(remainder);

    return combine({ left, right });
  }
}
```

The final step is to turn our constant functions into parameters of a function that returns our `myself` function:

```javascript
function linrec({ indivisible, seed, value = (atom) => atom, divide, combine }) {
  return function myself (input) {
    if (indivisible(input)) {
      return seed(input);
    } else {
      const { atom, remainder } = divide(input);
      const left = value(atom);
      const right = myself(remainder);

      return combine({ left, right });
    }
  }
}

const sum = linrec({
  indivisible: (list) => list.length === 0,
  seed: () => 0,
  divide: (list) => {
    const [atom, ...remainder] = list;

    return  { atom, remainder }
  },
  combine: ({ left, right }) => left + right
});
```

And now we can exploit the similarities between `sum` and `merge`, by using `linrec` to write `merge` as well:

```javascript
const merge = linrec({
  indivisible: ({ list1, list2 }) => list1.length === 0 || list2.length === 0,
  seed: ({ list1, list2 }) => list1.concat(list2),
  divide: ({ list1, list2 }) => {
    if (list1[0] < list2[0]) {
      return {
        atom: list1[0],
        remainder: {
          list1: list1.slice(1),
          list2
        }
      };
    } else {
      return {
        atom: list2[0],
        remainder: {
          list1,
          list2: list2.slice(1)
        }
      };
    }
  },
  combine: ({ left, right }) => [left, ...right]
});
```

But why stop there?

---

### binrec

`binrec` is a template function for implementing *binary recursion*. Remember our coöp student implementing a merge between sorted lists? One of the cool things you can do with a merge function is write a [merge sort], and advanced students are often asked to at least sketch out how it would work.

[merge sort]: https://en.wikipedia.org/wiki/Merge_sort

`binrec` is actually simpler than `linrec` in at least one respect, because instead of having an element and a remainder, `binrec` divides a problem into two parts and applies the same algorithm to both halves:

```javascript
function binrec({ indivisible, seed, divide, combine }) {
  return function myself (input) {
    if (indivisible(input)) {
      return seed(input);
    } else {
      let { left, right } = divide(input);

      left = myself(left);
      right = myself(right);

      return combine({ left, right });
    }
  }
}

const mergeSort = binrec({
  indivisible: (list) => list.length <= 1,
  seed: (list) => list,
  divide: (list) => ({
    left: list.slice(0, list.length / 2),
    right: list.slice(list.length / 2)
  }),
  combine: ({ left: list1, right: list2 }) => merge({ list1, list2 })
});

mergeSort([1, 42, 4, 5])
  //=> [1, 4, 5, 42]
```

From `binrec`, we can derive `multirec`, which divides the problem into an arbitrary number of symmetrical parts:

```javascript
function multirec({ indivisible, seed, divide, combine }) {
  return function myself (input) {
    if (indivisible(input)) {
      return seed(input);
    } else {
      const parts = divide(input);
      const solutions = mapWith(myself)(parts);

      return combine(solutions);
    }
  }
}

const mergeSort = multirec({
  indivisible: (list) => list.length <= 1,
  seed: (list) => list,
  divide: (list) => [
    list.slice(0, list.length / 2),
    list.slice(list.length / 2)
  ],
  combine: ([list1, list2]) => merge({ list1, list2 })
});
```

There are an infinitude of template functions we could explore, but these are enough for now. Let's return to thinking about the relationship between expressiveness and perceived complexity.

---

### the relationship between template functions, expressiveness, and complexity

In structured programming, procedures call each other, and by creating many-to-many relationships between procedures, we increase expressiveness by making sure that one and only one procedure implements any one responsibility. If two procedures implement the same responsibility, we are less DRY, and less expressive.

How do template functions come into this? Well, as we saw, `merge` and `sum` have different responsibilities in the solution domain--merging lists and summing lists. But they share a common implementation structure, linear recursion. Therefore, they both are responsible for implementing a linearly recursive algorithm.

By extracting this algorithm into `linrec`, we once again make sure that one and only one entity--`linrec` is responsible for implementing linear recursion. If we wish to transform its implementation into an iteration, for example, we only need to change this in one place in our code. We don't have to rewrite both `merge` and `sum`.

Thus, we find that a feature like first-class functions does give us the power of greater expressiveness, as it gives us at least one more way to create many-to-many relationships between functions.

And we also know that this can increase perceived complexity if we do not also temper this increased expressiveness with language features or architectural designs that allow us to define groups of functions that have rich relationships within themselves, but only limited relationships with other groups.

There's more to it than that. Let's compare `binrec` and `multirec`. Or rather, let's compare how we write `mergeSort` using `binrec` and `multirec`:

```javascript
const mergeSort = binrec({
  indivisible: (list) => list.length <= 1,
  seed: (list) => list,
  divide: (list) => ({
    left: list.slice(0, list.length / 2),
    right: list.slice(list.length / 2)
  }),
  combine: ({ left: list1, right: list2 }) => merge({ list1, list2 })
});

const mergeSort = multirec({
  indivisible: (list) => list.length <= 1,
  seed: (list) => list,
  divide: (list) => [
    list.slice(0, list.length / 2),
    list.slice(list.length / 2)
  ],
  combine: ([list1, list2]) => merge({ list1, list2 })
});
```

The interesting thing for us are the functions we supply as arguments:

```javascript
(list) => list.length <= 1
(list) => list
(list) => ({
  left: list.slice(0, list.length / 2),
  right: list.slice(list.length / 2)
})
(list) => [
    list.slice(0, list.length / 2),
    list.slice(list.length / 2)
  ]
({ left: list1, right: list2 }) => merge({ list1, list2 })
([list1, list2]) => merge({ list1, list2 })
```

---

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), discuss this on [reddit], or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-12-15-what-functional-composition-can-teach-us-about-libraries-and-frameworks) yourself!

[anamorphism]: https://en.wikipedia.org/wiki/Anamorphism
[catamorphism]: https://en.wikipedia.org/wiki/Catamorphism
[cc-by-2.0]: https://creativecommons.org/licenses/by/2.0/
[reddit]: https://www.reddit.com/r/javascript/comments/5g4bmu/anamorphisms_in_javascript/
