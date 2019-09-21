---
title: "From Pushdown Automata to Self-Recognition"
tags: [recursion,allonge,mermaid,wip]
---

This essay continues from where [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata] left off. Familiarity with its subject matter is a prereuisite for exploring the ideas in this essay.

[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html#implementing-pushdown-automata "[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]"

---

### recapitulation

In [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata], we began with a well-known programming puzzle: _Write a function that determines whether a string of parentheses is "balanced," i.e. each opening parenthesis has a corresponding closing parenthesis, and the parentheses are properly nested._

In pursuing the solution to this problem, we constructed machines that could recognize "sentences" in languages. We saw that while many languages can be recognized with Deterministic Finite State Automata, balanced parenteses required a more powerful recognizer, a Deterministic Pushdown Automaton.

We then went a step further and considered the palindrome problem, and saw that there were languages--like palindromes with a vocabulary of two or more symbols--that could not be recognized with Deterministic Pushdown Automata, and we needed to construct a [Pushdown Automaton] to recognize palindromes.

[Pushdown Automaton]: https://en.wikipedia.org/wiki/Pushdown_automaton

Here is the pushdown automaton class we wrote:

```javascript
const END = Symbol('end');

class PushdownAutomaton {
  constructor(internal = 'start', external = []) {
    this.internal = internal;
    this.external = external;
    this.halted = false;
    this.recognized = false;
  }

  isDeterministic () {
    return false;
  }

  push(token) {
    this.external.push(token);
    return this;
  }

  pop() {
    this.external.pop();
    return this;
  }

  replace(token) {
    this.external[this.external.length - 1] = token;
    return this;
  }

  top() {
    return this.external[this.external.length - 1];
  }

  hasEmptyStack() {
    return this.external.length === 0;
  }

  transitionTo(internal) {
    this.internal = internal;
    return this;
  }

  recognize() {
    this.recognized = true;
    return this;
  }

  halt() {
    this.halted = true;
    return this;
  }

  consume(token) {
    const states = [...this[this.internal](token)];
    if (this.isDeterministic()) {
      return states[0] || [];
    } else {
      return states;
    }
  }

  fork() {
    return new this.constructor(this.internal, this.external.slice(0));
  }

  static evaluate (string) {
    let states = [new this()];

    for (const token of string) {
      const newStates = states
        .flatMap(state => state.consume(token))
        .filter(state => state && !state.halted);

      if (newStates.length === 0) {
        return false;
      } else if (newStates.some(state => state.recognized)) {
        return true;
      } else {
        states = newStates;
      }
    }

    return states
      .flatMap(state => state.consume(END))
      .some(state => state && state.recognized);
  }
}
```

And hgere is an example recognzer using the class:

```javascript
class BinaryPalindrome extends PushdownAutomaton {
  * start (token) {
    if (token === '0') {
      yield this
      	.fork()
        .push(token)
      	.transitionTo('opening');
    }
    if (token === '1') {
      yield this
      	.fork()
        .push(token)
      	.transitionTo('opening');
    }
    if (token === END) {
      yield this
      	.fork()
        .recognize();
    }
  }

  * opening (token) {
    if (token === '0') {
      yield this
      	.fork()
        .push(token);
    }
    if (token === '1') {
      yield this
      	.fork()
        .push(token);
    }
    if (token === '0' && this.top() === '0') {
      yield this
      	.fork()
        .pop()
      	.transitionTo('closing');
    }
    if (token === '1' && this.top() === '1') {
      yield this
      	.fork()
      	.pop()
      	.transitionTo('closing');
    }
  }

  * closing (token) {
    if (token === '0' && this.top() === '0') {
      yield this
      	.fork()
        .pop();
    }
    if (token === '1' && this.top() === '1') {
      yield this
      	.fork()
      	.pop();
    }
    if (token === END && this.hasEmptyStack()) {
      yield this
      	.fork()
        .recognize();
    }
  }
}

function test (recognizer, examples) {
  for (const example of examples) {
    console.log(`'${example}' => ${recognizer.evaluate(example)}`);
  }
}

test(BinaryPalindrome, [
  '', '0', '00', '11', '0110',
  '1001', '0101', '100111',
  '01000000000000000010'
]);
```

# Composeable Recognizers

One of programming's "superpowers" is _composition_, the ability to build things out of smaller things, and especially, to reuse those smaller things to build other things. Composition is built into our brains: When we speak human languages, we use combinations of sounds to make words, and then we use combinations of words to make sentences, and so it goes building layer after layer until we have things like complete books.

Composeable recognizers and paatterns are particularly interesting. Just as human languages are built by layers of composition, all sorts of mechanical languages are structured using composition. JSON is a perfect example: A JSON element like a list is composed of zero or more arbitraty JSON elements, which themselves could be lists, and so forth.

If we want to build a recognizer for JSON, it would be ideal to build smaller recognizers for things like strings or numbers, and then use composition to build recognizers for elements like lists and "objects."

This is the motivation for the first part of our exploration: We want to make simple recognizers, and then use composition to make more complex recognizers from the simple recognizers.

### functional composition

We explored this exact idea in [Pattern Matching and Recursion]. We used functions as recognizers, and then we used functional composition to compose more complex recognizers from simpler recognizers.

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html "Pattern Matching and Recursion"

For example, `just` was function that took a string and returned a recognzier that recognized just that string. `follows` was a higher-order function that catenated recognizers together, like this:

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

Now there are lots of ways that we can write a function that takes two or more argumenst and then returns a new function. What made `follows` and `cases` examples of functional composition is not just that they took functions as arguments and returned functions, but that the functions they return invoke the original functions in order to compute the result.

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

This is a very powerful technique in programming, one of the fondational ideas that can be traced back to the Lambda Calculus and Combinatorial Logic. And it seems very promising. Our Pushdown Automata are objects, but their `.recognize` methods are functions, so with a nip here and a tuck there, we ought to be able to use functions like `follows` and `cases` to compose new recognizers from Pushdown Automata.

But we are actually going to avoid this technique. Functional composition is wonderful, but it has certain problems that are relevant here.

First and foremost, when we compose functions with a new function, we are using all the programming power of JavaScript. We can use loops, recursion, whatever we like. But when we built recognizers out of Finite State Automata, Desterministic Pushdown Automata, or Pushdown Automata, we were constrained to only use very specific computing capabilities.

If we use a function like `follows` to catenate two FSAs together, is the resulting recognizer still equivalent to an FSA? What about two Pushdown Automata? Functions obscure the underlying model of computation. Of course, for practical programming, this is not a concern, and functional composition is a powerful technique.

But for the sake of explorimng the computational consequences of composing recognizers, we're going to explore a different technique. We'll start by refactoring our Pushdown Automation.

### refactoring functions to data

We're going to perform one of the more interesting types of refactorings, refactoring functions into data. Of course, functions in JavaScript are first-class entities, which means they are already data in a certain way, namely, they are _values_. Data of the sort you'd find in a classical database like strings, booleans, numbers, and so forth are also values.

So that is the difference? For the purposes of this essay, we shall pay attention to one very important characteristic of data like strings and numbers: Data is entirely transparent and explicit. When we look at a string, we know everything we need to know about it. There is no hidden, encapsulated behaviour.

Whereas, functions encapsulate behaviour. When we inspect a function, we might discover its name and the number of arguments. In some languages, we get type information too. But its internals are a sealed book to us. We don't know its environment, we don't know which variables are closed over. Some implementation allow us to inspect a function's source code, but JavaScript ddoes not.

This is not a hard definition, but for our purposes here, it is sufficient. Functions are opaque, data is transparent.

Why do we want to do this? Let's consider our design for Pushdown Automata. Each automata has two parts: There's code that "runs the automaton," it's in the parent class `PushdownAutomata`. Then there are the specific methods that make up the states of an automaton, their in the concrete child class, e.g. `BinaryPalindrome`.

Consider a different design. Let's say we had a format for defining the states of a Pushdown Automaton in data, pure data. We could hand this to `PushdownAutomata`, and it could give us back a recognizer function, instead of extending a class. What does this give us? Well, the data that defines the states is fully transparent. We can inspect it, we can write functions that modify it, and most especially, we can explore whether given the data for two different recognizers, we can compute the data for a recogbnizer that composes the recognizers.

But let's not get ahead of ourselves. Let's start with our refactoring:

### a data format for automata

We don't need to invent a brand-new format, there is already an accepted [formal definition][fdpda] for Pushdown Automata. Mind you, it involves mathematical symbols that are unfamiliar to some programmers, so without dumbing it down, we will create our own format that is equivalent to the full formal definition, but expressed in JSON.

[fdpda]: https://en.wikipedia.org/wiki/Pushdown_automaton#Formal_definition

We start with the definition of a _transition_. A transition defines a change in the automaton's state. Transitions are formally defined as tuples of the form `(p,a,A,q,⍺)`:

 - `p` is the state the automaton is currently in.
 - `a` is the input symbol being consumed. This can be empty, meaning that the machine does not have to consume an input symbol to perform this transition.
 - `A` is the topmost stack symbol, which is popped off ths stack. This can be empty, meaning that the machine does not have to pop a symbol from the stack to perform this transition.
 - `q` is the state the automaton will be in after completing this transition. It can be the same as `q`, meaning that it might perform some action with the input and/or stack and remain in the same state.
 - `⍺` is a symbol to push onto the stack. This can be empty, meaning that the machine does not have to push a symbol onto the stack to perform this transition.

 We can represent this with POJOs. For readability by those unfamiliar with the formal notation, we will use the words `from` for `p`, `consume` for `a`, `pop` for `A`, `to` for `q`, and `push` for `⍺`. This may feel like a lot of typing compared to the formal symbols, but we'll get the computer do do our writing for us, and it doesn't care.

 An automaton is a set of such transitions, along with:

 - A start state,
 - A set of _accepting states_.
 - A starting symbol for the stack.

(There are some other things, like the set of all possible input symbols, and the stack alphabet. However, those can be inferred by examining the set of transitions, and are not important to what we're trying to accomplish.)

We can eliminate all three of these elements of the definition:

1. We can presume that the starting state is denoted by a symbol, `START`, much as our existing pushdown automaton begins in the `start` state by default. This does not reduce the pwoer of any automaton, as we can trasnform an automaton that begins in any arbitrary state into an automaton that begins in the `START` state by adding a transition from `START` to the desired state without popping or pushing ionto the stack and wthout consumng an input token.
1. We can presume that there is just one accepting state, and it is denoted by our symbol `RECOGNIZED`. This does not reduce the power of our automata, as given a set of accepting states, we can write transitions that transition from those states to `RECOGNIZED`, so any automaton with a set of accepting states can be mechanically transformed into an equivalent automaton that has just one accepting state, `RECOGNIZED`.
2. We will have our automata assume that the stack is empty when the automton begins. This does not reduce the power of our automata, as given a desired starting symbol, we can rewrite an automaton such that its start state pushes the desired symbol onto the stack before continuing with the rest of its logic.

This reduces our definition to only requiring a set of transitions of the form `{ from, consume, pop, to, push }`. As with our existing automata, the arbitrary symbol `END` will be used to signal the end of the input.

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
  { "from": "START", "consume": "0", "to": "zero" },
  { "from": "zero", "consume": "END", "to": "RECOGNIZED" },
  { "from": "START", "consume": "1", "to": "one-or-more" },
  { "from": "one-or-more", "consume": "0", "to": "one-or-more" },
  { "from": "one-or-more", "consume": "1", "to": "one-or-more" },
  { "from": "one-or-more", "consume": "END", "to": "RECOGNIZED" }
]
```
As an aside, any definition that does not include any `pop` elements is equivalent to a finite automaton, even if it is being interreted by a framework that supports pushdown automata.

### implementing our example automaton



---

# Notes