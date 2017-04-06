---
title: "Turing Machines"
layout: default
tags: [allonge, noindex]
---

Much is made of "functional" programming in JavaScript. People get very excited talking about how to manage, minimize, or even eliminate mutation and state. But what if, instead of trying to avoid state and mutation, we _embrace_ it? What if we "turn mutation up to eleven?"

We know the rough answer without even trying. We'd need a lot of tooling to manage our programs. Which is interesting in its own right, because we might learn a lot about tools for writing software.

So with that in mind, let's begin at the beginning.

### turing machines

In 1936, Alan Turing invented what we now call the *Turing Machine* in his honour. He called it an "a-machine," or "automatic machine."[^nomen] Turing machines are mathematical models of computation reduced to an almost absurd simplicity. Computer scientists like to work with very simple models of computation, because that allows them to prove important things about computability in general.

[^nomen]: In this essay, we will call his model an "a-machine" when discussing his work in historical context, but call the machines we build in the present tense, "Turing machines."

Turing had worked with other model of computation. For example, he was facile with combinatorial logic, and discovered what is now called the [Turing Combinator]: `(λx. λy. (y (x x y))) (λx. λy. (y (x x y)))`.

[Turing Combinator]: http://taggedwiki.zubiaga.org/new_content/44e45bff552833cb7460ea1529cf9ea6#Other_fixed_point_combinators

Turing's "a-machine" model of computation differed greatly from combinatorial logic and the other historically significant model, the lambda calculus. Where combinatorial logic and the lambda calculus both modelled computation as expressions without side-effects, mutation, or state, his "a-machine" modelled computation as side-effects, mutation, and state without expressions.

This new model allowed him to prove some very important results about computability, and as we'll see, it inspired John von Neumann's designed for the stored-program computer, the architecture we use to this day.

[![Turing Machine Model](/assets/images/tooling/1200px-Turing_Machine_Model_Davey_2012.jpg)](https://commons.wikimedia.org/wiki/File:Turing_Machine_Model_Davey_2012.jpg)

So what was this "a-machine" of his? Well, he never actually built one. It was a thought experiment. He imagined an infinite paper tape. In his model, the tape had a beginning, but no end. (If you have heard Turing machines described as operating on a tape that stretches to infinity in both directions, be patient, we'll explain the difference later.)

The tape is divided into cells, each of which is either empty/blank, or contains a mark.

Moving along this tape is the a-machine (or equivalently, moving the tape through the a-machine). The machine is, at any one time, positioned over exactly one cell. The machine is capable of reading the mark in a cell, writing a mark into a cell, and moving once cell in either direction.

Turing machines have a finite and predetermined set of states that they can be in. One state is marked as the *start* state, and when a Turing machine begins to operate it begins in that state, and begins positioned over the first cell of the tape. While operating, a Turing machine always has a current state.

[![An abstract Turing machine](/assets/images/tooling/Turing_machine_1.jpg)](https://en.wikipedia.org/wiki/Turing_machine_gallery)

When a Turing machine is started, and continuously thereafter, it reads the contents of the cell in its position, and depending on the current state of the machine, it:

- Writes a mark, moves left, or moves right, and;
- Either changes to a different state, or remains in the same state.

A Turing machine is defined such that given the same mark in the current cell, and the same state, it always performed the same action. Turing machines are *deterministic*.

The machine continues to operate until one of two things happens:

1. It moves off the left edge of the tape, or;
2. There is no defined behaviour for its current state and the symbol in the current cell.

If either of these things happens, the machine *halts*.

### our first turing machine

Given the definition above, we can write a Turing machine emulator. We will represent the tape as an array. The 0th element will be the start of the tape. As the machine moves to the right, if it moves past the end of our array, we will append another element. Thus, the tape appears to be infinite (or as large as the implementation of arrays allows). Marks on the tape will be represented by numbers and strings. By default, `0` will represent an empty cell (although anything will do).

Turing used tables to represent the definitions for his a-machines. We'll use an array of arrays, as the "description" of the Turing machine. Each element of the description will be an array containing:

0. The current state, represented as a string.
1. The current mark, represented as a string or number.
2. The next state for the machine (it can be the same as the current state).
3. An action to perform (a mark to write, or instructions to move left, or move right).

Naturally, we'll write it as a function that takes a description and a tape as input, and—if the emulated machine halts—outputs the state of the tape.

```javascript
const ERASE = 0;
const PRINT = 1;
const LEFT = 2;
const RIGHT = 3;

function aMachine({ description, tape: _tape = [0] }) {
  const tape = Array.from(_tape);

  let tapeIndex = 0;
  let currentState = description[0][0];

  while (true) {
    if (tapeIndex < 0) {
      // moved off the left edge of the tape
      return tape;
    }

    const currentMark = tape[tapeIndex];

    if (![0, 1].includes(currentMark)) {
      // illegal mark on tape
      return tape;
    }

    const rule = description.find(([state, mark]) => state === currentState && mark === currentMark);

    if (rule == null) {
      // no defined behaviour for this state and mark
      return tape;
    }

    const [_, __, nextState, action] = rule;

    if (action === LEFT) {
      --tapeIndex;
    } else if (action === RIGHT) {
      ++tapeIndex;
      if (tape[tapeIndex] == null) tape[tapeIndex] = 0;
    } else if ([ERASE, PRINT].includes(action)) {
      tape[tapeIndex] = action;
    } else {
      // illegal action
      return tape;
    }

    currentState = nextState;
  }
}
```

Our "a-machine" has a "vocabulary" of `0` and `1`: These are the only marks allowed on the tape. If it encounters another mark, it halts. These are also the only marks it is allowed to put on the tape, via the `ERASE` and `PRINT` actions. It selects as the start state the state of the first instruction.

Any finite number of states are permitted. Here is a program that prints a `1` in the first position of the tape, and then halts:

```javascript
const description = [
  ['start', 0, 'halt', PRINT]
];

aMachine({ description })
  //=> [1]
```

It starts in state `start` because it is the first (and only) instruction. It is for our convenience that the state is called "start." The instruction matches a `0`, and the action is to `PRINT` a `1`. So given a blank tape, that's what it does. It then transitions to the `halt` state.

What happens next? Well, it is in the halt state. It is positioned over a `1`. But there is no instruction matching a state of `halt` and a mark of `1` (actually, there is no instruction matching a state of `halt` at all). So it halts.

Given a tape that already has a `1` in the first position, it halts without doing anything, because there is no instruction matching a state of `start` and a `1`. We can add one to our program:

```javascript
const description = [
  ['start', 0, 'halt', PRINT],
  ['start', 1, 'halt', ERASE]
];

aMachine({ description, tape: [0] })
  //=> [1]

aMachine({ description, tape: [1] })
  //=> [0]
```

We've written a "not" function. Let's write another. Let's say that we have a number on the tape, represented as a string of 1s. So the number zero is an empty tape, the number one would be represented as `[1]`, two as `[1, 1]`, three as `[1, 1, 1]` and so forth.

Here's a program that adds one to a number:

```javascript
const description = [
  ['start', 0, 'halt', PRINT],
  ['start', 1, 'start', RIGHT]
];

aMachine({ description, tape: [0] })
  //=> [1]

aMachine({ description, tape: [1] })
  //=> [1, 1]

aMachine({ description, tape: [1, 1] })
  //=> [1, 1, 1]
```

If it encounters a `0`, it prints a mark and halts. If it encounters a `1`, it moves right and remains in the same state. Thus, it moves right over any 1s it finds, until it reaches the end, at which point it writes a `1` and halts.

---

### notes


