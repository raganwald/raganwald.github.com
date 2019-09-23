---
title: "From Pushdown Automata to Self-Recognition"
tags: [recursion,allonge,mermaid,wip]
---

This essay continues from where [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata] left off. Familiarity with its subject matter is a prerequisite for exploring the ideas in this essay.

[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html#implementing-pushdown-automata "[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]"

---

### recapitulation

In [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata], we began with a well-known programming puzzle: _Write a function that determines whether a string of parentheses is "balanced," i.e. each opening parenthesis has a corresponding closing parenthesis, and the parentheses are properly nested._

In pursuing the solution to this problem, we constructed machines that could recognize "sentences" in languages. We saw that some languages can be recognized with Finite State Automata. Languages that require a finite state automaton to recognize them are _regular languages_.

We also saw that balanced parentheses required a more powerful recognizer, a Deterministic Pushdown Automaton. Languages that require a deterministic pushdown automaton to recognize them are _deterministic context-free languages_.

We then went a step further and considered the palindrome problem, and saw that there were languages--like palindromes with a vocabulary of two or more symbols--that could not be recognized with Deterministic Pushdown Automata, and we needed to construct a [Pushdown Automaton] to recognize palindromes. Languages that require a pushdown automaton to recognize them are _context-free languages_.

[Pushdown Automaton]: https://en.wikipedia.org/wiki/Pushdown_automaton

We implemented pushdown automata using a classes-with-methods approach, the complete code is [here][pushdown.oop.es6].

[pushdown.oop.es6]: https://gist.github.com/raganwald/41ae26b93243405136b786298bafe8e9#file-pushdown-oop-es6

---

# Table of Contents

[Composeable Recognizers](#composeable-recognizers)

- [a few words about functional composition](#a-few-words-about-functional-composition)

[Refactoring OO Recognizers into Data](#refactoring-oo-recognizers-into-data)

  - [a data format for automata](#a-data-format-for-automata)
  - [an example automaton](#an-example-automaton)
  - [implementing our example automaton](#implementing-our-example-automaton)

[Catenating Descriptions](#catenating-descriptions)

  - [catenateFSA(first, second)](#catenatefsafirst-second)
  - [catenate(first, second)](#catenatefirst-second)
  - [what we have learned from catenating descriptions](#what-we-have-learned-from-catenating-descriptions)

[Alternating Descriptions](#alternating-descriptions)

  - [fixing a problem with alternate(first, second)](#fixing-a-problem-with-alternatefirst-second)
  - [what we have learned from alternating descriptions](#what-we-have-learned-from-alternating-descriptions)

[Fun with Catenation and Alternation](#fun-with-catenation-and-alternation)

---

# Composeable Recognizers

One of programming's "superpowers" is _composition_, the ability to build things out of smaller things, and especially, to reuse those smaller things to build other things. Composition is built into our brains: When we speak human languages, we use combinations of sounds to make words, and then we use combinations of words to make sentences, and so it goes building layer after layer until we have things like complete books.

Composeable recognizers and patterns are particularly interesting. Just as human languages are built by layers of composition, all sorts of mechanical languages are structured using composition. JSON is a perfect example: A JSON element like a list is composed of zero or more arbitrary JSON elements, which themselves could be lists, and so forth.

If we want to build a recognizer for JSON, it would be ideal to build smaller recognizers for things like strings or numbers, and then use composition to build recognizers for elements like lists and "objects."

This is the motivation for the first part of our exploration: We want to make simple recognizers, and then use composition to make more complex recognizers from the simple recognizers.

### a few words about functional composition

We explored this exact idea in [Pattern Matching and Recursion]. We used functions as recognizers, and then we used functional composition to compose more complex recognizers from simpler recognizers.

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html "Pattern Matching and Recursion"

For example, `just` was function that took a string and returned a recognizer that recognized just that string. `follows` was a higher-order function that catenated recognizers together, like this:

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

### a data format for automata

We don't need to invent a brand-new format, there is already an accepted [formal definition][fdpda] for Pushdown Automata. Mind you, it involves mathematical symbols that are unfamiliar to some programmers, so without dumbing it down, we will create our own format that is equivalent to the full formal definition, but expressed in JSON.

[fdpda]: https://en.wikipedia.org/wiki/Pushdown_automaton#Formal_definition

We start with the definition of a _transition_. A transition defines a change in the automaton's state. Transitions are formally defined as tuples of the form `(p,a,A,q,⍺)`:

 - `p` is the state the automaton is currently in.
 - `a` is the input symbol being consumed. This can be empty, meaning that the machine does not have to consume an input symbol to perform this transition. To indicate that the transition is to succeed when there ar eno more symbols, we will use the empty string, `''`. (In our previous implementation, we used a special symbol called END).
 - `A` is the topmost stack symbol, which is popped off the stack. This can be empty, meaning that the machine does not have to pop a symbol from the stack to perform this transition.
 - `q` is the state the automaton will be in after completing this transition. It can be the same as `q`, meaning that it might perform some action with the input and/or stack and remain in the same state.
 - `⍺` is a symbol to push onto the stack. This can be empty, meaning that the machine does not have to push a symbol onto the stack to perform this transition.

 We can represent this with POJOs. For readability by those unfamiliar with the formal notation, we will use the words `from`, `consume`, `pop`, `to`, and `push`. This may feel like a lot of typing compared to the formal symbols, but we'll get the computer do do our writing for us, and it doesn't care.

 An automaton is a set of such transitions, along with:

 - A *start state*,
 - A set of _accepting states_.
 - A starting symbol for the stack.

(There are some other things, like the set of all possible input symbols, and the stack alphabet. However, those can be inferred by examining the set of transitions, and are not important to what we're trying to accomplish.)

We can make a few simplifying adjustments:

First, we can presume that there is just one accepting state, not a set of accepting states. This does not reduce the power of our automata, as given a set of accepting states, we can write transitions that transition from those states to a single state, so any automaton with a set of accepting states can be mechanically transformed into an equivalent automaton that has just one accepting state.

Second, we can have our automata assume that the stack is empty when the automaton begins. This does not reduce the power of our automata, as given a desired starting symbol, we can rewrite an automaton such that its start state pushes the desired symbol onto the stack before continuing with the rest of its logic.

This reduces our definition to only requiring a start state, and accepting state, and a set of transitions, like this: `{ start, accepting, transitions }`.

Finally, we will stipulate that there can never be a transition from an accepting state. There are some uses for such descriptions, but it is always possible to write a description that does exactly the same thing without transitions from the accepting state, so that's what we'll insist on.

---

### an example automaton

Here is a deterministic finite automaton that recognizes binary numbers:

<div class="mermaid">
  graph LR
    start(start)-->|0|zero
    zero-.->|end|recognized(recognized)
    start-->|1|one[one or more]
    one-->|0 or 1|one
    one-.->|end|recognized;
</div>

And here is how we would represent it with data:

```JSON
{
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "consume": "0", "to": "zero" },
    { "from": "zero", "consume": "", "to": "RECOGNIZED" },
    { "from": "START", "consume": "1", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "0", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "1", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "", "to": "RECOGNIZED" }
  ]
}
```

(As an aside, any definition that does not include any `pop` elements is equivalent to a finite automaton, even if it is being interpreted by a framework that supports pushdown automata.)

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
const binary = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "consume": "0", "to": "zero" },
    { "from": "zero", "consume": "", "to": "RECOGNIZED" },
    { "from": "START", "consume": "1", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "0", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "1", "to": "one-or-more" },
    { "from": "one-or-more", "consume": "", "to": "RECOGNIZED" }
  ]
};

test(automate(binary), [
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

And another for balanced parentheses. This does `push` and `pop` things from the stack, so we know it is a pushdown automaton. Is it deterministic? If we look at the description carefully, we can see that every transition is guaranteed to be unambiguous. It can only ever follow one path through the states for any input. Therefore, it is a deterministic pushdown automaton:

```javascript
const balanced = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "push": "⚓︎", "to": "read" },
    { "from": "read", "consume": "(", "push": "(", "to": "read" },
    { "from": "read", "consume": ")", "pop": "(", "to": "read" },
    { "from": "read", "consume": "[", "push": "[", "to": "read" },
    { "from": "read", "consume": "]", "pop": "[", "to": "read" },
    { "from": "read", "consume": "{", "push": "{", "to": "read" },
    { "from": "read", "consume": "}", "pop": "{", "to": "read" },
    { "from": "read", "consume": "", "pop": "⚓︎", "to": "RECOGNIZED" }
  ]
};

test(automate(balanced), [
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

Finally, even- and odd-length binary palindromes. Not only does it `push` and `pop`, but it has more than one state transition for every input it consumes, making it a non-deterministic pushdown automaton. We call these just pushdown automatons:

```javascript
const palindrome = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "push": "⚓︎", "to": "first" },
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
    { "from": "right", "consume": "", "pop": "⚓︎", to: "RECOGNIZED" }
  ]
};

test(automate(palindrome), [
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

---

## Catenating Descriptions

We could, of course, use functional composition to compose the recognizers that we build with our data descriptions, but as noted above, that would make it difficult to reason about the characteristics of a recognizer we compose from two or more other recognizers. So instead, as planned, we'll work on _composing the data descriptions_.

We'll begin by catenating descriptions. Here is the finite state machine for a very simple recognizer. It recognizes a sequence of one or more exclamation marks:

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
    endable-.->START-2
    START-2-->|?|endable-2
    endable-2-->|?|endable-2
    endable-2-.->|end|recognized(recognized)
</div>

And here are their descriptions:

```javascript
const exclamatory = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "consume": "!", "to": "endable" },
    { "from": "endable", "consume": "!" },
    { "from": "endable", "consume": "", "to": "RECOGNIZED" }
  ]
};

const interrogative = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "consume": "?", "to": "endable" },
    { "from": "endable", "consume": "?" },
    { "from": "endable", "consume": "", "to": "RECOGNIZED" }
  ]
};
```

What would the descriptions look like when catenated? Perhaps this:

```JSON
const interrobang = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "consume": "!", "to": "endable" },
    { "from": "endable", "consume": "!" },
    { "from": "endable", "to": "START-2" },
    { "from": "START-2", "consume": "?", "to": "endable-2" },
    { "from": "endable-2", "consume": "?" },
    { "from": "endable-2", "consume": "", "to": "RECOGNIZED" }
  ]
};
```

We've made a couple of changes:

In the second description, we changed `START` to `START-2`, so that it would not conflict with `START` in the first recognizer. We always have to rename states so that there are no conflicts between the two recognizers.

Second, in the first recognizer, wherever we had a `"to": "RECOGNIZED"`, we changed it to `"to": "START-2"`. Transitions to the recognized state of the first recognizer are now transitions to the start state of the second recognizer.

Third, wherever we had a `"consume": ""` in the first recognizer, we removed it outright. Any transition that is possible at the end of a string when the recognizer is running  by itself, is possible at any point in the string when the recognizer is catenated with another recognizer.

---

### catenateFSA(first, second)

Let's start by writing a function to catenate any two finite state automaton recognizer descriptions. First, we'll need to rename states in the second description so that they don't conflict with the first description.

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
  prepareSecondForCatenation("START", "RECOGNIZED", exclamatory, interrogative)
    //=>
      {
        "start": "START-2",
        "accepting": "RECOGNIZED",
        "transitions": [
          { "from": "START-2", "consume": "?", "to": "endable-2" },
          { "from": "endable-2", "consume": "?" },
          { "from": "endable-2", "consume": "", "to": "RECOGNIZED" }
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
  prepareFirstForCatenation("START", "RECOGNIZED", exclamatory, catenatableInterrogative)
    //=>
      {
        "start": "START",
        "accepting": "RECOGNIZED",
        "transitions": [
          { "from": "START", "consume": "!", "to": "endable" },
          { "from": "endable", "consume": "!" },
          { "from": "endable", "to": "START-2" }
        ]
      }
```

Stitching them together, we get:

```javascript
function catenate (first, second) {
  const start = "START";
  const accepting = "RECOGNIZED";

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
const interrobang = catenate(exclamatory, interrogative)
  //=>
    {
      "start": "START",
      "accepting": "RECOGNIZED",
      "transitions": [
        { "from": "START", "consume": "!", "to": "endable" },
        { "from": "endable", "consume": "!" },
        { "from": "endable", "to": "START-2" },
        { "from": "START-2", "consume": "?", "to": "endable-2" },
        { "from": "endable-2", "consume": "?" },
        { "from": "endable-2", "consume": "", "to": "RECOGNIZED" }
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

### catenate(first, second)

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
isolatedStack("START", "RECOGNIZED", binary)
  //=>
    {
      "start": "START",
      "accepting": "RECOGNIZED",
      "transitions": [
        { "from": "START", "consume": "0", "to": "zero" },
        { "from": "zero", "consume": "", "to": "RECOGNIZED" },
        { "from": "START", "consume": "1", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "0", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "1", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "", "to": "RECOGNIZED" }
      ]
    }
```

But it does change a pushdown automaton:

```javascript
isolatedStack("START", "RECOGNIZED", balanced)
  //=>
    {
      "start": "START",
      "accepting": "RECOGNIZED",
      "transitions": [
        { "from": "START", "push": "sentinel", "to": "START-2" },
        { "from": "START-2", "to": "read", "push": "⚓︎" },
        { "from": "read",  "consume": "(", "to": "read", "push": "(" },
        { "from": "read",  "consume": ")",  "pop": "(", "to": "read" },
        { "from": "read",  "consume": "[", "to": "read", "push": "[" },
        { "from": "read",  "consume": "]",  "pop": "[", "to": "read" },
        { "from": "read",  "consume": "{", "to": "read", "push": "{" },
        { "from": "read",  "consume": "}",  "pop": "{", "to": "read" },
        { "from": "read",  "consume": "",  "pop": "⚓︎", "to": "RECOGNIZED-2" },
        { "from": "RECOGNIZED-2",  "pop": "⚓︎" },
        { "from": "RECOGNIZED-2",  "pop": "(" },
        { "from": "RECOGNIZED-2",  "pop": "[" },
        { "from": "RECOGNIZED-2",  "pop": "{" },
        { "from": "RECOGNIZED-2",  "pop": "sentinel", "to": "RECOGNIZED" }
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
catenate(binary, fraction)
  //=>
    {
      "start": "START",
      "accepting": "RECOGNIZED-2",
      "transitions": [
        { "from": "START", "consume": "0", "to": "zero" },
        { "from": "zero", "to": "START-2" },
        { "from": "START", "consume": "1", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "0", "to": "one-or-more" },
        { "from": "one-or-more", "consume": "1", "to": "one-or-more" },
        { "from": "one-or-more", "to": "START-2" },
        { "from": "START-2", "consume": "", "to": "RECOGNIZED-2" },
        { "from": "START-2", "consume": ".", "to": "point" },
        { "from": "point", "consume": "0", "to": "point-zero" },
        { "from": "point", "consume": "1", "to": "endable" },
        { "from": "point-zero", "consume": "", "to": "RECOGNIZED-2" },
        { "from": "point-zero", "consume": "0", "to": "not-endable" },
        { "from": "point-zero", "consume": "1", "to": "endable" },
        { "from": "not-endable", "consume": "0" },
        { "from": "not-endable", "consume": "1", "to": "endable" },
        { "from": "endable", "consume": "", "to": "RECOGNIZED-2" },
        { "from": "endable", "consume": "0", "to": "not-endable" },
        { "from": "endable", "consume": "1" }
      ]
    }

catenate(balanced, palindrome)
  //=>
    {
      "start": "START",
      "accepting": "RECOGNIZED-3",
      "transitions": [
        { "from": "START", "to": "START-2", "push": "sentinel" },
        { "from": "START-2", "to": "read", "push": "⚓︎" },
        { "from": "read", "consume": "(", "to": "read", "push": "(" },
        { "from": "read", "consume": ")", "pop": "(", "to": "read" },
        { "from": "read", "consume": "[", "to": "read", "push": "[" },
        { "from": "read", "consume": "]", "pop": "[", "to": "read" },
        { "from": "read", "consume": "{", "to": "read", "push": "{" },
        { "from": "read", "consume": "}", "pop": "{", "to": "read" },
        { "from": "read", "pop": "⚓︎", "to": "RECOGNIZED-2" },
        { "from": "RECOGNIZED-2", "pop": "⚓︎" },
        { "from": "RECOGNIZED-2", "pop": "(" },
        { "from": "RECOGNIZED-2", "pop": "[" },
        { "from": "RECOGNIZED-2", "pop": "{" },
        { "from": "RECOGNIZED-2", "pop": "sentinel", "to": "START-3" },
        { "from": "START-3", "to": "first", "push": "⚓︎" },
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
        { "from": "right", "consume": "", "pop": "⚓︎", "to": "RECOGNIZED-3" }
      ]
    }

test(automate(catenate(balanced, palindrome)), [
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

Now that we have written `catenate` for descriptions, we can reason as follows:[^reason]

- A finite state machine can recognize any regular language.
- The catenation of two finite state machine recognizers is a finite state machine recognizer.
- Therefore, a language defined by catenating two regular languages, will be regular.

[^reason]: Well, actually, this is not strictly true. Building a catenate function certainly gives us confidence that a language formed by catenating the rules for two regular language ought to be regular, but it is always possible that our algorithm has a bug and cannot correctly catenate any two finite state automaton recognizers. Finding such a bug would be akin to finding a counter-example to something thought to have been proven, or a conjecture thought to be true, but unproven. This is the nature of "experimental computing science," it is always easier to demonstrate that certain things are impossible--by finding just one counter-example--than to prove that no counter-examples exist.

Likewise, we can reason:

- A pushdown automaton can recognize any context-free language.
- The catenation of two pushdown automaton recognizers is a pushdown automaton recognizer.
- Therefore, a language defined by catenating two context-free languages, will be context-free.

As noted, we could not have come to these conclusions from functional composition alone. But we're leaving something out. What about catenating any two deterministic pushdown automata? Is the result also a deterministic pushdown automaton?

Recall our balanced parentheses recognizer:

```javascript
const balanced = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "push": "⚓︎", "to": "read" },
    { "from": "read", "consume": "(", "push": "(", "to": "read" },
    { "from": "read", "consume": ")", "pop": "(", "to": "read" },
    { "from": "read", "consume": "[", "push": "[", "to": "read" },
    { "from": "read", "consume": "]", "pop": "[", "to": "read" },
    { "from": "read", "consume": "{", "push": "{", "to": "read" },
    { "from": "read", "consume": "}", "pop": "{", "to": "read" },
    { "from": "read", "consume": "", "pop": "⚓︎", "to": "RECOGNIZED" }
  ]
};
```

It is clearly deterministic, there is only one unambiguous transition that cana be performed at any time. Now, here is a recognizer that recognizes a single pair of parentheses, it is very obviously a finte state automaton:

```javascript
const pair = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "consume": "(", "to": "closing" },
    { "from": "closing", "consume": ")", "to": "closed" },
    { "from": "closed", "consume": "", "to": "RECOGNIZED" }
  ]
};

test(automate(pair), [
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
catenate(balanced, pair)
  //=>
    {
      "start": "START",
      "accepting": "RECOGNIZED-2",
      "transitions": [
        { "from": "START", "to": "read", "push": "⚓︎" },
        { "from": "read", "consume": "(", "to": "read", "push": "(" },
        { "from": "read", "consume": ")", "pop": "(", "to": "read" },
        { "from": "read", "consume": "[", "to": "read", "push": "[" },
        { "from": "read", "consume": "]", "pop": "[", "to": "read" },
        { "from": "read", "consume": "{", "to": "read", "push": "{" },
        { "from": "read", "consume": "}", "pop": "{", "to": "read" },
        { "from": "read", "pop": "⚓︎", "to": "START-2" },
        { "from": "START-2", "consume": "(", "to": "closing" },
        { "from": "closing", "consume": ")", "to": "closed" },
        { "from": "closed", "consume": "", "to": "RECOGNIZED-2" }
      ]
    }

test(automate(catenate(balanced, pair)), [
  '', '()', '()()'
]);
  //=>
    '' => false
    '()' => true
    '()()' => true
```

Our `catenate` function has transformed a deterministic pushdown automaton into a pushdown automaton.  How do we know this? Consider the fact that it recognized both `()` and `()()`. To recognize `()`, it transitioned from `read` to `START-2` while popping `⚓︎`, even though it could also have consumed `(` and pushed it onto the stack.

But to recognize `()()`, it consumed the first `(` and pushed it onto the stack, but not the second `(`. This is only possible in a Pushdown Automaton. So our `catenate` function doesn't tell us anything about whether two deterministic pushdown automata can always be catenated in such a way to produce a deterministic pushdown automaton.

If it is possible, our `catenate` function doesn't tell us that it's possible. Mind you, this reasoning doesn't prove that it's impossible. We just cannot tell from this particular `catenate` function alone.

## Alternating Descriptions

Catenation is not the only way to compose recognizers. The other most important composition is alternation: Given recognizers `A` and `B`, while `catenate(A, B)` recognizes sentences of the form "`A` followed by `B`," `alternate(A, B)` would recognize sentences of `A` or of `B`.

Implementing alternation is a little simpler than implementing catenation. Once again we have to ensure that the states of the two recognizers are distinct, so we'll rename states to avoid conflicts. Then we make sure that both recognizers share the same `start` and `accepting` states:

```javascript
function alternate (first, second) {
  const start = "START";
  const accepting = "RECOGNIZED";

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
alternate(exclamatory, interrogative)
  //=>
    {
      "start": "START",
      "accepting": "RECOGNIZED",
      "transitions": [
        { "from": "START", "consume": "!", "to": "endable" },
        { "from": "endable", "consume": "!" },
        { "from": "endable", "consume": "", "to": "RECOGNIZED" },
        { "from": "START", "consume": "?", "to": "endable-2" },
        { "from": "endable-2", "consume": "?" },
        { "from": "endable-2", "consume": "", "to": "RECOGNIZED" }
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

### fixing a problem with alternate(first, second)

Sharing the `start` state works just fine as long as it is a root state, i.e., No transitions lead back to it. Consider this recognizer that recognizes zero or more sequences of the characters `^H` (old-timers may remember this as a shorthand for "backspace" popular in old internet forums):

<div class="mermaid">
  graph LR
    start(start)-->|^|ctrl
    start-.->|end|recognized(recognized)
    ctrl-->|H|start
</div>

The way `alternate` works right now, is that if we evaluate `alternate(backspaces, exclamatory)`, we get this:

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

We can fix it by changing `alternate` so that when given a recognizer with a start state that is not a root, it adds a root for us, like this:

<div class="mermaid">
  graph LR
    start(start)-->start-2
    start-2-->|^|ctrl
    start-2-.->|end|recognized(recognized)
    ctrl-->|H|start-2
</div>

After "adding a root," the result of `alternate(backspaces, exclamatory)` would then be:

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

function alternate (first, second) {
  const start = "START";
  const accepting = "RECOGNIZED";

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
  start: "START",
  accepting: "RECOGNIZED",
  transitions: [
    { from: "START", consume: "^", to: "ctrl" },
    { from: "START", consume: "", to: "RECOGNIZED" },
    { from: "ctrl", consume: "H", to: "START" }
  ]
}

const exclamatory = {
  "start": "START",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "START", "consume": "!", "to": "endable" },
    { "from": "endable", "consume": "!" },
    { "from": "endable", "consume": "", "to": "RECOGNIZED" }
  ]
};

alternate(backspaces, exclamatory)
  //=>
    {
      "start": "START",
      "accepting": "RECOGNIZED",
      "transitions": [
        { "from": "START", "to": "START-2" },
        { "from": "START-2", "consume": "^", "to": "ctrl" },
        { "from": "START-2", "consume": "", "to": "RECOGNIZED" },
        { "from": "ctrl", "consume": "H", "to": "START-2" },
        { "from": "START", "consume": "!", "to": "endable" },
        { "from": "endable", "consume": "!" },
        { "from": "endable", "consume": "", "to": "RECOGNIZED" }
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

### what we have learned from alternating descriptions

Once again, we have developed some confidence that given any two finite state machine recognizers, we can construct an alternate recognizer that is also a finite state machine. Likewise, if either or both of the recognizers are pushdown automata, we have confidence that we can construct a recognizer that recognizes either language that will also be a pushdown automaton.

Coupled with what we learned from catenating recognizers, we now can develop the conjecture that "can be recognized with a pushdown automaton" is a transitive relationship: We can build an expression of arbitrary complexity using concatenate and alternate, and if the recognizers given were pushdown automata (or simpler), the result will be a pushdown automaton.

This also tells us something about languages: If we have a set of context-free languages, all the languages we can form using catenation and alternation will also be context-free languages.

---

## Fun with Catenation and Alternation

Here is a ridiculously simple recognizer which can be very handy, let's call it `NOTHING`:

<div class="mermaid">
  graph LR
    start(start)-.->|end|recognized(recognized)
</div>

The description is trivial, to say the least:

```javascript
const NOTHING = {
  start: "START",
  accepting: "RECOGNIZED",
  transitions: [{ from: "START", consume: "", to: "RECOGNIZED" }]
};
```

And here's a function that makes a recognizer out of a single character:

```javascript
function character (c) {
  return {
    start: "START",
    accepting: "RECOGNIZED",
    transitions: [
      { from: "START", consume: c, to: "endable" },
      { from: "endable", consume: "", to: "RECOGNIZED" }
    ]
  };
}

test(automate(character("r")), [
  '', 'r', 'reg'
]);
  //=>
    '' => false
    'r' => true
    'reg' => false
```

Here's an interesting way to use `NOTHING` with catenation:

```javascript
function string (str = "") {
  return str
  	.split('')
  	.reduceRight(
    	(acc, c) => catenate(character(c), acc),
    	NOTHING
    );
}

test(automate(string("reg")), [
  '', 'r', 'reg'
]);
  //=>
    '' => false
    'r' => false
    'reg' => true
```

We can use `NOTHING` with alternation as well:

```javascript
function zeroOrOne (recognizer) {
  return alternate(NOTHING, recognizer);
}

const reginaldOrBust = zeroOrOne(string("reginald"));

test(automate(reginaldOrBust), [
  '', 'reg', 'reggie', 'reginald'
]);
  //=>
    '' => true
    'reg' => false
    'reggie' => false
    'reginald' => true
```


---

# Notes