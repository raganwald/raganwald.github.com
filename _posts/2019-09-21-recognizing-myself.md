---
title: "Computing Machines that Recognize Themselves, Part I: Finite state automata"
tags: [recursion,allonge,mermaid,noindex]
---

# Prelude

(If you wish to skip the prelude, you can jump directly to the [Table of Contents](#table-of-contents))

In casual programming conversation, a [Regular Expression], or *regex* (plural "regexen"),[^regex] is a sequence of characters that define a search pattern. They can also be used to validate that a string has a particular form. For example, `/ab*c/` is a regex that matches an `a`, zero or more `b`s, and then a `c`, anywhere in a string.

[Regular Expression]: https://en.wikipedia.org/wiki/Regular_expression

[^regex]: In common programming jargon, a "regular expression" refers any of a family of pattern-matching and extraction languages, that can match a variety of languages. In computer science, a "regular expression" is a specific pattern matching language that recognizes regular languages only. To avoid confusion, in this essay we will use the word "regex" to refer to the programming construct.

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

It is far more interesting to ask if a machine defined by a particular flavour of regex can recognize valid examples of that particular flavour. Regexen were originally called "regular expressions," because they could recognize regular languges. Regular languages could be recognized by finite state automata, thus the original regexen described finite state automata.

But just because a flavour of regex only describes finite state automata, does not mean that descriptions of those regexen can be recognized by finite state automata. Consider, for example, a flavour of regex that permits characters, the wildcard operator `.`, the zero-or more operator `*`, and non-capturing groups `(?: ... )`. Here's an example:

```
/(?:<(?:ab*c)>)+/
```

The above regex can most certainly be implemented by a finite state automaton, but recognizing descriptions that include nested non-capturing groups cannot be recognized by a finite state automaton, as we saw in [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata][brutal]. Therefore, we know that this simple flavour of regexen cannot recognize itself.

---

### today's essay

In [A Brutal Look at Balanced Parentheses...][brutal], we constructed recognizers by hand. In this essay, we are going to focus on <!-- TODO: Introduction -->

---

### before we get started, a brief recapitulation of the previous essay

In [A Brutal Look at Balanced Parentheses...][brutal], we began with a well-known programming puzzle: _Write a function that determines whether a string of parentheses is "balanced," i.e. each opening parenthesis has a corresponding closing parenthesis, and the parentheses are properly nested._

[brutal]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html

In pursuing the solution to this problem, we constructed machines that could recognize "sentences" in languages. We saw that some languages can be recognized with Finite State Automata. Languages that require a finite state automaton to recognize them are _regular languages_.

We also saw that balanced parentheses required a more powerful recognizer, a Deterministic Pushdown Automaton. Languages that require a deterministic pushdown automaton to recognize them are _deterministic context-free languages_.

We then went a step further and considered the palindrome problem, and saw that there were languages--like palindromes with a vocabulary of two or more symbols--that could not be recognized with Deterministic Pushdown Automata, and we needed to construct a [Pushdown Automaton] to recognize palindromes. Languages that require a pushdown automaton to recognize them are _context-free languages_.

[Pushdown Automaton]: https://en.wikipedia.org/wiki/Pushdown_automaton

We implemented pushdown automata using a classes-with-methods approach, the complete code is [here][pushdown.oop.es6].

[pushdown.oop.es6]: https://gist.github.com/raganwald/41ae26b93243405136b786298bafe8e9#file-pushdown-oop-es6

The takeaway from [A Brutal Look at Balanced Parentheses...][brutal] was that languages could be classified according to the power of the ideal machine needed to recognize it, and we explored example languages that needed finite state automata, deterministic pushdown automata, and pushdown automata respectively.[^tm]

[^Tm]: [a Brutal Look at Balanced Parentheses, ...][Brutal] did not explore two other classes of languages. there is a class of formal languages that requires a turing machine to recognize its sentences. turing machines are more powerful than pushdown automata. And there is a class of formal languages that cannot be recognized by Turing Machines, and therefore cannot be recognized at all! Famously, the latter class includes a machine that takes as its sentences descriptions of Turing Machines, and recognizes those that halt.

---

![Placeholder figs](/assets/images/pushdown/figs.jpg)

*Placeholder for figs to be added later*

---

### terminology

In this essay will will play a little loose with terminology. We are concerned with [finite state machines][fsm], also called *finite state automata*. Finite state automata can do a lot of things. They can recognize sentences in a language, which is our interest here. Finite state automata that recognize statements in a language are also called _finite state recognizers_.

Finite state automata can slo do thing that are not of interest to our essay today. A finite state recognizer recognizes whether a sentence is a sentence in a language. A finite state automaton can also be devised that not only recognizes whether a sentence is in a language, but also recognizes whether it belongs to one or more distinct subsets of statements in a language. Such automata are called _classifiers_, and a recognizer is the degenerate case of a classifier that only recognizes one subset.

Other automata can generate strings, transform strings, and so forth. These are not of interest to us.

Now that we have established that finite state automata can do much more than "just" recognize statements in languages, we will continue on for the rest of the essay using the terms "finite state automaton," "finite state machine," and "finite state recognizer" interchangeably.

[fsa]: https://en.wikipedia.org/wiki/Finite-state_machine

# [Table of Contents](#table-of-contents)

### [Prelude](#prelude)

  - [today's essay](#todays-essay)
  - [before we get started, a brief recapitulation of the previous essay](#before-we-get-started-a-brief-recapitulation-of-the-previous-essay)
  - [terminology](#terminology)

### [The Problem Statement](#the-problem-statement-1)

  - [a language for describing finite state recognizers](#a-language-for-describing-finite-state-recognizers)
  - [implementing our example recognizer](#implementing-our-example-recognizer)

### [Composeable Recognizers](#composeable-recognizers-1)

[Taking the Product of Two Finite State Automata](#taking-the-product-of-two-finite-state-automata)

  - [starting the product](#starting-the-product)
  - [transitions](#transitions)
  - [a function to compute the product of two recognizers](#a-function-to-compute-the-product-of-two-recognizers)

[From Product to Union and Intersection](#from-product-to-union-and-intersection)

  - [union](#union)
  - [intersection](#intersection)

[Taking the Union of Two Descriptions](#taking-the-union-of-two-descriptions)

  - [fixing a problem with union(first, second)](#fixing-a-problem-with-unionfirst-second)
  - [what we have learned from taking the union of descriptions](#what-we-have-learned-from-taking-the-union-of-descriptions)

[Catenating Descriptions](#catenating-descriptions)

  - [catenating descriptions with epsilon-transitions](#catenating-descriptions-with-epsilon-transitions)
  = [removing epsilon-transitions](#removing-epsilon-transitions)

  - [catenationFSA(first, second)](#catenationfsafirst-second)
  - [catenation(first, second)](#catenationfirst-second)
  - [what we have learned from catenating descriptions](#what-we-have-learned-from-catenating-descriptions)

[Building Language Recognizers](#building-language-recognizers)

  - [recognizing emptiness](#recognizing-emptiness)
  - [recognizing symbols](#recognizing-symbols)
  - [implementing zero-or-more](#implementing-zero-or-more)

### [Regular Languages](#regular-languages-1)

  - [what is a regular language?](#what-is-a-regular-language)

[Making Regular Expressions More Convenient](#making-regular-expressions-more-convenient)

  - [upping our catenation and union game](#upping-our-catenation-and-union-game)
  - [implementing a recognizer for a set of symbols](#implementing-a-recognizer-for-a-set-of-symbols)
  - [implementing a recognizer for strings](#implementing-a-recognizer-for-strings)
  - [implementing one-or-more](#implementing-one-or-more)
  - [implementing permute](#implementing-permute)
  - [summarizing our conveniences](#summarizing-our-conveniences)

[A Recognizer That Recognizes Finite State Machine Descriptions](#a-recognizer-that-recognizes-finite-state-machine-descriptions)

---

# The Problem Statement

We will begin by stating the problem we are going to solve: We wish to answer the question, *Can a finite state automaton recognize valid finite state automata?*

We'll need to be a bit more specific. Finite state automata can do a lot of things. Some finite state automata recognize statements in languages, where the statements consist of ordered and finite collections of symbols. We will call these **finite state recognizers**, and we are only concerned with finite state recognizers in this essay.

Thus, we will not—of course—ask whether a finite state automaton can be hooked up to cameras and recognize whether a physical scene contains a physical state machine. We also will not ask whether a finite state automaton can recognize a `.png` encoding of a diagram, and recognize whether it is a diagram of a valid finite state state machine:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> one : 1
    one --> one : 0, 1
    zero --> [*]
    one --> [*]
</div>

Instead, we will formulate a language for describing finite state recognizers, and ask whether a finite state recognizer can be devised to recognize valid statements in the language that describes finite state recognizers. If we can make such a recognizer, we will have shown that in at least one sense, a finite state recognizer can recognize finite state recognizers.

That is not, of course, the exact same thing as asking whether a regex can recognize a valid regex. Regexen are a language of their own, and it is possible that a regular expression might be more powerful than a finite state recognizer, and it is equally possible (certain, in fact) that the language used to describe a regex cannot be parsed with finite state recognizers.[^cannot-parse]

[^cannot-parse]: How certain? Well, all regular expression languages in wide usage have the ability to create *groups* using parentheses, e.g. `/Reg(?:inald)?/` is a regular expression containing an optional non-capturing group. Groups in regex can be nested, and must be properly nested and balanced for a regex to be valid. We know from [A Brutal Look at Balanced Parentheses...][brutal] that we cannot recognize balanced (or even nested) parentheses with just a finite state recognizer, so therefore we cannot recognize valid regexen with a finite state recognizer.

But we'll start with devising a finite state recognizer that recognizes syntactically valid descriptions of finite state recognizers, and see where that takes us.

### a language for describing finite state recognizers

Before we can write finite state recognizers that recognize syntactically valid descriptions of finite state recognizers, we need a language for describing finite state recognizers.

We don't need to invent a brand-new format, there is already an accepted [formal definition][fdfsa] for Pushdown Automata. Mind you, it involves mathematical symbols that are unfamiliar to some programmers, so without dumbing it down, we will create our own language that is equivalent to the full formal definition, but expressed in JSON.

[fdfsa]: https://en.wikipedia.org/wiki/Finite-state_machine#Mathematical_model

JSON has the advantage that it is a language in the exact sense we want: An ordered set of symbols. So we will describe finite state recognizers using JSON, and we will attempt to write a finite state recognizer that recognizes strings that are valid JSON descriptions of finite state recognizers.[^natch]

[^natch]: Naturally, if we have a valid description of a finte state recognizer that recognizes vald descriptions of finite state recognizers... We expect it to recognize itself.

Now what do we need to encode? Finite state recognizers are defined as a quintuple of `(Σ, S, s, ẟ, F)`, where:

  - `Σ` is the alphabet of symbols this recognizer operates upon.
  - `S` is the set of states this recognizer can be in.
  - `s` is the initial or "start" state of the recognizer.
  - `ẟ` is the recognizer's "state transition function" that governs how the recognizer changes states while it consumes symbols from the sentence it is attempting to recognize.
  - `F` is the set of "final" states. If the recognizer is in one of these states when the input ends, it has recognized the sentence.

We can encode these with JSON. We'll use descriptive words rather than mathematical symbols, but note that if we wanted to use the mathematical symbols, everything we're doing would work just as well.

Or JSON representation will represent the quintuple as a Plain Old JavaScript Object (or "POJO"), rather than an array. This makes it easier to document what each element means, and it also makes it easy for some of the elements to be optional:

```javascript
{
  // elements...
}
```

The recognizer's `alphabet`, `Σ`, will be _optional_. If present, it will be encoded as a string. In this example, we are encoding the alphabet of a recognizer that operates on zeroes and ones:

```json
{
  "alphabet": "01"
}
```

If `alphabet` is present, it must be complete:[^complete-alphabet]

[^complete-alphabet]: A complete alphabet is one in which every symbol used by the transition function is a member of the alphabet.

The recognizer's `states`, `S`, will also be _optional_. If present, it will be encoded as list of strings representing the names of the states. States in our recognizer must have unique names. The names need not be constructed from the recognizer's alphabet, they are for our convenience:

```json
{
  "states": ["start", "zero", "one or more"]
}
```

As with `alphabet`, if `states` is present, the set of states must be complete.[^complete-states]

[^complete-states]: For the set of states to be complete, it must contain the start or initial state, all of the final states, and every state used by the transition function.

The recognizer's initial, or `start` state is required. It is a string representing the name of the initial state:

```json
{
  "start": "start"
}
```

The recognizer's set of final, or `accepting` states is required. It is encoded as a list of strings representing the names of the final states. If the recognizer is in any of the `accepting` (or "final") states when the end of the sentence is reached (or equivalently, when there are no more symbols to consume), the recognizer accepts or "recognizes" the sentence.

```json
{
  "accepting": ["zero", "one or more"]
}
```

The recognizer's state transition function, `ẟ`, is represented as a set of `transitions`, encoded as a list of POJOs, each of which represents exactly one transition:

```json
{
  "transitions": [

  ]
}
```

Each transition defines a change in the recognizer's state. Transitions are formally defined as triples of the form `(p,a, q)`:

 - `p` is the state the recognizer is currently in.
 - `a` is the input symbol  consumed.
 - `q` is the state the recognizer will be in after completing this transition. It can be the same as `p`, meaning that it consumes a symbol and remains in the same state.

We can represent this with POJOs. For readability by those unfamiliar with the formal notation, we will use the words `from`, `consume`, and `to`. This may feel like a lot of typing compared to the formal symbols, but we'll get the computer do do our writing for us, and it doesn't care.

Thus, one possible set of transitions might be encoded like this:

```json
{
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "one or more" },
    { "from": "one or more", "consume": "0", "to": "one or more" },
    { "from": "one or more", "consume": "1", "to": "one or more" }
  ]
}
```

Putting it all together, we have:

```javascript
const binaryNumber = {
  "alphabet": "01",
  "states": ["start", "zero", "one or more"],
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "one or more" },
    { "from": "one or more", "consume": "0", "to": "one or more" },
    { "from": "one or more", "consume": "1", "to": "one or more" }
  ],
  "accepting": ["zero", "one or more"]
}
```

Our representation translates directly to this simplified state diagram:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> one : 1
    one --> one : 0, 1
    zero --> [*]
    one --> [*]
</div>

This finite state recognizer recognizes binary numbers.

---

### implementing our example recognizer

Here is a function that takes as its input the definition of a recognizer, and returns a Javascript recognizer *function*:[^vap]

```javascript
function automate (description) {
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
```

[^vap]: `automate` relies on `validatedAndProcessed`, a utility function that does some general-purpose processing useful to many of the things we will build along the way. The source code is [here](/assets/supplemental/fsa/01-validated-and-processed.js).)

Here we are using `automate` with our definition for recognizing binary numbers:

```javascript
function test (description, examples) {
  const recognizer = automate(description);

  for (const example of examples) {
    console.log(`'${example}' => ${recognizer(example)}`);
  }
}

const binaryNumber = {
  "alphabet": "01",
  "states": ["start", "zero", "one or more"],
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "one or more" },
    { "from": "one or more", "consume": "0", "to": "one or more" },
    { "from": "one or more", "consume": "1", "to": "one or more" }
  ],
  "accepting": ["zero", "one or more"]
};

test(binaryNumber, [
  '', '0', '1', '00', '01', '10', '11',
  '000', '001', '010', '011', '100',
  '101', '110', '111',
  '10100011011000001010011100101110111'
]);
  //=>
    '' => false
    '0' => true
    '1' => true
    '00' => false
    '01' => false
    '10' => true
    '11' => true
    '000' => false
    '001' => false
    '010' => false
    '011' => false
    '100' => true
    '101' => true
    '110' => true
    '111' => true
    '10100011011000001010011100101110111' => true
```

We now have a function, `automate`, that takes a data description of a finite state automaton/recognizer, and returns a Javascript recognizer function we can play with.

# Composeable Recognizers

One of programming's "superpowers" is _composition_, the ability to build things out of smaller things, and especially, to reuse those smaller things to build other things.

Composition is built into our brains: When we speak human languages, we use combinations of sounds to make words, and then we use combinations of words to make sentences, and so it goes building layer after layer until we have things like complete books.

Composeable recognizers and patterns are particularly interesting. Just as human languages are built by layers of composition, all sorts of mechanical languages are structured using composition. JSON is a perfect example: A JSON element like a list is composed of zero or more arbitrary JSON elements, which themselves could be lists, and so forth.

If we want to build a recognizer for recognizers, it would be ideal to build smaller recognizers for things like strings, and then use composition to build more complicated recognizers for elements like lists of strings, or "objects."

This is the motivation for the first part of our exploration: We want to make simple recognizers, and then use composition to make more complex recognizers from the simple recognizers.

We are going to implement three operations that compose two recognizers: _Union_, _Intersection_, and _Catenation_.

Given two recognizes `a` and `b`, we can say that `A` is a set of sentences recognized by `a`, and `B` is a set of sentences recognized by `b`. Given `a`, `A`, `b`, and `B`, we can say that the `union(a, b)` is a recognizer that recognizes sentences in the set `A ⋃ B`, and `intersection(a, b)` is a recognizer that recognizes sentences in the set `A ⋂ B`.

Or in colloquial terms, a sentence is recognized by `union(a, b)` if and only if it is recognized by `a` or it is recognized by `b`. And a sentence is recognized by `intersection(a, b)` if and only if it is recognized by both `a` and by `b`.

What about `catenation(a, b)`? If we have some sentence `xy`, where `x` and `y` are strings of zero or more symbols, then `xy` is recognized by `catenation(a, b)` is and only if `x` is recognized by `a` and `y` is recognized by `b`.

We'll get started with union and catenation, because they both are built on a common operation, *taking the product of two finite state automata*.

---

## Taking the Product of Two Finite State Automata

Consider two finite state recognizers. The first, `a`, recognizes a string of one or more zeroes:

<div class="mermaid">
  stateDiagram
    [*]-->emptyA
    emptyA-->zero : 0
    zero-->zero : 0
    zero-->[*]
</div>

The second, `b`, recognizes a string of one ore more ones:

<div class="mermaid">
  stateDiagram
    [*]-->emptyB
    emptyB-->one : 1
    one--> one : 1
    one-->[*]
</div>

Recognizer `a` has two declared states: `'empty'` and `'zero'`. Recognizer `b` also has two declared states: `'empty'` and `'one'`. Both also have an undeclared state: they can halt. As a convention, we will refer to the halted state as an empty string, `''`.

Thus, recognizer `a` has three possible states: `'empty'`, `'zero'`, and `''`. Likewise, recognizer `b` has three possible states: `'empty'`, `'one'`, and `''`.

Now let us imagine the two recognizers are operating simultaneously on two strings of symbols (they could be the same symbols or different symbols, that doesn't matter just yet):

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

If we wish to simulate the actions of the two recognizers operating concurrently, we could do so if we had a finite state automaton with nine states, one for each of the pairs of states that `a` and `b` could be in.

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
        {
          "from": "(emptyA)(emptyB)",
          "consume": "0",
          "to": "(zero)()"
        },
        {
          "from": "(emptyA)(emptyB)",
          "consume": "1",
          "to": "()(one)"
        },
        {
          "from": "(zero)()",
          "consume": "0",
          "to": "(zero)()"
        },
        {
          "from": "()(one)",
          "consume": "1",
          "to": "()(one)"
        }
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
function union (a, b) {
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
union(a, b)
  //=>
    {
      "start": "(emptyA)(emptyB)",
      "accepting": [
        "(zero)()",
        "()(one)"
      ],
      "transitions": [
        {
          "from": "(emptyA)(emptyB)",
          "consume": "0",
          "to": "(zero)()"
        },
        {
          "from": "(emptyA)(emptyB)",
          "consume": "1",
          "to": "()(one)"
        },
        {
          "from": "(zero)()",
          "consume": "0",
          "to": "(zero)()"
        },
        {
          "from": "()(one)",
          "consume": "1",
          "to": "()(one)"
        }
      ]
    }
```

---

### intersection

The accepting set for the _Intersection_ of two recognizers is equally straightforward. While the accepting set for the union is all those reachable states of the product where either (or both) of the two states is an accepting state, the accepting set for the intersection is all those reachable states of the product where both of the two states is an accepting state:

```javascript
function intersection (a, b) {
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

test(reg, ['', 'r', 'R', 'Reg', 'REG', 'Reginald', 'REGINALD']))
  //=>
    '' => false
    'r' => false
    'R' => false
    'Reg' => true
    'REG' => true
    'Reginald' => false
    'REGINALD' => false
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

test(uppercase, ['', 'r', 'R', 'Reg', 'REG', 'Reginald', 'REGINALD'])
  //=>
    '' => true
    'r' => false
    'R' => true
    'Reg' => false
    'REG' => true
    'Reginald' => false
    'REGINALD' => true
```

Now we can try their union and intersection:

```javascript
test(union(reg, uppercase), ['', 'r', 'R', 'Reg', 'REG', 'Reginald', 'REGINALD'])
  //=>
    '' => true
    'r' => false
    'R' => true
    'Reg' => true
    'REG' => true
    'Reginald' => false
    'REGINALD' => true

test(intersection(reg, uppercase), ['', 'r', 'R', 'Reg', 'REG', 'Reginald', 'REGINALD'])
  //=>
    '' => false
    'r' => false
    'R' => false
    'Reg' => false
    'REG' => true
    'Reginald' => false
    'REGINALD' => false
```

We now have `union` and `intersection` functions, each of which takes two descriptions and returns a description.

---

## Catenating Descriptions

And now we turn our attention to catenating descriptions. Let's begin by informally defining what we mean  by "catenating descriptions:"

Given two recognizers, `a` and `b`, the catenation of `a` and `b` is a recognizer that recognizes a sentence `AB`, if and only if `A` is a sentence recognized by `a` and `B` is a sentence recognized by `b`.

Catenation is very common in composing patterns. It's how we formally define recognizers that recognize things like "the function keyword, followed by optional whitespace, followed by an optional label, followed by optional whitespace, followed by an open parenthesis, followed by..." and so forth.

A hypothetical recognizer for JavaScript function expressions would be composed by catenating recognizers for keywords, optional whitespace, labels, parentheses, and so forth.

---

### catenating descriptions with epsilon-transitions

Our finite state automata are very simple: They are deterministic, meaning that in every state, there is one and only one transition for each unique symbol. And they always consume a symbol when they transition.

Some finite state automata relax the second constraint. They allow a transition between states without consuming a symbol. If a transition with a symbol to be consumed is like an "if statement," a transition without a symbol to consume is like a "goto."

Such transitions are called "ε-transitions," or "epsilon transitions" for those who prefer to avoid greek letters. As we'll see, ε-transitions do not add any power to finite state automata, but they do sometimes help make diagrams a little easier to understand and formulate.

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
4. The accepting states of the second recognizer become the accepting states of the catenated recognizers.\

This transformation complete, we can then remove the ε-transitions. For each ε-transition between an origin and destination state:

1. Copy all of the transitions from the destination state into the origin state.
2. If the destination state is an accepting state, make the origin state an accepting state as well.
3. Remove the ε-transition.

(Following this process, we sometimes wind up with unreachable states. In our example above, `empty2` becomes unreachable after removing the ε-transition. This has no effect on the behaviour of the recognizer, and in the next section, we'll see how to prune those unreachable states.)

---

### implementing catenation

Here's some code to resolve conflicts between the state names of two recognizers:

```javascript
function resolveConflicts(reserved, description) {
  const reservedSet = new Set(reserved);
  const states = statesOf(description);

  const nameMap = {};

  // build the map to resolve overlaps with reserved names
  for (const state of states) {
    const match = /^(.*)-(\d+)$/.exec(state);
    let base = match == null ? state : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = state;
    while (reservedSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== state) {
  		nameMap[state] = resolved;
    }
    reservedSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, description);
}
```


<!-- UNFINISHED STUFF BELOW -->

---

### what we have learned from catenating descriptions

Now that we have written `catenation` for descriptions, we can reason as follows:[^reason]

- A finite state automaton can recognize any regular language.
- The catenation of two finite state recognizers is a finite state recognizer.
- Therefore, a language defined by catenating two regular languages, will be regular.

[^reason]: Well, actually, this is not strictly true. Building a catenation function certainly gives us confidence that a language formed by catenating the rules for two regular language ought to be regular, but it is always possible that our algorithm has a bug and cannot correctly catenate any two finite state recognizers. Finding such a bug would be akin to finding a counter-example to something thought to have been proven, or a conjecture thought to be true, but unproven. This is the nature of "experimental computing science," it is always easier to demonstrate that certain things are impossible--by finding just one counter-example--than to prove that no counter-examples exist.

Likewise, we can reason:

- A pushdown automaton can recognize any context-free language.
- The catenation of two pushdown automaton recognizers is a pushdown automaton recognizer.
- Therefore, a language defined by catenating two context-free languages, will be context-free.

As noted, we could not have come to these conclusions from functional composition alone. But we're leaving something out. What about catenating any two deterministic pushdown automata? Is the result also a deterministic pushdown automaton?

Recall our balanced parentheses recognizer:

```javascript
const balanced = {
  "start": "start",
  "accepting": "accepting",
  "transitions": [
    { "from": "start", "push": "⚓︎", "to": "read" },
    { "from": "read", "consume": "(", "push": "(", "to": "read" },
    { "from": "read", "consume": ")", "pop": "(", "to": "read" },
    { "from": "read", "consume": "[", "push": "[", "to": "read" },
    { "from": "read", "consume": "]", "pop": "[", "to": "read" },
    { "from": "read", "consume": "{", "push": "{", "to": "read" },
    { "from": "read", "consume": "}", "pop": "{", "to": "read" },
    { "from": "read", "consume": "", "pop": "⚓︎", "to": "accepting" }
  ]
};
```

It is clearly deterministic, there is only one unambiguous transition that cana be performed at any time. Now, here is a recognizer that recognizes a single pair of parentheses, it is very obviously a finte state automaton:

```javascript
const pair = {
  "start": "start",
  "accepting": "accepting",
  "transitions": [
    { "from": "start", "consume": "(", "to": "closing" },
    { "from": "closing", "consume": ")", "to": "closed" },
    { "from": "closed", "consume": "", "to": "accepting" }
  ]
};

test(pair, [
  '', '(', ')', '()', ')(', '())'
]);
  //=>
    '' => false
    '(' => false
    ')' => false
    '()' => true
    ')(' => false
    '())' => false
```

What happens when we catenate them?

```javascript
catenation(balanced, pair)
  //=>
    {
      "start": "start",
      "accepting": "accepting-2",
      "transitions": [
        { "from": "start", "to": "read", "push": "⚓︎" },
        { "from": "read", "consume": "(", "to": "read", "push": "(" },
        { "from": "read", "consume": ")", "pop": "(", "to": "read" },
        { "from": "read", "consume": "[", "to": "read", "push": "[" },
        { "from": "read", "consume": "]", "pop": "[", "to": "read" },
        { "from": "read", "consume": "{", "to": "read", "push": "{" },
        { "from": "read", "consume": "}", "pop": "{", "to": "read" },
        { "from": "read", "pop": "⚓︎", "to": "start-2" },
        { "from": "start-2", "consume": "(", "to": "closing" },
        { "from": "closing", "consume": ")", "to": "closed" },
        { "from": "closed", "consume": "", "to": "accepting-2" }
      ]
    }

test(catenation(balanced, pair), [
  '', '()', '()()'
]);
  //=>
    '' => false
    '()' => true
    '()()' => true
```

Our `catenation` function has transformed a deterministic pushdown automaton into a pushdown automaton.  How do we know this? Consider the fact that it recognized both `()` and `()()`. To recognize `()`, it transitioned from `read` to `start-2` while popping `⚓︎`, even though it could also have consumed `(` and pushed it onto the stack.

But to recognize `()()`, it consumed the first `(` and pushed it onto the stack, but not the second `(`. This is only possible in a Pushdown Automaton. So our `catenation` function doesn't tell us anything about whether two deterministic pushdown automata can always be catenated in such a way to produce a deterministic pushdown automaton.

If it is possible, our `catenation` function doesn't tell us that it's possible. Mind you, this reasoning doesn't prove that it's impossible. We just cannot tell from this particular `catenation` function alone.

---

## Building Language Recognizers

`catenation` and `union` are binary combinators: They compose a new description, given two existing descriptions. But we don't have any functions for making descriptions from scratch. Up to here, we have always written such descriptions by hand.

But now we'll turn our attention to making new descriptions from scratch. If we have a way to manufacture new descriptions, and ways to combine existing descriptions, we have a way to build recognizers in a more structured fashion than coding finite state automata by hand.

That allows us to reason more easily about what our recognizers can and cannot recognize.

### recognizing emptiness

The simplest possible recognizer is one that doesn't recognize anything at all. It is called `EMPTY`, because as we'll see below, it recognizes the "empty language," the language that has no sentences at all:

<div class="mermaid">
  graph LR
    start(start)-.->|end|recognized(recognized)
</div>

And here's our implementation:

```javascript
const EMPTY = {
  start: "start",
  accepting: "accepting",
  transitions: [{ from: "start", consume: "", to: "accepting" }]
};

test(EMPTY, [
  '', 'r', 'reg'
]);
  //=>
    '' => true
    'r' => false
    'reg' => false
```

It does just one thing, but as we'll see shortly, that thoing is essential. `EMPTY` is also useful for creating convenience functions like `zeroOrOne`, but let's not get ahead of ourselves.

### recognizing symbols

Most of the time, we're interested in recognizing strings of characters, called "symbols" in formal computer science. To get started recognizing strings, we need to be able to recognize single symbols.

Like this:

```javascript
function symbol (s) {
  return {
    start: "start",
    accepting: "accepting",
    transitions: [
      { from: "start", consume: s, to: s },
      { from: s, consume: "", to: "accepting" }
    ]
  };
}
```

With `symbol`, we can manufacture a description of a recognizer that recognizes any one symbol. For example, `symbol("r")` gives us:

<div class="mermaid">
  graph LR
    start(start)-->|r|r
    r-.->|end|recognized(recognized)
</div>

### implementing zero-or-more

With `EMPTY`, `symbol`, `catenate`, and `alternate` we can write recognizers that recognize any language that has a finite alphabet, and contains a finite number of sentences, each of which is of finite length.[^proof]

[^proof]: To prove this, consider that given a finite set of sentences of finte length, we can construct a recognizer for each sentence using `symbol` and `catenate`, then we can use `alternate` to create a recognizer for the entire language.

In order to recognize some sentences of infinite length, we need something more than `EMPTY`, `symbol`, `catenate`, and `alternate`. The original tool for recognizing strings of infinite length is formally called the [Kleene star]. We'll call it `zeroOrMore`, because that is the way most programmers describe its behaviour.

[Kleene star]: https://en.wikipedia.org/wiki/Kleene_star

Consider this description of a recognizer that recognizes a single zero. We could write it out by hand, of course, or generate it with `symbol("0")`:

<div class="mermaid">
  graph LR
    start(start)-->|0|0
    0-.->|end|recognized(recognized)
</div>

We can transform it into a recognizer for zero or one zeroes allowing it to recognize the empty string. This is the same result that we would get from `union(EMPTY, symbol("0)"))`:

<div class="mermaid">
  graph LR
    start(start)-->|0|0
    start-.->recognized(recognized)
    0-.->|end|recognized
</div>

Now what happens if we make the following change: After recognizing a zero, what if we start all over again, rather than waiting for the string to end?

<div class="mermaid">
  graph LR
    start-.->recognized(recognized)
    start(start)-->|0|0
    0-->start
</div>

This recognizes *zero or more* zeroes. And we can write a function to perform this transformation:

```javascript
function zeroOrMore (description) {
  const { start, accepting, transitions } = description;

  const loopsBackToStart = ({
    start,
    accepting,
    transitions:
      transitions.map(
        ({ from, consume, pop, to, push }) => {
          const transition = { from };
          if (pop != null) transition.pop = pop;
          if (push != null) transition.push = push;
          if (to === accepting && consume === "") {
            transition.to = start
          } else {
            if (consume != null) transition.consume = consume;
            if (to != null) transition.to = to;
          }

          return transition;
        }
      )
  });

  return union(EMPTY, loopsBackToStart);
}
```

Here it is in use to define `binary` using only the tools we've created:

```javascript
const binary = union(
  symbol("0"),
  catenation(
    symbol("1"),
    zeroOrMore(
      union(symbol("0"), symbol("1"))
    )
  )
);

test(binary, [
  '', '0', '1', '00', '01', '10', '11',
  '000', '001', '010', '011', '100',
  '101', '110', '111',
  '10100011011000001010011100101110111'
]);
  //=>
    '' => false
    '0' => true
    '1' => true
    '00' => false
    '01' => false
    '10' => true
    '11' => true
    '000' => false
    '001' => false
    '010' => false
    '011' => false
    '100' => true
    '101' => true
    '110' => true
    '111' => true
    '10100011011000001010011100101110111' => true
```

Notice that `zeroOrMore(union(symbol("0"), symbol("1")))` recognizes the empty string, or a string of any length of zeroes and/or ones.

---

# Regular Languages

### what is a regular language?

As described above, `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore` are all fundamental. They each give us something that could not be constructed from the remaining functions. In an homage, we will call these "special forms."[^special-form]

[^special-form]: Literally speaking, they are not special forms, we're just using the expression. In Lisp dialects, the expression `(FUN ARG1 ARG2 ARG3... ARGN)` is evaluated as invoking function `FUN` wwith arguments `ARG1 ARG2 ARG3... ARGN` by default. However, there are certain "special forms" that share the same syntax, but are evaluated in special ways. The special forms vary from dialect to dialect, but function definition/lambdas are always a special form of some kind, some kind of conditional (such as `COND` or `IF`) is usually another because of its short-circuit semantics, `SET!` or its equivalent is usually a special form, and so forth.<br/><br/>Our "special forms" are just JavaScript, there is nothing special about they way they're evaulated. However, what they share with Lisp's special forms is that we can build everything else in the language from them.

In formal computer science, **regular languages** are defined using the following rules. Given some alphabet of symbols Σ:[^alphabet]

[^alphabet]: An alphabet is nothing more than a set of symbols. `{ 0, 1 }` is an alphabet often associated with binary numbers. `{ a, b, c ..., z, A, B, C, ... Z}` is an alphabet often associated with English words, and so forth.

- The "empty language," often notated Ø, is a regular language. The empty language is either a language where no strings are accepted at all, or a language where the empty string is the only string accepted. We can make a recognizer for the empty language using `EMPTY`.
- A "singleton set" is a language where single symbols from its alphabet Σ are accepted. We can make a recognizer for a singleton language using `union` and `symbol`.

Now consider two languages `A` and `B`. We are given that `A` and `B` are already defined, and are known to be regular. By this we mean, that they are defined by some combination of the two rules just given, or the three rules that follow. Each has its own alphabet.

- If `A` and `B` are regular languages, the language `AB` formed by catenating `A` and `B` is a regular language. Meaning, if the sentance `ab` belongs to the language `AB` if and only if `a` belongs to `A` and `b` belongs to `B`, then the language `AB` is a regular language if and only if both `A` and `B` are regular languages. If we have a recognizer for `A` and `B`, we can construct a recognizer for the catenation of `A` and `B` by invoking `catenation(A, B)`.
- If `A` and `B` are regular languages, the union of `A` and `B` is a regular language. Meaning, if the sentance `x` belongs to the language `A|B` if and only if `x` belongs to `A` or `x` belongs to `B`, then the language `A|B` is a regular language if and only if both `A` and `B` are regular languages. If we have a recognizer for `A` and `B`, we can construct a recognizer for the union of `A` and `B` by invoking `union(A, B)`.
- If `A` is a regular language, the language `A*` is formed by taking the Kleene Star of `A`. Meaning, if the empty sentence belongs to `A*`, and the sentance `ab` belongs to `A*` if and only if the sentance `a` belongs to `A` and `b` belongs to `A*`, then `A*` is a regular language. If we have a recognizer for `A`, we can construct a recognizer for the Kleene Star of `A` by invoking `zeroOrMore(A)`.

A language is regular if and only if it conforms with the above rules. And since we can construct all the languages formed by the above rules, we can construct all possible regular languages using our five special forms `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`.

But wait, there's more!

A formal *regular expression* is an expression formed by combining `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`. Of coure, computer scientists prefer mathematical symbols to make regular expressions, but for our purposes, this is both JavaScript and a regular expression:

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

Now consider what we know from our implementation so far: `EMPTY` is a finite state automaton, and `symbol` only creates finite state automata. And we know that `catenation`, `union`, and `zeroOrMore` create finite state automata if given finite state automata as input. Therefore, every JavaScript regular expression made out of `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore` evaluates to the description of a finite state automaton that recognizes the regular language.

Therefore, *All regular languages can be recognized by finite state automata*. If someone says, "Oh no, this regular language cannot be recognized by a finite state automaton," we ask them to write out the regular expression for that language. We then translate the symbols into invocations of `EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`, then evaluate the JavaScript expression. The result will be a finite state automaton recognizing the language, disproviong their claim.

---

## Making Regular Expressions More Convenient

Our five special forms--`EMPTY`, `symbol`, `catenation`, `union`, and `zeroOrMore`--can make a recognizer for any regular language. But working with just those forms is tedious: That is why regex dialects include other mechanisms, like being able to specify a string of symbols to match, or the `?` operator that represents "zero or one," or the `+` operator that represents "one or more."

We are now going to define some helpful higher-order functions that work only with the five special forms and each other. Since everything we will now build is built on top of what we already have, we can rest assured that we aren't making anything that couldn't be done by hand with the five tools we already have.

We'll start by making it easier to work with `catenation` and `union`, then we'll move to working with symbols and strings.

---

### upping our catenation and union game

Our `catenation` and `union` functions have an arity of two: They each take two descriptions and return one. when we need to catenate (or take the union of) more than two descriptons, we have to nest our invocations, e.g.

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

Languages often have rules that allow for a certan number of things, but in any order. We can recognize such languages using catenation and alternation. For example, if we want to allow the letters `c`, `a`, and `t` in any order, we can write:

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

We've transformed `catenation` and `union` from binary to n-ary functions. Because we did so by applyimnhg the binary functions we already had, we preserve what we have learned about them, that given descriptions for two or more finite state automata as arguments, the description returned will be for a finite state automaton.

We also created `any` and `string`, recognizers for sets of symbols and strings of symbols. Since we implemented these with `symbol`, `union`, and `catenation`, we know that the descriptions they produce are for finte state automata.

We created `zeroOrOne` and `oneOrMore`, functions that transform recognizers. Since wwe implemented these with `EMPTY`, `union`, and `catenation`, we know that given descriptions of finite state automata, they return descriptions of finite state automata.

In sum, we now have some very convenient tools for building finite state automata that recognize languages. Tools that are very familiar to regex users:

- Regex allows us to specify strings of symbols, e.g. `/foo/`;
- Regex allows us to specify sets of symbols, e.g. `/[abc]/`;
- Regex allows us to specify zero or one, zero or more, and one or more, e.g. `/[abc]?/`, `/[abc]*/`, and `/[abc]+/`.
- Regex allows us to catenate specifications by default, e.g. `/[abc][def]/`;
- Regex allows us to alternate specifications, e.g. `/[abc]|[def]/`.

We also created `permute`. It recognizes any permutation of a set of descriptions. As it builds the result by taking the union of the catenation of existing descriptions, we know that if `permute` is given descriptions of finite state automata, it also returns a description of a finite state automaton.

---

## A Recognizer That Recognizes Finite State Machine Descriptions

Armed with our tools, we can build a finite state automaton that recognizes descriptions of finite state automata. It recognizes a subset of all of the possible ASCII characters we might build such recognizers to recognize, but it gets the point across:

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

This "compiles" to a description of a recognizer with [2,361,529 states](/assets/supplementa/pushdown/description.pp.json.zip)!

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