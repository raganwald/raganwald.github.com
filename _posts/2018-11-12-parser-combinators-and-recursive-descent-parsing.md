---
title: "Recursive Descent Parsing and Parser Combinators"
tags: [recursion,allonge]
---

As we discussed in the previous essay, a popular programming "problem" is to determine whether a string of parentheses is "balanced:"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html

In [Pattern Matching and Recursion], we constructed functions like `just` that acted as pattern matchers, and also constructed _combinators_ like `follows` and `cases` that combined patren matchers to produce a new pattern matcher.[^source]

[^source]: The full source is both in the essay [Pattern Matching and Recursion], as well as here: <script src="https://gist.github.com/raganwald/d5005beb167f075f2c90898143f4e116.js"></script>

---

# Notes
