---
title: "Going Under the Hood with Balanced Parentheses"
tags: [recursion,allonge,mermaid]
---

As we discussed in both [Pattern Matching and Recursion], a popular programming "problem" is to determine whether a string of parentheses is "balanced:"

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html "Pattern Matching and Recursion"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

For example:

|Input|Output|Comment|
|:----|:-----|:------|
|`'()'`|`true`||
|`''`|`true`|the empty string is balanced|
|`'(())'`|`true`|parentheses can nest|
|`'()()'`|`true`|multiple pairs are acceptable|
|`'(()()())()'`|`true`|multiple pairs can nest|
|`'((()'`|`false`|missing closing parentheses|
|`'()))'`|`false`|missing opening parentheses|
|`')('`|`false`|close before open|

<br/>

Before we reach for JavaScript or any other general-purpose tool, there is already a specific text pattern-matching tool available, and it's built right into most popular languages.

The tool is a regular expression (or "regex," plural "regexen" for historical reasons), which *informally* refers to both a syntax for expressing a pattern, and an engine for applying regular expressions to a string. For example, `/Reg(?:gie)?/` is a regex that matches two versions of a nickname.

In formal computer science, a regular expression is a formal way to specific a pattern that matches valid strings in a formal [regular language]. In computer science, a "language" is some set of strings or sequences of tokens. Those strings that are in the set are considered members of the language.[^kleene]

[^kleene]: Formal regular expressions were invented by [Stephen Kleene].

[regular language]: https://en.wikipedia.org/wiki/Regular_language
[Stephen Kleene]: https://en.wikipedia.org/wiki/Stephen_Cole_Kleene

In this essay we're going to look at some solutions to the "balanced parentheses problem," but instead of thinking about which solution is the most elegant, or uses the least memory from the perspective of a high-level programming language, we're going to explore some of the theory behind formal languages, and see what it tells us about writing a recognizer for balanced parentheses.

We'll wrap it up with a critique of using this problem as an interview question.[^critique]

[^critique]: Because clickbait.

---

### formal languages and recognizers

A "formal language" is a defined set of strings (or tokens in a really formal argument). For something to be a formal language, there must be an unambiguous way of determining whether a string is or is not a member of the language.

"Balanced parentheses" is a formal language, there is an unambiguous specification for determining whether a string is or is not a member of the language. In computer science, strings containing balanced parentheses are called "Dyck Words," because they were first studied by [Walther von Dyck].

[Walther von Dyck](https://en.wikipedia.org/wiki/Walther_von_Dyck)

We mentioned "unambiguously specifying whether a string belongs to a language." A computer scientist's favourite tool for unambiguously specifying anything is a computing device or machine. And indeed, for something to be a formal language, there must be a machine that acts as its specification.

We call these machines _recognizers_. A recognizer takes as its input a string, and returns as its output whether it recognizes the string or not. If it does, that string is a member of the language. Computer scientists studying formal languages also study the recognizers for those languages.

There are infinitely many formal languages, but there is an important family of formal languages called **regular languages**.

There are a couple of ways to define regular languages, but the one most pertinent to pattern matching is this: A regular language can be recognized by a Deterministic Finite Automaton, or "[DFA]." Meaning, we can construct a simple state machine to recognize whether a string is valid in the language, and that state machine will have a finite number of states.

[DFA]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton

Our name-matching expression above can be implemented with this finite state machine:

<div class="mermaid">
  graph TD
    start(start)-->|R|R
    R-->|e|Re
    Re-->|g|Reg

    Reg-->|end|recognized(recognized)

    Reg-->|g|Regg
    Regg-->|i|Reggi
    Reggi-->|e|Reggie

    Reggie-->|end|recognized;
</div>

---

### implementing a dfa in javascript

There are many ways to write DFAs in JavaScript. in [How I Learned to Stop Worrying and ❤️ the State Machine], we built JavaScript programs using the [state pattern], but they were far more complex than a deterministic finite automaton. For example, those state machines could store information in properties, and those state machines had methods that could be called.

[How I Learned to Stop Worrying and ❤️ the State Machine]: http://raganwald.com/2018/02/23/forde.html
[state pattern]: https://en.wikipedia.org/wiki/State_pattern

Those "state machines" are not "finite" state machines, because in principle they can have an infinite number of states. They have a finite number of defined states in the pattern, but their properties allow them to encode state in other ways, and thus they are not _finite_ state machines.

A Deterministic Finite Automaton is the simplest of all possible state machines: It can only store information in its explicit state, there are no other variables such as counters or stacks, and there aer no methods that can be called.

Since a DFA con only encode state by being in one of a finite number of states, and since a DFA has a finite number of possible states, we know that a DFA can only encode a finite amount of state.

The only thing a DFA recognizer does is respond to tokens as it scans a string, and the only way to query it is to look at what state it is in, or detect whether it halted (which is computationally equivalent to being in a halted state).

Here's a pattern for implementing the "name" recognizer DFA in JavaScript:

```javascript
function reginald (string) {
  const END = Symbol('end');
  const RECOGNIZED = Symbol('recognized');
  const UNRECOGNIZED = Symbol('unrecognized');

  // state definition
  const start = token => token === 'R' ? R : false;
  const R = token => token === 'e' ? Re : false;
  const Re = token => token === 'g' ? Reg : false;
  const Reg = token => {
    switch (token) {
      case END:
        return RECOGNIZED;
      case 'g':
        return Regg;
  	}
  }
  const Regg = token => token === 'i' ? Reggi : false;
  const Reggi = token => token === 'e' ? Reggie : false;
  const Reggie = token => token === END ? RECOGNIZED : false;

  // token scanning engine
  let currentState = start;
  for (const token of string) {
    currentState = currentState(token) || UNRECOGNIZED;

    if (currentState === RECOGNIZED) {
      return true;
    } else if (currentState === UNRECOGNIZED) {
      return false;
    }
  }

  const finalState = currentState(END);
  return finalState === RECOGNIZED;
}

function test (recognizer, examples) {
  for (const example of examples) {
    console.log(`'${example}' => ${recognizer(example)}`);
  }
}

test(reginald, [
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

We're going to move on to talk about infinite regular languages, but before we do, let's extract the state definitions from the recognizer pattern, for clarity:

```javascript
const END = Symbol('end');
const RECOGNIZED = Symbol('recognized');
const UNRECOGNIZED = Symbol('unrecognized');

function DFA (start) {
  return string => {
    let currentState = start;
    for (const token of string) {
      const action = currentState(token);

      if (typeof action === 'function') {
        currentState = action;
      } else if (action === RECOGNIZED) {
        return true;
      } else if (action === UNRECOGNIZED || action == null) {
        return false;
      }
    }

    const finalAction = currentState(END);
    return finalAction === RECOGNIZED;
  }
}

// state definitions
const start = token => token === 'R' ? R : false;
const R = token => token === 'e' ? Re : false;
const Re = token => token === 'g' ? Reg : false;
const Reg = token => {
  switch (token) {
    case END:
      return RECOGNIZED;
    case 'g':
      return Regg;
	}
}
const Regg = token => token === 'i' ? Reggi : false;
const Reggi = token => token === 'e' ? Reggie : false;
const Reggie = token => token === END ? RECOGNIZED : false;

// define our recognizer
const reginald = DFA(start);

test(reginald, [
  '', 'Scott', 'Reg', 'Reginald', 'Reggie'
]);
  //=>
    '' => false
    'Scott' => false
    'Reg' => true
    'Reginald' => false
    'Reggie' => true
```

On to infinite regular languages!

---

### infinite regular languages

If there are a finite number of finite strings in a language, there must be a DFA that recognizes that language.

But what if there are an _infinite_ number of valid strings in the language?[^exercise]

[^exercise]: To demonstrate that "If there are a finite number of strings in a language, there must be a finite state machine that recognizes that language," take any syntax for defining a finite state machine, such as a table. With a little thought, one can imagine an algorithm that takes as its input a finite list of acceptable strings, and generates the appropriate table.

For some languages that have an infinite number of strings, we can still construct a finite state machine to recognize them. We've been talking about strings with balanced parentheses. What about a language where any number of parentheses—including zero—is acceptable?

The finite state machine for this "parentheses" language is very compact:

<div class="mermaid">
  graph TD
    start(start)-->|"'(' or ')'"|start
    start-->|"(end)"|recognized(recognized);
</div>

And we can also write this state machine it in JavaScript:

```javascript
const start = token => {
  switch(token) {
    case END:
      return RECOGNIZED;
    case '(':
      return start;
    case ')':
      return start;
  }
}

const parentheses = DFA(start);

test(parentheses, [
  '', '()', '(){}', '(',
	'([()()]())', '([()())())',
	'())()', '((())(())'
]);
  //=>
    '' => true
    '()' => true
    '(){}' => false
    '(' => true
    '([()()]())' => false
    '([()())())' => false
    '())()' => true
    '((())(())' => true
```

Our recognizer is very compact, yet it recognizes an infinite number of strings. And in theory, at least, it recognizes strings that are infinitely long. And since the recognizer has a fixed and finite size, our "parentheses" language is a regular language.

Now that we have some examples of regular languages. We see that they can be recognized with finite state automata, and we also see that it is possible for regular languages to have an infinite number of strings, some of which are infinitely long. This does not, in principle, bar us from creating finite state machines to recognize them.

We can now think a little harder about the balanced parentheses problem. If "balanced parentheses" is a regular language, we could write a state machine to recognize it, or we could also write a regular expression to recognize it.

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

### pushdown automata

We can, of course, write a recognizer for balanced parentheses in JavaScript, or a Turing Machine (don't worry, we won't write a Turing Machine today). But javaScript can do almost anything, write pattern matching engines, perform search-and-replace on strings...

It is interesting to stay small, and ask ourselves, "What is the simplest form of machine that can recognize balanced parentheses?"

Luckily, we don't have to work this out from first principles. Computer scientists have studied this and related problems, and there are a few ideal machines that are more powerful than a DFA, but less powerful than a Turing Machine.

All of them have some mechanism for encoding an infinite number of states by adding some form of "external state" to the machine's existing "internal state."[^inf] This is very much like a program in a von Neumann machine. Leaving out self-modifying code, the position of the program counter is a program's internal state, while memory that it reads and writes is its external state.

[^inf]: No matter how a machine is organized, if it has a finite number of states, it cannot recognized balanced parenthese by our proof above. Fr example, if we modify our DFA to allow an on/off flag for each state, and we have a finite number of states, our machine is not more powerful than a standard DFA, it is just more compact: Its definition is `log2` the size of a standard DFA, but it still has a finite number of possible different states.

The simplest machine that adds external state, which we might think of as being one step more powerful than a DFA, is a [Deterministic Pushdown Automaton][pa], or "DPA." A Pushdown Automaton is very much like our Deterministic Finite Automa, but it adds a potentially infinite stack as its external state.

[pa]: https://en.wikipedia.org/wiki/Pushdown_automaton

There are several classes of Pushdown Automata, depending upon what they are allowed to do with the stack. A Deterministic Pushdown Automaton has the simplest and least powerful capability:

1. When deciding what to do, while a DFA matches only the current token, a DPA matches the current token, the value of the top of the stack, or both.
2. The only thing a DFA can do as a result of examining the current token is halt or select the next state. A DPA can halt, choose the next state, push a symbol onto the top of the stack, or pop the current symbol off the top of the stack.

If a deterministic pushdown automata can recognize a language, the language is known as a [deterministic context-free language]. Is "balanced parentheses" a deterministic context-free language?

[deterministic context-free language]: https://en.wikipedia.org/wiki/Deterministic_context-free_language

Can we write a DPA to recognize balanced parentheses? DPAs have a finite number of internal states. Our proof that balanced parentheses was not a regular language rested on the fact that any DFA could not recognize balanced parentheses with a finite number of internal states.

Does that apply to DPAs too? No.

A DPA still has a finite number of internal states, but because of its external stack, it can encode an infinite number of possible states. With a DFA, we asserted that if it is in a particular internal state, and it reads a string of tokens, it will end up halting or reaching a state, and given that internal state and that series of tokens, the DFA will always end up halting or always end up reaching the same end state.

This is not true of a DPA. A DPA can push tokens onto the stack, pop tokens off the stack, and make decisions based on the top token on the stack. As a result, we cannot determine the destiny of a DPA based on its internal state and sequence of tokens alone, we have to include the state of the stack.

Therefore, our proof that a DFA with finite number of internal states cannot recognize balanced parentheses does not apply to DPAs. If we can write a DPA to recognize balanced parentheses, then "balanced parentheses" is a deterministic context-free language.

---

### balanced parentheses is a deterministic context-free language

Let's start with  a recognizer that can implement DPAs. We'll write it in such a way that it works for DFAs too (it is "downwards compatible"):

```javascript
const POP = Symbol('pop');

function DPA (start) {
  return string => {
    const stack = [];

    let currentState = start;
    for (const token of string) {
      const top = stack[stack.length - 1];

      const action = currentState(token, top);

      if (typeof action === 'function') {
        currentState = action;
      } else if (action === POP) {
        stack.pop();
      } else if (action === RECOGNIZED) {
        return true;
      } else if (action === UNRECOGNIZED || action == null) {
        return false;
      } else {
        stack.push(action);
      }
    }

    const finalTop = stack[stack.length - 1];
    const finalAction = currentState(END, finalTop);
    return finalAction === RECOGNIZED;
  }
}
```

For simplicity, it relies on JavaScript's default behaviour of returning `undefined` for the top of an empty stack.[^undef]

[^undef]: This implies that the DFAs we write cannot attempt to push `undefined` onto the stack.

Now, a stack implemented in JavaScript cannot actually encode an infinite amount of information. The depth of the stack is limited to `2^32 -1`, and there are a finite number of different values we can push onto the stack. And then there are limitations like the the memory in our machines, or the number of clock ticks our CPUs will execute before the heat-death of the universe.

But our implementation shows the basic principle, and it's good enough for any of the test strings we'll write by hand.

Now how about a recognizer for balanced parentheses? It's astonishingly simple:

```javascript
const start = (token, top) => {
  if (token === '(') {
    return token; // pushes '('
  } else if (token === ')' && top === '(') {
    return POP;
  } else if (token === END && top === undefined) {
    return RECOGNIZED;
  }
};

const balanced = DPA(start);

test(balanced, [
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
const start = (token, top) => {
  // open parentheses
  if (token === '(') {
    return token; // pushes '('
  } else if (token === '[') {
    return token; // pushes '['
  } else if (token === '{') {
    return token; // pushes '{'
  }

  // closed parentheses
  if (token === ')' && top === '(') {
    return POP;
  } else if (token === ']' && top === '[') {
    return POP;
  } else if (token === '}' && top === '{') {
    return POP;
  }

  // end
  if (token === END && top === undefined) {
    return RECOGNIZED;
  }
};

const balanced = DPA(start);

test(balanced, [
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



---

### balanced parentheses with explicit state

Well, that is probably the most formal thing ever written on this blog. But what does it tell us? What practical thing do we know about recognizing balanced parentheses, now that we've proved that it is not a regular language?

Well, we know two things:

1. It is not possible to write a standard regular expression that matches balanced parentheses. Standard regular expressions only match regular languages, and balanced parentheses are not a regular language.
2. It is not possible to write any program that recognizes balanced parentheses in a constant amount of space.

The second point is most useful for us writing, say, JavaScript or Ruby or Python or Elixir or whatever. Any function we write to recognize balanced parentheses cannot operate in a fixed amount of memory. In fact, we know a lower bound on the amount of memory that such a function requires: Any engine we build to recognize balanced parentheses will have to accomodate nested parentheses, and to do so, it must have at least as many states as there are unclosed parentheses.

If it has fewer states than there are unclosed parentheses, it will fail for the same reason that a finite state machine cannot recognize balanced parentheses. We don't know how it will represent state: It might use a list, a counter, a stack, a tree, store state implicitly on a call stack, there are many possibilities.

But we can guarantee that for recognizing nested parentheses, the machine itself must have at least as many states as unclosed parentheses, and to recognize all of the infinite number of balanced parentheses strings, it must grow to use an infinite amount of memory.

This is true even if we devise a mechanism based on a simple counter. Here's one such implementation:

```javascript
function balanced (string) {
  let unclosedParentheses = 0;

  for (const c of string) {
    if (c === '(') {
      ++unclosedParentheses;
    } else if (c === ')' && unclosedParentheses > 0) {
      --unclosedParentheses;
    } else {
      return false;
    }
  }

  return unclosedParentheses === 0;
}

function test (examples) {
  for (const example of examples) {
    console.log(`'${example}' => ${balanced(example)}`);
  }
}

test(['', '()', '()()',
  '((()())())', '())()',
  '((())(())'
]);
  //=>
    '' => true
    '()' => true
    '()()' => true
    '((()())())' => true
    '())()' => false
    '((())(())' => false
```

This does not "feel" like it uses more memory proportional to the number of unclosed parentheses, but a counter is a way of representing different states. As it happens, this particular counter works up to `Number.MAX_SAFE_INTEGER` unclosed parentheses, and then it breaks, so it is a lot like our hypothetical finite state machine `B`. It may have a `2^53 - 1` states, but it's still a finite number of states and cannot recognize *every* balanced parenthesis string without rewriting it to use big numbers.

But as we can see, the algorithm must have a way of representing the number of unclosed parentheses in some way. We could also use a stack:

```javascript
function balanced (string) {
  let parenthesisStack = [];

  for (const c of string) {
    if (c === '(') {
      parenthesisStack.push(c);
    } else if (c === ')' && parenthesisStack.length > 0) {
      parenthesisStack.pop();
    } else {
      return false;
    }
  }

  return parenthesisStack.length === 0;
}
```

This is trivially equivalent to the counter solution, although the limit of how many elements an array can hold in JavaScript is `2^32 - 1`, less than the counter. Mind you, there is no requirement that stacks be implemented as flat, linear arrays. Here's one based on linked nested arrays, which is a lightweight way to represent a kind of linked list:

```javascript
function balanced (string) {
  let parenthesisList = [];

  for (const c of string) {
    if (c === '(') {
      parenthesisList = [parenthesisList];
    } else if (c === ')' && parenthesisList[0] !== undefined) {
      parenthesisList = parenthesisList[0];
    } else {
      return false;
    }
  }

  return parenthesisList[0] === undefined;
}
```

Depending upon way a particular JavaScript engine is implemented and the way arrays are stored on its heap, this may be able to handle larger numbers of unclosed parentheses, we might even find ourselves limited only by the size of the heap on our particular implementation. That may or may not be larger than using a counter or array as a stack.

These three examples show that when we encounter a problem that we know is equivalent to recognizing a language that is not a regular language, we can anticipate that our solution will need to incorporate some form of state that grows with some aspect of the size of the input. Our language implementation or hardware may impose some limits on our implementation, but _in principle_ we are solving the problem.

In these cases, the state is explicit. But we can make the state implicit, too.

---

### balanced parentheses with implicit state

We saw that we can encode state with an explicit stack. Almost all conventional programming languages have an _implicit_ stack, the call stack.[^implicit]

[^implicit]: There may be other implicit stacks too, such as the stack that happens when a generator function uses `yield` or `yield *`.

Here's an implicit implementation of balanced parentheses:

```javascript
function balanced (string) {
  const iterator = string[Symbol.iterator]();

  return balancedMachine(iterator) === true;
}

function balancedMachine(iterator) {
  const { value: token, done } = iterator.next();

  if (done) {
    return true;
  } else if (token === '(') {
    const nextToken = balancedMachine(iterator);

    if (nextToken === ')') {
      return balancedMachine(iterator);
    } else {
      return false;
    }
  } else {
    return token;
  }
}
```

The `balanced` function extracts an iterator from the string, and then invokes `balancedMachine`, which actually scans the string. When it encounters an open parenthesis, it then calls itself recursively to consume balanced parentheses before returning.

There is no counter or stack or list, but we know that behind the scenes, JavaScript's call stack is tracking the depth of nested parentheses. The function thus only works for strings with unclosed parentheses up to the maximim allowable depth of the call stack, but again in principle the algorithm works on infinitely long strings.

---

### recursive pattern matching

But possibly the best way to use implicit state is to let something else handle all of the work. In [Pattern Matching and Recursion], we built pattern matchers out of JavaScript functions, and then combined them with combinators made out of javaScript functions.

Making pattern matchers and combinators out of functions afforded us a number of advantages. First and foremost, we had access to the power of a fully operational <strike>battle station</strike> programming language.

Not counting the definitions of `just`, `follows`, `case`, and so forth, our solution to the balanced parentheses problem showed this:

```javascript
const balanced =
  input =>
    zeroOrMore(
      cases(
        follows(just('('), balanced, just(')')),
        follows(just('['), balanced, just(']')),
        follows(just('{'), balanced, just('}'))
      )
    )(input);

const entirelyBalanced = entirely(balanced);
```

We can see one of the ways that it leverages being "native" JavaScript: It is a recursive pattern, and the recursion is implemented by referring to the name `balanced` that is bound in the current JavaScript scope.

Behind the scenes, it is using the JavaScript stack to track the state of unclosed parentheses, juts like out implicit solution above. But even though we don't explicitly have a stack anywhere, we are still using one.

---

### recursive regular expressions

We noted above that formal regular expressions cannot handle balanced parentheses, because balanced parentheses are not a regular language.

But programmers being programmers, the regular expressions we find built into various programming languages have been expanded over the years, and some of them provide a way to specify recursive regular expressions (a formal oxymoron).

JavaScript is not one of those languages, and PERL is not spoken here, but the Oniguruma regular expression engine used by Ruby (and PHP) does support recursion. Here's an implementation of simple balanced parentheses, written in Ruby:


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

Once again, something does all the work for us. In this case, it's a high-performance pattern-matching engine that is going to be faster and use less memory than our functional pattern matchers and functional combinators.

And once again, even though we have no explicit stack, we are guaranteed that _somewhere_ in Oniguruma, there is a stack tracking the recursion, and thus tracking the state of the machine as it consumes characters.

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