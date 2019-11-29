---
title: "Regular Expressions (No, not *those* Regular Expressions!)"
tags: [recursion,allonge,mermaid,wip]
---

# Prelude

_If you wish to skip the prelude, you can jump directly to the [Table of Contents](#table-of-contents)._

### what is a regular expression?

In programming jargon, a regular expression, or *regex* (plural "regexen"),[^regex] is a sequence of characters that define a search pattern. They can also be used to validate that a string has a particular form. For example, `/ab*c/` is a regex that matches an `a`, zero or more `b`s, and then a `c`, anywhere in a string.

[^regex]: In common programming jargon, a "regular expression" refers any of a family of pattern-matching and extraction languages, that can match a variety of languages. In computer science, a "regular expression" is a specific pattern matching language that recognizes regular languages only. To avoid confusion, in this essay we will use the word "regex" (plural "regexen") to refer to the programming construct.

Regexen are fundamentally descriptions of machines that recognize sentences in languages, where the sentences are strings of text symbols.

Another example is this regex, that purports to recognize a subset of valid email addresses. We can say that it recognizes sentences in a language, where every sentence in that language is a valid email address:[^email]

[^email]: There is an objective standard for email addresses, RFC 5322, but it allows many email addresses that are considered obsolete, *and* there are many non-conforming email servers that permit email addresses not covered by the standard. The real world is extremely messy, and it is very difficult to capture all of its messiness in a formal language.

```
\A(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*
 |  "(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]
      |  \\[\x01-\x09\x0b\x0c\x0e-\x7f])*")
@ (?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?
  |  \[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}
       (?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:
          (?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]
          |  \\[\x01-\x09\x0b\x0c\x0e-\x7f])+)
     \])\z
```

The "regular expression" (or "regex") programming tool evolved as a practical application for [Regular Expressions][regular expression], a concept discovered by Stephen Cole Kleene, who was exploring [Regular Languages]. Regular Expressions in the computer science sense are a tool for descriibing Regular Languages: Any well-formed regular expressions describes a regular Language, and every regular language can be described by a regular expression.

[Regular Languages]: https://en.wikipedia.org/wiki/Regular_language
[regular expression]: https://en.wikipedia.org/wiki/Regular_expression#Formal_language_theory

Regular expressions are made with three constants:

- The constants `∅` respresenting the empty set, and `ε` representing the set containing only the empty string.
- Constant literals such as `x`, `y`, or `z` representing symbols contained within some alphabet `Σ`.

Every constant is itself a regular expression. For example, the constant `r` is itself a regular expression denoting the language that contains just one sentence, `'r'`: `{ 'r' }`.

What makes regular expressions powerful, is that we have operators for composing and decorating these three constants:

1. Given a regular expression _z_, the expression _z_`*` resolves to the `kleene*` of the language described by _z_.
2. Given two regular expressions _x_ and _x_, the expression _xy_ resolves to the catenation of the language described by _x_ and the language described by _y_.
3. Given two regular expressions _x_ and _y_, the expression _x_`|`_y_ resolves to the union of the language described by _x_ and the language described by _y_.

Before we add the last rule for regular expressions, let's clarify these three rules with some examples.

Given the constants `a`, `b`, and `c`, resolving to the languages `{ 'a' }`, `{ 'b' }`, and `{ 'b' }`, the expression `a*` resolves to the language `{ '', 'a', 'aa', 'aaa', ... }` by rule 1. The expression `ab` resolves to the language `{ 'ab' }` by rule 2. And the expression `b|c` resolves to the language `{ 'b', 'c' }` by rule 3.

Our operations have a precedence, and it is the order of the rules as presented. So the expression `ab*` resolves to the language `{ 'a', 'ab', 'abb', 'abbb', ... }`, the expression `a|bc` resolves to the language `{ 'a', 'bc' }`, and the expression `b|c*` resolves to the language `{ '', 'b', 'c', 'cc', 'ccc', ... }`.

As with the algebraic notation we are familiar with, we can use parentheses:

- Given a regular expression _x_, the expression `(`_x_`)` resolves to the language described by _x_.

This allows us to alter the way the operators are combined. As we have seen, the expression `b|c*` resolves to the language `{ '', 'b', 'c', 'cc', 'ccc', ... }`. But the expression `(b|c)*` resolves to the language `{ '', 'b', 'c', 'bb', 'cc', 'bbb', 'ccc', ... }`.

It is quite obvious that regexen borrowed a lot of their syntax and semantics from regular expressions. Leaving aside the mechanism of capturing and extracting portions of a match, almost every regular expressions is also a regex. For example, `/reggiee*/` is a regular expression that matches words like `reggie`, `reggiee`, and `reggieee` anywhere ina string.

Regexen add a lot more affordances like character classes, the dot operator, decorators like `?` and `+`, and so forth, but at their heart, regexen are based on regular expressions.

---

### what will we explore in this essay?

In this essay we will explore a number of important results concerning regular expressions, and regular languages, and finite-state automata:

  - The set of finite-state recognizers is closed under various operations, including `union`, `intersection`, `catenation`, `kleene*`, and others.
  - Every regular language can be recognized by a finite-state automaton.
  - If a finite-state automaton recognizes a language, that language is regular.

All of these things have been proven, and there are numerous explanations of the proofs available in literature and online. What makes this essay novel is that instead of focusing on formal proofs, we will focus on informal _demonstrations_.

A demonstration aims to appeal to intuition, rather than formal reasoning. For example, the canonical proof that "If a finite-state automaton recognizes a language, that language is regular" runs along the following lines:[^cs390]

[cs390]: This explanation of the proof is taken from Shunichi Toida's notes for [CS390 Introduction to Theoretical Computer Science Structures ](https://www.cs.odu.edu/~toida/courses/TE.CS390.13sp/index.html). The proof of this aspect of Kleene's Theorem can be found [here](https://www.cs.odu.edu/~toida/nerzic/390teched/regular/fa/kleene-2.html).

> Given a finite automaton, first relabel its states with the integers 1 through n, where n is the number of states of the finite automaton. Next denote by L(p, q, k) the set of strings representing paths from state p to state q that go through only states numbered no higher than k. Note that paths may go through arcs and vertices any number of times.
Then the following lemmas hold.

> **Lemma 1**: L(p, q, k+1) = L(p, q, k)  L(p, k+1, k)L(k+1, k+1, k)*L(k+1, q, k) .

> What this lemma says is that the set of strings representing paths from p to q passing through states labeled with k+1 or lower numbers consists of the following two sets:
> 1. L(p, q, k) : The set of strings representing paths from p to q passing through states labeled wiht k or lower numbers.
> 2. L(p, k+1, k)L(k+1, k+1, k)*L(k+1, q, k) : The set of strings going first from p to k+1, then from k+1 to k+1 any number of times, then from k+1 to q, all without passing through states labeled higher than k.

> ![Illustrating Kleene's Theorem © Shunichi Toida](/assets/images/fsa/kleene2.jpg)

> **Lemma 2**: L(p, q, 0) is regular.

> **Proof**: L(p, q, 0) is the set of strings representing paths from p to q without passing any states in between. Hence if p and q are different, then it consists of single symbols representing arcs from p to q. If p = q, then  is in it as well as the strings representing any loops at p (they are all single symbols). Since the number of symbols is finite and since any finite language is regular, L(p, q, 0) is regular.

> From Lemmas 1 and 2 by induction the following lemma holds.

> **Lemma 3**: L(p, q, k) is regular for any states p and q and any natural number k.

> Since the language accepted by a finite automaton is the union of L(q0, q, n) over all accepting states q, where n is the number of states of the finite automaton, we have the following converse of the part 1 of Kleene Theorem.

> **Theorem 2** (Part 2 of Kleene's Theorem): **Any language accepted by a finite automaton is regular**.

The above proof takes the approach of describing--in words and diagrams--an algorithm.[^algo] Given any finite-state automaton that recognizes a language, this algorithm produces an equivalent regular expression. Froma  programmer's perspective, if you want to prove taht for any `A`, there is an equivalent `B`, writing a working `A --> B` compiler is a very powerful demonstration..

[^algo]: Lots of proofs attest to the existence of some thing, but not all are algorithms for actually finding/making the thing they attest exists. For example, there is a proof that a standard Rubik's Cube can be solved with at most 20 moves, although nobody has yet developed an algorithm to find the 20 (or fewer) move solution for any cube.

Of course, algorithms described in words and disgrams have the advantage of being universal, like pseudo-code. But the disadvantage of algorithms described in words and disagrams is that we can't play with them, optimize them, and learn by doing. For example, here is the core of the above proof, expressed as an algorithm (the complete code is [here](/assetssupplemental/fsa/13-regular-expression.js))

```javascript
function L (p, q, k) {
  if (k === 0) {
    // degenerate case, doesn't go through any other states
    // just look for direct transitions
    const pqTransitions = transitions.filter(
      ({ from, to }) => from === stateList[p] && to === stateList[q]
    );

    const pqDirectExpressions =
      pqTransitions.map(
        ({ consume }) => quote(consume)
      );

    if (p === q) {
      return unionOf('ε',  ...pqDirectExpressions);
    } else {
      return unionOf(...pqDirectExpressions);
    }
  } else {
    const pq = L(p, q, k-1);

    const pk = L(p, k, k-1);
    const kk = kleeneStarOf(L(k, k, k-1));
    const kq = L(k, q, k-1);
    const pkkq = catenationOf(pk, kk, kq);

    const pqMaybeThroughK = unionOf(pq, pkkq);

    return pqMaybeThroughK;
  }
}
```

Writing the algorithm in JavaScript helps our brains engage with the algorithm more deeply, and we can move on to expand on it as we see fit.

In this essay, we won't just discuss why certain things are known to be true, we will emphasize writing algorithms in JavaScript that demonstrate that these things are true. Most specifically...

1. We will write algorithms to compute the `union`, `intersection`, `catenation`, and `kleene*` of finite-state automata, demonstrating that the set of finite-state automata is closed under thes eoperations.
2. We will write algorithms for translating a regular expression into an equivalent finite-state automaton, demonstrating that for every regular expression there is an equivalent finite-state automation.
3. As noted above, we will also write an algorithm for translating a finite-state automaton into an equivalent regular expression, demonstrating that for every finite-state automaton there is an equivalent regular expression.

Along the way, we'll look at other tools that make regular expressions more convenient to work with.

---

# [Table of Contents](#table-of-contents)

### [Prelude](#prelude)

  - [what is a regular expression?](#what-is-a-regular-expression)
  - [what will we explore in this essay?](#what-will-we-explore-in-this-essay)

### [Finite-State Recognizers](#finite-state-recognizers-1)

  - [describing finite-state recognizers in JSON](#describing-finite-state-recognizers-in-json)
  - [verifying finite-state recognizers](#verifying-finite-state-recognizers)

### [Composing and Decorating Recognizers](#composing-and-decoratting-recognizers-1)

[Taking the Product of Two Finite-State Automata](#taking-the-product-of-two-finite-state-automata)

  - [starting the product](#starting-the-product)
  - [transitions](#transitions)
  - [a function to compute the product of two recognizers](#a-function-to-compute-the-product-of-two-recognizers)

[From Product to Union and Intersection](#from-product-to-union-and-intersection)

  - [union](#union)
  - [intersection](#intersection)
  - [product's fan-out problem](#products-fan-out-problem)

[Catenating Descriptions](#catenating-descriptions)

  - [catenating descriptions with epsilon-transitions](#catenating-descriptions-with-epsilon-transitions)
  - [removing epsilon-transitions](#removing-epsilon-transitions)
  - [implementing catenation](#implementing-catenation)
  - [the catch with catenation](#the-catch-with-catenation)

[Converting Nondeterministic to Deterministic Finite-State Recognizers](#converting-nondeterministic-to-deterministic-finite-state-recognizers)

  - [taking the product of a recognizer... with itself](#taking-the-product-of-a-recognizer-with-itself)
  - [computing the powerset of a nondeterministic finite-state recognizer](#computing-the-powerset-of-a-nondeterministic-finite-state-recognizer)
  - [catenation without the catch, and an observation](#catenation-without-the-catch-and-an-observation)
  - [from powerset to union](#from-powerset-to-union)
  - [solving the fan-out problem](#solving-the-fan-out-problem)
  - [the final union, intersection, and catenation](#the-final-union-intersection-and-catenation)

[Decorating Recognizers](#decorating-recognizers)

  - [kleene*](#kleene)
  - [kleene+](#kleene-1)

[The set of finite-state recognizers is closed under various operations](#the-set-of-finite-state-recognizers-is-closed-under-various-operations)

### [Building Blocks](#building-blocks-1)

  - [recognizing strings](#recognizing-strings)
  - [recognizing symbols](#recognizing-symbols)
  - [none](#none)

[For every formal regular expression, there is an equivalent finite-state recognizer](#for-every-formal-regular-expression-there-is-an-equivalent-finite-state-recognizer)

  - [the shunting yard algorithm](#the-shunting-yard-algorithm)
  - [generating finite-state recognizers](#generating-finite-state-recognizers)
  - [the significance of generating finite-state recognizers from regular expressions](#the-significance-of-generating-finite-state-recognizers-from-regular-expressions)

---

# Finite-State Recognizers

We are going to begin by working with finite-state automata that recognize, or "accept" sentences in languages. There are many ways to notate finite-state automata. For example, state disagrams are particularly easy to read for smallish examples:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> one : 1
    one --> one : 0, 1
    zero --> [*]
    one --> [*]
</div>

Of course, diagrams are not particularly easy to work with in JavaScript. If we want to write JavaScript algorithms that operate on finite-state recognizers, we need a language for describing finite-state recognizers that JavaScript is comfortable manipulating.

### describing finite-state recognizers in JSON

We don't need to invent a brand-new format, there is already an accepted [formal definition][fdfsa] for Pushdown Automata. Mind you, it involves mathematical symbols that are unfamiliar to some programmers, so without dumbing it down, we will create our own language that is equivalent to the full formal definition, but expressed in a subset of JSON.

[fdfsa]: https://en.wikipedia.org/wiki/Finite-state_machine#Mathematical_model

JSON has the advantage that it is a language in the exact sense we want: An ordered set of symbols. So we will describe finite-state recognizers using JSON, and we will attempt to write a finite-state recognizer that recognizes strings that are valid JSON descriptions of finite-state recognizers.[^natch]

[^natch]: Naturally, if we have a valid description of a finite-state recognizer that recognizes vald descriptions of finite-state recognizers... We expect it to recognize itself.

Now what do we need to encode? Finite-state recognizers are defined as a quintuple of `(Σ, S, s, ẟ, F)`, where:

  - `Σ` is the alphabet of symbols this recognizer operates upon.
  - `S` is the set of states this recognizer can be in.
  - `s` is the initial or "start" state of the recognizer.
  - `ẟ` is the recognizer's "state transition function" that governs how the recognizer changes states while it consumes symbols from the sentence it is attempting to recognize.
  - `F` is the set of "final" states. If the recognizer is in one of these states when the input ends, it has recognized the sentence.

For our immediate purposes, we do not need to encode the alphabet of symbols, and the set of states can always be derived from the rest of the description, so we don't need to encode that either. This leaves us with describing the start state, transition function, and set of final states.

We can encode these with JSON. We'll use descriptive words rather than mathematical symbols, but note that if we wanted to use the mathematical symbols, everything we're doing would work just as well.

Or JSON representation will represent the start state, transition function, and set of final states as a Plain Old JavaScript Object (or "POJO"), rather than an array. This makes it easier to document what each element means:

```javascript
{
  // elements...
}
```

The recognizer's initial, or `start` state is required. It is a string representing the name of the initial state:

```json
{
  "start": "start"
}
```

The recognizer's state transition function, `ẟ`, is represented as a set of `transitions`, encoded as a list of POJOs, each of which represents exactly one transition:

```json
{
  "transitions": [

  ]
}
```

Each transition defines a change in the recognizer's state. Transitions are formally defined as triples of the form `(p, a, q)`:

 - `p` is the state the recognizer is currently in.
 - `a` is the input symbol  consumed.
 - `q` is the state the recognizer will be in after completing this transition. It can be the same as `p`, meaning that it consumes a symbol and remains in the same state.

We can represent this with POJOs. For readability by those unfamiliar with the formal notation, we will use the words `from`, `consume`, and `to`. This may feel like a lot of typing compared to the formal symbols, but we'll get the computer do do our writing for us, and it doesn't care.

Thus, one possible set of transitions might be encoded like this:

```json
{
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ]
}
```

The recognizer's set of final, or `accepting` states is required. It is encoded as a list of strings representing the names of the final states. If the recognizer is in any of the `accepting` (or "final") states when the end of the sentence is reached (or equivalently, when there are no more symbols to consume), the recognizer accepts or "recognizes" the sentence.

```json
{
  "accepting": ["zero", "notZero"]
}
```

Putting it all together, we have:

```javascript
const binary = {
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ],
  "accepting": ["zero", "notZero"]
}
```

Our representation translates directly to this simplified state diagram:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

This finite-state recognizer recognizes binary numbers.

---

### verifying finite-state recognizers

It's all very well to _say_ that a description recognizes binary numbers (or have any other expectation for it, really). But how do we have confidence that the finite-state recognzer we describe recognzes the language what we think it recognizes?

There are formal ways to prove things about recognizers, and there is the informal technique of writing tests we can run. Since we're emphasizing working code, we'll write tests.

Here is a function that takes as its input the definition of a recognizer, and returns a Javascript recognizer *function*:[^vap][^regexp]

```javascript
function automate (description) {
  if (description instanceof Regexp) {
    return string => !!description.exec(string)
  } else {
    const {
      stateMap,
      start,
      acceptingSet,
      transitions
    } = validatedAndProcessed(description);

    return function (string) {
      let state = start;
      let unconsumed = string;

      while (unconsumed !== '') {
        const transitionsForThisState = stateMap.get(state) || [];
        const transition =
        	transitionsForThisState.find(
            ({ consume }) => consume === unconsumed[0]
        	);

        if (transition == null) {
          // the machine stops
        	break;
        }

        const { to } = transition;
        unconsumed = unconsumed.substring(1);

        state = to;
      }

      // machine has reached a terminal state.
      if (unconsumed === '') {
        // reached the end. do we accept?
        return acceptingSet.has(state);
      } else {
        // stopped before reaching the end is a fail
        return false;
      }
    }
  }
}
```

[^vap]: `automate` relies on `validatedAndProcessed`, a utility function that does some general-purpose processing useful to many of the things we will build along the way. The source code is [here](/assets/supplemental/fsa/01-validated-and-processed.js). Throughout this essay, we will publish the most important snippets of code, but link to the full source.

[^regexp]: `automate` can also take a JavaScript `RegExp` as an argument and return a recognizer function. This is not central to developing finite-state recognizers, but is sometimes useful when comparing JavaScript regexen to our recognizers.

Here we are using `automate` with our definition for recognizing binary numbers. We'll use the `verify` function throughout our exploration to build simple tests-by-example:

```javascript
function verify (description, tests) {
  try {
    const recognizer = automate(description);
    const testList = Object.entries(tests);
    const numberOfTests = testList.length;

    const outcomes = testList.map(
      ([example, expected]) => {
        const actual = recognizer(example);
        if (actual === expected) {
          return 'pass';
        } else {
          return `fail: ${JSON.stringify({ example, expected, actual })}`;
        }
      }
    )

    const failures = outcomes.filter(result => result !== 'pass');
    const numberOfFailures = failures.length;
    const numberOfPasses = numberOfTests - numberOfFailures;

    if (numberOfFailures === 0) {
      console.log(`All ${numberOfPasses} tests passing`);
    } else {
      console.log(`${numberOfFailures} tests failing: ${failures.join('; ')}`);
    }
  } catch(error) {
    console.log(`Failed to validate the description: ${error}`)
  }
}

const binary = {
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ],
  "accepting": ["zero", "notZero"]
};

verify(binary, {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true,
  '10100011011000001010011100101110111': true
})
  //=> All 16 tests passing
```

We now have a function, `automate`, that takes a data description of a finite-state automaton/recognizer, and returns a Javascript recognizer function we can play with and verify.

---

# Composing and Decorating Recognizers

Composeable recognizers and patterns are particularly interesting. Just as human languages are built by layers of composition, all sorts of mechanical languages are structured using composition. JSON is a perfect example: A JSON element like a list is composed of zero or more arbitrary JSON elements, which themselves could be lists, and so forth.

Regular expressions and regexen are both built with composition. If you have two regular expresisons, `A` and `B`, you can create a new regular expression that is the union of `A` and `B` with the expression `A|B`.

Finite-state recognizers, on the other hand, do not compose by themselves. If we want to have the same affordance for finite-state recognizers, we need to write a function that takes two recognizers as arguments, and returns a recognizer that recognizes the language that is the union of `A` and `B`.

So that's what we'll create: We are going to implement three operations that compose two recognizers: _Union_, _Intersection_, and _Catenation_.

Given two recognizes `a` and `b`, we can say that `A` is a set of sentences recognized by `a`, and `B` is a set of sentences recognized by `b`. Given `a`, `A`, `b`, and `B`, we can say that the `union(a, b)` is a recognizer that recognizes sentences in the set `A ⋃ B`, and `intersection(a, b)` is a recognizer that recognizes sentences in the set `A ⋂ B`.

Or in colloquial terms, a sentence is recognized by `union(a, b)` if and only if it is recognized by `a` or it is recognized by `b`. And a sentence is recognized by `intersection(a, b)` if and only if it is recognized by both `a` and by `b`.

What about `catenation(a, b)`? If we have some sentence `xy`, where `x` and `y` are strings of zero or more symbols, then `xy` is recognized by `catenation(a, b)` is and only if `x` is recognized by `a` and `y` is recognized by `b`.

We'll get started with union and intersection, because they both are built on a common operation, *taking the product of two finite-state automata*.

---

## Taking the Product of Two Finite-State Automata

Consider two finite-state recognizers. The first, `a`, recognizes a string of one or more zeroes:

<div class="mermaid">
  stateDiagram
    [*]-->emptyA
    emptyA-->zero : 0
    zero-->zero : 0
    zero-->[*]
</div>

The second, `b`, recognizes a string of one or more ones:

<div class="mermaid">
  stateDiagram
    [*]-->emptyB
    emptyB-->one : 1
    one--> one : 1
    one-->[*]
</div>

Recognizer `a` has two declared states: `'empty'` and `'zero'`. Recognizer `b` also has two declared states: `'empty'` and `'one'`. Both also have an undeclared state: they can halt. As a convention, we will refer to the halted state as an empty string, `''`.

Thus, recognizer `a` has three possible states: `'empty'`, `'zero'`, and `''`. Likewise, recognizer `b` has three possible states: `'empty'`, `'one'`, and `''`.

Now let us imagine the two recognizers are operating concurrently on the same stream of symbols:

<div class="mermaid">
  stateDiagram
    simultaneous

  state simultaneous {
    [*]-->emptyA
      emptyA-->zero : 0
      zero-->zero : 0
      zero-->[*]

    --

    [*]-->emptyB
      emptyB-->one : 1
      one--> one : 1
      one-->[*]
  }
</div>

At any one time, there are nine possible combinations of states the two machines could be in:

|a|b|
|:---|:---|
|`''`|`''`|
|`''`|`'emptyB'`|
|`''`|`'one'`|
|`'emptyA'`|`''`|
|`'emptyA'`|`'emptyB'`|
|`'emptyA'`|`'one'`|
|`'zero'`|`''`|
|`'zero'`|`'emptyB'`|
|`'zero'`|`'one'`|

If we wish to simulate the actions of the two recognizers operating concurrently, we could do so if we had a finite-state automaton with nine states, one for each of the pairs of states that `a` and `b` could be in.

It will look something like this:

<div class="mermaid">
  stateDiagram
    state1 : '' and ''
    state2 : '' and 'emptyB'
    state3 : '' and 'one'
</div>

<div class="mermaid">
  stateDiagram
    state4 : 'emptyA' and ''
    state5 : 'emptyA' and 'emptyB'
    state6 : 'emptyA' and 'one'
</div>

<div class="mermaid">
  stateDiagram
    state7 : 'zero' and ''
    state8 : 'zero' and 'emptyB'
    state9 : 'zero' and 'one'
</div>

The reason this is called the **product** of `a` and `b`, is that when we take the product of the sets `{ '', 'emptyA', 'zero' }` and `{'', 'emptyB', 'one' }` is the set of tuples `{ ('', ''), ('', 'emptyB'), ('', 'one'), ('emptyA', ''), ('emptyA', 'emptyB'), ('emptyA', 'one'), ('zero', ''), ('zero', 'emptyB'), ('zero', 'one')}`.

There will be (at most) one set in the product state machine for each tuple in the product of the sets of states for `a` and `b`.

We haven't decided where such an automaton would start, how it transitions between its states, and which states should be accepting states. We'll go through those in that order.

---

### starting the product

Now let's consider `a` and `b` simultaneously reading the same string of symbols in parallel. What states would they respectively start in? `emptyA` and `emptyB`, of course, therefore our product will begin in `state5`, which corresponds to `emptyA` and `emptyB`:

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 : 'emptyA' and 'emptyB'
</div>

This is a rule for constructing products: The product of two recognizers begins in the state corresponding to the start state for each of the recognizers.

---

### transitions

Now let's think about our product automaton. It begins in `state5`. What transitions can it make from there? We can work that out by looking at the transitions for `emptyA` and `emptyB`.

Given that the product is in a state corresponding to `a` being in state _Fa_ and `b` being in state `Fb`, We'll follow these rules for determining the transitions from the state (_Fa_ and _Fb_):

1. If when `a` is in state _Fa_ it consumes a symbol _S_ and transitions to state _Ta_, but when `b` is in state _Fb_ it does not consume the symbol _S_, then the product of `a` and `b` will consume _S_ and transition to the state (_Ta_ and `''`), denoting that were the two recognizers operating concurrently, `a` would transition to state _Ta_ while `b` would halt.
2. If when `a` is in state _Fa_ it does not consume a symbol _S_, but when `b` is in state _Fb_ it consumes the symbol _S_ and transitions to state _Tb_, then the product of `a` and `b` will consume _S_ and transition to (`''` and _Tb_), denoting that were the two recognizers operating concurrently, `a` would halt while `b` would transition to state _Tb_.
2. If when `a` is in state _Fa_ it consumes a symbol _S_ and transitions to state _Ta_, and also if when `b` is in state _Fb_ it consumes the symbol _S_ and transitions to state _Tb_, then the product of `a` and `b` will consume _S_ and transition to (_Ta_ and _Tb_), denoting that were the two recognizers operating concurrently, `a` would transition to state _Ta_ while `b` would transition to state _Tb_.

When our product is in state `'state5'`, it corresponds to the states (`'emptyA'` and `'emptyB'`). Well, when `a` is in state `'emptyA'`, it consumes `0` and transitions to `'zero'`, but when `b` is in `'emptyB'`, it does not consume `0`.

Therefore, by rule 1, when the product is in state `'state5'` corresponding to the states (`'emptyA'` and `'emptyB'`), it consumes `0` and transitions to `'state7'` corresponding to the states (`'zero'` and `''`):

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 --> state7 : 0

    state5 : 'emptyA' and 'emptyB'
    state7 : 'zero' and ''
</div>

And by rule 2, when the product is in state `'state5'` corresponding to the states (`'emptyA'` and `'emptyB'`), it consumes `1` and transitions to `'state3'`, corresponding to the states (`''` and `'one'`):

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 --> state7 : 0
    state5 --> state3 : 1

    state3: '' and 'one'
    state5 : 'emptyA' and 'emptyB'
    state7 : 'zero' and ''
</div>

What transitions take place from state `'state7'`? `b` is halted in `'state7'`, and therefore `b` doesn't consume any symbols in `'state7'`, and therefore we can apply rule 1 to the case where `a` consumes a `0` from state `'zero'` and transitions to state `'zero'`:

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 --> state7 : 0
    state5 --> state3 : 1

    state7 --> state7 : 0

    state3: '' and 'one'
    state5 : 'emptyA' and 'emptyB'
    state7 : 'zero' and ''
</div>

We can always apply rule 1 to any state where `b` is halted, and it follows that all of the transitions from a state where `b` is halted will lead to states where `b` is halted. Now what about state `'state3'`?

Well, by similar logic, since `a` is halted in state `'state3'`, and `b` consumes a `1` in state `'one'` and transitions back to state `'one'`, we apply rule 2 and get:

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 --> state7 : 0
    state5 --> state3 : 1

    state7 --> state7 : 0
    state3 --> state3 : 1

    state3: '' and 'one'
    state5 : 'emptyA' and 'emptyB'
    state7 : 'zero' and ''
</div>

We could apply our rules to the other six states, but we don't need to: The states `'state2'`, `'state4'`, `'state6'`, `'state8'`, and `'state9'` are unreachable from the starting state `'state5'`.

And `'state1` need not be included: When both `a` and `b` halt, then the product of `a` and `b` also halts. So we can leave it out.

Thus, if we begin with the start state and then recursively follow transitions, we will automatically end up with the subset of all possible product states that are reachable given the transitions for `a` and `b`.

---

### a function to compute the product of two recognizers

Here is a function that [takes the product of two recognizers](/assets/supplemental/fsa/03-product.js). It doesn't name its states `'state1'`, `'state2'`, and so forth. Instead, it uses a convention of `'(stateA)(stateB)'`, although that's easy enough to change.

We can test it with out `a` and `b`:

```javascript
const a = {
  "start": 'emptyA',
  "accepting": ['zero'],
  "transitions": [
    { "from": 'emptyA', "consume": '0', "to": 'zero' },
    { "from": 'zero', "consume": '0', "to": 'zero' }
  ]
};

const b = {
  "start": 'emptyB',
  "accepting": ['one'],
  "transitions": [
    { "from": 'emptyB', "consume": '1', "to": 'one' },
    { "from": 'one', "consume": '1', "to": 'one' }
  ]
};

product(a, b)
  //=>
    {
      "start": "(emptyA)(emptyB)",
      "accepting": [],
      "transitions": [
        { "from": "(emptyA)(emptyB)", "consume": "0", "to": "(zero)()" },
        { "from": "(emptyA)(emptyB)", "consume": "1", "to": "()(one)" },
        { "from": "(zero)()", "consume": "0", "to": "(zero)()" },
        { "from": "()(one)", "consume": "1", "to": "()(one)" }
      ]
    }
```

It doesn't actually accept anything, so it's not much of a recognizer. Yet.

---

## From Product to Union and Intersection

We know how to compute the product of two recognizers, and we see how the product actually simulates having two recognizers simultaneously consuming the same symbols. But what we want is to compute the union or intersection of the recognizers.

So let's consider our requirements. We'll start with the _Union_ of two recognizers. When we talk about the union of `a` and `b`, we mean a recognizer that recognizes any sentence that `a` recognizes or any sentence that `b` recognizes.

If the two recognizers were running concurrently, we would want to accept a sentence if `a` ended up in one of its recognizing states or if `b` ended up in one of its accepting states. How does this translate to the product's states?

Well, each state of the product represents one state from `a` and one state from `b`. If there are no more symbols to consume and the product is in a state where the state from `a` is in `a`'s set of accepting states, then this is equivalent to `a` having accepted the sentence. Likewise, if there are no more symbols to consume and the product is in a state where the state from `b` is in `b`'s set of accepting states, then this is equivalent to `b` having accepted the sentence.

In theory, then, for `a` and `b`, the following product states represent the union of `a` and `b`:

|a|b|
|:---|:---|
|`''`|`'one'`|
|`'emptyA'`|`'one'`|
|`'zero'`|`''`|
|`'zero'`|`'emptyB'`|
|`'zero'`|`'one'`|

Of course, only two of these (`'zero'` and `''`, `''` and `'one'`) are reachable, so those are the ones we want our product to accept when we want the union of two recognizers.

---

### union

Here's a union function that makes use of `product` and some of the helpers we've already written:

```javascript
function union2 (a, b) {
  const {
    states: aDeclaredStates,
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const aStates = [''].concat(aDeclaredStates);
  const {
    states: bDeclaredStates,
    accepting: bAccepting
  } = validatedAndProcessed(b);
  const bStates = [''].concat(bDeclaredStates);

  const statesAAccepts =
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => abToAB(aAcceptingState, bState))
    );
  const statesBAccepts =
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => abToAB(aState, bAcceptingState))
    );
  const allAcceptingStates =
    statesAAccepts.concat(
      statesBAccepts.filter(
        state => statesAAccepts.indexOf(state) === -1
      )
    );

    const productAB = product(a, b);
    const { stateSet: reachableStates } = validatedAndProcessed(productAB);

    const { start, transitions } = productAB;
    const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

    return { start, accepting, transitions };
}
```

And when we try it:

```javascript
union2(a, b)
  //=>
    {
      "start": "(emptyA)(emptyB)",
      "accepting": [ "(zero)()", "()(one)" ],
      "transitions": [
        { "from": "(emptyA)(emptyB)", "consume": "0", "to": "(zero)()" },
        { "from": "(emptyA)(emptyB)", "consume": "1", "to": "()(one)" },
        { "from": "(zero)()", "consume": "0", "to": "(zero)()" },
        { "from": "()(one)", "consume": "1", "to": "()(one)" }
      ]
    }
```

---

### intersection

The accepting set for the _Intersection_ of two recognizers is equally straightforward. While the accepting set for the union is all those reachable states of the product where either (or both) of the two states is an accepting state, the accepting set for the intersection is all those reachable states of the product where both of the two states is an accepting state:

```javascript
function intersection2 (a, b) {
  const {
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const {
    accepting: bAccepting
  } = validatedAndProcessed(b);

  const allAcceptingStates =
    aAccepting.flatMap(
      aAcceptingState => bAccepting.map(bAcceptingState => abToAB(aAcceptingState, bAcceptingState))
    );

  const productAB = product(a, b);
  const { stateSet: reachableStates } = validatedAndProcessed(productAB);

  const { start, transitions } = productAB;
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}
```

The intersection of our `a` and `b` is going to be empty, and that makes sense: There is only one possible accepting state, `'zero'` and `'one'`, and there is no path to reach that state. Which makes sense, as there are no sentences which consists of nothing but one or more zeroes *and* nothing but one or more ones.

We can give it a different test. First, here is a recognizer that recognizes the name "reg." It is case-insensitive:

```javascript
const reg = {
  "start": "empty",
  "accepting": ["reg"],
  "transitions": [
    { "from": "empty", "consume": "r", "to": "r" },
    { "from": "empty", "consume": "R", "to": "r" },
    { "from": "r", "consume": "e", "to": "re" },
    { "from": "r", "consume": "E", "to": "re" },
    { "from": "re", "consume": "g", "to": "reg" },
    { "from": "re", "consume": "G", "to": "reg" }
  ]
};

verify(reg, {
  '': false,
  'r': false,
  'R': false,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
})
  //=> All 7 tests passing
```

Second, here is a recognizer that recognizes uppercase words:

```javascript
const uppercase = {
  "start": "uppercase",
  "accepting": ["uppercase"],
  "transitions": [
    { "from": "uppercase", "consume": "A", "to": "uppercase" },
    { "from": "uppercase", "consume": "B", "to": "uppercase" },
    { "from": "uppercase", "consume": "C", "to": "uppercase" },
    { "from": "uppercase", "consume": "D", "to": "uppercase" },
    { "from": "uppercase", "consume": "E", "to": "uppercase" },
    { "from": "uppercase", "consume": "F", "to": "uppercase" },
    { "from": "uppercase", "consume": "G", "to": "uppercase" },
    { "from": "uppercase", "consume": "H", "to": "uppercase" },
    { "from": "uppercase", "consume": "I", "to": "uppercase" },
    { "from": "uppercase", "consume": "J", "to": "uppercase" },
    { "from": "uppercase", "consume": "K", "to": "uppercase" },
    { "from": "uppercase", "consume": "L", "to": "uppercase" },
    { "from": "uppercase", "consume": "M", "to": "uppercase" },
    { "from": "uppercase", "consume": "N", "to": "uppercase" },
    { "from": "uppercase", "consume": "O", "to": "uppercase" },
    { "from": "uppercase", "consume": "P", "to": "uppercase" },
    { "from": "uppercase", "consume": "Q", "to": "uppercase" },
    { "from": "uppercase", "consume": "R", "to": "uppercase" },
    { "from": "uppercase", "consume": "S", "to": "uppercase" },
    { "from": "uppercase", "consume": "T", "to": "uppercase" },
    { "from": "uppercase", "consume": "U", "to": "uppercase" },
    { "from": "uppercase", "consume": "V", "to": "uppercase" },
    { "from": "uppercase", "consume": "W", "to": "uppercase" },
    { "from": "uppercase", "consume": "X", "to": "uppercase" },
    { "from": "uppercase", "consume": "Y", "to": "uppercase" },
    { "from": "uppercase", "consume": "Z", "to": "uppercase" }
  ]
};

verify(uppercase, {
  '': true,
  'r': false,
  'R': true,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
})
  //=> All 7 tests passing
```

Now we can try their union and intersection:

```javascript
verify(union2(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
})
  //=> All 7 tests passing

verify(intersection2(reg, uppercase), {
  '': false,
  'r': false,
  'R': false,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
})
  //=> All 7 tests passing
```

We now have `union` and `intersection` functions, each of which takes two descriptions and returns a description.

---

### product's fan-out problem

Consider taking the union of:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zero : 0
    zero-->[*]
</div>

and:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->one : 1
    one-->[*]
</div>

Which is:

<div class="mermaid">
  stateDiagram
    [*]-->emptyAndEmpty
    emptyAndEmpty-->zeroAndHalted : 0
    emptyAndEmpty-->haltedAndOne : 1
    zeroAndHalted-->[*]
    haltedAndOne-->[*]
</div>

It works perfectly well, however it has an extra, unnecessary state: Both `zeroAndhalted` and `haltedAndOne` are equivalent states.

What do we mean by "equivalent?" Although they have different names, and different incoming transitions, two states are equivalent if and only if:

1. They have the exact same set of outgoing transitions (including transitions back to themselves), and;
2. Either they are both accepting states, or neither is an accepting state.

Both `zeroAndHalted` and `haltedAndOne` have no outgoing transitions, and they are both accepting states, therefore they are equivalent states.

Because of the way `product` replicates all of the possible outcomes, it tends to generate equivalent states. This has no effect on the function of the finite-state recognizer, but for practical purposes a smaller number of accepting states is better, as is a smaller number of states in general.

Ideally, we could automatically detect equivalent states and "merge" them. If two states are equivalent, we can always get rid of one of them and redirect all transitions to the remaining state.

With such an optimization, we could take the union of those two recognizers and end up with:

<div class="mermaid">
  stateDiagram
    [*]-->emptyAndEmpty
    emptyAndEmpty--> zeroAndHaltedAndHaltedAndOne : 0,1
    zeroAndHaltedAndHaltedAndOne-->[*]
</div>

We'll move on without making any changes at the moment: Later, we will revisit this and look at how we could optimize finite-state machines by eliminating duplicate states.

---

## Catenating Descriptions

And now we turn our attention to catenating descriptions. Let's begin by informally defining what we mean  by "catenating descriptions:"

Given two recognizers, `a` and `b`, the catenation of `a` and `b` is a recognizer that recognizes a sentence `AB`, if and only if `A` is a sentence recognized by `a` and `B` is a sentence recognized by `b`.

Catenation is very common in composing patterns. It's how we formally define recognizers that recognize things like "the function keyword, followed by optional whitespace, followed by an optional label, followed by optional whitespace, followed by an open parenthesis, followed by..." and so forth.

A hypothetical recognizer for JavaScript function expressions would be composed by catenating recognizers for keywords, optional whitespace, labels, parentheses, and so forth.

---

### catenating descriptions with epsilon-transitions

Our finite-state automata are very simple: They are deterministic, meaning that in every state, there is one and only one transition for each unique symbol. And they always consume a symbol when they transition.

Some finite-state automata relax the second constraint. They allow a transition between states without consuming a symbol. If a transition with a symbol to be consumed is like an "if statement," a transition without a symbol to consume is like a "goto."

Such transitions are called "ε-transitions," or "epsilon transitions" for those who prefer to avoid greek letters. As we'll see, ε-transitions do not add any power to finite-state automata, but they do sometimes help make diagrams a little easier to understand and formulate.

Recall our recognizer that recognizes variations on the name "reg." Here it is as a diagram:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->r : r,R
    r-->re : e,E
    re-->reg : g,G
    reg-->[*]
</div>

And here is the diagram for a recognizer that recognizes one or more exclamation marks:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

The simplest way to catenate recognizers is to put all their states together in one big diagram, and create an ε-transition between the accepting states for the first recognizer, and the start state of the second. The start state of the first recognizer becomes the start state of the result, and the accepting states of the second recognizer become the accepting state of the result.

But if we try to put them together in one diagram we have a problem:

<div class="mermaid">
  graph TD
    empty(empty)-->r
    r-->re
    re-->reg
    reg-->empty2[empty]
    empty2-->suffix(suffix)
    suffix-->suffix
</div>

We can't have two separate states with the same name. So before we catenate the two recognizers, we have to find any states they have in common, and rename them to avoid collisions. In this case, we have to transform the second recognizer into:

<div class="mermaid">
  stateDiagram
    [*]-->empty2
    empty2-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

And now we can connect the two recognizers with ε-transitions between the first recognizer's accepting states, and the second recognizer's start stae:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->r : r,R
    r-->re : e,E
    re-->reg : g,G
    reg-->empty2
    empty2-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

This works like a charm, and we could code this algorithm up for our actual descriptions. However, our `automate` function doesn't permit ε-transitions. We could add that as a feature, but before we do that, let's look at an algorithm for removing ε-transitions from finite-state machines.

---

### removing epsilon-transitions

To remove an ε-transition between any two states, we start by taking all the transitions in the destination state, and copy them into the origin state. Next, if the destination state is an accepting state, we make the origin state an accepting state as well.

We then can remove the ε-transition without changing the recognizer's behaviour. In our catenated recognizer, we have an ε-transition between the `reg` and `empty2` states:

<div class="mermaid">
  stateDiagram
    reg-->empty2
    empty2-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

The `empty2` state has one transition, from `empty2` to `bang` while consuming `!`. If we copy that into `reg`, we get:

<div class="mermaid">
  stateDiagram
    reg-->bang : !
    empty2-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

Since `empty2` is not an accepting state, we do not need to make `reg` an accepting state, so we are done removing this ε-transition. We repeat this process for all ε-transitions, in any order we like, until there are no more ε-transitions. In this case, there only was one, so the result is:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->r : r,R
    r-->re : e,E
    re-->reg : g,G
    reg-->bang : !
    empty2-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

This is clearly a recognizer that recognizes the name "reg" followed by one or more exclamation marks. Our catenation algorithm has two steps. In the first, we create a recognizer with ε-transitions:

1. Rename any states in the second recognizer to avoid conflicts with names of states in the first recognizer.
2. Connect the two recognizers with an ε-transition from each accepting state from the first recognizer to the start state from the second recognizer.
3. The start state of the first recognizer becomes the start state of the catenated recognizers.
4. The accepting states of the second recognizer become the accepting states of the catenated recognizers.

This transformation complete, we can then remove the ε-transitions. For each ε-transition between an origin and destination state:

1. Copy all of the transitions from the destination state into the origin state.
2. If the destination state is an accepting state, make the origin state an accepting state as well.
3. Remove the ε-transition.

(Following this process, we sometimes wind up with unreachable states. In our example above, `empty2` becomes unreachable after removing the ε-transition. This has no effect on the behaviour of the recognizer, and in the next section, we'll see how to prune those unreachable states.)

---

### implementing catenation

Here's some code to resolve conflicts between the state names of two recognizers:

```javascript
// given a mapping of individual names, renames all the states in
// an fas, including the start and accepting. any names not in the map
// rename unchanged
function renameStates (nameMap, { start, accepting, transitions }) {
  const translate =
    before =>
      nameMap.has(before) ? nameMap.get(before) : before;

  return {
    start: translate(start),
    accepting: accepting.map(translate),
    transitions:
    	transitions.map(
      	({ from, consume, to }) => {
          const transition = { from: translate(from), to: translate(to || from) };
          if (consume != null) transition.consume = consume;

          return transition;
        }
      )
  };
}

const allStates =
  ({ start, transitions }) => {
    const stateSet = toStateSet(transitions);
    stateSet.add(start);
    return stateSet;
  };

function resolveConflictsWithNames (conflictingStates, description) {
  const conflictingStatesSet = new Set(conflictingStates);
  const descriptionStatesSet = allStates(description);

  const nameMap = new Map();

  // build the map to resolve overlaps with reserved names
  for (const descriptionState of descriptionStatesSet) {
    const match = /^(.*)-(\d+)$/.exec(descriptionState);
    let base = match == null ? descriptionState : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = descriptionState;
    while (conflictingStatesSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== descriptionState) {
  		nameMap.set(descriptionState, resolved);
    }
    conflictingStatesSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, description);
}

// given an iterable of names that are reserved,
// renames any states in a name so that they no longer
// overlap with reserved names
function resolveConflicts (first, second) {
  return resolveConflictsWithNames(allStates(first), second);
}
```

Let's make sure it works:

```javascript
const reg = {
  "start": "empty",
  "accepting": ["reg"],
  "transitions": [
    { "from": "empty", "consume": "r", "to": "r" },
    { "from": "empty", "consume": "R", "to": "r" },
    { "from": "r", "consume": "e", "to": "re" },
    { "from": "r", "consume": "E", "to": "re" },
    { "from": "re", "consume": "g", "to": "reg" },
    { "from": "re", "consume": "G", "to": "reg" }
  ]
};

const exclamations = {
  "start": "empty",
  "accepting": ["bang"],
  "transitions": [
    { "from": "empty", "consume": "!", "to": "bang" },
    { "from": "bang", "consume": "!", "to": "bang" },
  ]
}

resolveConflicts(reg, exclamations)
  //=>
    {
      "start": "empty2",
      "accepting": [ "bang" ],
      "transitions": [
        { "from": "empty2", "to": "bang", "consume": "!" },
        { "from": "bang", "to": "bang", "consume": "!" }
      ]
    }
```

With this, we can write a function to join the two recognizers with ε-transitions:

```javascript
function epsilonCatenate (first, second) {
  const unconflictedSecond =  resolveConflicts(first, second);

  const joinTransitions =
    first.accepting.map(
      from => ({ from, to: unconflictedSecond.start })
    );

  return {
    start: first.start,
    accepting: unconflictedSecond.accepting,
    transitions:
      first.transitions
        .concat(joinTransitions)
        .concat(unconflictedSecond.transitions)
  };
}

epsilonCatenate(reg, exclamations)
  //=>
    {
      "start": "empty",
      "accepting": [ "bang" ],
      "transitions": [
        { "from": "empty", "consume": "r", "to": "r" },
        { "from": "empty", "consume": "R", "to": "r" },
        { "from": "r", "consume": "e", "to": "re" },
        { "from": "r", "consume": "E", "to": "re" },
        { "from": "re", "consume": "g", "to": "reg" },
        { "from": "re", "consume": "G", "to": "reg" },
        { "from": "reg", "to": "empty2" },
        { "from": "empty2", "to": "bang", "consume": "!" },
        { "from": "bang", "to": "bang", "consume": "!" }
      ]
    }
```

And then a function to remove ε-transitions. Its a little busier than we might expect from our simple examples, but it has to handle cases such resolving chains of epsilons and detecting loops:

```javascript
function removeEpsilonTransitions ({ start, accepting, transitions }) {
  const acceptingSet = new Set(accepting);
  const transitionsWithoutEpsilon =
    transitions
      .filter(({ consume }) => consume != null);
  const stateMapWithoutEpsilon = toStateMap(transitionsWithoutEpsilon);
  const epsilonMap =
    transitions
      .filter(({ consume }) => consume == null)
      .reduce(
          (acc, { from, to }) => {
            const toStates = acc.has(from) ? acc.get(from) : new Set();

            toStates.add(to);
            acc.set(from, toStates);
            return acc;
          },
          new Map()
        );

  const epsilonQueue = [...epsilonMap.entries()];
  const epsilonFromStatesSet = new Set(epsilonMap.keys());

  const outerBoundsOnNumberOfRemovals = transitions.length;
  let loops = 0;

  while (epsilonQueue.length > 0 && loops++ <= outerBoundsOnNumberOfRemovals) {
    let [epsilonFrom, epsilonToSet] = epsilonQueue.shift();
    const allEpsilonToStates = [...epsilonToSet];

    // special case: We can ignore self-epsilon transitions (e.g. a-->a)
    const epsilonToStates = allEpsilonToStates.filter(
      toState => toState !== epsilonFrom
    );

    // we defer resolving destinations that have epsilon transitions
    const deferredEpsilonToStates = epsilonToStates.filter(s => epsilonFromStatesSet.has(s));
    if (deferredEpsilonToStates.length > 0) {
      // defer them
      epsilonQueue.push([epsilonFrom, deferredEpsilonToStates]);
    } else {
      // if nothing to defer, remove this from the set
      epsilonFromStatesSet.delete(epsilonFrom);
    }

    // we can immediately resolve destinations that themselves don't have epsilon transitions
    const immediateEpsilonToStates = epsilonToStates.filter(s => !epsilonFromStatesSet.has(s));
    for (const epsilonTo of immediateEpsilonToStates) {
      const source =
        stateMapWithoutEpsilon.get(epsilonTo) || [];
      const potentialToMove =
        source.map(
          ({ consume, to }) => ({ from: epsilonFrom, consume, to })
        );
      const existingTransitions = stateMapWithoutEpsilon.get(epsilonFrom) || [];

      // filter out duplicates
      const needToMove = potentialToMove.filter(
        ({ consume: pConsume, to: pTo }) =>
          !existingTransitions.some(
            ({ consume: eConsume, to: eTo }) => pConsume === eConsume && pTo === eTo
          )
      );
      // now add the moved transitions
      stateMapWithoutEpsilon.set(epsilonFrom, existingTransitions.concat(needToMove));

      // special case!
      if (acceptingSet.has(epsilonTo)) {
        acceptingSet.add(epsilonFrom);
      }
    }
  }

  if (loops > outerBoundsOnNumberOfRemovals) {
    error("Attempted to remove too many epsilon transitions. Investigate possible loop.");
  } else {
    return {
      start,
      accepting: [...acceptingSet],
      transitions: [
        ...stateMapWithoutEpsilon.values()
      ].flatMap( tt => tt )
    };
  }
}

removeEpsilonTransitions(epsilonCatenate(reg, exclamations))
  //=>
    {
      "start": "empty",
      "accepting": [ "bang" ],
      "transitions": [
        { "from": "empty", "consume": "r", "to": "r" },
        { "from": "empty", "consume": "R", "to": "r" },
        { "from": "r", "consume": "e", "to": "re" },
        { "from": "r", "consume": "E", "to": "re" },
        { "from": "re", "consume": "g", "to": "reg" },
        { "from": "re", "consume": "G", "to": "reg" },
        { "from": "empty2", "to": "bang", "consume": "!" },
        { "from": "bang", "to": "bang", "consume": "!" },
        { "from": "reg", "consume": "!", "to": "bang" }
      ]
    }
```

We have now implemented catenating two deterministic finite recognizers.

---

### unreachable states

Our "epsilon join/remove epsilons" technique has a small drawback: It can create an unreachable state when the starting state of the second recognizer is not the destination of any other transitions.

Consider:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zero : 0
    zero --> [*]
</div>

And:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->one : 1
    one --> [*]
</div>

When we join them and remove transitions, we end up with an unreachable state, `empty-2`:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zero : 0
    zero --> one : 1
    empty2-->one : 1
    one --> [*]
</div>

We could implement a very specific fix, but the code to do a general elimination of unreachable states is straightforward:

```javascript
function reachableFromStart ({ start, accepting: allAccepting, transitions: allTransitions }) {
  const stateMap = toStateMap(allTransitions, true);
  const reachableMap = new Map();
  const R = new Set([start]);

  while (R.size > 0) {
    const [state] = [...R];
    R.delete(state);
    const transitions = stateMap.get(state) || [];

    // this state is reachable
    reachableMap.set(state, transitions);

    const reachableFromThisState =
      transitions.map(({ to }) => to);

    const unprocessedReachableFromThisState =
      reachableFromThisState
        .filter(to => !reachableMap.has(to) && !R.has(to));

    for (const reachableState of unprocessedReachableFromThisState) {
      R.add(reachableState);
    }
  }

  const transitions = [...reachableMap.values()].flatMap(tt => tt);

  // prune unreachable states from the accepting set
  const reachableStates = new Set(
    [start].concat(
      transitions.map(({ to }) => to)
    )
  );

  const accepting = allAccepting.filter( state => reachableStates.has(state) );

  return {
    start,
    transitions,
    accepting
  };
}
```

And we can test it out:

```javascript
const zero = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "0", "to": "zero" }
  ],
  "accepting": ["zero"]
};

const one = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "1", "to": "one" }
  ],
  "accepting": ["one"]
};

reachableFromStart(removeEpsilonTransitions(epsilonCatenate(zero, one)))
  //=>
    {
      "start":"empty",
      "transitions":[
        {"from":"empty","consume":"0","to":"zero"},
        {"from":"zero","consume":"1","to":"one"}
      ],
      "accepting":["one"]
    }
```

No unreachable states!

---

### the catch with catenation

Consider this recognizer that recognizes one or more `0`s:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zeroes : 0
    zeroes--> zeroes : 0
    zeroes --> [*]
</div>

And consider this recognizer that recognizes a binary number:

<div class="mermaid">
  stateDiagram
    [*] --> empty
    empty --> zero : 0
    empty --> notZero : 1
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

What happens when we use our functions to catenate them?

```javascript
const zeroes = {
  "start": "empty",
  "accepting": [ "zeroes" ],
  "transitions": [
    { "from": "empty", "consume": "0", "to": "zeroes" },
    { "from": "zeroes", "consume": "0", "to": "zeroes" }
  ]
};

const binary = {
  "start": "empty",
  "accepting": ["zero", "notZero"],
  "transitions": [
    { "from": "empty", "consume": "0", "to": "zero" },
    { "from": "empty", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ]
}

reachableFromStart(removeEpsilonTransitions(epsilonCatenate(zeroes, binary)))
  //=>
    {
      "start": "empty",
      "accepting": [ "zero", "notZero" ],
      "transitions": [
        { "from": "empty", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "zero" },
        { "from": "zeroes", "consume": "1", "to": "notZero" },
        { "from": "start", "to": "zero", "consume": "0" },
        { "from": "start", "to": "notZero", "consume": "1" },
        { "from": "notZero", "to": "notZero", "consume": "0" },
        { "from": "notZero", "to": "notZero", "consume": "1" }
      ]
    }
```

And here's a diagram of the result:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zeroes : 0
    zeroes-->zeroes : 0
    zeroes-->zero : 0
    zeroes-->notZero : 1
    notZero-->notZero : 0
    notZero-->notZero : 1
    zero-->[*]
    notZero-->[*]
</div>

The problem is that there are two transitions from `zeroes` when consuming a `0`. That makes this transition _nondeterministic_. Deterministic state machines always have exactly one possible transition from any state for each symbol consumed in that state.

We want to catenate two deterministic finite-state recognizers, and wind up with a finite-state recognizer. To do that, we'll need a way to convert nondeterministic finite-state recognizers into deterministic finite-state recognizers.

---

## Converting Nondeterministic to Deterministic Finite-State Recognizers

As noted, our procedure for joining two recognizers with ε-transitions can create nondeterministic finite-state automata ("NFAs"). We wish to convert these NFAs to deterministic finite-state automata ("DFAs") so that we end up with a catenation algorithm that can take any two DFA recognizers and return a DFA recognizer for the catenation of the recognizers' languages.

We have already solved a subset of this problem, in a way. Consider the problem of taking the union of two recognizers. We did this with the product of the two recognizers. The way "product" worked was that it modelled two recognizers being in two different states at a time by creating new states that represented the pair of states each recognizer could be in.

We can use this approach with NFAs as well.

---

### taking the product of a recognizer... with itself

Recall that for computing the union of two recognizers, when we wanted to simulate two recognizers acting in parallel on the same input, we imagined that there was a state for every pair of states the two recognizers could be simultaneously in. This approach was called taking the *product* of the two recognizers.

Now let's imagine running a nondeterministic state machine in parallel with itself. It would start with just one copy of itself, like this:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zeroes : 0
    zeroes-->zeroes : 0
    zeroes-->zero : 0
    zeroes-->notZero : 1
    notZero-->notZero : 0
    notZero-->notZero : 1
    zero-->[*]
    notZero-->[*]
</div>

It could operate as a single machine as long as every transition it took would be deterministic. For example, it could consume the empty string and halt, that would be deterministic. Same for the string `0` and all strings beginning with `01...`.

But what would happen when it consumed the string `00`? the first `0` would take it from state `'empty'` to `'zeroes'`, but the second `0` is nondeterministic: It should transition to both `'zero'` and back to `'zeroes'`.

If we had a second parallel state machine, we could have one transition to `'zero'` while the other transitions back to `'zeroes'`. From our implementation of `product`, we know how to hadle this: we need a new state representing the two machines simultaneously being in states `'zero'` and `'zeroes'`, the tuple `('zero', 'zeroes')`.

Using similar logic as we used with `product`, we can work out that from our new tuple state, we need to draw in all the transitions from either of its states. In this case, that's ridiculously easy, since `'zero'` doesn't have any outbound transitions, so `('zero', 'zeroes')` would have the same transitions as `'zeroes'`.

Now this is a very simple example. What is the **worst** case for using an algorithm like this?

Well, given a state machine with _n_ states, there could be a state for every possible subset of states. Consider this pathological example with three states:

<div class="mermaid">
  stateDiagram
    [*]-->one
    one-->two : 1
    one-->three : 2
    two-->one : 3
    two-->two : 3
    two-->one : 4
    two-->three : 4
    two-->two : 5
    two-->three : 5
    three-->one : 6
    three-->two : 6
    three-->three : 6
    three-->[*]
</div>

If we work our way through it by hand, we see that we need seven states to represent all the possible subsets of states this recognizer can reach: `('one'), ('two'), ('three'), ('one', 'two'), ('one', 'three'), ('two', 'three'), ('one', 'two', 'three')`.

The set of all possible subsets of a set is called the [powerset] of a set. The powerset of a set includes the empty set and the set itself. Our diagram and list do not include the empty set, because that represents the machine halting, so it is an _implied_ state of the machine.

[powerset]: https://en.wikipedia.org/wiki/Power_set

We can also work out all the transitions just as we did with `product`. It ends up as this plate of spaghetti:

<div class="mermaid">
  stateDiagram
    [*]-->one
    one-->two : 1
    one-->three : 2
    two-->onetwo : 3
    two-->onethree : 4
    two-->twothree : 5
    three-->onetwothree : 6
    onetwo-->two : 1
    onetwo-->three : 2
    onetwo-->onetwo : 3
    onetwo-->onethree : 4
    onetwo-->twothree : 5
    onethree-->two : 1
    onethree-->three : 2
    onethree-->onetwothree : 6
    twothree-->onetwo : 3
    twothree-->onethree : 4
    twothree-->twothree : 5
    twothree-->onetwothree : 6
    three-->[*]
    onethree-->[*]
    twothree-->[*]
    onetwothree-->[*]
</div>

But while we may call it the "worst case" as far as the number of states is concerned, it is now a deterministic state machine that has the exact same semantics as its nondeterministic predecessor. Furthermore, although it appears to be much more complicated at a glance, the truth is that it is merely making the complexity apparent. It's actually easier to follow along by hand, since we don't have to keep as many as three simultaneous states in our heads at any one time.

---

### computing the powerset of a nondeterministic finite-state recognizer

Using this approach, our algorithm for computing the powerset of a nondeterministic finite-state recognizer will use queue of states.

We begin by placing the start state in the queue, and then:

1. If the queue is empty, we're done.
2. Remove the state from the front of the queue, call it "this state."
3. If this state is already in the powerset recognizer, discard it and go back to step 1.
4. If this is the name of a single state in the nondeterministic finite-state recognizer:
   1. Collect the transitions from this state.
   2. If the state is an accepting state in the nondeterministic finite-state recognizer, add this state to the powerset recognizer's accepting states.
5. If this is the name of several states in the nondeterministic finite-state recognizer:
   1. collect the transitions from each of these states.
   2. If any of the states is an accepting state in the nondeterministic finite-state recognizer, add this state to the powerset recognizer's accepting states.
5. For each deterministic transition from this state (i.e. there is only one transition for a particular symbol from this state):
  1. Add the transition to the powerset recognizer.
  2. Add the destination set to the queue.
6. For each nondeterministic transition from this state (i.e. there is more than one transition for a particular symbol from this state):
  1. Collect the set of destination states for this symbol from this state.
  2. Create a name for the set of destination states.
  3. Create a transition from this state to the name for the set of destination states.
  4. Add the transition to the powerset recognizer.
  5. Add the name for the set of destination states to the queue.

We can encode this as a function, `powerset`. The source code is [here](/assets/supplementa/fsa/07-powerset-and-catenation.js). We can try it:

```javascript
const zeroes = {
  "start": 'empty',
  "accepting": ['zeroes'],
  "transitions": [
    { "from": 'empty', "consume": '0', "to": 'zeroes' },
    { "from": 'zeroes', "consume": '0', "to": 'zeroes' }
  ]
};

const binary = {
  "start": "empty",
  "accepting": ["zero", "notZero"],
  "transitions": [
    { "from": "empty", "consume": "0", "to": "zero" },
    { "from": "empty", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ]
}

const nondeterministic =
  reachableFromStart(removeEpsilonTransitions(epsilonCatenate(zeroes, binary)));

nondeterministic
  //=>
    {
      "start": "empty",
      "accepting": [ "zero", "notZero" ],
      "transitions": [
        { "from": "empty", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "zero" },
        { "from": "zeroes", "consume": "1", "to": "notZero" },
        { "from": "notZero", "to": "notZero", "consume": "0" },
        { "from": "notZero", "to": "notZero", "consume": "1" }
      ]
    }

const deterministic = powerset(nondeterministic);

deterministic
  //=>
    {
      "start": "(empty)",
      "accepting": [ "(zero)(zeroes)", "(notZero)" ],
      "transitions": [
        { "from": "(empty)", "consume": "0", "to": "(zeroes)" },
        { "from": "(zeroes)", "consume": "0", "to": "(zero)(zeroes)" },
        { "from": "(zeroes)", "consume": "1", "to": "(notZero)" },
        { "from": "(zero)(zeroes)", "consume": "0", "to": "(zero)(zeroes)" },
        { "from": "(zero)(zeroes)", "consume": "1", "to": "(notZero)" },
        { "from": "(notZero)", "consume": "0", "to": "(notZero)" },
        { "from": "(notZero)", "consume": "1", "to": "(notZero)" }
      ]
    }
```

The `powerset` function converts any nondeterministic finite-state recognizer into a deterministic finite-state recognizer.

---

### catenation without the catch, and an observation

Computing the catenation of any two deterministic finite-state recognizers is thus:

```javascript
function catenation2 (a, b) {
  return powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonCatenate(a, b)
      )
    )
  );
}

verify(catenation2(zeroes, binary), {
  '': false,
  '0': false,
  '1': false,
  '00': true,
  '01': true,
  '10': false,
  '11': false,
  '000': true,
  '001': true,
  '010': true,
  '011': true,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});
  //=> All 15 tests passing
```

And this allows us to draw an important conclusion: *The set of deterministic finite-state recognizers is closed under catenation*, meaning that given two finite-state recognizers, we can always construct a finite-state recognizer representing the catenation of the two recognizers.

We earlier showed the same thing for union and intersection, so we now know that we can compose recognizers using union, intersection, and catenation at will.

From this we can also deduce that although we only wrote functions to take the union, intersection, or catenation of two deterministic finite-state recognizers, we can take the union, intersection, or catenation of more than two recognizers and always end up with another deterministic finite-state recognizers.

---

### from powerset to union

Now that we have `powerset`, another formulation of `union2` becomes easy. Once again, our two recognizers:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zeroes : 0
    zeroes--> zeroes : 0
    zeroes --> [*]
</div>

<div class="mermaid">
  stateDiagram
    [*]-->empty2
    empty2-->zero : 0
    empty2-->notZero : 1
    notZero-->notZero : 0,1
    zero-->[*]
    notZero-->[*]
</div>

When formulating `union2` the first time, we imagined them running side-by-side. Then we took their `product` because a deterministic finite-state recognizer cannot do two things at once. But a _nondeterministic_ finite-state recognizer _can_ do two things at once. So consider this approach:

By forking the start, we can run both recognizers at once. We'd need to simulate the fork by creating a new start state, something like this:

<div class="mermaid">
  stateDiagram
    [*]-->fork_start
    fork_start-->empty
    empty-->zeroes : 0
    zeroes--> zeroes : 0
    zeroes --> [*]
    fork_start-->empty2
    empty2-->zero : 0
    empty2-->notZero : 1
    notZero-->notZero : 0,1
    zero-->[*]
    notZero-->[*]
</div>

This is a nondeterministic finite-state recognizer that is the union of our two deterministic finite-state recognizers. If we had a function that could take any two recognizers and return a nondeterministic finite-state recognizer, we could then use `powerset` to turn it back into a deterministic finite-state recognizer.

Here's `epsilonUnion`:

```javascript
function avoidReservedNames (reservedStates, second) {
  const reservedStateSet = new Set(reservedStates);
  const { stateSet: secondStatesSet } = validatedAndProcessed(second);

  const nameMap = new Map();

  // build the map to resolve overlaps with reserved names
  for (const secondState of secondStatesSet) {
    const match = /^(.*)-(\d+)$/.exec(secondState);
    let base = match == null ? secondState : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = secondState;
    while (reservedStateSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== secondState) {
  		nameMap.set(secondState, resolved);
    }
    reservedStateSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, second);
}

function epsilonUnion (first, second) {
  const newStartState = 'empty';
  const cleanFirst = avoidReservedNames([newStartState], first);
  const cleanSecond = resolveConflicts(cleanFirst, avoidReservedNames([newStartState], second));

  const concurrencyTransitions = [
    { "from": newStartState, "to": cleanFirst.start },
    { "from": newStartState, "to": cleanSecond.start },
  ];

  return {
    start: newStartState,
    accepting: cleanFirst.accepting.concat(cleanSecond.accepting),
    transitions:
      concurrencyTransitions
    	.concat(cleanFirst.transitions)
        .concat(cleanSecond.transitions)
  };
}
```

We could use it to build `union2p` from `powerset` much as we built `catenation2` with `powerset`:

```javascript
function union2p (first, second) {
  return powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonUnion(first, second)
      )
    )
  );
}

verify(union2p(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});
  //=> All 7 tests passing
```

---

### solving the fan-out problem

[Recall](#products-fan-out-problem) that when we take the union of two recognizers, we often end up with equivalent states, especially equivalent accepting states.

For example:

```javascript
const A = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "A", "to": "recognized" }
  ],
  "accepting": ["recognized"]
};

const a = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "a", "to": "recognized" }
  ],
  "accepting": ["recognized"]
};

union2p(A, a)
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "A", "to": "recognized" },
        { "from": "empty", "consume": "a", "to": "recognized-2" }
      ],
      "accepting": ["recognized", "recognized-2"]
    }
```

`union2p(A, a)` has two equivalent accepting states, `recognized` and `recognized-2`. This would be a minor distraction, but consider:

```javascript
catenation2(union2p(A, a), union2p(A, a), union2p(A, a));
  //=>
    {
      "start": "empty",
      "accepting": [ "recognized-5", "recognized-6" ],
      "transitions": [
        { "from": "empty", "consume": "A", "to": "recognized" },
        { "from": "empty", "consume": "a", "to": "recognized-2" },
        { "from": "recognized", "consume": "A", "to": "recognized-3" },
        { "from": "recognized", "consume": "a", "to": "recognized-4" },
        { "from": "recognized-2", "consume": "A", "to": "recognized-3" },
        { "from": "recognized-2", "consume": "a", "to": "recognized-4" },
        { "from": "recognized-3", "consume": "A", "to": "recognized-5" },
        { "from": "recognized-3", "consume": "a", "to": "recognized-6" },
        { "from": "recognized-4", "consume": "A", "to": "recognized-5" },
        { "from": "recognized-4", "consume": "a", "to": "recognized-6" }
      ]
    }
```

The extra accepting states cause additional duplication with every recognizer catenated together. This can get very expensive, very quickly.

As discussed [above](#products-fan-out-problem), what we want to do is merge equivalent states. Here's one function that repeatedly merges states until there are no more mergeable states:

```javascript
const keyS =
  (transitions, accepting) => {
    const stringifiedTransitions =
      transitions
        .map(({ consume, to }) => `${consume}-->${to}`)
        .sort()
        .join(', ');
    const acceptingSuffix = accepting ? '-->*' : '';

    return `[${stringifiedTransitions}]${acceptingSuffix}`;
  };

function mergeEquivalentStates (description) {
  searchForDuplicate: while (true) {
    let {
      start,
      transitions: allTransitions,
      accepting,
      states,
      stateMap,
      acceptingSet
    } = validatedAndProcessed(description);

    const statesByKey = new Map();

    for (const state of states) {
      const stateTransitions = stateMap.get(state) || [];
      const isAccepting = acceptingSet.has(state);
      const key = keyS(stateTransitions, isAccepting);

      if (statesByKey.has(key)) {
        // found a dup!
        const originalState = statesByKey.get(key);

      	console.log({ state, originalState, isAccepting })

        if (start === state) {
          // point start to original
          start = originalState;
        }

        // remove duplicate's transitions
        allTransitions = allTransitions.filter(
          ({ from }) => from !== state
        );

        // rewire all former incoming transitions
        allTransitions = allTransitions.map(
          ({ from, consume, to }) => ({
            from, consume, to: (to === state ? originalState : to)
          })
        );

        if (isAccepting) {
          // remove state from accepting
          accepting = accepting.filter(s => s !== state)
        }

        // reset description
        description = { start, transitions: allTransitions, accepting };

        // and then start all over again
        continue searchForDuplicate;
      } else {
        statesByKey.set(key, state);
      }
    }
    // no duplicates found
    break;
  }

  return description;
}
```

Armed with this, we can enhance our `union2p` function:

```javascript
function union2pm (first, second) {
  return mergeEquivalentStates(
    powerset(
      reachableFromStart(
        removeEpsilonTransitions(
          epsilonUnion(first, second)
        )
      )
    )
  );
}

verify(union2pm(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});
  //=> All 7 tests passing
```

And now:

```javascript
union2pm(A, a)
  //=>
    {
      "start": "empty"
      "transitions": [
        { "from": "empty", "consume": "A", "to": "recognized" },
        { "from": "empty", "consume": "a", "to": "recognized" }
      ],
      "accepting": [ "recognized" ],
    }

catenation2(union2pm(A, a), union2pm(A, a), union2pm(A, a));
  //=>
    {
      "start": "empty"
      "transitions": [
        { "from": "empty", "consume": "A", "to": "recognized" },
        { "from": "empty", "consume": "a", "to": "recognized" },
        { "from": "recognized", "consume": "A", "to": "recognized-2" },
        { "from": "recognized", "consume": "a", "to": "recognized-2" },
        { "from": "recognized-2", "consume": "A", "to": "recognized-3" },
        { "from": "recognized-2", "consume": "a", "to": "recognized-3" }
      ],
      "accepting": [ "recognized-3" ],
    }
```

Our enhanced `union2pm` creates the minimum number of transitions and states, and thanks to merging the equivalent accepting states, the number of states and transitions in catenated recognizers grows only linearly.

---

### the final union, intersection, and catenation

Here are our `union`, `intersection`, and `catenation` functions, updated to take one or more arguments and using everything we have so far:

```javascript
function union (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = mergeEquivalentStates(union2pm(a, b));

  return union(ab, ...rest);
}

function intersection (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = mergeEquivalentStates(intersection2(a, b));

  return intersection(ab, ...rest);
}

function catenation (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = mergeEquivalentStates(catenation2(a, b));

  return catenation(ab, ...rest);
}

verify(union(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});
  //=> All 7 tests passing

verify(intersection(reg, uppercase), {
  '': false,
  'r': false,
  'R': false,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
})
  //=> All 7 tests passing

verify(catenation(zeroes, binary), {
  '': false,
  '0': false,
  '1': false,
  '00': true,
  '01': true,
  '10': false,
  '11': false,
  '000': true,
  '001': true,
  '010': true,
  '011': true,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});
  //=> All 15 tests passing
```

---

## Decorating Recognizers

In programming jargon, a *decorator* is a function that takes an argument—such as a function, method, or object—and returns a new version of that object which has been transformed to provide new or changed functionality, while still retaining something of its original character.

For example, `negation` is a function that decorates a boolean function by negating its result:

```javascript
const negation =
  fn =>
    (...args) => !fn(...args);

const weekdays = new Set(['M', 'Tu', 'W', 'Th', 'F']);

const isWeekday = day => weekdays.has(day);
const isntWeekday = negation(isWeekday);

[isWeekday('Su'), isWeekday('M'), isntWeekday('Su'), isntWeekday('M')]
  //=>
    [false, true, true, false]
```

A decorator for functions takes a function as an argument and returns returns a new function with some relationship to the original function's semantics. A decorator for finite-state recognizers takes the description of a finite-state recognizer and returns as its argument a new finite-state recognizer with some relationship to the original finite-state recognizer's semantics.

We'll start with the "Kleene Star."

---

### kleene*

Our `union`, `catenation`, and `intersection` functions can compose any two recognizers, and they are extremely useful. `union` and `catenation` are particularly interesting to us, because they implement—in JavaScript—two of the three operations that regular expressons provide: `union(a, b)` is equivalent to `a|b` in a regular expression, and `catenation(a, b)` is equivalent to `ab` in a regular expression.

There's another operation on recognizers that regular expressions provide, the [kleene*]. In a regular expression, `a*` is an expression that matches whatever `a` matches, zero or more times in succession.

[kleene*]: https://en.wikipedia.org/wiki/Kleene_star.

We'll build a JavaScript decorator for the `kleene*` step-by-step, starting with handling the "zero or one" case. Consider this recognizer:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->recognized : " "
    recognized-->[*]
</div>

It recognizes exactly one space. Let's start by making it recognize zero or one spaces. It's easy, we just make its start state an accepting state:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->recognized : " "
    empty-->[*]
    recognized-->[*]
</div>

In practice we might have a recognizer that loops back to its start state, and the above transformation will not work correctly. So what we'll do is add a new start state, and provide an epsilon transition to the original start state.

With some renaming, it will look like this:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->empty2
    empty-->[*]
    empty2-->recognized : " "
    recognized-->[*]
</div>

After removing epsilon transitions and unreachable states and so on, we end up back where we started:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->recognized : " "
    empty-->[*]
    recognized-->[*]
</div>

But although we won't show it here, we can handle those cases where there is already a loop back to the start state.

Now what about handling one or more sentences that the argument recognizes? Our strategy will be to take a recognizer, and then add epsilon transitions between its accepting states and its start state. In effect, we will create "loops" back to the start state from all accepting states.

For example, if we have:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->recognized : A, a
    recognized-->[*]
</div>

We will turn it into this to handle the zero case:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->empty2
    empty-->[*]
    empty2-->recognized : A, a
    recognized-->[*]
</div>

And then we will turn it into this to handle the one or more cases:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->empty2
    empty-->[*]
    empty2-->recognized : A, a
    recognized-->empty
    recognized-->[*]
</div>

This will produce some non-determinism, so we'll remove the epsilon transitions, take the powerset of the result, remove equivalent states, and remove unreachable states:

<div class="mermaid">
  stateDiagram
    [*]-->recognized
    recognized-->recognized : A, a
    recognized-->[*]
</div>

Presto, a loop! Here's the full code:

```javascript
function kleeneStar (description) {
  const newStart = "empty";

  const {
    start: oldStart,
    transitions: oldTransitions,
    accepting: oldAccepting
  } = avoidReservedNames([newStart], description);

  const optionalBefore = {
    start: newStart,
    transitions:
      [ { "from": newStart, "to": oldStart } ].concat(oldTransitions),
    accepting: oldAccepting.concat([newStart])
  };

  const optional = reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          optionalBefore
        )
      )
    )
  );

  const {
    start: optionalStart,
    transitions: optionalTransitions,
    accepting: optionalAccepting
  } = optional;

  const loopedBefore = {
    start: optionalStart,
    transitions:
      optionalTransitions.concat(
        optionalAccepting.map(
          state => ({ from: state, to: optionalStart })
        )
      ),
    accepting: optionalAccepting
  };

  const looped = reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          loopedBefore
        )
      )
    )
  );

  return looped;
}

const Aa = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "A", "to": "Aa" },
    { "from": "empty", "consume": "a", "to": "Aa" }
  ],
  "accepting": ["Aa"]
};

kleeneStar(Aa)
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "A", "to": "empty" },
        { "from": "empty", "consume": "a", "to": "empty" }
      ],
      "accepting": ["empty"]
    }

verify(kleeneStar(Aa), {
  '': true,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 9 tests passing
```

---

### kleene+

As noted, formal regular expressions include the `kleene*`. Regexen have an affordance for `kleene*` as well, and—just like formal refgular expressions—it's the `*` postfix operator:

```javascript
verify(/^x*$/, {
  '': true,
  'x': true,
  'xx': true,
  'xxx': true,
  'xyz': false
});
  //=> All 5 tests passing

verify(/^[Aa]*$/, {
  '': true,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 9 tests passing
```

Regexen have a postfix `*` character to represent `kleene*`. But they also support a postfix `+` to represent the `kleene+` decorator that takes a recognizer as an argument, and returns a recognizer that matches sentences consisting of _one_ or more sentences its argument recognizes:

```javascript
verify(/^[Aa]+$/, {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 9 tests passing
```

We can make `kleene+` using the tools we already have:

```javascript
function kleenePlus (description) {
  return catenation(description, kleeneStar(description));
}

kleenePlus(Aa)
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "a", "to": "recognized" },
        { "from": "empty", "consume": "A", "to": "recognized" },
        { "from": "recognized", "consume": "a", "to": "recognized" },
        { "from": "recognized", "consume": "A", "to": "recognized" }
      ],
      "accepting": [ "recognized" ]
    }

verify(kleenePlus(any('Aa')), {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 9 tests passing
```

Formal regular expressions don't normally include the `kleene+`, because given catenation and `kleene*`, `kleene+` is not necessary. When proving things about formal languages, working with the minimum set of entities makes everything easier. But fo course, proactical programming is all about defining convenient things our of necessarry things, and that is why regexen provide the `kleene+`.

---

## The set of finite-state recognizers is closed under various operations

To summarize what we have accomplished so far:

We wrote what we might call _finite-state recognizer combinators_, functions that take one or more finite-state recognizers as arguments, and return a finite-state recognizer. The combinators we've written so far implement the operations `union`, `catenation`, `intersection`, `kleene*`, and `kleene+`.

There is a set of all finite-state recognizers, and a corresponding set of all descriptions of finite-state recognizers. Each one of our combinators takes one or more members of the set of all descriptions of finite-state recognizers and returns a member of the set of all descriptions of finite-state recognizers.

When wwe have a set, and an operation on members of that set always returns a member of that set, we say that "The set is closed under that operation." We can thus say that the set of all descriptions of finite-state recognizers is closed under the operation of applying the `union`, `catenation`, `intersection`, `kleeneStar`, and `kleenePlus` functions we've written.

And by induction, we can then say that the set of languages that finite-state recognizers can recognize is closed under the operations `union`, `catenation`, `intersection`, `kleene*`, and `kleene+`.

This property of "languages that finite-state recognizers can recognize being closed under the operations `union`, `catenation`, `intersection`, `kleene*`, and `kleene+`" will come in very handy beloww when we show that for every formal regular expressionm, there is an equivalent finite-state recognizer.

But all we've talked about are combinators, operations that build finite-state recognizers out of finite-state recognizers. What about building finite-state recognizers from nothing at all?

---

# Building Blocks

What is the absolutely minimal recognizer? One might think, "A recognizer for empty strings," and as we will see, such a recognizer is useful. But there is an even more minimal recogner than that. The recognizer that recognizes empty strings recognizes a language with only one sentence in it.

But what is the language with no sentences whatsoever? This language is often called the _empty set_, and in mathematical notation it is denoted with `∅`. If we want to make tools for building finite-state recognizers, we'll need a way to build a recognizer for the empty set.

We'll just boldly declare it as a constant:

```javascript
const EMPTY_SET = {
  "start": "empty",
  "transitions": [],
  "accepting": []
};

verify(EMPTY_SET, {
  '': false,
  '0': false,
  '1': false
});x
  //=> All 3 tests passing
```

With `EMPTY_SET` out of the way, we'll turn our attention to more practical recognizers, those that recognize actual sentences of symbols.

What's the simplest possible language that contains sentences? A language containing only one sentence. Such languages include `{ 'balderdash' }`, `{ 'billingsgate' }`, and even `{ 'bafflegab' }`.

Of all the one-sentence languages, the simplest would be the language containing the shortest possible string, `''`. We will also declare this as a constant:

```javascript
const EMPTY_STRING = {
  "start": "empty",
  "transitions": [],
  "accepting": ["empty"]
};

verify(EMPTY_STRING, {
  '': true,
  '0': false,
  '1': false
});
  //=> All 3 tests passing
```

`EMPTY_SET` and `EMPTY_STRING` are both **essential**, even if we use them somewhat infrequently. We can now move on to build more complex recognizers with functions.

---

### recognizing strings

What makes recognizers really useful is recognizing non-empty strings of one kind or another. This use case is so common, regexen are designed to make recognizing strings the easiest thing to write. For example, to recognize the string `abc`, we write `/^abc$/`:

```javascript
verify(/^abc$/, {
  '': false,
  'a': false,
  'ab': false,
  'abc': true,
  '_abc': false,
  '_abc_': false,
  'abc_': false
})
  //=> All 7 tests passing
```

Here's an example of a recognizer that recognizes a single zero:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->recognized : 0
    recognized-->[*]
</div>

We could assign this to a constant, and then make a constant for every other symbol we might want to use in a recognizer, but this would be tedious. Instead, here's a function that makes recognizers that recognize "just one" symbol:

```javascript
function just1 (symbol) {
  return {
    "start": "empty",
    "transitions": [
      { "from": "empty", "consume": symbol, "to": "recognized" }
    ],
    "accepting": ["recognized"]
  };
}

verify(just1('0'), {
  '': false,
  '0': true,
  '1': false,
  '01': false,
  '10': false,
  '11': false
});
  //=> All 6 tests passing
```

Armed with `EMPTY_STRING` and `just1`, we can use catenation to make recognizers for any string we might want. So let's add `just1` to our collection of essential building blocks for recognizing symbols.

```javascript
const reginald = catenation(
  just1('r'),
  just1('e'),
  just1('g'),
  just1('i'),
  just1('n'),
  just1('a'),
  just1('l'),
  just1('d')
);

verify(reginald, {
  '': false,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': true,
  'reginaldus': false
});
  //=> All 6 tests passing
```

Even though we don't need anything else to build recognizers for strings and symbols, our tools exist for our convenience, so it's ok to make "inessential" tools that simplify our lives and make our code easier to read.

Let's make `just`, a version of `just1` that is convenient to use:

```javascript
const EMPTY = {
  "start": "empty",
  "transitions": [],
  "accepting": ["empty"]
};

function just (str = "") {
  const recognizers = str.split('').map(just1);

  return catenation(...recognizers);
}

verify(just('r'), {
  '': false,
  'r': true,
  'reg': false,
  'reggie': false,
  'reginald': false,
  'reginaldus': false
});
  //=> All 6 tests passing

verify(just('reginald'), {
  '': false,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': true,
  'reginaldus': false
});
  //=> All 6 tests passing
```

The improved `just` generates a recognizer that recognizes whatever string you give it, including the empty string. And it's almost exactly like using regexen to recognize strings:

```javascript
verify(/^reginald$/, {
  '': false,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': true,
  'reginaldus': false
});
  //=> All 6 tests passing
```

---

### recognizing symbols

As we know from the implementation, `just` takes a string, and generating the `catenation` of recognizers for the symbols in the string. What else could we do with the recognizers for the symbols in a string?

We could take their `intersection`, but unless there was only one symbol, that wouldn't help. What about taking their union?

```javascript
function any (str = "") {
  const recognizers = str.split('').map(just1);

  return union(...recognizers);
}

verify(any('r'), {
  '': false,
  'r': true,
  'reg': false
});
  //=> All 3 tests passing

const capitalArrReg = catenation(any('Rr'), just('eg'));

verify(capitalArrReg, {
  '': false,
  'r': false,
  'R': false,
  'reg': true,
  'Reg': true,
  'REG': false,
  'Reginald': false
});
  //=> All 7 tests passing
```

`any` generates a recognizer that recognizes any of the symbols in the strings we pass it. This is extremely useful, and regexen have an affordance for easily recognizing one of a set of symbols, `[]`. If we want to represent, say, the letter `x`, `y`, or `z`, we can write `/^[xyz]$/`, and this will recognize a single `x`, a single `y`, or a single `z`. There are some other useful affordances, such as `[a-z]` matching any letter from `a` through `z` inclusively, but at its most basic level, `/^[xyz]$/` works just like `any('xyz)`:

```javascript
verify(/^[xyz]$/, {
  '': false,
  'x': true,
  'y': true,
  'z': true,
  'xyz': false
});
  //=> All 5 tests passing
```

Before we move on to decorators, let's think about another regexen feature. One of the affordances of regexen is that we can use a `.` to represent any character, any character at all:

```javascript
verify(/^.$/, {
  '': false,
  'a': true,
  'b': true,
  'x': true,
  'y': true,
  'xyz': false
});
  //=> All 6 tests passing
```

This is easy to implement when writing a regex engine, but there's no such capability in a standard finite-state machine. What we can do, with complete disregard for the size of the finite-state recognizers we create, is _emulate_ the `.` by supplying a string containing every character we care about:

```javascript
const ALPHANUMERIC =
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '1234567890';

const dot = any(ALPHANUMERIC);

const rSomethingG = catenation(any('Rr'), dot, any('Gg'));

verify(rSomethingG, {
  '': false,
  'r': false,
  're': false,
  'Reg': true,
  'Rog': true,
  'RYG': true,
  'Rej': false
});
  //=> All 7 tests passing

```

`any` is very useful, but since we can always write things like `union(just1('a'), just1('b')... )`, we know that `any` is another inessential-but-useful tool.

---

### none

As we saw, regexen have an affordance for recognizing any of a set of symbols, `[]`. For example, `/^[xyz]$/` matches an `x`, `y`, or `z`. Regexen's `[]` also have another affordance: If we write `/^[^xyz]$/`, this matches any single character *except* an `x`, `y`, or `z`:

```javascript
verify(/^[^xyz]$/, {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'x': false,
  'y': false,
  'z': false,
  'abc': false,
  'xyz': false
});
  //=> All nine test passing
```

Two observations of note: First, in regexen, `^` sometimes means "anchor this expression at the beginning of the string," and it sometimes means "match any character except these."[^inertia] Second, `[^xyz]` matches just a single character that is not an `x`, `y`, or `z`, so `/^[^xyz]$/` does not match the string `'abc'`.

[^inertia]: Using one operator to mean two completely unrelated things is now understood to be a poor design practice, but in programming languages, old ideas have an enormous amount of inertia. Most of our programming languages seem to be rooted in the paradigm of encoding programs on 80 column punch cards.

Here's a modification of our `any` inessential, but useful tool:

```javascript
function none (alphabet, string) {
  const exclusionSet = new Set([...string.split('')]);
  const inclusionList = alphabet.split('').filter(c => !exclusionSet.has(c));
  const inclusionString = inclusionList.join('');

  return any(inclusionString);
}

verify(none(ALPHANUMERIC, 'xyz'), {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'x': false,
  'y': false,
  'z': false,
  'abc': false,
  'xyz': false
});
  //=> All 9 tests passing
```

`none` will be especially handy for building a recognizer that recognizes descriptions of recognizers. For example, one of the earliest programming languages to incorporate string pattern matching was [SNOBOL]. Like JavaScript, string literals could be delimited with single or double quotes, but there was no syntax for "escaping" quotes.

[SNOBOL]: http://www.snobol4.org

So if you wanted a string literal containing a single quote, you'd delimit it with double quotes:

```
doubleQuotedString = "This string's delimiters are double quotes"
```

And if you wanted a string literal containing double quotes, you'd delimit it with single quotes:

```
singleQuotedString = 'For so-called "scare quotes," modern culture is to use ✌🏽peace emoji✌🏽.'
```

JavaScript works like this today, although it also adds escape characters. But sticking to SNOBOL-style string literals for the moment, we can implement a recognizer for string literals with `none`:

```javascript
const SYMBOLIC = `~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`;
const WHITESPACE = ` \r\n\t`;
const EVERYTHING = ALPHANUMERIC + SYMBOLIC + WHITESPACE;
const sQuote = just("'");
const dQuote = just('"');

const sQuotedString = catenation(
  sQuote,
  kleeneStar(none(EVERYTHING, "'")),
  sQuote
);

const dQuotedString = catenation(
  dQuote,
  kleeneStar(none(EVERYTHING, '"')),
  dQuote
);

const stringLiteral = union(
  sQuotedString,
  dQuotedString
);

verify(stringLiteral, {
  [``]: false,
  [`'`]: false,
  [`"`]: false,
  [`''`]: true,
  [`""`]: true,
  [`"""`]: false,
  [`""""`]: false,
  [`"Hello, recognizer"`]: true
});
```

`none` may be "inessential," but `none` is certainly handy.

---

## For every formal regular expression, there is an equivalent finite-state recognizer

Let us consider `union`, `catenation`, `kleene*`, `EMPTY_SET`, `EMPTY_STRING`, and `just1` for a moment. These have a one-to-one correspondance with the operations in formal regular expressions. And in fact, it's pretty easy to translate any formal regular expression into an equivalent JavaScript expression using our functions and constants.

For example:

- `∅` becomes `EMPTY_SET`
- `0` (or any single character) becomes `just1('0')`
- `a|b` (or any two expresions) becomes `union(a, b)`
- `xyz` (or any string of characters) becomes `catenation(just('x'), just('y'), just('z'))`
- `a*` (or any expresion followed by an `*`) becomes `kleeneStar(just1('a'))`

The parentheses in JavaScript work just like the parentheses in formal regular expressions, so by carefully following the above rules, we can turn any arbitrary formal regular expression into a JavaScript expression.

For example, the formal regular expression `0|(1(0|1)*)` becomes:

```javascript
const binary2 = union(just1('0'), catenation(just1('1'), kleeneStar(union(just('0'), just('1')))));

binary2
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "0", "to": "recognized" },
        { "from": "empty", "consume": "1", "to": "recognized-2" },
        { "from": "recognized-2", "to": "recognized-2", "consume": "0" },
        { "from": "recognized-2", "to": "recognized-2", "consume": "1" }
      ],
      "accepting": [ "recognized", "recognized-2" ]
    }

verify(binary2, {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true,
  '10100011011000001010011100101110111': true
});
  //=> All 16 tests passing
```

And the formal expression `reg(ε|inald)` becomes:

```javascript
const regMaybeInald = catenation(
  just('r'),
  just('e'),
  just('g'),
  union(
    EMPTY_STRING,
    catenation(
      just('i'),
      just('n'),
      just('a'),
      just('l'),
      just('d')
    )
  )
);

regMaybeInald
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "r", "to": "recognized" },
        { "from": "recognized", "consume": "e", "to": "recognized-2" },
        { "from": "recognized-2", "consume": "g", "to": "recognized-3" },
        { "from": "recognized-3", "consume": "i", "to": "recognized-4" },
        { "from": "recognized-4", "to": "recognized-5", "consume": "n" },
        { "from": "recognized-5", "to": "recognized-6", "consume": "a" },
        { "from": "recognized-6", "to": "recognized-7", "consume": "l" },
        { "from": "recognized-7", "to": "recognized-8", "consume": "d" }
      ],
      "accepting": [ "recognized-8", "recognized-3" ]
    }

verify(regMaybeInald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});
  //=> All 6 tests passing
```

Given that we can express any formal regular expression as a JavaScript expression that generates an equivalent finite-state recognizer, we have a demonstration that for every formal regular expression, there is an equivalent finite-state recognizer.

But our emphasis is on algorithms a computer can execute, so let's write an algorithm that does exactly that.

---

### the shunting yard algorithm

The [Shunting Yard Algorithm] is a method for parsing mathematical expressions specified in infix notation with parentheses. As we implement it here, it will produce a postfix (a/k/a "Reverse Polish) notation without parentheses. The shunting yard algorithm was invented by Edsger Dijkstra and named the "shunting yard" algorithm because its operation resembles that of a railroad shunting yard.

[Shunting Yard Algorithm]: https://en.wikipedia.org/wiki/Shunting-yard_algorithm

The shunting yard algorithm is stack-based. Infix expressions are the form of mathematical notation most people are used to, for instance `3 + 4` or `3 + 4 × (2 − 1)`. For the conversion there are two lists, the input and the output. There is also a stack that holds operators not yet added to the output queue. To convert, the program reads each symbol in order and does something based on that symbol. The result for the above examples would be (in Reverse Polish notation) `3 4 +` and `3 4 2 1 − × +`, respectively.

![The Shunting Yard Algorithm © Salix alba](/assets/images/fsa/Shunting_yard.svg.png)

Our first iteration of a shunting yard algorithm makes two important simplifying assumptions. The first is that it does not handle parentheses. The second is that it does not catanate adjacent expressions, it uses a `+` symbol to represent catenation:

```javascript
const operatorToPrecedence = new Map(
  Object.entries({
    '|': 1,
    '+': 2,
    '*': 3
  })
);

function peek (stack) {
  return stack[stack.length - 1];
}

function shuntingYardVersion1 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];

  for (const symbol of input) {
    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
    } else {
      outputQueue.push(symbol);
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

shuntingYardVersion1('a+b*|a*+b')
  //=> ["a", "b", "*", "+", "a", "*", "b", "+", "|"]
```

Now we'll add an adjustment so that we don't need to explicitly include `+` for catenation. What we'll do is keep track of whether we are awaiting a value. If we are, then values get pushed directly to the output queue as usual. But if we aren't awaiting a value, then we implicitly add the `+` operator:

```javascript
function shuntingYardVersion2 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let justPushedValue = false;

  while (input.length > 0) {
    const symbol = input.shift();

    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      justPushedValue = false;
    } else if (justPushedValue){
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      justPushedValue = false;
    } else {
      outputQueue.push(symbol);
      justPushedValue = true;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

shuntingYardVersion2('ab*|a*b')
  //=> ["a", "b", "*", "+", "a", "*", "b", "+", "|"]
```

Finally, we add support for parentheses. If we encounter a left parentheses, we push it on the operator stack. When we encounter a right parentheses, we clear the operator stack onto the output queue up to the topmost left parentheses. With respect to implicit catenation, parenetheses act like values:

```javascript
function shuntingYardVersion3 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStack = operatorStack.pop();

        outputQueue.push(topOfOperatorStack);
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

shuntingYardVersion3('a+(b*|a*)+b')
  //=> ["a", "b", "*", "a", "*", "|", "b", "+", "+"]

shuntingYardVersion3('((a|b)(c|d))')
  //=> [["a", "b", "|", "c", "d", "|", "+"]
```

Our `shuntingYard3` algorithm returns a version of the formal regular expression, but in reverse-polish notation. Now we have actually left something incredibly important things out of this algorithm. They aren't strictly necessary to demonstrate that for every formal regular expression, there is an equivalent finite-state recognizer, but still. We'll fix that omission and clean up a few of the data structures we used so that everything is unified and ready to write an interpreter:

```javascript
const operators = new Map(
  Object.entries({
    '|': { symbol: Symbol('|'), precedence: 1, arity: 2, fn: union },
    '+': { symbol: Symbol('+'), precedence: 2, arity: 2, fn: catenation },
    '*': { symbol: Symbol('*'), precedence: 3, arity: 1, fn: kleeneStar }
  })
);

function isBinaryOperator (symbol) {
  return operators.has(symbol) && operators.get(symbol).arity === 2;
}

function shuntingYard (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '\\') {
      if (input.length === 0) {
        error('Escape character has nothing to follow');
      } else {
        const valueSymbol = input.shift();

        // treat this new symbol as a value,
        // no matter what
        if (awaitingValue) {
          // push the string value of the valueSYmbol

          outputQueue.push(valueSymbol);
          awaitingValue = false;
        } else {
          // implicit catenation

          input.unshift(valueSymbol);
          input.unshift('\\');
          input.unshift('+');
          awaitingValue = false;
        }

      }
    } else if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStack = operatorStack.pop();

        outputQueue.push(operators.get(topOfOperatorStack).symbol);
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (operators.has(symbol)) {
      const precedence = operators.get(symbol).precedence;

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStackPrecedence = operators.get(peek(operatorStack)).precedence;

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(operators.get(topOfOperatorStack).symbol);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = isBinaryOperator(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(operators.get(topOfOperatorStack).symbol);
  }

  return outputQueue;
}
```

Now we push JavaScript Symbols for operators, and we can "escape" characters like `()\+|*` in our expressions:

```javascript
shuntingYard('((a|b)(c|d))')
  //=> ["a", "b", Symbol(|), "c", "d", Symbol(|), Symbol(+)]

shuntingYard('\\(\\*|\\)')
  //=> ["(", "*", Symbol(+), ")", Symbol(|)]
```

### generating finite-state recognizers

We're ready to compile the reverse-polish notation into a description, using our implementations of `just1`, `union`, `catenation`, and `kleene*`. We'll do it with a stack-based interpreter:

```javascript
const symbols = new Map(
  [...operators.entries()].map(
    ([key, { symbol, arity, fn }]) => [symbol, { arity, fn }]
  )
);

function rpnToDescription (rpn) {
  if (rpn.length === 0) {
    return EMPTY_SET;
  } else {
    const stack = [];

    for (const element of rpn) {
      if (element === '∅') {
        stack.push(EMPTY_SET);
      } else if (element === 'ε') {
        stack.push(EMPTY_STRING);
      } else if (typeof element === 'string') {
        stack.push(just1(element));
      } else if (symbols.has(element)) {
        const { arity, fn } = symbols.get(element);

        if (stack.length < arity) {
          error(`Not emough values on the stack to use ${element}`)
        } else {
          const args = [];

          for (let counter = 0; counter < arity; ++counter) {
            args.unshift(stack.pop());
          }

          stack.push(fn.apply(null, args))
        }
      } else {
        error(`Don't know what to do with ${element}'`)
      }
    }
    if (stack.length != 1) {
      error(`should only be one value to return, but there were ${stack.length}`);
    } else {
      return stack[0];
    }
  }
}

function toFiniteStateRecognizer (formalRegularExpression) {
  return rpnToDescription(shuntingYard(formalRegularExpression));
}

toFiniteStateRecognizer('0|(1(0|1)*)')
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "0", "to": "recognized" },
        { "from": "empty", "consume": "1", "to": "recognized-2" },
        { "from": "recognized-2", "to": "recognized-2", "consume": "0" },
        { "from": "recognized-2", "to": "recognized-2", "consume": "1" }
      ],
      "accepting": [ "recognized", "recognized-2" ]
    }
```

And we can validate that our recognizers work as expected:

```javascript
verify(toFiniteStateRecognizer(''), {
  '': false,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('ε'), {
  '': true,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0*'), {
  '': true,
  '0': true,
  '1': false,
  '00': true,
  '01': false,
  '10': false,
  '11': false,
  '000': true,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0|(1(0|1)*)'), {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true
});
```

This demonstrates that for every formal regular expression, there exists an equivalent finite-state recognizer.

---

### the significance of generating finite-state recognizers from regular expressions

Given that we know that for every formal regular expression, there is at least one finite-state recognizer that recognizes the same langauge as the regular expression, we know that finite-state recognizers are at least as powerful as formal regular expressions.

But there are some proactical implications as well. We've already shown that for every finite-state recignizer, there exists an equivalent deterministic finite-state recignizer, and have an algorithm --`powerset`--that returns a deterministic finite-state recignizer given any finite-state recognizer.

Deterministic finite-state recognizers are fast: They trade space for time, executing in O_n_ time. And although they take up more space for their descriptions, by not engaging in backtracking or parallel execution, they generate fewer temporary entities. We haven't attempted to optimize for pure speed, but finite-state recognizers can be written to be blazingly fast. They can even be compiled down to languages like JavaScript, C++, or even assembler.

Being able to "compile" formal regular expressions into finite-sate recognizers points the way towards approaches for writing very fast pattern-matching engines.

---

# Notes