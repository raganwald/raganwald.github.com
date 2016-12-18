---
layout: default
tags: [allonge, noindex]
---

Let's look at a design principle: *Composition*. In its simplest form, composition is about making things out of smaller things. There can be so much more to it, of course.

---

### introduction: expressiveness and complexity

Consider *Structured Programming*. In structured programming, we write procedures that call other procedures by name.  Structured programming allows us to decompose procedures, and to extract and share common procedures, DRY-ing up our code and allowing us to name concepts.

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

Now let's look at something a little more contemporary, higher-order functions.

---

### higher-order functions

Functions that accept functions as parameters, and/or return functions as values, are called *Higher-Order Functions*, or "HOFs." Languages that support HOFs also support the idea of *functions as first-class values*, and nearly always support the idea of *dynamically creating functions*.

HOFs give programmers even more ways to decompose and compose programs. Let's look at an oft-quoted example, `map`. For kicks, here is a lazy version:

```javascript
function * map (fn, iterable) {
  for (const element of iterable) {
    yield fn(element);
  }
}

[...map((x) => x * x, [1, 2, 3])]
  //=> [1, 4, 9]
```

`map` takes a function as a parameter. If we curry it by hand, we get `mapWith`:

```javascript
function mapWith (fn) {
  return function * (iterable) {
    for (const element of iterable) {
      yield fn(element);
    }
  };
}

[...mapWith((x) => x * x)(1, 2, 3])]
  //=> [1, 4, 9]
```

`mapWith` takes a function as a parameter and returns a function. There are many such functions, but `mapWith` is a particularly interesting example of functions that take functions as arguments and return functions. Let's take another look at `mapWith`, with some spacing and parenthesis inserted:

```javascript
function mapWith (fn) { return(

  function * (iterable) {
    for (const element of iterable) {
      yield fn(element);
    }
  }

);}
```

We can see that `mapWith` is a kind of *Template Function*: It returns a function, with its parameters (one in this case) inserted into it. Template strings provide the same functionality for string expressions:

```javascript
class User {
  fullName() {
    return `${this.firstName()} ${this.lastName}`;
  }
}
```

Templates are *de rigeur* in front-end development. Here's an example from [Ember], using the handlebars templating language:

[Ember]: http://emberjs.com/

```hbs
Hello, <strong>{{firstName}} {{lastName}}</strong>!
```

Programming with templates of any kind makes for particularly readable code, because the form of the program resembles its output. The handlebars code looks a lot like the HTML it produces, and the core of the `mapWith` function looks a lot like the function it produces.

And while writing functions that make other functions may be unfamiliar for programmers new to languages with functions-as-first-class-values, the idea of a "template" is particularly easy to grasp.

---

### linear recursion

Rumour has it that there are excellent companies that ask coöp students to write code as part of the interview process. A typical problem will ask the student to demonstrate their facility solving a problem that ought to be familiar to a computer science or computer engineering student.

For example, merging two sorted lists. This is something a student will have at least looked at, and it does have some applicability to modern service architectures. Here's a naîve implementation:

```javascript
function merge ({ list1, list2 }) {
  if (list1.length === 0 || list2.length === 0) {
    return [...list1, ...list2];
  } else {
    const [head1] = list1;
    const [head2] = list2;

    if (head1 < head2) {
      const remaining = {
        list1: list1.slice(1),
        list2
      }
      const left = head1;
      const right = merge(remaining);

      return [left, ...right];
    } else {
      const remaining = {
        list1,
        list2: list2.slice(1)
      }
      const left = head2;
      const right = merge(remaining);

      return [left, ...right];
    }
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
function sum({ list }) {
  if (list.length === 0) {
    return 0;
  } else {
    const [left] = list;
    const remaining = {
      list: list.slice(1)
    };
    const right = sum(remaining);

    return left + right;
  }
}

sum({ list: [42, 3, -1] })
  //=> 44
```

We've written them so that both have the same structure, they are *linearly recursive*. Can we extract this structure and rewrite it as a template function?


---

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), discuss this on [reddit], or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-12-15-what-functional-composition-can-teach-us-about-libraries-and-frameworks) yourself!

[anamorphism]: https://en.wikipedia.org/wiki/Anamorphism
[catamorphism]: https://en.wikipedia.org/wiki/Catamorphism
[cc-by-2.0]: https://creativecommons.org/licenses/by/2.0/
[reddit]: https://www.reddit.com/r/javascript/comments/5g4bmu/anamorphisms_in_javascript/
