---
title: "From Pushdown Automata to Self-Recognition"
tags: [recursion,allonge,mermaid,wip]
---

This essay continues from where [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata] left off. Familiarity with its subject matter is a prerequisite for exploring the ideas in this essay.

[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html#implementing-pushdown-automata "[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]"

---

### recapitulation

In [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata], we began with a well-known programming puzzle: _Write a function that determines whether a string of parentheses is "balanced," i.e. each opening parenthesis has a corresponding closing parenthesis, and the parentheses are properly nested._

In pursuing the solution to this problem, we constructed machines that could recognize "sentences" in languages. We saw that while many languages can be recognized with Deterministic Finite State Automata, balanced parentheses required a more powerful recognizer, a Deterministic Pushdown Automaton.

We then went a step further and considered the palindrome problem, and saw that there were languages--like palindromes with a vocabulary of two or more symbols--that could not be recognized with Deterministic Pushdown Automata, and we needed to construct a [Pushdown Automaton] to recognize palindromes.

[Pushdown Automaton]: https://en.wikipedia.org/wiki/Pushdown_automaton

We implemented pushdown automata using a classes-with-methods approach, the complete code is [here][pushdown.oop.es6].

[pushdown.oop.es6]: https://gist.github.com/raganwald/41ae26b93243405136b786298bafe8e9#file-pushdown-oop-es6

# Composeable Recognizers

One of programming's "superpowers" is _composition_, the ability to build things out of smaller things, and especially, to reuse those smaller things to build other things. Composition is built into our brains: When we speak human languages, we use combinations of sounds to make words, and then we use combinations of words to make sentences, and so it goes building layer after layer until we have things like complete books.

Composeable recognizers and patterns are particularly interesting. Just as human languages are built by layers of composition, all sorts of mechanical languages are structured using composition. JSON is a perfect example: A JSON element like a list is composed of zero or more arbitrary JSON elements, which themselves could be lists, and so forth.

If we want to build a recognizer for JSON, it would be ideal to build smaller recognizers for things like strings or numbers, and then use composition to build recognizers for elements like lists and "objects."

This is the motivation for the first part of our exploration: We want to make simple recognizers, and then use composition to make more complex recognizers from the simple recognizers.

### functional composition

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

### refactoring functions to data

We're going to perform one of the more interesting types of refactoring, refactoring functions into data. Of course, functions in JavaScript are first-class entities, which means they are already data in a certain way, namely, they are _values_. Data of the sort you'd find in a classical database like strings, booleans, numbers, and so forth are also values.

So that is the difference? For the purposes of this essay, we shall pay attention to one very important characteristic of data like strings and numbers: Data is entirely transparent and explicit. When we look at a string, we know everything we need to know about it. There is no hidden, encapsulated behaviour.

Whereas, functions encapsulate behaviour. When we inspect a function, we might discover its name and the number of arguments. In some languages, we get type information too. But its internals are a sealed book to us. We don't know its environment, we don't know which variables are closed over. Some implementation allow us to inspect a function's source code, but JavaScript does not.

This is not a hard definition, but for our purposes here, it is sufficient. Functions are opaque, data is transparent.

Why do we want to do this? Let's consider our design for Pushdown Automata. Each automata has two parts: There's code that "runs the automaton," it's in the parent class `PushdownAutomata`. Then there are the specific methods that make up the states of an automaton, their in the concrete child class, e.g. `BinaryPalindrome`.

Consider a different design. Let's say we had a format for defining the states of a Pushdown Automaton in data, pure data. We could hand this to `PushdownAutomata`, and it could give us back a recognizer function, instead of extending a class. What does this give us? Well, the data that defines the states is fully transparent. We can inspect it, we can write functions that modify it, and most especially, we can explore whether given the data for two different recognizers, we can compute the data for a recognizer that composes the recognizers.

But let's not get ahead of ourselves. Let's start with our refactoring:

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

We can make two simplifying adjustments:

First, we can presume that there is just one accepting state, not a set of accepting states. This does not reduce the power of our automata, as given a set of accepting states, we can write transitions that transition from those states to a single state, so any automaton with a set of accepting states can be mechanically transformed into an equivalent automaton that has just one accepting state.

Second, we can have our automata assume that the stack is empty when the automaton begins. This does not reduce the power of our automata, as given a desired starting symbol, we can rewrite an automaton such that its start state pushes the desired symbol onto the stack before continuing with the rest of its logic.

This reduces our definition to only requiring a start state, and accepting state, and a set of transitions, like this: `{ start, accepting, transitions }`.

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
      console.log(`Missing state ${internal}. This is probably an error in the automaton definition.`);

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
const binary = automate({
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
});

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

And another for balanced parentheses. This does `push` and `pop` things from the stack, so we know it is a pushdown automaton. Is it deterministic? If we look at the description carefully, we can see that every transition is guaranteed to be unambiguous. It can only ever follow one path through the states for any input. Therefore, it is a deterministic pushdown automaton:

```javascript
const balanced = automate({
  "start": "PUSH ANCHOR",
  "accepting": "RECOGNIZED",
  "transitions": [
    { "from": "PUSH ANCHOR", "push": "⚓︎", "to": "read" },
    { "from": "read", "consume": "(", "push": "(", "to": "read" },
    { "from": "read", "consume": ")", "pop": "(", "to": "read" },
    { "from": "read", "consume": "[", "push": "[", "to": "read" },
    { "from": "read", "consume": "]", "pop": "[", "to": "read" },
    { "from": "read", "consume": "{", "push": "{", "to": "read" },
    { "from": "read", "consume": "}", "pop": "{", "to": "read" },
    { "from": "read", "consume": "", "pop": "⚓︎", "to": "RECOGNIZED" }
  ]
});

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

Finally, even- and odd-length binary palindromes. Not only does it `push` and `pop`, but it has more than one state transition for every input it consumes, making it a non-deterministic pushdown automaton. We call these just pushdown automatons:

```javascript
const palindrome = automate({
  "start": "start",
  "accepting": "RECOGNIZED",
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
    { "from": "right", "consume": "", "pop": "⚓︎", to: "RECOGNIZED" }
  ]
});

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


---

# Notes