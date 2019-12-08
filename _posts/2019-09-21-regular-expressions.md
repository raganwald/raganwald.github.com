---
title: "Regular Expressions (And not just *those* Regular Expressions!)"
tags: [recursion,allonge,mermaid,wip]
---

# Prelude

_If you wish to skip the prelude, you can jump directly to the [Table of Contents](#table-of-contents)._

### what is a regular expression?

In programming jargon, a regular expression, or *regex* (plural "regexen"),[^regex] is a sequence of characters that define a search pattern. They can also be used to validate that a string has a particular form. For example, `/ab*c/` is a regex that matches an `a`, zero or more `b`s, and then a `c`, anywhere in a string.

[^regex]: In common programming jargon, a "regular expression" refers any of a family of pattern-matching and extraction languages, that can match a variety of languages. In computer science, a "regular expression" is a specific pattern matching language that recognizes regular languages only. To avoid confusion, in this essay we will use the word "regex" (plural "regexen") to refer to the programming construct.

Regexen are--fundamentally--descriptions of sets of strings. A simple examble is the regex `/^0|1(0|1)*$/`, which describes the set of all strings that represent whole numbers in base 2, also known as the "binary numbers."

In computer science, the strings that a regular expression matches are known as "sentences," and the set of all strings that a regular expression matches is known as the "language" that a regular expression matches.

So for the regex `/^0|1(0|1)*$/`, its language is "The set of all binary numbers," and strings like `0`, `11`, and `1010101` are sentences in its language, while strings like `01`, `two`, and `Kltpzyxm` are sentances that are not in its language.[^Kltpzyxm]

[^Kltpzyxm]: Be sure to read this paragraph our loud.

Regexen are not descriptions of machines that recognize strings. Regexen describe "what," but not "how." To actually use regexen, we need an implementation, a machine that takes a regular expression and a string to be scanned, and returns--at the very minimum--whether or not the string matches the expression.

Regexen implemplementations exist on most programming environments and most command-line environments. `grep` is a regex implementation. Languages like Ruby and JavaScript have regex libraries built in and provide syntactic support for writing regex literals directly in code.

The syntactic style of wrapping a regex in `/` characters is a syntactic convention in many languages that support regex literals, and we repeat them here to help distinguish them from formal regular expressions.

---

### formal regular expressions

Regex programming tools evolved as a practical application for [Formal Regular Expressions][regular expression], a concept discovered by [Stephen Cole Kleene], who was exploring [Regular Languages]. Regular Expressions in the computer science sense are a tool for describing Regular Languages: Any well-formed regular expression describes a regular language, and every regular language can be described by a regular expression.

[Stephen Cole Kleene]: https://en.wikipedia.org/wiki/Stephen_Cole_Kleene
[Regular Languages]: https://en.wikipedia.org/wiki/Regular_language
[regular expression]: https://en.wikipedia.org/wiki/Regular_expression#Formal_language_theory

Formal regular expressions are made with three "atomic" or indivisible expressions:

- The symbol `∅` describes the language with no sentences, also called "the empty set."
- The symbol `ε` describes the language containing only the empty string.
- Literals such as `x`, `y`, or `z` describe languages containing single sentences, containing single symbols. e.g. The literal `r` describes the language `R`, which contains just one sentence: `'r'`.

What makes formal regular expressions powerful, is that we have operators for alternating, catenating, and quantifying regular expressions. Given that _x_ is a regular expression describing some language `X`, and _y_ is a regular expression describing some language `Y`:

1. The expression _x_`|`_y_ describes to the union of the languages `X` and `Y`, meaning, the sentence `w` belongs to `x|y` if and only if `w` belongs to the language `X` or `w` belongs to the language `Y`. We can also say that _x_`|`_y_ represents the _alternation_ of _x_ and _y_.
2. The expression _xy_ describes the language `XY`, where a sentance `ab` belongs to the language `XY` if and only if `a` belohgs to the language `X` and `b` belongs to the language `Y`. We can also say that _xy_ represents the _catenation_ of the epxressions _x_ and _y_.
3. The expression _x_`*` describes the language `Z`, where the sentence `ε` (the empty string) belongs to `Z`, and, the sentence `pq` belongs to `Z` if and only if `p` is a sentence belonging to `X`, and `q` is a sentence belonging to `Z`. We can also say that _x_`*` represents a _quantification_ of _x_, as it allows a regular expression to rerpresent a language containing sentences that match some number of senetences represented by _x_ catenated together.


[Kleene Star]: https://en.wikipedia.org/wiki/Kleene_star

Before we add the last rule for regular expressions, let's clarify these three rules with some examples. Given the constants `a`, `b`, and `c`, resolving to the languages `{ 'a' }`, `{ 'b' }`, and `{ 'b' }`:

- The expression `b|c` resolves to the language `{ 'b', 'c' }`, by rule 1.
- The expression `ab` resolves to the language `{ 'ab' }` by rule 2.
- The expression `a*` resolves to the language `{ '', 'a', 'aa', 'aaa', ... }` by rule 3.

Our operations have a precedence, and it is the order of the rules as presented. So the expression `ab*` resolves to the language `{ 'a', 'ab', 'abb', 'abbb', ... }`, the expression `a|bc` resolves to the language `{ 'a', 'bc' }`, and the expression `b|c*` resolves to the language `{ '', 'b', 'c', 'cc', 'ccc', ... }`.

As with the algebraic notation we are familiar with, we can use parentheses:

- Given a regular expression _x_, the expression `(`_x_`)` resolves to the language described by _x_.

This allows us to alter the way the operators are combined. As we have seen, the expression `b|c*` resolves to the language `{ '', 'b', 'c', 'cc', 'ccc', ... }`. But the expression `(b|c)*` resolves to the language `{ '', 'b', 'c', 'bb', 'cc', 'bbb', 'ccc', ... }`.

It is quite obvious that regexen borrowed a lot of their syntax and semantics from regular expressions. Leaving aside the mechanism of capturing and extracting portions of a match, almost every regular expressions is also a regex. For example, `/reggiee*/` is a regular expression that matches words like `reggie`, `reggiee`, and `reggieee` anywhere in a string.

Regexen add a lot more affordances like character classes, the dot operator, decorators like `?` and `+`, and so forth, but at their heart, regexen are based on regular expressions.

---

### what will we explore in this essay?

In this essay we will explore a number of important results concerning regular expressions, regular languages, and finite-state automata:

  - For every finite-state recognizer with epsilon-transitions, there exists a finite-state recognizer without epsilon-transitions.
  - For every finite-state recognizer, there exists an equivalent deterministic finite-state recognizer.
  - The set of finite-state recognizers is closed under union, catenation, and kleene*.
  - For every formal regular expression, there exists an equivalent finite-state recognizer.
  - Every regular language can be recognized by a finite-state recognizer.
  - If a finite-state automaton recognizes a language, that language is regular.

All of these things have been proven, and there are numerous explanations of the proofs available in literature and online. What makes this essay slightly novel is that instead of focusing on formal proofs, we will focus on informal _demonstrations_.

A demonstration aims to appeal to intuition, rather than formal reasoning. For example, the canonical proof that "If a finite-state automaton recognizes a language, that language is regular" runs along the following lines:[^cs390]

[cs390]: This explanation of the proof is taken from Shunichi Toida's notes for [CS390 Introduction to Theoretical Computer Science Structures ](https://www.cs.odu.edu/~toida/courses/TE.CS390.13sp/index.html). The proof of this aspect of Kleene's Theorem can be found [here](https://www.cs.odu.edu/~toida/nerzic/390teched/regular/fa/kleene-2.html).

> Given a finite automaton, first relabel its states with the integers 1 through n, where n is the number of states of the finite automaton. Next denote by L(p, q, k) the set of strings representing paths from state p to state q that go through only states numbered no higher than k. Note that paths may go through arcs and vertices any number of times.
Then the following lemmas hold.

> **Lemma 1**: L(p, q, k+1) = L(p, q, k)  L(p, k+1, k)L(k+1, k+1, k)*L(k+1, q, k) .

> What this lemma says is that the set of strings representing paths from p to q passing through states labeled with k+1 or lower numbers consists of the following two sets:
> 1. L(p, q, k) : The set of strings representing paths from p to q passing through states labeled with k or lower numbers.
> 2. L(p, k+1, k)L(k+1, k+1, k)*L(k+1, q, k) : The set of strings going first from p to k+1, then from k+1 to k+1 any number of times, then from k+1 to q, all without passing through states labeled higher than k.

> ![Illustrating Kleene's Theorem © Shunichi Toida](/assets/images/fsa/kleene2.jpg)

> **Lemma 2**: L(p, q, 0) is regular.

> **Proof**: L(p, q, 0) is the set of strings representing paths from p to q without passing any states in between. Hence if p and q are different, then it consists of single symbols representing arcs from p to q. If p = q, then  is in it as well as the strings representing any loops at p (they are all single symbols). Since the number of symbols is finite and since any finite language is regular, L(p, q, 0) is regular.

> From Lemmas 1 and 2 by induction the following lemma holds.

> **Lemma 3**: L(p, q, k) is regular for any states p and q and any natural number k.

> Since the language accepted by a finite automaton is the union of L(q0, q, n) over all accepting states q, where n is the number of states of the finite automaton, we have the following converse of the part 1 of Kleene Theorem.

> **Theorem 2** (Part 2 of Kleene's Theorem): **Any language accepted by a finite automaton is regular**.

The above proof takes the approach of describing--in words and diagrams--an algorithm.[^algo] Given any finite-state automaton that recognizes a language, this algorithm produces an equivalent regular expression. Froma  programmer's perspective, if you want to prove taht for any `A`, there is an equivalent `B`, writing a working `A --> B` compiler is a very powerful demonstration..

[^algo]: Lots of proofs attest to the existence of some thing, but not all are algorithms for actually finding/making the thing they attest exists. For example, there is a proof that a standard Rubik's Cube can be solved with at most 20 moves, although nobody has yet developed an algorithm to find the 20 (or fewer) move solution for any cube.

Of course, algorithms described in words and diagrams have the advantage of being universal, like pseudo-code. But the disadvantage of algorithms described in words and diagrams is that we can't play with them, optimize them, and learn by doing. For example, here is the core of the above proof, expressed as an algorithm (the complete code is [here](/assetssupplemental/fsa/13-regular-expression.js))

```javascript
function L (p, q, k) {
  if (k === 0) {
    // degenerate case, doesn't go through any other states
    // just look for direct transitions
    const pqTransitions = transitions.filter(
      ({ from, to }) => from === stateList[p] && to === stateList[q]
    );

    const pqDirectExpressions =
      pqTransitions.map(
        ({ consume }) => quote(consume)
      );

    if (p === q) {
      return unionOf('ε',  ...pqDirectExpressions);
    } else {
      return unionOf(...pqDirectExpressions);
    }
  } else {
    const pq = L(p, q, k-1);

    const pk = L(p, k, k-1);
    const kk = kleeneStarOf(L(k, k, k-1));
    const kq = L(k, q, k-1);
    const pkkq = catenationOf(pk, kk, kq);

    const pqMaybeThroughK = unionOf(pq, pkkq);

    return pqMaybeThroughK;
  }
}
```

Writing the algorithm in JavaScript helps our brains engage with the algorithm more deeply, and we can move on to expand on it as we see fit.

In this essay, we won't just discuss why certain things are known to be true, we will emphasize writing algorithms in JavaScript that demonstrate that these things are true. Most specifically...

1. We will write algorithms to compute the `union`, `intersection`, `catenation`, and `kleene*` of finite-state automata, demonstrating that the set of finite-state automata is closed under these operations.
2. We will write algorithms for translating a regular expression into an equivalent finite-state automaton, demonstrating that for every regular expression there is an equivalent finite-state automation.
3. As noted above, we will also write an algorithm for translating a finite-state automaton into an equivalent regular expression, demonstrating that for every finite-state automaton there is an equivalent regular expression.

Along the way, we'll look at other tools that make regular expressions more convenient to work with.

---

# [Table of Contents](#table-of-contents)

### [Prelude](#prelude)

  - [what is a regular expression?](#what-is-a-regular-expression)
  - [formal regular expressions](#formal-regular-expressions)
  - [what will we explore in this essay?](#what-will-we-explore-in-this-essay)

### [Our First Goal: "For every regular expression, there exists an equivalent finite-state recognizer"](#our-first-goal-for-every-regular-expression-there-exists-an-equivalent-finite-state-recognizer)

  - [our approach](#our-approach)

[Evaluating Arithmetic Expressions](#evaluating-arithmetic-expressions)

  - [converting infix to postfix](#converting-infix-to-postfix)
  - [handling a default operator](#handling-a-default-operator)
  - [evaluating postfix](#evaluating-postfix)

### [Finite-State Recognizers](#finite-state-recognizers-1)

  - [describing finite-state recognizers in JSON](#describing-finite-state-recognizers-in-json)
  - [verifying finite-state recognizers](#verifying-finite-state-recognizers)

### [Building Blocks](#building-blocks-1)

  - [∅ and ε](#∅-and-ε)
  - [literal](#literal)
  - [using ∅, ε, and literal](#using-∅-ε-and-literal)
  - [recognizing special characters](#recognizing-special-characters)

### [Alternating Regular Expressions](#alternating-regular-expressions-1)

[Taking the Product of Two Finite-State Automata](#taking-the-product-of-two-finite-state-automata)

  - [starting the product](#starting-the-product)
  - [transitions](#transitions)
  - [a function to compute the product of two recognizers](#a-function-to-compute-the-product-of-two-recognizers)

[From Product to Union](#from-product-to-union)

  - [the marvellous product](#the-marvellous-product)

### [Catenating Regular Expressions](#catenating-regular-expressions-1)

  - [catenating descriptions with epsilon-transitions](#catenating-descriptions-with-epsilon-transitions)
  - [removing epsilon-transitions](#removing-epsilon-transitions)
  - [implementing catenation](#implementing-catenation)
  - [unreachable states](#unreachable-states)
  - [the catch with catenation](#the-catch-with-catenation)

[Converting Nondeterministic to Deterministic Finite-State Recognizers](#converting-nondeterministic-to-deterministic-finite-state-recognizers)

  - [taking the product of a recognizer... with itself](#taking-the-product-of-a-recognizer-with-itself)
  - [computing the powerset of a nondeterministic finite-state recognizer](#computing-the-powerset-of-a-nondeterministic-finite-state-recognizer)
  - [catenation without the catch](#catenation-without-the-catch)
  - [the fan-out problem](#the-fan-out-problem)
  - [summarizing catenation (and an improved union)](#summarizing-catenation-and-an-improved-union)

### [Quantifying Regular Expressions](#quantifying-regular-expressions-1)

  - [implementing the kleene star](#implementing-the-kleene-star)
  - [all together now](#all-together-now)

---

# Our First Goal: "For every regular expression, there exists an equivalent finite-state recognizer"

As mentioned in the Prelude, [Stephen Cole Kleene] developed the concept of [formal regular expressions][regular expression] and [regular languages], and published a seminal theorem about their behaviour in 1951.

Regular expressions are not machines. In and of themselves, they don't generate sentences in a language, nor do they recognize whether sentences belong to a langauge. They define the language, and it's up to us to build machines that do things like generate or recognize sentences.

Kleene studied machines that can recognize sentences in languages. Studying such machines informs us about the fundamental nature of the computation involed. In the case of formal regular expressions and regular languages, Kleene established that for every regular language, there is a finite-state automaton that recognizes sentences in that language.

(Finite-state automatons that are arranged to recognize sentences in languages are also called "finite-state recognizers," and that is the term we will use from here on.)

Kleene also established that for every finite-state recognizer, there is a formal regular expression that describes the language that the finite-state recognizer accepts. In provingh these two things, he proved that the set of all regular expressions and the set of all finite-state recognizers is equivalent.

We are going to demonstrate these two important components of Kleene's theorem by writing JavaScript code, starting with a demonstration that "For every regular expression, there exists an equivalent finite-state recognizer."

---

### our approach

Our approach to demonstrating that for every regular expression, there exists an equivalent finite-state recognizer will be to write a program that takes as its input a regular expression, and produces as its output a description of a finute-state recognizer that accepts sentences in the language described by the regular expression.

Our in computer jargon, we're going to write a regular expression to finite-state recognizer _compiler_. Compilers and interpreters are obviously an extremely interesting tool for practical programming: They establish an equivalency between expressing an algorithm in a language that humans understand, and expressing an equivalent algorithm in a language a machine understands.

Our compiler will work like this: Instead of thinking of a formal regular expression as a description of a language, we will think of it as an expression, that when evaluated, returns a finite-state recognizer.

Our "compiler" will thus be an algorithm that evaluates regular expressions.

---

## Evaluating Arithmetic Expressions

We needn't invent our evaluation algorithm from first principles. There is a great deal of literature about evaluating expressions, especially expressions that consist of values, operators, and parentheses.

One simple and easy-to work-with approach works like this:

1. Take an expression in infix notation (when we say "infix notation," we include expressions that contain prefix operators, postfix operators, and parentheses).
2. Convert the expression to reverse-polish notation, also called [postfix notation], or "RPN."
3. Push the RPN onto a stack.
4. Evaluate the RPM using a [stack machine].

[postfix notation]: https://en.wikipedia.org/wiki/Reverse_Polish_notation
[stack machine]: https://en.wikipedia.org/wiki/Stack_machine

Before we write code to do this, we'll do it by hand for a small expression, `3*2+4!`:

Presuming that the postfix `!` operator has the highest precedence, followed by the infix `*` and then the infix `+` has the lowest precedence, `3*2+4!` in infix notation becomes `[3, 2, *, 4, !, +]` in RPN.

nEvaluating `[3, 2, *, 4, !, +]` with a stack machine works by taking each of the values and operators in order. If a value is next, push it onto the stack. If an operator is next, pop the necessary number of arguments off apply the operator to the arguments, and push the result back onto the stack. If the RPN is well-formed, after processing the last item from the input, there will be exactly one value on the stack, and that is the result of evaluating the RPN.

Let's try it:

1. The first item is a `3`. We push it onto the stack, which becomes `[3]`.
2. The next item is a `2`. We push it onto the stack, which becomes `[3, 2]`.
3. The next item is a `*`, which is an operator with an arity of two.
  1. We pop `2` and `3` off the stack, which becomes `[]`.
  2. We evaluate `*(3, 2)` (in a pseudo-functional form). The result is `6`.
  3. We push `6` onto the stack, which becomes `[6]`.
4. The next item is `4`. We push it onto the stack, which becomes `[6, 4]`.
5. The next item is a `!`, which is an operator with an arity of one.
  1. We pop `4` off the stack, which becomes `[6]`.
  2. We evaluate `!(4)` (in a pseudo-functional form). The result is `24`.
  3. We push `24` onto the stack, which becomes `[6, 24]`.
6. The next item is a `+`, which is an operator with an arity of two.
  1. We pop `24` and `6` off the stack, which becomes `[]`.
  2. We evaluate `+(6, 24)` (in a pseudo-functional form). The result is `30`.
  3. We push `30` onto the stack, which becomes `[30]`.
7. There are no more items to process, and the stack contains one value. We return this as the result of evaluating `[3, 2, *, 4, !, +]`.

Let's write this in code. We'll start by writing an infix-to-postfix converter. We are not writing a comprehensive arithmetic evaluator, so we will make a number of simplifying assumptions, including:

- We will only handle singe-digit values and single-character operators.
- We will not allow ambiguos operators. For example, in ordinary arithmetic, the `-` operator is both a prefix operator that negates integer values, as well as an infix operator for subtraction. In our evaluator, `-` can be one, or the other, but not both.
- We'll only process strings when converting to RPN. It'll be up to the eventual evaluator to know that the string `'3'` is actually the number 3.
- We aren't going to allow whitespace. `1 + 1` will fail, `1+1` will not.

We'll also paramaterize the definitions for operators. This will allow us to reuse our evaluator for regular expressions simply by changing the oeprator definitions.

---

### converting infix to postfix

Here's our definition for arithmetic operators:

```javascript
const arithmetic = {
  operators: {
    '+': {
      symbol: Symbol('+'),
      type: 'infix',
      precedence: 1,
      eval: (a, b) => a + b
    },
    '-': {
      symbol: Symbol('-'),
      type: 'infix',
      precedence: 1,
      eval: (a, b) => a - b
    },
    '*': {
      symbol: Symbol('*'),
      type: 'infix',
      precedence: 3,
      eval: (a, b) => a * b
    },
    '/': {
      symbol: Symbol('/'),
      type: 'infix',
      precedence: 2,
      eval: (a, b) => a / b
    },
    '!': {
      symbol: Symbol('!'),
      type: 'postfix',
      precedence: 4,
      eval: function factorial (a, memo = 1) {
        if (a < 2) {
          return a * memo;
        } else {
          return factorial(a - 1, a * memo);
        }
      }
    }
  }
};

```

Note that for each operator, we define a symbol. We'll use that when we push things into the output queue so that our evaluator can disambiguate symbols from values (Meaning, of course, that these symbols can't be values.) We also define a precedence, and an `eval` function that the evaluator will use later.

Armed with this, how do we convert infix expression to postfix? WIth a "shunting yard."

The [Shunting Yard Algorithm] is a method for parsing mathematical expressions specified in infix notation with parentheses. As we implement it here, it will produce a postfix (a/k/a "Reverse Polish) notation without parentheses. The shunting yard algorithm was invented by Edsger Dijkstra and named the "shunting yard" algorithm because its operation resembles that of a railroad shunting yard.

[Shunting Yard Algorithm]: https://en.wikipedia.org/wiki/Shunting-yard_algorithm

The shunting yard algorithm is stack-based. Infix expressions are the form of mathematical notation most people are used to, for instance `3 + 4` or `3 + 4 × (2 − 1)`. For the conversion there are two lists, the input and the output. There is also a stack that holds operators not yet added to the output queue. To convert, the program reads each symbol in order and does something based on that symbol. The result for the above examples would be (in Reverse Polish notation) `3 4 +` and `3 4 2 1 − × +`, respectively.

![The Shunting Yard Algorithm © Salix alba](/assets/images/fsa/Shunting_yard.svg.png)

Here's our shunting yard implementation. There are a few extra bits and bobs we'll fill in in a moment:

```javascript
function shuntingYardA (inputString, { operators }) {
  const operatorsMap = new Map(
    Object.entries(operators)
  );

  const representationOf =
    something => {
      if (operatorsMap.has(something)) {
        const { symbol } = operatorsMap.get(something);

        return symbol;
      } else if (typeof something === 'string') {
        return something;
      } else {
        error(`${something} is not a value`);
      }
    };
  const typeOf =
    symbol => operatorsMap.has(symbol) ? operatorsMap.get(symbol).type : 'value';
  const isInfix =
    symbol => typeOf(symbol) === 'infix';
  const isPostfix =
    symbol => typeOf(symbol) === 'postfix';
  const isCombinator =
    symbol => isInfix(symbol) || isPostfix(symbol);

  const input = inputString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // value catenation
      error(`values ${peek(outputQueue)} and ${symbol} cannot be catenated`);
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const op = operatorStack.pop();

        outputQueue.push(representationOf(op));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isCombinator(symbol)) {
      const { precedence } = operatorsMap.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (isCombinator(symbol) && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operatorsMap.get(peek(operatorStack)).precedence;

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(representationOf(op));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = isInfix(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(representationOf(symbol));
      awaitingValue = false;
    } else {
      // value catenation
      error(`values ${peek(outputQueue)} and ${symbol} cannot be catenated`);
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    if (operatorsMap.has(op)) {
      const { symbol: opSymbol } = operatorsMap.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}
```

Naturally, we need to test our work before moving on:

```javascript
function deepEqual(obj1, obj2) {
  function isPrimitive(obj) {
      return (obj !== Object(obj));
  }

  if(obj1 === obj2) // it's just the same object. No need to compare.
      return true;

  if(isPrimitive(obj1) && isPrimitive(obj2)) // compare primitives
      return obj1 === obj2;

  if(Object.keys(obj1).length !== Object.keys(obj2).length)
      return false;

  // compare objects with same number of keys
  for(let key in obj1) {
      if(!(key in obj2)) return false; //other object doesn't have this prop
      if(!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

const pp = list => list.map(x=>x.toString());

function verifyShunter (shunter, tests, ...additionalArgs) {
  try {
    const testList = Object.entries(tests);
    const numberOfTests = testList.length;

    const outcomes = testList.map(
      ([example, expected]) => {
        const actual = shunter(example, ...additionalArgs);

        if (deepEqual(actual, expected)) {
          return 'pass';
        } else {
          return `fail: ${JSON.stringify({ example, expected: pp(expected), actual: pp(actual) })}`;
        }
      }
    )

    const failures = outcomes.filter(result => result !== 'pass');
    const numberOfFailures = failures.length;
    const numberOfPasses = numberOfTests - numberOfFailures;

    if (numberOfFailures === 0) {
      console.log(`All ${numberOfPasses} tests passing`);
    } else {
      console.log(`${numberOfFailures} tests failing: ${failures.join('; ')}`);
    }
  } catch(error) {
    console.log(`Failed to validate the description: ${error}`)
  }
}

verifyShunter(shuntingYardA, {
  '3': [ '3' ],
  '2+3': ['2', '3', arithmetic.operators['+'].symbol],
  '4!': ['4', arithmetic.operators['!'].symbol],
  '3*2+4!': ['3', '2', arithmetic.operators['*'].symbol, '4', arithmetic.operators['!'].symbol, arithmetic.operators['+'].symbol],
  '(3*2+4)!': ['3', '2', arithmetic.operators['*'].symbol, '4', arithmetic.operators['+'].symbol, arithmetic.operators['!'].symbol]
}, arithmetic);
  //=> All 5 tests passing
```

---

### handling a default operator

In mathematical notation, it is not always necessary to write a multiplication operator. For example, `2(3+4)` is understood to be equivalent to `2 * (3 + 4)`.

Whenever two values are adacent to each other in the input, we want our shunting yard to insert the missing `*` just as if it had been explicitly included. We will call `*` a "default operator," as our next shunting yard will default to `*` if there is a mssing infix oprator.

`shuntingYardA` above has two places where it reports this as an error. Let's modify it as follows: Whenever it encounters two values in succession, it will re-enqueue the default operator, re-enqueue the second value, and then proceed.

We'll start with a way to denote which is the default operator, and then update our shunting yard code:

```javascript
const arithmeticB = {
  operators: arithmetic.operators,
  defaultOperator: '*'
}

function shuntingYardB (inputString, { operators, defaultOperator }) {
  const operatorsMap = new Map(
    Object.entries(operators)
  );

  const representationOf =
    something => {
      if (operatorsMap.has(something)) {
        const { symbol } = operatorsMap.get(something);

        return symbol;
      } else if (typeof something === 'string') {
        return something;
      } else {
        error(`${something} is not a value`);
      }
    };
  const typeOf =
    symbol => operatorsMap.has(symbol) ? operatorsMap.get(symbol).type : 'value';
  const isInfix =
    symbol => typeOf(symbol) === 'infix';
  const isPostfix =
    symbol => typeOf(symbol) === 'postfix';
  const isCombinator =
    symbol => isInfix(symbol) || isPostfix(symbol);

  const input = inputString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // value catenation

      input.unshift(symbol);
      input.unshift(defaultOperator);
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const op = operatorStack.pop();

        outputQueue.push(representationOf(op));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isCombinator(symbol)) {
      const { precedence } = operatorsMap.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (isCombinator(symbol) && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operatorsMap.get(peek(operatorStack)).precedence;

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(representationOf(op));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = isInfix(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(representationOf(symbol));
      awaitingValue = false;
    } else {
      // value catenation

      input.unshift(symbol);
      input.unshift(defaultOperator);
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    if (operatorsMap.has(op)) {
      const { symbol: opSymbol } = operatorsMap.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}

verifyShunter(shuntingYardB, {
  '3': [ '3' ],
  '2+3': ['2', '3', arithmetic.operators['+'].symbol],
  '4!': ['4', arithmetic.operators['!'].symbol],
  '3*2+4!': ['3', '2', arithmetic.operators['*'].symbol, '4', arithmetic.operators['!'].symbol, arithmetic.operators['+'].symbol],
  '(3*2+4)!': ['3', '2', arithmetic.operators['*'].symbol, '4', arithmetic.operators['+'].symbol, arithmetic.operators['!'].symbol],
  '2(3+4)5': ['2', '3', '4', arithmeticB.operators['+'].symbol, '5', arithmeticB.operators['*'].symbol, arithmeticB.operators['*'].symbol],
  '3!2': ['3', arithmeticB.operators['!'].symbol, '2', arithmeticB.operators['*'].symbol]
}, arithmeticB);
  //=> All 7 tests passing
```

We now have enough to get started with evaluating the postfix notation produced by our shunting yard.

---

### evaluating postfix

Our first cut at the code for evaluating the postfix code produceed by our shunting yard will take the configuration for operators as an argument, and it will also take a function for converting strings to values.

```javascript
function evaluatePostfixA (postfix, { operators, toValue }) {
  const symbols = new Map(
    Object.entries(operators).map(
      ([key, { symbol, type, fn }]) =>
        [symbol, { arity: arities[type], fn }]
    )
  );

  const stack = [];

  for (const element of postfix) {
    if (typeof element === 'string') {
      stack.push(toValue(element));
    } else if (symbols.has(element)) {
      const { arity, fn } = symbols.get(element);

      if (stack.length < arity) {
        error(`Not emough values on the stack to use ${element}`)
      } else {
        const args = [];

        for (let counter = 0; counter < arity; ++counter) {
          args.unshift(stack.pop());
        }

        stack.push(fn.apply(null, args))
      }
    } else {
      error(`Don't know what to do with ${element}'`)
    }
  }
  if (stack.length === 0) {
    return undefined;
  } else if (stack.length > 1) {
    error(`should only be one value to return, but there were ${stack.length}values on the stack`);
  } else {
    return stack[0];
  }
}
```

We can then wire the shunting yard up to the postfix evaluator, to make a function that evaluates infix notation:

```javascript
function evaluateA (expression, configuration) {
  return evaluatePostfixA(
    shuntingYardB(
      expression, configuration
    ),
    configuration
  );
}

const arithmeticC = {
  operators: arithmetic.operators,
  defaultOperator: '*',
  toValue: string => Number.parseInt(string, 10)
};

verify(evaluateA, {
  '': undefined,
  '3': 3,
  '2+3': 5,
  '4!': 24,
  '3*2+4!': 30,
  '(3*2+4)!': 3628800,
  '2(3+4)5': 70,
  '3!2': 12
}, arithmeticC);
  //=> All 8 tests passing
```

This extremely basic function for evaluates:

- infix expressions;
- with parentheses, and infix operators (naturally);
- with postfix operators;
- with a default operator that handles the case when values are catenated.

That is enough to begin work on compiling regular expressions to finite-state recognizers.

---

# Finite-State Recognizers

If we're going to compile regular expressions to finite-state recognizers, we need a representation for finite-state recognizers. There are many ways to notate finite-state automata. For example, state diagrams are particularly easy to read for smallish examples:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> one : 1
    one --> one : 0, 1
    zero --> [*]
    one --> [*]
</div>

Of course, diagrams are not particularly easy to work with in JavaScript. If we want to write JavaScript algorithms that operate on finite-state recognizers, we need a language for describing finite-state recognizers that JavaScript is comfortable manipulating.

### describing finite-state recognizers in JSON

We don't need to invent a brand-new format, there is already an accepted [formal definition][fdfsa]. Mind you, it involves mathematical symbols that are unfamiliar to some programmers, so without dumbing it down, we will create our own language that is equivalent to the full formal definition, but expressed in a subset of JSON.

[fdfsa]: https://en.wikipedia.org/wiki/Finite-state_machine#Mathematical_model

JSON has the advantage that it is a language in the exact sense we want: An ordered set of symbols.

Now what do we need to encode? Finite-state recognizers are defined as a quintuple of `(Σ, S, s, ẟ, F)`, where:

  - `Σ` is the alphabet of symbols this recognizer operates upon.
  - `S` is the set of states this recognizer can be in.
  - `s` is the initial or "start" state of the recognizer.
  - `ẟ` is the recognizer's "state transition function" that governs how the recognizer changes states while it consumes symbols from the sentence it is attempting to recognize.
  - `F` is the set of "final" states. If the recognizer is in one of these states when the input ends, it has recognized the sentence.

For our immediate purposes, we do not need to encode the alphabet of symbols, and the set of states can always be derived from the rest of the description, so we don't need to encode that either. This leaves us with describing the start state, transition function, and set of final states.

We can encode these with JSON. We'll use descriptive words rather than mathematical symbols, but note that if we wanted to use the mathematical symbols, everything we're doing would work just as well.

Or JSON representation will represent the start state, transition function, and set of final states as a Plain Old JavaScript Object (or "POJO"), rather than an array. This makes it easier to document what each element means:

```javascript
{
  // elements...
}
```

The recognizer's initial, or `start` state is required. It is a string representing the name of the initial state:

```json
{
  "start": "start"
}
```

The recognizer's state transition function, `ẟ`, is represented as a set of `transitions`, encoded as a list of POJOs, each of which represents exactly one transition:

```json
{
  "transitions": [

  ]
}
```

Each transition defines a change in the recognizer's state. Transitions are formally defined as triples of the form `(p, a, q)`:

 - `p` is the state the recognizer is currently in.
 - `a` is the input symbol  consumed.
 - `q` is the state the recognizer will be in after completing this transition. It can be the same as `p`, meaning that it consumes a symbol and remains in the same state.

We can represent this with POJOs. For readability by those unfamiliar with the formal notation, we will use the words `from`, `consume`, and `to`. This may feel like a lot of typing compared to the formal symbols, but we'll get the computer do do our writing for us, and it doesn't care.

Thus, one possible set of transitions might be encoded like this:

```json
{
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ]
}
```

The recognizer's set of final, or `accepting` states is required. It is encoded as a list of strings representing the names of the final states. If the recognizer is in any of the `accepting` (or "final") states when the end of the sentence is reached (or equivalently, when there are no more symbols to consume), the recognizer accepts or "recognizes" the sentence.

```json
{
  "accepting": ["zero", "notZero"]
}
```

Putting it all together, we have:

```javascript
const binary = {
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ],
  "accepting": ["zero", "notZero"]
}
```

Our representation translates directly to this simplified state diagram:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

This finite-state recognizer recognizes binary numbers.

---

### verifying finite-state recognizers

It's all very well to _say_ that a description recognizes binary numbers (or have any other expectation for it, really). But how do we have confidence that the finite-state recognizer we describe recognizes the language what we think it recognizes?

There are formal ways to prove things about recognizers, and there is the informal technique of writing tests we can run. Since we're emphasizing working code, we'll write tests.

Here is a function that takes as its input the definition of a recognizer, and returns a Javascript recognizer *function*:[^vap][^regexp]

```javascript
function automate (description) {
  if (description instanceof Regexp) {
    return string => !!description.exec(string)
  } else {
    const {
      stateMap,
      start,
      acceptingSet,
      transitions
    } = validatedAndProcessed(description);

    return function (string) {
      let state = start;
      let unconsumed = string;

      while (unconsumed !== '') {
        const transitionsForThisState = stateMap.get(state) || [];
        const transition =
        	transitionsForThisState.find(
            ({ consume }) => consume === unconsumed[0]
        	);

        if (transition == null) {
          // the machine stops
        	break;
        }

        const { to } = transition;
        unconsumed = unconsumed.substring(1);

        state = to;
      }

      // machine has reached a terminal state.
      if (unconsumed === '') {
        // reached the end. do we accept?
        return acceptingSet.has(state);
      } else {
        // stopped before reaching the end is a fail
        return false;
      }
    }
  }
}
```

[^vap]: `automate` relies on `validatedAndProcessed`, a utility function that does some general-purpose processing useful to many of the things we will build along the way. The source code is [here](/assets/supplemental/fsa/01-validated-and-processed.js). Throughout this essay, we will publish the most important snippets of code, but link to the full source.

[^regexp]: `automate` can also take a JavaScript `RegExp` as an argument and return a recognizer function. This is not central to developing finite-state recognizers, but is sometimes useful when comparing JavaScript regexen to our recognizers.

Here we are using `automate` with our definition for recognizing binary numbers. We'll use the `verify` function throughout our exploration to build simple tests-by-example:

```javascript
function verifyRecognizer (recognizer, examples) {
  return verify(automate(recognizer), examples);
}

const binary = {
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ],
  "accepting": ["zero", "notZero"]
};

verifyRecognizer(binary, {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true,
  '10100011011000001010011100101110111': true
});
  //=> All 16 tests passing
```

We now have a function, `automate`, that takes a data description of a finite-state automaton/recognizer, and returns a Javascript recognizer function we can play with and verify.

Verifying recognizers will be extremely important when we want to verify that when we compile a regular expression to a finite-state recognizer, that the finite-state recognizer is equivalent to the regular expression.

---

# Building Blocks

Regular expressions have a notation for the empty set, the empty string, and single characters:

- The symbol `∅` describes the language with no sentences, also called "the empty set."
- The symbol `ε` describes the language containing only the empty string.
- Literals such as `x`, `y`, or `z` describe languages containing single sentences, containing single symbols. e.g. The literal `r` describes the language `R`, which contains just one sentence: `'r'`.

In order to compile such regular expressions into finite-state recognizers, we begin by defining functions that return the empty language, the language containing only the empty string, and languages with just one sentance containing one symbol.

### ∅ and ε

Here's a function that returns a recognizer that doesn't recognize any sentences:

```javascript
const names = (() => {
  let i = 0;

  return function * names () {
    while (true) yield `G${++i}`;
  };
})();

function emptySet () {
  const [start] = names();

  return {
    start,
    "transitions": [],
    "accepting": []
  };
}

verifyRecognizer(emptySet(), {
  '': false,
  '0': false,
  '1': false
});
  //=> All 3 tests passing
```

It's called `emptySet`, because the the set of all sentences this language recognizes is empty. Note that while hand-written recognizers can have any arbitrary names for their states, we're using the `names` generator to generate state nams for us. This automatically avoid two recognizers ever having state names in common, which makes some of teh code we write later a great deal simpler.

Now, how do we get our evaluator to handle it? Our `evaluate` function takes a configuration object as a parameter, and that's where we define operators. We're going to define `∅` as an atomic operator.[^atomic]

[^atomic] Atomic operators take zero arguments, as contrasted with postfix operators that take one argument, or infix operators that take two operators.

```javascript
const regexA = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    }
  },
  // ...
};

Next, we need a recognizer that recognizes the language containing only the empty string, `''`. Once again, we'll write a function that returns a recognizer:

```javascript
function emptyString () {
  const [start] = names();

  return {
    start,
    "transitions": [],
    "accepting": [start]
  };
}

verifyRecognizer(emptyString(), {
  '': true,
  '0': false,
  '1': false
});
  //=> All 3 tests passing
```

And then we'll add it to the configuration:

```javascript
const regexA = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: emptyString
    }
  },
  // ...
};
```

---

### literal

What makes recognizers really useful is recognizing non-empty strings of one kind or another. This use case is so common, regexen are designed to make recognizing strings the easiest thing to write. For example, to recognize the string `abc`, we write `/^abc$/`:

```javascript
verify(/^abc$/, {
  '': false,
  'a': false,
  'ab': false,
  'abc': true,
  '_abc': false,
  '_abc_': false,
  'abc_': false
})
  //=> All 7 tests passing
```

Here's an example of a recognizer that recognizes a single zero:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->recognized : 0
    recognized-->[*]
</div>

We could write a function that returns a recognizer for `0`, and then write another a for every other symbol we might want to use in a recognizer, and then we could assign them all to atomic operators, but this would be tedious. Instead, here's a function that makes recognizers that recognize a literal symbol:

```javascript
function literal (symbol) {
  return {
    "start": "empty",
    "transitions": [
      { "from": "empty", "consume": symbol, "to": "recognized" }
    ],
    "accepting": ["recognized"]
  };
}

verifyRecognizer(literal('0'), {
  '': false,
  '0': true,
  '1': false,
  '01': false,
  '10': false,
  '11': false
});
  //=> All 6 tests passing
```

Now clearly, this cannot be an atomic operator. But recall that our function for evaluating postfix expressions has a special function, `toValue`, for translating strings into values. In a calculator, the values were integers. In our compiler, the values are finite-state recognizers.

Our approach to handling constant literals will be to use `toValue` to perform the translation for us:

```javascript
const regexA = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: emptyString
    }
  },
  defaultOperator: undefined,
  toValue (string) {
    return literal(string);
  }
};
```

---

### using ∅, ε, and literal

Now that we have defined operators for `∅` and `ε`, and now that we have writed `toValue` to use `literal`, we can use `evaluate` to generate recognizers from the most basic of regular expressions:

```javascript
const emptySetRecognizer = evaluate(`∅`, regexA);
const emptyStringRecognizer = evaluate(`ε`, regexA);
const rRecognizer = evaluate('r', regexA);

verifyRecognizer(emptySetRecognizer, {
  '': false,
  '0': false,
  '1': false
});
  //=> All 3 tests passing

verifyRecognizer(emptyStringRecognizer, {
  '': true,
  '0': false,
  '1': false
});
  //=> All 3 tests passing

verifyRecognizer(rRecognizer, {
  '': false,
  'r': true,
  'R': false,
  'reg': false,
  'Reg': false
});
  //=> All 5 tests passing
```

We'll do this enough that it's worth building a helper for verifying our work:

```javascript
function verifyEvaluateA (expression, configuration, examples) {
  return verify(
    automate(evaluateA(expression, configuration)),
    examples
  );
}

verifyEvaluateA('∅', regexA, {
  '': false,
  '0': false,
  '1': false
});
  //=> All 3 tests passing

verifyEvaluateA(`ε`, regexA, {
  '': true,
  '0': false,
  '1': false
});
  //=> All 3 tests passing

verifyEvaluateA('r', regexA, {
  '': false,
  'r': true,
  'R': false,
  'reg': false,
  'Reg': false
});
  //=> All 5 tests passing
```

Great! We have something to work with, namely constants. Before we get to building expressions using operators and so forth, let's solve the little problem we hinted at when making `∅` and `ε` into operators.

---

### recognizing special characters

There is a bug in our code so far. Or rather, a glaring omission: _How do we write a recognizer that recognizes the characters `∅` or `ε`?_

This is not really necessary for demonstrating the general idea that we can compile any regular expression into a finite-state recognizer, but once we start adding operators like `*` and `?`, not to mention extensions like `+` or `?`, the utility of our demonstration code will fall dramatically.

Now we've already made `∅` and `ε` into atomic operators, so now the question becomes, how do we write a regular expression with literal `∅` or `ε` chracters in it? And not to mention, literal parentheses?

Let's go with the most popular approach, and incorporate an escape symbol. In most languages, including regexen, that symbol is a `\`. We could do the same, but JavaScript already interprets `\` as an escape, so our work would be littered with double backslashes to get JavaScript to recognize a single `\`.

We'll set it up so that we can choose whatever we like, but by default we'll use a back-tick:

```javascript
function shuntingYardC (
  inputString,
  {
    operators,
    defaultOperator,
    escapeSymbol = '`',
    escapedValue = string => string
  }
) {
  const operatorsMap = new Map(
    Object.entries(operators)
  );

  const representationOf =
    something => {
      if (operatorsMap.has(something)) {
        const { symbol } = operatorsMap.get(something);

        return symbol;
      } else if (typeof something === 'string') {
        return something;
      } else {
        error(`${something} is not a value`);
      }
    };
  const typeOf =
    symbol => operatorsMap.has(symbol) ? operatorsMap.get(symbol).type : 'value';
  const isInfix =
    symbol => typeOf(symbol) === 'infix';
  const isPostfix =
    symbol => typeOf(symbol) === 'postfix';
  const isCombinator =
    symbol => isInfix(symbol) || isPostfix(symbol);

  const input = inputString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === escapeSymbol) {
      if (input.length === 0) {
        error('Escape symbol ${escapeSymbol} has no following symbol');
      } else {
        const valueSymbol = input.shift();

        if (awaitingValue) {
          // push the escaped value of the symbol

          outputQueue.push(escapedValue(valueSymbol));
        } else {
          // value catenation

          input.unshift(valueSymbol);
          input.unshift(escapeSymbol);
          input.unshift(defaultOperator);
        }
        awaitingValue = false;
      }
    } else if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // value catenation

      input.unshift(symbol);
      input.unshift(defaultOperator);
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const op = operatorStack.pop();

        outputQueue.push(representationOf(op));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isCombinator(symbol)) {
      const { precedence } = operatorsMap.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (isCombinator(symbol) && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operatorsMap.get(peek(operatorStack)).precedence;

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(representationOf(op));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = isInfix(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(representationOf(symbol));
      awaitingValue = false;
    } else {
      // value catenation

      input.unshift(symbol);
      input.unshift(defaultOperator);
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    if (operatorsMap.has(op)) {
      const { symbol: opSymbol } = operatorsMap.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}

function evaluateB (expression, configuration) {
  return evaluatePostfixA(
    shuntingYardC(
      expression, configuration
    ),
    configuration
  );
}
```

And now to test it:

```javascript
function verifyEvaluateB (expression, configuration, examples) {
  return verify(
    automate(evaluateB(expression, configuration)),
    examples
  );
}

verifyEvaluateB('∅', regexA, {
  '': false,
  '∅': false,
  'ε': false
});
  //=> All 3 tests passing

verifyEvaluateB('`∅', regexA, {
  '': false,
  '∅': true,
  'ε': false
});
  //=> All 3 tests passing

verifyEvaluateB('ε', regexA, {
  '': true,
  '∅': false,
  'ε': false
});
  //=> All 3 tests passing

verifyEvaluateB('`ε', regexA, {
  '': false,
  '∅': false,
  'ε': true
});
  //=> All 3 tests passing
```

And now it's time for what we might call the main event: Expressions that use operators.

Composeable recognizers and patterns are particularly interesting. Just as human languages are built by layers of composition, all sorts of mechanical languages are structured using composition. JSON is a perfect example: A JSON element like a list is composed of zero or more arbitrary JSON elements, which themselves could be lists, and so forth.

Regular expressions and regexen are both built with composition. If you have two regular expressions, `a` and `b`, you can create a new regular expression that is the union of `a` and `b` with the expression `a|b`, and you can create a new regular expression that is the catenation of `a` and `b` with `ab`.

Our `evaluate` functions don't know how to do that, and we aren't going to update them to try. Instead, we'll write combinator functions that take two recognizers and return the finite-state recognizer representing the alternation, or catenation of their arguments.

We'll begin with alternation.

---

# Alternating Regular Expressions

So far, we only have recognizers for the empty set, the empty string, and any one character. Nevertheless, we will build alternation to handle *any* two recognizers, because that's exactly how the rules of regular expressions defines it:

1. The expression _x_`|`_y_ describes to the union of the languages `X` and `Y`, meaning, the sentence `w` belongs to `x|y` if and only if `w` belongs to the language `X` or `w` belongs to the language `Y`. We can also say that _x_`|`_y_ represents the _alternation_ of _x_ and _y_.

We'll get started with a function that computes the `union` of the descriptions of two finite-state recognizers, which is built on a very useful operation, *taking the product of two finite-state automata*.

---

## Taking the Product of Two Finite-State Automata

Consider two finite-state recognizers. The first, `a`, recognizes a string of one or more zeroes:

<div class="mermaid">
  stateDiagram
    [*]-->emptyA
    emptyA-->zero : 0
    zero-->zero : 0
    zero-->[*]
</div>

The second, `b`, recognizes a string of one or more ones:

<div class="mermaid">
  stateDiagram
    [*]-->emptyB
    emptyB-->one : 1
    one--> one : 1
    one-->[*]
</div>

Recognizer `a` has two declared states: `'empty'` and `'zero'`. Recognizer `b` also has two declared states: `'empty'` and `'one'`. Both also have an undeclared state: they can halt. As a convention, we will refer to the halted state as an empty string, `''`.

Thus, recognizer `a` has three possible states: `'empty'`, `'zero'`, and `''`. Likewise, recognizer `b` has three possible states: `'empty'`, `'one'`, and `''`.

Now let us imagine the two recognizers are operating concurrently on the same stream of symbols:

<div class="mermaid">
  stateDiagram
    simultaneous

  state simultaneous {
    [*]-->emptyA
      emptyA-->zero : 0
      zero-->zero : 0
      zero-->[*]

    --

    [*]-->emptyB
      emptyB-->one : 1
      one--> one : 1
      one-->[*]
  }
</div>

At any one time, there are nine possible combinations of states the two machines could be in:

|a|b|
|:---|:---|
|`''`|`''`|
|`''`|`'emptyB'`|
|`''`|`'one'`|
|`'emptyA'`|`''`|
|`'emptyA'`|`'emptyB'`|
|`'emptyA'`|`'one'`|
|`'zero'`|`''`|
|`'zero'`|`'emptyB'`|
|`'zero'`|`'one'`|

If we wish to simulate the actions of the two recognizers operating concurrently, we could do so if we had a finite-state automaton with nine states, one for each of the pairs of states that `a` and `b` could be in.

It will look something like this:

<div class="mermaid">
  stateDiagram
    state1 : '' and ''
    state2 : '' and 'emptyB'
    state3 : '' and 'one'
</div>

<div class="mermaid">
  stateDiagram
    state4 : 'emptyA' and ''
    state5 : 'emptyA' and 'emptyB'
    state6 : 'emptyA' and 'one'
</div>

<div class="mermaid">
  stateDiagram
    state7 : 'zero' and ''
    state8 : 'zero' and 'emptyB'
    state9 : 'zero' and 'one'
</div>

The reason this is called the **product** of `a` and `b`, is that when we take the product of the sets `{ '', 'emptyA', 'zero' }` and `{'', 'emptyB', 'one' }` is the set of tuples `{ ('', ''), ('', 'emptyB'), ('', 'one'), ('emptyA', ''), ('emptyA', 'emptyB'), ('emptyA', 'one'), ('zero', ''), ('zero', 'emptyB'), ('zero', 'one')}`.

There will be (at most) one set in the product state machine for each tuple in the product of the sets of states for `a` and `b`.

We haven't decided where such an automaton would start, how it transitions between its states, and which states should be accepting states. We'll go through those in that order.

---

### starting the product

Now let's consider `a` and `b` simultaneously reading the same string of symbols in parallel. What states would they respectively start in? `emptyA` and `emptyB`, of course, therefore our product will begin in `state5`, which corresponds to `emptyA` and `emptyB`:

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 : 'emptyA' and 'emptyB'
</div>

This is a rule for constructing products: The product of two recognizers begins in the state corresponding to the start state for each of the recognizers.

---

### transitions

Now let's think about our product automaton. It begins in `state5`. What transitions can it make from there? We can work that out by looking at the transitions for `emptyA` and `emptyB`.

Given that the product is in a state corresponding to `a` being in state _Fa_ and `b` being in state `Fb`, We'll follow these rules for determining the transitions from the state (_Fa_ and _Fb_):

1. If when `a` is in state _Fa_ it consumes a symbol _S_ and transitions to state _Ta_, but when `b` is in state _Fb_ it does not consume the symbol _S_, then the product of `a` and `b` will consume _S_ and transition to the state (_Ta_ and `''`), denoting that were the two recognizers operating concurrently, `a` would transition to state _Ta_ while `b` would halt.
2. If when `a` is in state _Fa_ it does not consume a symbol _S_, but when `b` is in state _Fb_ it consumes the symbol _S_ and transitions to state _Tb_, then the product of `a` and `b` will consume _S_ and transition to (`''` and _Tb_), denoting that were the two recognizers operating concurrently, `a` would halt while `b` would transition to state _Tb_.
2. If when `a` is in state _Fa_ it consumes a symbol _S_ and transitions to state _Ta_, and also if when `b` is in state _Fb_ it consumes the symbol _S_ and transitions to state _Tb_, then the product of `a` and `b` will consume _S_ and transition to (_Ta_ and _Tb_), denoting that were the two recognizers operating concurrently, `a` would transition to state _Ta_ while `b` would transition to state _Tb_.

When our product is in state `'state5'`, it corresponds to the states (`'emptyA'` and `'emptyB'`). Well, when `a` is in state `'emptyA'`, it consumes `0` and transitions to `'zero'`, but when `b` is in `'emptyB'`, it does not consume `0`.

Therefore, by rule 1, when the product is in state `'state5'` corresponding to the states (`'emptyA'` and `'emptyB'`), it consumes `0` and transitions to `'state7'` corresponding to the states (`'zero'` and `''`):

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 --> state7 : 0

    state5 : 'emptyA' and 'emptyB'
    state7 : 'zero' and ''
</div>

And by rule 2, when the product is in state `'state5'` corresponding to the states (`'emptyA'` and `'emptyB'`), it consumes `1` and transitions to `'state3'`, corresponding to the states (`''` and `'one'`):

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 --> state7 : 0
    state5 --> state3 : 1

    state3: '' and 'one'
    state5 : 'emptyA' and 'emptyB'
    state7 : 'zero' and ''
</div>

What transitions take place from state `'state7'`? `b` is halted in `'state7'`, and therefore `b` doesn't consume any symbols in `'state7'`, and therefore we can apply rule 1 to the case where `a` consumes a `0` from state `'zero'` and transitions to state `'zero'`:

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 --> state7 : 0
    state5 --> state3 : 1

    state7 --> state7 : 0

    state3: '' and 'one'
    state5 : 'emptyA' and 'emptyB'
    state7 : 'zero' and ''
</div>

We can always apply rule 1 to any state where `b` is halted, and it follows that all of the transitions from a state where `b` is halted will lead to states where `b` is halted. Now what about state `'state3'`?

Well, by similar logic, since `a` is halted in state `'state3'`, and `b` consumes a `1` in state `'one'` and transitions back to state `'one'`, we apply rule 2 and get:

<div class="mermaid">
  stateDiagram
    [*] --> state5
    state5 --> state7 : 0
    state5 --> state3 : 1

    state7 --> state7 : 0
    state3 --> state3 : 1

    state3: '' and 'one'
    state5 : 'emptyA' and 'emptyB'
    state7 : 'zero' and ''
</div>

We could apply our rules to the other six states, but we don't need to: The states `'state2'`, `'state4'`, `'state6'`, `'state8'`, and `'state9'` are unreachable from the starting state `'state5'`.

And `'state1` need not be included: When both `a` and `b` halt, then the product of `a` and `b` also halts. So we can leave it out.

Thus, if we begin with the start state and then recursively follow transitions, we will automatically end up with the subset of all possible product states that are reachable given the transitions for `a` and `b`.

---

### a function to compute the product of two recognizers

Here is a function that takes the product of two recognizers:

```javascript
// A state aggregator maps a set of states
// (such as the two states forming part of the product
// of two finite-state recognizers) to a new state.
class StateAggregator {
  constructor () {
    this.map = new Map();
    this.inverseMap = new Map();
  }

  stateFromSet (...states) {
    const materialStates = states.filter(s => s != null);

    if (materialStates.some(ms=>this.inverseMap.has(ms))) {
      error(`Surprise! Aggregating an aggregate!!`);
    }

    if (materialStates.length === 0) {
      error('tried to get an aggregate state name for no states');
    } else if (materialStates.length === 1) {
      // do not need a new state name
      return materialStates[0];
    } else {
      const key = materialStates.sort().map(s=>`(${s})`).join('');

      if (this.map.has(key)) {
        return this.map.get(key);
      } else {
        const [newState] = names();

        this.map.set(key, newState);
        this.inverseMap.set(newState, new Set(materialStates));

        return newState;
      }
    }
  }

  setFromState (state) {
    if (this.inverseMap.has(state)) {
      return this.inverseMap.get(state);
    } else {
      return new Set([state]);
    }
  }
}

function product (a, b, P = new StateAggregator()) {
  const {
    stateMap: aStateMap,
    start: aStart
  } = validatedAndProcessed(a);
  const {
    stateMap: bStateMap,
    start: bStart
  } = validatedAndProcessed(b);

  // R is a collection of states "remaining" to be analyzed
  // it is a map from the product's state name to the individual states
  // for a and b
  const R = new Map();

  // T is a collection of states already analyzed
  // it is a map from a product's state name to the transitions
  // for that state
  const T = new Map();

  // seed R
  const start = P.stateFromSet(aStart, bStart);
  R.set(start, [aStart, bStart]);

  while (R.size > 0) {
    const [[abState, [aState, bState]]] = R.entries();
    const aTransitions = aState != null ? (aStateMap.get(aState) || []) : [];
    const bTransitions = bState != null ? (bStateMap.get(bState) || []) : [];

    let abTransitions = [];

    if (T.has(abState)) {
      error(`Error taking product: T and R both have ${abState} at the same time.`);
    }

    if (aTransitions.length === 0 && bTransitions.length == 0) {
      // dead end for both
      // will add no transitions
      // we put it in T just to avoid recomputing this if it's referenced again
      T.set(abState, []);
    } else if (aTransitions.length === 0) {
      const aTo = null;
      abTransitions = bTransitions.map(
        ({ consume, to: bTo }) => ({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo })
      );
    } else if (bTransitions.length === 0) {
      const bTo = null;
      abTransitions = aTransitions.map(
        ({ consume, to: aTo }) => ({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo })
      );
    } else {
      // both a and b have transitions
      const aConsumeToMap =
        aTransitions.reduce(
          (acc, { consume, to }) => (acc.set(consume, to), acc),
          new Map()
        );
      const bConsumeToMap =
        bTransitions.reduce(
          (acc, { consume, to }) => (acc.set(consume, to), acc),
          new Map()
        );

      for (const { from, consume, to: aTo } of aTransitions) {
        const bTo = bConsumeToMap.has(consume) ? bConsumeToMap.get(consume) : null;

        if (bTo != null) {
          bConsumeToMap.delete(consume);
        }

        abTransitions.push({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo });
      }

      for (const [consume, bTo] of bConsumeToMap.entries()) {
        const aTo = null;

        abTransitions.push({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo });
      }
    }

    T.set(abState, abTransitions);

    for (const { to, aTo, bTo } of abTransitions) {
      // more work remaining?
      if (!T.has(to) && !R.has(to)) {
        R.set(to, [aTo, bTo]);
      }
    }

    R.delete(abState);
  }

  const accepting = [];

  const transitions =
    [...T.values()].flatMap(
      tt => tt.map(
        ({ from, consume, to }) => ({ from, consume, to })
      )
    );

  return { start, accepting, transitions };

}
```

We can test it with out `a` and `b`:

```javascript
const a = {
  "start": 'emptyA',
  "accepting": ['zero'],
  "transitions": [
    { "from": 'emptyA', "consume": '0', "to": 'zero' },
    { "from": 'zero', "consume": '0', "to": 'zero' }
  ]
};

const b = {
  "start": 'emptyB',
  "accepting": ['one'],
  "transitions": [
    { "from": 'emptyB', "consume": '1', "to": 'one' },
    { "from": 'one', "consume": '1', "to": 'one' }
  ]
};

product(a, b)
  //=>
    {
      "start": "G41",
      "transitions": [
        { "from": "G41", "consume": "0", "to": "G42" },
        { "from": "G41", "consume": "1", "to": "G43" },
        { "from": "G42", "consume": "0", "to": "G42" },
        { "from": "G43", "consume": "1", "to": "G43" }
      ],
      "accepting": []
    }
```

It doesn't actually accept anything, so it's not much of a recognizer. Yet.

---

## From Product to Union

We know how to compute the product of two recognizers, and we see how the product actually simulates having two recognizers simultaneously consuming the same symbols. But what we want is to compute the union of the recognizers.

So let's consider our requirements. When we talk about the union of `a` and `b`, we mean a recognizer that recognizes any sentence that `a` recognizes, or any sentence that `b` recognizes.

If the two recognizers were running concurrently, we would want to accept a sentence if `a` ended up in one of its recognizing states or if `b` ended up in one of its accepting states. How does this translate to the product's states?

Well, each state of the product represents one state from `a` and one state from `b`. If there are no more symbols to consume and the product is in a state where the state from `a` is in `a`'s set of accepting states, then this is equivalent to `a` having accepted the sentence. Likewise, if there are no more symbols to consume and the product is in a state where the state from `b` is in `b`'s set of accepting states, then this is equivalent to `b` having accepted the sentence.

In theory, then, for `a` and `b`, the following product states represent the union of `a` and `b`:

|a|b|
|:---|:---|
|`''`|`'one'`|
|`'emptyA'`|`'one'`|
|`'zero'`|`''`|
|`'zero'`|`'emptyB'`|
|`'zero'`|`'one'`|

Of course, only two of these (`'zero'` and `''`, `''` and `'one'`) are reachable, so those are the ones we want our product to accept when we want the union of two recognizers.

Here's a union function that makes use of `product` and some of the helpers we've already written:

```javascript
function union2 (a, b) {
  const {
    states: aDeclaredStates,
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const aStates = [null].concat(aDeclaredStates);

  const {
    states: bDeclaredStates,
    accepting: bAccepting
  } = validatedAndProcessed(b);
  const bStates = [null].concat(bDeclaredStates);

  // P is a mapping from a pair of states (or any set, but in union2 it's always a pair)
  // to a new state representing the tuple of those states
  const P = new StateAggregator();

  const productAB = product(a, b, P);
  const { start, transitions } = productAB;

  const statesAAccepts =
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => P.stateFromSet(aAcceptingState, bState))
    );
  const statesBAccepts =
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => P.stateFromSet(aState, bAcceptingState))
    );

  const allAcceptingStates =
    [...new Set([...statesAAccepts, ...statesBAccepts])];

  const { stateSet: reachableStates } = validatedAndProcessed(productAB);
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}
```

And when we try it:

```javascript
union2(a, b)
  //=>
    {
      "start": "G41",
      "transitions": [
        { "from": "G41", "consume": "0", "to": "G42" },
        { "from": "G41", "consume": "1", "to": "G43" },
        { "from": "G42", "consume": "0", "to": "G42" },
        { "from": "G43", "consume": "1", "to": "G43" }
      ],
      "accepting": [ "G42", "G43" ]
    }
```

Now we can incorporate `union2` as an operator:

```javascript
const regexB = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: emptyString
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: union2
    }
  },
  defaultOperator: undefined,
  toValue (string) {
    return literal(string);
  }
};

verifyEvaluateB('a', regexB, {
  '': false,
  'a': true,
  'A': false,
  'aa': false,
  'AA': false
});
  //=> All 5 tests passing

verifyEvaluateB('A', regexB, {
  '': false,
  'a': false,
  'A': true,
  'aa': false,
  'AA': false
});
  //=> All 5 tests passing

verifyEvaluateB('a|A', regexB, {
  '': false,
  'a': true,
  'A': true,
  'aa': false,
  'AA': false
});
  //=> All 5 tests passing
```

We're ready to work on `catenation` now, but before we do, a digression about `product`.

---

### the marvellous product

Taking the `product` of two recognizers is a general-purpose way of simulating the effect of running two recognizers in parallel on the same input. In the case of `union(a, b)`, we obtained `product(a, b)`, and then selected as accepting states, all those states where _either_ `a` or `b` reached an accepting state.

But what other ways could we determine the accepting state of the result?

If we accept all those states where _both_ `a` and `b` reached an accepting state, we have computed the `intersection` of `a` and `b`. `intersection` is not a part of formal regular expressions or of most regexen, but it can be useful and we will see later how to add it as an operator.

If we accept all those states where `a` reaches an accepting state _but `b` does not_, we have computed the `difference` between `a` and `b`. This can also be used for implementing regex lookahead features, but this time for negative lookaheads.

We could even compute all those states where either `a` or `b` reach an accepting state, _but not both_. This would compute the `disjunction` of the two recognizers.

We'll return to some of these other uses for `product` after we staisfy ourselves that we can generate a finite-state recognizer for any formal regular expression we like.

---

# Catenating Regular Expressions

And now we turn our attention to catenating descriptions. Let's begin by informally defining what we mean  by "catenating descriptions:"

Given two recognizers, `a` and `b`, the catenation of `a` and `b` is a recognizer that recognizes a sentence `AB`, if and only if `A` is a sentence recognized by `a` and `B` is a sentence recognized by `b`.

Catenation is very common in composing patterns. It's how we formally define recognizers that recognize things like "the function keyword, followed by optional whitespace, followed by an optional label, followed by optional whitespace, followed by an open parenthesis, followed by..." and so forth.

A hypothetical recognizer for JavaScript function expressions would be composed by catenating recognizers for keywords, optional whitespace, labels, parentheses, and so forth.

---

### catenating descriptions with epsilon-transitions

Our finite-state automata are very simple: They are deterministic, meaning that in every state, there is one and only one transition for each unique symbol. And they always consume a symbol when they transition.

Some finite-state automata relax the second constraint. They allow a transition between states without consuming a symbol. If a transition with a symbol to be consumed is like an "if statement," a transition without a symbol to consume is like a "goto."

Such transitions are called "ε-transitions," or "epsilon transitions" for those who prefer to avoid greek letters. As we'll see, ε-transitions do not add any power to finite-state automata, but they do sometimes help make diagrams a little easier to understand and formulate.

Recall our recognizer that recognizes variations on the name "reg." Here it is as a diagram:

<div class="mermaid">
  stateDiagram
    [*]-->start
    start-->r : r,R
    r-->re : e,E
    re-->reg : g,G
    reg-->[*]
</div>

And here is the diagram for a recognizer that recognizes one or more exclamation marks:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

The simplest way to catenate recognizers is to put all their states together in one big diagram, and create an ε-transition between the accepting states for the first recognizer, and the start state of the second. The start state of the first recognizer becomes the start state of the result, and the accepting states of the second recognizer become the accepting state of the result.

Like this:

<div class="mermaid">
  stateDiagram
    [*]-->start
    start-->r : r,R
    r-->re : e,E
    re-->reg : g,G
    reg-->empty
    empty-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

Here's a function to catenate any two recognizers, using ε-transitions:

```javascript
function epsilonCatenate (first, second) {
  const unconflictedSecond =  resolveConflicts(first, second);

  const joinTransitions =
    first.accepting.map(
      from => ({ from, to: unconflictedSecond.start })
    );

  return {
    start: first.start,
    accepting: unconflictedSecond.accepting,
    transitions:
      first.transitions
        .concat(joinTransitions)
        .concat(unconflictedSecond.transitions)
  };
}

epsilonCatenate(reg, exclamations)
  //=>
    {
      "start": "empty",
      "accepting": [ "bang" ],
      "transitions": [
        { "from": "empty", "consume": "r", "to": "r" },
        { "from": "empty", "consume": "R", "to": "r" },
        { "from": "r", "consume": "e", "to": "re" },
        { "from": "r", "consume": "E", "to": "re" },
        { "from": "re", "consume": "g", "to": "reg" },
        { "from": "re", "consume": "G", "to": "reg" },
        { "from": "reg", "to": "empty2" },
        { "from": "empty2", "to": "bang", "consume": "!" },
        { "from": "bang", "to": "bang", "consume": "!" }
      ]
    }
```

Of course, our engine for finite-state recognizers doesn't actually implement ε-transitions. We could add that as a feature, but instead, let's look at an algorithm for removing ε-transitions from finite-state machines.

---

### removing epsilon-transitions

To remove an ε-transition between any two states, we start by taking all the transitions in the destination state, and copy them into the origin state. Next, if the destination state is an accepting state, we make the origin state an accepting state as well.

We then can remove the ε-transition without changing the recognizer's behaviour. In our catenated recognizer, we have an ε-transition between the `reg` and `empty` states:

<div class="mermaid">
  stateDiagram
    reg-->empty
    empty-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

The `empty` state has one transition, from `empty` to `bang`, while consuming `!`. If we copy that into `reg`, we get:

<div class="mermaid">
  stateDiagram
    reg-->bang : !
    empty-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

Since `empty` is not an accepting state, we do not need to make `reg` an accepting state, so we are done removing this ε-transition. We repeat this process for all ε-transitions, in any order we like, until there are no more ε-transitions. In this case, there only was one, so the result is:

<div class="mermaid">
  stateDiagram
    [*]-->start
    start-->r : r,R
    r-->re : e,E
    re-->reg : g,G
    reg-->bang : !
    empty-->bang : !
    bang-->bang : !
    bang-->[*]
</div>

This is clearly a recognizer that recognizes the name "reg" followed by one or more exclamation marks. Our catenation algorithm has two steps. In the first, we create a recognizer with ε-transitions:

1. Connect the two recognizers with an ε-transition from each accepting state from the first recognizer to the start state from the second recognizer.
2. The start state of the first recognizer becomes the start state of the catenated recognizers.
3. The accepting states of the second recognizer become the accepting states of the catenated recognizers.

This transformation complete, we can then remove the ε-transitions. For each ε-transition between an origin and destination state:

1. Copy all of the transitions from the destination state into the origin state.
2. If the destination state is an accepting state, make the origin state an accepting state as well.
3. Remove the ε-transition.

(Following this process, we sometimes wind up with unreachable states. In our example above, `empty` becomes unreachable after removing the ε-transition. This has no effect on the behaviour of the recognizer, and in the next section, we'll see how to prune those unreachable states.)

---

### implementing catenation

Here's a function that implements the steps described above: It takes any finite-state recognizer, and removes all of the ε-transitions, returning an equivalent finite-state recognizer without ε-transitions.

There's code to handle cases we haven't discussed--like ε-transitions between a state and itself, and loops in epsilon transitions (bad!)--but at its heart, it just implements the simple algorithm we just described.

```javascript
function removeEpsilonTransitions ({ start, accepting, transitions }) {
  const acceptingSet = new Set(accepting);
  const transitionsWithoutEpsilon =
    transitions
      .filter(({ consume }) => consume != null);
  const stateMapWithoutEpsilon = toStateMap(transitionsWithoutEpsilon);
  const epsilonMap =
    transitions
      .filter(({ consume }) => consume == null)
      .reduce(
          (acc, { from, to }) => {
            const toStates = acc.has(from) ? acc.get(from) : new Set();

            toStates.add(to);
            acc.set(from, toStates);
            return acc;
          },
          new Map()
        );

  const epsilonQueue = [...epsilonMap.entries()];
  const epsilonFromStatesSet = new Set(epsilonMap.keys());

  const outerBoundsOnNumberOfRemovals = transitions.length;
  let loops = 0;

  while (epsilonQueue.length > 0 && loops++ <= outerBoundsOnNumberOfRemovals) {
    let [epsilonFrom, epsilonToSet] = epsilonQueue.shift();
    const allEpsilonToStates = [...epsilonToSet];

    // special case: We can ignore self-epsilon transitions (e.g. a-->a)
    const epsilonToStates = allEpsilonToStates.filter(
      toState => toState !== epsilonFrom
    );

    // we defer resolving destinations that have epsilon transitions
    const deferredEpsilonToStates = epsilonToStates.filter(s => epsilonFromStatesSet.has(s));
    if (deferredEpsilonToStates.length > 0) {
      // defer them
      epsilonQueue.push([epsilonFrom, deferredEpsilonToStates]);
    } else {
      // if nothing to defer, remove this from the set
      epsilonFromStatesSet.delete(epsilonFrom);
    }

    // we can immediately resolve destinations that themselves don't have epsilon transitions
    const immediateEpsilonToStates = epsilonToStates.filter(s => !epsilonFromStatesSet.has(s));
    for (const epsilonTo of immediateEpsilonToStates) {
      const source =
        stateMapWithoutEpsilon.get(epsilonTo) || [];
      const potentialToMove =
        source.map(
          ({ consume, to }) => ({ from: epsilonFrom, consume, to })
        );
      const existingTransitions = stateMapWithoutEpsilon.get(epsilonFrom) || [];

      // filter out duplicates
      const needToMove = potentialToMove.filter(
        ({ consume: pConsume, to: pTo }) =>
          !existingTransitions.some(
            ({ consume: eConsume, to: eTo }) => pConsume === eConsume && pTo === eTo
          )
      );
      // now add the moved transitions
      stateMapWithoutEpsilon.set(epsilonFrom, existingTransitions.concat(needToMove));

      // special case!
      if (acceptingSet.has(epsilonTo)) {
        acceptingSet.add(epsilonFrom);
      }
    }
  }

  if (loops > outerBoundsOnNumberOfRemovals) {
    error("Attempted to remove too many epsilon transitions. Investigate possible loop.");
  } else {
    return {
      start,
      accepting: [...acceptingSet],
      transitions: [
        ...stateMapWithoutEpsilon.values()
      ].flatMap( tt => tt )
    };
  }
}

removeEpsilonTransitions(epsilonCatenate(reg, exclamations))
  //=>
    {
      "start": "empty",
      "accepting": [ "bang" ],
      "transitions": [
        { "from": "empty", "consume": "r", "to": "r" },
        { "from": "empty", "consume": "R", "to": "r" },
        { "from": "r", "consume": "e", "to": "re" },
        { "from": "r", "consume": "E", "to": "re" },
        { "from": "re", "consume": "g", "to": "reg" },
        { "from": "re", "consume": "G", "to": "reg" },
        { "from": "empty2", "to": "bang", "consume": "!" },
        { "from": "bang", "to": "bang", "consume": "!" },
        { "from": "reg", "consume": "!", "to": "bang" }
      ]
    }
```

We have now implemented catenating two deterministic finite-state recognizers in such a way that we return a finite-state recognizer. The only things left to do are remove unreachable states, and to deal with a catch that we'll descrirbe below.

---

### unreachable states

Our "epsilon join/remove epsilons" technique has a small drawback: It can create an unreachable state when the starting state of the second recognizer is not the destination of any other transitions.

Consider:

<div class="mermaid">
  stateDiagram
    [*]-->start
    start-->zero : 0
    zero --> [*]
</div>

And:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->one : 1
    one --> [*]
</div>

When we join them and remove transitions, we end up with an unreachable state, `empty`:

<div class="mermaid">
  stateDiagram
    [*]-->start
    start-->zero : 0
    zero --> one : 1
    empty-->one : 1
    one --> [*]
</div>

We could implement a very specific fix, but the code to do a general elimination of unreachable states is straightforward:

```javascript
function reachableFromStart ({ start, accepting: allAccepting, transitions: allTransitions }) {
  const stateMap = toStateMap(allTransitions, true);
  const reachableMap = new Map();
  const R = new Set([start]);

  while (R.size > 0) {
    const [state] = [...R];
    R.delete(state);
    const transitions = stateMap.get(state) || [];

    // this state is reachable
    reachableMap.set(state, transitions);

    const reachableFromThisState =
      transitions.map(({ to }) => to);

    const unprocessedReachableFromThisState =
      reachableFromThisState
        .filter(to => !reachableMap.has(to) && !R.has(to));

    for (const reachableState of unprocessedReachableFromThisState) {
      R.add(reachableState);
    }
  }

  const transitions = [...reachableMap.values()].flatMap(tt => tt);

  // prune unreachable states from the accepting set
  const reachableStates = new Set(
    [start].concat(
      transitions.map(({ to }) => to)
    )
  );

  const accepting = allAccepting.filter( state => reachableStates.has(state) );

  return {
    start,
    transitions,
    accepting
  };
}
```

And we can test it out:

```javascript
const zero = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "0", "to": "zero" }
  ],
  "accepting": ["zero"]
};

const one = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "1", "to": "one" }
  ],
  "accepting": ["one"]
};

reachableFromStart(removeEpsilonTransitions(epsilonCatenate(zero, one)))
  //=>
    {
      "start":"empty",
      "transitions":[
        {"from":"empty","consume":"0","to":"zero"},
        {"from":"zero","consume":"1","to":"one"}
      ],
      "accepting":["one"]
    }
```

No unreachable states!

---

### the catch with catenation

We hinted above that catenation came with a "catch." Consider this recognizer that recognizes one or more `0`s:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zeroes : 0
    zeroes--> zeroes : 0
    zeroes --> [*]
</div>

And consider this recognizer that recognizes a binary number:

<div class="mermaid">
  stateDiagram
    [*] --> empty
    empty --> zero : 0
    empty --> notZero : 1
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

What happens when we use our functions to catenate them?

```javascript
const zeroes = {
  "start": "empty",
  "accepting": [ "zeroes" ],
  "transitions": [
    { "from": "empty", "consume": "0", "to": "zeroes" },
    { "from": "zeroes", "consume": "0", "to": "zeroes" }
  ]
};

const binary = {
  "start": "empty",
  "accepting": ["zero", "notZero"],
  "transitions": [
    { "from": "empty", "consume": "0", "to": "zero" },
    { "from": "empty", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ]
}

reachableFromStart(removeEpsilonTransitions(epsilonCatenate(zeroes, binary)))
  //=>
    {
      "start": "empty",
      "accepting": [ "zero", "notZero" ],
      "transitions": [
        { "from": "empty", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "zero" },
        { "from": "zeroes", "consume": "1", "to": "notZero" },
        { "from": "start", "to": "zero", "consume": "0" },
        { "from": "start", "to": "notZero", "consume": "1" },
        { "from": "notZero", "to": "notZero", "consume": "0" },
        { "from": "notZero", "to": "notZero", "consume": "1" }
      ]
    }
```

And here's a diagram of the result:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zeroes : 0
    zeroes-->zeroes : 0
    zeroes-->zero : 0
    zeroes-->notZero : 1
    notZero-->notZero : 0
    notZero-->notZero : 1
    zero-->[*]
    notZero-->[*]
</div>

The problem is that there are two transitions from `zeroes` when consuming a `0`. That makes this transition _nondeterministic_. Deterministic state machines always have exactly one possible transition from any state for each symbol consumed in that state. Nondeterministic finite-state machines can have multiple transitions for the same symbol form any state.


We want to catenate two deterministic finite-state recognizers, and wind up with a deterministic finite-state recognizer. Why? From a theoretical perspective, nondeterministic finite-state recognizers are easier to reason about. They're always doing exactly one thing.

From a practical perspective, deterministic finite-state recognizers are always guaranteed to execute in O<i>n</i> time: They follow exactly one transition for every symbol consumed. Of course, they trade space for time: We say that with `product`, and we're going to see that again with our next important function, `powerset`.

---

## Converting Nondeterministic to Deterministic Finite-State Recognizers

As noted, our procedure for joining two recognizers with ε-transitions can create nondeterministic finite-state automata ("NFAs"). We wish to convert these NFAs to deterministic finite-state automata ("DFAs") so that we end up with a catenation algorithm that can take any two DFA recognizers and return a DFA recognizer for the catenation of the recognizers' languages.

We have already solved a subset of this problem, in a way. Consider the problem of taking the union of two recognizers. We did this with the product of the two recognizers. The way "product" worked was that it modelled two recognizers being in two different states at a time by creating new states that represented the pair of states each recognizer could be in.

We can use this approach with NFAs as well.

---

### taking the product of a recognizer... with itself

Recall that for computing the union of two recognizers, when we wanted to simulate two recognizers acting in parallel on the same input, we imagined that there was a state for every pair of states the two recognizers could be simultaneously in. This approach was called taking the *product* of the two recognizers.

Now let's imagine running a nondeterministic state machine in parallel with itself. It would start with just one copy of itself, like this:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->zeroes : 0
    zeroes-->zeroes : 0
    zeroes-->zero : 0
    zeroes-->notZero : 1
    notZero-->notZero : 0
    notZero-->notZero : 1
    zero-->[*]
    notZero-->[*]
</div>

It could operate as a single machine as long as every transition it took would be deterministic. For example, it could consume the empty string and halt, that would be deterministic. Same for the string `0` and all strings beginning with `01...`.

But what would happen when it consumed the string `00`? the first `0` would take it from state `'empty'` to `'zeroes'`, but the second `0` is nondeterministic: It should transition to both `'zero'` and back to `'zeroes'`.

If we had a second parallel state machine, we could have one transition to `'zero'` while the other transitions back to `'zeroes'`. From our implementation of `product`, we know how to hadle this: we need a new state representing the two machines simultaneously being in states `'zero'` and `'zeroes'`, the tuple `('zero', 'zeroes')`.

Using similar logic as we used with `product`, we can work out that from our new tuple state, we need to draw in all the transitions from either of its states. In this case, that's ridiculously easy, since `'zero'` doesn't have any outbound transitions, so `('zero', 'zeroes')` would have the same transitions as `'zeroes'`.

Now this is a very simple example. What is the **worst** case for using an algorithm like this?

Well, given a state machine with _n_ states, there could be a state for every possible subset of states. Consider this pathological example with three states:

<div class="mermaid">
  stateDiagram
    [*]-->one
    one-->two : 1
    one-->three : 2
    two-->one : 3
    two-->two : 3
    two-->one : 4
    two-->three : 4
    two-->two : 5
    two-->three : 5
    three-->one : 6
    three-->two : 6
    three-->three : 6
    three-->[*]
</div>

If we work our way through it by hand, we see that we need seven states to represent all the possible subsets of states this recognizer can reach: `('one'), ('two'), ('three'), ('one', 'two'), ('one', 'three'), ('two', 'three'), ('one', 'two', 'three')`.

The set of all possible subsets of a set is called the [powerset] of a set. The powerset of a set includes the empty set and the set itself. Our diagram and list do not include the empty set, because that represents the machine halting, so it is an _implied_ state of the machine.

[powerset]: https://en.wikipedia.org/wiki/Power_set

We can also work out all the transitions just as we did with `product`. It ends up as this plate of spaghetti:

<div class="mermaid">
  stateDiagram
    [*]-->one
    one-->two : 1
    one-->three : 2
    two-->onetwo : 3
    two-->onethree : 4
    two-->twothree : 5
    three-->onetwothree : 6
    onetwo-->two : 1
    onetwo-->three : 2
    onetwo-->onetwo : 3
    onetwo-->onethree : 4
    onetwo-->twothree : 5
    onethree-->two : 1
    onethree-->three : 2
    onethree-->onetwothree : 6
    twothree-->onetwo : 3
    twothree-->onethree : 4
    twothree-->twothree : 5
    twothree-->onetwothree : 6
    three-->[*]
    onethree-->[*]
    twothree-->[*]
    onetwothree-->[*]
</div>

But while we may call it the "worst case" as far as the number of states is concerned, it is now a deterministic state machine that has the exact same semantics as its nondeterministic predecessor.

Although it appears to be much more complicated than the NFA at a glance, the truth is that it is merely making the inherent complexity of the behaviour apparent. It's actually easier to follow along by hand, since we don't have to keep as many as three simultaneous states in our heads at any one time.

---

### computing the powerset of a nondeterministic finite-state recognizer

Using this approach, our algorithm for computing the powerset of a nondeterministic finite-state recognizer will use queue of states.

We begin by placing the start state in the queue, and then:

1. If the queue is empty, we're done.
2. Remove the state from the front of the queue, call it "this state."
3. If this state is already in the powerset recognizer, discard it and go back to step 1.
4. If this is the name of a single state in the nondeterministic finite-state recognizer:
   1. Collect the transitions from this state.
   2. If the state is an accepting state in the nondeterministic finite-state recognizer, add this state to the powerset recognizer's accepting states.
5. If this is the name of several states in the nondeterministic finite-state recognizer:
   1. collect the transitions from each of these states.
   2. If any of the states is an accepting state in the nondeterministic finite-state recognizer, add this state to the powerset recognizer's accepting states.
5. For each deterministic transition from this state (i.e. there is only one transition for a particular symbol from this state):
  1. Add the transition to the powerset recognizer.
  2. Add the destination set to the queue.
6. For each nondeterministic transition from this state (i.e. there is more than one transition for a particular symbol from this state):
  1. Collect the set of destination states for this symbol from this state.
  2. Create a name for the set of destination states.
  3. Create a transition from this state to the name for the set of destination states.
  4. Add the transition to the powerset recognizer.
  5. Add the name for the set of destination states to the queue.

We can encode this as a function, `powerset`:

```javascript
function powerset (description, P = new StateAggregator()) {
  const {
    start: nfaStart,
    acceptingSet: nfaAcceptingSet,
    stateMap: nfaStateMap
  } = validatedAndProcessed(description, true);

  // the final set of accepting states
  const dfaAcceptingSet = new Set();

  // R is the work "remaining" to be analyzed
  // organized as a set of states to process
  const R = new Set([ nfaStart ]);

  // T is a collection of states already analyzed
  // it is a map from the state name to the transitions
  // from that state
  const T = new Map();

  while (R.size > 0) {
    const [stateName] = [...R];
    R.delete(stateName);

    // all powerset states represent sets of state,
    // with the degenerate case being a state that only represents
    // itself. stateSet is the full set represented
    // by stateName
    const stateSet = P.setFromState(stateName);

    // get the aggregate transitions across all states
    // in the set
    const aggregateTransitions =
      [...stateSet].flatMap(s => nfaStateMap.get(s) || []);

    // a map from a symbol consumed to the set of
    // destination states
    const symbolToStates =
      aggregateTransitions
        .reduce(
          (acc, { consume, to }) => {
            const toStates = acc.has(consume) ? acc.get(consume) : new Set();

            toStates.add(to);
            acc.set(consume, toStates);
            return acc;
          },
          new Map()
        );

    const dfaTransitions = [];

  	for (const [consume, toStates] of symbolToStates.entries()) {
      const toStatesName = P.stateFromSet(...toStates);

      dfaTransitions.push({ from: stateName, consume, to: toStatesName });

      const hasBeenDone = T.has(toStatesName);
      const isInRemainingQueue = R.has(toStatesName)

      if (!hasBeenDone && !isInRemainingQueue) {
        R.add(toStatesName);
      }
    }

    T.set(stateName, dfaTransitions);

    const anyStateIsAccepting =
      [...stateSet].some(s => nfaAcceptingSet.has(s));

    if (anyStateIsAccepting) {
      dfaAcceptingSet.add(stateName);
    }

  }

  return {
    start: nfaStart,
    accepting: [...dfaAcceptingSet],
    transitions:
      [...T.values()]
        .flatMap(tt => tt)
  };
}
```

Let's try it:

```javascript
const zeroes = {
  "start": 'empty',
  "accepting": ['zeroes'],
  "transitions": [
    { "from": 'empty', "consume": '0', "to": 'zeroes' },
    { "from": 'zeroes', "consume": '0', "to": 'zeroes' }
  ]
};

const binary = {
  "start": "empty",
  "accepting": ["zero", "notZero"],
  "transitions": [
    { "from": "empty", "consume": "0", "to": "zero" },
    { "from": "empty", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ]
}

const nondeterministic =
  reachableFromStart(removeEpsilonTransitions(epsilonCatenate(zeroes, binary)));

nondeterministic
  //=>
    {
      "start": "empty",
      "accepting": [ "zero", "notZero" ],
      "transitions": [
        { "from": "empty", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "zero" },
        { "from": "zeroes", "consume": "1", "to": "notZero" },
        { "from": "notZero", "to": "notZero", "consume": "0" },
        { "from": "notZero", "to": "notZero", "consume": "1" }
      ]
    }

const deterministic = powerset(nondeterministic);

deterministic
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "0", "to": "zeroes" },
        { "from": "zeroes", "consume": "0", "to": "G36" },
        { "from": "zeroes", "consume": "1", "to": "notZero" },
        { "from": "G36", "consume": "0", "to": "G36" },
        { "from": "G36", "consume": "1", "to": "notZero" },
        { "from": "notZero", "consume": "0", "to": "notZero" },
        { "from": "notZero", "consume": "1", "to": "notZero" }
      ],
      "accepting": [ "G36", "notZero" ]
    }
```

The `powerset` function converts any nondeterministic finite-state recognizer into a deterministic finite-state recognizer.

---

### catenation without the catch

Computing the catenation of any two deterministic finite-state recognizers is thus:

```javascript
function catenation2 (a, b) {
  return powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonCatenate(a, b)
      )
    )
  );
}

verifyRecognizer(catenation2(zeroes, binary), {
  '': false,
  '0': false,
  '1': false,
  '00': true,
  '01': true,
  '10': false,
  '11': false,
  '000': true,
  '001': true,
  '010': true,
  '011': true,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});
  //=> All 15 tests passing
```

Given `catenation2`, we are now ready to enhance our evaluator:

```javascript
const regexC = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: emptyString
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: union2
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: catenation2
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};
```

Note that:

1. We are using an uncommon operator, `→` for catenation, to reduce the need for back ticks, and;
2. We have set it up as a default operator so that we need not include it in formal regular expressions.

Let's give it a try:

```javascript
verifyEvaluateB('r→e→g', regexC, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false
});
  //=> All 5 tests passing

verifyEvaluateB('reg', regexC, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false
});
  //=> All 5 tests passing

verifyEvaluateB('reg|reggie', regexC, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': true
});
  //=> All 5 tests passing
```

Great!

We have one more operator to add, `*`, but before we do, let's consider what happens when we combine `catenation` with `union`.

---

### the fan-out problem

Consider taking the union of `a` and `A`:

```javascript
evaluateB('a|A', regexC)
  //=>
    {
      "start": "G83",
      "transitions": [
        { "from": "G83", "consume": "a", "to": "G80" },
        { "from": "G83", "consume": "A", "to": "G82" }
      ],
      "accepting": [ "G80", "G82" ]
    }
```

The way we've written `union2`, we end up with two equivalent accepting states for `a|A`, `G80` and `G82` in this example. This would be a minor distraction, but consider:

```javascript
evaluateB('(a|A)(b|B)(c|C)', regexC)
  //=>
    {
      "start": "G91",
      "transitions": [
        { "from": "G91", "consume": "a", "to": "G88" },
        { "from": "G91", "consume": "A", "to": "G90" },
        { "from": "G88", "consume": "b", "to": "G96" },
        { "from": "G88", "consume": "B", "to": "G98" },
        { "from": "G90", "consume": "b", "to": "G96" },
        { "from": "G90", "consume": "B", "to": "G98" },
        { "from": "G96", "consume": "c", "to": "G104" },
        { "from": "G96", "consume": "C", "to": "G106" },
        { "from": "G98", "consume": "c", "to": "G104" },
        { "from": "G98", "consume": "C", "to": "G106" }
      ],
      "accepting": [ "G104", "G106" ]
    }
```

When we draw thus finite-state recognizer as a diagram, it looks like this:

<div class="mermaid">
stateDiagram
  [*]-->G91
  G91-->G88 : a
  G91-->G90 : A
  G88-->G96 : b
  G88-->G98 : B
  G90-->G96 : b
  G90-->G98 : B
  G96-->G104 : c
  G96-->G106 : C
  G98-->G104 : c
  G98-->G106 : C
  G104-->[*]
  G106-->[*]
</div>

Look at all the duplication! Nearly half of the diagram is a nearly exact copy of the other half. States `G88` and `G90` are *equivalent*: They have the exact same set of outgoing transitions. The same is true of `G96` and `G98`, and of `G104` and `G106`.

Ideally, we would **merge** the equivalent states, and then discard the unecessary states. This would reduce the number of states from seven to four:

<div class="mermaid">
stateDiagram
  [*]-->G91
  G91-->G88 : a, A
  G88-->G90 : b, B
  G90-->G92 : c, C
  G92-->[*]
</div>

Here's a function that repeatedly merges equivalent states until there are no more mergeable states:

```javascript
const keyS =
  (transitions, accepting) => {
    const stringifiedTransitions =
      transitions
        .map(({ consume, to }) => `${consume}-->${to}`)
        .sort()
        .join(', ');
    const acceptingSuffix = accepting ? '-->*' : '';

    return `[${stringifiedTransitions}]${acceptingSuffix}`;
  };

function mergeEquivalentStates (description) {
  searchForDuplicate: while (true) {
    let {
      start,
      transitions: allTransitions,
      accepting,
      states,
      stateMap,
      acceptingSet
    } = validatedAndProcessed(description);

    const statesByKey = new Map();

    for (const state of states) {
      const stateTransitions = stateMap.get(state) || [];
      const isAccepting = acceptingSet.has(state);
      const key = keyS(stateTransitions, isAccepting);

      if (statesByKey.has(key)) {
        // found a dup!
        const originalState = statesByKey.get(key);

      	console.log({ state, originalState, isAccepting })

        if (start === state) {
          // point start to original
          start = originalState;
        }

        // remove duplicate's transitions
        allTransitions = allTransitions.filter(
          ({ from }) => from !== state
        );

        // rewire all former incoming transitions
        allTransitions = allTransitions.map(
          ({ from, consume, to }) => ({
            from, consume, to: (to === state ? originalState : to)
          })
        );

        if (isAccepting) {
          // remove state from accepting
          accepting = accepting.filter(s => s !== state)
        }

        // reset description
        description = { start, transitions: allTransitions, accepting };

        // and then start all over again
        continue searchForDuplicate;
      } else {
        statesByKey.set(key, state);
      }
    }
    // no duplicates found
    break;
  }

  return description;
}
```

Armed with this, we can enhance our `union2` function:

```javascript
function union2merged (a, b) {
  return mergeEquivalentStates(
    union2(a, b)
  );
}

const regexD = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: emptyString
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: union2merged
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: catenation2
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};
```

Now let's compare the old:

```javascript
function verifyStateCount (configuration, examples) {
  function countStates (regex) {
    const fsr = evaluateB(regex, configuration);

    const states = toStateSet(fsr.transitions);
    states.add(fsr.start);

    return states.size;
  }

  return verify(countStates, examples);
}

const caseInsensitiveABC = "(a|A)(b|B)(c|C)"
const abcde = "(a|b|c|d|e)";
const lowercase =
  "(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)";

const fiveABCDEs =
  `${abcde}${abcde}${abcde}${abcde}${abcde}`;
const twoLowercaseLetters =
  `${lowercase}${lowercase}`;

verifyEvaluateB(caseInsensitiveABC, regexC, {
  '': false,
  'a': false,
  'z': false,
  'ab': false,
  'kl': false,
  'abc': true,
  'AbC': true,
  'edc': false,
  'abcde': false,
  'abCde': false,
  'dcabe': false,
  'abcdef': false
});

verifyEvaluateB(fiveABCDEs, regexC, {
  '': false,
  'a': false,
  'z': false,
  'ab': false,
  'kl': false,
  'abc': false,
  'AbC': false,
  'edc': false,
  'abcde': true,
  'dcabe': true,
  'abcdef': false,
  'abCde': false
});
  //=> All 12 tests passing

verifyEvaluateB(twoLowercaseLetters, regexC, {
  '': false,
  'a': false,
  'z': false,
  'ab': true,
  'kl': true,
  'abc': false,
  'AbC': false,
  'edc': false,
  'abcde': false,
  'dcabe': false,
  'abcdef': false,
  'abCde': false
});
  //=> All 12 tests passing

verifyStateCount(regexC, {
  [caseInsensitiveABC]: 7,
  [fiveABCDEs]: 26,
  [twoLowercaseLetters]: 53
});
  //=> All 3 tests passing
```

To the new:

```javascript
verifyEvaluateB(caseInsensitiveABC, regexD, {
  '': false,
  'a': false,
  'z': false,
  'ab': false,
  'kl': false,
  'abc': true,
  'AbC': true,
  'edc': false,
  'abcde': false,
  'abCde': false,
  'dcabe': false,
  'abcdef': false
});
  //=> All 12 tests passing

verifyEvaluateB(fiveABCDEs, regexD, {
  '': false,
  'a': false,
  'z': false,
  'ab': false,
  'kl': false,
  'abc': false,
  'AbC': false,
  'edc': false,
  'abcde': true,
  'dcabe': true,
  'abcdef': false,
  'abCde': false
});
  //=> All 12 tests passing

verifyEvaluateB(twoLowercaseLetters, regexD, {
  '': false,
  'a': false,
  'z': false,
  'ab': true,
  'kl': true,
  'abc': false,
  'AbC': false,
  'edc': false,
  'abcde': false,
  'dcabe': false,
  'abcdef': false,
  'abCde': false
});
  //=> All 12 tests passing

verifyStateCount(regexD, {
  [caseInsensitiveABC]: 4,
  [fiveABCDEs]: 6,
  [twoLowercaseLetters]: 3
});
  //=> All 3 tests passing
```

The old `union2` function created uneccesary states, and as a result, the number of states created when we catenate unions grows polynomially. Our new `union2merged` merges equivalent states, and as a result, the number of states created when we catenate unions grows linearly.

---

### summarizing catenation (and an improved union)

In sum, we have created `catenation2`, a function that can catenate *any* two finite-state recognizers, and return a new finite-state recognizer. If `ⓐ` is a finite-state recognizer that recognizes sentences in the language `A`, and `ⓑ` is a finite-state recognizer that recognizes sentences in the language `B`, then `catenation2(ⓐ, ⓑ)` is a finite-state recognizer that recognizes sentences in the language `AB`, where a sentance `ab` is in the language `AB`, if and only if `a` is a sentence in the language `A`, and `b` is a sentence in the language `B`.

We also created an optimized `union2merged` that merges equivalent states, preventing the fan-out problem when catenating unions.

Before we move on to implement the `kleene*`, let's also recapitule two major results that we demonstrated, namely *for every finite-state recognizer with epsilon-transitions, there exists a finite-state recognizer without epsilon-transitions*, and, *for every finite-state recognizer, there exists an equivalent deterministic finite-state recognizer*.

---

# Quantifying Regular Expressions

Formal regular expressions are made with three constants and three operators. We've implemented the three constants:

- The symbol `∅` describes the language with no sentences, also called "the empty set."
- The symbol `ε` describes the language containing only the empty string.
- Literals such as `x`, `y`, or `z` describe languages containing single sentences, containing single symbols. e.g. The literal `r` describes the language `R`, which contains just one sentence: `'r'`.

And we've implemented two of the three operators:

- The expression _x_`|`_y_ describes to the union of the languages `X` and `Y`, meaning, the sentence `w` belongs to `x|y` if and only if `w` belongs to the language `X` or `w` belongs to the language `Y`. We can also say that _x_`|`_y_ represents the _alternation_ of _x_ and _y_.
- The expression _xy_ describes the language `XY`, where a sentance `ab` belongs to the language `XY` if and only if `a` belohgs to the language `X` and `b` belongs to the language `Y`. We can also say that _xy_ represents the _catenation_ of the epxressions _x_ and _y_.

This leaves one remaining operator to implement, `*`:[^kleene-star]:

- The expression _x_`*` describes the language `Z`, where the sentence `ε` (the empty string) belongs to `Z`, and, the sentence `pq` belongs to `Z` if and only if `p` is a sentence belonging to `X`, and `q` is a sentence belonging to `Z`. We can also say that _x_`*` represents a _quantification_ of _x_, as it allows a regular expression to rerpresent a language containing sentences that match some number of senetences represented by _x_ catenated together.

[^kleene-star]: The `*` operator is named the [kleene star], after Stephen Kleene.

[Kleene Star]: https://en.wikipedia.org/wiki/Kleene_star

And when we've implemented `*` in our evaluator, we will have a function that takes any formal regular expression and "compiles" it to a finite-state recognizer.

### implementing the kleene star

We'll build a JavaScript operator for the `kleene*` step-by-step, starting with handling the "one or more" case.

Our strategy will be to take a recognizer, and then add epsilon transitions between its accepting states and its start state. In effect, we will create "loops" back to the start state from all accepting states.

For example, if we have:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->Aa : A, a
    Aa-->[*]
</div>

We will turn it into this to handle one or more `a`s and `A`s:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->Aa : A, a
    Aa-->[*]
    Aa-->empty
</div>

Once again we remove epsilon transitions, unreachable states, and possible nondeterminism:

<div class="mermaid">
  stateDiagram
    [*]-->empty
    empty-->Aa : A, a
    Aa-->Aa : A, a
    Aa-->[*]
</div>

Presto, a recognizer that handles one or more instances of an upper- or lower-case `a`! Here's an implementation in JavaScript:

```javascript
function oneOrMore (description) {
  const {
    start,
    transitions,
    accepting
  } = description;

  const withEpsilonTransitions = {
    start,
    transitions:
      transitions.concat(
        accepting.map(
          acceptingState => ({ from: acceptingState, to: start })
        )
      ),
      accepting
  };

  const oneOrMore = reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          withEpsilonTransitions
        )
      )
    )
  );

  return oneOrMore;
}

const Aa = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "A", "to": "Aa" },
    { "from": "empty", "consume": "a", "to": "Aa" }
  ],
  "accepting": ["Aa"]
};

verifyRecognizer(Aa, {
  '': false,
  'a': true,
  'A': true,
  'aa': false,
  'Aa': false,
  'AA': false,
  'aaaAaAaAaaaAaa': false,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 10 tests passing

oneOrMore(Aa)
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "A", "to": "Aa" },
        { "from": "empty", "consume": "a", "to": "Aa" }
        { "from": "Aa", "consume": "A", "to": "Aa" },
        { "from": "Aa", "consume": "a", "to": "Aa" }
      ],
      ],
      "accepting": ["Aa"]
    }

verifyRecognizer(oneOrMore(Aa), {
  '': false,
  'a': true,
  'A': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 10 tests passing
```

Handling one-or-more is nice, and maps directly to a programming regex operator, `+`. But the kleene star handles **zero** or more. How do we implement that?

Well, we can directly manipulate a recognizer's definition, but let's use what we already have. Given some recognizer `x`, what is the union of `x` and `ε` (the empty string)?

```javascript
verifyEvaluateB('((a|A)|ε)', formalRegularExpressions, {
  '': true,
  'a': true,
  'A': true,
  'aa': false,
  'Aa': false,
  'AA': false,
  'aaaAaAaAaaaAaa': false,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 10 test passing

function zeroOrOne (description) {
  return union2merged(description, emptyString());
}

verifyRecognizer(zeroOrOne(Aa), {
  '': true,
  'a': true,
  'A': true,
  'aa': false,
  'Aa': false,
  'AA': false,
  'aaaAaAaAaaaAaa': false,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 10 test passing
```

Matching the empty string or whatever a recognizer matches, is matching zero or one sentences the recognizer recognizes. Now that we have both `oneOrMore` and `zeroOrOne`, `zeroOrMore` is obvious:

```javascript
function zeroOrMore (description) {
  return zeroOrOneoneOrMore(description));
}

const formalRegularExpressions = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: emptyString
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: union2merged
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: catenation2
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: zeroOrMore
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

verifyRecognizer(zeroOrMore(Aa), {
  '': true,
  'a': true,
  'A': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

verifyEvaluateB('(a|A)*', formalRegularExpressions, {
  '': true,
  'a': true,
  'A': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

verifyEvaluateB('ab*c', formalRegularExpressions, {
  '': false,
  'a': false,
  'ac': true,
  'abc': true,
  'abbbc': true,
  'abbbbb': false
});
```

We have now defined every constant and combinator in formal regular expressions. So if we want, we can create regular expressions for all sorts of languages, such as `(R|r)eg(ε|gie(ε|ee*!))`:

```javascript
verifyEvaluateB('(R|r)eg(ε|gie(ε|ee*!))', formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});
```

And best of all, we know that whatever formal regular expression we devise, we can produce a finite-state recognizer that accept sentences in the language the formal regular expression describes, simply by feeding it to our `evaluateB` function along with the `formalRegulaExpressions` configuration dictionary.

---

### all together now

*More to come...*

---

# Annex

[For every finite-state recognizer with epsilon-transitions, there exists a finite-state recognizer without epsilon-transitions](#for-every-finite-state-recognizer-with-epsilon-transitions-there-exists-a-finite-state-recognizer-without-epsilon-transitions)

[For every finite-state recognizer, there exists an equivalent deterministic finite-state recognizer](#For-every-finite-state-recognizer-there-exists-an-equivalent-deterministic-finite-state-recognizer)


---

## For every finite-state recognizer with epsilon-transitions, there exists a finite-state recognizer without epsilon-transitions

When building `catenation`, we added ε-transitions to join two finite-state recognizers, and then used `removeEpsilonTransitions` to derive an equivalent finite-state recognizer without ε-transitions.

`removeEpsilonTransitions` demonstrates that for every finite-state recognizer with epsilon-transitions, there exists a finite-state recognizer without epsilon-transitions. Or to put it another way, the set of languages recognized by finite-state recognizers without ε-transitions is equal to the set of finite-state recognizers recognized by finite-state recognizers that do do do not include ε-transitions.

---

## For every finite-state recognizer, there exists an equivalent deterministic finite-state recognizer

Let's reflect on what [powerset](#computing-the-powerset-of-a-nondeterministic-finite-state-recognizer) tells us about finite-state recognizers. Because we can take _any_ finite-state recognizer, pass it to `powerset`, and get back a deterministic finite-state recognizer, we know that for *every* finite-state recognizer, there exists an equivalent deterministic finite-state recognizer.

This tells us that the set of all languages recognized by deterministic finite state recognizers is equal to the set of all languages recognized by finite-state recognizers.

This is not true for other types of automata: In [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata], we saw that non-deterministic pushdown automata could recognize palindromes, whereas deterministic pushdown automata could not. So the set of languages recognized by deterministic pushdown automata is **not** equal to the set of languages recognized by pushdown automata.

[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html


---

# Notes