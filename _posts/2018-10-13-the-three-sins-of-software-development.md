---
tags: [recursion,allonge,noindex]
---

Alice, Bob, and Carol decided to solve a short programming problem as an exercise. They agreed that each would pursue a different solution to the same requirements. The problem they chose was as follows:

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

After a short discussion, they agreed on the following examples:

|Input|Output|Comment|
|:----|:-----|:------|
|`''`|`true`|the degenerate case|
|`'()'`|`true`||
|`'(())'`|`true`|parentheses can nest|
|`'()()'`|`true`|multiple pairs are acceptable|
|`'((()'`|`false`|missing closing parentheses|
|`'()))'`|`false`|missing opening parentheses|
|`')('`|`false`|close before open|

After some furious work, Alice was first to present her solution to the others.

---

### alice's story

The primary things to consider are that:

1. An empty string is balanced;
2. `(` + a balanced string + `)` is balanced, and;
3. Anything balanced plus anything balanced is balanced.

Given 1 and 2, we can deduce, for example, that `()` is balanced, as it is a left parenthesis, an empty string, and a right parenthesis.

To implement this, I decided to write a function that would consume the string from left to right. It consumes balanced substrings, and if it can consume the entire string, then the entire string is balanced.

I began by presuming the existence of a function that takes a string and consumes the longest balanced substring from the beginning. It takes a string as input, and returns two strings: The longest balanced prefix, and the unbalanced remainder. For example:

|Input|Output|Comment|
|:----|:-----|:------|
|`''`|`['', '']`|The longest balanced prefix is the empty string, and there is no unbalanced remainder|
|`'()'`|`['()', '']`|`'()'` is the longest balanced prefix, and there is no unbalanced remainder|
|`'(()))'`|`['(())', ')']`|`'(())'` is the longest balanced prefix, and `')'` is the unbalanced remainder|
|`')()'`|`['', ')()']`|`''` is the longest balanced prefix, and `')()'` is the unbalanced remainder|

I decided to call this function `balancedUnbalanced`, and given the existence of such a function, a function to determine whether an entire string is balanced simply checks to see if the remainder returned by `balancedUnbalanced` is empty:

```javascript
function isBalanced (str) {
  const [_, unbalanced] = balancedUnbalanced(str);

  return unbalanced === '';
}
```

"Next, I set about writing this function. The first case to consider was the trivial or degenerate case of an empty string:

```javascript
function balancedUnbalanced (str) {
  if (str === '') return ['', ''];

  // ...to be continued
}
```

What about a non-empty string? If a string was non-empty, it could have one of two cases:

1. It could start with something other than an open parenthesis. If that's the case, then the entire string is unbalanced, and `balancedUnbalanced` should return an empty string as the longest balanced prefix, and the string itself as the unbalanced remainder.
2. It could start with an open parenthesis, in which case there might be a balanced prefix to consume.

Getting the first character of a string is trivial in JavaScript, but I decided that for symmetry, I would write another function that divides a string into a head and tail, with the head being the first character and the tail being the remainder. With that in hand, I added a check for this next case:

```javascript
function balancedUnbalanced (str) {
  if (str === '') return ['', ''];

  const [open, tail] = headTail(str);
  if (notAnOpen(open)) return ['', str];

  // ...to be continued
}

function headTail (ht) {
  return [(ht[0] || ''), ht.slice(1)];
}

function notAnOpen (p) {
  return p !== '(';
}
```

Sharp eyes will notice that because of the way JavaScript handles strings, it's now technically possible to eliminate the first check, but I wanted to preserve a very explicit relationship between the code and the cases to be considered. It's clever when the code implicitly handles one of the cases, but you're always just a simple refactoring away from breaking when you do that.

Now that we've eliminated the empty string and strings that don't start with a `(`, we have two possibilities:

1. The `tail` is empty, meaning that the original string was just `(`.
2. The tail has one or more characters, `)...`.

In the first case, the entire string is not balanced:

```javascript
function balancedUnbalanced (str) {
  if (str === '') return ['', ''];

  const [open, tail] = headTail(str);
  if (notAnOpen(open)) return ['', str];
  if (tail === '') return ['', str];

  // ...to be continued
}

function headTail (ht) {
  return [(ht[0] || ''), ht.slice(1)];
}

function notAnOpen (p) {
  return p !== '(';
}
```

In the second case, `(...`, the `...` portion may be `)...`, or it may be `...)...` and still be balanced. Since `(` plus a balanced string plus `)` is balanced, what we want to do is consume the balanced prefix of the tail. We have a function to do that!

```javascript
function balancedUnbalanced (str) {
  if (str === '') return ['', ''];

  const [open, tail] = headTail(str);
  if (notAnOpen(open)) return ['', str];
  if (tail === '') return ['', str];

  const [balanced, unbalanced] = balancedUnbalanced(tail);

  // ...to be continued
}

function headTail (ht) {
  return [(ht[0] || ''), ht.slice(1)];
}

function notAnOpen (p) {
  return p !== '(';
}
```

Now we have `(` + `balanced` + `unbalanced`. Well, we need a `)` to go with the opening `)`. So for this to be balanced, we need `unbalanced` to start with a `)`. The easy case is when `unbalanced` is empty, for example when the input string is `(()`. In that case, the whole thing is unbalanced:

```javascript
function balancedUnbalanced (str) {
  if (str === '') return ['', ''];

  const [open, tail] = headTail(str);
  if (notAnOpen(open)) return ['', str];
  if (tail === '') return ['', str];

  const [balanced, unbalanced] = balancedUnbalanced(tail);
  if (unbalanced === '') return ['', str];

  // ...to be continued
}

function headTail (ht) {
  return [(ht[0] || ''), ht.slice(1)];
}

function notAnOpen (p) {
  return p !== '(';
}
```

If it isn't empty, we can use `headTail` again, and then check to see whether the head is a closing parenthesis:

```javascript
function balancedUnbalanced (str) {
  if (str === '') return ['', ''];

  const [open, tail] = headTail(str);
  if (notAnOpen(open)) return ['', str];
  if (tail === '') return ['', str];

  const [balanced, unbalanced] = balancedUnbalanced(tail);
  if (unbalanced === '') return ['', str];

  const [close, tail2] = headTail(unbalanced);
  if (notAClose(close)) return ['', str];

  // ...to be continued
}

function headTail (ht) {
  return [(ht[0] || ''), ht.slice(1)];
}

function notAnOpen (p) {
  return p !== '(';
}

function notAClose (p) {
  return p !== ')';
}
```

If it passes all of these checks, we know that the string is of the form `(`, plus a (possibly empty) balanced string, plus `)`, plus a possibly balanced remainder. From our definition above, a balanced string plkus another balanced string is a balanced string.

So, we can take a look at the remainder

```javascript
function balancedUnbalanced (str) {
  if (str === '') return ['', ''];

  const [open, remainder] = headTail(str);
  if (notAnOpen(open)) return ['', str];
  if (tail === '') return ['', str];

  const [balanced, unbalanced] = balancedUnbalanced(tail);
  if (unbalanced === '') return ['', str];

  const [close, tail2] = headTail(unbalanced);
  if (notPaired(open, close)) return ['', str];

  const [balanced2, unbalanced2] = balancedUnbalanced(tail2);
  return [
    open + balanced + close + balanced2,
    unbalanced2
  ];
}

function headTail (ht) {
  return [(ht[0] || ''), ht.slice(1)];
}

const parenDict = {
  '(': ')'
};

function notAnOpen (p) {
  return !parenDict.hasOwnProperty(p);
}

function notPaired (o, c) {
  return parenDict[o] !== c;
}

console.log(balanced('(()())'))
```
