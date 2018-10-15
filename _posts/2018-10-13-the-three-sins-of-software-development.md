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
function balanced (str) {
  const [balanced, unbalanced] = balancedUnbalanced(str);

  return unbalanced === '';
}

const parentheses = {
  '(': ')'
};

function headTail (htStr) {
  return [(htStr[0] || ''), htStr.slice(1)];
}

function balancedUnbalanced (str) {
  const [openingParenthesis, tail] = headTail(str);

  if (!parentheses.hasOwnProperty(openingParenthesis)) return ['', str];

  const [balanced, unbalanced] = balancedUnbalanced(tail);
  const [closingParenthesis, tailOfUnbalanced] = headTail(unbalanced);

  if (closingParenthesis !== parentheses[openingParenthesis]) return ['', str];

  const [balancedTailOfUnbalanced, unbalancedTailOfUnbalanced] = balancedUnbalanced(tailOfUnbalanced);

  return [
    (openingParenthesis +
      balanced +
      closingParenthesis +
      balancedTailOfUnbalanced),
    unbalancedTailOfUnbalanced
  ];
}

console.log(balanced('(()())'))
```
