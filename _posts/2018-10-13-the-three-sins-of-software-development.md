---
tags: [recursion,allonge,noindex]
---

Alice, Bob, and Carol decided to solve a short programming problem as an exercise. They agreed that each would pursue a different solution to the same requirements. The problem they chose was as follows:

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

After a short discussion, they agreed on the following examples:

|Input|Output|Comment|
|:----|:-----|:------|
|`''` |'true'  |the degenerate case|
|`'()'` |'true'  ||
|`'(())'`|'true'|parentheses can nest|
|`'()()'`|'true'|multiple pairs are acceptable|
|`'((()'`|'false'|missing closing parentheses|
|`'()))'`|'false'|missing opening parentheses|
|`')('`|'false'|close before open|

They got to work. After some furious work, Alice was first to present her solution to the others.

---

### alice's solution

function balance

```javascript
function isBalanced (str) {
  const [_, unbalanced] = balancedUnbalanced(str);

  return unbalanced === '';
}

function balancedUnbalanced (str) {

  const [open, tail] = headTail(str);

  if (notAnOpen(open)) return ['', str];

  const [balanced, unbalanced] = balancedUnbalanced(tail);
  const [close, tail2] = headTail(unbalanced);

  if (!isOpenClosePair(open, close)) return ['', str];

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

function isOpenClosePair (o, c) {
  return parenDict[o] === c;
}

console.log(balanced('(()())'))
```
