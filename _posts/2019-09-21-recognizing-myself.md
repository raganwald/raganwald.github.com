---
title: "Computing Machines that Recognize Themselves, Part I: Finite-state automata"
tags: [recursion,allonge,mermaid,noindex]
---

# Prelude

(If you wish to skip the prelude, you can jump directly to the [Table of Contents](#table-of-contents))

---

### before we get started, a brief recapitulation of the previous essay

In [A Brutal Look at Balanced Parentheses...][brutal], we began with a well-known programming puzzle: _Write a function that determines whether a string of parentheses is "balanced," i.e. each opening parenthesis has a corresponding closing parenthesis, and the parentheses are properly nested._

[brutal]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html

In pursuing the solution to this problem, we constructed machines that could recognize "sentences" in languages. We saw that some languages can be recognized with Finite-State Automata. Languages that require a finite-state automaton to recognize them are _regular languages_.

We also saw that balanced parentheses required a more powerful recognizer, a Deterministic Pushdown Automaton. Languages that require a deterministic pushdown automaton to recognize them are _deterministic context-free languages_.

We then went a step further and considered the palindrome problem, and saw that there were languages--like palindromes with a vocabulary of two or more symbols--that could not be recognized with Deterministic Pushdown Automata, and we needed to construct a [Pushdown Automaton] to recognize palindromes. Languages that require a pushdown automaton to recognize them are _context-free languages_.

[Pushdown Automaton]: https://en.wikipedia.org/wiki/Pushdown_automaton

We implemented pushdown automata using a classes-with-methods approach, the complete code is [here][pushdown.oop.es6].

[pushdown.oop.es6]: https://gist.github.com/raganwald/41ae26b93243405136b786298bafe8e9#file-pushdown-oop-es6

The takeaway from [A Brutal Look at Balanced Parentheses...][brutal] was that languages could be classified according to the power of the ideal machine needed to recognize it, and we explored example languages that needed finite-state automata, deterministic pushdown automata, and pushdown automata respectively.[^tm]

[^tm]: [a Brutal Look at Balanced Parentheses, ...][Brutal] did not explore two other classes of languages. The fourth class of formal languages require a Turing machine to recognize their sentences, because Turing machines are more powerful than pushdown automata. In fact, Turing machines can compute anything that can be computed. And there is a fifth class of formal languages. languages that cannot be recognized by Turing machines, and therefore cannot be recognized at all! Famously, the latter class includes a language that describes Turing machines, and only includes those descriptions that are of Turing machines that halt.

---

### recognizers that recognize themselves

In casual programming conversation, a [Regular Expression], or *regex* (plural "regexen"),[^regex] is a sequence of characters that define a search pattern. They can also be used to validate that a string has a particular form. For example, `/ab*c/` is a regex that matches an `a`, zero or more `b`s, and then a `c`, anywhere in a string.

[Regular Expression]: https://en.wikipedia.org/wiki/Regular_expression

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

Regexen are more than just descriptions of machines that recognize sentences in languages: *Regexen are themselves sentences in a language*. Thus, inevitably, a single thought crosses the mind of nearly every programmer working with regexen:

> Is it possible to write a regex that recognizes a valid regex?

It is easy to write a function that recognizes valid regex given any regex engine: Give the engine the regex, and see if it returns an error. That is practical, but unsatisfying. All it tells us is that a Turing Machine can be devised to recognize regexen. But not all flavours of regexen are as powerful as Turing Machines.

It is far more interesting to ask if a machine defined by a particular flavour of regex can recognize valid examples of that particular flavour for regexen. Regexen were originally called "regular expressions," because they could recognize regular languges. Regular languages could be recognized by finite-state automata, thus the original regexen described finite-state automata.

But just because a flavour of regex only describes finite-state automata, does not mean that descriptions of those regexen can be recognized by finite-state automata. Consider, for example, a flavour of regex that permits characters (such as `a`, `b`, `c`, ..., `x`, `y`, `z`), the wildcard operator `.`, the zero-or more operator `*`, and non-capturing groups `(?: ... )`. Here's an example of such a regex:

```
/(?:<(?:ab*c)>)+/
```

As we will see in this essay, the above regex can most certainly be implemented by a finite-state automaton, meaning that we can write a finite-state automaton that recognizes all the same sentences of symbols that this regex recognizes. In fact, any regex written with this flavour (characters, wildcards, zero-or more operator, and non-capturing groups) can be implemented with a finite-state automaton.

But what if we want to recognize regexen like this? meaning, we want to write a finite-state automation that can recognize regexen of this flavour, not what the regexen recognize?

---

### the problem with regexen recognizing themselves

There is a problem: This flavour of regexen can contain parentheses, and these parentheses have to be balanced. Recalling [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata][brutal], we discovered that finite-state automata cannot recognize sentences that contain parentheses that must be balanced. That requires a pushdown automaton, a state machine that has a stack.

So, every language a regexen of this flavour can recognize, can be recognized with a finite-state automaton, and the language of writing this flavour regexen cannot be recognized with a finite-state automaton. From this we can deduce that no regexen of this flavour can recognize regexen of this flavour.

Why? Consider the proposition that there _is_ a regex of this flavour (characters, wildcards, zero-or-more, and non-capturing groups) that recognizes regexen of this flavour. Since any regex of this flavour can be implemented with a finite-state automaton, it follows that there is a finite-state automaton that recognizes regexen of this flavour.

However, we provide in [A Brutal Look at Balanced Parentheses...][brutal] that no finite-state automaton can recognize languages containing balanced parentheses, so the proposition leads directly to a contradiction. Hence, the proposition that there is a regex of this flavour that recognizes regexen of this flavour, is false.

This leads us to a few questions:

1. What features must a flavour of regexen have, such that it can recognize itself?
2. How much power must such a flavour of regexen have? We know that if the flavour includes balanced parentheses, it must at least be equivalent to the power of a deterministic pushdown automaton. But might it require a non-deterministic pushdown automaton? Or a Turing machine?

These questions are deep enough that exploring their answers will prod us to learn a lot more about finite-state automata, composition, and building tools for ourselves.

---

### terminology

In this essay will will play a little loose with terminology. We are concerned with [finite state machines][fsa], also called *finite-state automata*. Finite-state automata can do a lot of things. They can recognize sentences in a language, which is our interest here. Finite-state automata that recognize statements in a language are also called _finite-state recognizers_.

Finite-state automata can also do thing that are not of interest to our essay today. A finite-state recognizer recognizes whether a sentence is a sentence in a language. A finite-state automaton can also be devised that not only recognizes whether a sentence is in a language, but also recognizes whether it belongs to one or more distinct subsets of statements in a language. Such automata are called _classifiers_, and a recognizer is the degenerate case of a classifier that only recognizes one subset.

(Other automata can generate strings, transform strings, and so forth. These are also not of interest to us here.)

Now that we have established that finite-state automata can do much more than "just" recognize statements in languages, we will continue on for the rest of the essay using the terms "finite-state automaton," "finite state machine," and "finite-state recognizer" interchangeably.

[fsa]: https://en.wikipedia.org/wiki/Finite-state_machine

---

# [Table of Contents](#table-of-contents)

### [Prelude](#prelude)

  - [before we get started, a brief recapitulation of the previous essay](#before-we-get-started-a-brief-recapitulation-of-the-previous-essay)
  - [recognizers that recognize themselves](#recognizers-that-recognize-themselves)
  - [the problem with regexen recognizing themselves](#the-problem-with-regexen-recognizing-themselves)
  - [terminology](#terminology)

### [The Problem Statement](#the-problem-statement-1)

  - [a language for describing finite-state recognizers](#a-language-for-describing-finite-state-recognizers)
  - [implementing our example recognizer](#implementing-our-example-recognizer)
  - [a more specific problem statement](#a-more-specific-problem-statement)

### [Composeable Recognizers](#composeable-recognizers-1)

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

### [Building Blocks and Decorators](#building-blocks-and-decorators-1)

  - [recognizing strings](#recognizing-strings)
  - [recognizing symbols](#recognizing-symbols)
  - [decorating finite-state recognizers]](#decorating-finite-state-recognizers)
  - [kleene* (and kleene+)](#kleene-and-kleene)
  - [optional](#optional)
  - [complementation](#complementation)

---

# The Problem Statement

The problem of "flavours of regexen that can recognize themselves" is interesting, but getting there from zero is difficulty without presupposing a lot of knowledge. We like to learn (or re-learn) things for ourselves, in a hands-on way, so in this essay we will tackle a much smaller version of this problem:

> Can a finite-state automaton recognize valid finite-state automata?

We'll need to be a bit more specific. Finite-state automata can do a lot of things. Some finite-state automata recognize statements in languages, where the statements consist of ordered and finite collections of symbols. We will call these **finite-state recognizers**, and we are only concerned with finite-state recognizers in this essay.

Thus, we will not—of course—ask whether a finite-state automaton can be hooked up to cameras and recognize whether a physical scene contains a physical state machine. We also will not ask whether a finite-state automaton can recognize a `.png` encoding of a diagram, and recognize whether it is a diagram of a valid finite state state machine:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> one : 1
    one --> one : 0, 1
    zero --> [*]
    one --> [*]
</div>

Instead, we will formulate a language for describing finite-state recognizers, and ask whether a finite-state recognizer can be devised to recognize valid statements in the language that describes finite-state recognizers. If we can make such a recognizer, we will have shown that in at least one sense, a finite-state recognizer can recognize finite-state recognizers.

That is not, of course, the exact same thing as asking whether a regex can recognize a valid regex. Regexen are a language of their own, and it is possible that a regular expression might be more powerful than a finite-state recognizer, and it is equally possible (certain, in fact) that the language used to describe a regex cannot be parsed with finite-state recognizers.[^cannot-parse]

[^cannot-parse]: How certain? Well, all regular expression languages in wide usage have the ability to create *groups* using parentheses, e.g. `/Reg(?:inald)?/` is a regular expression containing an optional non-capturing group. Groups in regex can be nested, and must be properly nested and balanced for a regex to be valid. We know from [A Brutal Look at Balanced Parentheses...][brutal] that we cannot recognize balanced (or even nested) parentheses with just a finite-state recognizer, so therefore we cannot recognize valid regexen with a finite-state recognizer.

But we'll start with devising a finite-state recognizer that recognizes syntactically valid descriptions of finite-state recognizers, and see where that takes us.

### a language for describing finite-state recognizers

Before we can write finite-state recognizers that recognize syntactically valid descriptions of finite-state recognizers, we need a language for describing finite-state recognizers.

We don't need to invent a brand-new format, there is already an accepted [formal definition][fdfsa] for Pushdown Automata. Mind you, it involves mathematical symbols that are unfamiliar to some programmers, so without dumbing it down, we will create our own language that is equivalent to the full formal definition, but expressed in JSON.

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

### implementing our example recognizer

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

[^regexp]: `automate` can also take a JavaScript `RegExp` as an argument and return a recognizer function. This is not central to developing finite-sytate recognizers, but is sometimes useful when comparing JavaScript regexen to our recognizers.

Here we are using `automate` with our definition for recognizing binary numbers. We'll use the `verify` function throughout our exploration to build simple tests-by-example:

```javascript
function verify (description, tests) {
  try {
    const recognizer = automate(description);
    const testList = Object.entries(tests);
    const numberOfTests = testList.length;

    const outcomes = examples.entries().map(
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
      console.log(`${numberOfFailures} tests failing: ${failures.split('; ')}`);
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

We now have a function, `automate`, that takes a data description of a finite-state automaton/recognizer, and returns a Javascript recognizer function we can play with and verifys.

---

### a more specific problem statement

Given our language for describing finite-state recognizers, a more specific problem statement becomes:

> Using our description language, write a finite-state recognizer that recognizes valid descriptions of finite-state recognizers.

Armed with things like regular expressions, this is not difficult. Armed with finite-state automata, this is still not difficult, but it is exceedingly laborious. Finite-state automata live in the Turing Tar-Pit, a place where "Everything is possible, but nothing of interest is easy."[^ttp]

[^ttp]: Perlisisms—"Epigrams in Programming" by Alan Perlis http://www.cs.yale.edu/homes/perlis-alan/quotes.html

_Given a problem that takes an hour to solve, a programmer is a person who spends three days writing tooling so that the problem can be solved in half an hour._ We're programmers, so instead of grinding away trying to make a huge, monolithic finite-state recognizer by hand, we'll build some tooling to write the finite-state recognizer's description for us.

The simplest place to start is the foundation of all practical software development: **Composition**. If we have ways of breaking a problem down into smaller problems, solving the smaller problems, and then putting the parts back together, we can solve very, very big problems.

Composition is built into our brains: When we speak human languages, we use combinations of sounds to make words, and then we use combinations of words to make sentences, and so it goes building layer after layer until we have things like complete books.

We'll do that here. We will start by learning how to compose recognizers. If we can write small recognizers (such as "a quoted string"), and then compose them (using operations like union or catenation), it will be much easier to write a recognizer for valid descriptions of finite-state automata.

---

# Composeable Recognizers

Composeable recognizers and patterns are particularly interesting. Just as human languages are built by layers of composition, all sorts of mechanical languages are structured using composition. JSON is a perfect example: A JSON element like a list is composed of zero or more arbitrary JSON elements, which themselves could be lists, and so forth.

If we want to build a recognizer for recognizers, it would be ideal to build smaller recognizers for things like strings, and then use composition to build more complicated recognizers for elements like lists of strings, or "objects."

This is the motivation for the first part of our exploration: We want to make simple recognizers, and then use composition to make more complex recognizers from the simple recognizers.

We are going to implement three operations that compose two recognizers: _Union_, _Intersection_, and _Catenation_.

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
function productUnion (a, b) {
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
productUnion(a, b)
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
function productIntersection (a, b) {
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
verify(productUnion(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
})
  //=> All 7 tests passing

verify(productIntersection(reg, uppercase), {
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

This works like a charm, and we could code this algorithm up for our actual descriptions. However, our `automate` function doesn't permit ε-transitions. We could add that as a feature, but before we do that, let's look at an algorithm for removing ε-transitions from finite state machines.

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
  const unconflictedSecond =  resolveConflicts(fiinstanceof RegExptions =
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

We could implementa  very specific fix, but the code to do a general elimination of unreachable states is straightforward:


```javascript
function reachableFromStart ({ start, accepting, transitions: allTransitions }) {
  const stateMap = toStateMap(allTransitions, true);
  const reachableMap = new Map();
  const R = new Set([start]);

  while (R.size > 0) {
    const [state] = [...R];
    R.delete(state);
    const transitions = stateMap.get(state) || [];

    // this state is reacdhable
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

  return {
    start,
    accepting,
    transitions: [...reachableMap.values()].flatMap(tt => tt)
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

We can encode this as a function, `powerset`. The source code is [here](/assets/supplementa/fsa/07-powerset.js). We can try it:

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

verify(deterministic, {
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
})
  //=> All 15 tests passing
```

The `powerset` function converts any nondeterministic finite-state recognizer into a deterministic finite-state recognizer.

---

### catenation without the catch, and an observation

Computing the catenation of any two deterministic finite-state recognizers is thus:

```javascript
function catenation (first, second) {
  return powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonCatenate(first, second)
      )
    )
  );
}
```

And this allows us to draw an important conclusion: *The set of deterministic finite-state recognizers is closed under catenation*, meaning that given two finite-state recognizers, we can always construct a finite-state recognizer representing the catenation of the two recognizers.

We earlier showed the same thing for union and intersection, so we now know that we can compose recognizers using union, intersection, and catenation at will.

From this we can also deduce that although we only wrote functions to take the union, intersection, or catenation of two deterministic finite-state recognizers, we can take the union, intersection, or catenation of more than two recognizers and always end up with another deterministic finite-state recognizers.

---

### from powerset to union

Now that we have `powerset`, another formulation of `union` becomes easy. Once again, our two recognizers:

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

When formulating `union` the first time, we imagined them running side-by-side. Then we took their `product` because a deterministic finite-state recognizer cannot do two things at once. But a _nondeterministic_ finite-state recognizer _can_ do two things at once. So consider this approach:

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

And we use it to build `union` from `powerset` much as we built `catenation` with `powerset`:

```javascript
function union (first, second) {
  return powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonUnion(first, second)
      )
    )
  );
}
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

union(A, a)
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

`union(A, a)` has two equivalent accepting states, `recognized` and `recognized-2`. This would be a minor distraction, but consider:

```javascript
catenation(union(A, a), union(A, a), union(A, a));
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

Armed with this, we can enhance our `union` function:

```javascript
function union (first, second) {
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
```

And now:

```javascript
union(A, a)
  //=>
    {
      "start": "empty"
      "transitions": [
        { "from": "empty", "consume": "A", "to": "recognized" },
        { "from": "empty", "consume": "a", "to": "recognized" }
      ],
      "accepting": [ "recognized" ],
    }

catenation(union(A, a), union(A, a), union(A, a));
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

Our enhanced `union` creates the minimum number of transitions and states, and thanks to merging the equivalent accepting states, the number of states and transitions in catenated recognizers grows linearly.

---

### the final union, intersection, and catenation

Here are our `union`, `intersection`, and `catenation` functions, updated to take one or more arguments and using everything we have so far:

```javascript
function union (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab =
    mergeEquivalentStates(
      reachableFromStart(
        powerset(
          removeEpsilonTransitions(
            epsilonUnion(a, b)
          )
        )
      )
    );

  return union(ab, ...rest);
}

function intersection (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = mergeEquivalentStates(productIntersection(a, b));

  return intersection(ab, ...rest);
}

function catenation (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab =
    mergeEquivalentStates(
      powerset(
        reachableFromStart(
          removeEpsilonTransitions(
            epsilonCatenate(a, b)
          )
        )
      )
    );

  return catenation(ab, ...rest);
}
```

---

# Building Blocks and Decorators

To summarize what we have accomplished so far:

- We set ourselves the task of writing a finite-state recognizer that recognizes valid descriptions of finite-state recognizers.
- To break it down into manageable parts, we wrote functions that compose finite-state recognizers from other finite-state recognizers: We wrote `union`, `intersection`, and `catenation`.

This is very much like wanting to build a big lego set, and first figuring out how to click the blocks together. if we stopped here, we would have to custom-make every lego block we wish to use.

It's the same with recognizers. If we got to work on using `union`, `intersection`, and `catenation` to compose a finite-state recognizer that recognizes valid descriptions of finte state recognizers, we would have to hand-write lots of small recognizers that we could then lick together with `union`, `intersection`, and `catenation`.

That's a lot less work than writing a finite-state recognizer that recognizes valid descriptions of finte state recognizers from scratch, by hand, but we can make it even less work by building some tooling for creating small recognizers, and some more tooling for "decorating" recognizers.

Here we go.

---

### recognizing strings

What makes recognizers really useful is recognizing strings of one kind or another. This use case s so common, regexen are designed to make recognizimng strings the easiest thing to write. For example, to recognize the string `abc`, we write `/^abc$/`:

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

But before we work our way up to arbitrary strings, let's start with a recognizer for the simplest possible string, `''`, a/k/a "The Empty String." Our finite state recognizer looks like this:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->[*]
</div>

We can hard-code a description for this empty string recognizer:

```javascript
const EMPTY = {
  "start": "empty",
  "transitions": [],
  "accepting": ["empty"]
};

verify(EMPTY, {
  '': true,
  '0': false,
  '1': false,
  '01': false,
  '10': false
});
  //=> All 5 tests passing
```

What about non-empty strings? Here's an example of a recognizer that recognizes a single zero:

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

Armed with `EMPTY` and `just1`, we can use catenation to make recognizers for any string we might want. So let's think of `EMPTY` and `just1` as **essential** building blocks for recognizing symbols.

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

  return catenation(EMPTY, ...recognizers);
}

verify(just(''), {
  '': true,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': false,
  'reginaldus': false
});
  //=> All 6 tests passing

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
const FAIL = {
  "start": "failure",
  "transitions": [],
  "accepting": []
};

function any (str = "") {
  const recognizers = str.split('').map(just1);

  return union(FAIL, ...recognizers);
}

verify(any(), {
  '': false,
  'r': false,
  'reg': false
});
  //=> All 3 tests passing

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

`any` generates a recognizer that recognizes any of the symbols in the strings we pass it. And if none are supplied, it always fails. This is extremely useful, and regexen have an affordance for easily recognizing one of a set of symbols, `[]`. If we want to represent, say, the letter `x`, `y`, or `z`, we can write `[xyz]`, and this will recognize a single `x`, a single `y`, or a single `z`. There are some other useful affordances, such as `[a-z]` matching any letter from `a` through `z` inclusively, but at its most basic level, `[xyz]` works just like `any('xyz)`:

```javascript
verify(/^[xyz]$/, {
  '': false,
  'x': true,
  'y': true,
  'z': true,
  'xyz': false
});
  //=> All 5 tests passsing
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
  //=> All 6 tests passsing
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

And now we turn our attention to _decorating_ finite-state recognizers.

---

### decorating finite-state recognizers

In programming jargon, a decorator is a function that takes an argument—such as a function, method, or object—and returns a new version of that object which has been transformed to provide new or changed functionality, while still retaining something of its original character.

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

We'll start with an essential decorator, the "Kleene Star."

---

### kleene* (and kleene+)

Given `EMPTY`, `just1`, `union`, and `catenation`, we can make recognizers that recognize any language that contains a _finite_ set of sentences.[^wvrst-case]

[^wvrst-case]: If a language has a finite set of sentences, we can make a list of every sentence in the language, and then write a recognizer that uses `catenation` and `just1` (or equivalently, `just`) for each sentence in the language. Then we can take the union of all those recognziers, to get the recognizer for every sentence in the language.

But if we want to recognize languages that have an **infinite** number of sentences, we need to go beyond `EMPTY`, `just1`, `union`, and `catenation`.  We can't recognize all langauges that have an infinite number of sentences: We know that languages like "balanced parentheses" cannot be recognized with a finite-state automata.

But finite-state automata can recognize some languages containing an infinite number of sentences. We've seen some already, for example recognizing binary numbers:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

There are an infnite number of strings representing binary numbers, and this recognizer will recognize them all. The salient difference between this recognizer and the recognizers we can build with `EMPTY`, `just1`, `union`, and `catenation`, is that this recognizer has "loops" in it, whereas recognizerrs we build with `EMPTY`, `just1`, `union`, and `catenation` will not have any loops.

If a recognizer does not have any loops, the maximum number of sentences it can recognize will be equal to the number of states it has, and the maximum length of any sentence it recognizes will be the number of states it has, minus one.

So what we need is a way to make recognizers with loops. And that's exactly what the [kleene*](https://en.wikipedia.org/wiki/Kleene_star), or `kleeneStar` does: **`kleene*` is a decorator that takes a recognizer as an argument, and returns a recognizer that matches sentences consisting of zero or more sentences its argument recognizes**.

We'll build it step-by-step, starting with handling the "zero or one" case. Consider this recognizer:

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

In practice we might have a recognizer that has loops back to its start state, and the above transformation will not work correctly. So what we'll do is add a new start state, and provide an epsilon transition to the original start state.

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

Presto, a loop!

Here's the full code:

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

kleeneStar(any('Aa'))
  //=>
    {
      "start": "recognized",
      "transitions": [
        { "from": "recognized", "consume": "a", "to": "recognized" },
        { "from": "recognized", "consume": "A", "to": "recognized" }
      ],
      "accepting": [ "recognized" ]
    }

verify(kleeneStar(any('Aa')), {
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

`kleene*` is an **essential** decorator. We need it in order to make recognizers that recognize infinitely large languages. Naturally, regexen have an affordance for `kleene*`, it's the `*` postfix operator:

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

There are also inessential decorators, of course. For example regexen have a postfix `*` character to reprepresent `kleene*`. But they also support a postfix `+` to represent the `kleene+` decorator that takes a recognizer as an argument, and returns a recognizer that matches sentences consisting of _one_ or more sentences its argument recognizes:

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

We can make `kleene+` using the essentials we already have, so it is clearly inessential:

```javascript
function kleenePlus (description) {
  return catenation(description, kleeneStar(description));
}

kleenePlus(any('Aa'))
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

There is one more inessential decorator we can look at we can turn our attention back to complementation.

---

### optional

We've covered the decorators for regexen's `*` postfix operator (`kleene*`), and `+` operator (`kleene+`). Regexen also have a third postfix operator, `?`, that represents a decorator that takes a recognizer as an argument, and returns a recognizer that matches sentences consisting of _zero or one_ sentences its argument recognizes:

```javascript
verify(/^x?$/, {
  '': true,
  'x': true,
  'y': false,
  'xy': false,
  'wx': false,
  'xxx': false
});
  //=>  All 6 tests passing
```

We call this `optional`, and as we can build it out of essentials we have already defined, we know that it is inessential. But useful!

```javascript
const optional =
  recognizer => union(EMPTY, recognizer);

const regMaybeReginald = catenation(
  just('reg'),
  optional(just('inald'))
);

verify(regMaybeReginald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});
  //=> All 6 tests passing

```

`optional` decorates a recognizer by making it--well--"optional."

Now we'll look at `complementation`, a decorator that is inessential in a theoretical sense, but when we need it, extremely handy.

---

### complementation

We are going to write a very simple decorator that provides the _complementation_ or a recognizer.

What is the complementation of a recognizer? Recall `negation`:

```javascript
const negation =
  fn =>
    (...args) => !fn(...args);
```

`negation` takes a function as an argument, and returns a function that returns the negation of the argument's result. `complementation` does the same thing for recognizers.

What do recognizers do? They recognize sentences that belong to a language. Consider some recognizer `x` that recognizes whether a sentence belongs to some language `X`. The complementation of `x` would be a recognizer that recognizes sentences that do _not_ belong to `X`.

We'll start our work by considering this: Our recognizers fail to recognize a sentence if, when the input ends, they are not in an accepting state. There are two ways this could be true:

1. If the recognizer is in a state that is not an accepting state, or;
2. If the recognizer has halted.

Let's eliminate the second possibility.

Given a recognizer that halts for some input, can we make it never halt? The answer in theory is **no**, because there are an infinite number of symbols that might be passed to a recognizer, and there is no way for our recognizers to encode an infinite number of transitions, one for each possible symbol.

But in practice, we can say that given a recognizer `x`, and some alphabet `A`, we can return a version of `x` that never halts, _provided that every symbol in the input belongs to `A`_.

Our method is simply to create a state for `halted`, and make sure that every state the recognizer has--including the new `halted` state--has transitions to `halted` for any symbols belonging to `A`, but not already consumed.

For example, given the recognizer for binary numbers:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

Let's consider its behaviour whnen its input consists solely of symbols in the alphabet of numerals, `1234567890`. When the input it empty, it does not halt, it is in the `start` state. If the first symbol it reads is a `0` or `1`, it transitions to `zero` and `notZero` respectively. But if the input is one of `23456789`, it halts.

So the first thing to do is create a `halted` state and add transitions to that state from `start`:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    start-->halted : 2,3,4,5,6,7,8,9
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

Next, we turn our attention to state `zero`. When the recognizer is in this state, any numeral will cause it to halt, so we add transitions for that:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    start-->halted : 2,3,4,5,6,7,8,9
    zero-->halted : 1,2,3,4,5,6,7,8,9,0
    zero --> [*]
    notZero --> [*]
</div>

If the recognizer is in state `notZero`, only the numerals `23456789` it to halt, so we add transitions for those:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    start-->halted : 2,3,4,5,6,7,8,9
    zero-->halted : 1,2,3,4,5,6,7,8,9,0
    notZero-->halted : 2,3,4,5,6,7,8,9
    zero --> [*]
    notZero --> [*]
</div>

And finally, when the recognizer is in the new state `halted`, any numeral causes it to remain in the state halted, so we add transsitions for those:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    start-->halted : 2,3,4,5,6,7,8,9
    zero-->halted : 1,2,3,4,5,6,7,8,9,0
    notZero --> notZero : 0, 1
    notZero-->halted : 2,3,4,5,6,7,8,9
    halted-->halted : 1,2,3,4,5,6,7,8,9,0
    zero --> [*]
    notZero --> [*]
</div>

The final result is "Unorthodox, but effective," as Williams would say.

Using this methods, here's a decorator that turns a description of a recognizer, into a description of a recognizer that never halts given a sentence in its alphabet:

```javascript
function nonhalting (alphabet, description) {
  const descriptionWithoutHaltedState = avoidReservedNames(["halted"], description);

  const {
    states,
    stateMap,
    start,
    transitions,
    accepting
  } = validatedAndProcessed(descriptionWithoutHaltedState);

  const alphabetList = [...alphabet];
  const statesWithHalted = states.concat(["halted"])

  const toHalted =
    statesWithHalted.flatMap(
      state => {
        const consumes =
          (stateMap.get(state) || [])
      		  .map(({ consume }) => consume);
        const consumesSet = new Set(consumes);
        const haltsWhenConsumes =
          alphabetList.filter(a => !consumesSet.has(a));

        return haltsWhenConsumes.map(
          consume => ({ "from": state, consume, "to": "halted" })
        );
      }
    );

  return reachableFromStart({
    start,
    transitions: transitions.concat(toHalted),
    accepting
  });
}
```

The result is correct, if considerably larger:

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

nonhalting('1234567890', binary);
  //=>
    {
      "start": "start",
      "transitions": [
        { "from": "start", "to": "zero", "consume": "0" },
        { "from": "start", "to": "notZero", "consume": "1" },
        { "from": "notZero", "to": "notZero", "consume": "0" },
        { "from": "notZero", "to": "notZero", "consume": "1" },
        { "from": "start", "consume": "2", "to": "halted" },
        { "from": "start", "consume": "3", "to": "halted" },
        { "from": "start", "consume": "4", "to": "halted" },
        { "from": "start", "consume": "5", "to": "halted" },
        { "from": "start", "consume": "6", "to": "halted" },
        { "from": "start", "consume": "7", "to": "halted" },
        { "from": "start", "consume": "8", "to": "halted" },
        { "from": "start", "consume": "9", "to": "halted" },
        { "from": "zero", "consume": "1", "to": "halted" },
        { "from": "zero", "consume": "2", "to": "halted" },
        { "from": "zero", "consume": "3", "to": "halted" },
        { "from": "zero", "consume": "4", "to": "halted" },
        { "from": "zero", "consume": "5", "to": "halted" },
        { "from": "zero", "consume": "6", "to": "halted" },
        { "from": "zero", "consume": "7", "to": "halted" },
        { "from": "zero", "consume": "8", "to": "halted" },
        { "from": "zero", "consume": "9", "to": "halted" },
        { "from": "zero", "consume": "0", "to": "halted" },
        { "from": "notZero", "consume": "2", "to": "halted" },
        { "from": "notZero", "consume": "3", "to": "halted" },
        { "from": "notZero", "consume": "4", "to": "halted" },
        { "from": "notZero", "consume": "5", "to": "halted" },
        { "from": "notZero", "consume": "6", "to": "halted" },
        { "from": "notZero", "consume": "7", "to": "halted" },
        { "from": "notZero", "consume": "8", "to": "halted" },
        { "from": "notZero", "consume": "9", "to": "halted" },
        { "from": "halted", "consume": "1", "to": "halted" },
        { "from": "halted", "consume": "2", "to": "halted" },
        { "from": "halted", "consume": "3", "to": "halted" },
        { "from": "halted", "consume": "4", "to": "halted" },
        { "from": "halted", "consume": "5", "to": "halted" },
        { "from": "halted", "consume": "6", "to": "halted" },
        { "from": "halted", "consume": "7", "to": "halted" },
        { "from": "halted", "consume": "8", "to": "halted" },
        { "from": "halted", "consume": "9", "to": "halted" },
        { "from": "halted", "consume": "0", "to": "halted" }
      ],
      "accepting": [ "zero", "notZero" ]
    }
```

Let's verify that it still recognizes the same "language:"

```javascript
verify(nonhalting('1234567890', binary), {
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

Now given a recognizer that never halts, what is the `complementation` of that recognizer? Well, given that it is always going to be in one of its states when the input stops, if it is a state that is not one of the original recognizer's accepting states, then it must have failed to recognize the sentence.

This points very clearly to how to implement `complementation`:

```javascript
function complementation (alphabet, description) {
  const nonhaltingDescription = nonhalting(alphabet, description);

  const {
    states,
    start,
    transitions,
    acceptingSet
  } = validatedAndProcessed(nonhaltingDescription);

  const accepting = states.filter(state => !acceptingSet.has(state));

  return { start, transitions, accepting }
}

verify(complementation('1234567890', binary), {
  '': true,
  '0': false,
  '1': false,
  '01': true,
  '10': false,
  '2': true,
  'two': false
});
```

Note that we do not have a perfect or "ideal" `complementation`, we have "complementation over the alphabet `1234567890`." You can see, for example, that it fails to recognize `'two'`, because letters are not part of its alphabet.

---

### complementation has a catch, too

As we saw, rgexen have an affordance for recognizing any of a bunch of symbols, `[]`. For example, `/^[xyz]$/` matches an `x`, `y`, or `z`. Regexen's `[]` also have another affordance: If we write `/^[^xyz]$/`, this matches any single character *except* an `x`, `y`, or `z`:

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

Two observations of note: First, in regexen, `^` sometimes means "anchor this expression at the beginning of the string," and it sometimes means "match anyc character except these."[^intertia] Second, `[^xyz]` matches just a single character that is not an `x`, `y`, or `z`, so `/^[^xyz]$/` does not match the string `'abc'`.

[^inertia]: Using one operator to mean two completely unrelated things is now understood to be a poor design practice, but in programming languages, old ideas have an enormous amount of inertia. Most of our programming languages seem to be rooted in the paradigm of encoding programs on 80 column punch cards.

Now we might think that `complementation` is the perfect tool for building our own equivalent to `[^xyz]`. Let's try it:

```javascript
const notXyOrZ = complementation(ALPHANUMERIC, any('xyz'));

verify(notXyOrZ, {
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
  //=> 3 tests failing:
    {"example":"", "expected":false, "actual":true};
    {"example":"abc", "expected":false, "actual":true};
    {"example":"xyz", "expected":false, "actual":true}
```

It's not the same! `[^xyz]` matches a single character that is not an `x`, `y`, or `z`, whereas `complementation(ALPHANUMERIC, any('xyz'))` matches any string of any length (includng the empty string) that is not a single `x`, `y`, or `z`.

But complementation over a declared alphabet is still very useful. In this example, we have a recognizer for quoted strings that defines them as a doubel quote, a bunch of things that are not a double quote, and then a double quote:

```javascript
const doubleQuote = just('"');
const SYMBOLIC = `~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`;
const WHITESPACE = ` \r\n\t`;
const EVERYTHING_BAGEL = ALPHANUMERIC + SYMBOLIC + WHITESPACE;
const notDoubleQuote = complementation(EVERYTHING_BAGEL, doubleQuote);
const quotedString = catenation(
  doubleQuote,
  kleeneStar(notDoubleQuote),
  doubleQuote
);

verify(quotedString, {
  [`""`]: true,
  [`"Hello!"`]: true,
  [`"This is a double quote: \"."`]: true
});
```

```javascript
const doubleQuote = just('"');
const escape = just('\\');
const SYMBOLIC = `~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`;
const WHITESPACE = ` \r\n\t`;
const EVERYTHING_BAGEL = ALPHANUMERIC + SYMBOLIC + WHITESPACE;
const notDoubleQuoteOrEscape = complementation(EVERYTHING_BAGEL, union(doubleQuote, escape));
const escapedCharacter = catenation(escape, any(EVERYTHING_BAGEL));
const quotedStringWithEscapes = catenation(
  doubleQuote,
  kleeneStar(union(notDoubleQuoteOrEscape, escapedCharacter)),
  doubleQuote
);

verify(quotedStringWithEscapes, {
  [`""`]: true,
  [`"Hello!"`]: true,
  [`"This is a double quote: \"."`]: true
});
```

<!-- UNFINISHED WORK STARTS HERE -->

---

# Regular Languages

### what is a regular language?

As described above, `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore` are all fundamental. They each give us something that could not be constructed from the remaining functions. In an homage, we will call these "special forms."[^special-form]

[^special-form]: Literally speaking, they are not special forms, we're just using the expression. In Lisp dialects, the expression `(FUN ARG1 ARG2 ARG3... ARGN)` is evaluated as invoking function `FUN` with arguments `ARG1 ARG2 ARG3... ARGN` by default. However, there are certain "special forms" that share the same syntax, but are evaluated in special ways. The special forms vary from dialect to dialect, but function definition/lambdas are always a special form of some kind, some kind of conditional (such as `COND` or `IF`) is usually another because of its short-circuit semantics, `SET!` or its equivalent is usually a special form, and so forth.<br/><br/>Our "special forms" are just JavaScript, there is nothing special about they way they're evaluated. However, what they share with Lisp's special forms is that we can build everything else in the language from them.

In formal computer science, **regular languages** are defined using the following rules. Given some alphabet of symbols Σ:[^alphabet]

[^alphabet]: An alphabet is nothing more than a set of symbols. `{ 0, 1 }` is an alphabet often associated with binary numbers. `{ a, b, c ..., z, A, B, C, ... Z}` is an alphabet often associated with English words, and so forth.

- The "empty language," often notated Ø, is a regular language. The empty language is either a language where no strings are accepted at all, or a language where the empty string is the only string accepted. We can make a recognizer for the empty language using `EMPTY`.
- A "singleton set" is a language where single symbols from its alphabet Σ are accepted. We can make a recognizer for a singleton language using `union` and `symbol`.

Now consider two languages `A` and `B`. We are given that `A` and `B` are already defined, and are known to be regular. By this we mean, that they are defined by some combination of the two rules just given, or the three rules that follow. Each has its own alphabet.

- If `A` and `B` are regular languages, the language `AB` formed by catenating `A` and `B` is a regular language. Meaning, if the sentence `ab` belongs to the language `AB` if and only if `a` belongs to `A` and `b` belongs to `B`, then the language `AB` is a regular language if and only if both `A` and `B` are regular languages. If we have a recognizer for `A` and `B`, we can construct a recognizer for the catenation of `A` and `B` by invoking `catenation(A, B)`.
- If `A` and `B` are regular languages, the union of `A` and `B` is a regular language. Meaning, if the sentence `x` belongs to the language `A|B` if and only if `x` belongs to `A` or `x` belongs to `B`, then the language `A|B` is a regular language if and only if both `A` and `B` are regular languages. If we have a recognizer for `A` and `B`, we can construct a recognizer for the union of `A` and `B` by invoking `union(A, B)`.
- If `A` is a regular language, the language `A*` is formed by taking the Kleene Star of `A`. Meaning, if the empty sentence belongs to `A*`, and the sentence `ab` belongs to `A*` if and only if the sentence `a` belongs to `A` and `b` belongs to `A*`, then `A*` is a regular language. If we have a recognizer for `A`, we can construct a recognizer for the Kleene Star of `A` by invoking `zeroOrMore(A)`.

A language is regular if and only if it conforms with the above rules. And since we can construct all the languages formed by the above rules, we can construct all possible regular languages using our five special forms `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`.

But wait, there's more!

A formal *regular expression* is an expression formed by combining `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`. Of course, computer scientists prefer mathematical symbols to make regular expressions, but for our purposes, this is both JavaScript and a regular expression:

```javascript
union(
  symbol("0"),
  catenation(
    symbol("1"),
    zeroOrMore(
      union(symbol("0"), symbol("1"))
    )
  )
)
```
Having defined `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`, it follows that any regular expression has an equivalent JavaScript expression formed by combining these functions with singe character string inputs for `symbol`.

Regular expressions define regular languages. Therefore, every regular language has an equivalent JavaScript regular expression made out of `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`.

Now consider what we know from our implementation so far: `EMPTY` is a finite-state automaton, and `symbol` only creates finite-state automata. And we know that `catenation`, `union`, and `zeroOrMore` create finite-state automata if given finite-state automata as input. Therefore, every JavaScript regular expression made out of `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore` evaluates to the description of a finite-state automaton that recognizes the regular language.

Therefore, *All regular languages can be recognized by finite-state automata*. If someone says, "Oh no, this regular language cannot be recognized by a finite-state automaton," we ask them to write out the regular expression for that language. We then translate the symbols into invocations of `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`, then evaluate the JavaScript expression. The result will be a finite-state automaton recognizing the language, disproving their claim.

---

## Making Regular Expressions More Convenient

Our five special forms--`EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`--can make a recognizer for any regular language. But working with just those forms is tedious: That is why regex dialects include other mechanisms, like being able to specify a string of symbols to match, or the `?` operator that represents "zero or one," or the `+` operator that represents "one or more."

We are now going to define some helpful higher-order functions that work only with the five special forms and each other. Since everything we will now build is built on top of what we already have, we can rest assured that we aren't making anything that couldn't be done by hand with the five tools we already have.

We'll start by making it easier to work with `catenation` and `union`, then we'll move to working with symbols and strings.

---

### upping our catenation and union game

Our `catenation` and `union` functions have an arity of two: They each take two descriptions and return one. when we need to catenate (or take the union of) more than two descriptions, we have to nest our invocations, e.g.

```javascript
const something =
  catenation(
    andNow,
    catenation(
      forSomething,
      completelyDifferent
    ),
  );
```

Binary functions are easiest to reason about, but with some care we can transform them into n-ary functions:

```javascript
function catenation (...descriptions) {
  function binaryCatenation (first, second) {
    const start = "start";
    const accepting = "accepting";

    const catenatableSecond = prepareSecondForCatenation(start, accepting, first, second);
    const catenatableFirst = prepareFirstForCatenation(start, accepting, first, catenatableSecond);

    return {
      start: start,
      accepting: accepting,
      transitions:
        catenatableFirst.transitions
          .concat(catenatableSecond.transitions)
    };
  }

  return descriptions.reduce(binaryCatenation);
}

function union (...descriptions) {
  function binaryUnion (first, second) {
    const start = "start";
    const accepting = "accepting";

    const conformingFirst = renameStates(
      { [first.start]: start, [first.accepting]: accepting },
      first
    );

    const renamedSecond = resolveConflicts(statesOf(conformingFirst), second);

    const conformingSecond = renameStates(
      { [renamedSecond.start]: start, [renamedSecond.accepting]: accepting },
      renamedSecond
    );

    return {
      start,
      accepting,
      transitions:
        conformingFirst
          .transitions
            .concat(
              conformingSecond.transitions
            )
    };
  }

  return descriptions.reduce(binaryUnion);
}
```

Although these are now n-ary functions, they are built by applying the original binary functions (now renamed `binaryCatenation` and `binaryUnion`), so we can continue to reason that catenating any number of descriptions follows the rules for repeated pair-wise catenation.

---

### implementing a recognizer for a set of symbols

It is often handy to be able to recognize any of a set of symbols. We could, of course, do it by hand using union:

```javascript
const binaryDigit = union(symbol("0"), symbol("1"));
```

For convenience, modern regexen support all kinds of special syntaxes for this, e.g. `[a-zA-Z]`. We'll go with something far simpler. Here's our `any` function, taking full advantage of n-ary union:

```javascript
function any (charset) {
  return union(
    ...charset.split('').map(symbol)
  );
}


```

Thus, `any("reg")` returns the description for:

<div class="mermaid">
  graph LR
    start(start)-->|r|r
    r-.->|end|recognized(recognized)
    start-->|e|e
    e-.->|end|recognized
    start-->|g|g
    g-.->|end|recognized
</div>

And here it is in use:

```javascript
test(any("reg"), [
  '', 'r', 'e', 'g',
  'x', 'y', 'reg'
]);
  //=>
    '' => false
    'r' => true
    'e' => true
    'g' => true
    'x' => false
    'y' => false
    'reg' => false
```

It's important to note that `any` is purely a convenience function. It doesn't provide any power that we didn't already have with `symbol` and `union`.

---

### implementing a recognizer for strings

To make a recognizer that recognizes a string of characters, we can use `catenation` with `symbol`:[^names]

```javascript
function string (str = "") {
  return catenation(
    ...str
  		.split('')
    	.map(symbol)
  );
}

test(string("reg"), [
  '', 'r', 'reg'
]);
  //=>
    '' => false
    'r' => false
    'reg' => true
```

But what about the empty string? Let's incorporate `EMPTY`:

```javascript
function string (str = "") {
  return catenation(
    ...str
  		.split('')
    	.map(symbol)
    	.concat([ EMPTY ])
  );
}

test(string(""), [
  '', 'r', 'reg'
]);
  //=>
    '' => true
    'r' => false
    'reg' => false
```

`string` is a function that takes a string, and returns a recognizer that recognizes that string.[^names] Since we built it out of `symbol` and `catenation`, we know that while it is a handy shorthand, it doesn't add any power that we didn't already have with `symbol` and `catenation`.

---

### implementing zero-or-one

We can use `EMPTY` with alternation as well. Here's an automaton that recognizes `reg`:

<div class="mermaid">
  graph LR
    start(start)-->|r|r
    r-->|e|re
    re-->|g|reg
    reg-.->|end|recognized(recognized)
</div>

If we form the union of `reg` with `EMPTY`, we get:

<div class="mermaid">
  graph LR
    start(start)-->|r|r
    start(start)-.->|end|recognized(recognized)
    r-->|e|re
    re-->|g|reg
    reg-.->|end|recognized(recognized)
</div>

That's an automaton that recognizes either the string `reg`, or nothing at all. Another way to put it is that it recognizes zero or one instances of `reg`. We can automate the idea of "zero or one instances of a description:"

```javascript
function zeroOrOne (recognizer) {
  return union(EMPTY, recognizer);
}

const reginaldOrBust = zeroOrOne(string("reginald"));

test(reginaldOrBust, [
  '', 'reg', 'reggie', 'reginald'
]);
  //=>
    '' => true
    'reg' => false
    'reggie' => false
    'reginald' => true
```

Once again, `zeroOrOne` doesn't give us anything that we didn't already have with `EMPTY` and `union`. But it is a convenience.

---

### implementing one-or-more

Given a recognizer such as:

<div class="mermaid">
  graph LR
    start(start)-->|0|0
    0-.->|end|recognized(recognized)
</div>

We could easily transform it into "one or more instances of 0" like this:

<div class="mermaid">
  graph LR
    start(start)-->|0|0
    0-->start
    0-.->|end|recognized(recognized)
</div>

A function to perform that transformation directly on the description would be trivial. However, that would be adding a new function, and it would disrupt our assertion that everything we make with these tools is a regular language. So instead, we will create this:

<div class="mermaid">
  graph LR
    start(start)-->|0|0
    0-->start-2(start-2)
    start-2-.->recognized(recognized)
    start-2-->|0|0-2
    0-2-->start-2
</div>

That is nothing more than catenating a recognizer for zero with a recognizer for zero or more zeroes:

```javascript
function oneOrMore (description) {
  return catenation(description, zeroOrMore(description));
}

test(oneOrMore(symbol("0")), [
  '', '0', '00'
]);
  //=>
    '' => false
    '0' => true
    '00' => true
```

Since we built `oneOrMore` as a convenience for writing `catenation` and `zeroOrMore`, we can continue to reason about anything we create with `oneOrMore` using what we already know about `catenation` and `oneOrMore`.

---

### implementing permute

Languages often have rules that allow for a certain number of things, but in any order. We can recognize such languages using catenation and alternation. For example, if we want to allow the letters `c`, `a`, and `t` in any order, we can write:

```javascript
union(
  concatenate('symbol('c'), symbol('a'), symbol('t')'),
  concatenate('symbol('a'), symbol('c'), symbol('t')'),
  concatenate('symbol('t'), symbol('c'), symbol('a')'),
  concatenate('symbol('c'), symbol('t'), symbol('a')'),
  concatenate('symbol('a'), symbol('t'), symbol('c')'),
  concatenate('symbol('t'), symbol('a'), symbol('c')')
)
```

We can write a function to perform permutations for us. If we restrict it to using `concatenate` and `union` as we did above, it will provide no more power than the tools we already have:

```javascript
function permute (...descriptions) {
  function permuteArray(permutation) {
    const length = permutation.length,
          result = [permutation.slice()],
          c = new Array(length).fill(0);

    let i = 1;

    while (i < length) {
      if (c[i] < i) {
        const k = i % 2 && c[i];
        const p = permutation[i];
        permutation[i] = permutation[k];
        permutation[k] = p;
        ++c[i];
        i = 1;
        result.push(permutation.slice());
      } else {
        c[i] = 0;
        ++i;
      }
    }
    return result;
  }

  return union(
    ...permuteArray(descriptions).map(
      elements => catenation(...elements)
    )
  )
}

const scrambledFeline = permute(symbol('c'), symbol('a'), symbol('t'));

test(scrambledFeline, [
  '', 'cct', 'cat', 'act',
  'tca', 'cta', 'atc', 'tac'
])
  //=>
    '' => false
    'cct' => false
    'cat' => true
    'act' => true
    'tca' => true
    'cta' => true
    'atc' => true
    'tac' => true
```

---

### summarizing our conveniences

We've transformed `catenation` and `union` from binary to n-ary functions. Because we did so by applyimnhg the binary functions we already had, we preserve what we have learned about them, that given descriptions for two or more finite-state automata as arguments, the description returned will be for a finite-state automaton.

We also created `any` and `string`, recognizers for sets of symbols and strings of symbols. Since we implemented these with `symbol`, `union`, and `catenation`, we know that the descriptions they produce are for finite-state automata.

We created `zeroOrOne` and `oneOrMore`, functions that transform recognizers. Since wwe implemented these with `EMPTY`, `union`, and `catenation`, we know that given descriptions of finite-state automata, they return descriptions of finite-state automata.

In sum, we now have some very convenient tools for building finite-state automata that recognize languages. Tools that are very familiar to regex users:

- Regex allows us to specify strings of symbols, e.g. `/foo/`;
- Regex allows us to specify sets of symbols, e.g. `/[abc]/`;
- Regex allows us to specify zero or one, zero or more, and one or more, e.g. `/[abc]?/`, `/[abc]*/`, and `/[abc]+/`.
- Regex allows us to catenate specifications by default, e.g. `/[abc][def]/`;
- Regex allows us to alternate specifications, e.g. `/[abc]|[def]/`.

We also created `permute`. It recognizes any permutation of a set of descriptions. As it builds the result by taking the union of the catenation of existing descriptions, we know that if `permute` is given descriptions of finite-state automata, it also returns a description of a finite-state automaton.

---

## A Recognizer That Recognizes Finite State Machine Descriptions

Armed with our tools, we can build a finite-state automaton that recognizes descriptions of finite-state automata. It recognizes a subset of all of the possible ASCII characters we might build such recognizers to recognize, but it gets the point across:

```javascript
let startMap = symbol('{');
let endMap = symbol('}');

let whitespace = oneOrMore(any(' \t\r\n'));
let optionalWhitespace = zeroOrOne(whitespace);

let colon = symbol(':');

let startLabel = union(
  catenation(string('start'), optionalWhitespace, colon),
  catenation(string('"start"'), optionalWhitespace, colon),
  catenation(string("'start'"), optionalWhitespace, colon)
);

let singleSymbol = any(
  ` \t\r\n:,[]{}-` +
  '0123456789' +
  'abcdefghijklmnopqrstuvwxyz'
);
let state = oneOrMore(singleSymbol);
let singleQuotedState = catenation(
  symbol("'"),
  state,
  symbol("'")
);
let doubleQuotedState = catenation(
  symbol('"'),
  state,
  symbol('"')
);
let quotedState = union(singleQuotedState, doubleQuotedState);

let startClause = catenation(
  optionalWhitespace, startLabel, optionalWhitespace, quotedState, optionalWhitespace
);

let acceptingLabel = union(
  catenation(string('accepting'), optionalWhitespace, colon),
  catenation(string('"accepting"'), optionalWhitespace, colon),
  catenation(string("'accepting'"), optionalWhitespace, colon)
);

let acceptingClause = catenation(
  optionalWhitespace, acceptingLabel, optionalWhitespace, quotedState, optionalWhitespace
);

let transitionsLabel = union(
  catenation(string('transitions'), optionalWhitespace, colon),
  catenation(string('"transitions"'), optionalWhitespace, colon),
  catenation(string("'transitions'"), optionalWhitespace, colon)
);

let fromLabel = union(
  catenation(string('from'), optionalWhitespace, colon),
  catenation(string('"from"'), optionalWhitespace, colon),
  catenation(string("'from'"), optionalWhitespace, colon)
);

let fromClause = catenation(
  optionalWhitespace, fromLabel, optionalWhitespace, quotedState, optionalWhitespace
);

let singleQuotedSymbol = catenation(
  symbol("'"),
  singleSymbol,
  symbol("'")
);
let doubleQuotedSymbol = catenation(
  symbol('"'),
  singleSymbol,
  symbol('"')
);
let quotedSymbol = union(singleQuotedSymbol, doubleQuotedSymbol);

let consumeLabel = union(
  catenation(string('consume'), optionalWhitespace, colon),
  catenation(string('"consume"'), optionalWhitespace, colon),
  catenation(string("'consume'"), optionalWhitespace, colon)
);

let consumable = union(quotedSymbol, string("''"), string('""'));

let consumeClause = catenation(
  optionalWhitespace, consumeLabel, optionalWhitespace, consumable, optionalWhitespace
);

let popLabel = union(
  catenation(string('pop'), optionalWhitespace, colon),
  catenation(string('"pop"'), optionalWhitespace, colon),
  catenation(string("'pop'"), optionalWhitespace, colon)
);

let popClause = catenation(
  optionalWhitespace, popLabel, optionalWhitespace, quotedSymbol, optionalWhitespace
);

let toLabel = union(
  catenation(string('to'), optionalWhitespace, colon),
  catenation(string('"to"'), optionalWhitespace, colon),
  catenation(string("'to'"), optionalWhitespace, colon)
);

let toClause = catenation(
  optionalWhitespace, toLabel, optionalWhitespace, quotedState, optionalWhitespace
);

let pushLabel = union(
  catenation(string('push'), optionalWhitespace, colon),
  catenation(string('"push"'), optionalWhitespace, colon),
  catenation(string("'push'"), optionalWhitespace, colon)
);

let pushClause = catenation(
  optionalWhitespace, pushLabel, optionalWhitespace, quotedSymbol, optionalWhitespace
);

let comma = symbol(',');

let startsWithFrom = catenation(
  fromClause,
  union(
    permute(
      catenation(comma, optionalWhitespace, consumeClause),
      zeroOrOne(catenation(comma, optionalWhitespace, popClause)),
      zeroOrOne(catenation(comma, optionalWhitespace, toClause)),
      zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
    ),
    permute(
      catenation(comma, optionalWhitespace, popClause),
      zeroOrOne(catenation(comma, optionalWhitespace, toClause)),
      zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
    ),
    permute(
      catenation(comma, optionalWhitespace, toClause),
      zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
    )
  )
);

let startsWithConsume = catenation(
  consumeClause,
  permute(
    catenation(comma, optionalWhitespace, fromClause),
    zeroOrOne(catenation(comma, optionalWhitespace, popClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, toClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
  )
);

let startsWithPop = catenation(
  popClause,
  permute(
    catenation(comma, optionalWhitespace, fromClause),
    zeroOrOne(catenation(comma, optionalWhitespace, consumeClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, toClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
  )
);

let startsWithTo = catenation(
  toClause,
  permute(
    catenation(comma, optionalWhitespace, fromClause),
    zeroOrOne(catenation(comma, optionalWhitespace, consumeClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, popClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
  )
);

let startsWithPush = catenation(
  pushClause,
  union(
    permute(
      catenation(comma, optionalWhitespace, fromClause),
      catenation(comma, optionalWhitespace, consumeClause),
      zeroOrOne(catenation(comma, optionalWhitespace, popClause)),
      zeroOrOne(catenation(comma, optionalWhitespace, toClause))
    ),
    permute(
      catenation(comma, optionalWhitespace, fromClause),
      catenation(comma, optionalWhitespace, popClause),
      zeroOrOne(catenation(comma, optionalWhitespace, toClause))
    ),
    permute(
      catenation(comma, optionalWhitespace, fromClause),
      catenation(comma, optionalWhitespace, toClause)
    )
  )
);

let stateDescription = catenation(
  startMap,
  union(
    startsWithFrom,
    startsWithConsume,
    startsWithPop,
    startsWithTo,
    startsWithPush
  ),
  endMap
);

let stateElement = catenation(
  optionalWhitespace, stateDescription, optionalWhitespace
);

let stateList = catenation(
  symbol('['),
  stateElement,
  zeroOrMore(
    catenation(comma, stateElement)
  ),
  symbol(']')
);

let transitionsClause = catenation(
  transitionsLabel, optionalWhitespace, stateList, optionalWhitespace
);

const description = catenation(
  startMap,
  union(
    catenation(
      startClause,
      permute(
        catenation(comma, acceptingClause),
        catenation(comma, transitionsClause),
      )
    ),
    catenation(
      acceptingClause,
      permute(
        catenation(comma, startClause),
        catenation(comma, transitionsClause),
      )
    ),
    catenation(
      transitionsClause,
      permute(
        catenation(comma, startClause),
        catenation(comma, acceptingClause),
      )
    )
  ),
  endMap
);
```

This "compiles" to a description of a recognizer with [2,361,529 states](/assets/supplemental/fsa/description.pp.json.zip)!

We'll get back to its size in a moment. Does it work? Yes it does, although it is slow:

```javascript
test(description, [
  JSON.stringify(EMPTY),
  JSON.stringify(catenation(symbol('0'), zeroOrMore(any('01'))))
]);
  //=>
    '{"start":"start","accepting":"accepting","transitions":[{"from":"start","consume":"","to":"accepting"}]}' => true '{"start":"start","accepting":"accepting","transitions":[{"from":"start","consume":"0","to":"0"},{"from":"0","to":"start-2"},{"from":"start-2","consume":"","to":"accepting"},{"from":"start-2","consume":"0","to":"0-2"},{"from":"0-2","to":"start-2"},{"from":"start-2","consume":"1","to":"1"},{"from":"1","to":"start-2"}]}' => true
```

### the significance of our recognizer

Before we look at our recognizer's size and slowness, let's acknowledge something remarkable: We have built a recognizer that recognizers recognizers. It recognizes a language for describing recognizers. It can even recognize itself, given a great deal of patience on our part.



---

# Notes