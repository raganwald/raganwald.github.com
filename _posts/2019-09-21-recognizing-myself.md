---
title: "From Pushdown Automata to Self-Recognition"
tags: [recursion,allonge,mermaid,wip]
---

# Prelude

In casual programming conversation, a [Regular Expression], or *regex* (plural "regexen"),[^regex] is a sequence of characters that define a search pattern. They can also be used to validate that a string has a particular form. For example, `/ab*c/` is a regex that matches an `a`, zero or more `b`s, and then a `c`, anywhere in a string.

[Regular Expression]: https://en.wikipedia.org/wiki/Regular_expression

[^regex]: In common programming jargon, a "regular expression" refers any of a family of pattern-matching and extraction languages, that can match a variety of languages. In computer science, a "regular expression" is a specific pattern matching language that recognizes regular languages only. To avoid confusion, in this essay we will use the word "regex" to refer to the programming construct.

Regexen are fundamentally descriptions of machines that recognize sentences in languages, where the sentences are strings of text symbols.

Another example is this regex, that purports to recognize a subset of valid email addresses. We can say that it recognizes sentences in a language, where every sentence in that language is a valid email address:[^email]

[^email]: There is an objective standard for email addresses, RFC 5322, but it allows many email addresses that are considered obsolete, *and* there are many non-conforming email servers that permit email addresses not covered by the standard. The real world is extremely messy, and it is very difficult to capture all of its messiness in a formal language.

```
\A(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*
 |  "(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]
      |  \\[\x01-\x09\x0b\x0c\x0e-\x7f])*")
@ (?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?
  |  \[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}
       (?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:
          (?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]
          |  \\[\x01-\x09\x0b\x0c\x0e-\x7f])+)
     \])\z
```

Regexen are more than just descriptions of machines that recognize sentences in languages: *Regexen are themselves sentences in a language*. Thus, inevitably, a single thought crosses the mind of nearly every programmer working with regexen:

> Is it possible to write a regex that recognizes a valid regex?

It is easy to write a function that recognizes valid regex given any regex engine: Give the engine the regex, and see if it returns an error. That is practical, but unsatisfying. All it tells us is that a Turing Machine can be devised to recognize regexen. But not all flavours of regexen are as powerful as Turing Machines.

It is far more interesting to ask if a machine defined by a particular flavour of regex can recognize valid examples of that particular flavour. Regexen were originally called "regular expressions," because they could recognize regular languges. Regular languages could be recognized by finite state machines, thus the original regexen described finite state machines.

But just because a flavour of regex only describes finite state machines, does not mean that descriptions of those regexen can be recognized by finite state machines. Consider, for example, a flavour of regex that permits characters, the wildcard operator `.`, the zero-or more operator `*`, and non-capturing groups `(?: ... )`. Here's an example:

```
/(?:<(?:ab*c)>)+/
```

The above regex can most certainly be implemented by a finite state machine, but recognizing descriptions that include nested non-capturing groups cannot be recognized by a finite state machine, as we saw in [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata][brutal]. Therefore, we know that this simple flavour of regexen cannot recognize itself.

---

### today's essay

In [A Brutal Look at Balanced Parentheses...][brutal], we constructed recognizers by hand. In this essay, we are going to focus on building recognizers out of other recognizers. By creating a small set of recognizers (such as recognizers that recognize a single symbol), and then building more sophisticated recognizers with combinators such as catenation, alternation, and zero-or-more, we are creating languages that describe recognizers.

In addition to exploring the implementation of such combinators, we will explore consequences of these combinators, answering questions such ass, "If recognizing a character can be done with a finite state machine, does an arbitrary expression catenating and alternating such recognizers create a machine more sophisticated than a finite state automata?"

We will work towards asking about machines that can recognize themselves. Can a language be devised for building finite state machines that can be recognized by machines built in itself? What about a language that builds pushdown automata? Is it powerful enough to build a language that recognizes itself? Fundamentally, we will be answering the same question as, "Can a regex recognize a valid regex?"

But instead of using first principles to deduce whether it is possible, we will instead build working machines that recognize themselves.

---

### before we get started, a brief recapitulation of the previous essay

In [A Brutal Look at Balanced Parentheses...][brutal], we began with a well-known programming puzzle: _Write a function that determines whether a string of parentheses is "balanced," i.e. each opening parenthesis has a corresponding closing parenthesis, and the parentheses are properly nested._

[brutal]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html

In pursuing the solution to this problem, we constructed machines that could recognize "sentences" in languages. We saw that some languages can be recognized with Finite State Automata. Languages that require a finite state automaton to recognize them are _regular languages_.

We also saw that balanced parentheses required a more powerful recognizer, a Deterministic Pushdown Automaton. Languages that require a deterministic pushdown automaton to recognize them are _deterministic context-free languages_.

We then went a step further and considered the palindrome problem, and saw that there were languages--like palindromes with a vocabulary of two or more symbols--that could not be recognized with Deterministic Pushdown Automata, and we needed to construct a [Pushdown Automaton] to recognize palindromes. Languages that require a pushdown automaton to recognize them are _context-free languages_.

[Pushdown Automaton]: https://en.wikipedia.org/wiki/Pushdown_automaton

We implemented pushdown automata using a classes-with-methods approach, the complete code is [here][pushdown.oop.es6].

[pushdown.oop.es6]: https://gist.github.com/raganwald/41ae26b93243405136b786298bafe8e9#file-pushdown-oop-es6

The takeaway from [A Brutal Look at Balanced Parentheses...][brutal] was that languages could be classified according to the power of the ideal machine needed to recognize it, and we explored example languages that needed finite state machines, deterministic pushdown automata, and pushdown automata respectively.[^tm]

[^Tm]: [a Brutal Look at Balanced Parentheses, ...][Brutal] did not explore two other classes of languages. there is a class of formal languages that requires a turing machine to recognize its sentences. turing machines are more powerful than pushdown automata. And there is a class of formal languages that cannot be recognized by Turing Machines, and therefore cannot be recognized at all! Famously, the latter class includes a machine that takes as its sentences descriptions of Turing Machines, and recognizes those that halt.

---

# Table of Contents

### [Composeable Recognizers](#composeable-recognizers-1)

[A few words about Functional Composition](#a-few-words-about-functional-composition)

[Refactoring OO Recognizers into Data](#refactoring-oo-recognizers-into-data)

  - [a data format for automata](#a-data-format-for-automata)
  - [an example automaton](#an-example-automaton)
  - [implementing our example automaton](#implementing-our-example-automaton)

[Catenating Descriptions](#catenating-descriptions)

  - [catenationFSA(first, second)](#catenationfsafirst-second)
  - [catenation(first, second)](#catenationfirst-second)
  - [what we have learned from catenating descriptions](#what-we-have-learned-from-catenating-descriptions)

[Alternating Descriptions](#alternating-descriptions)

  - [fixing a problem with union(first, second)](#fixing-a-problem-with-unionfirst-second)
  - [what we have learned from alternating descriptions](#what-we-have-learned-from-alternating-descriptions)

[Building Language Recognizers](#building-language-recognizers)

  - [recognizing emptiness](#recognizing-emptiness)
  - [recognizing symbols](#recognizing-symbols)
  - [implementing zero-or-more](#implementing-zero-or-more)

### [Regular Languages](#regular-languages-1)

  - [what is a regular language](#what-is-a-regular-language)
  - [making regular expressions more convenient](#making-regular-expressions-more-convenient)
  - [implementing a recognizer for a set of symbols](#implementing-a-recognizer-for-a-set-of-symbols)
  - [implementing a recognizer for strings](#implementing-a-recognizer-for-strings)
  - [implementing one-or-more](#implementing-one-or-more)

