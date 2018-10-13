---
tags: [recursion,allonge]
---

Alice, Bob, and Carol decided to solve a short programming problem as an exercise. They agreed that each would pursue a different solution to the same requirements. The problem they chose was as follows:

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

After a short discussion, they agreed on the following examples:

|Input|Output|Comment|
|:----|-----:|:------|
|`''` |true  |The degenerate case|
|`()` |true  ||
| `(())`|true|parentheses can nest|
|`()()`|true|multiple pairs are acceptable|
|`((()`|false|missing closing parentheses|
|`()))`|false|missing opening parentheses|
|`)(`|false|close before open|
