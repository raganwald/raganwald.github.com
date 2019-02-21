---
title: "From Balanced Parentheses to Computing with Pushdown Automata"
tags: [recursion,allonge,mermaid,noindex]
---

As we discussed in both [Pattern Matching and Recursion], a popular programming "problem" is to determine whether a string of parentheses is "balanced:"

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

1. We have a language, by which we mean, we have a set of strings. Each string must be finite in length, although the set itself may have infnitely many members.
2. We wish to construct a program that can "recognize" (sometimes called "accept") strings that are members of the language, while rejecting strings that are not.
3. The "recognizer" is constrained to consume the symbols of each string one at a time.

Computer scientists study this problem by asking themselves, "Given a particular language, what is the simplest possible machine that can recognize that language?" We'll do the same thing.

Instead of asking ourselves, "What's the wildest, weirdest program for recognizing balanced parentheses," we'll ask, "What's the simplest possible computing machine that can recognize balanced parentheses?"

That will lead us on an exploration of fundamental computing machines from deterministic finite automata to pushdown automata. We'll then wrap it up with a critique of using this problem as an interview question.[^critique]

[^critique]: Because clickbait.

---

[![Berkeley Art Museum](/assets/images/pushdown/art.jpg)](https://www.flickr.com/photos/threepwolfe/43985968644)

---

### formal languages and recognizers

We'll start by defining a few terms.

A "formal language" is a defined set of strings (or tokens in a really formal argument). For something to be a formal language, there must be an unambiguous way of determining whether a string is or is not a member of the language.

"Balanced parentheses" is a formal language, there is an unambiguous specification for determining whether a string is or is not a member of the language. In computer science, strings containing balanced parentheses are called "Dyck Words," because they were first studied by [Walther von Dyck].

[Walther von Dyck]: https://en.wikipedia.org/wiki/Walther_von_Dyck

We mentioned "unambiguously specifying whether a string belongs to a language." A computer scientist's favourite tool for unambiguously specifying anything is a computing device or machine. And indeed, for something to be a formal language, there must be a machine that acts as its specification.

As alluded to above, we call these machines _recognizers_. A recognizer takes as its input a seriesd of tokens making up a string, and returns as its output whether it recognizes the string or not. If it does, that string is a member of the language. Computer scientists studying formal languages also study the recognizers for those languages.

There are infinitely many formal languages, but there is an important family of formal languages called [regular languages][regular language].[^kleene]

[^kleene]: Formal regular expressions were invented by [Stephen Kleene].

[regular language]: https://en.wikipedia.org/wiki/Regular_language
[Stephen Kleene]: https://en.wikipedia.org/wiki/Stephen_Cole_Kleene

There are a couple of ways to define regular languages, but the one most pertinent to pattern matching is this: A regular language can be recognized by a Deterministic Finite Automaton, or "[DFA]." Meaning, we can construct a simple state machine to recognize whether a string is valid in the language, and that state machine will have a finite number of states.

[DFA]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton

Consider the very simple language consisting of the strings `Reg` and `Reggie`. This language can be implemented with this finite state machine:

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

### implementing a dfa in javascript

There are many ways to write DFAs in JavaScript. In [How I Learned to Stop Worrying and ❤️ the State Machine], we built JavaScript programs using the [state pattern], but they were far more complex than a deterministic finite automaton. For example, those state machines could store information in properties, and those state machines had methods that could be called.

[How I Learned to Stop Worrying and ❤️ the State Machine]: http://raganwald.com/2018/02/23/forde.html
[state pattern]: https://en.wikipedia.org/wiki/State_pattern

Such "state machines" are not "finite" state machines, because in principle they can have an infinite number of states. They have a finite number of defined states in the pattern, but their properties allow them to encode state in other ways, and thus they are not _finite_ state machines.

A Deterministic Finite Automaton is the simplest of all possible state machines: It can only store information in its explicit state, there are no other variables such as counters or stacks.

Since a DFA con only encode state by being in one of a finite number of states, and since a DFA has a finite number of possible states, we know that a DFA can only encode a finite amount of state.

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

[^exercise]: To demonstrate that "If there are a finite number of strings in a language, there must be a finite state machine that recognizes that language," take any syntax for defining a finite state machine, such as a table. With a little thought, one can imagine an algorithm that takes as its input a finite list of acceptable strings, and generates the appropriate table.

For some languages that have an infinite number of strings, we can still construct a finite state machine to recognize them. For example, here is a finite state machine that recognizes binary numbers:

<div class="mermaid">
  graph TD
    start(start)-->|0|zero
    zero-.->|end|recognized(recognized)
    start-->|1|one(one or more)
    one-->|0 or 1|one
    one-.->|end|recognized;
</div>

And we can also write this state machine it in JavaScript:

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

Now that we have some examples of regular languages. We see that they can be recognized with finite state automata, and we also see that it is possible for regular languages to have an infinite number of strings, some of which are arbitrarily long (but still finite). This does not, in principle, bar us from creating finite state machines to recognize them.

We can now think a little harder about the balanced parentheses problem. If "balanced parentheses" is a regular language, it must be possible to write a finite state machine to recognize a string with balanced parentheses. But if it is not possible to write a finite state machine to recognize balanced parentheses, then balanced parentheses must be a kind of language that is more complex than a regular language, and must require a more powerful machine for recognizing its strings.

---

### nested parentheses

Of all the strings that contain zero or more parentheses, there is a set that contains zero or more opening parentheses followed by zero or more closed parentheses, _and where the number of opening parentheses exactly equals the number of closed parentheses_.

The strings that happen to contain exactly the same number of opening parentheses as closed parentheses can just as easily be described as follows: _A string belongs to the language if the string is `()`, or if the string is `(` and `)` wrapped around a string that belongs to the language._

We call these strings "nested parentheses," and it is related to balanced parentheses: _All nested parentheses strings are also balanced parentheses strings._ Our approach to determining whether balanced parentheses is a regular language will use nested parentheses.

First, we will assume that there exists a finite state machine that can recognized balanced parentheses. Since nested parentheses are balanced parentheses, our machine must recognize nested parentheses. Next, we will use nested parentheses strings to show that by presuming that such a machine has a finite number of states leads to a logical contradiction.

This will establish that our assumption that there is a finite state machine that recognizes balanced parentheses is faulty, which in turn establishes that balanced parentheses is not a regular language.[^reductio]

[^reductio]: This type of proof is known as "Reductio Ad Absurdum," and it is a favourite of logicians, because _quidquid Latine dictum sit altum videtur_.

Okay, we are ready to prove that a finite state machine cannot recognize nested parentheses, which in turn establishes that a finite state machine cannot recognize balanced parentheses.

---

### balanced parentheses is not a regular language

Let's start with the assumption that there is a finite state machine that can recognize balanced parentheses, we'll call this machine **B**. We don't know how many states B has, it might be a very large number, but we know that there are a finite number of these states.

Now let's consider the set of all strings that begin with one or more open parentheses: `(`, `((`, `(((`, and so forth. Our state machine will always begin in the *start* state, and for each one of these strings, when B scans them, it will always end in some state.

There are an infinite number of such strings of open parentheses, but there are only a finite number of states in B, so it follows that there are at least two different strings that when scanned, end up in the same state. Let's call those strings **p** and **q**..

We can make a pretend function called **state**. `state` takes a state machine, a start state, and a string, and returns the state the machine is in after reading a string, or it returns `halt` if the machine halted at some point while reading the string.

We are saying that there is at least one pair of strings of open parentheses, `p` and `q`, such that `p ≠ q`, and `state(B, start, p) = state(B, start, q)`. (Actually, there are an infinite number of such pairs, but we don't need them all to prove a contradiction, a single pair will do.)

Now let us consider the string **p'**. `p'` consists of exactly as many closed parentheses as there are open parentheses in `p`. It follows that string `pp'` consists of `p`, followed by `p'`. `pp'` is a string in the balanced parentheses language, by definition.

String `qp'` consists of `q`, followed by `p'`. Since `p` has a different number of open parentheses than `q`, string `qp'` consists of a different number of open parentheses than closed parentheses, and thus `qp'` is not a string in the balanced parentheses language.

Now we run `B` on string `pp'`, pausing after it has read the characters in `p`. At that point, it will be in `state(B, start, p)`. It then reads the string `p'`, placing it in `state(B, state(B, start, p), p')`.

Since `B` recognizes strings in the balanced parentheses language, and `pp'` is a string in the balanced parentheses language, we know that `state(B, start, pp')` is _recognized_. And since `state(B, start, pp')` equals `state(B, state(B, start, p), p')`, we are also saying that `state(B, state(B, start, p), p')` is *recognized*.

What about running `B` on string `qp'`? Let's pause after it reads the characters in `q`. At that point, it will be in `state(B, start, q)`. It then reads the string `p'`, placing it in `state(B, state(B, start, q), p')`. Since B recognizes strings in the balanced parentheses language, and `qp'` is not a string in the balanced parentheses language, we know that `state(B, start, pq')` must **not** equal _recognized_, and that state `state(B, state(B, start, q), p')` must not equal recognized.

But `state(B, start, p)` is the same state as `state(B, start, q)`! And by the rules of determinism, then `state(B, state(B, start, p), p')` must be the same as `state(B, state(B, start, q), p')`. But we have established that `state(B, state(B, start, p), p')` must be _recognized_ and that `state(B, state(B, start, p), p')` must **not** be recognized.

Contradiction! Therefore, our original assumption—that `B` exists—is false. There is no deterministic finite automaton that recognizes balanced parentheses. And therefore, balanced parentheses is not a regular language.

---

### deterministic pushdown automata

We can, of course, write a recognizer for balanced parentheses in JavaScript, or a Turing Machine (don't worry, we won't write a Turing Machine today). But javaScript can do almost anything, write pattern matching engines, perform search-and-replace on strings...

It is interesting to stay small, and ask ourselves, "What is the simplest form of machine that can recognize balanced parentheses?"

Luckily, we don't have to work this out from first principles. Computer scientists have studied this and related problems, and there are a few ideal machines that are more powerful than a DFA, but less powerful than a Turing Machine.

All of them have some mechanism for encoding an infinite number of states by adding some form of "external state" to the machine's existing "internal state."[^inf] This is very much like a program in a von Neumann machine. Leaving out self-modifying code, the position of the program counter is a program's internal state, while memory that it reads and writes is its external state.

[^inf]: No matter how a machine is organized, if it has a finite number of states, it cannot recognized balanced parenthese by our proof above. Fr example, if we modify our DFA to allow an on/off flag for each state, and we have a finite number of states, our machine is not more powerful than a standard DFA, it is just more compact: Its definition is `log2` the size of a standard DFA, but it still has a finite number of possible different states.

The simplest machine that adds external state, which we might think of as being one step more powerful than a DFA, is a [Deterministic Pushdown Automaton][pa], or "DPA." A DPA is very much like our Deterministic Finite Automa, but it adds a potentially infinite stack as its external state.

[pa]: https://en.wikipedia.org/wiki/Pushdown_automaton

There are several classes of Pushdown Automata, depending upon what they are allowed to do with the stack. A Deterministic Pushdown Automaton has the simplest and least powerful capability:

1. When deciding what to do, while a DFA matches only the current token, a DPA matches the current token, the value of the top of the stack, or both.
2. The only thing a DFA can do as a result of examining the current token is halt or select the next state. A DPA can halt or choose the next state, and it can also push a symbol onto the top of the stack, pop the current symbol off the top of the stack, or replace the top symbol on the stack.

If a deterministic pushdown automata can recognize a language, the language is known as a [deterministic context-free language]. Is "balanced parentheses" a deterministic context-free language?

[deterministic context-free language]: https://en.wikipedia.org/wiki/Deterministic_context-free_language

Can we write a DPA to recognize balanced parentheses? DPAs have a finite number of internal states. Our proof that balanced parentheses was not a regular language rested on the fact that any DFA could not recognize balanced parentheses with a finite number of internal states.

Does that apply to DPAs too? No.

A DPA still has a finite number of internal states, but because of its external stack, it can encode an infinite number of possible states. With a DFA, we asserted that if it is in a particular internal state, and it reads a string of tokens, it will end up halting or reaching a state, and given that internal state and that series of tokens, the DFA will always end up halting or always end up reaching the same end state.

This is not true of a DPA. A DPA can push tokens onto the stack, pop tokens off the stack, and make decisions based on the top token on the stack. As a result, we cannot determine the destiny of a DPA based on its internal state and sequence of tokens alone, we have to include the state of the stack.

Therefore, our proof that a DFA with finite number of internal states cannot recognize balanced parentheses does not apply to DPAs. If we can write a DPA to recognize balanced parentheses, then "balanced parentheses" is a deterministic context-free language.

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

**Balanced parentheses is a deterministic context-free language**.

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

### non-deterministic context-free languages

Instead of matching open and closed parentheses, we'll match quotes. Now just like open and closing parentheses, quotes have open and closing forms: 'single quotes' and "double quotes."

But for this pattern, we are not interested in properly typeset quotation marks, we mean the single and double quotes that don't have a special form for opening and closing, the kind you find in programming languages that were designed to by reproducible by telegraph equipment: `'` and `"`.

Our first crack is to just replace opening and closing parentheses with quotes. We'll only need two cases, not three:

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

This particular language--single and double nested symmetrical quotes--is a very simple example of the "palindrome" problem. We cannot use a deterministic pushdown automaton to write a recognizer for palindromes that have at least two different kinds of tokens.

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

Since `P` is deterministic, meaning it always does exactly one thing in response to any token given a particular state, `P` cannot both discard and not discaard information, therefore `P` cannot recognize languages composed of palindromes. And therefore no DPA can recognize languages composed of palindromes.

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

### an object-oriented deterministic pushdown automaton

Let's begin by writing a recognizer for the "even-length binary palindrome" problem. We'll use the same general idea as our `NestedParentheses` language, but we'll make four changes:

- We only need one state;
- Our state method will be a generator;
- We evaluate all the possible actions and `yield` each one's result;
- We have added a call to `.fork()` for each result, which as we'll see below, means that we are cloning our state and making changes to the clone.

```javascript
class BinaryPalindrome extends PushdownAutomaton {
  * start(token) {
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
  ``, `0`, `00`, `11`, `0110`,
  `1001`, `0101`, `100111`,
  `0100000000
]);
  //=>
    '' => true
    '0' => false
    '00' => true
    '11' => true
    '0110' => true
    '1001' => true
    '0101' => false
    '100111' => true
    '01000000000000000010' => true
```

Indeed it does. And here's a version that a version that does single and double symmetrical quotes:

```javascript
class NestedQuotes extends PushdownAutomaton {
  * start(token) {
    if (token === "'") {
      yield this
      	.fork()
        .push(token);
    }
    if (token === '"') {
      yield this
      	.fork()
        .push(token);
    }
    if (token === "'" && this.top() === "'") {
      yield this
      	.fork()
        .pop();
    }
    if (token === '"' && this.top() === '"') {
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

test(NestedQuotes, [
  ``, `'`, `''`, `""`, `'""'`,
  `"''"`, `'"'"`, `"''"""`,
  `'"''''''''''''''''"'`
]);
  //=>
    `` => true
    `'` => false
    `''` => true
    `""` => true
    `'""'` => true
    `"''"` => true
    `'"'"` => false
    `"''"""` => true
    `'"''''''''''''''''"'` => true
```

---

### why our pushdown automaton works

Our pushdown automaton works because when it encounters a quote, it both pushes the quote on the stack _and_ compares it to the top of the stack and pops it off. It forks itself each time, so it consumes exponential space and time. But it *does* work.

And that shows us that pushdown automata are more powerful than deterministic pushdown automata, because they can recognize languages that deterministic pushdown automata cannot.

---

### what can we learn from the theory behind recognizing balanced parentheses?

Let's review what we've just done:

1. We worked our way up from the theory behind regular languages to proving that balanced parentheses could not be a regular language.
2. Given that balanced parentheses is not a regular language, we knew that we would have to represent a state for each unclosed parenthesis. This provided a hint that we would need some kind of linear state, such as a counter, stack, or list.
3. We implemented a couple of recognizers that had explicit state.
4. We also implemented a recognizer that used the call stack to use implicit state.
5. Finally, we returned to our recursive pattern from [Pattern Matching and Recursion], and also looked at a "recursive regular expression" implemented in Ruby. Both of these had implicit state as well.

The small takeaway is that one of the uses for recursion is to make state implicit, rather than explicit. That can aid clarity in some cases, but hide it in others. The implementations using patterns and regular expressions aid clarity, because the shape of the pattern is isomorphic to the shape of the strings being matched.

The implicit state solution using iterators is compact and does not rely on external libraries or engines. On the other hand, it is not nearly as elegant.

> "Starting from the most abstract principles is a good way to relearn something, but a bad way to learn something."
>
> --Paul Graham

But these are small learnings. There's a bigger one here that is tangental to the actual computer science. This problem is often given as a test during job interviews. Is it a good test?

---

### is balanced parentheses a good interview question?

We went from first principles to code in this essay. That is unrealistic for any normal human under the time pressure of an interview. Universities don't even ask you to do this in exams. Instead, they give problems like this as homework exercises, and then after you have worked them out for yourself, a test is given to see if you figured out the answers.

If you haven't been exposed to the underlying math recently, coming up with a solution to balanced parentheses is going to be extremely difficult. It reminds one of Nabakov's line, "Genius is an African who dreams up snow."

In most actual cases, what happens is that either a programmer is already familiar with  the general principles and shape of the problem and its solution, or they are going to have a hard time with the problem.

Some programmers are very familiar with the problem. For example, if this problem is posed to computer science students who are seeking employment on work-terms, if the material is covered in their curriculum, they will know the basic idea, and they will spend most of their time writing the code to implement an idea they already understand.

For certain schools, this is fine, and the problem could be useful for such students.

> "Genius is an African who dreams up snow."
>
> --Nabakov

But for other schools that have a different emphasis, or for working programmers who may have done a lot of good work but haven't had need to review the specifics of DFAs, context-free languages, and so forth recently...

This problem is asking them to reinvent the basic research of people like Kleene and von Dyck, extemporaneously. And then write code under the interviewer's watching eye. That is unlikely to show these candidates in their best light, and the results become very uneven.

Outside of a special-case like certain CS students, this question is likely to give very inconsistent results, and those results are going to be dominated by a candidate's recent familiarity with the underlying problem, rather than their coding skills.

In most cases, that makes for a bad interview question.

---

# Notes