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

### alice's solution

Alice led off. "The primary things to consider are that 1. An empty string is balanced, 2. `(` + a balanced string + `)` is balanced, and 3. Anything balanced plus anything balanced is balanced. Given 1 and 2, we can deduce, for example, that `()` is balanced, as it is a left parenethsis, an empty string, and a right parenthesis."

"To implement this, I decided to write a function that would consume the string from left to right. It consumes balanced substrings, and if it can consume the entire string, then the entire string is balanced."

"I began by presuming the existence of a function that takes a string and consumes the longest balanced substring from the beginning. It takes a string as input, and returns two strings: The longest balanced prefix, and the unbalanced remainder. For example:"

|Input|Output|Comment|
|:----|:-----|:------|
|`''`|`['', '']`|The longest balanced prefix is the empty string, and there is no unbalanced remainder|
|`'()'`|`['()', '']`|`'()'` is the longest balanced prefix, and there is no unbalanced remainder|
|`'(()))'`|`['(())', ')']`|`'(())'` is the longest balanced prefix, and `)` is the unbalanced remainder|
|`')()'`|`['', ')()']`|`''` is the longest balanced prefix, and ')()' is the unbalanced remainder|

```javascript
function isBalanced (str) {
  const [_, unbalanced] = balancedUnbalanced(str);

  return unbalanced === '';
}

function balancedUnbalanced (str) {
  if (str === '') return ['', str]; // optional

  const [open, tail] = headTail(str);
  if (notAnOpen(open)) return ['', str];
  if (tail === '') return ['', str]; // optional

  const [balanced, unbalanced] = balancedUnbalanced(tail);
  if (unbalanced === '') return ['', str]; // optional

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
