---
title: "Recursive Descent Parsing and Parser Combinators"
tags: [recursion,allonge,noindex]
---

As we discussed in the previous essay, a popular programming "problem" is to determine whether a string of parentheses is "balanced:"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html

In [Pattern Matching and Recursion], we constructed functions like `just` that acted as pattern matchers, and also constructed _combinators_ like `follows` and `cases` that combined pattern matchers to produce a new pattern matcher.[^source]

[^source]: The full source: <script src="https://gist.github.com/raganwald/d5005beb167f075f2c90898143f4e116.js"></script>

Our pattern matching solution had several things to recommend itself:

1. The way in which the solution was expressed--a self-referential pattern--closely matched the way in which the problem was expressed, a self-referential set of rules.
2. By writing our patterns as functions, we were able to write patterns combinators. In this way, we were able to write small, single-responsibility functions, and build the solution using functional composition.

In this essay, we're going to take a closer look at this approach, starting with the first benefit: A solution that closely resembled the problem as expressed.

---

### ?



---

### ?

> In computer science, a recursive descent parser is a kind of top-down parser built from a set of mutually recursive procedures (or a non-recursive equivalent) where each such procedure usually implements one of the productions of the grammar. Thus the structure of the resulting program closely mirrors that of the grammar it recognizes.--[Recursive Descent Parser], Wikipedia

[Recursive Descent Parser]: https://en.wikipedia.org/wiki/Recursive_descent_parser

---

# Notes
