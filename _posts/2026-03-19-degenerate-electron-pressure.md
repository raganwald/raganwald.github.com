---
title: More Pattern Matching, Recursion, and Problem-Solution Isomorphisms
published: true
tags:
  - noindex
  - allonge
  - mermaid
---

As discussed in [Pattern Matching and Recursion], a one-time popular programming problem was to write a function that would recognize “Balanced Parentheses,” a [Dyck Language]. The problem statement:

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. “Balanced” parentheses means that each opening symbol has a corresponding closing symbol, and the pairs of parentheses are properly nested.

Here are some examples of strings containing simple—`(` and `)`—parentheses, along with whether or not they are balanced:

| Input          | Balanced? | Comment                       |
| :------------- | :-------- | :---------------------------- |
| `''`           | `yes`     | the empty string is balanced  |
| `'()'`         | `yes`     |                               |
| `'(())'`       | `yes`     | parentheses can nest          |
| `'()()'`       | `yes`     | multiple pairs are acceptable |
| `'(()()())()'` | `yes`     | multiple pairs can nest       |
| `'((()'`       | `no`      | missing closing parentheses   |
| `'()))'`       | `no`      | missing opening parentheses   |
| `')('`         | `no`      | close before open             |

<br/>

When there is only one pair of parentheses, it is an *untyped* balanced parentheses language. 
### problem-solution-isomorphism

“Problem-solution isomorphism” is a fancy way of saying “Make the solution resemble the problem as you define it.” The most commonly given solution for untyped balanced parentheses uses a counter to keep track of how many unclosed left parentheses it encounters as it scans the word from left to right:

```typescript
function untypedRecognizerWithCounter (candidate: string): boolean {
  let openCount: number = 0;

  for (let cursor = 0; cursor < candidate.length; ++cursor) {
    const paren = candidate[cursor];
    if (paren === '(') {
      openCount++;
    }
    else if (paren === ')' && openCount == 0) {
      return false;
    }
    else {
      openCount--;
    }
  }

  return openCount === 0;
}

test("untypedRecognizerWithCounter", () => {
  expect(untypedRecognizerWithCounter('')).toEqual(true);
  expect(untypedRecognizerWithCounter('(')).toEqual(false);
  expect(untypedRecognizerWithCounter('()')).toEqual(true);
  expect(untypedRecognizerWithCounter('(()')).toEqual(false);
  expect(untypedRecognizerWithCounter('(())')).toEqual(true);
  expect(untypedRecognizerWithCounter('(())(')).toEqual(false);
  expect(untypedRecognizerWithCounter('(())()')).toEqual(true);
});
```

This works, but it doesn't seem very close in structure to the way the problem was (clumsily) framed. As it happens, there are formal definitions for untyped Dyck languages, and one of them describes words in Dyck languages in terms of differences and prefixes:

> A word is a valid member of the balanced parentheses language if and only if:
> 
> 1. The difference between the number of `(s` and the number of `)s` in the entire word is zero, and;
> 2. The difference between the number of `(s` and the number of `)s` in every prefix of the word is at least zero.

While the counter solution does not closely resemble the colloquial problem statement, it exactly matches this formal definition of the problem, which defines a balanced word in terms of differences and prefixes.

We'll now look at some other problems concerning Dyck languages, each time developing solutions that map to this well-understood formalism.

---
# A most unusual solution

Here's a [cheeky][absd] function that recognizes balanced parentheses:

```typescript
function untypedRecognizerWithRemove (candidate: string): boolean {
  let wip = candidate;
  let lastLength;
  
  do {
    lastLength = wip.length;
    wip = wip.replaceAll('()', '');
  }
  while(wip.length < lastLength);

  return wip === '';
}
```

This always works. Before reading on... Will this always work? If so, why and how?

---
## Why the unusual solution works

To show why the unusual solution works to recognize a word in an untyped balanced parentheses language ("balanced word"), we will establish that:

1. lorem
2. ipsum

##### Every non-empty balanced word has at least one zero prefix; all zero prefixes are balanced; and the first zero prefix is its own first zero prefix.
Since every prefix of a non-empty balanced word must have at least as many lefts and rights, and since the first character is a prefix, *The first character of a non-empty balanced word must be a left.* Since the cumulative difference for a balanced word is zero, and since a left increases the difference, *The last character of a non-empty balanced word must be a right.*
 
Every prefix of a balanced word has a difference greater than or equal to zero. At least one prefix (the entire word) has a difference of zero. One of the prefixes with a difference of zero will be the shortest or "first zero" prefix. For example, with the string `(()())()`, the first zero prefix is `(()())`:

| Prefix         | Difference | Zero prefix? |
| :----------- --| :--------- | :----------- |
| `(`            | 1          | no           |
| `((`           | 2          | no           |
| `(()`          | 1          | no           |
| `(()(`         | 2          | no           |
| `(()()`        | 1          | no           |
| **`(()())`**   | **0**      | **yes**      |
| `(()())(`      | 1          | no           |
| **`(()())()`** | **0**      | **yes**      |

<br/>

As a word unto itself, the first zero prefix has an equal number of lefts and rights, and all of its own prefixes have a difference greater than or equal to zero. *The first zero prefix of a balanced word is balanced, and it is its own first zero prefix*.[^inferdef]

##### Every non-empty balanced word begins with a pair of parentheses enclosing a balanced word
First and most obviously, if the first zero prefix is `()`, it is a pair of parentheses enclosing the empty string, a balanced word. We now consider the case when the first zero prefix is longer than `()`.

Since the first zero prefix  is not `()`, it must be of the form `(a...a')`. We will show that the word `a...a'` is balanced.

*In our example word above, the first zero prefix is `(()())`. The word `a...a'` is `()()`.*

What do we know about parenthesis `a`? We know it cannot be a right! If it was a right, the cumulative sum would have been zero, which contradicts `(a...a')` being the first zero prefix. Likewise, 'a' cannot be a left. *Any first zero prefix longer than `()` must be of the form `(a...a')` where `a` is `(` and `a'` is `)`.*

Since `(a...a')` has a cumulative total of zero, and the first and last parentheses cancel each other out, *The word `a...a'` has a difference of zero.* 

If any prefixes of `(a...a')` has a negative difference, that would mean that some prefix of `(a...a')`—`(a...b'` where `b'` is a `)`—has a difference of zero. Since the first zero prefix is by definition its own first zero prefix, every prefix of `a...a'` must have a difference that is greater than or equal to zero. Since the word `a...a'` has a difference of zero and every one of its prefixes is greater than or equal to zero, *The word `a...a'` is balanced.*

> In our example  above, the first zero prefix is `(()())` the word `a...a'` is `()()`, and as expected, `a` is `(`, `a'` is `)`, and `...` is `)(`. `(()())` is balanced, as is `()()`.

Thus, *every non-empty balanced word begins with a pair of parentheses enclosing an inner balanced word, and if that inner balanced word is empty, the outer balanced word contains `()`.*

[^inferdef]: As an exercise, infer the definition S -> (S)S from the first zero prefix

##### Every non-empty balanced word contains at least one `()`
Since every non-empty balanced word begins with a pair of parentheses enclosing an inner balanced word, if that inner balanced word is not empty we know that it also begins with a pair of parentheses enclosing a one-level deeper inner balanced word.

We can recursively apply this level by level, first zero prefix by first zero prefix, until we must reach a first zero prefix of `()`. Our inner strings are successively two parentheses shorter, and since we begin with a finite string. This must reach a two-character balanced string, `()`.

##### Prepending, appending, or inserting balanced words preserve balance
Given two balanced words `first` and `second` that have differences of zero by definition, the catenation `firstsecond` must have a difference of zero. And since the `first` is balanced, all of its prefixes are greater than or equal to zero. `second` is also balanced, and since its prefixes are greater than or equal to zero and the prefix `first` has a difference of zero, all of the differences of `fristsecond` will be greater than or equal to zero. *The concatenation of two balanced words is a balanced word.*

Next we consider two words, `eentwee` and `drie`, that are balanced. The word `eendrietwee` must have a difference of zero, and since `drie` has a net effect of zero on the differences within `eentwee`, every prefix of the word `eendrietwee` must have a difference greater than or equal to zero. *The insertion of a balanced word anywhere within a balanced word is a balanced word*.

Finally, we consider a balanced word, `firstsecondthird`, that contains the balanced word `second`. `firstthird`, the word we get by removing `second` from `firstsecondthird`, must have a difference of zero. And since the net change of `second` is zero on the differences of `first` and `third`, every prefix of the word `firstthird` must be greater than or equal to zero. *The removal of a balanced word from a balanced word leaves a balanced word as a remainder.*

##### Removing `()` from a balanced string repeatedly ends with the empty string
Every balanced string contains a `()`, and since `()` is a balanced string, removing `()` from a balanced string leaves a balanced string that is two characters shorter. Given a finite string, this process must terminate in the empty string or an unbalanced string that does not contain `()`.

[Pattern Matching and Recursion]: https://raganwald.com/2018/10/17/recursive-pattern-matching.html

[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]: https://raganwald.com/2019/02/14/i-love-programming-and-programmers.html

[Dyck Language]: https://en.wikipedia.org/wiki/Dyck_language

[absd]: https://raganwald.com/2018/11/14/dyck-joke.html "Alice and Bobbie and Sharleen and Dyck"