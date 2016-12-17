---
layout: default
tags: [allonge, noindex]
---

Let's look at a design principle: *Composition*. In its simplest form, composition is about making things out of smaller things. There can be so much more to it, of course.

### graphs and compexity

Consider *Structured Programming*. In structured programming, we write procedures that call other procedures by name.  Structured programming allows us to decompose procedures, and it us to extract and share common procedures, DRY-ing up our code and allowing us to name concepts.

When a function invokes other functions, and when one function can be invoked by more than one other function, we have a very good thing. We're going to focus on this idea today. When we have a *many-to-many* relationship between entities, we have a more expressive power than when we have a *one-to-many* relationship.

We have the ability to give each procedure a single responsibility, and name that responsibility. We also have the ability to ensure that one and only one procedure has that responsibility. A many-to-many relationship between procedures is what enables us to create a one-to-one relationship between procedures and responsibilities.

With great power comes great responsibility. The downside of a many-to-many relationship between procedures is that the 'space of things a program might do' grows very rapidly as the size increases.

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



---

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), discuss this on [reddit], or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-12-15-what-functional-composition-can-teach-us-about-libraries-and-frameworks) yourself!

[anamorphism]: https://en.wikipedia.org/wiki/Anamorphism
[catamorphism]: https://en.wikipedia.org/wiki/Catamorphism
[cc-by-2.0]: https://creativecommons.org/licenses/by/2.0/
[reddit]: https://www.reddit.com/r/javascript/comments/5g4bmu/anamorphisms_in_javascript/
