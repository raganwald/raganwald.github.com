

---

## The set of finite-state recognizers is closed under union, catenation, and kleene*

To summarize what we have accomplished so far:

We wrote what we might call _finite-state recognizer combinators_, functions that take one or more finite-state recognizers as arguments, and return a finite-state recognizer. The combinators we've written so far implement the operations `union`, `catenation`, `intersection`, and `kleene*`.

There is a set of all finite-state recognizers, and a corresponding set of all descriptions of finite-state recognizers. Each one of our combinators takes one or more members of the set of all descriptions of finite-state recognizers and returns a member of the set of all descriptions of finite-state recognizers.

When we have a set, and an operation on members of that set always returns a member of that set, we say that "The set is closed under that operation." We can thus say that the set of all descriptions of finite-state recognizers is closed under the operation of applying the `union`, `catenation`, `intersection`, and `kleeneStar` functions we've written.

And by induction, we can then say that the set of languages that finite-state recognizers can recognize is closed under the operations `union`, `catenation`, and `kleene*`. (We can _also_ say that they are closed under `intersection`, an operation we defined but that isn't used in formal regular expressions.)

And there are other operations that we haven't explored yet--like  `kleene+`, `optional`, `complementation`, `difference`, and `xor`--and the set of all languages is closed under those operations as well.

This property of "languages that finite-state recognizers can recognize being closed under the operations `union`, `catenation`, and `kleene*`" will come in very handy below when we show that for every formal regular expression, there is an equivalent finite-state recognizer.

But all we've talked about are combinators, operations that build finite-state recognizers out of finite-state recognizers. What about building finite-state recognizers from nothing at all?

---

### any

As we know from the implementation, `just` takes a string, and generating the `catenation` of recognizers for the symbols in the string. What else could we do with the recognizers for the symbols in a string?

We could take their `intersection`, but unless there was only one symbol, that wouldn't help. What about taking their union?

```javascript
function any (str = "") {
  const recognizers = str.split('').map(literal);

  return union(...recognizers);
}

verify(any('r'), {
  '': false,
  'r': true,
  'reg': false
});
  //=> All 3 tests passing

const capitalArrReg = catenation(any('Rr'), just('eg'));

verify(capitalArrReg, {
  '': false,
  'r': false,
  'R': false,
  'reg': true,
  'Reg': true,
  'REG': false,
  'Reginald': false
});
  //=> All 7 tests passing
```

`any` generates a recognizer that recognizes any of the symbols in the strings we pass it. This is extremely useful, and regexen have an affordance for easily recognizing one of a set of symbols, `[]`. If we want to represent, say, the letter `x`, `y`, or `z`, we can write `/^[xyz]$/`, and this will recognize a single `x`, a single `y`, or a single `z`. There are some other useful affordances, such as `[a-z]` matching any letter from `a` through `z` inclusively, but at its most basic level, `/^[xyz]$/` works just like `any('xyz)`:

```javascript
verify(/^[xyz]$/, {
  '': false,
  'x': true,
  'y': true,
  'z': true,
  'xyz': false
});
  //=> All 5 tests passing
```

Before we move on to decorators, let's think about another regexen feature. One of the affordances of regexen is that we can use a `.` to represent any character, any character at all:

```javascript
verify(/^.$/, {
  '': false,
  'a': true,
  'b': true,
  'x': true,
  'y': true,
  'xyz': false
});
  //=> All 6 tests passing
```

This is easy to implement when writing a regex engine, but there's no such capability in a standard finite-state machine. What we can do, with complete disregard for the size of the finite-state recognizers we create, is _emulate_ the `.` by supplying a string containing every character we care about:

```javascript
const ALPHANUMERIC =
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '1234567890';

const anyAlphaNumeric = any(ALPHANUMERIC);

const rSomethingG = catenation(any('Rr'), anyAlphaNumeric, any('Gg'));

verify(rSomethingG, {
  '': false,
  'r': false,
  're': false,
  'Reg': true,
  'Rog': true,
  'RYG': true,
  'Rej': false
});
  //=> All 7 tests passing

```

Our `anyAlphaNumeric` uses `any` to emulate the `.` for a small subset of possible characters.
---

### none

As we saw, regexen have an affordance for recognizing any of a set of symbols, `[]`. For example, `/^[xyz]$/` matches an `x`, `y`, or `z`. Regexen's `[]` also have another affordance: If we write `/^[^xyz]$/`, this matches any single character *except* an `x`, `y`, or `z`:

```javascript
verify(/^[^xyz]$/, {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'x': false,
  'y': false,
  'z': false,
  'abc': false,
  'xyz': false
});
  //=> All nine test passing
```

Two observations of note: First, in regexen, `^` sometimes means "anchor this expression at the beginning of the string," and it sometimes means "match any character except these."[^inertia] Second, `[^xyz]` matches just a single character that is not an `x`, `y`, or `z`, so `/^[^xyz]$/` does not match the string `'abc'`.

[^inertia]: Using one operator to mean two completely unrelated things is now understood to be a poor design practice, but in programming languages, old ideas have an enormous amount of inertia. Most of our programming languages seem to be rooted in the paradigm of encoding programs on 80 column punch cards.

Here's a modification of our `any` inessential, but useful tool:

```javascript
function none (alphabet, string) {
  const exclusionSet = new Set([...string.split('')]);
  const inclusionList = alphabet.split('').filter(c => !exclusionSet.has(c));
  const inclusionString = inclusionList.join('');

  return any(inclusionString);
}

verify(none(ALPHANUMERIC, 'xyz'), {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'x': false,
  'y': false,
  'z': false,
  'abc': false,
  'xyz': false
});
  //=> All 9 tests passing
```

`none` will be especially handy for building a recognizer that recognizes descriptions of recognizers. For example, one of the earliest programming languages to incorporate string pattern matching was [SNOBOL]. Like JavaScript, string literals could be delimited with single or double quotes, but there was no syntax for "escaping" quotes.

[SNOBOL]: http://www.snobol4.org

So if you wanted a string literal containing a single quote, you'd delimit it with double quotes:

```
doubleQuotedString = "This string's delimiters are double quotes"
```

And if you wanted a string literal containing double quotes, you'd delimit it with single quotes:

```
singleQuotedString = 'For so-called "scare quotes," modern culture is to use ✌🏽peace emoji✌🏽.'
```

JavaScript works like this today, although it also adds escape characters. But sticking to SNOBOL-style string literals for the moment, we can implement a recognizer for string literals with `none`:

```javascript
const SYMBOLIC = `~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`;
const WHITESPACE = ` \r\n\t`;
const EVERYTHING = ALPHANUMERIC + SYMBOLIC + WHITESPACE;
const sQuote = just("'");
const dQuote = just('"');

const sQuotedString = catenation(
  sQuote,
  kleeneStar(none(EVERYTHING, "'")),
  sQuote
);

const dQuotedString = catenation(
  dQuote,
  kleeneStar(none(EVERYTHING, '"')),
  dQuote
);

const stringLiteral = union(
  sQuotedString,
  dQuotedString
);

verify(stringLiteral, {
  [``]: false,
  [`'`]: false,
  [`"`]: false,
  [`''`]: true,
  [`""`]: true,
  [`"""`]: false,
  [`""""`]: false,
  [`"Hello, recognizer"`]: true
});
```

`none` may be "inessential," but `none` is certainly handy.

---

# Generating finite-state recognizers from formal regular expressions

Let us consider `union`, `catenation`, `kleene*`, `EMPTY_SET`, `EMPTY_STRING`, and `literal` for a moment. These have a one-to-one correspondance with the operations in formal regular expressions. And in fact, it's pretty easy to translate any formal regular expression into an equivalent JavaScript expression using our functions and constants.

For example:

- `∅` becomes `EMPTY_SET`
- `0` (or any single character) becomes `literal('0')`
- `a|b` (or any two expressions) becomes `union(a, b)`
- `xyz` (or any string of characters) becomes `catenation(just('x'), just('y'), just('z'))`
- `a*` (or any expresion followed by an `*`) becomes `kleeneStar(literal('a'))`

The parentheses in JavaScript work just like the parentheses in formal regular expressions, so by carefully following the above rules, we can turn any arbitrary formal regular expression into a JavaScript expression.

For example, the formal regular expression `0|(1(0|1)*)` becomes:

```javascript
const binary2 = union(literal('0'), catenation(literal('1'), kleeneStar(union(just('0'), just('1')))));

binary2
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "0", "to": "recognized" },
        { "from": "empty", "consume": "1", "to": "recognized-2" },
        { "from": "recognized-2", "to": "recognized-2", "consume": "0" },
        { "from": "recognized-2", "to": "recognized-2", "consume": "1" }
      ],
      "accepting": [ "recognized", "recognized-2" ]
    }

verify(binary2, {
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

And the formal expression `reg(ε|inald)` becomes:

```javascript
const regMaybeInald = catenation(
  just('r'),
  just('e'),
  just('g'),
  union(
    EMPTY_STRING,
    catenation(
      just('i'),
      just('n'),
      just('a'),
      just('l'),
      just('d')
    )
  )
);

regMaybeInald
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "r", "to": "recognized" },
        { "from": "recognized", "consume": "e", "to": "recognized-2" },
        { "from": "recognized-2", "consume": "g", "to": "recognized-3" },
        { "from": "recognized-3", "consume": "i", "to": "recognized-4" },
        { "from": "recognized-4", "to": "recognized-5", "consume": "n" },
        { "from": "recognized-5", "to": "recognized-6", "consume": "a" },
        { "from": "recognized-6", "to": "recognized-7", "consume": "l" },
        { "from": "recognized-7", "to": "recognized-8", "consume": "d" }
      ],
      "accepting": [ "recognized-8", "recognized-3" ]
    }

verify(regMaybeInald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});
  //=> All 6 tests passing
```

Given that we can express any formal regular expression as a JavaScript expression that generates an equivalent finite-state recognizer, we have a weak demonstration that for every formal regular expression, there is an equivalent finite-state recognizer.

But our emphasis is on algorithms a computer can execute, so let's write an algorithm that does exactly that.

---

### the shunting yard algorithm

The [Shunting Yard Algorithm] is a method for parsing mathematical expressions specified in infix notation with parentheses. As we implement it here, it will produce a postfix (a/k/a "Reverse Polish) notation without parentheses. The shunting yard algorithm was invented by Edsger Dijkstra and named the "shunting yard" algorithm because its operation resembles that of a railroad shunting yard.

[Shunting Yard Algorithm]: https://en.wikipedia.org/wiki/Shunting-yard_algorithm

The shunting yard algorithm is stack-based. Infix expressions are the form of mathematical notation most people are used to, for instance `3 + 4` or `3 + 4 × (2 − 1)`. For the conversion there are two lists, the input and the output. There is also a stack that holds operators not yet added to the output queue. To convert, the program reads each symbol in order and does something based on that symbol. The result for the above examples would be (in Reverse Polish notation) `3 4 +` and `3 4 2 1 − × +`, respectively.

![The Shunting Yard Algorithm © Salix alba](/assets/images/fsa/Shunting_yard.svg.png)

Our first iteration of a shunting yard algorithm makes two important simplifying assumptions. The first is that it does not handle parentheses. The second is that it does not catenate adjacent expressions, it uses a `→` symbol to represent catenation:

```javascript
const operatorToPrecedence = new Map(
  Object.entries({
    '|': 1,
    '→': 2,
    '*': 3
  })
);

function peek (stack) {
  return stack[stack.length - 1];
}

function shuntingYardVersion1 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];

  for (const symbol of input) {
    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const opPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(op);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
    } else {
      outputQueue.push(symbol);
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    outputQueue.push(op);
  }

  return outputQueue;
}

shuntingYardVersion1('a→b*|a*→b')
  //=> ["a", "b", "*", "→", "a", "*", "b", "→", "|"]
```

Now we'll add an adjustment so that we don't need to explicitly include `→` for catenation. What we'll do is keep track of whether we are awaiting a value. If we are, then values get pushed directly to the output queue as usual. But if we aren't awaiting a value, then we implicitly add the `→` operator:

```javascript
const binaryOperators = new Set(['→', '|']);

function shuntingYardVersion2 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const opPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(op);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    outputQueue.push(op);
  }

  return outputQueue;
}

shuntingYardVersion2('ab*|a*b')
  //=> ["a", "b", "*", "→", "a", "*", "b", "→", "|"]
```

Finally, we add support for parentheses. If we encounter a left parentheses, we push it on the operator stack. When we encounter a right parentheses, we clear the operator stack onto the output queue up to the topmost left parentheses. With respect to implicit catenation, parentheses act like values:

```javascript
function shuntingYardVersion3 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
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
      // implicit catenation

      input.unshift(symbol);
      input.unshift('∩');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const op = operatorStack.pop();

        outputQueue.push(op);
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(op);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    outputQueue.push(op);
  }

  return outputQueue;
}

shuntingYardVersion3('a→(b*|a*)→b')
  //=> ["a", "b", "*", "a", "*", "|", "b", "→", "+"]

shuntingYardVersion3('((a|b)(c|d))')
  //=> [["a", "b", "|", "c", "d", "|", "→"]
```

Our `shuntingYard3` algorithm returns a version of the formal regular expression, but in reverse-polish notation. Now we have actually left something incredibly important things out of this algorithm. They aren't strictly necessary to demonstrate that for every formal regular expression, there is an equivalent finite-state recognizer, but still.

We'll fix that omission and clean up a few of the data structures we used so that everything is unified and ready to write an interpreter. Note that all special operators are now represented as instances of `Symbol`, and they each have a function tha the interpreter will use to resolve them:

```javascript
const formalOperators = new Map(
  Object.entries({
    '∅': { symbol: Symbol('∅'), precedence: 99, arity: 0, fn: emptySet },
    'ε': { symbol: Symbol('ε'), precedence: 99, arity: 0, fn: emptyString },
    '|': { symbol: Symbol('|'), precedence: 1, arity: 2, fn: union },
    '→': { symbol: Symbol('→'), precedence: 2, arity: 2, fn: catenation },
    '*': { symbol: Symbol('*'), precedence: 3, arity: 1, fn: kleeneStar }
  })
);

function basicShuntingYard (formalRegularExpressionString, operators = formalOperators) {
  const valueOf =
    something => {
      if (operators.has(something)) {
        const { symbol, arity } = operators.get(something);

        return symbol;
      } else if (typeof something === 'string') {
        return something;
      } else {
        error(`${something} is not a value`);
      }
    };
  const isCombinator =
    symbol => operators.has(symbol) && operators.get(symbol).arity > 0;
  const isBinaryCombinator =
    symbol => operators.has(symbol) && operators.get(symbol).arity === 2;

  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '\\') {
      if (input.length === 0) {
        error('Escape character has nothing to follow');
      } else {
        const valueSymbol = input.shift();

        // treat this new symbol as a value,
        // no matter what
        if (awaitingValue) {
          // push the string value of the valueSymbol
          // do not use valueOf

          outputQueue.push(valueSymbol);
          awaitingValue = false;
        } else {
          // implicit catenation

          input.unshift(valueSymbol);
          input.unshift('\\');
          input.unshift('->');
          awaitingValue = false;
        }

      }
    } else if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const op = operatorStack.pop();

        outputQueue.push(valueOf(op));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isCombinator(symbol)) {
      const { arity, precedence } = operators.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (arity > 0 && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operators.get(peek(operatorStack)).precedence;

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(valueOf(op));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = isBinaryCombinator(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(valueOf(symbol));
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    if (operators.has(op)) {
      const { symbol: opSymbol } = operators.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}
```

Now we push JavaScript Symbols for operators instead of strings. This allows us to "escape" characters like `()\|*` in our expressions:

```javascript
basicShuntingYard('((a|b)(c|d))')
  //=> ["a", "b", Symbol(|), "c", "d", Symbol(|), Symbol(→)]

basicShuntingYard('\\(\\*|\\)')
  //=> ["(", "*", Symbol(→), ")", Symbol(|)]
```

### generating finite-state recognizers

We're ready to compile the reverse-polish notation into a description, using our implementations of `literal`, `union`, `catenation`, and `kleene*`. We'll do it with a stack-based interpreter:

```javascript
function rpnToDescription (rpn, operators = formalOperators) {
  const symbols = new Map(
    [...operators.entries()].map(
      ([key, { symbol, arity, fn }]) => [symbol, { arity, fn }]
    )
  );

  if (rpn.length === 0) {
    return EMPTY_SET;
  } else {
    const stack = [];

    for (const element of rpn) {
      if (typeof element === 'string') {
        stack.push(literal(element));
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
    if (stack.length != 1) {
      error(`should only be one value to return, but there were ${stack.length}`);
    } else {
      return stack[0];
    }
  }
}

function toFiniteStateRecognizer (formalRegularExpression, operators = formalOperators) {
  return rpnToDescription(
    basicShuntingYard(formalRegularExpression, operators),
    operators
  );
}

toFiniteStateRecognizer('0|(1(0|1)*)')
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "0", "to": "recognized" },
        { "from": "empty", "consume": "1", "to": "recognized-2" },
        { "from": "recognized-2", "to": "recognized-2", "consume": "0" },
        { "from": "recognized-2", "to": "recognized-2", "consume": "1" }
      ],
      "accepting": [ "recognized", "recognized-2" ]
    }
```

And we can validate that our recognizers work as expected:

```javascript
verify(toFiniteStateRecognizer(''), {
  '': false,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('ε'), {
  '': true,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0*'), {
  '': true,
  '0': true,
  '1': false,
  '00': true,
  '01': false,
  '10': false,
  '11': false,
  '000': true,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0|(1(0|1)*)'), {
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
  '111': true
});
```

This demonstrates that **for every formal regular expression, there exists an equivalent finite-state recognizer**.

---

## For every formal regular expression, there exists an equivalent finite-state recognizer

Given that we know that for every formal regular expression, there is at least one finite-state recognizer that recognizes the same language as the regular expression, we know that finite-state recognizers are at least as powerful as formal regular expressions.

There are practical implications as well. We've already shown that for every finite-state recognizer, there exists an equivalent deterministic finite-state recognizer, and have an algorithm --`powerset`--that returns a deterministic finite-state recognizer given any finite-state recognizer.

Deterministic finite-state recognizers are fast: They trade space for time, executing in O_n_ time. And although they take up more space for their descriptions, by not engaging in backtracking or parallel execution, they generate fewer temporary entities. We haven't attempted to optimize for pure speed, but finite-state recognizers can be written to be blazingly fast. They can even be compiled down to languages like JavaScript, C++, or even assembler.

Being able to "compile" formal regular expressions into finite-sate recognizers points the way towards approaches for writing very fast pattern-matching engines.

---

## Every regular language can be recognized by a finite-state recognizer

Recall that the set of languages described by a formal regular expression is called the set of _regular languages_. Since we know that for every formal regular expression, there exists a deterministic finite-state recognizer that recognizes sentences in that regular expression's language, we know that every regular language can be recognized by a finite-state recognizer.

---

# Enhancing our regular expressions

*Formal* regular expressions consist of characters, parentheses, the union operator (either `|` or `∪` depending upon dialect), and the kleene star (`*`). Meanwhile regexen have evolved a veritable riot of affordances for describing languages they recognize, including the kleene plus (`+`), optional (`?`), character classes (such as `\d` and `\s`), and character specifications (such as `[xyz]` and its inverse, `[^abc]`).

While they have no effect on the power of regular expressions, additional affordances make regular expressions more convenient to write, and easier to read. Before we get started, let's review the rules our dialect of formal regular expressions follow:

- `∅` is a regular expression denoting the language comprised of the empty set.
- `ε` is a regular expression denoting the language comprised of a single sentence, the empty string.
- `\x` is a regular expression denoting the language comprised of a single sentence, which contains a single character, `x`. Any other character, including `\`, can be substituted for `x`.
- `a|b` is a regular expression denoting the language comprised of the union of the set of languages denoted by `a`, and the set of languages denoted by `b`.
- `p+q` is a regular expression denoting the language comprised of the catenation of the set of languages denoted by `p`, and the set of languages denoted by `q`.
- `xy` is also a regular expression denoting the language comprised of the catenation of the set of languages denoted by `x`, and the set of languages denoted by `y`.
- `z*` is a regular expression denoting the language comprised of the catenation of zero or more sentences belonging to the language denoted by `z`.

Onwards!

---

### `kleene+`

Like formal regular expressions, regexen have a postfix `*` character to represent `kleene*`. But unlike formal regular expressions, regexen also support a postfix `+` to represent the `kleene+` operator that matches _one_ or more instances of its argument:

```javascript
verify(/^[Aa]+$/, {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 9 tests passing
```

We can make  a `kleene+` decorator using the tools we already have:

```javascript
function kleenePlus (description) {
  return catenation(description, kleeneStar(description));
}

kleenePlus(Aa)
  //=>
    {
      "start": "empty",
      "transitions": [
        { "from": "empty", "consume": "a", "to": "recognized" },
        { "from": "empty", "consume": "A", "to": "recognized" },
        { "from": "recognized", "consume": "a", "to": "recognized" },
        { "from": "recognized", "consume": "A", "to": "recognized" }
      ],
      "accepting": [ "recognized" ]
    }

verify(kleenePlus(any('Aa')), {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a kleene*': false,
  'eh?': false
});
  //=> All 9 tests passing
```

Formal regular expressions don't normally include the `kleene+`, because given catenation and `kleene*`, `kleene+` is not necessary. When proving things about formal languages, working with the minimum set of entities makes everything easier.

But programming is all about defining convenient things out of necessary things, that is why regexen provide the `+`, and that is why we'll add it to our own regular expressions:

```javascript
const operators2 = new Map(
  [...formalOperators.entries()].concat([
    ['+', { symbol: Symbol('+'), precedence: 3, arity: 1, fn: kleenePlus }]
  ])
);

const oneOrMoreAs = toFiniteStateRecognizer('(a|A)+', operators2);

verify(oneOrMoreAs, {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});
  //=> All 9 tests passing
```

Now we can add a new "rule:"

- `w+` is a regular expression denoting the language comprised of the catenation of one or more sentences belonging to the language denoted by `w`.

And because our `kleene*` uses `catenation` and `kleene*`, and because we've already established that the set of regular expressions is closed under `catenation` and `kleene*`, we know that the set of regular expressions is closed under `kleene+`, too.

In other words, our new "rule" isn't really changing the behaviour of regular expressions, it's simply documenting behaviour we already established with the rules for formal regular expressions.

---

### optional

Following the exact same reasoning, we can add another affordance from regexen, the `?` postfix operator, which represents zero-or-one just as `*` represents zero-or-more and `+` represents one-or-more.

Our new "rule" will be:

- `v?` is a regular expression denoting the language comprised of the union of the languages `ε` and `v`.

Of course, it's not adding anything new, since our implementation makes use of the `union` and `EMPTY_SET` entities we've already defined:

```javascript
function optional (description) {
  return union(EMPTY_STRING, description);
}

const operators3 = new Map(
  [...formalOperators.entries()].concat([
    ['?', { symbol: Symbol('?'), precedence: 3, arity: 1, fn: optional }]
  ])
);

const regMaybeReginald = toFiniteStateRecognizer('reg(inald)?', operators3);

verify(regMaybeReginald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});
  //=> All 6 tests passing
```

---

### dot

The dot, or `.` is an extremely useful affordance for matching "any character." It adds this rule to our list:

- `.` is a regular expression denoting the language comprised of a single sentence, which contains any single character from a fixed alphabet of characters.

As noted when discussing [any](#any), we can build it provided we have an explicit alphabet for all the sentences we wish to match:

```javascript
const SYMBOLIC = `~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`;
const WHITESPACE = ` \r\n\t`;
const EVERYTHING = any(ALPHANUMERIC + SYMBOLIC + WHITESPACE);

const operatorsWithDot = new Map(
  [...formalOperators.entries()].concat([
    ['.', { symbol: Symbol('.'), precedence: 99, arity: 0, fn: () => EVERYTHING }]
  ])
);

const oddLength = toFiniteStateRecognizer('.(..)*', operatorsWithDot);

verify(oddLength, {
  '': false,
  'a': true,
  'ab': false,
  '_a_': true,
  '()()': false,
  '     ': true
});
  //=> All 6 tests passing
```

We also defined the `intersection` function. Let's add it as well, we'll associate it with the `&` operator:

### intersection

Many regexen dialects support intersection in character classes. We're not going to get into that, as character classes form a little mini-language embedded within regexen, and we want to focus on regular expressions. So our `intersection` syntax will denote the intersection between any two regular expressions. Here's the new rule:

- `a&b` is a regular expression denoting the language comprised of the intersection of the set of languages denoted by `a`, and the set of languages denoted by `b`.

As we have already written `intersection`, implementing this new feature is as easy as adding a new operator, `∩`. It will have the same precedence as `|`.

This allows us to do things like create extended regular expressions that match a binary number with an odd number of digits:

```javascript
const withDotAndIntersection = new Map(
  [...formalOperators.entries()].concat([
    ['.', { symbol: Symbol('.'), precedence: 99, arity: 0, fn: () => EVERYTHING }],
    ['∩', { symbol: Symbol('∩'), precedence: 99, arity: 2, fn: intersection }]
  ])
);

const oddBinary = toFiniteStateRecognizer('(0|(1(0|1)*))∩(.(..)*)', withDotAndIntersection);

verify(oddBinary, {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true
});
  //=> All 15 tests passing
```

---