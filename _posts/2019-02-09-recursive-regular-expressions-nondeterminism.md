---
title: "Recursive Regular Expressions and Nondeterminism"
tags: [recursion,allonge, mermaid,noindex]
---

As we discussed in both [Pattern Matching and Recursion], a popular programming "problem" is to determine whether a string of parentheses is "balanced:"[^dyck]

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html "Pattern Matching and Recursion"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

[^dyck]: We also discussed this problem in [Alice and Bobbie and Sharleen and Dyck], albeit in a different form that doesn't directly contribute to the subject of this essay. In that essay, we noted that strings of balanced parenetheses are known more formally as [Dyck Words](https://en.wikipedia.org/wiki/Walther_von_Dyck).

[Alice and Bobbie and Sharleen and Dyck]: http://raganwald.com/2018/11/14/dyck-joke.html "Alice and Bobbie and Sharleen and Dyck"

before we revist the code we wrote, let's mention "the elephant in the room:" Before we reach for JavaScript or any other general-purpose tool, there is already a specific text pattern-matching tool available, and it's built right into most popular lanuages.

The tool is a "regular expression," which informally refers to both a syntax for expressing a pattern, and an engine for applying regular expressions to a string. For example, `/Reg(?:inald)? Braithwai?te/` is a regular expression that matches various permutations of a name.

In formal computer science, a regular expression is a formal way to specific a pattern that matches valid strings in a formal [regular language].[^kleene]

[^kleene]: Formal regular expressions were invented by [Stephen Kleene].

[regular language]: https://en.wikipedia.org/wiki/Regular_language
[Stephen Kleene]: https://en.wikipedia.org/wiki/Stephen_Cole_Kleene

There are a couple of ways to define regular languages, but the one most pertinent to pattern matching is this: A regular language can be recognized by a Finite Automaton. Meaning, we can construct a simple state machine to recognize whether a string is valid in the language, and that state machine will have a finite number of states.

Our name-matching expression above can be implemented with this finite state machine (dotted lines show places where we've elided obvious state transitions for compactness):

<div class="mermaid">
  graph TD
    start-->|R|R
    R-->|e|Re
    Re-->|g|Reg
    Reg-->|i|Regi
    Reg-->|" "|RegSpace["Reg "]
    RegSpace-->B
    Regi-.->|d|Reginald
    Reginald-->|" "|ReginaldSpace["Reginald "]
    ReginaldSpace-->|B|B
    B-->|end|end;
</div>

We can implement state machines in many ways, but when we say that a particular state machine has a finite number of states, this means we cannot imple



In [Pattern Matching and Recursion], we used this problem as an exc use to explore functions that acted as *pattern matchers* (like `just`), and also functions acted as *pattern combinators* (like `follows` and `cases`).[^source]

[^source]: The full source: <script src="https://gist.github.com/raganwald/d5005beb167f075f2c90898143f4e116.js"></script>

---

### functions as pattern matchers and combinators

Making pattern matchers and combinators out of functions affords us a number of advantages. First and foremost, we have access to the power of a fully operational <strike>battle station</strike> programming language.

Not counting the definitions of `just`, `follows`, `case`, and so forth, our solution to the balanced parentheses problem shows this:

```javascript
const balanced =
  input =>
    zeroOrMore(
      cases(
        follows(just('('), balanced, just(')')),
        follows(just('['), balanced, just(']')),
        follows(just('{'), balanced, just('}'))
      )
    )(input);

const entirelyBalanced = entirely(balanced);
```

We can see one of the ways that it leverages being "native" JavaScript: It is a recursive pattern, and the recursion is implemented by referring to the name `balanced` that is bound in the current JavaScript scope.

We didn't have to make a special feature for recursive patterns: We made our patterns by composing functions, and we got everything we can usually do with functions, "for free."

---

### recursive regular expressions

Compare this to the usual way of matching patterns in text, [regular expressions]. Here's the same recursive pattern, written as a recursive regular expression in the Ruby programming language:

```ruby
%r{
  ^
  (?'balanced'
    (?:
      \(
        \g'balanced'
      \) |
      \[
        \g'balanced'
      \] |
      \{
        \g'balanced'
      \}
    )*
  )
  $
}x
```

It is written using "extended" syntax. Extended syntax ignores whitespace, which is very useful when a regular expression is complex and needs to be visually structured.

Extended syntax also allows comments:

```ruby
%r{                  # Start of a Regular expression literal.

  ^                  # Match the beginning of the input

  (?'balanced'       # Start a non-capturing group named 'balanced'

    (?:              # Start an anonymous non-capturing group

      \(             # Match an open parenthesis, anything matching the 'balanced'
        \g'balanced' # group, and a closed parenthesis. ( and ) are escaped
      \)             # because they have special meanings in regular expressions.

      |              # ...or...

      \[             # Match an open bracket, anything matching the 'balanced'
        \g'balanced' # group, and a closed bracket. [ and ] are escaped
      \]             # because they have special meanings in regular expressions.

      |              # ...or...

      \{             # Match an open brace, anything matching the 'balanced'
        \g'balanced' # group, and a closed bracket. { and } are escaped
      \}             # because they have special meanings in regular expressions.

    )*               # End the anonymous non-capturing group, and modify
                     # it so that it matches zero or more times.

  )                  # End the named, noncapturing group 'balanced'

  $                  # Match the end of the input

}x                   # End of the regular expression literal. x is a modifier
                     # indicating "extended" syntax, allowing comments and
                     # ignoring whitespace.
```

How do the two approaches compare?

---

### comparing function composition to recursive regular expressions

Comparing and contrasting the two solutions, a few things stand out.

First, the regular expression syntax is more compact. That can sometimes be helpful for short patterns, especially one-liners.

And when something is so complex that the terse syntax gets in the way, extended syntax helps us tame its complexity. The function composition approach is always going to be bulkier than the equivalent regular expression.

The second thing that stands out is that with functions, we don't need any special thing for recursion. They're just functions, and we implement recursion using the ordinary name-bdinding syntax.

In regular expression engines that support recursion, we need one special thing to name a group (`(?'balanced' ... )`) and another special thing to refer to a named group (`\g'balanced' `). Thew regular expression engine must provide these things, and we must remember what they are above and beyond remembering how to name things in our normal programming language.

Which leads to the third thing. Some regular expression engines do not provide for recursive patterns. JavaScript's built-in regular expression engine, for example, does not support recursive regular expressions.

So if we're programming in JavaScript, and we want a recursive pattern, we roll our own or do without.

---

### organizing our patterns

There is a fourth thing, ways to organize our patterns. With functions, we have many ways to organize them. We can put libraries of pre-written patterns in modules. We can organize things in lexical scope.

We can even name things inline as the regular expression does, using a named function expression, like this:

```javascript
entirely(
  function balanced (input) {
    return zeroOrMore(
      cases(
        follows(just('('), balanced, just(')')),
        follows(just('['), balanced, just(']')),
        follows(just('{'), balanced, just('}'))
      )
    )(input);
  }
)('((())())');
  //=> '((())())'
```

Or cast all caution to the wind and employ a recursive compbinator!

```javascript
const why =
  fn =>
    (
      maker =>
        (...args) =>
          fn(maker(maker), ...args)
    )(
      maker =>
        (...args) =>
          fn(maker(maker), ...args)
    );

entirely(
  why(
    (balanced, input) =>
      zeroOrMore(
        cases(
          follows(just('('), balanced, just(')')),
          follows(just('['), balanced, just(']')),
          follows(just('{'), balanced, just('}'))
        )
      )(input)
  )
)('((())())');
  //=> '((())())'
```

Organizing code is more than just putting