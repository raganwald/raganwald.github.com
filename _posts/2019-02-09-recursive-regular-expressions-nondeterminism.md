---
title: "Recursive Regular Expressions and Nondeterminism"
tags: [recursion,allonge,mermaid,noindex]
---

As we discussed in both [Pattern Matching and Recursion], a popular programming "problem" is to determine whether a string of parentheses is "balanced:"[^dyck]

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html "Pattern Matching and Recursion"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

[^dyck]: We also discussed this problem in [Alice and Bobbie and Sharleen and Dyck], albeit in a different form that doesn't directly contribute to the subject of this essay. In that essay, we noted that strings of balanced parentheses are known more formally as [Dyck Words](https://en.wikipedia.org/wiki/Walther_von_Dyck).

[Alice and Bobbie and Sharleen and Dyck]: http://raganwald.com/2018/11/14/dyck-joke.html "Alice and Bobbie and Sharleen and Dyck"

before we revisit the code we wrote, let's mention "the elephant in the room:" Before we reach for JavaScript or any other general-purpose tool, there is already a specific text pattern-matching tool available, and it's built right into most popular languages.

The tool is a "regular expression," which informally refers to both a syntax for expressing a pattern, and an engine for applying regular expressions to a string. For example, `/Reg(?:inald)? Braithwai?te/` is a regular expression that matches various permutations of a name.

In formal computer science, a regular expression is a formal way to specific a pattern that matches valid strings in a formal [regular language].[^kleene]

[^kleene]: Formal regular expressions were invented by [Stephen Kleene].

[regular language]: https://en.wikipedia.org/wiki/Regular_language
[Stephen Kleene]: https://en.wikipedia.org/wiki/Stephen_Cole_Kleene

There are a couple of ways to define regular languages, but the one most pertinent to pattern matching is this: A regular language can be recognized by a Deterministic Finite Automaton, or "[DFA]." Meaning, we can construct a simple state machine to recognize whether a string is valid in the language, and that state machine will have a finite number of states.

[DFA]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton

Our name-matching expression above can be implemented with this finite state machine (dotted lines show places where we've elided obvious state transitions for compactness):

<div class="mermaid">
  graph TD
    start(start)-->|R|R
    R-->|e|Re
    Re-->|g|Reg
    Reg-->|i|Regi
    Reg-->|"(space)"|RegSpace["Reg(space)"]
    RegSpace-->|B|B
    Regi-.->|nald|Reginald
    Reginald-->|"(space)"|ReginaldSpace["Reginald(space)"]
    ReginaldSpace-->|B|B

    B-->|r|Br
    Br-->|a|Bra
    Bra-->|i|Brai
    Bra-->|t|t
    Brai-->|t|t
    t-.->|hwaite|thwaite
    thwaite-->|"(end)"|recognized(recognized);
</div>

It's quite obvious that if there are a finite number of strings in a language, there must be a finite state machine that recognizes that language. But what if there are an _infinite_ number of valid strings in the language?[^exercise]

[^exercise]: To demonstrate that "If there are a finite number of strings in a language, there must be a finite state machine that recognizes that language," take any syntax for defining a finite state machine, such as a table. With a little thought, one can imagine an algorithm that takes as its input a finite list of acceptable strings, and generates the appropriate table.

For some languages that have an infinite number of strings, we can still construct a finite state machine to recognize them. We've been talking about strings with balanced parentheses. What about a language where any number of parentheses—including zero—is acceptable?

The finite state machine for this language is very compact:

<div class="mermaid">
  graph TD
    start(start)-->|"'(' or ')'"|start
    start-->|"(end)"|recognized(recognized);
</div>

Despite being so compact, it recognizes an infinite number of strings. But despite the fact that the language has an infinite number of strings, and most of those strings are infinitely long, the recognizer has a fixed and finite size. It is a regular language.

Now that we have some examples of regular languages. We see that they can be recognized with finite state automata, and we also see that it is possible for regular languages too have an infinite number of strings, some of which are infinitely long. This does not, in principle, bar us from creating finite state machines to recognize them.

We can now think a little harder about the balanced parentheses problem. If "balanced parentheses" is a regular language, we could write a state machine to recognize it, or we could also write a regular expression to recognize it.

Let's take a step closer to balanced parentheses.

---

### nested parentheses

Of all the strings that contain zero or more parentheses, there is a set that contains zero or more opening parentheses followed by zero or more closed parentheses, _and where the number of opening parentheses exactly equals the number of closed parentheses_.

The strings that happen to contain exactly the same number of opening parentheses as closed parentheses can just as easily be described as follows: _A string belongs to the language if the string is `()`, or if the string is `(` and `)` wrapped around a string that belongs to the language._

We call these strings "nested parentheses," and it is related to balanced parentheses: _All nested parentheses strings are also balanced parentheses strings._

Our approach to determining whether balanced parentheses is a regular language will use nested parentheses. First, we will assume that there exists a finite state machine that can recognized balanced parentheses. Since nested parentheses are balanced parentheses, our machine must recognize nested parentheses. Next we will use nested parentheses strings to show that by presuming that such a machine has a finite number of states leads to a logical contradiction.

This will establish that our assumption that there is a finite state machine that recognizes balanced parentheses is faulty, which in turn establishes that balanced parentheses is not a regular language.[^reductio]

[^reductio]: This type of proof is known as "Reductio Ad Absurdum," and it is a favourite of logicians, because _quidquid Latine dictum sit altum videtur_.

Okay, we are ready to prove that a finite state machine cannot recognize nested parentheses, which in turn establishes that a finite state machine cannot recognize balanced parentheses.

---

### balanced parentheses is not a regular language

Okay, let's start with the assumption that there is a finite state machine that can recognize balanced parentheses, we'll call this machine **B**. We don't know how many states B has, it might be a very large number, but we know that there are a finite number of these states.

Now let's consider the set of all strings that begin with one or more open parentheses: `(`, `((`, `(((`, and so forth. Our state machine will always begin in the *start* state, and for each one of these strings, when B scans them, it will always end in some state.

There are an infinite number of such strings of open parentheses, but there are only a finite number of states in B, so it follows that there are at least two different strings that when scanned, end up in the same state. Let's call those strings **p** and **q**..

We can make a pretend function called **state**. `state` takes a state machine, a start state, and a string, and returns the state the machine is in after reading a string, or it returns `halt` if the machine halted at some point while reading the string.

We are saying that there is at least one pair of strings of open parentheses, `p` and `q`, such that `p ≠ q`, and `state(B, start, p) = state(B, start, q)`. (Actually, there are an infinite number of such pairs, but we don't need them all to prove a contradiction, a single pair will do.)

Now let us consider the string **p'**. `p'` consists of exactly as many closed parentheses as there are open parentheses in `p`. It follows that string `pp'` consists of `p`, followed by `p'`. `pp'` is a string in the balanced parentheses language, by definition.

String `qp'` consists of `q`, followed by `p'`. Since `p` has a different number of open parentheses than `q`, string `qp'` consists of a different number of open parentheses than closed parentheses, and thus `qp'` is not a string in the balanced parentheses language.

Now we run `B` on string `pp'`, pausing after it has read the characters in `p`. At that point, it will be in `state(B, start, p)`. It then reads the string `p'`, placing it in `state(B, state(B, start, p), p')`.

Since `B` recognizes strings in the balanced parentheses language, and `pp'` is a string in the balanced parentheses language, we know that `state(B, start, pp')` is _recognized_. And since `state(B, start, pp')` equals `state(B, state(B, start, p), p')`, we are also saying that `state(B, state(B, start, p), p')` is *recognized*.

What about running `B` on string `qp'`? Let's pause after it reads the characters in `q`. At that point, it will be in `state(B, start, q)`. It then reads the string `p'`, placing it in `state(B, state(B, start, q), p')`. Since B recognizes strings in the balanced parentheses language, and `qp'` is not a string in the balanced parentheses language, we know that `state(B, start, pq')` must **not** equal _recognized_, and that state `state(B, state(B, start, q), p')` must not equal recognized.

But `state(B, start, p)` is the same state as `state(B, start, q)`! And by the rules of determinism, then `state(B, state(B, start, p), p')` must be the same as `state(B, state(B, start, q), p')`. But we have established that `state(B, state(B, start, p), p')` must be _recognized_ and that `state(B, state(B, start, p), p')` must **not** be recognized.

Contradiction! Therefore, our original assumption—that `B` exists—is false. There is no deterministic finite state machine that recognizes balanced parentheses. And therefore, balanced parentheses is not a regular language.

---

### balanced parentheses with explicit state

Well, that is probably the most formal thing ever written on this blog. But what does it tell us? What practical thing do we know about recognizing balanced parentheses, now that we've proved that it is not a regular language?

Well, we know two things:

1. It is not possible to write a standard regular expression that matches balanced parentheses. Standard regular expressions only match regular languages, and balanced parentheses are not a regular language.
2. It is not possible to write any program that recognizes balanced parentheses in a constant amount of space.


The second point is most useful for us writing, say, JavaScript or Ruby or Python or Elixir or whatever. Any function we write to recognize balanced parentheses cannot operate in a fixed amount of memory. In fact, we know a lower bound on the amount of memory that such a function requires: Any engine we build to recognize balanced parentheses will have to accomodate nested parentheses, and to do so, it must have at least as many states as there are opening parentheses.

If it has fewer states than there are opening parentheses, it will fail for the same reason that a finite state machine cannot recognize balanced parentheses. We don't know how it will represent state: It might use a list, a counter, a stack, a tree, store state implicitly on a call stack, there are many possibilities.

But we can guarantee that for recognizing nested parentheses, the machine itself must have at least as many states as opening parentheses, and to recognize all of the infinite number of balanced parentheses strings, it must grow to use an infinite amount of memory.

This is true even if we devise a mechanism based on a simple counter. Here's one such implementation:

```javascript
function balanced (string) {
  let unclosedParentheses = 0;

  for (const c of string) {
    if (c === '(') {
      ++unclosedParentheses;
    } else if (c === ')' && unclosedParentheses > 0) {
      --unclosedParentheses;
    } else {
      return false;
    }
  }

  return unclosedParentheses === 0;
}

function test (examples) {
  for (const example of examples) {
    console.log(`'${example}' => ${balanced(example)}`);
  }
}

test(['', '()', '()()',
  '((()())())', '())()',
  '((())(())'
]);
  //=>
    '' => true
    '()' => true
    '()()' => true
    '((()())())' => true
    '())()' => false
    '((())(())' => false
```

This does not "feel" like it uses more memory proportional to the number of unclosed parentheses, but a counter is a way of representing different states. As it happens, this particular counter works up to `Number.MAX_SAFE_INTEGER` unclosed parentheses, and then it breaks, so it is a lot like our hypothetical finite state machine `B`. It may have a `2^53 - 1` states, but it's still a finite number of states and cannot recognize *every* balanced parenthesis string without rewriting it to use big numbers.

But as we can see, the algorithm must have a way of representing the number of unclosed parentheses in some way. We could also use a stack:

```javascript
function balanced (string) {
  let parenthesisStack = [];

  for (const c of string) {
    if (c === '(') {
      parenthesisStack.push(c);
    } else if (c === ')' && parenthesisStack.length > 0) {
      parenthesisStack.pop();
    } else {
      return false;
    }
  }

  return parenthesisStack.length === 0;
}
```

This is trivially equivalent to the counter solution, although the limit of how many elements an array can hold in JavaScript is `2^32 - 1`, less than the counter. Mind you, there is no requirement that stacks be implemented as flat, linear arrays. Here's one based on linked nested arrays, which is a lightweight way to represent a kind of linked list:

```javascript
function balanced (string) {
  let parenthesisList = [];

  for (const c of string) {
    if (c === '(') {
      parenthesisList = [parenthesisList];
    } else if (c === ')' && parenthesisList[0] !== undefined) {
      parenthesisList = parenthesisList[0];
    } else {
      return false;
    }
  }

  return parenthesisList[0] === undefined;
}
```

Depending upon way a particular JavaScript engine is implemented and the way arrays are stored on its heap, this may be able to handle larger numbers of unclosed parentheses, we might even find ourselves limited only by the size of the heap on our particular implementation. That may or may not be larger than using a counter or array as a stack.

These three examples show that when we encounter a problem that we know is equivalent to recognizing a language that is not a regular language, we can anticipate that our solution will need to incorporate some form of state that grows with some aspect of the size of the input.

In these cases, the state is explicit. But we can make the state implicit, too.

---

### balanced parentheses with implicit state



---

In [Pattern Matching and Recursion], we used this problem as an excuse to explore functions that acted as *pattern matchers* (like `just`), and also functions acted as *pattern combinators* (like `follows` and `cases`).[^source]

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

  )                  # End the named, non-capturing group 'balanced'

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

The second thing that stands out is that with functions, we don't need any special thing for recursion. They're just functions, and we implement recursion using the ordinary name-binding syntax.

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

Or cast all caution to the wind and employ a recursive combinator!

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