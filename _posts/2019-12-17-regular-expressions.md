---
title: "Exploring Regular Expressions, Part II: Regular Languages and Finite-State Automata"
tags: [recursion,allonge,mermaid]
---

This is Part II of "Exploring Regular Expressions." If you haven't already, you may want to read [Part I] first, where we wrote a compiler that translates [formal regular expressions][regular expression] into [finite-state recognizers][fsm].

You may also want another look at the essay, [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]. It covers the concepts behind finite-state machines and the the kinds of "languages"  they can and cannot recognize.

[Part I]: https://raganwald.com/2019/09/21/regular-expressions.html
[regular expression]: https://en.wikipedia.org/wiki/Regular_expression#Formal_language_theory
[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine

---

# [Table of Contents](#table-of-contents)

### [The Essentials from Part I](#the-essentials-from-part-i-1)

[Regular Expressions](#regular-expressions)

[Our Code So Far](#our-code-so-far)

  - [the shunting yard](#the-shunting-yard)
  - [the stack machine](#the-stack-machine)
  - [evaluating arithmetic expressions](#evaluating-arithmetic-expressions)
  - [compiling formal regular expressions](#compiling-formal-regular-expressions)
  - [automation and verification](#automation-and-verification)

[For Every Regular Expression, There Exists an Equivalent Finite-State Recognizer](#for-every-regular-expression-there-exists-an-equivalent-finite-state-recognizer)

### [Beyond Formal Regular Expressions](#beyond-formal-regular-expressions)

  - [a hierarchy of regex functionality](#a-hierarchy-of-regex-functionality)
  - [beyond our hierarchy](#beyond-our-hierarchy)

[Implementing Level One Features](#implementing-level-one-features)

  - [implementing quantification operators with transpilation](#implementing-quantification-operators-with-transpilation)
  - [implementing the dot operator](#implementing-the-dot-operator)
  - [implementing shorthand character classes](#implementing-shorthand-character-classes)
  - [thoughts about custom character classes](#thoughts-about-custom-character-classes)
  - [eschewing transpilation](#eschewing-transpilation)

[Implementing Level Two Features](#implementing-level-two-features)

  - [intersection](#intersection)
  - [difference](#difference)
  - [complement](#complement)

[What Level Two Features Tell Us, and What They Don't](#what-level-two-features-tell-us-and-what-they-dont)

### [For Every Finite-State Recognizer, There Exists An Equivalent Formal Regular Expression](#for-every-finite-state-recognizer-there-exists-an-equivalent-formal-regular-expression-1)

- [the regularExpression function](#the-regularexpression-function)
- [the between function](#the-between-function)
- [using the regularExpression function](#using-the-regularexpression-function)
- [a test suite for  the regularExpression function](#a-test-suite-for--the-regularExpression-function)
- [conclusion](#conclusion)

---

# The Essentials from Part I

If you're familiar with formal regular expressions, and are very comfortable with the code we presented in [Part I], or just plain impatient, you can skip ahead to [Beyond Formal Regular Expressions](#beyond-formal-regular-expressions).

But for those who want a refresher, we'll quickly recap regular expressions and the code we have so far.

## Regular Expressions

In [Part I], and again in this essay, we will spend a lot of time talking about [formal regular expressions][regular expression]. Formal regular expressions are a minimal way to describe "regular" languages, and serve as the building blocks for the regexen we find in most programming languages.

Formal regular expressions describe languages as sets of sentences. The three basic building blocks for formal regular expressions are the empty set, the empty string, and literal symbols:

- The symbol `∅` describes the language with no sentences, `{ }`, also called "the empty set."
- The symbol `ε` describes the language containing only the empty string, `{ '' }`.
- Literals such as `x`, `y`, or `z` describe languages containing single sentences, containing single symbols. e.g. The literal `r` describes the language `{ 'r' }`.

What makes formal regular expressions powerful, is that we have operators for alternating, catenating, and quantifying regular expressions. Given that _x_ is a regular expression describing some language `X`, and _y_ is a regular expression describing some language `Y`:

1. The expression _x_`|`_y_ describes the union of the languages `X` and `Y`, meaning, the sentence `w` belongs to `x|y` if and only if `w` belongs to the language `X`, or `w` belongs to the language `Y`. We can also say that _x_`|`_y_ represents the _alternation_ of _x_ and _y_.
2. The expression _xy_ describes the language `XY`, where a sentence `ab` belongs to the language `XY` if and only if `a` belongs to the language `X`, and `b` belongs to the language `Y`. We can also say that _xy_ represents the _catenation_ of the expressions _x_ and _y_.
3. The expression _x_`*` describes the language `Z`, where the sentence `ε` (the empty string) belongs to `Z`, and, the sentence `pq` belongs to `Z` if and only if `p` is a sentence belonging to `X`, and `q` is a sentence belonging to `Z`. We can also say that _x_`*` represents a _quantification_ of _x_.

[Kleene Star]: https://en.wikipedia.org/wiki/Kleene_star

Before we add the last rule for regular expressions, let's clarify these three rules with some examples. Given the constants `a`, `b`, and `c`, resolving to the languages `{ 'a' }`, `{ 'b' }`, and `{ 'b' }`:

- The expression `b|c` describes the language `{ 'b', 'c' }`, by rule 1.
- The expression `ab` describes the language `{ 'ab' }` by rule 2.
- The expression `a*` describes the language `{ '', 'a', 'aa', 'aaa', ... }` by rule 3.

Our operations have a precedence, and it is the order of the rules as presented. So:

- The expression `a|bc` describes the language `{ 'a', 'bc' }` by rules 1 and 2.
- The expression `ab*` describes the language `{ 'a', 'ab', 'abb', 'abbb', ... }` by rules 2 and 3.
- The expression `b|c*` describes the language `{ '', 'b', 'c', 'cc', 'ccc', ... }` by rules 1 and 3.

As with the algebraic notation we are familiar with, we can use parentheses:

- Given a regular expression _x_, the expression `(`_x_`)` describes the language described by _x_.

This allows us to alter the way the operators are combined. As we have seen, the expression `b|c*` describes the language `{ '', 'b', 'c', 'cc', 'ccc', ... }`. But the expression `(b|c)*` describes the language `{ '', 'b', 'c', 'bb', 'cc', 'bbb', 'ccc', ... }`.

It is quite obvious that regexen borrowed a lot of their syntax and semantics from regular expressions. Leaving aside the mechanism of capturing and extracting portions of a match, almost every regular expressions is also a regex. For example, `/reggiee*/` is a regular expression that matches words like `reggie`, `reggiee`, and `reggieee` anywhere in a string.

## Our Code So Far

In [Part I], we established that for every [formal regular expression][regular expression], there is an equivalent [finite-state recognizer][fsm], establishing that the set of all languages described by formal regular expressions--that is to say, [regular languages]--is a subset of the set of all languages recognized by finite-state automata.

We did this in [constructive proof] fashion by writing a compiler that takes any formal regular expression as input, and returns a JSON description of an equivalent finite-state recognizer. We also wrote an automator that turns the description of a finite state recognizer into a JavaScript function that takes any string as input and answers whether the string is recognized.

[constructive proof]: https://en.wikipedia.org/wiki/Constructive_proof

Thus, we can take any formal regular expression and get a function that recognizes strings in the language described by the formal regular expression. And because the implementation is a finite-state automaton, we know that it can recognize strings in at most linear time, which can be an improvement over some regex implementations for certain regular expressions.

We're going to revisit the final version of most of our functions.

---

### the shunting yard

Our pipeline of tools starts with a [shunting yard][Shunting Yard Algorithm] function that takes a regular expression in infix notation, and translates it into [reverse-polish representation][reverse-polish notation]. It also takes a definition dictionary that configures the shunting yard by defining operators, a default operator to handle catenation, and some details on how to handle escaping symbols like parentheses that would otherwise be treated as operators.

It is hard-wired to treat `(` and `)` as parentheses for controlling the order of evaluation.

[Shunting Yard Algorithm]: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
[reverse-polish notation]: https://en.wikipedia.org/wiki/Reverse_Polish_notation

```javascript
function error(m) {
  console.log(m);
  throw m;
}

function peek(stack) {
  return stack[stack.length - 1];
}

function shuntingYard (
  infixExpression,
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
  const isPrefix =
    symbol => typeOf(symbol) === 'prefix';
  const isPostfix =
    symbol => typeOf(symbol) === 'postfix';
  const isCombinator =
    symbol => isInfix(symbol) || isPrefix(symbol) || isPostfix(symbol);
  const awaitsValue =
    symbol => isInfix(symbol) || isPrefix(symbol);

  const input = infixExpression.split('');
  const operatorStack = [];
  const reversePolishRepresentation = [];
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

          reversePolishRepresentation.push(escapedValue(valueSymbol));
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

        reversePolishRepresentation.push(representationOf(op));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isPrefix(symbol)) {
      if (awaitingValue) {
        const { precedence } = operatorsMap.get(symbol);

        // pop higher-precedence operators off the operator stack
        while (isCombinator(symbol) && operatorStack.length > 0 && peek(operatorStack) !== '(') {
          const opPrecedence = operatorsMap.get(peek(operatorStack)).precedence;

          if (precedence < opPrecedence) {
            const op = operatorStack.pop();

            reversePolishRepresentation.push(representationOf(op));
          } else {
            break;
          }
        }

        operatorStack.push(symbol);
        awaitingValue = awaitsValue(symbol);
      } else {
        // value catenation

        input.unshift(symbol);
        input.unshift(defaultOperator);
        awaitingValue = false;
      }
    } else if (isCombinator(symbol)) {
      const { precedence } = operatorsMap.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (isCombinator(symbol) && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operatorsMap.get(peek(operatorStack)).precedence;

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          reversePolishRepresentation.push(representationOf(op));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = awaitsValue(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      reversePolishRepresentation.push(representationOf(symbol));
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
      reversePolishRepresentation.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return reversePolishRepresentation;
}
```

---

### the stack machine

We then use a [stack machine] to evaluate the reverse-polish representation. It uses the same definition dictionary to evaluate the effect of operators.

[stack machine]: https://en.wikipedia.org/wiki/Stack_machine

```javascript
function stateMachine (representationList, {
  operators,
  toValue
}) {
  const functions = new Map(
    Object.entries(operators).map(
      ([key, { symbol, fn }]) => [symbol, fn]
    )
  );

  const stack = [];

  for (const element of representationList) {
    if (typeof element === 'string') {
      stack.push(toValue(element));
    } else if (functions.has(element)) {
      const fn = functions.get(element);
      const arity = fn.length;

      if (stack.length < arity) {
        error(`Not enough values on the stack to use ${element}`)
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
    error(`should only be one value to return, but there were ${stack.length} values on the stack`);
  } else {
    return stack[0];
  }
}
```

---

### evaluating arithmetic expressions

To evaluate an infix expression, the expression and definition dictionary are fed to the shunting yard, and then the resulting reverse-polish representation and definition dictionary are fed to the stack machine. For convenience, we have an evaluation function to do that:

```javascript
function evaluate (expression, definition) {
  return stateMachine(
    shuntingYard(
      expression, definition
    ),
    definition
  );
}
```

The `evaluate` function takes a definition dictionary as an argument, and passes it to both the shunting yard and the state machine. If we pass in one kind of definition, we have a primitive evaluator for arithmetic expressions:

```javascript
const arithmetic = {
  operators: {
    '+': {
      symbol: Symbol('+'),
      type: 'infix',
      precedence: 1,
      fn: (a, b) => a + b
    },
    '-': {
      symbol: Symbol('-'),
      type: 'infix',
      precedence: 1,
      fn: (a, b) => a - b
    },
    '*': {
      symbol: Symbol('*'),
      type: 'infix',
      precedence: 3,
      fn: (a, b) => a * b
    },
    '/': {
      symbol: Symbol('/'),
      type: 'infix',
      precedence: 2,
      fn: (a, b) => a / b
    },
    '!': {
      symbol: Symbol('!'),
      type: 'postfix',
      precedence: 4,
      fn: function factorial (a, memo = 1) {
        if (a < 2) {
          return a * memo;
        } else {
          return factorial(a - 1, a * memo);
        }
      }
    }
  },
  defaultOperator: '*',
  toValue: n => +n
};

evaluate('(1+2)3!', arithmetic)
  //=> 18
```

---

### compiling formal regular expressions

With a different definition dictionary, we can compile formal regular expressions to a finite-state recognizer description:

```javascript
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
```

We will not reproduce all of the code needed to implement `emptySet`, `emptyString`, `union2merged`, `catenation2`, and `zeroOrMore` here in the text, but the full implementations can be found [here][base].

[base]: /assets/supplemental/fsa-2/01-base.js

Here it is working:

```javascript
evaluate('0|1(0|1)*', formalRegularExpressions);
  //=>
    {
      "start": "G37",
      "transitions": [
        { "from": "G37", "consume": "0", "to": "G23" },
        { "from": "G37", "consume": "1", "to": "G25" },
        { "from": "G25", "consume": "0", "to": "G25" },
        { "from": "G25", "consume": "1", "to": "G25" }
      ],
      "accepting": [ "G23", "G25" ]
    }
```

This is a description in JSON, of this finite-state recognizer:

<div class="mermaid">
  stateDiagram
    [*]-->G37
    G37-->G23 : 0
    G37-->G25 : 1
    G25-->G25 : 0, 1
    G23-->[*]
    G25-->[*]
</div>

It recognizes the language consisting of the set of all binary numbers.

---

### automation and verification

We don't rely strictly on inspection to have confidence that the finite-state recognizers created by `evaluate` recognize the languages described by regular expressions. We use two tools.

First, we have an `automate` function that takes a JSON description of a finite-state recognizer as an argument, and returns a JavaScript *recognizer function*. The recognizer function takes a string as an argument, and returns `true` if the string belongs to the language recognized by that finite-state recognizer, and `false` if it doesn't.

This is the core `automate` function:

```javascript
function automate (description) {
  if (description instanceof RegExp) {
    return string => !!description.exec(string)
  } else {
    const {
      stateMap,
      start,
      acceptingSet,
      transitions
    } = validatedAndProcessed(description);

    return function (input) {
      let state = start;

      for (const symbol of input) {
        const transitionsForThisState = stateMap.get(state) || [];
        const transition =
        	transitionsForThisState.find(
            ({ consume }) => consume === symbol
        	);

        if (transition == null) {
          return false;
        }

        state = transition.to;
      }

      // reached the end. do we accept?
      return acceptingSet.has(state);
    }
  }
}
```

`automate` interprets the finite-state recognizers as it goes, and could be faster. But for the purposes of running test cases, it is sufficient for our needs. Its supporting functions can be found [here][base].

Speaking of running tests, we use a general-purpose `verify` function that works for any function, and for convenience, a `verifyEvaluate` function that uses `evaluate` and `automate` to convert any expression into a recognizer function first:

```javascript
function deepEqual(obj1, obj2) {
  function isPrimitive(obj) {
    return (obj !== Object(obj));
  }

  if (obj1 === obj2) // it's just the same object. No need to compare.
    return true;

  if (isPrimitive(obj1) && isPrimitive(obj2)) // compare primitives
    return obj1 === obj2;

  if (Object.keys(obj1).length !== Object.keys(obj2).length)
    return false;

  // compare objects with same number of keys
  for (let key in obj1) {
    if (!(key in obj2)) return false; //other object doesn't have this prop
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

const pp = value => value instanceof Array ? value.map(x => x.toString()) : value;

function verify(fn, tests, ...additionalArgs) {
  try {
    const testList =
      typeof tests.entries === 'function'
        ? [...tests.entries()]
        : Object.entries(tests);
    const numberOfTests = testList.length;

    const outcomes = testList.map(
      ([example, expected]) => {
        const actual = fn(example, ...additionalArgs);

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
  } catch (error) {
    console.log(`Failed to validate: ${error}`)
  }
}

function verifyEvaluate (expression, definition, examples) {
  return verify(
    automate(evaluate(expression, definition)),
    examples
  );
}
```

We can put it all together and verify our "binary numbers" expression:

```javascript
verifyEvaluate('0|1(0|1)*', formalRegularExpressions, {
  '': false,
  'an odd number of characters': false,
  'an even number of characters': false,
  '0': true,
  '10': true,
  '101': true,
  '1010': true,
  '10101': true
});
```

---

## For Every Regular Expression, There Exists an Equivalent Finite-State Recognizer

Armed with the code that compiles a formal regular expression to an equivalent finite-state recognizer, we have a constructive demonstration of the fact that for every regular expression, there exists an equivalent finite-state recognizer.

If someone were to hand us a formal regular expression and claim that there is no equivalent finite-state recognizer for that expression, we would feed the expression into our `evaluate` function, it would return an equivalent finite-state recognizer, and would thus invalidate their alleged counter-example.

Another way to put this is to state that the set of all languages described by formal regular expressions is a subset of the set of all languages recognized by finite-state recognizers. In the essay, we will establish, amongst other things, that the set of all languages described by formal regular expressions is equal to the set of all languages recognized by finite-state recognizers.

In other words, we will also show that for every finite-state recognizer, there exists an equivalent formal regular expression. We'll begin by looking at some ways to extend formal regular expressions, while still being equivalent to finite-state recognizers.

---

# Beyond Formal Regular Expressions

Formal regular expressions are--deliberately--as minimal as possible. There are only three kinds of literals (`∅`, `ε`, and literal symbols), and three operations (alternation with `|`, catenation, and quantification with `*`). Minimalism is extremely important from a computer science perspective, but unwieldy when trying to "Get Stuff Done."

Thus, all regexen provide functionality above and beyond formal regular expressions.

---

### a hierarchy of regex functionality

Functionality in regexen can be organized into a rough hierarchy. Level Zero of the hierarchy is functionality provided by formal regular expressions. Everything we've written in [Part I] is at this base level.

Level One of the hierarchy is functionality that can be directly implemented in terms of formal regular expressions. For example, regexen provide a `?` postfix operator that provides "zero or one" quantification, and a `+` postfix operator that provides "one or more" quantification.

As we know from our implementation of the kleene star, "zero or one" can be implemented in a formal regular expression very easily. If `a` is a regular expression, `ε|a` is a regular expression that matches zero or one sentences that `a` accepts. So intuitively, a regex flavour that supports the expression `a?` doesn't do anything we couldn't have done by hand with `ε|a`

The same reasoning goes for `+`: If we have the kleene star (which ironically we implemented on top of one-or-more), we can always express "one or more" using catenation and the kleene star. If `a` is a regular expression, `aa*` is a regular expression that matches one or more sentences that `a` accepts. Again, a regex flavour supports the expression `a+` doesn't do anything we couldn't have done by hand with `aa*`.

Level Two of the hierarchy is functionality that cannot be directly implemented in terms of formal regular expressions, however it still compiles to finite-state recognizers. As we mentioned in the prelude, and will show later, for every finite-state recognizer, there is an equivalent formal regular expression.

So if a particular piece of functionality can be implemented as a finite-state recognizer, then it certainly can be implemented in terms of a formal regular expression, however compiling an expression to a finite-state machine and then deriving an equivalent formal regular expression is "going the long way 'round," and thus we classify such functionality as being directly implemented as a finite-state recognizer, and only indirectly implemented in terms of formal regular expressions.

Examples of Level Two functionality include complementation (if `a` is a regular expression, `¬a` is an expression matching any sentence that `a` does not match), and intersection (if `a` and `b` are regular expressions, `a∩b` is an expression matching any sentence that both `a` and `b` match).

### beyond our hierarchy

There are higher levels of functionality, however they involve functionality that cannot be implemented with finite-state recognizers.

The [Chomsky–Schützenberger hierarchy] categorizes grammars from Type-3 to Type-0. Type-3 grammars define regular languages. They can be expressed with formal regular expressions and recognized with finite-state recognizers. Our Level Zero, Level One, and Level Two functionalities do not provide any additional power to recognize Type-2, Type-1, or Type-0 grammars.

[Chomsky–Schützenberger hierarchy]: https://en.wikipedia.org/wiki/Chomsky_hierarchyhttps://en.wikipedia.org/wiki/Chomsky_hierarchy

As we recall from [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata], languages like "balanced parentheses" are a Type-2 grammar, and cannot be recognized by a finite-state automata. Thus, features that some regexen provide like recursive regular expressions are beyond our levels.

[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html

In addition to features that enable regexen to recognize languages beyond the capabilities of finite-state recognizers, regexen also provide plenty of features for extracting match or partial match data, like capture groups. This functionality is also outside of our levels, as we are strictly concerned with recognizing sentences.

---

## Implementing Level One Features

As mentioned, the `?` and `+` operators from regexen can be implemented as "Level One" functionality. `a?` can be expressed as `ε|a`, and `a+` can be expressed as `aa*`.

The easiest way to implement these new operators is to write new operator functions. Let's begin by extending our existing operators:

```javascript
function dup (a) {
  const {
    start: oldStart,
    transitions: oldTransitions,
    accepting: oldAccepting,
    allStates
  } = validatedAndProcessed(a);

  const map = new Map(
    [...allStates].map(
      old => [old, names().next().value]
    )
  );

  const start = map.get(oldStart);
  const transitions =
    oldTransitions.map(
      ({ from, consume,  to }) => ({ from: map.get(from), consume, to: map.get(to) })
    );
  const accepting =
    oldAccepting.map(
      state => map.get(state)
    )

  return { start, transitions, accepting };
}

const extended = {
  operators: {

    // ...existing operators...

    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: a => union2merged(emptyString(), a)
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: a => catenation2(a, zeroOrMore(dup(a)))
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

verifyEvaluate('(R|r)eg(gie(e+!)?)?', extended, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});
  //=> All 7 tests passing
```

This is fine. It's only drawback is that our faith that we are not doing anything a regular expression couldn't do is based on carefully inspecting the functions we wrote (`a => union2merged(emptyString(), a)` and `catenation2(a, zeroOrMore(dup(a)))`) to ensure that we are replicating functionality that is baked into formal regular expressions.[^dup]

[^dup]: A more subtle issue is that all of our code for manipulating finite-state recognizers depends upon them having unique state names. Invoking `union2(a, a)` or `catenation2(a, a)` will not work properly because the names will clash. To make such expressions work, we have to make a duplicate of one of the arguments, e.g. `union2(a, dup(a))` or `catenation2(a, dup(a))`. In this case, we invoked `catenation2(a, zeroOrMore(dup(a)))`.<br/><br/>None of this is a consideration with our existing code, because it always generates brand new recognizers with unique states. But when we manually write our own expressions in JavaScript, we have to guard against name clashes by hand. Which is another argument against writing expressions in JavaScript. `aa` and `a|a` in a formal regular expression "just work." `union2(a, a)` and `catenation2(a, a)` don't.

But that isn't in the spirit of our work so far. What we are claiming is that for every regex containing the formal regular expression grammar plus the quantification operators `?` and `+`, there is an equivalent formal regular expression containing only the formal regular expression grammar.

Instead of appealing to intuition, instead of asking people to believe that `union2merged(emptyString(), a)` is equivalent to `ε|a`, what we ought to do is directly translate expressions containing `?` and/or `+` into formal regular expressions.

---

### implementing quantification operators with transpilation

We demonstrated that there is a finite-state recognizer for every formal regular expression by writing a function to compile formal regular expressions into finite-state recognizers. We will take the same approach of demonstrating that there is a Level Zero (a/k/a "formal") regular expression for every Level One (a/k/a extended) regular expression:

We'll write a function to compile Level One to Level Zero regular expressions. And we'll begin with our evaluator.

Recall that our basic evaluator can compile an infix expression into a postfix list of symbols, which it then evaluates. But it knows nothing about what its operators do. If we supply operators that perform arithmetic, we have a calculator. If we supply operators that create and combine finite-state recognizers, we have a regular-expression to finite-state recognizer compiler.

We can build a _transpiler_ exactly the same way: Use our evaluator, but supply a different set of operator definitions. We'll start by creating a transpiler that transpiles formal regular expressions to formal regular expressions. The way it will work is by assembling an expression in text instead of assembling a finite-state recognizer.

Here's the first crack at it:

```javascript
  function p (expr) {
    if (expr.length === 1) {
      return expr;
    } else if (expr[0] === '`') {
      return expr;
    } else if (expr[0] === '(' && expr[expr.length - 1] === ')') {
      return expr;
    } else {
      return `(${expr})`;
    }
  };

const toValueExpr = string => {
  if ('∅ε|→*()'.indexOf(string) >= 0) {
    return '`' + string;
  } else {
    return string;
  }
};

const transpile0to0 = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: () => '∅'
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: () => 'ε'
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: (a, b) => `${p(a)}|${p(b)}`
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: (a, b) => `${p(a)}→${p(b)}`
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}*`
    }
  },
  defaultOperator: '→',
  toValue: toValueExpr
};

const before = '(R|r)eg(ε|gie(ε|ee*!))';

verifyEvaluate(before, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});
  //=> All 7 tests passing

const after = evaluate(before, transpile0to0);

verifyEvaluate(after, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});
  //=> All 7 tests passing
```

The result has an excess of parentheses, and does not take advantage of catenation being the default, but it works just fine.

Extending it is now trivial:

```javascript
const transpile1to0q = {
  operators: {

    // ...as above...

    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: a => `ε|${p(a)}`
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}${p(a)}*`
    }
  },

  // ...
};

const beforeLevel1 = '(R|r)eg(gie(e+!)?)?';
const afterLevel1 = evaluate(beforeLevel1, transpile1to0q);
  //=> '(R|r)→(e→(g→(ε|(g→(i→(e→(ε|((ee*)→!))))))))'

verifyEvaluate(afterLevel1, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});
  //=> All 7 tests passing
```

Note that the postfix operators `?` and `+` are associated with functions that create formal regular expressions, rather than functions that manipulate finite-state recognizers.

---

### implementing the dot operator

Regexen provide a convenient shorthand--`.`--for an expression matching any one symbol. This is often used in conjunction with quantification, so `.?` is an expression matching zero or one symbols, `.+` is an expression matching one or more symbols, and `.*` is an expression matching zero or more symbols.

Implementing `.` is straightforward. All regular languages are associated with some kind of total alphabet representing all of the possible symbols in the language. Regexen have the idea of a total alphabet as well, but it's usually implied to be whatever the underlying platform supports as characters.

For our code, we need to make it explicit, for example:

```javascript
const ALPHA =
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '1234567890';
const PUNCTUATION =
  `~!@#$%^&*()_+=-\`-={}|[]\\:";'<>?,./`;
const WHITESPACE = ' \t\r\n';

const TOTAL_ALPHABET = ALPHA + DIGITS + PUNCTUATION + WHITESPACE;
```

What does the `.` represent? Any one of the characters in `TOTAL_ALPHABET`. We can implement that with alternation, like this:

```javascript
const dotExpr =
  TOTAL_ALPHABET.split('').join('|');

{
  operators: {

    // ...as above...

    '.': {
      symbol: Symbol('.'),
      type: 'atomic',
      fn: () => dotExpr
    }
  },

  // ...
};
```

There are, of course, more compact (and faster) ways to implement this if we were writing a regular expression engine from the ground up, but since the computer is doing all the work for us, let's carry on.

---

### implementing shorthand character classes

In addition to convenient operators like `?` and `+`, regexen also shorthand character classes--such as `\d`, `\w`, and `\s--to make regexen easy to write and read.

In regexen, instead of associating shorthand character classes with their own symbols, the regexen syntax overloads the escape character `\` so that it usually means "Match this character as a character, ignoring any special meaning," but sometimes--as with `\d`, `\w`, and with `\s`--it means "match this shorthand character class."

Fortunately, we left a back-door in our shunting yard function just for the purpose of overloading the escape character's behaviour. Here's the full definition:

```javascript
const UNDERSCORE ='_';

const digitsExpression =
  DIGITS.split('').join('|');
const wordExpression =
  (ALPHA + DIGITS + UNDERSCORE).split('').join('|');
const whitespaceExpression =
  WHITESPACE.split('').join('|');

const digitsSymbol = Symbol('`d');
const wordSymbol = Symbol('`w');
const whitespaceSymbol = Symbol('`s');

const transpile1to0qs = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: () => '∅'
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: () => 'ε'
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: (a, b) => `${p(a)}|${p(b)}`
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: (a, b) => `${p(a)}→${p(b)}`
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}*`
    },
    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: a => `ε|${p(a)}`
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}${p(a)}*`
    },
    '__DIGITS__': {
      symbol: digitsSymbol,
      type: 'atomic',
      fn: () => digitsExpression
    },
    '__WORD__': {
      symbol: wordSymbol,
      type: 'atomic',
      fn: () => wordExpression
    },
    '__WHITESPACE__': {
      symbol: whitespaceSymbol,
      type: 'atomic',
      fn: () => whitespaceExpression
    }
  },
  defaultOperator: '→',
  escapedValue (symbol) {
    if (symbol === 'd') {
      return digitsSymbol;
    } else if (symbol === 'w') {
      return wordSymbol;
    } else if (symbol === 's') {
      return whitespaceSymbol;
    } else {
      return symbol;
    }
  },
  toValue (string) {
    if ('∅ε|→*'.indexOf(string) >= 0) {
      return '`' + string;
    } else {
      return string;
    }
  }
};
```

As you can see, we don't allow writing one-symbol operators, but we do support using back-ticks with `d`, `w`, and `s` just like with regexen:

```javascript
const beforeLevel1qs = '((1( |-))?`d`d`d( |-))?`d`d`d( |-)`d`d`d`d';
const afterLevel1qs = evaluate(beforeLevel1qs, transpile1to0qs);

verifyEvaluate(afterLevel1qs, formalRegularExpressions, {
  '': false,
  '1234': false,
  '123 4567': true,
  '987-6543': true,
  '416-555-1234': true,
  '1 416-555-0123': true,
  '011-888-888-8888!': false
});
```

Excellent!

---

### thoughts about custom character classes

regexen allow users to define their own character classes "on the fly." In a regex, `[abc]` is an expression matching an `a`, a `b`, or a `c`. In that form, it means exactly the same thing as `(a|b|c)`. Custom character classes enable us to write `gr[ae]y` to match `grey` and `gray`, which saves us one character as compared to writing `gr(a|e)y`.

If that's all they did, they would add very little value: They're only slightly more compact, and they add the cognitive load of embedding an irregular kind of syntax inside of regular expressions.

But custom character classes add some other affordances. We can write `[a-f]` as a shorthand for `(a|b|c|d|e|f)`, or `[0-9]` as a shorthand for `(0|1|2|3|4|5|6|7|8|9)`. We can combine those affordances, e.g. we can write `[0-9a-fA-F]` as a shorthand for `(0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f|A|B|C|D|E|F)`. That is considerably more compact, and arguably communicates the intent of matching a hexadecimal character more cleanly.

And if we preface our custom character classes with a `^`, we can match a character that is not a member of the character class, e.g. `[^abc]` matches any character _except_ an `a`, `b`, or `c`. That can be enormously useful.

Custom character classes are a language within a language. However, implementing the full syntax would be a grand excursion into parsing the syntax, while the implementation of the character classes would not be particularly interesting. We will, however, be visiting the subject of negating expressions when we discuss level two functionality. We will develop an elegant way to achieve expressions like `[^abc]` with the syntax `^(a|b|c)`, and we'll also develop the `¬` prefix operator that will work with any expression.

---

### eschewing transpilation

There are lots of other regexen features we can implement using this transpilation technique,[^times] but having implemented a feature using transpilation, we've demonstrated that it provides not functional advantage over formal regular expressions. Having done so, we can return to implementing the features directly in JavaScript, which saves adding a transpilation step to our evaluator.

[^times]: If you feel like having a go at one more, try implementing another quantification operator, explicit repetition. In many regexen flavours, we can write `(expr){5}` to indicate we wish to match `(expr)(expr)(expr)(expr)(expr)`. The syntax allows other possibilities, such as `(expr){2,3}` and `(expr){3,}`, but ignoring those, the effect of `(expr){n}` for any `n` from 1 to 9 could be emulated with an infix operator, such as `⊗`, so that `(expr)⊗5` would be transpiled to `(expr)(expr)(expr)(expr)(expr)`.

So we'll wrap Level One up with:

```javascript
const zeroOrOne =
  a => union2merged(emptyString(), a);
const oneOrMore =
  a => catenation2(a, zeroOrMore(dup(a)));
const anySymbol =
  () => TOTAL_ALPHABET.split('').map(literal).reduce(union2merged);
const anyDigit =
  () => DIGITS.split('').map(literal).reduce(union2merged);
const anyWord =
  () => (ALPHA + DIGITS + UNDERSCORE).map(literal).reduce(union2merged);
const anyWhitespace =
  () => WHITESPACE.map(literal).reduce(union2merged);

const levelOneExpressions = {
  operators: {
    // formal regular expressions

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
    },

    // extended operators

    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: zeroOrOne
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: oneOrMore
    },
    '.': {
      symbol: Symbol('.'),
      type: 'atomic',
      fn: anySymbol
    },
    '__DIGITS__': {
      symbol: digitsSymbol,
      type: 'atomic',
      fn: anyDigit
    },
    '__WORD__': {
      symbol: wordSymbol,
      type: 'atomic',
      fn: anyWord
    },
    '__WHITESPACE__': {
      symbol: whitespaceSymbol,
      type: 'atomic',
      fn: anyWhitespace
    }
  },
  defaultOperator: '→',
  escapedValue (symbol) {
    if (symbol === 'd') {
      return digitsSymbol;
    } else if (symbol === 'w') {
      return wordSymbol;
    } else if (symbol === 's') {
      return whitespaceSymbol;
    } else {
      return symbol;
    }
  },
  toValue (string) {
    return literal(string);
  }
};
```

And now it's time to look at implementing Level Two features.

---

## Implementing Level Two Features

Let's turn our attention to extending regular expressions with features that cannot be implemented with simple transpilation. We begin by revisiting `union2`:

```javascript
function productOperation (a, b, setOperator) {
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

  const statesAAccepts = new Set(
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => P.stateFromSet(aAcceptingState, bState))
    )
  );
  const statesBAccepts = new Set(
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => P.stateFromSet(aState, bAcceptingState))
    )
  );

  const allAcceptingStates =
    [...setOperator(statesAAccepts, statesBAccepts)];

  const { stateSet: reachableStates } = validatedAndProcessed(productAB);
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}

function union2merged (a, b) {
  return mergeEquivalentStates(
    union2(a, b)
  );
}
```

We recall that the above code takes the product of two recognizers, and then computes the accepting states for the product from the union of the accepting states of the two recognizers.

Let's refactor, and extract the set union:

```javascript
function productOperation (a, b, setOperator) {
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
    [...setOperator(statesAAccepts, statesBAccepts)];

  const { stateSet: reachableStates } = validatedAndProcessed(productAB);
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}

function setUnion (set1, set2) {
  return new Set([...set1, ...set2]);
}

function unionMerged (a, b) {
  return mergeEquivalentStates(
    productOperation(a, b, setUnion)
  );
}
```

We'll create a new set union operator for this:

```javascript
const levelTwoExpressions = {
  operators: {

    // ... other operators from formal regular expressions ...

    '∪': {
      symbol: Symbol('∪'),
      type: 'infix',
      precedence: 10,
      fn: union
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

verifyEvaluate('(a|b|c)|(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'd': true
});
  //=> All 5 tests passing

verifyEvaluate('(a|b|c)∪(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'd': true
});
  //=> All 5 tests passing
```

It does exactly what our original `union2merged` function does, as we expect. But now that we've extracted the set *union* operation, what if we substitute a different set operation?

---

### intersection

```javascript
function setIntersection (set1, set2) {
  return new Set(
    [...set1].filter(
      element => set2.has(element)
    )
  );
}

function intersection (a, b) {
  return mergeEquivalentStates(
    productOperation(a, b, setIntersection)
  );
}

const levelTwoExpressions = {
  operators: {

    // ... other operators from formal regular expressions ...

    '∪': {
      symbol: Symbol('∪'),
      type: 'infix',
      precedence: 10,
      fn: union
    },
    '∩': {
      symbol: Symbol('∩'),
      type: 'infix',
      precedence: 10,
      fn: intersection
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

verifyEvaluate('(a|b|c)∩(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': false,
  'b': true,
  'c': true,
  'd': false
});
```

This is something new:

- If `a` is a regular expression describing the language `A`, and `b` is a regular expression describing the language `B`, the expression `a∩b` describes the language `Z` where a sentence `z` belongs to `Z` if and only if `z` belongs to `A`, and `z` belongs to `B`.

Intersection can be useful for writing expressions that separate concerns. For example, if we already have `0|1(0|1)*` as the expression for the language containing all binary numbers, and `.(..)*` as the expression for the language containing an odd number of symbols, then `(0|1(0|1)*)∩(.(..)*)` gives the the language containing all binary numbers with an odd number of digits.

---

### difference

Here's another:

```javascript
function setDifference (set1, set2) {
  return new Set(
    [...set1].filter(
      element => !set2.has(element)
    )
  );
}

function difference (a, b) {
  return mergeEquivalentStates(
    productOperation(a, b, setDifference)
  );
}

const levelTwoExpressions = {
  operators: {

    // ... other operators from formal regular expressions ...

    '∪': {
      symbol: Symbol('∪'),
      type: 'infix',
      precedence: 10,
      fn: union
    },
    '∩': {
      symbol: Symbol('∩'),
      type: 'infix',
      precedence: 10,
      fn: intersection
    },
    '\\': {
      symbol: Symbol('-'),
      type: 'infix',
      precedence: 10,
      fn: difference
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

verifyEvaluate('(a|b|c)\\(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': true,
  'b': false,
  'c': false,
  'd': false
});
```

`\` is the set difference, or [relative complement] operator:[^backslashbackslash]

[relative complement]: https://en.wikipedia.org/wiki/Complement_(set_theory)#Relative_complement

[^backslashbackslash]: Our source code uses a lot of double back-slashes, but this is an artefact of JavaScript the programming language using a backslash as its escape operator. The actual strings use a single backslash internally.

- If `a` is a regular expression describing the language `A`, and `b` is a regular expression describing the language `B`, the expression `a\b` describes the language `Z` where a sentence `z` belongs to `Z` if and only if `z` belongs to `A`, and `z` does not belong to `B`.

Where `intersection` was useful for separating concerns, `difference` is very useful for sentences that do not belong to a particular language. For example, We may want to match all sentences that contain the word "Braithwaite", but not "Reggie Braithwaite:"

```javascript
verifyEvaluate('.*Braithwaite.*\\.*Reggie Braithwaite.*', levelTwoExpressions, {
  'Braithwaite': true,
  'Reg Braithwaite': true,
  'The Reg Braithwaite!': true,
  'The Notorious Reggie Braithwaite': false,
  'Reggie, but not Braithwaite?': true,
  'Is Reggie a Braithwaite?': true
});

verifyEvaluate('(.*\\.*Reggie )(Braithwaite.*)', levelTwoExpressions, {
  'Braithwaite': true,
  'Reg Braithwaite': true,
  'The Reg Braithwaite!': true,
  'The Notorious Reggie Braithwaite': false,
  'Reggie, but not Braithwaite?': true,
  'Is Reggie a Braithwaite?': true
});
```

The second test above includes an interesting pattern.

---

### complement

If `s` is an expression, then `.*\s` is the [complement] of the expression `s`. In set theory, the complement of a set `S` is everything that does not belong to `S`. If we presume the existence of a universal set `U`, where `u` belongs to `U` for _any_ `u`, then the complement of a set `S` is the difference between `U` and `S`.

[complement]: https://en.wikipedia.org/wiki/Complement_(set_theory)

In sentences of symbols, if we have a total alphabet that we use to derive the dot operator `.`, then `.*` is an expression for every possible sentence, and `.*\s` is the difference between every possible sentence and the sentences in the language `S`. And  that is the complement of S.

We can implement `complement` as a prefix operator:

```javascript
const complement =
  s => difference(zeroOrMore(anySymbol()), s);

const levelTwoExpressions = {
  operators: {

    // ... other operators  ...

    '¬': {
      symbol: Symbol('¬'),
      type: 'prefix',
      precedence: 40,
      fn: complement
    }

  }

  // ... other definition ...

};

verifyEvaluate('¬(.*Reggie )Braithwaite.*', levelTwoExpressions, {
  'Braithwaite': true,
  'Reg Braithwaite': true,
  'The Reg Braithwaite!': true,
  'The Notorious Reggie Braithwaite': false,
  'Reggie, but not Braithwaite?': true,
  'Is Reggie a Braithwaite?': true
});
  //=> All 6 tests passing
```

`complement` can surprise the unwary. The expression `¬(.*Reggie )Braithwaite.*` matches strings containing `Braithwaite` but not `Reggie Braithwaite`. But if we expect `.*¬(Reggie )Braithwaite.*` to do the same thing, we'll be unpleasantly surprised:

```javascript
verifyEvaluate('.*¬(Reggie )Braithwaite.*', levelTwoExpressions, {
  'Braithwaite': true,
  'Reg Braithwaite': true,
  'The Reg Braithwaite!': true,
  'The Notorious Reggie Braithwaite': false,
  'Reggie, but not Braithwaite?': true,
  'Is Reggie a Braithwaite?': true
});
  //=> 1 tests failing: fail: {"example":"The Notorious Reggie Braithwaite","expected":false,"actual":true}
```

The reason this failed is because the three "clauses" of our level two regular expression matched something like the following:

1. `.*` matched `The Notorious Reggie `;
2. `¬(Reggie )` matched `''` (also known as `ε`);
3. `Braithwaite.*` matched `Braithwaite`.

That's why we need to write our clause as `¬(.* Reggie )` if we are trying to exclude the symbols `Reggie ` appearing just before `Braithwaite`. For similar reasons, the expression `¬(a|b|c)` is **not** equivalent to the `[^abc]` character class from regex syntax. Not only will the empty string match that expression, but so will strings longer than with more than one symbol.

If we want to emulate `[^abc]`, we want the intersection of `.`, which matches exactly one symbol, and `¬(a|b|c)`, which matches any expression except `a` or `b` or `c`.

We can represent `[^abc]` with `.∩¬(a|b|c)`:

```javascript
verifyEvaluate('.∩¬(a|b|c)', levelTwoExpressions, {
  '': false,
  'a': false,
  'b': false,
  'c': false,
  'd': true,
  'e': true,
  'f': true,
  'ab': false,
  'abc': false
});
  //=> All 9 tests passing
```

That's handy, so let's make it an operator:

```javascript
const characterComplement =
  s => intersection(anySymbol(), complement(s));

const levelTwoExpressions = {
  operators: {

    // ... other operators  ...

    '^': {
      symbol: Symbol('^'),
      type: 'prefix',
      precedence: 50,
      fn: characterComplement
    }

  }

  // ... other definition ...

};

verifyEvaluate('^(a|b|c)', levelTwoExpressions, {
  '': false,
  'a': false,
  'b': false,
  'c': false,
  'd': true,
  'e': true,
  'f': true,
  'ab': false,
  'abc': false
});
  //=> All 9 tests passing
```

The syntax `^(a|b|c)` is close enough to `[^abc]` for our purposes.

---

## What Level Two Features Tell Us, and What They Don't

The Level Two features we've implemented are useful, and they demonstrate some important results:

We already know that:

- if `x` is a finite state recognizer that recognizes sentences in the language `X`, and `y` is a finite-state recognizer that recognizes sentences in the language `Y`, there exists a finite-state recognizer `z` that recognizes sentences in the language `Z`, where a sentence `a` belongs to `Z` if and only if `a` belongs to either `X` or `Y`. We demonstrated this by writing functions like `union2` that take `x` and `y` as arguments and return `z`.
- if `x` is a finite state recognizer that recognizes sentences in the language `X`, and `y` is a finite-state recognizer that recognizes sentences in the language `Y`, there exists a finite-state recognizer `z` that recognizes sentences in the language `Z`, where a sentence `ab` belongs to `Z` if and only if `a` belongs to `X` and `b` belongs to `Y`. We demonstrated this by writing the function `catenation2` that takes `x` and `y` as arguments and returns `z`.
- if `x` is a finite state recognizer that recognizes sentences in the language `X`, there exists a finite-state recognizer `z` that recognizes sentences in the language `Z`, where a sentence `ab` belongs to `Z` if and only if `a` is either the empty string or a sentence belonging to `X, and `b` is a sentence belonging to `Z`. We demonstrated this by writing the function `zeroOrMore` that takes `x` as an argument and returns `z`.

These three results tell us that the set of finite-state recognizers is closed under alternation, catenation, and quantification.

Implementing our Level Two features has also demonstrated that:

- if `x` is a finite state recognizer that recognizes sentences in the language `X`, and `y` is a finite-state recognizer that recognizes sentences in the language `Y`, there exists a finite-state recognizer `z` that recognizes sentences in the language `Z`, where a sentence `a` belongs to `Z` if and only if `a` belongs to both `X` and `Y`. We demonstrated this by writing the function `intersection` that takes `x` and `y` as arguments and returns `z`.
- if `x` is a finite state recognizer that recognizes sentences in the language `X`, and `y` is a finite-state recognizer that recognizes sentences in the language `Y`, there exists a finite-state recognizer `z` that recognizes sentences in the language `Z`, where a sentence `a` belongs to `Z` if and only if `a` belongs to `X` and `a` does not belong to `Y`. We demonstrated this by writing the function `difference` that takes `x` and `y` as arguments and returns `z`.
- if `x` is a finite state recognizer that recognizes sentences in the language `X`, there exists a finite-state recognizer `z` that recognizes sentences in the language `Z`, where a sentence `a` belongs to `Z` if and only if `a` does not belong to `X. We demonstrated this by writing the function `complement` that takes `x` as an argument and returns `z`.

These three results also tell us that the set of finite-state recognizers is closed under intersection, difference, and complementation.

Writing Level Three features does come with a known limitation. Obviously, we can translate any Level Three regular expression into a finite-state recognizer. This tells us that the set of languages defined by Level Three regular expressions is a subset of the set of languages recognized by finte-state recognizers.

But what we don't know is whether the set of languages defined by Level Three regular expressions is a _equivalent to_ the set of languages defined by formal regular expressions. We don't have an algorithm for translating Level Three regular expressions to Level Zero regular expressions. Given what we have explored so far, it is possible that the set of languages recognized by finite-state recognizers is larger than the set of languages defined by formal regular expressions ("Level Zero").

If that were the case, it could be that some Level Three regular expression compiles to a finite-state recognizer, but there is no Level Zero expression that compiles to an equivalent finite-state recognizer.

How would we know if this were true?

With Level One expressions, we showed that for every Level One expression, there is an equivalent Level Zero expression by writing a Level One to Level Zero transpiler. With Level Two expressions, we'll take a different tack: We'll show that for **every** finite-state recognizer, there is an equivalent Level Zero expression.

If we know that for every finite-state recognizer, there is an equivalent Level Zero expression, and we also know that for every Level Zero expression, there is an equivalent finite-state recognizer, then we know that the set of languages recognized by finite-state recognizers is equal to the set of languages recognized by Level Zero expressions, a/k/a [Regular Languages].

And if we know that for every Level Two expression, there is an equivalent finite-state recognizer, then it would follow that for every Level two expression, there is an equivalent Level Zero expression, and it would follow that the set of all languages described by Level Two expressions is the set of regular languages.

---

# For Every Finite-State Recognizer, There Exists An Equivalent Formal Regular Expression

It is time to demonstrate that for every finite-state recognizer, there exists an equivalent formal regular expression. We're going to follow Stephen Kleene's marvellous proof, very much leaning on Shunichi Toida's excellent notes for [CS390 Introduction to Theoretical Computer Science Structures][CS390] The proof of this aspect of Kleene's Theorem can be found [here][CS390-2].

[CS390]: https://www.cs.odu.edu/~toida/courses/TE.CS390.13sp/index.html
[CS390-2]: https://www.cs.odu.edu/~toida/nerzic/390teched/regular/fa/kleene-2.html

Our [constructive proof]-like approach will be to write a function that takes as its argument a description of a finite-state recognizer, and returns an equivalent formal regular expression in our syntax. The approach will be an old one in computer science:

For any pair of states (_any_ par implies that both states could be the same state) in a finite-state recognizer, we will find all the paths from one to another, and for each path, we can write a regular expression representing that path using catenation. When we have more than one path between them, we can combine them together using alternation. We'll explain how quantification comes into that in a moment.

But if we had such a function, we could apply it to the start state and any accepting states, getting a formal regular expression for the paths from the start state to each accepting state. And if there are more than one accepting states, we could use alternation to combine the regular expressions into one big regular expression that is equivalent to the finite-state recognizer.

---

### the regularExpression function

Let's get started writing this in JavaScript. Given a description like:

```json
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

It will be a matter of finding the regular expressions for the paths from `start` to `zero`, and from `start to `notZero`, and taking the union of those paths. We're going to do that with a function we'll call `between`. Our function will take an argument for the state `from`, another for the state `to`, and a third argument called `viaStates` that we'll explain in a moment.[^nomenclature]

Note that `from`, `to`, and `via` can be _any_ of the states in the recognizer, including being the same state.

[^nomenclature]: In most proofs, this function is called `L`, and its arguments are called `p`, `q`, and `k`. One-character names are terrific when writing proofs by hand using chalk and a blackboard, but we've moved on since 1951 and we'll use descriptive names. Likewise, Kleene numbered the states in order to create an ordering that is easy to work with by hand. We'll work with sets instead of numbers, because once again, we have computers do do all the bookkeeping for us.

Here's an empty function for what we want to begin with:

```javascript
function regularExpression (description) {
  const pruned =
    reachableFromStart(
      mergeEquivalentStates(
        description
      )
    );
  const {
    start,
    transitions,
    accepting,
    stateSet
  } = validatedAndProcessed(pruned);

  // ...TBD

  function between ({ from, to, viaStates }) {
    // ... TBD
  }
};
```

Let's get the most degenerate case out of the way first. If a finite-state recognizer has no accepting states, then its formal regular expression is the empty set:

```javascript
function regularExpression (description) {
  const pruned =
    reachableFromStart(
      mergeEquivalentStates(
        description
      )
    );
  const {
    start,
    transitions,
    accepting,
    acceptingSet,
    stateSet
  } = validatedAndProcessed(pruned);

  if (accepting.length === 0) {
    return '∅';
  } else {
    // ...TBD

    function between ({ from, to, viaStates }) {
      // ... TBD
    }
  }
};

// ----------

verify(regularExpression, new Map([
  [emptySet(), '∅']
]));
```

Now what if there are accepting states? As described, the final regular expression must represent the union of all the expressions for getting from the start state to each accepting state. Let's fill that in for a moment, deliberately omitting `viaStates`:

```javascript
function alternateExpr(...exprs) {
  const uniques = [...new Set(exprs)];
  const notEmptySets = uniques.filter( x => x !== '∅' );

  if (notEmptySets.length === 0) {
    return '∅';
  } else if (notEmptySets.length === 1) {
    return notEmptySets[0];
  } else {
    return notEmptySets.map(p).join('|');
  }
}

function regularExpression (description) {
  const pruned =
    reachableFromStart(
      mergeEquivalentStates(
        description
      )
    );
  const {
    start,
    transitions,
    accepting,
    acceptingSet,
    stateSet
  } = validatedAndProcessed(pruned);

  if (accepting.length === 0) {
    return '∅';
  } else {
    const from = start;
    const pathExpressions =
      accepting.map(
        to => expression({ from, to })
      );

    const acceptsEmptyString = accepting.indexOf(start) >= 0;

    if (acceptsEmptyString) {
      return alternateExpr('ε', ...pathExpressions);
    } else {
      return alternateExpr(...pathExpressions);
    }

    function between ({ from, to, viaStates }) {
      // ... TBD
    }
  }
};
```

There's another special case thrown in: Although we haven't written our `between` function yet, we know that if a finite-state recognizer beins in an accepting state, then it accepts the empty string, and thus we can take all the other expressions for getting from a start state to an accepting state, and union them with `ε`.

Now how about the `between` function?

---

### the between function

The `between` function returns a formal regular expression representing all of the possible ways a finite-state recognizer can consume strings to get from the `from` state to the `to` state.

The way it works is to divide-and-conquer. We begin by choosing any state as the `via` state. We can divide up all the paths as follows:

1. All the paths from `from` to `to` that go through some state we shall call `via` least once, and;
2. All the paths from `from` to `to` that do not go through `via` at all.

If we could compute formal regular expressions for each of these two sets of paths, we could return the union of the two regular expressions and be done. So let's begin by picking a `viaState`. Kleene numbered the states and begin with the largest state, we will simply take whatever state is first in the `viaStates` set's enumeration:

```javascript
function between ({ from, to, viaStates = [...allStates] }) {
  if (viaStates.size === 0) {
    // .. TBD
  } else {
    const [via] = viaStates;

    // ... TBD
  }
}
```

We have left room for the degenerate case where `viaStates` is empty. We'll get to that in a moment. The first part of our case is to write an expression for all the paths from `from` to `to` that go through `via` at least once. Here's the formulation for that:

  1. The expression representing all the paths from `from` to `via` that do not go through `via`, catenated with;
  2. The expression representing all the paths from `via` looping back to `via` that do not go through `vi`, _repeated any number of times_, catenated with;
  3. The expression representing all the paths from `via` to `to` that do not go through `via`.

Our normal case is going to look something like this:

```javascript
function zeroOrMoreExpr (a) {
  if (a === '∅' || a === 'ε') {
    return 'ε';
  } else {
    return `${p(a)}*`;
  }
}

function catenateExpr (...exprs) {
  if (exprs.some( x => x === '∅' )) {
    return '∅';
  } else {
    const notEmptyStrings = exprs.filter( x => x !== 'ε' );

    if (notEmptyStrings.length === 0) {
      return 'ε';
    } else if (notEmptyStrings.length === 1) {
      return notEmptyStrings[0];
    } else {
      return notEmptyStrings.map(p).join('');
    }
  }
}

function between ({ from, to, viaStates = allStates }) {
  if (viaStates.size === 0) {
    // .. TBD
  } else {
    const [via] = viaStates;

    const fromToVia = expression({ from, to: via });
    const viaToVia = zeroOrMoreExpr(
      expression({ from: via, to: via })
    );
    const viaToTo = expression({ from: via, to, });

    const throughVia = catenateExpr(fromToVia, viaToVia, viaToTo);
  }
}
```

That being said, we have left out what to pass for `viaStates`. Well, we want our routine to do the computation for paths not passing through the state `via`, so we really want is all the remaining states _except_ `via`:

```javascript
function between ({ from, to, viaStates = [...allStates] }) {
  if (viaStates.length === 0) {
    // .. TBD
  } else {
    const [via, ...exceptVia] = viaStates;

    const fromToVia = expression({ from, to: via, viaStates: exceptVia });
    const viaToVia = zeroOrMoreExpr(
      expression({ from: via, to: via, viaStates: exceptVia })
    );
    const viaToTo = expression({ from: via, to, viaStates: exceptVia });

    const throughVia = catenateExpr(fromToVia, viaToVia, viaToTo);
  }
}
```

Now how about the second part of our case? It's the expression for all the paths from `from` to `to` that do not go through `via`. Which we then alternate with the expression for all the paths going through `via`:

```javascript
function between ({ from, to, viaStates = [...allStates] }) {
  if (viaStates.length === 0) {
    // .. TBD
  } else {
    const [via, ...exceptVia] = viaStates;

    const fromToVia = expression({ from, to: via, viaStates: exceptVia });
    const viaToVia = zeroOrMoreExpr(
      expression({ from: via, to: via, viaStates: exceptVia })
    );
    const viaToTo = expression({ from: via, to, viaStates: exceptVia });

    const throughVia = catenateExpr(fromToVia, viaToVia, viaToTo);
    const notThroughVia = expression({ from, to, viaStates: exceptVia });

    return alternateExpr(throughVia, notThroughVia);
  }
}
```

Eventually,[^eventually] this function will end up calling itself and passing an empty list of states. That's our degenerate case. Given two states, what are all the paths between them that don't go through any other states? Why, just the transitions directly between them. And the expressions for those are the symbols consumed, plus some allowance for symbols we have to escape.

[^eventually]: How eventually? With enough states in a recognizer, it could take a _very_ long time. This particular algorithm has exponential running time! But that being said, we are writing it to prove that it can be done, we don't actually need to do it to actually recognize sentences.

```javascript
function between ({ from, to, viaStates = [...allStates] }) {
  if (viaStates.length === 0) {
    const directExpressions =
      transitions
      .filter( ({ from: tFrom, to: tTo }) => from === tFrom && to === tTo )
      .map( ({ consume }) => toValueExpr(consume) );

    return alternateExpr(...directExpressions);
  } else {
    const [via, ...exceptVia] = viaStates;

    const fromToVia = expression({ from, to: via, viaStates: exceptVia });
    const viaToVia = zeroOrMoreExpr(
      expression({ from: via, to: via, viaStates: exceptVia })
    );
    const viaToTo = expression({ from: via, to, viaStates: exceptVia });

    const throughVia = catenateExpr(fromToVia, viaToVia, viaToTo);
    const notThroughVia = expression({ from, to, viaStates: exceptVia });

    return alternateExpr(throughVia, notThroughVia);
  }
}

const a = evaluate('a', formalRegularExpressions);

regularExpression(a)
  //=> ((((∅|a)∅∅)|∅)(((∅|a)∅∅)|∅)(((∅|a)∅∅)|(∅|a)))|(((∅|a)∅∅)|(∅|a))
```

This is a valid regular expression, but all the `∅`s make it unreadable. We're not going to get into functions for finding the minimal expression for a finite-state recognizer, but we can make things less ridiculous with five easy optimizations:

1. catenating any expression `a` with the empty set returns the empty set.
2. alternating any expression `a` with the empty set returns the expression `a`.
3. Repeating the empty zeroOrMore times returns the empty set.

```javascript
function alternateExpr(...exprs) {
  const uniques = [...new Set(exprs)];
  const notEmptySets = uniques.filter( x => x !== '∅' );

  if (notEmptySets.length === 0) {
    return '∅';
  } else if (notEmptySets.length === 1) {
    return notEmptySets[0];
  } else {
    return notEmptySets.map(p).join('|');
  }
}

function catenateExpr (...exprs) {
  if (exprs.some( x => x === '∅' )) {
    return '∅';
  } else {
    const notEmptyStrings = exprs.filter( x => x !== 'ε' );

    if (notEmptyStrings.length === 0) {
      return 'ε';
    } else if (notEmptyStrings.length === 1) {
      return notEmptyStrings[0];
    } else {
      return notEmptyStrings.map(p).join('');
    }
  }
}

function zeroOrMoreExpr (a) {
  if (a === '∅' || a === 'ε') {
    return 'ε';
  } else {
    return `${p(a)}*`;
  }
}

function regularExpression (description) {
  const pruned =
    reachableFromStart(
      mergeEquivalentStates(
        description
      )
    );
  const {
    start,
    transitions,
    accepting,
    allStates
  } = validatedAndProcessed(pruned);

  if (accepting.length === 0) {
    return '∅';
  } else {
    const from = start;
    const pathExpressions =
      accepting.map(
        to => expression({ from, to })
      );

    const acceptsEmptyString = accepting.indexOf(start) >= 0;

    if (acceptsEmptyString) {
      return alternateExpr('ε', ...pathExpressions);
    } else {
      return alternateExpr(...pathExpressions);
    }

    function between ({ from, to, viaStates = [...allStates] }) {
      if (viaStates.length === 0) {
        const directExpressions =
          transitions
          .filter( ({ from: tFrom, to: tTo }) => from === tFrom && to === tTo )
          .map( ({ consume }) => toValueExpr(consume) );

        return alternateExpr(...directExpressions);
      } else {
        const [via, ...exceptVia] = viaStates;

        const fromToVia = expression({ from, to: via, viaStates: exceptVia });
        const viaToVia = zeroOrMoreExpr(
          expression({ from: via, to: via, viaStates: exceptVia })
        );
        const viaToTo = expression({ from: via, to, viaStates: exceptVia });

        const throughVia = catenateExpr(fromToVia, viaToVia, viaToTo);
        const notThroughVia = expression({ from, to, viaStates: exceptVia });

        return alternateExpr(throughVia, notThroughVia);
      }
    }
  }
};
```

Done! Now let's look at what it does:

---

### using the regularExpression function

First, let's take an arbitrary finite-state recognizer, and convert it to a formal regular expression:

```javascript
regularExpression(binary)
  //=> 0|((1((0|1)*)(0|1))|1)
```

The result, `0|((1((0|1)*)(0|1))|1)`, isn't the most compact or readable regular expression, but if we look at it carefully, we can see that it produces the same result: It matches a zero, or a one, or a one followed by a either a zero or one followed by either a zero or one zero or more times. Basically, it's equivalent to `0|1|1(0|1)(0|1)*`. And `1|1(0|1)(0|1)*` is equivalent to `1(0|1)*`, so `0|((1((0|1)*)(0|1))|1)` is equivalent to `0|1(0|1)*`.

Let's check it:

```javascript
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

const reconstitutedBinaryExpr = regularExpression(binary);
  //=> 0|((1((0|1)*)(0|1))|1)

verifyEvaluate(reconstitutedBinaryExpr, formalRegularExpressions, {
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

`0|((1((0|1)*)(0|1))|1)` may be a fugly way to describe binary numbers, but it is equivalent to `0|1(0|1)*`, and what counts is that for any finite-state recognizer, our function finds an equivalent formal regular expression. And if we know that for every finite-state recognizer, there is an equivalent formal-state recognizer, then we now have a universal demonstration that our Level One and Level Two features describe regular languages just like formal regular expressions. This is true even if--like our Level Two features--there is no obvious and direct translation to a formal regular expression.

However, testing `binary` doesn't actually demonstrate that the finite-state recognizer produced by compiling a Level Two expression to a finite-state recognizer can be compiled back to an equivalent finite-state recognizer. We already know that binary numbers is a regular language. So let's try our function with some level two examples.

---

### a test suite for  the regularExpression function

We can check a few more results to give us confidence. But instead of reasoning through each one, we'll check the equivalence using test cases. What we'll do is take a regular expression and run it through test cases. Then we'll evaluate it to produce a finite-state recognizer, translate the finite-state recognizer to a formal regular expression with `regularExpression`, and run it through the same text cases again.

If all the tests pass, we'll declare that our `regularExpression` function does indeed demonstrate that there is an equivalent formal regular expression for every finite-state recognizer. Here's our test function, and an example of trying it with `0|1(0|1)*`:

```javascript
function verifyRegularExpression (expression, tests) {
  const recognizer = evaluate(expression, levelTwoExpressions);

  verifyRecognizer(recognizer, tests);

  const formalExpression = regularExpression(recognizer);

  verifyEvaluate(formalExpression, formalRegularExpressions, tests);
}

verifyRegularExpression('0|1(0|1)*', {
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
```

And now to try it with some Level Two examples:

```javascript

verifyRegularExpression('(a|b|c)∪(b|c|d)', {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'd': true
});

verifyRegularExpression('(ab|bc|cd)∪(bc|cd|de)', {
  '': false,
  'ab': true,
  'bc': true,
  'cd': true,
  'de': true
});

verifyRegularExpression('(a|b|c)∩(b|c|d)', {
  '': false,
  'a': false,
  'b': true,
  'c': true,
  'd': false
});

verifyRegularExpression('(ab|bc|cd)∩(bc|cd|de)', {
  '': false,
  'ab': false,
  'bc': true,
  'cd': true,
  'de': false
});

verifyRegularExpression('(a|b|c)\\(b|c|d)', {
  '': false,
  'a': true,
  'b': false,
  'c': false,
  'd': false
});

verifyRegularExpression('(ab|bc|cd)\\(bc|cd|de)', {
  '': false,
  'ab': true,
  'bc': false,
  'cd': false,
  'de': false
});
```

Success! There is an equivalent formal regular expression for the finite-state recognizers we generate with our Level Two features.

---

### conclusion

We have now demonstrated, in constructive fashion, that for every finite-state recognizer, there is an equivalent formal regular expression.

This implies several important things. First and foremost, since we have also established that for every formal regular expression, there is an equivalent finite-state recognizer, we now know that **The set of languages described by formal regular expressions--regular languages--is identical to the set of languages recognized by finite-state automata.** Finite-state automata recognize regular languages, and regular languages can be recognized by finite-state automata.

Second, if we devise any arbitrary extension to formal regular languages--or even an entirely new kind of language, and we also devise a way to  compile such descriptions to finite-state recognizers, then we know that the languages we can describe with these extensions or languages are still regular languages.

Although we are not emphasizing performance, we also know that sentences in any such extensions or languages we may care to create can still be recognized in at worst linear time, because finite-state recognizers recognize sentences in at worst linear time.

(discuss on [Hacker News](https://news.ycombinator.com/item?id=23403974))

[Kleene Star]: https://en.wikipedia.org/wiki/Kleene_star
[Shunting Yard Algorithm]: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
[powerset]: https://en.wikipedia.org/wiki/Power_set
[postfix notation]: https://en.wikipedia.org/wiki/Reverse_Polish_notation
[stack machine]: https://en.wikipedia.org/wiki/Stack_machine

---

# Notes