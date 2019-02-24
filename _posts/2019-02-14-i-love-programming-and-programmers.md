---
title: "A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata"
tags: [recursion,allonge,mermaid]
---

As we discussed in both [Pattern Matching and Recursion], a well-known programming "problem" is to determine whether a string of parentheses is "balanced:"

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html "Pattern Matching and Recursion"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

For example:

|Input|Output|Comment|
|:----|:-----|:------|
|`''`|`true`|the empty string is balanced|
|`'()'`|`true`||
|`'(())'`|`true`|parentheses can nest|
|`'()()'`|`true`|multiple pairs are acceptable|
|`'(()()())()'`|`true`|multiple pairs can nest|
|`'((()'`|`false`|missing closing parentheses|
|`'()))'`|`false`|missing opening parentheses|
|`')('`|`false`|close before open|

<br/>

This problem is amenable to all sorts of solutions, from the pedestrian to the fanciful. But it is also an entry point to exploring some of fundamental questions around computability.

This problem is part of a class of problems that all have the same basic form:

1. We have a language, by which we mean, we have a set of strings. Each string must be finite in length, although the set itself may have infinitely many members.
2. We wish to construct a program that can "recognize" (sometimes called "accept") strings that are members of the language, while rejecting strings that are not.
3. The "recognizer" is constrained to consume the symbols of each string one at a time.

Computer scientists study this problem by asking themselves, "Given a particular language, what is the simplest possible machine that can recognize that language?" We'll do the same thing.

Instead of asking ourselves, "What's the wildest, weirdest program for recognizing balanced parentheses," we'll ask, "What's the simplest possible computing machine that can recognize balanced parentheses?"

That will lead us on an exploration of formal languages, from regular languages, to deterministic context-free languages, and finally to context-free languages. And as we go, we'll look at fundamental computing machines, from deterministic finite automata, to deterministic pushdown automata, and finally to pushdown automata.

---

[![Robarts Library, la biblioteca más grande de la UofT, parece un guajolote!](/assets/images/pushdown/robarts.jpg)](https://www.flickr.com/photos/ivanx/525621660)

---

### prelude: why is this a "brutal" look?

> [Brutalist architecture] flourished from 1951 to 1975, having descended from the modernist architectural movement of the early 20th century. Considered both an ethic and aesthetic, utilitarian designs are dictated by function over form with raw construction materials and mundane functions left exposed. Reinforced concrete is the most commonly recognized building material of Brutalist architecture but other materials such as brick, glass, steel, and rough-hewn stone may also be used.

[Brutalist architecture]: https://en.wikipedia.org/wiki/Brutalist_architecture

This essay focuses on the "raw" construction materials of formal languages and the idealized computing machines that recognize them. If JavaScript is ubiquitous aluminum siding, and if Elixir is gleaming steel and glass, pushdown automata are raw, exposed, and brutal concrete.

Now let's move on.

---

[![Hurley Building, Boston, MA](/assets/images/pushdown/contours.jpg)](https://www.flickr.com/photos/pburka/27459401981)

---

# Table of Contents

---

[Regular Languages and Deterministic Finite Automata](#regular-languages-and-deterministic-finite-automata):

- [formal languages and recognizers](#formal-languages-and-recognizers)
- [implementing a deterministic finite automaton in javascript](#implementing-a-deterministic-finite-automaton-in-javascript)
- [infinite regular languages](#infinite-regular-languages)
- [nested parentheses](#nested-parentheses)
- [balanced parentheses is not a regular language](#balanced-parentheses-is-not-a-regular-language)

[Deterministic Context-free Languages and Deterministic Pushdown Automata](#deterministic-context-free-languages-and-deterministic-pushdown-automata):

- [deterministic pushdown automata](#deterministic-pushdown-automata)
- [balanced parentheses is a deterministic context-free language](#balanced-parentheses-is-a-deterministic-context-free-language)
- [recursive regular expressions](#recursive-regular-expressions)

[Context-Free Languages and Pushdown Automata](#context-free-languages-and-pushdown-automata):

- [nested parentheses](#nested-parentheses)
- [context-free languages](#context-free-languages)
- [why deterministic pushdown automata cannot recognize palindromes](#why-deterministic-pushdown-automata-cannot-recognize-palindromes)
- [pushdown automata](#pushdown-automata)
- [an object-oriented deterministic pushdown automaton](#an-object-oriented-deterministic-pushdown-automaton)
- [deterministic context-free languages are context-free languages](#deterministic-context-free-languages-are-context-free-languages)

[The End](#the-end):

- [summary](#summary)
- [further reading](#further-reading)
- [discussions](#discussions)

---

# Regular Languages and Deterministic Finite Automata

---

[![Berkeley Art Museum](/assets/images/pushdown/art.jpg)](https://www.flickr.com/photos/threepwolfe/43985968644)

---

### formal languages and recognizers

We'll start by defining a few terms.

A "formal language" is a defined set of strings (or tokens in a really formal argument). For something to be a formal language, there must be an unambiguous way of determining whether a string is or is not a member of the language.

"Balanced parentheses" is a formal language, there is an unambiguous specification for determining whether a string is or is not a member of the language. In computer science, strings containing balanced parentheses are called "Dyck Words," because they were first studied by [Walther von Dyck].

[Walther von Dyck]: https://en.wikipedia.org/wiki/Walther_von_Dyck

We mentioned "unambiguously specifying whether a string belongs to a language." A computer scientist's favourite tool for unambiguously specifying anything is a computing device or machine. And indeed, for something to be a formal language, there must be a machine that acts as its specification.

As alluded to above, we call these machines _recognizers_. A recognizer takes as its input a series of tokens making up a string, and returns as its output whether it recognizes the string or not. If it does, that string is a member of the language. Computer scientists studying formal languages also study the recognizers for those languages.

There are infinitely many formal languages, but there is an important family of formal languages called [regular languages][regular language].[^kleene]

[^kleene]: Formal regular expressions were invented by [Stephen Kleene].

[regular language]: https://en.wikipedia.org/wiki/Regular_language
[Stephen Kleene]: https://en.wikipedia.org/wiki/Stephen_Cole_Kleene

There are a couple of ways to define regular languages, but the one most pertinent to pattern matching is this: A regular language can be recognized by a Deterministic Finite Automaton, or "[DFA]." Meaning, we can construct a simple "state machine" to recognize whether a string is valid in the language, and that state machine will have a finite number of states.

[DFA]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton

Consider the very simple language consisting of the strings `Reg` and `Reggie`. This language can be implemented with this deterministic finite automaton:

<div class="mermaid">
  graph TD
    start(start)-->|R|R
    R-->|e|Re
    Re-->|g|Reg

    Reg-.->|end|recognized(recognized)

    Reg-->|g|Regg
    Regg-->|i|Reggi
    Reggi-->|e|Reggie

    Reggie-.->|end|recognized;
</div>

---

[![Brutalism](/assets/images/pushdown/brutalism.jpg)](https://www.flickr.com/photos/nagarjun/44124773002)

---

### implementing a deterministic finite automaton in javascript

A Deterministic Finite Automaton is the simplest of all possible state machines: It can only store information in its explicit state, there are no other variables such as counters or stacks.[^sm]

[^sm]: There are many ways to write DFAs in JavaScript. In [How I Learned to Stop Worrying and ❤️ the State Machine], we built JavaScript programs using the [state pattern], but they were far more complex than a deterministic finite automaton. For example, those state machines could store information in properties, and those state machines had methods that could be called.<br/><br/>Such "state machines" are not "finite" state machines, because in principle they can have an infinite number of states. They have a finite number of defined states in the pattern, but their properties allow them to encode state in other ways, and thus they are not _finite_ state machines.

[How I Learned to Stop Worrying and ❤️ the State Machine]: http://raganwald.com/2018/02/23/forde.html
[state pattern]: https://en.wikipedia.org/wiki/State_pattern

Since a DFA can only encode state by being in one of a finite number of states, and since a DFA has a finite number of possible states, we know that a DFA can only encode a finite amount of state.

The only thing a DFA recognizer does is respond to tokens as it scans a string, and the only way to query it is to look at what state it is in, or detect whether it has halted.

Here's a pattern for implementing the "name" recognizer DFA in JavaScript:

```javascript
const END = Symbol('end');
const RECOGNIZED = Symbol('recognized');
const UNRECOGNIZED = Symbol('unrecognized');

function DFA (start) {
  return string => {
    let currentState = start;
    for (const token of string) {
      const action = currentState(token);

      if (action === RECOGNIZED) {
        return true;
      } else if (action === UNRECOGNIZED || action === undefined) {
        return false;
      } else {
        currentState = action;
      }
    }

    const finalAction = currentState(END);
    return finalAction === RECOGNIZED;
  }
}

function testDFA (recognizer, examples) {
  for (const example of examples) {
    console.log(`'${example}' => ${recognizer(example)}`);
  }
}

// state definitions
const start = token => token === 'R' ? R : UNRECOGNIZED;
const R = token => token === 'e' ? Re : UNRECOGNIZED;
const Re = token => token === 'g' ? Reg : UNRECOGNIZED;
const Reg = token => {
  switch (token) {
    case END:
      return RECOGNIZED;
    case 'g':
      return Regg;
	}
}
const Regg = token => token === 'i' ? Reggi : UNRECOGNIZED;
const Reggi = token => token === 'e' ? Reggie : UNRECOGNIZED;
const Reggie = token => token === END ? RECOGNIZED : UNRECOGNIZED;

// define our recognizer
const reginald = DFA(start);

testDFA(reginald, [
  '', 'Scott', 'Reg', 'Reginald', 'Reggie'
]);
  //=>
    '' => false
    'Scott' => false
    'Reg' => true
    'Reginald' => false
    'Reggie' => true
```

This DFA has some constants for its own internal use, a state definition consisting of a function for each possible state the DFA can reach, and then a very simple "token scanning machine." The recognizer function takes a string as an argument, and returns `true` if the machine reaches the `RECOGNIZED` state.

Each state function takes a token and returns a state to transition to. If it does not return another state, the DFA halts and the recognizer returns false.

If we can write a recognizer using this pattern for a language, we know it is a regular language. Our "name" language is thus a very small formal language, with just two recognized strings.

On to infinite regular languages!

---

[![Concrete Habour](/assets/images/pushdown/habour.jpg)](https://www.flickr.com/photos/djselbeck/30690354838)

---

### infinite regular languages

If there are a finite number of finite strings in a language, there must be a DFA that recognizes that language.[^exercise]

But what if there are an _infinite_ number of finite strings in the language?

[^exercise]: To demonstrate that "If there are a finite number of strings in a language, there must be a DFA that recognizes that language," take any syntax for defining a DFA, such as a table. With a little thought, one can imagine an algorithm that takes as its input a finite list of acceptable strings, and generates the appropriate table.

For some languages that have an infinite number of strings, we can still construct a deterministic finite automaton to recognize them. For example, here is a deterministic finite automaton that recognizes binary numbers:

<div class="mermaid">
  graph LR
    start(start)-->|0|zero
    zero-.->|end|recognized(recognized)
    start-->|1|one(one or more)
    one-->|0 or 1|one
    one-.->|end|recognized;
</div>

And we can also write this DFA in JavaScript:

```javascript
const start = token => {
  if (token === '0') {
    return zero;
  } else if (token === '1') {
    return oneOrMore;
  }
};

const zero = token => {
  if (token === END) {
    return RECOGNIZED;
  }
};

const oneOrMore = token => {
  if (token === '0') {
    return oneOrMore;
  } else if (token === '1') {
    return oneOrMore;
  } else if (token === END) {
    return RECOGNIZED;
  }
};

const binary = DFA(start);

testDFA(binary, [
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

Our recognizer is finite, yet it recognizes an infinite number of finite strings, including those that are improbably long. And since the recognizer has a fixed and finite size, it follows that "binary numbers" is a regular language.

Now that we have some examples of regular languages. We see that they can be recognized with finite state automata, and we also see that it is possible for regular languages to have an infinite number of strings, some of which are arbitrarily long (but still finite). This does not, in principle, bar us from creating deterministic finite automatons to recognize them.

We can now think a little harder about the balanced parentheses problem. If "balanced parentheses" is a regular language, it must be possible to write a deterministic finite automaton to recognize a string with balanced parentheses.

But if it is *not* possible to write a deterministic finite automaton to recognize balanced parentheses, then balanced parentheses must be a kind of language that is more complex than a regular language, and must require a more powerful machine for recognizing its strings.

---

[![Orșova - biserica catolică "Neprihănita Zămislire"](/assets/images/pushdown/church.jpg)](https://www.flickr.com/photos/fusion_of_horizons/15562816916)

---

### nested parentheses

Of all the strings that contain zero or more parentheses, there is a set that contains zero or more opening parentheses followed by zero or more closed parentheses, _and where the number of opening parentheses exactly equals the number of closed parentheses_.

The strings that happen to contain exactly the same number of opening parentheses as closed parentheses can just as easily be described as follows: _A string belongs to the language if the string is `()`, or if the string is `(` and `)` wrapped around a string that belongs to the language._

We call these strings "nested parentheses," and it is related to balanced parentheses: _All nested parentheses strings are also balanced parentheses strings._ Our approach to determining whether balanced parentheses is a regular language will use nested parentheses.

First, we will assume that there exists a deterministic finite automaton that can recognized balanced parentheses. Let's call this machine `B`. Since nested parentheses are also balanced parentheses, `B` must recognize nested parentheses. Next, we will use nested parentheses strings to show that by presuming that `B` has a finite number of states, we create a logical contradiction.

This will establish that our assumption that there is a deterministic finite automaton—'B'—that recognizes balanced parentheses is faulty, which in turn establishes that balanced parentheses is not a regular language.[^reductio]

[^reductio]: This type of proof is known as "Reductio Ad Absurdum," and it is a favourite of logicians, because _quidquid Latine dictum sit altum videtur_.

Okay, we are ready to prove that a deterministic finite automaton cannot recognize nested parentheses, which in turn establishes that a deterministic finite automaton cannot recognize balanced parentheses.

---

[![Mäusenbunker — Exploring Architectural Brutalism in #Berlin Lichterfelde](/assets/images/pushdown/bunker.jpg)](https://www.flickr.com/photos/gastaum/35146038250)

---

### balanced parentheses is not a regular language

Back to the assumption that there is a deterministic finite automaton that can recognize balanced parentheses, `B`. We don't know how many states `B` has, it might be a very large number, but we know that there are a finite number of these states.

Now let's consider the set of all strings that begin with one or more open parentheses: `(`, `((`, `(((`, and so forth. Our DFA will always begin in the *start* state, and for each one of these strings, when `B` scans them, it will always end in some state.

There are an infinite number of such strings of open parentheses, but there are only a finite number of states in B, so it follows that there are at least two different strings of open parentheses that--when scanned--end up in the same state. Let's call the shorter of those two strings **p**, and the longer of those two strings **q**.[^loop]

[^loop]: An interesting thing to note is for *any* DFA, there must be an infinite number of pairs of different strings that lead to the same state, this follows form the fact that the DFA has a finite number of states, but we can always find more finite strings than there are states in the DFA.<br/><br/>But for this particular case, where we are talking about strings that consist of a single symbol, and of different lengths, it follows that the DFA *must* contain at least one loop.

We can make a pretend function called **state**. `state` takes a DFA, a start state, and a string, and returns the state the machine is in after reading a string, or it returns `halt` if the machine halted at some point while reading the string.

We are saying that there is at least one pair of strings of open parentheses, `p` and `q`, such that `p ≠ q`, and `state(B, start, p) = state(B, start, q)`. (Actually, there are an infinite number of such pairs, but we don't need them all to prove a contradiction, a single pair will do.)

Now let us consider the string **p'**. `p'` consists of exactly as many closed parentheses as there are open parentheses in `p`. It follows that string `pp'` consists of `p`, followed by `p'`. `pp'` is a string in the balanced parentheses language, by definition.

String `qp'` consists of `q`, followed by `p'`. Since `p` has a different number of open parentheses than `q`, string `qp'` consists of a different number of open parentheses than closed parentheses, and thus `qp'` is not a string in the balanced parentheses language.

Now we run `B` on string `pp'`, pausing after it has read the characters in `p`. At that point, it will be in `state(B, start, p)`. It then reads the string `p'`, placing it in `state(B, state(B, start, p), p')`.

Since `B` recognizes strings in the balanced parentheses language, and `pp'` is a string in the balanced parentheses language, we know that `state(B, start, pp')` is _recognized_. And since `state(B, start, pp')` equals `state(B, state(B, start, p), p')`, we are also saying that `state(B, state(B, start, p), p')` is *recognized*.

What about running `B` on string `qp'`? Let's pause after it reads the characters in `q`. At that point, it will be in `state(B, start, q)`. It then reads the string `p'`, placing it in `state(B, state(B, start, q), p')`. Since `B` recognizes strings in the balanced parentheses language, and `qp'` is not a string in the balanced parentheses language, we know that `state(B, start, pq')` must **not** equal _recognized_, and that state `state(B, state(B, start, q), p')` must not equal recognized.

But `state(B, start, p)` is the same state as `state(B, start, q)`! And by the rules of determinism, then `state(B, state(B, start, p), p')` must be the same as `state(B, state(B, start, q), p')`. But we have established that `state(B, state(B, start, p), p')` must be _recognized_ and that `state(B, state(B, start, p), p')` must **not** be recognized.

Contradiction! Therefore, our original assumption—that `B` exists—is false. There is no deterministic finite automaton that recognizes balanced parentheses. And therefore, balanced parentheses is not a regular language.

---

# Deterministic Context-free Languages and Deterministic Pushdown Automata

---

[![HUD Plaza](/assets/images/pushdown/hud.jpg)](https://www.flickr.com/photos/brownpau/29937123348)

---

### deterministic pushdown automata

We now know that "balanced parentheses" cannot be recognized with one of the simplest possible computing machines, a finite state automaton. This leads us to ask, "What is the simplest form of machine that can recognize balanced parentheses?" Computer scientists have studied this and related problems, and there are a few ideal machines that are more powerful than a DFA, but less powerful than a Turing Machine.

All of them have some mechanism for encoding an infinite number of states by adding some form of "external state" to the machine's existing "internal state."This is very much like a program in a von Neumann machine. Leaving out self-modifying code, the position of the program counter is a program's internal state, while memory that it reads and writes is its external state.[^inf]

[^inf]: No matter how a machine is organized, if it has a finite number of states, it cannot recognized balanced parenthese by our proof above. Fr example, if we modify our DFA to allow an on/off flag for each state, and we have a finite number of states, our machine is not more powerful than a standard DFA, it is just more compact: Its definition is `log2` the size of a standard DFA, but it still has a finite number of possible different states.

The simplest machine that adds external state, which we might think of as being one step more powerful than a DFA, is called a [Deterministic Pushdown Automaton][pa], or "DPA." A DPA is very much like our Deterministic Finite Automaton, but it adds an expandable stack as its external state.

[pa]: https://en.wikipedia.org/wiki/Pushdown_automaton

There are several classes of Pushdown Automata, depending upon what they are allowed to do with the stack. A Deterministic Pushdown Automaton has the simplest and least powerful capability:

1. When a DPA matches the current token, the value of the top of the stack, or both.
2. A DPA can halt or choose the next state, and it can also push a symbol onto the top of the stack, pop the current symbol off the top of the stack, or replace the top symbol on the stack.

If a deterministic pushdown automata can recognize a language, the language is known as a [deterministic context-free language]. Is "balanced parentheses" a deterministic context-free language?

[deterministic context-free language]: https://en.wikipedia.org/wiki/Deterministic_context-free_language

Can we write a DPA to recognize balanced parentheses? DPAs have a finite number of internal states. Our proof that balanced parentheses was not a regular language rested on the fact that any DFA could not recognize balanced parentheses with a finite number of internal states.

Does that apply to DPAs too? No.

A DPA still has a finite number of internal states, but because of its external stack, it can encode an infinite number of possible states. With a DFA, we asserted that if it is in a particular internal state, and it reads a string of tokens, it will end up halting or reaching a state, and given that internal state and that series of tokens, the DFA will always end up halting or always end up reaching the same end state.

This is not true of a DPA. A DPA can push tokens onto the stack, pop tokens off the stack, and make decisions based on the top token on the stack. As a result, we cannot determine the destiny of a DPA based on its internal state and sequence of tokens alone, we have to include the state of the stack.

Therefore, our proof that a DFA with finite number of internal states cannot recognize balanced parentheses does not apply to DPAs. If we can write a DPA to recognize balanced parentheses, then "balanced parentheses" is a deterministic context-free language.

---

[![Croydon Brutalism](/assets/images/pushdown/croydon.jpg)](https://www.flickr.com/photos/jontyfairless/40874170151)

---

### balanced parentheses is a deterministic context-free language

Let's start with a recognizer that can implement DPAs. Now that we have to track both the current internal state _and_ external state in the form of a stack, we'll add a little ceremony and write our recognizers as JavaScript classes.

```javascript
const END = Symbol('end');

class DPA {
  constructor(internal = 'start', external = []) {
    this.internal = internal;
    this.external = external;
    this.halted = false;
    this.recognized = false;
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
    return this[this.internal](token);
  }

  static evaluate (string) {
    let state = new this();

    for (const token of string) {
      const newState = state.consume(token);

      if (newState === undefined || newState.halted) {
        return false;
      } else if (newState.recognized) {
        return true;
      } else {
        state = newState;
      }
    }

    const finalState = state.consume(END);
    return !!(finalState && finalState.recognized);
  }
}

function test (recognizer, examples) {
  for (const example of examples) {
    console.log(`'${example}' => ${recognizer.evaluate(example)}`);
  }
}
```

Now, a stack implemented in JavaScript cannot actually encode an infinite amount of information. The depth of the stack is limited to `2^32 -1`, and there are a finite number of different values we can push onto the stack. And then there are limitations like the the memory in our machines, or the number of clock ticks our CPUs will execute before the heat-death of the universe.

But our implementation shows the basic principle, and it's good enough for any of the test strings we'll write by hand.

Now how about a recognizer for balanced parentheses?

```javascript
class BalancedParentheses extends DPA {
  start(token) {
    if (token === '(') {
      return this.push(token);
    } else if (token === ')' && this.top() === '(') {
      return this.pop();
    } else if (token === END && this.hasEmptyStack()) {
        return this.recognize();
    }
  }
}

test(BalancedParentheses, [
	'', '(', '()', '()()', '(())',
'([()()]())', '([()())())',
'())()', '((())(())'
]);
  //=>
    '' => true
    '(' => false
    '()' => true
    '()()' => true
    '(())' => true
    '([()()]())' => false
    '([()())())' => false
    '())()' => false
    '((())(())' => false
```

Aha! _Balanced parentheses is a deterministic context-free language._

Our recognizer is so simple, we can give in to temptation and enhance it to recognize multiple types of parentheses:

```javascript
class BalancedParentheses extends DPA {
  start(token) {
    if (token === '(') {
      return this.push(token);
    } else if (token === '[') {
      return this.push(token);
    } else if (token === '{') {
      return this.push(token);
    } else if (token === ')' && this.top() === '(') {
      return this.pop();
    } else if (token === ']' && this.top() === '[') {
      return this.pop();
    } else if (token === '}' && this.top() === '{') {
      return this.pop();
    } else if (token === END && this.hasEmptyStack()) {
        return this.recognize();
    }
  }
}

test(BalancedParentheses, [
  '', '(', '()', '()()', '{()}',
	'([()()]())', '([()())())',
	'())()', '((())(())'
]);
  //=>
    '' => true
    '(' => false
    '()' => true
    '()()' => true
    '{()}' => true
    '([()()]())' => true
    '([()())())' => false
    '())()' => false
    '((())(())' => false
```

Balanced parentheses with a finite number of pairs of parentheses is also a deterministic context-free language. We're going to come back to deterministic context-free languages in a moment, but let's consider a slightly different way to recognize balanced parentheses first.

---

[![BNP Paribas Fortis, Brussels](/assets/images/pushdown/paribas.jpg)](https://www.flickr.com/photos/itmpa/33065919198)

---

### recursive regular expressions

We started this essay by mentioning regular expressions. We then showed that a *formal* regular expression cannot recognize balanced parentheses, in that formal regular expressions can only define regular languages.

Regular expressions as implemented in programming languages--abbreviated rexen (singular regex)--are a different beast. Various features have been added to make them non-deterministic, and on some platforms, even recursive.

JavaScripts regexen do not support recursion, but the Oniguruma regular expression engine used by Ruby (and PHP) does support recursion. Here's an implementation of simple balanced parentheses, written in Ruby:


```ruby
/^(?'balanced'(?:\(\g'balanced'\))*)$/x
```

It is written using the standard syntax. Standard syntax is compact, but on more complex patterns can make the pattern difficult to read. "Extended" syntax ignores whitespace, which is very useful when a regular expression is complex and needs to be visually structured.

Extended syntax also allows comments. Here's a version that can handle three kinds of parentheses:

```ruby
%r{                     # Start of a Regular expression literal.

  ^                     # Match the beginning of the input

  (?'balanced'          # Start a non-capturing group named 'balanced'

    (?:                 # Start an anonymous non-capturing group

      \(\g'balanced'\)  # Match an open parenthesis, anything matching the 'balanced'
                        # group, and a closed parenthesis. ( and ) are escaped
                        # because they have special meanings in regular expressions.

      |                 # ...or...

      \[\g'balanced'\]  # Match an open bracket, anything matching the 'balanced'
                        # group, and a closed bracket. [ and ] are escaped
                        # because they have special meanings in regular expressions.

      |                 # ...or...

      \{\g'balanced'\}  # Match an open brace, anything matching the 'balanced'
                        # group, and a closed bracket. { and } are escaped
                        # because they have special meanings in regular expressions.

    )*                  # End the anonymous non-capturing group, and modify
                        # it so that it matches zero or more times.

  )                     # End the named, non-capturing group 'balanced'

  $                     # Match the end of the input

}x                      # End of the regular expression literal. x is a modifier
                        # indicating "extended" syntax, allowing comments and
                        # ignoring whitespace.
```

These recursive regular expressions specify a deterministic context-free language, and indeed we already have developed deterministic pushdown automata that perform the same recognizing.

We know that recognizing these languages requires some form of state that is equivalent to a stack with one level of depth for every unclosed parenthesis. That is handled for us by the engine, but we can be sure that somewhere behind the scenes, it is consuming the equivalent amount of memory.

So we know that recursive regular expressions appear to be at least as powerful as deterministic pushdown automata. But are they more powerful? Meaning, is there a language that a recursive regular expression can match, but a DPA cannot?

---

# Context-Free Languages and Pushdown Automata

---

[![El CECUT, Centro Cultural Tijuana, la Bola.](/assets/images/pushdown/cecut.jpg)](https://www.flickr.com/photos/omaromar/28357989)

---

### nested parentheses

To demonstrate that recursive regular expressions are more powerful than DPAs, let's begin by simplifying our balanced parentheses language. Here's a three-state DPA that recognizes _nested_ parentheses only, not all balanced parentheses:

```javascript
class NestedParentheses extends DPA {
  start(token) {
    switch(token) {
      case END:
        return this.recognize();
      case '(':
        return this
          .push(token)
          .transitionTo('opening');
      case '[':
        return this
          .push(token)
          .transitionTo('opening');
      case '{':
        return this
          .push(token)
          .transitionTo('opening');
    }
  }

  opening(token) {
    if (token === '(') {
      return this.push(token);
    } else if (token === '[') {
      return this.push(token);
    } else if (token === '{') {
      return this.push(token);
    } else if (token === ')' && this.top() === '(') {
      return this
        .pop()
        .transitionTo('closing');
    } else if (token === ']' && this.top() === '[') {
      return this
        .pop()
        .transitionTo('closing');
    } else if (token === '}' && this.top() === '{') {
      return this
        .pop()
        .transitionTo('closing');
    }
  }

  closing(token) {
    if (token === ')' && this.top() === '(') {
      return this.pop();
    } else if (token === ']' && this.top() === '[') {
      return this.pop();
    } else if (token === '}' && this.top() === '{') {
      return this.pop();
    } else if (token === END && this.hasEmptyStack()) {
      return this.recognize();
    }
  }
}

test(NestedParentheses, [
  '', '(', '()', '()()', '{()}',
	'([()])', '([))',
	'(((((())))))'
]);
  //=>
    '' => true
    '(' => false
    '()' => true
    '()()' => false
    '{()}' => true
    '([()])' => true
    '([))' => false
    '(((((())))))' => true
```

And here is the equivalent recursive regular expression:

```ruby
nested = %r{
    ^
    (?'nested'
      (?:
        \(\g'nested'\)
        |
        \[\g'nested'\]
        |
        \{\g'nested'\}
      )?
    )
    $
  }x

def test pattern, strings
  strings.each do |string|
    puts "'#{string}' => #{!(string =~ pattern).nil?}"
  end
end

test nested, [
  '', '(', '()', '()()', '{()}',
	'([()])', '([))',
	'(((((())))))'
]
  #=>
    '' => true
    '(' => false
    '()' => true
    '()()' => false
    '{()}' => true
    '([()])' => true
    '([))' => false
    '(((((())))))' => true
```

So far, so good. Of course they both work, nested parentheses is a subset of balanced parentheses, so we know that it's a deterministic context-free language.

But now let's modify our program to help with documentation, rather than math. Let's make it work with quotes.

---

[![Rezola cement factory, San Sebastian, Spain](/assets/images/pushdown/cement.jpg)](https://www.flickr.com/photos/23148289@N05/31697666668)

---

### context-free languages

Instead of matching open and closed parentheses, we'll match quotes, both single quotes like `'` and double quotes like `""`.[^quotes]

[^quotes]: For this pattern, we are not interested in properly typeset quotation marks, we mean the single and double quotes that don't have a special form for opening and closing, the kind you find in programming languages that were designed to by reproducible by telegraph equipment: `'` and `"`. If we could use the proper "quotes," then our language would be a Dyck Language, equivalent to balanced parentheses.

Our first crack is to modify our existing DPA by replacing opening and closing parentheses with quotes. We'll only need two cases, not three:

Here's our DPA:

```javascript
class NestedQuotes extends DPA {
  start(token) {
    switch(token) {
      case END:
        return this.recognize();
      case '\'':
        return this
          .push(token)
          .transitionTo('opening');
      case '"':
        return this
          .push(token)
          .transitionTo('opening');
    }
  }

  opening(token) {
    if (token === '\'') {
      return this.push(token);
    } else if (token === '"') {
      return this.push(token);
    } else if (token === '\'' && this.top() === '\'') {
      return this
        .pop()
        .transitionTo('closing');
    } else if (token === '"' && this.top() === '"') {
      return this
        .pop()
        .transitionTo('closing');
    }
  }

  closing(token) {
    if (token === '\'' && this.top() === '\'') {
      return this.pop();
    } else if (token === '"' && this.top() === '"') {
      return this.pop();
    } else if (token === END && this.hasEmptyStack()) {
      return this.recognize();
    }
  }
}

test(NestedQuotes, [
  ``, `'`, `''`, `""`, `'""'`,
  `"''"`, `'"'"`, `"''"""`,
  `'"''''''''''''''''"'`
]);
  //=>
    '' => true
    ''' => false
    '''' => false
    '""' => false
    ''""'' => false
    '"''"' => false
    ''"'"' => false
    '"''"""' => false
    ''"''''''''''''''''"'' => false
```

`NestedQuotes` does not work. What if we modify our recursive regular expression to work with single and double quotes?

```ruby
quotes = %r{
    ^
    (?'balanced'
      (?:
        '\g'balanced''
        |
        "\g'balanced'"
      )?
    )
    $
  }x

test quotes, [
  %q{}, %q{'}, %q{''}, %q{""}, %q{'""'},
  %q{"''"}, %q{'"'"}, %q{"''"""},
  %q{'"''''''''''''''''"'}
]
  #=>
    %q{} => true
    %q{'} => false
    %q{''} => true
    %q{""} => true
    %q{'""'} => true
    %q{"''"} => true
    %q{'"'"} => false
    %q{"''"""} => false
    %q{'"''''''''''''''''"'} => true
```

The recursive regular expression does work! Now, we may think that perhaps we went about writing our deterministic pushed automaton incorrectly, and there is a way to make it work, but no. It will never work on this particular problem.

This particular language--nested single and double quotes quotes--is a very simple example of the "palindrome" problem. We cannot use a deterministic pushdown automaton to write a recognizer for palindromes that have at least two different kinds of tokens.

And that tells us that there is a class of languages that are more complex than deterministic context-free languages. The are [context-free languages](https://en.wikipedia.org/wiki/Context-free_language), and they are a superset of deterministic context-free languages.

---

[![brutalism 3 of 3](/assets/images/pushdown/brutalism3.jpg)](https://www.flickr.com/photos/27556454@N07/4328321198)

---

### why deterministic pushdown automata cannot recognize palindromes

Why can't a deterministic pushdown automaton recognize our nested symmetrical quotes language? For the same reason that deterministic pushdown automata cannot recognize arbitrarily long palindromes.

Let's consider a simple palindrome language. In this language, there are only two tokens, `0`, and `1`. In our language, any even-length palindrome is valid, such as `00`, `1001`, and `000011110000`. We aren't going to do a formal proof here, but let's imagine that there is a DPA that can recognize this language, we'll call this DPA `P`.[^readability]

[^readability]: The even-length palindrome language composes of `0`s and `1`s is 100% equivalent to the nested quotes language, we're just swapping `0` for `'`, and `1` for `"`, because they're easier for this author's eyes to read.

Let's review for a moment how DPAs (like FSAs) work. There can only be a finite number of internal states. And there can only be a finite set of symbols that it manipulates (there might be more symbols than tokens in the language it recognizes, but still only a finite set.)

Now, depending upon how `P` is organized, it may push one symbol onto the stack for each token it reads, or it might push a token every so many tokens. For example, it could encode four bits of information about the tokens read as a single hexadecimal `0` through `F`. Or 256 bits as the hexadecimal pairs `00` through `FF`, and so on. or it might just store one bit of information per stack element, in which case it's "words" would only have one bit each.

So the top-most element of the `P`'s external stack can contain an arbitrary, but finite amount of information. And `P`'s internal state can hold an arbitrary, but finite amount of information. There are fancy ways to get at elements below the topmost element, but to do so, we must either discard the top-most element's information, or store it in `P`'s finite internal state temporarily, and then push it back.

That doesn't actually give `P` any more recollection than storing state on the top of the stack and in its internal state. We can store more information than can be held in `P`'s internal state and on the top of `P`'s external stack, but to access more information, we must permanently discard information from the top of the stack.[^dup]

[^dup]: In [concatenative programming languages], such as PostScript, Forth, and Joy, there are `DUP` and `SWAP` operations that, when used in the right combination, can bring an element of the stack to the top, and then put it back where it came from. One could construct a DPA such that it has the equivalent of `DUP` and `SWAP` operations, but since a DPA can only perform one `push`, `pop`, or `replace` for each token it consumes, the depth of stack it can reach is limited by its ability to store the tokens it is consuming in its internal state, which is finite. For any DPA, there will always be some depth of stack that is unreachable without discarding information.

[concatenative programming languages]: https://en.wikipedia.org/wiki/Concatenative_programming_language

---

So let's consider what happens when we feed `P` a long string of `0`s and `1`s that is "incompressible," or random in an information-theoretic sense. Each token in our vocabulary of `1`s and `0`s represents an additional bit of information. We construct a string long enough that `P` **must** store some of the string's information deep enough in the stack to be inaccessible without discarding information:

Now we begin to feed it the inverse of the string read so far. What does `P` do?

If `P` is to recognize a palindrome, it must eventually dig into the "inaccessible" information, which means discarding some information. So let's feed it enough information such that it discards some information. Now we give it a token that is no longer part of the inverse of the original string. What does `P` do now? We haven't encountered the `END`, so `P` cannot halt and declare that the string is not a palindrome. After all, this could be the beginning of an entirely new palindrome, we don't know yet.

But since `P` has discarded some information in order to know whether to match an earlier possible palindrome, `P` does not now have enough information to match a larger palindrome. Ok, so maybe `P` shouldn't have discarded information to match the shorter possible palindrome. If it did not do so, `P` would have the information required to match the longer possible palindrome.

But that breaks any time the shorter palindrome is the right thing to recognize.

Now matter how we organize `P`, we can always construct a string large enough that `P` must discard information to correctly recognize one possible string, but not discard information in order to correctly recognize another possible string.

Since `P` is deterministic, meaning it always does exactly one thing in response to any token given a particular state, `P` cannot both *discard* and simultaneously *not discard* information, therefore `P` cannot recognize languages composed of palindromes.

Therefore, no DPA can recognize languages composed of palindromes.

---

[![gottfried böhm, architect: maria königin des friedens pilgrimage church, neviges, germany 1963-1972](/assets/images/pushdown/neviges.jpg)](https://www.flickr.com/photos/seier/3165564453)

---

### pushdown automata

We said that there is no deterministic pushdown automaton that can recognize a palindrome language like our symmetrical quotes language. And to reiterate, we said that this is the case because a deterministic pushdown automaton cannot simultaneously remove information from its external storage and add information to its external storage. If we wanted to make a pushdown automaton that *could* recognize palindromes, we could go about it in one of two ways:

1. We could relax the restrictions on what an automaton can do with the stack in one step. e.g. access any element or store a stack in an element of the stack. Machine that can do more with the stack than a single `push`, `pop`, or `replace` are called Stack Machines.
2. We could relax the restriction that a deterministic pushdown automata must do one thing, or another, but not both.

Let's consider the latter option. Deterministic machines must do one and only one thing in response to a token and the top of the stack. That's what makes them "deterministic." In effect, their logic always looks like this:

```javascript
start (token) {
  if (token === this.top()) {
    return this.pop();
  } else if (token === '0' || token === '1') {
    return this.push(token);
  } else if (token == END and this.hasEmptyStack()) {
    return this.recognize();
  } else if (token == END and this.hasEmptyStack()) {
    return this.halt();
  }
}
```

Such logic pops, recognizes, halts, or pushes the current token, but it cannot do more than one of these things simultaneously. But what if the logic looked like this?

```javascript
* start (token) {
  if (token === this.top()) {
    yield this.pop();
  }
  if (token === '0' || token === '1') {
    yield this.push(token);
  }
  if (token == END and this.hasEmptyStack()) {
    yield this.recognize();
  }
  if (token == END and this.hasEmptyStack()) {
    yield this.halt();
  }
}
```

This logic is formulated as a generator that yields one or more outcomes. It can do more than one thing at a time. It expressly can both `pop` and `push` the current token when it matches the top of the stack. How will this work?

---

[![overhead brutalism](/assets/images/pushdown/overhead.jpg)](https://www.flickr.com/photos/juggernautco/3015994563)

---

### an object-oriented deterministic pushdown automaton

We will now use this approach to write a recognizer for the "even-length binary palindrome" problem. We'll use the same general idea as our `NestedParentheses` language, but we'll make three changes:

- Our state methods will be generators;
- We evaluate all the possible actions and `yield` each one's result;
- We add a call to `.fork()` for each result, which as we'll see below, means that we are cloning our state and making changes to the clone.

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
```

Now let's modify `DPA` to create `PushdownAutomaton`. We'll literally copy the code from `class DPA { ... }` and make the following changes:[^well-actually]

[^well-actually]: If we were really strict about OO and inheritance, we might have them both inherit from a common base class of `AbstractPushdownAutomaton`, but "Aint nobody got time for elaborate class hierarchies."

```javascript
class PushdownAutomaton {

   // ... copy-pasta from class DPA

  consume(token) {
    return [...this[this.internal](token)];
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

The new `consume` method calls the internal state method as before, but then uses the array spread syntax to turn the elements it yields into an array. The `fork` method makes a deep copy of a state object.[^fork]

[^fork]: This code makes a number of unnecessary copies of states, we could devise a scheme to use [structural sharing and copy-on-write semantics](http://raganwald.com/2019/01/14/structural-sharing-and-copy-on-write.html), but we don't want to clutter up the basic idea right now.

The biggest change is to the `evaluate` static method. we now start with an array of one state. As we loop over the tokens in the string, we take the set of all states and `flatMap` them to the states they return, then filter out any states that halt.

If we end up with no states that haven't halted, the machine fails to recognize the string. Whereas, if _any_ of the states lead to recognizing the string, the machine recognizes the string. If not, we move to the next token. When we finally pass in the `END` token, if any of the states returned recognize the string, then we recognize the string.

So does it work?

```javascript
test(BinaryPalindrome, [
  '', '0', '00', '11', '0110',
  '1001', '0101', '100111',
  '01000000000000000010'
]);
  //=>
    '' => true
    '0' => false
    '00' => true
    '11' => true
    '0110' => true
    '1001' => true
    '0101' => false
    '100111' => false
    '01000000000000000010' => true
```

Indeed it does, and we leave as "exercises for the reader" to perform either of these two modifications:

1. Modify `Binary Palindrome` to recognize both odd- and even-length palindromes, or;
2. Modify `Binary Palindrome` so that it recognizes nested quotes instead of binary palindromes.

Our pushdown automaton works because when it encounters a token, it both pushes the token onto the stack _and_ compares it to the top of the stack and pops it off if it matches. It forks itself each time, so it consumes exponential space and time. But it *does* work.

And that shows us that pushdown automata are more powerful than deterministic pushdown automata, because they can recognize languages that deterministic pushdown automata cannot recognize: Context-free languages.

---

[![Marseille - Cité Radieuse](/assets/images/pushdown/radieuse.jpg)](https://www.flickr.com/photos/129231073@N06/16421231812)

---

### deterministic context-free languages are context-free languages

---

Pushdown automata are a more powerful generalization of deterministic pushdown automata: They can recognize anything a deterministic pushdown automaton can recognize, and using the exact same diagram.

We can see this by writing a pushdown automaton to recognize a deterministic context-free language. Here is the state diagram:

<div class="mermaid">
  graph LR
    start(L)-->|O|LO("L(OL)*O")
    LO-->|L|LOL("L(OL)+")
    LOL-->|O|LO
    LOL-.->|end|recognized
</div>

And here is our code. As noted before, in our implementation, it is almost identical to the implementation we would write for a DPA:

```javascript
class LOL extends PushdownAutomaton {
  * start (token) {
    if (token === 'L') {
      yield this
      	.fork()
      	.transitionTo('l');
    }
  }

  * l (token) {
    if (token === 'O') {
      yield this
      	.fork()
      	.transitionTo('lo');
    }
  }

  * lo (token) {
    if (token === 'L') {
      yield this
      	.fork()
      	.transitionTo('lol');
    }
  }

  * lol (token) {
    if (token === 'O') {
      yield this
      	.fork()
      	.transitionTo('lo');
    }
    if (token === END) {
      yield this
      	.fork()
      	.recognize();
    }
  }
}

test(LOL, [
  '', 'L', 'LO', 'LOL', 'LOLO',
  'LOLOL', 'LOLOLOLOLOLOLOLOLOL',
  'TROLOLOLOLOLOLOLOLO'
]);
  //=>
    '' => false
    'L' => false
    'LO' => false
    'LOL' => true
    'LOLO' => false
    'LOLOL' => true
    'LOLOLOLOLOLOLOLOLOL' => true
    'TROLOLOLOLOLOLOLOLO' => false
```

But we needn't ask anyone to "just trust us on this." Here's an implementation of `PushdownAutomaton` that works for both deterministic and general pushdown automata:

```javascript
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

Now if we want to show that an automaton written in non-deterministic style has the same semantics as an automaton written for our original `DPA` class, we can write it like this:

```javascript
class LOL extends PushdownAutomaton {

  isDeterministic () {
    return true;
  }

  // rest of states remain exactly the same

  ...
}
```

We can even experiment with something like `BinaryPalindrome`. By implementing `isDeterministic()` and alternating between having it return `true` and `false`, we can see that the language it recognizes is context-free but not deterministically context-free:

```javascript
class BinaryPalindrome extends PushdownAutomaton {
  isDeterministic () {
    return true;
  }

  ...

}

test(BinaryPalindrome, [
  '', '0', '00', '11', '0110',
  '1001', '0101', '100111',
  '01000000000000000010'
]);
  //=>
    '' => true
    '0' => false
    '00' => false
    '11' => false
    '0110' => false
    '1001' => false
    '0101' => false
    '100111' => false
    '01000000000000000010' => false

class BinaryPalindrome extends PushdownAutomaton {
  isDeterministic () {
    return false;
  }

  ...

}

test(BinaryPalindrome, [
  '', '0', '00', '11', '0110',
  '1001', '0101', '100111',
  '01000000000000000010'
]);
  //=>
    '' => true
    '0' => false
    '00' => true
    '11' => true
    '0110' => true
    '1001' => true
    '0101' => false
    '100111' => false
    '01000000000000000010' => true
```

Now, since context-free languages are the set of all languages that pushdown automata can recognize, and since pushdown automata can recognize all languages that deterministic pushdown automata can recognize, it follows that the set of all deterministic context-free languages is a subset of the set of all context-free languages.

Which is implied by the name, but it's always worthwhile to explore some of the ways to demonstrate its truth.

---

# The End

---

[![Night View of The Geisel Library, University of California San Diego](/assets/images/pushdown/geisel.jpg)](https://www.flickr.com/photos/opalsson/15163041049)

---

### summary

We've seen that formal languages (those made up of unambiguously defined strings of symbols) come in at least three increasingly complex families, and that one way to quantify that complexity is according to the capabilities of the machines (or "automata") capable of recognizing strings in the language.

Here are the three families of languages and automata that we reviewed:

| Language Family              | Automata Family        | Example Language(s)  |
|:-----------------------------|:-----------------------|:---------------------|
| *Regular*                    | Finite State           | Binary Numbers, LOL  |
| *Deterministic Context-free* | Deterministic Pushdown | Balanced Parentheses |
| *Context-free*               | Pushdown               | Palindromes          |

<br/>

An obvious question is, _Do you need to know the difference between a regular language and a context-free language if all you want to do is write some code that recognizes balanced parentheses?_

The answer is, _Probably not_. Consider cooking. A [food scientist][food science] knows all sorts of things about why certain recipes do what they do. A [chef de cuisine] (or "chef") knows how to cook and improvise recipes. Good chefs end up acquiring a fair bit of food science in their careers, and they know how to apply it, but they spend most of their time cooking, not thinking about what is going on inside the food when it cooks.

[food science]: https://en.wikipedia.org/wiki/Food_science
[chef de cuisine]: https://en.wikipedia.org/wiki/Chef

There are some areas where at least a smattering of familiarity with this particular subject is helpful. Writing parsers, to give one example. Armed with this knowledge, and but little more, the practising programmer knows how to design a configuration file's syntax or a domain-specific language to be amenable to parsing by an [LR(k)][LR Parser] parser, and what implications deviating from a deterministic context-free language will have on the performance of the parser.

[LR Parser]: https://en.wikipedia.org/wiki/LR_parser

But on a day-to-day basis, if asked to recognize balanced parentheses?

The very best answer is probably `/^(?'balanced'(?:\(\g'balanced'\))*)$/x` for those whose tools support recursive regular expressions, and a simple loop with a counter or stack for those whose tools don't.

---

[![Beinecke Rare Book & Manuscript Library Interior](/assets/images/pushdown/beinecke-interior.jpg)](https://www.flickr.com/photos/gnrklk/33574585673)

---

### further reading

If you enjoyed reading this introduction to formal languages and automata that recognize them, here are some interesting avenues to pursue:

Formal languages are actually specified with [formal grammars][formal grammar], not with informal descriptions like "palindrome," or, "binary number." The most well-known formal grammar is the [regular grammar], which defines a regular language. Regular grammars begat the original regular expressions.

Balanced parentheses has been discussed in this blog before: [Pattern Matching and Recursion] discusses building a recognizer out of composeable pattern-matching functions, while [Alice and Bobbie and Sharleen and Dyck] discusses a cheeky little solution to the programming problem.

For those comfortable with code examples written in Ruby, the general subject of ideal computing machines and the things they can compute is explained brilliantly and accessibly in Tom Stuart's book [Understanding Computation].

[formal grammar]: https://en.wikipedia.org/wiki/Formal_grammar
[regular grammar]: https://en.wikipedia.org/wiki/Formal_grammar#Regular_grammars
[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html
[Alice and Bobbie and Sharleen and Dyck]: http://raganwald.com/2018/11/14/dyck-joke.html
[Understanding Computation]: https://www.amazon.com/Understanding-Computation-Machines-Impossible-Programs/dp/1449329276/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1&tag=raganwald001-20&linkId=89116d710802aa56a49fd2dde7e742fa&language=en_US

---

[![Birmingham Central Library](/assets/images/pushdown/birmingham.jpg)](https://www.flickr.com/photos/frmark/5308847783)

---

### discussions

Discuss this essay on [hacker news](https://news.ycombinator.com/item?id=19225895), [proggit](https://www.reddit.com/r/programming/comments/at7kmu/a_brutal_look_at_balanced_parentheses_computing/), or [/r/javascript](https://www.reddit.com/r/javascript/comments/atiap7/a_brutal_look_at_balanced_parentheses_computing/).

---

# Notes