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

We then went a step further and considered the palindrome problem, and saw that there were languages--like palindromes with a vocabulary of two or more symbols--that could not be recognized with Deterministic Pushdown Automata, and we needed to construct a Pushdown Automaton to recognize palindromes.

Here is the pushdown automaton we wrote:

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

function test (recognizer, examples) {
  for (const example of examples) {
    console.log(`'${example}' => ${recognizer.evaluate(example)}`);
  }
}

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

test(BinaryPalindrome, [
  '', '0', '00', '11', '0110',
  '1001', '0101', '100111',
  '01000000000000000010'
]);
```



---

# Notes