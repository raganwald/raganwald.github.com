---
title: "Turing Machines and Tooling, Part II"
layout: default
tags: [allonge]
---

[![monk at work](/assets/images/Scriptorium-monk-at-work.jpg)](https://commons.wikimedia.org/wiki/File:Scriptorium-monk-at-work.jpg)

*Note well: This is an unfinished work-in-progress.*

---

# Turing Machines and Tooling, Part II

Much is made of "functional" programming in JavaScript. People get very excited talking about how to manage, minimize, or even eliminate mutation and state. But what if, instead of trying to avoid state and mutation, we _embrace_ it? What if we "turn mutation up to eleven?"

We know the rough answer without even trying. We'd need a lot of tooling to manage our programs. Which is interesting in its own right, because we might learn a lot about tools for writing software.

So with that in mind, we began in [Part I] by looking at a simple Turing Machine, the "a-machine," and then built a more expressive version, the "sequence-machine." we saw that we could implement the sequence-machine either by upgrading the a-machine with new capabilities, or by compiling programs written for the sequence-machine into programs written for the a-machine.

[Part I]: http://raganwald.com/2017/04/06/turing-machines.html

We ended [Part I] by suggesting that as we added even more complexity, the compiler approach would help us manage that complexity, despite the compiler being more complicated to implement than the additions we made to the a-machine's code. Let's follow through and add more power to our machine.

### a quick recap

(Feel free to skip over this if [Part I] is fresh in your mind)

In [Part I], we began with a simple "a-machine," which is very close to Alan Turing's original thought experiment:

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
      if (tapeIndex < 0) {
        // moved off the left edge of the tape
        return tape;
      }
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

Our "a-machine" has a "vocabulary" of `0` and `1`: These are the only marks allowed on the tape. If it encounters another mark, it halts. These are also the only marks it is allowed to put on the tape, via the `ERASE` and `PRINT` actions. It selects as the start state the state of the first instruction. Any finite number of states are permitted.

We also built a "sequence-machine." The sequence-machine differs from the a-machine by allowing a single instruction to have multiple actions:

```javascript
function sequenceMachine({ description, tape: _tape = [0] }) {
  const tape = Array.from(_tape);

  let tapeIndex = 0;
  let currentState = description[0][0];

  while (true) {

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

    const [_, __, nextState, ...actions] = rule;

    for (const action of actions) {
      if (action === LEFT) {
        --tapeIndex;
        if (tapeIndex < 0) {
          // moved off the left edge of the tape
          return tape;
        }
      } else if (action === RIGHT) {
        ++tapeIndex;
        if (tape[tapeIndex] == null) tape[tapeIndex] = 0;
      } else if ([ERASE, PRINT].includes(action)) {
        tape[tapeIndex] = action;
      } else {
        // illegal action
        return tape;
      }
    }

    currentState = nextState;
  }
}
```

The sequence-machine runs all the programs written for an a-machine:

```javascript
const description = [
  ['start', 0, 'one', RIGHT],
  ['start', 1, 'one', RIGHT],
  ['one', 0, 'two', RIGHT],
  ['one', 1, 'two', RIGHT],
  ['two', 0, 'halt', PRINT]
];

sequenceMachine({ description })
  //=> [0, 0, 1]
```

But it can also run a new kind of program that an a-machine cannot run:

```javascript
const description = [
  ['start', 0, 'halt', RIGHT, RIGHT, PRINT],
  ['start', 1, 'halt', RIGHT, RIGHT, PRINT]
];

sequenceMachine({ description })
  //=> [0, 0, 1]
```

To implement the sequence-machine, we added code directly to the a-machine. We then implemented the sequence-machine with a "compiler" that translates programs for the sequence-machine into programs for the a-machine:

```javascript
// prologue: some handy functions

const flatMap = (arr, lambda) => {
  const inLen = arr.length;
  const mapped = new Array(inLen);

  let outLen = 0;

  arr.forEach((e, i) => {
    const these = lambda(e);

    mapped[i] = these;
    outLen = outLen + these.length;
  });

  const out = new Array(outLen);

  let outIndex = 0;
  for (const these of mapped) {
    for (const e of these) {
      out[outIndex++] = e;
    }
  }

  return out;
};

const gensym = (()=> {
  let n = 1;

  return (prefix = 'G') => `${prefix}-${n++}`;
})();

const times = n =>
  Array.from({ length: n }, (_, i) => i);

// flatten, transform any description for a sequence-machine into
// a description for an a-machine

const flatten = ({ description: _description, tape }) => {
  const description = flatMap(_description, ([currentState, currentMark, nextState, ...instructions]) => {
    if (instructions.length === 0) {
      // pathological case
      return [];
    } else {
      const len = instructions.length;
      const nextStates = [];

      let destinationState = nextState;

      times(len).forEach( () => {
        nextStates.unshift(destinationState);
        const match = destinationState.match(/^\*(.*)-\d+$/)

        if (match) {
          destinationState = gensym(`*${match[1]}`);
        } else destinationState = gensym(`*${destinationState}`);
      });

      const currentStates = nextStates.slice(0, len - 1);
      currentStates.unshift(currentState);

      let possibleMarks = [currentMark];

      const compiled = flatMap(times(len), i => {
        const instruction = instructions[i];

        const mappedInstructions = possibleMarks.map(
          mark => [currentStates[i], mark, nextStates[i], instruction]
        );

        if ([LEFT, RIGHT].includes(instruction)) {
          possibleMarks = [0, 1];
        } else if ([ERASE, PRINT].includes(instruction)) {
          possibleMarks = [instruction.mark];
        }

        return mappedInstructions;
      });

      return compiled;
    }
  });

  return { description, tape };
}
```

We can now "flatten" any description for a sequence-machine into a description for an a-machine:

```javascript
const description = [
  ['start', 0, 'halt', RIGHT, RIGHT, PRINT],
  ['start', 1, 'halt', RIGHT, RIGHT, PRINT]
];

flatten({ description, tape: [0] })
  //=>
    {
      description: [
        ["start", 0, "*halt-2", 3],
        ["*halt-2", 0, "*halt-1", 3],
        ["*halt-2", 1, "*halt-1", 3],
        ["*halt-1", 0, "halt", 1],
        ["*halt-1", 1, "halt", 1],
        ["start", 1, "*halt-5", 3],
        ["*halt-5", 0, "*halt-4", 3],
        ["*halt-5", 1, "*halt-4", 3],
        ["*halt-4", 0, "halt", 1],
        ["*halt-4", 1, "halt", 1]
      ],
      tape: [0]
    }
```

### separation of concerns

Comparing the two approaches (building a more powerful sequence-machine vs. compiling sequence-machine programs into a-machine programs), we can see that the "compiler" approach strictly partitions "what to do about sequences" from "how to emulate an a-machine." All the code for handing sequences of instructions lives in the `flatten` compiler. Whereas, in the sequence-machine implementation, the extra code is intertwined with the code for handing the rest of the a-machine's responsibilities.

We have a trade-off. An entire compiler is harder to understand than an extra for-loop in an interpreter. But whenever we're thinking about things that don't involve sequences, if we look at the sequence-machine's code, we pay the additional cost in complexity for sequences. Whereas if we use a compiler, we can look at the a-machines code and pay no cost for implementing sequences.

We can see this if we think about testing and reliability. If we trust that the a-machine works, we can continue to trust that it works after writing the "flatten" compiler. Nothing we have done will change the a-machine's capabilities.

Let's demonstrate this by looking at another form of tooling: Automated tests.

### tests

*to be continued*

---

### notes


