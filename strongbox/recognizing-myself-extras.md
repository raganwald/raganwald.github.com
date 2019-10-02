---

# UNFINISHED

### proof of kleene's theorem

https://www.neuraldump.net/2017/11/proof-of-kleenes-theorem/

---


<!--

### what we know about catenation, union, zeroOrOne, and zeroOrMore

Taken on their own, `catenation`, `union`, `zeroOrOne`, and `zeroOrMore` can tell us something about the relationship between the descriptions that they take as inputs, and the descriptions that they return as outputs.

To summarize, `catenation` and `union` both take two descriptions as input. If both are descriptions of finite state machines, the description returned will also be of a finite state machine.

`zeroOrOne` and `zeroOrMore` both take one descriptions as input. If it is a description of a finite state machine, the description returned will also be of a finite state machine.

If any input to `catenation`, `union`, `zeroOrOne`, or `zeroOrMore` is a description of a pushdown automaton (whether deterministic or not), the description returned will be of a pushdown automaton.

By induction we can reason that any expression consisting of `catenation`, `union`, `zeroOrOne`, and/or `zeroOrMore`, in any combination, when applied to its inputs, will return a description of a finite state machine, provided that all of its inputs are of finite state machines.

### what string and any can tell us

The `string` and `any` functions both take strings as arguments, and always return descriptions of finite state machines. In programming parlance, they are _Description Constructors_, they are the only functions we've built so far that create descriptions.

We reasoned above that any expression consisting of `catenation`, `union`, `zeroOrOne`, and/or `zeroOrMore`, in any combination, when applied to its inputs, will return a description of a finite state machine, provided that all of its inputs are of finite state machines.

Since the outputs of `string` and `any` are always finite state machines... It follows that an expression consisting of invocations of `string`, `any`, `catenation`, `union`, `zeroOrOne`, and/or `zeroOrMore`, with no inputs other than constant strings to `string` and `any`, must return a description of a finite state machine.

For example, this expression returns a description of a finite state machine that recognizes strings consisting of the characters `a`, `b`, and `c`, where there are an even number of `a`s:

```javascript
catenation(
  zeroOrMore(
    catenation(
      catenation(
        zeroOrMore(any("bc")),
        any("a"),
      ),
      catenation(
        zeroOrMore(any("bc")),
        any("a"),
      )
    )
  ),
  zeroOrMore(any("bc"))
)
```

---

# Pattern Matching Languages

We just looked at this expression in JavaScript. It returns a description of a finite state machine that recognizes strings consisting of the characters `a`, `b`, and `c`, where there are an even number of `a`s:

```javascript
catenation(
  zeroOrMore(
    catenation(
      catenation(
        zeroOrMore(any("bc")),
        any("a"),
      ),
      catenation(
        zeroOrMore(any("bc")),
        any("a"),
      )
    )
  ),
  zeroOrMore(any("bc"))
)
```

If we view that expression as a string, it is also a sentence in the JavaScript language.

Without getting too rigorous, we can think that there is a subset of the JavaScript language that consists only of expressions consisting of invocations of `string`, `any`, `catenation`, `union`, `zeroOrOne`, and/or `zeroOrMore`, with no inputs other than constant strings to `string` and `any`.

That subset is also a language, and it is a language that describes finite state machines. It is not unusual to define functions and/or other infrastructure like classes and so forth in order to create a subset of a programming language that has a very specific purpose.

These are sometimes called "Embedded DSLs." Some languages, like Lisp, are designed around creating embedded languages as the primary idiom. Others, like Ruby, use it often even though it was not really designed as a "programmable programming language" from the start. When we see an expression like `5.minutes.ago` in Ruby, we are looking at an embedded DSL.

### pjs


Let us call our embedded language "pjs," which is short for, "PatternJS."

-->