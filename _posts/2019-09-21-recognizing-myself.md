---
title: "Computing Machines that Recognize Themselves, Part I: Finite state automata"
tags: [recursion,allonge,mermaid,wip,noindex]
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

<!-- TODO: disambiguate adn clarify finite state automaton/a, recognizer, acceptor, deterministic finite state machine, &c. -->

# [Table of Contents](#table-of-contents)

### [Prelude](#prelude)

  - [today's essay](#todays-essay)
  - [before we get started, a brief recapitulation of the previous essay](#before-we-get-started-a-brief-recapitulation-of-the-previous-essay)
  - [terminology](#terminology)

### [The Problem Statement](#the-problem-statement-1)

  - [a language for describing finite state recognizers](#a-language-for-describing-finite-state-recognizers)
  - [implementing our example automaton](#implementing-our-example-automaton)

### [Composeable Recognizers](#composeable-recognizers-1)

[A few words about Functional Composition](#a-few-words-about-functional-composition)

[Refactoring OO Recognizers into Data](#refactoring-oo-recognizers-into-data)

[Catenating Descriptions](#catenating-descriptions)

  - [catenationFSA(first, second)](#catenationfsafirst-second)
  - [catenation(first, second)](#catenationfirst-second)
  - [what we have learned from catenating descriptions](#what-we-have-learned-from-catenating-descriptions)

[Takng the Union of Descriptions](#taking-the-union-of-descriptions)

  - [fixing a problem with union(first, second)](#fixing-a-problem-with-unionfirst-second)
  - [what we have learned from taking the union of descriptions](#what-we-have-learned-from-taking-the-union-of-descriptions)

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

We'll need to be a bit more specific. Finite state automata can do a lot of things. Some finite state automata recognize statements in languages, where the staements consist of ordered and finite collections of symbols. We will call these **finite state recognizers**, and we are only concerned with finite state recognizers in this essay.

Thus, we will not—of course—ask whether a finite state automaton can be hooked up to cameras and recognize whether a phyiscal scene contains a physical state machine. We also will not ask whether a finite state automaton can recognize a `.png` encoding of a diagram, and recognize whther it is a diagram of a valid finite state state machine:

<div class="mermaid">
  graph LR
    start(start)-->|0|zero
    zero-.->|end|recognized(recognized)
    start-->|1|one[one or more]
    one-->|0 or 1|one
    one-.->|end|recognized;
</div>

Instead, we will formulate a language for describing finite state recognizers, and ask whether a finite state recognizer can be devised to recognize valid statements in the language that describes finite state recognizers. If we can make such a recognizer, we will have shown that in at least one sense, a finite state recognizer can recognize finite state recognizers.

That is not, of course, the exact same thing as asking whether a regex can recognize a valid regex. Regexen are a language of their own, and it is possible that a regular expression might be more powerful than a finite state recognizer, and it is equally possible (certain, in fact) that the language used to describe a regex cannot be parsed with finite state recognizers.[^cannot-parse]

[^cannot-parse]: How certain? Well, all regular expression languages in wide usage have the ability to create *groups* using parentheses, e.g. `/Reg(?:inald)?/` is a regular expression containing an optional non-capturing group. Groups in regex can be nested, and must be properly nested and balanced for a regex to be valid. We know from [A Brutal Look at Balanced Parentheses...][brutal] that we cannot recognize balanced (or even nested) parentheses with just a finite state recognizer, so therefore we cannot recognize valid regexen with a finite state recognizer.

But we'll start with devising a finite state recognizer that recognizes syntactically valid descriptions of finite state recognizers, and see where that takes us.

### a language for describing finite state recognizers

Before we can write finite state recognizers that recognize the descriptions of finite state recognizers, we need a language for describing finite state recognizers.

We don't need to invent a brand-new format, there is already an accepted [formal definition][fdfsa] for Pushdown Automata. Mind you, it involves mathematical symbols that are unfamiliar to some programmers, so without dumbing it down, we will create our own language that is equivalent to the full formal definition, but expressed in JSON.

[fdfsa]: https://en.wikipedia.org/wiki/Finite-state_machine#Mathematical_model

JSON has the advantage that it is a language in the exact sense we want: An ordered set of symbols. So we will describe finite state recognizers using JSON, and we will attempt to write a finite state recognizer that recognizes strings that are valid JSON descriptions of finite state recognizers.[^natch]

[^natch]: Naturally, if we have a valid description of a finte state recognizer that recognizes vald descriptions of finite state recognizers... We expect it to recognize itself.

Now what do we need to encode? Finite state recognizers are defined as a quintuple of `(Σ, S, s, ẟ, F)`, where:

  - `Σ` is the alphabet of symbols this recognizer operates upon.
  - `S` is the set of states this recognizer can be in.
  - `s` is the initial or "start" state of the recognizer.
  - `ẟ` is the recognizer's "state transition function" that governs how the recognizer changes states while it consumes symbols from the sentance iit is attempting to recognize.
  - `F` is the set of "final" states. If the recognizer is in one of these states when the input ends, it has recognzied the sentance.

We can encode these with JSON. We'll use descriptive words rather than matehmatical symbols, but note that if we wanted to use the mathematical symbols, everything we're doing would work just as well.

Or JSON representation will represent the quintuple as a Plain Old JavaScript Object (or "POJO"), rather than an array. This makes it easier to document what each element means, and it alsso makes it easy for some of the elements to be optional:

```javascript
{
  // elements...
}
```

The recognizer's `alphabet`, `Σ`, will be _optional_. If present, it will be encoded as a string. In this example, we are encoding the alphabet of a recognizer that operates on zeroes and ones:

```javascript
{
  'alphabet': '01'
}
```

If `alphabet` is present, it must be complete:[^complete-alphabet]

[^complete-alphabet]: A complete alphabet is one in which every symbol used by the transition function is a member of the alphabet.

The recognizer's `states`, `S`, will also be _optional_. If present, it will be encoded as list of strings representing the names of the states. States in our recognizer must have unique names. The names need not be constructed from the recognizer's alphabet, they are for our convenience:

```javascript
{
  'states': ['start', 'zero', 'one or more']
}
```

As with `alphabet`, if `states` is present, the set of states must be complete.[^complete-states]

[^complete-states]: For the set of states to be complete, it must contain the start or initial state, all of the final states, and every state used by the transition function.

The recognizer's initial, or `start` state is required. It is a string respresenting the name of the initial state:

```javascript
{
  'start': `start`
}
```

The recognizer's set of final, or `accepting` states is required. It is encoded as a list of strings representing the names of the final states.

```javascript
{
  'accepting': [`zero`, `one or more`]
}
```

The recognizer's state transition function, `ẟ`, is represented as a set of `transitions`, encoded as a list of POJOs, each of which represents exactly one transition:

```javascript
{
  'transitions': [
    // list of transitions...
  ]
}
```

Each transition defines a change in the recognizer's state. Transitions are formally defined as triples of the form `(p,a, q)`:

 - `p` is the state the recognizer is currently in.
 - `a` is the input symbol  consumed.
 - `q` is the state the recognizer will be in after completing this transition. It can be the same as `p`, meaning that it consumes a symbol and remains in the same state.

 We can represent this with POJOs. For readability by those unfamiliar with the formal notation, we will use the words `from`, `consume`, and `to`. This may feel like a lot of typing compared to the formal symbols, but we'll get the computer do do our writing for us, and it doesn't care.

Thus, one possible set of transitions might be encoded like this:

```javascript
{
  'transitions': [
    { 'from': 'start', 'consume': '0', 'to': 'zero' },
    { 'from': 'start', 'consume': '1', 'to': 'one or more' },
    { 'from': 'one or more', 'consume': '0', 'to': 'one or more' },
    { 'from': 'one or more', 'consume': '1', 'to': 'one or more' }
  ]
}
```

Putting it all together, we have:

```json
{
  'alphabet': '01',
  'states': ['start', 'zero', 'one or more'],
  'start': `start`,
  'transitions': [
    { 'from': 'start', 'consume': '0', 'to': 'zero' },
    { 'from': 'start', 'consume': '1', 'to': 'one or more' },
    { 'from': 'one or more', 'consume': '0', 'to': 'one or more' },
    { 'from': 'one or more', 'consume': '1', 'to': 'one or more' }
  ],
  'accepting': [`zero`, `one or more`]
}
```

Or representation translates directly to our simplified state diagram:

<div class="mermaid">
  graph LR
    start(start)-->|0|zero
    zero-.->|end|recognized(recognized)
    start-->|1|one[one or more]
    one-->|0 or 1|one
    one-.->|end|recognized;
</div>

This finite state recognizer recognizes binary numbers.

---

### implementing our example automaton

Here is a function that takes as its input the definition of an automaton, and returns a recognizer function:

```javascript
function automate ({ start, accepting, transitions }) {
  // map from from states to the transitions defined for that from state
  const stateMap =
    transitions
      .reduce(
        (acc, transition) => {
          const { from } = transition;

          if (from === accepting) {
            console.log(`Transition ${JSON.stringify(transition)} is a transition from the accepting state. This is not allowed.`)
            return;
          }

          if (!acc.has(from)) {
            acc.set(from, []);
          }
          acc.get(from).push(transition);

          return acc;
        },
        new Map()
      );

      // given a starting state defined by { internal, external, string },
      // returns a set of next states
  function performTransition ({ string, external, internal }) {
    const transitionsForThisState = stateMap.get(internal);

    if (transitionsForThisState == null) {
      // a deliberate fail
      return [];
    }

    return transitionsForThisState
      .reduce(
        (acc, {consume, pop, push, to}) => {

          let string2 = string;
          if (consume === '') {
            if (string !== '') return acc; // not a match
          } else if (consume != null) {
            if (string === '') return acc; // not a match
            if (string[0] !== consume) return acc; // not a match

            string2 = string.substring(1); // match and consume
          }

          const external2 = external.slice(0);
          if (pop != null) {
            if (external2.pop() !== pop) return acc; // not a match
          }
          if (push != null) {
            external2.push(push);
          }

          const internal2 = (to != null) ? to : internal;

          acc.push({
            string: string2, external: external2, internal: internal2
          });

          return acc;
        },
        []
      );
  }

  return function (string) {
    let currentStates = [
      { string, external: [], internal: start }
    ];

    while (currentStates.length > 0) {
      currentStates = currentStates.flatMap(performTransition);

      if (currentStates.some( ({ internal }) => internal === accepting )) {
        return true;
      }
    }

    return false;
  }
}
```

And here we are using it with our definition for recognizing binary numbers. Note that it does not `pop` anything from the stack, which means that it is a finite-state automaton:

```javascript
function test (description, examples) {
  const recognizer = automate(description);

  for (const example of examples) {
    console.log(`'${example}' => ${recognizer(example)}`);
  }
}

const binary = {
  "start": "start",
  "accepting": "accepting",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "zero", "consume": "", "to": "accepting" },
    { "from": "start", "consume": "1", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "0", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "1", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "", "to": "accepting" }
  ]
};

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

Here we use it with a description for balanced parentheses. This does `push` and `pop` things from the stack, so we know it is a pushdown automaton. Is it deterministic? If we look at the description carefully, we can see that every transition is guaranteed to be unambiguous. It can only ever follow one path through the states for any input. Therefore, it is a deterministic pushdown automaton:

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

test(balanced, [
  '', '(', '()', ')(', '()()', '{()}',
	'([()()]())', '([()())())',
	'())()', '((())(())'
]);
  //=>
    '' => true
    '(' => false
    '()' => true
    ')(' => false
    '()()' => true
    '{()}' => true
    '([()()]())' => true
    '([()())())' => false
    '())()' => false
    '((())(())' => false
```

Finally, even- and odd-length binary palindromes. Not only does `palindrome` both `push` and `pop`, but it has more than one state transition for every input it consumes, making it a non-deterministic pushdown automaton. We call these just pushdown automatons:

```javascript
const palindrome = {
  "start": "start",
  "accepting": "accepting",
  "transitions": [
    { "from": "start", "push": "⚓︎", "to": "first" },
    { "from": "first", "consume": "0", "push": "0", "to": "left" },
    { "from": "first", "consume": "1", "push": "1", "to": "left" },
    { "from": "first", "consume": "0", "to": "right" },
    { "from": "first", "consume": "1", "to": "right" },
    { "from": "left", "consume": "0", "push": "0" },
    { "from": "left", "consume": "1", "push": "1" },
    { "from": "left", "consume": "0", "to": "right" },
    { "from": "left", "consume": "1", "to": "right" },
    { "from": "left", "consume": "0", "pop": "0", "to": "right" },
    { "from": "left", "consume": "1", "pop": "1", "to": "right" },
    { "from": "right", "consume": "0", "pop": "0" },
    { "from": "right", "consume": "1", "pop": "1" },
    { "from": "right", "consume": "", "pop": "⚓︎", to: "accepting" }
  ]
};

test(palindrome, [
  '', '0', '00', '11', '111', '0110',
  '10101', '10001', '100111',
  '1001', '0101', '100111',
  '01000000000000000010'
]);
  //=>
    '' => false
    '0' => true
    '00' => true
    '11' => true
    '111' => true
    '0110' => true
    '10101' => true
    '10001' => true
    '100111' => false
    '1001' => true
    '0101' => false
    '100111' => false
    '01000000000000000010' => true
```

We now have a function, `automate`, that takes a data description of a finite state automaton, deterministic pushdown automaton, or pushdown automaton, and returns a recognizer function.

# Composeable Recognizers

One of programming's "superpowers" is _composition_, the ability to build things out of smaller things, and especially, to reuse those smaller things to build other things. Composition is built into our brains: When we speak human languages, we use combinations of sounds to make words, and then we use combinations of words to make sentences, and so it goes building layer after layer until we have things like complete books.

Composeable recognizers and patterns are particularly interesting. Just as human languages are built by layers of composition, all sorts of mechanical languages are structured using composition. JSON is a perfect example: A JSON element like a list is composed of zero or more arbitrary JSON elements, which themselves could be lists, and so forth.

If we want to build a recognizer for JSON, it would be ideal to build smaller recognizers for things like strings or numbers, and then use composition to build recognizers for elements like lists and "objects."

This is the motivation for the first part of our exploration: We want to make simple recognizers, and then use composition to make more complex recognizers from the simple recognizers.

## A few words about Functional Composition

We explored this exact idea in [Pattern Matching and Recursion]. We used functions as recognizers, and then we used functional composition to compose more complex recognizers from simpler recognizers.

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html "Pattern Matching and Recursion"

For example, `just` was function that took a string and returned a recognizer that recognized just that string. `follows` was a higher-order function that catenationd recognizers together, like this:

```javascript
follows(just('fu'), just('bar'))('foobar')
  //=> false

follows(just('fu'), just('bar'))('fubar\'d')
  //=> 'fubar'
```

`cases` was another higher-order function, it took two or more recognizer and made a recognizer that recognized strings that any of its recognizers recognized:

```javascript
const ones =
  input => cases(
    just('1'),
    follows(just('1'), ones)
  )(input);

ones('1')
  //=> '1'

ones('111')
  //=> '111'
```

Now there are lots of ways that we can write a function that takes two or more arguments and then returns a new function. What made `follows` and `cases` examples of functional composition is not just that they took functions as arguments and returned functions, but that the functions they return invoke the original functions in order to compute the result.

Here they are:

```javascript
const follows =
  (...patterns) =>
    input => {
      let matchLength = 0;
      let remaining = input;

      for (const pattern of patterns) {
        const matched = pattern(remaining);

        if (matched === false) return false;

        matchLength = matchLength + matched.length;
        remaining = input.slice(matchLength);
      }

      return input.slice(0, matchLength);
    };

const cases =
  (...patterns) =>
    input => {
      const matches = patterns.map(p => p(input)).filter(m => m !== false);

      if (matches.length === 0) {
        return false;
      } else {
        return matches.sort((a, b) => a.length > b.length ? -1 : +1)[0]
      }
    };
```

This is a very powerful technique in programming, one of the foundational ideas that can be traced back to the Lambda Calculus and Combinatorial Logic. And it seems very promising. Our Pushdown Automata are objects, but their `.recognize` methods are functions, so with a nip here and a tuck there, we ought to be able to use functions like `follows` and `cases` to compose new recognizers from Pushdown Automata.

But we are actually going to avoid this technique. Functional composition is wonderful, but it has certain problems that are relevant here.

First and foremost, when we compose functions with a new function, we are using all the programming power of JavaScript. We can use loops, recursion, whatever we like. But when we built recognizers out of Finite State Automata, Desterministic Pushdown Automata, or Pushdown Automata, we were constrained to only use very specific computing capabilities.

If we use a function like `follows` to catenate two FSAs together, is the resulting recognizer still equivalent to an FSA? What about two Pushdown Automata? Functions obscure the underlying model of computation. Of course, for practical programming, this is not a concern, and functional composition is a powerful technique.

But for the sake of exploring the computational consequences of composing recognizers, we're going to explore a different technique. We'll start by refactoring our Pushdown Automation.

---

## Refactoring OO Recognizers into Data

We're going to perform one of the more interesting types of refactoring, refactoring functions into data. Of course, functions in JavaScript are first-class entities, which means they are already data in a certain way, namely, they are _values_. Data of the sort you'd find in a classical database like strings, booleans, numbers, and so forth are also values.

So that is the difference? For the purposes of this essay, we shall pay attention to one very important characteristic of data like strings and numbers: Data is entirely transparent and explicit. When we look at a string, we know everything we need to know about it. There is no hidden, encapsulated behaviour.

Whereas, functions encapsulate behaviour. When we inspect a function, we might discover its name and the number of arguments. In some languages, we get type information too. But its internals are a sealed book to us. We don't know its environment, we don't know which variables are closed over. Some implementation allow us to inspect a function's source code, but JavaScript does not.

This is not a hard definition, but for our purposes here, it is sufficient. Functions are opaque, data is transparent.

Why do we want to do this? Let's consider our design for Pushdown Automata. Each automata has two parts: There's code that "runs the automaton," it's in the parent class `PushdownAutomata`. Then there are the specific methods that make up the states of an automaton, their in the concrete child class, e.g. `BinaryPalindrome`.

Consider a different design. Let's say we had a format for defining the states of a Pushdown Automaton in data, pure data. We could hand this to `PushdownAutomata`, and it could give us back a recognizer function, instead of extending a class. What does this give us? Well, the data that defines the states is fully transparent. We can inspect it, we can write functions that modify it, and most especially, we can explore whether given the data for two different recognizers, we can compute the data for a recognizer that composes the recognizers.

But let's not get ahead of ourselves. Let's start with our refactoring:



---

## Catenating Descriptions

We could, of course, use functional composition to compose the recognizers that we build with our data descriptions, but as noted above, that would make it difficult to reason about the characteristics of a recognizer we compose from two or more other recognizers. So instead, as planned, we'll work on _composing the data descriptions_.

We'll begin by catenating descriptions. Here is the finite state automaton for a very simple recognizer. It recognizes a sequence of one or more exclamation marks:

<div class="mermaid">
  graph LR
    start(start)-->|!|endable
    endable-.->|end|recognized(recognized)
    endable-->|!|endable;
</div>

And here's another for recognizing one or more question marks:

<div class="mermaid">
  graph LR
    start(start)-->|?|endable
    endable-.->|end|recognized(recognized)
    endable-->|?|endable;
</div>

If we were to catenate these two recognizers, what would it look like? Perhaps this:

<div class="mermaid">
  graph LR
    start(start)-->|!|endable
    endable-->|!|endable
    endable-.->start-2
    start-2-->|?|endable-2
    endable-2-->|?|endable-2
    endable-2-.->|end|recognized(recognized)
</div>

And here are their descriptions:

```javascript
const exclamatory = {
  "start": "start",
  "accepting": "accepting",
  "transitions": [
    { "from": "start", "consume": "!", "to": "endable" },
    { "from": "endable", "consume": "!" },
    { "from": "endable", "consume": "", "to": "accepting" }
  ]
};

const interrogative = {
  "start": "start",
  "accepting": "accepting",
  "transitions": [
    { "from": "start", "consume": "?", "to": "endable" },
    { "from": "endable", "consume": "?" },
    { "from": "endable", "consume": "", "to": "accepting" }
  ]
};
```

What would the descriptions look like when catenated? Perhaps this:

```JSON
const interrobang = {
  "start": "start",
  "accepting": "accepting",
  "transitions": [
    { "from": "start", "consume": "!", "to": "endable" },
    { "from": "endable", "consume": "!" },
    { "from": "endable", "to": "start-2" },
    { "from": "start-2", "consume": "?", "to": "endable-2" },
    { "from": "endable-2", "consume": "?" },
    { "from": "endable-2", "consume": "", "to": "accepting" }
  ]
};
```

We've made a couple of changes:

In the second description, we changed `start` to `start-2`, so that it would not conflict with `start` in the first recognizer. We always have to rename states so that there are no conflicts between the two recognizers.

Second, in the first recognizer, wherever we had a `"to": "accepting"`, we changed it to `"to": "start-2"`. Transitions to the recognized state of the first recognizer are now transitions to the start state of the second recognizer.

Third, wherever we had a `"consume": ""` in the first recognizer, we removed it outright. Any transition that is possible at the end of a string when the recognizer is running  by itself, is possible at any point in the string when the recognizer is catenated with another recognizer.

---

### catenationFSA(first, second)

Let's start by writing a function to catenate any two finite state recognizer descriptions. First, we'll need to rename states in the second description so that they don't conflict with the first description.

Here's a function, `prepareSecondForCatenation` that takes two descriptions, and returns a copy of the second description with conflicts renamed, along with the helper functions it uses:

```javascript
function statesOf(description) {
  return description
    .transitions
      .reduce(
        (states, { from, to }) => {
          if (from != null) states.add(from);
          if (to != null) states.add(to);
          return states;
        },
        new Set([description.start, description.accepting])
      );
}

function renameStates (nameMap, description) {
  const translate =
    before =>
      (nameMap[before] != null) ? nameMap[before] : before;

  return {
    start: translate(description.start),
    accepting: translate(description.accepting),
    transitions:
    	description.transitions.map(
      	({ from, consume, pop, to, push }) => {
          const transition = { from: translate(from) };
          if (consume != null) transition.consume = consume;
          if (pop != null) transition.pop = pop;
          if (to != null) transition.to = translate(to);
          if (push != null) transition.push = push;

          return transition;
        }
      )
  };
}

function resolveCollisions(taken, description) {
  const takenNames = new Set(taken);
  const descriptionNames = statesOf(description);

  const nameMap = {};

  for (const descriptionName of descriptionNames) {
    let name = descriptionName;
    let counter = 2;
    while (takenNames.has(name)) {
      name = `${descriptionName}-${counter++}`;
    }
    if (name !== descriptionName) {
  		nameMap[descriptionName] = name;
    }
    takenNames.add(name);
  }

  return renameStates(nameMap, description);
}

function prepareSecondForCatenation (start, accepting, first, second) {
  const uncollidedSecond =  resolveCollisions(statesOf(first), second);

  const acceptingSecond =
    uncollidedSecond.accepting === accepting
  	  ? uncollidedSecond
      : renameStates({ [uncollidedSecond.accepting]: accepting }, uncollidedSecond);

  return acceptingSecond;
}
```

And here it is in action:

```javascript
const catenatableInterrogative =
  prepareSecondForCatenation("start", "accepting", exclamatory, interrogative)
    //=>
      {
        "start": "start-2",
        "accepting": "accepting",
        "transitions": [
          { "from": "start-2", "consume": "?", "to": "endable-2" },
          { "from": "endable-2", "consume": "?" },
          { "from": "endable-2", "consume": "", "to": "accepting" }
        ]
      }
```

Let's move on and transform the first description. As discussed above, we will eliminate `"consume": ""`, and rename transitions to the first description's accepting state into the second description's start state:

```javascript
function prepareFirstForCatenation(start, accepting, first, second) {
  const nameMap = {
    [first.accepting]: second.start,
    [first.start]: start
  };
  const { transitions } =
    renameStates(nameMap, first);

  return {
    start,
    accepting,
    transitions:
  	  transitions.map(
        ({ from, consume, pop, to, push }) => {
          const transition = { from };
          if (consume != null && consume !== "") transition.consume = consume;
          if (pop != null) transition.pop = pop;
          if (to != null) transition.to = to;
          if (push != null) transition.push = push;

          return transition;
        }
      )
  };
}
```

And here it is in action:

```javascript
const catenatableExclamatory =
  prepareFirstForCatenation("start", "accepting", exclamatory, catenatableInterrogative)
    //=>
      {
        "start": "start",
        "accepting": "accepting",
        "transitions": [
          { "from": "start", "consume": "!", "to": "endable" },
          { "from": "endable", "consume": "!" },
          { "from": "endable", "to": "start-2" }
        ]
      }
```

Stitching them together, we get:[^names]

[^names]: In [Pattern Matching and Recursion], we wrote functions called `follows`, `cases`, and `just` to handle catenating recognizers, taking the union of recognizers, and recognizing strings. In this essay we will use different names for similar functions. Although this may seem confusing, our functions work with descriptions, not with functions, so keeping them separate in our mind can be helpful.

```javascript
function catenation (first, second) {
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
```

And when we try it:

```javascript
const interrobang = catenation(exclamatory, interrogative)
  //=>
    {
      "start": "start",
      "accepting": "accepting",
      "transitions": [
        { "from": "start", "consume": "!", "to": "endable" },
        { "from": "endable", "consume": "!" },
        { "from": "endable", "to": "start-2" },
        { "from": "start-2", "consume": "?", "to": "endable-2" },
        { "from": "endable-2", "consume": "?" },
        { "from": "endable-2", "consume": "", "to": "accepting" }
      ]
    }
```

Perfect. And as we expected, the diagram for `interrobang` is:

<div class="mermaid">
  graph LR
    start(start)-->|!|endable
    endable-->|!|endable
    endable-.->start-2(start-2)
    start-2(start-2)-->|?|endable-2
    endable-2-->|?|endable-2
    endable-2-.->|end|recognized(recognized)
</div>

It's easy to see that `interrobang` recognizes one or more exclamation marks, followed by one or more question marks.

We have succeeded in making a catenation function that catenates the descriptions of two finite state automata, and returns a description of a finite state automaton that recognizes a language consisting of strings in the frist recognizer's language, followed by strings in the second recognizer's language.

There are a few loose ends to wrap up before we can catenate pushdown automata.

---

### catenation(first, second)

Does our code work for pushdown automata? Sort of. It appears to work for catenating any two pushdown automata. The primary trouble, however, is this: A pushdown automaton mutates the stack. This means that when we catenate the code of any two pushdown automata, the code from the first automaton might interfere with the stack in a way that would interfere with the behaviour of the second.

To prevent this from happening, we will introduce some code that ensures that a pushdown automaton never pops a symbol from the stack that it didn't first push there. We will also write some code that ensures that a pushdown automaton restores the stack to the state it was in before it enters its accepting state.

We'll modify the way we prepare the first description:

```javascript
function stackablesOf(description) {
  return description
    .transitions
      .reduce(
        (stackables, { push, pop }) => {
          if (push != null) stackables.add(push);
          if (pop != null) stackables.add(pop);
          return stackables;
        },
        new Set()
      );
}

function isolatedStack (start, accepting, description) {
  const stackables = stackablesOf(description);

  // this is an FSA, nothing to see here
  if (stackables.size === 0) return description;

  // this is a PDA, make sure we clean the stack up
  let sentinel = "sentinel";
  let counter = 2;
  while (stackables.has(sentinel)) {
    sentinel = `${sentinel}-${counter++}`;
  }

  const renamed = resolveCollisions([start, accepting], description);

  const pushSentinel =
    { from: start, push: sentinel, to: renamed.start };

  const popStackables =
    [...stackables].map(
      pop => ({ from: renamed.accepting, pop })
    );

  const popSentinel =
  	{ from: renamed.accepting, pop: sentinel, to: accepting };

  return {
    start,
    accepting,
    transitions: [
      pushSentinel,
      ...renamed.transitions,
      ...popStackables,
      popSentinel
    ]
  };
}
```

This function doesn't change a finite state automaton:

```javascript
isolatedStack("start", "accepting", binary)
  //=>
    {
      "start": "start",
      "accepting": "accepting",
      "transitions": [
        { "from": "start", "consume": "0", "to": "zero" },
        { "from": "zero", "consume": "", "to": "accepting" },
        { "from": "start", "consume": "1", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "0", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "1", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "", "to": "accepting" }
      ]
    }
```

But it does change a pushdown automaton:

```javascript
isolatedStack("start", "accepting", balanced)
  //=>
    {
      "start": "start",
      "accepting": "accepting",
      "transitions": [
        { "from": "start", "push": "sentinel", "to": "start-2" },
        { "from": "start-2", "to": "read", "push": "⚓︎" },
        { "from": "read",  "consume": "(", "to": "read", "push": "(" },
        { "from": "read",  "consume": ")",  "pop": "(", "to": "read" },
        { "from": "read",  "consume": "[", "to": "read", "push": "[" },
        { "from": "read",  "consume": "]",  "pop": "[", "to": "read" },
        { "from": "read",  "consume": "{", "to": "read", "push": "{" },
        { "from": "read",  "consume": "}",  "pop": "{", "to": "read" },
        { "from": "read",  "consume": "",  "pop": "⚓︎", "to": "accepting-2" },
        { "from": "accepting-2",  "pop": "⚓︎" },
        { "from": "accepting-2",  "pop": "(" },
        { "from": "accepting-2",  "pop": "[" },
        { "from": "accepting-2",  "pop": "{" },
        { "from": "accepting-2",  "pop": "sentinel", "to": "accepting" }
      ]
    }
```

And now we can create a safer `prepareFirstForCatenation` function:

```javascript
function isPushdown(description) {
  return stackablesOf(description).size > 0
};

function prepareFirstForCatenation(start, accepting, first, second) {
  const safeFirst =
    (isPushdown(first) && isPushdown(second)) ? isolatedStack(start, accepting, first) : first;

  const nameMap = {
    [safeFirst.accepting]: second.start,
    [safeFirst.start]: start
  };
  const { transitions } =
    renameStates(nameMap, first);

  return {
    start,
    accepting,
    transitions:
  	  transitions.map(
        ({ from, consume, pop, to, push }) => {
          const transition = { from };
          if (consume != null && consume !== "") transition.consume = consume;
          if (pop != null) transition.pop = pop;
          if (to != null) transition.to = to;
          if (push != null) transition.push = push;

          return transition;
        }
      )
  };
}
```

We can check that it isolates the stack:

```javascript
catenation(binary, fraction)
  //=>
    {
      "start": "start",
      "accepting": "accepting-2",
      "transitions": [
        { "from": "start", "consume": "0", "to": "zero" },
        { "from": "zero", "to": "start-2" },
        { "from": "start", "consume": "1", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "0", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "1", "to": "one-or-more" },
        { "from": "one-or-more", "to": "start-2" },
        { "from": "start-2", "consume": "", "to": "accepting-2" },
        { "from": "start-2", "consume": ".", "to": "point" },
        { "from": "point", "consume": "0", "to": "point-zero" },
        { "from": "point", "consume": "1", "to": "endable" },
        { "from": "point-zero", "consume": "", "to": "accepting-2" },
        { "from": "point-zero", "consume": "0", "to": "not-endable" },
        { "from": "point-zero", "consume": "1", "to": "endable" },
        { "from": "not-endable", "consume": "0" },
        { "from": "not-endable", "consume": "1", "to": "endable" },
        { "from": "endable", "consume": "", "to": "accepting-2" },
        { "from": "endable", "consume": "0", "to": "not-endable" },
        { "from": "endable", "consume": "1" }
      ]
    }

catenation(balanced, palindrome)
  //=>
    {
      "start": "start",
      "accepting": "accepting-3",
      "transitions": [
        { "from": "start", "to": "start-2", "push": "sentinel" },
        { "from": "start-2", "to": "read", "push": "⚓︎" },
        { "from": "read", "consume": "(", "to": "read", "push": "(" },
        { "from": "read", "consume": ")", "pop": "(", "to": "read" },
        { "from": "read", "consume": "[", "to": "read", "push": "[" },
        { "from": "read", "consume": "]", "pop": "[", "to": "read" },
        { "from": "read", "consume": "{", "to": "read", "push": "{" },
        { "from": "read", "consume": "}", "pop": "{", "to": "read" },
        { "from": "read", "pop": "⚓︎", "to": "accepting-2" },
        { "from": "accepting-2", "pop": "⚓︎" },
        { "from": "accepting-2", "pop": "(" },
        { "from": "accepting-2", "pop": "[" },
        { "from": "accepting-2", "pop": "{" },
        { "from": "accepting-2", "pop": "sentinel", "to": "start-3" },
        { "from": "start-3", "to": "first", "push": "⚓︎" },
        { "from": "first", "consume": "0", "to": "left", "push": "0" },
        { "from": "first", "consume": "1", "to": "left", "push": "1" },
        { "from": "first", "consume": "0", "to": "right" },
        { "from": "first", "consume": "1", "to": "right" },
        { "from": "left", "consume": "0", "push": "0" },
        { "from": "left", "consume": "1", "push": "1" },
        { "from": "left", "consume": "0", "to": "right" },
        { "from": "left", "consume": "1", "to": "right" },
        { "from": "left", "consume": "0", "pop": "0", "to": "right" },
        { "from": "left", "consume": "1", "pop": "1", "to": "right" },
        { "from": "right", "consume": "0", "pop": "0" },
        { "from": "right", "consume": "1", "pop": "1" },
        { "from": "right", "consume": "", "pop": "⚓︎", "to": "accepting-3" }
      ]
    }

test(catenation(balanced, palindrome), [
  '', '1', '01', '11', '101',
  '()', ')(', '(())0', ')(101',
  '()()101', '()()1010'
]);
  //=>
    '' => false
    '1' => true
    '01' => false
    '11' => true
    '101' => true
    '()' => false
    ')(' => false
    '(())0' => true
    ')(101' => false
    '()()101' => true
    '()()1010' => false
```

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

## Taking the Union of Descriptions

Catenation is not the only way to compose recognizers. The other most important composition is alternation: Given recognizers `A` and `B`, while `catenation(A, B)` recognizes sentences of the form "`A` followed by `B`," `union(A, B)` would recognize sentences of `A` or of `B`.

Implementing alternation is a little simpler than implementing catenation. Once again we have to ensure that the states of the two recognizers are distinct, so we'll rename states to avoid conflicts. Then we make sure that both recognizers share the same `start` and `accepting` states:[^names]

```javascript
function union (first, second) {
  const start = "start";
  const accepting = "accepting";

  const conformingFirst = renameStates(
    { [first.start]: start, [first.accepting]: accepting },
    first
  );

  const renamedSecond = resolveCollisions(statesOf(conformingFirst), second);

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
```

Once again, the diagrams for exclamatory and interrogative:

<div class="mermaid">
  graph LR
    start(start)-->|!|endable
    endable-.->|end|recognized(recognized)
    endable-->|!|endable;
</div>

<div class="mermaid">
  graph LR
    start(start)-->|?|endable
    endable-.->|end|recognized(recognized)
    endable-->|?|endable;
</div>

And now, the alternation of the two rather than the catenation:

```javascript
union(exclamatory, interrogative)
  //=>
    {
      "start": "start",
      "accepting": "accepting",
      "transitions": [
        { "from": "start", "consume": "!", "to": "endable" },
        { "from": "endable", "consume": "!" },
        { "from": "endable", "consume": "", "to": "accepting" },
        { "from": "start", "consume": "?", "to": "endable-2" },
        { "from": "endable-2", "consume": "?" },
        { "from": "endable-2", "consume": "", "to": "accepting" }
      ]
    }
```

And we can see from the diagram that we now have a recognizer that matches exclamation marks, or question marks, but not both:

<div class="mermaid">
  graph LR
    start(start)-->|!|endable
    endable-->|!|endable
    endable-.->|end|recognized(recognized)
    start(start)-->|?|endable-2
    endable-2-->|?|endable-2
    endable-2-.->|end|recognized(recognized)
</div>

---

### fixing a problem with union(first, second)

Sharing the `start` state works just fine as long as it is a root state, i.e., No transitions lead back to it. Consider this recognizer that recognizes zero or more sequences of the characters `^H` (old-timers may remember this as a shorthand for "backspace" popular in old internet forums):

<div class="mermaid">
  graph LR
    start(start)-->|^|ctrl
    start-.->|end|recognized(recognized)
    ctrl-->|H|start
</div>

The way `union` works right now, is that if we evaluate `union(backspaces, exclamatory)`, we get this:

<div class="mermaid">
  graph LR
    start(start)-->|^|ctrl
    start-.->|end|recognized(recognized)
    ctrl-->|H|start
    start(start)-->|!|endable
    endable-.->|end|recognized(recognized)
    endable-->|!|endable;
</div>

If we follow it along, we see that it does correctly recognize "", "^H", "^H^H", "!", "!!", and so forth. But it also recognizes strings like "^H^H!!!!!", which is not what we want. The problem is that `backspace` has a start state that is not a root: It has at least one transition leading into it.

We can fix it by changing `union` so that when given a recognizer with a start state that is not a root, it adds a root for us, like this:

<div class="mermaid">
  graph LR
    start(start)-->start-2
    start-2-->|^|ctrl
    start-2-.->|end|recognized(recognized)
    ctrl-->|H|start-2
</div>

After "adding a root," the result of `union(backspaces, exclamatory)` would then be:

<div class="mermaid">
  graph LR
    start(start)-->start-2
    start-2-->|^|ctrl
    start-2-.->|end|recognized(recognized)
    ctrl-->|H|start-2
    start(start)-->|!|endable
    endable-.->|end|recognized(recognized)
    endable-->|!|endable;
</div>

Here's our updated code:

```javascript
function rootStart (description) {
  const { start, accepting, transitions } = description;
  const needsRoot =
    !!(
      transitions
        .find(
          ({ from, to }) => to === start || (from === start && to == null)
        )
    );

  if (needsRoot) {
    const startShifted = resolveCollisions([description.start], description);

    return {
      start,
      accepting,
      transitions:
      	[{ from: start, to: startShifted.start }]
      	  .concat(
            startShifted.transitions
          )
    }
  } else {
    return description;
  }
}

function union (first, second) {
  const start = "start";
  const accepting = "accepting";

  const rootFirst = rootStart(first);
  const rootSecond = rootStart(second);

  const conformingFirst = renameStates(
    { [rootFirst.start]: start, [rootFirst.accepting]: accepting },
    rootFirst
  );

  const renamedSecond = resolveCollisions(statesOf(conformingFirst), rootSecond);

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
```

And in action:

```javascript
const backspaces = {
  start: "start",
  accepting: "accepting",
  transitions: [
    { from: "start", consume: "^", to: "ctrl" },
    { from: "start", consume: "", to: "accepting" },
    { from: "ctrl", consume: "H", to: "start" }
  ]
}

const exclamatory = {
  "start": "start",
  "accepting": "accepting",
  "transitions": [
    { "from": "start", "consume": "!", "to": "endable" },
    { "from": "endable", "consume": "!" },
    { "from": "endable", "consume": "", "to": "accepting" }
  ]
};

union(backspaces, exclamatory)
  //=>
    {
      "start": "start",
      "accepting": "accepting",
      "transitions": [
        { "from": "start", "to": "start-2" },
        { "from": "start-2", "consume": "^", "to": "ctrl" },
        { "from": "start-2", "consume": "", "to": "accepting" },
        { "from": "ctrl", "consume": "H", "to": "start-2" },
        { "from": "start", "consume": "!", "to": "endable" },
        { "from": "endable", "consume": "!" },
        { "from": "endable", "consume": "", "to": "accepting" }
      ]
    }
```

And as we hoped, it is exactly the recognizer we wanted:

<div class="mermaid">
  graph LR
    start(start)-->start-2
    start-2-->|^|ctrl
    start-2-.->|end|recognized(recognized)
    ctrl-->|H|start-2
    start(start)-->|!|endable
    endable-.->|end|recognized(recognized)
    endable-->|!|endable;
</div>

---

### what we have learned from taking the union of descriptions

Once again, we have developed some confidence that given any two finite state recognizers, we can construct a union recognizer that is also a finite state automaton. Likewise, if either or both of the recognizers are pushdown automata, we have confidence that we can construct a recognizer that recognizes either language that will also be a pushdown automaton.

Coupled with what we learned from catenating recognizers, we now can develop the conjecture that "can be recognized with a pushdown automaton" is a transitive relationship: We can build an expression of arbitrary complexity using catenation and union, and if the recognizers given were pushdown automata (or simpler), the result will be a pushdown automaton.

This also tells us something about languages: If we have a set of context-free languages, all the languages we can form using catenation and alternation, will also be context-free languages.

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

    const renamedSecond = resolveCollisions(statesOf(conformingFirst), second);

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