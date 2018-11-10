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

### from recognizers to parsers

The idea of embedding pattern matching in a language otherwise mostly concerned with imperative programming is not new, and neither is the idea of patterns being first-class entities in the language, or of composing patterns to create new patterns. Although all of these ideas have been recently popularized by the functional programming community in the form of [Parser Combinators], they were first introduced to mainstream programming by the [SNOBOL4] programming in 1967, over fifty years ago!

[Parser Combinators]: https://en.wikipedia.org/wiki/Parser_combinator
[SNOBOL4]: https://en.wikipedia.org/wiki/SNOBOL

Because SNOBOL allowed patterns to be bound to names, and for patterns to be composed from other patterns, it was possible and in fact desirable to create self-referential patterns. As we briefly touched on earlier, self-referential patterns can recognize certain types of strings that standard regular expressions cannot recognize.

Our pattern matchers have a similar quality, however they were written to solve a single problem--recognizing a particular type of string--and SNOBOL patterns can do so much more. In one area, so can regular expressions. Consider, for example, the problem of extracting data from strings. Both SNOBOL patterns and regular expressions allow us to name or otherwise reference subexpressions, and extract matching values from them, e.g.:

```javascript
const p = /^{(?<bracketed>.*)}$/;
const matchData = p.exec('{my goodness}');
const bracketed = matchData && matchData.groups.bracketed;

bracketed
  // 'my goodness'
```

Once we go beyond simply recognizing whether a string matches certain rules or not, to inspecting its structure and extracting values, we have transitioned from writing _recognizers_ to writing _parsers_. Sounds like fun, let's have at it!

---

### parsers, from the beginning

When we started writing pattern matchers, we started with:

```javascript
const just =
  target =>
    input =>
      input.startsWith(target) &&
      target;
```

Note that `just` expects to match a string, from the beginning. This was simple to understand, but a consequence of this design choice was that when we wrote our  "pattern combinators," we were obliged to do a lot of string slicing. That's a performance problem, and it also doesn't generalize very well.

Let's rewrite it in a more flexible way;

```javascript
const just =
  target =>
    (input, cursor = 0) => {
      let newCursor = cursor;

      for (let iTarget = 0; i < iTarget.length; ++i, ++newCursor) {
        if (newCursor >= input.length) return false;
        if (input[newCursor] !== target[newCursor]) return false;
      }

      return newCursor;
    }
```


---

### ?

> In computer science, a recursive descent parser is a kind of top-down parser built from a set of mutually recursive procedures (or a non-recursive equivalent) where each such procedure usually implements one of the productions of the grammar. Thus the structure of the resulting program closely mirrors that of the grammar it recognizes.--[Recursive Descent Parser], Wikipedia

[Recursive Descent Parser]: https://en.wikipedia.org/wiki/Recursive_descent_parser

---

# Notes
