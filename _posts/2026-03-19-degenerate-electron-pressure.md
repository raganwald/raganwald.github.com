---
title: More Pattern Matching, Recursion, and Problem-Solution Isomorphisms
published: true
tags:
  - noindex
  - allonge
  - mermaid
---

As discussed in [Pattern Matching and Recursion], a one-time popular programming problem was to write a function that would recognize “Balanced Parentheses,” a [Dyck Language]. Here are some examples of strings containing simple—`(` and `)`—parentheses, along with whether or not they are balanced:

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

The most commonly given solution for balanced parentheses uses a counter to keep track of the difference between the number of open and closed parentheses it encounters as it scans the word from left to right:

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

This works, but it doesn't seem very close to the way the problem was (clumsily) framed. Let's consider this formal definition instead: A word is a valid member of the balanced parentheses language if and only if:

1. The difference between the number of `(s` and the number of `)s` in the entire word is zero, and;
2. The difference between the number of `(s` and the number of `)s` in every prefix of the word is at least zero.

While the counter solution does not closely resemble the colloquial problem statement, it exactly matches this formal definition of the problem, which defines a balanced word in terms of differences and prefixes.

### visualizing differences and prefixes

With the balanced word `(()())()`, the prefixes and differences are:

| Prefix     | Difference |
|:-----------|:-----------|
| `(`        | 1          |
| `((`       | 2          |
| `(()`      | 1          |
| `(()(`     | 2          |
| `(()()`    | 1          |
| `(()())`   | 0          |
| `(()())(`  | 1          |
| `(()())()` | 0          |

<br/>

Each is greater than or equal to zero, and the difference for the entire string (the longest prefix) is zero, so it is balanced.

We can visualize the differences with a "mountain diagram." To make a mountain diagram, we use `/` and `\` as our "parentheses," instead of `(` and `)`.  So our balanced word becomes `//\/\\/\`.

Then we "raise" each `/` and "lower" each `\` to make a two-dimensional "mountain range" where the vertical distance represents the difference or level of nesting:

```
 /\/\
/    \/\
```

We can see at a glance that the path traced along the "mountain tops" never drops below the origin point, which is a consequence of the differences never being below zero. And since it ends even with the origin, we know that the difference for the entire word is zero.

---

## Composing and decomposing balanced words

---

Balanced words can be composed through insertion and deletion. If we insert a balanced word at the beginning, end, or anywhere within another balanced word, the result is a balanced word. And if we delete a balanced word from the beginning, end, or from within another balanced word, the remainder will be a balanced word.

These properties of composition and decomposition follow directly from the two diffences and prefixes rules:

#### Concatenating balanced words results in a balanced word.

Consider two balanced words, `(()())` and `()`. Their mountain diagrams are:

```
 /\/\
/    \  /\
```

Since they are both balanced, they end at the same level where they begin. What happens if we catenate them? We get our example balanced word:

```
 /\/\               /\/\
/    \  + /\  =>   /    \/\
```

This is balanced, because given any two balanced words, they both end with a difference of zero and thus the difference of them together will always be zero. And since all prefixes for both words have differences greater than or equal to zero, the two catenated together have every prefix greater than or equal to zero. Thus, concatenating any two balanced words results in a balanced word.[^cl]

[^cl]: Balanced parentheses is a concatenative language.

#### Inserting a balanced word anywhere within a balanced word produces a balanced word
Concatenation is not the only way to compose balanced words. We can also insert one balanced word into another, anywhere within it. For example, what if we inject `()` into `(()())` between `((` and `)())`, producting `((())())`? Let's draw the mountain diagram, lifting the diagram of `()` to reflect the result:

```
       /\                /\
 /           \/\        /  \/\ 
/   +     +     \  =>  /      \
```

Because we're inserting a word that has a difference of zero, it has no effect of the difference of the result, just as with concatenation. And because it has a difference of zero, it has no effect on the differences of the existing prefixes before or after the insertion point, and thus the prefixes for the composed word will all be greater than or equal to zero. Therefore, *Inserting a balanced word anywhere within a balanced word produces a balanced word*.

If we think of concatenation as insertion at the beginning or end of a word, we have the rule of composing balanced words: *Inserting a balanced word at the beginning, end, or anywhere within another balanced word produces a balanced word.*

#### Every prefix of a balanced word that has a difference of zero must itself be a balanced word
Here are two words, `(()())()` and`(()(()))`. The prefixes are:

| Prefix 1   | Difference | Prefix 2   | Difference |
|:-----------|:-----------|:-----------|:-----------|
| `(`        | 1          | `(`        | 1          |
| `((`       | 2          | `((`       | 2          |
| `(()`      | 1          | `(()`      | 1          |
| `(()(`     | 2          | `(()(`     | 2          |
| `(()()`    | 1          | `(()((`    | 3          |
| `(()())`   | 0          | `(()(()`   | 2          |
| `(()())(`  | 1          | `(()(())`  | 1          |
| `(()())()` | 0          | `(()(()))` | 0          |

<br/>

Note that `(()())()` has two prefixes with a difference of zero: `(()())` and itself `(()())()`. While `(()(()))` has only one prefix with a differenze of zero, itself. Since both `(()())()`, and `(()(()))` are balanced, we know that every one of their prefixes *must* have a difference greater than or equal to zero. Which tells is that *Every prefix of a balanced word that has a difference of zero must itself be a balanced word.*

#### If we delete a balanced word from the beginning of a balanced word, what remains is a balanced word
Our first example balanced word has one prefix shorter than itself. The second balanced word does not. Let's look at its mountain diagram again:

```
 /\/\
/    \/\
```

Notice that valley that comes back to the level of the origin? That's where `(()())` meets `()`. We know that `(()())` is a balanced prefix, and therefore a balanced word itself. But what about the remainder of our example word? We can see at a glance that `()` is also balanced. Must this always be true? Must the reminder of a balanced word be balanced if it has a shorter prefix that is balanced?

```
 /\/\         /\/\        
/    \/\  -  /    \  => /\
```

If the prefix `(()())` has a difference of zero, and if the entire word has a prefix of zero, then the remainder must also have a difference of zero. And since it begins from zero, it must have prefixes itself that are greater than or equal to zero.

If a word has a balanced prefix, the remainder of the word following the prefix is also balanced. Which means, *If we delete a balanced word from the beginning of a balanced word, what remains is a balanced word.*

#### If we delete a balanced word from within a balanced word, the remainder must be balanced
Deleting a balanced word from the beginning or the end of a word is the inverse of concatenating two words. Can we delete balanced words from within balanced words? And if so, must what remains be balanced?

```
 /\/\        /\/\       
/    \/\  -        => /\/\
```

As with removing words from the beginning or the end, if we remove a substring of a balanced word that has a difference of zero—such as a balanced word—the remainder must also have a difference of zero, whether the substring we remove is balanced or not. Since what remains has prefixes with differences that are greater than or equal to zero, *If we delete a balanced word from within a balanced word, the remainder must be balanced.*

Inserting a balanced word at the beginning, end, or within another balanced word always leaves a balanced remainder. And inversely, deleting a balanced word from the beginning, end, or within a balanced word always leaves a balanced reaminder. Inserting and removing balanced words are inverse operations. Anything that can be done by inserting can be undone by deleting, and anything that can be done by deleting can be undone by inserting.

---

## Further consequences of composition and decomposition

---

Here's a [cheeky][absd] function that recognizes balanced parentheses:

```typescript
function untypedRecognizerWithDelete (candidate: string): boolean {
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

This always works. Why?

---

### Why the cheeky solution works

We already know that if we delete a balanced word from a balanced word, what remains will be a shorter, balanced word. It follows that *If every non-empty balanced word contains at least one `()` substring, then recursively deleting the first `()` of a non-empty balanced word will reach the empty string in finite time and halt.*

#### Every non-empty balanced word has a first balanced prefix
A non-empty balanced word is its own last prefix, therefore every non-empty balanced word has at least one balanced prefix, which by definition is itself a balanced word. One, the shortest, is its first balanced prefix. For our example word `(()())()`, the first balanced prefix is `(()())`.

#### The first balanced prefix is its own first balanced prefix
The first balanced prefix is the shortest balanced prefix, thus there are no shorter balanced prefixes and it is its own first balanced prefix.

#### The first and last symbols of a non-empty balanced word are `(` and `)`
The first symbol of a non-empty balanced word is its shortest prefix. Since every prefix must have a difference greater than or equal to zero, the first symbol cannot be a `)` as that would give the first prefix a negative difference. Thus, the first prefix's symbol must be `(` and the first prefix's difference must be one. The difference of the last prefix of a nonempty balanced word must be zero, and the difference of the penultimate prefix cannot be negative one, therefore the last symbol difference of the penultimate prefix must be one, and the last symbol of a non-empty balanced word must be `)`.

We can see this is true with our example word `(()())()`. The first and last symbols are `(` and `)`, the difference of the first prefix is one, and the difference of the penultimate prefix `(()())(` is also one.

#### The difference of the enclosed interior of a non-empty balanced word must be zero
The enclosed interior of a non-empty balanced word is the word formed by the symbols between the opening `(` and the closing `)`. In our example `(()())()`, the enclosed interior is `()())(`. The difference of the complete word is zero, the enclosing `(` and `)` cancel each other out, therefore the difference of the enclosed interior of a non-empty balanced word must be zero.

```
 /\/\        /\/\  
/    \/\  =>     \/
```

#### Every prefix of the enclosed interior of a non-empty balanced word corresponds to a prefix of the penultimate prefix of that non-empty balanced word

For our example `(()())()`, the penultimate prefix is `(()())(` and the enclosed interior is `()())(`:

| `(()())(`  | Difference | `()())(` | Difference |
|:-----------|:-----------|:---------|:-----------|
| `(`        | 1          |          |            |
| `((`       | 2          | `(`      | 1          |
| `(()`      | 1          | `()`     | 0          |
| `(()(`     | 2          | `()(`    | 1          |
| `(()()`    | 1          | `()()`   | 0          |
| `(()())`   | 0          | `()())`  | -1         |
| `(()())(`  | 1          | `()())(` | 0          |

<br/>

The difference of every prefix of the enclosed interior is one less than the difference of the corresponding prefix of the penultiate prefix.

#### If a balanced word is its own first balanced prefix, its enclosed interior will be balanced

- All of an enclosed interior's prefixes will have balances greater than or equal to zero iff all of the balances of the enclosingpenultimate prefix are greater than or equal to one.
- All of the balances of the enclosing penultimate prefix will be greater than or equal to one iff the enclosing penultimate prefix has nobalanced prefixes.
- The enclosing penultimate prefix will have no balanced prefixes iff the balanced word that encloses it is its own first balanced prefix.

If a balanced word is its own balanced prefix, its enclosed interior will have a difference of zero and all of the prefixes of its enclosed interior will have differences greater than or equal to zero, thus its enclosed interior must be balanced.

#### Every non-empty balanced word has a first balanced prefix that consists of a `(` and a `)` enclosing a balanced word
- Every non-empty balanced word has a first balanced prefix.
- That first balanced prefix is a balanced word that is its own first balanced prefix.
- That first balanced prefix consists of a `(` followed by its enclosed interior, followed by `)`
- That enclosed interior is a balanced word.

#### Every non-empty balanced word contains at least one `()`
Every non-empty balanced word has a first balanced prefix that consists of a `(` and a `)` enclosing a balanced word. If the enclosed interior of the first balanced prefix is empty, then our original non-empty balanced word begins with `()`.

But if that first-balanced prefix encloses a non-empty balanced word, then we can recursively apply this level by level, first balanced prefix by first balanced prefix. Our inner strings are successively two parentheses shorter, and since we begin with a finite string... We must reach a two-character balanced string, `()`, in finite time.

1. Our example word `(()())()` begins with a pair of parentheses enclosing an inner balanced word, `(()())`.
2. Since `(()())` is is not `()`, we extract the enclosed word `()()`, that is also balanced. We start over with `()()`.
3. `()()` begins with a pair of parentheses, `()`. It encloses an inner balanced word, the empty string. But we need go no further, we know that  `(()())()` contains `()`, as does *every* non-empty balanced word.

#### Removing `()` from a balanced string repeatedly ends with the empty string
Every balanced string contains a `()`, and since `()` is a balanced string, removing `()` from a balanced string leaves a balanced string that is two characters shorter. Given a finite string, this process must terminate in the empty string or an unbalanced string that does not contain `()`.

[Pattern Matching and Recursion]: https://raganwald.com/2018/10/17/recursive-pattern-matching.html

[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]: https://raganwald.com/2019/02/14/i-love-programming-and-programmers.html

[Dyck Language]: https://en.wikipedia.org/wiki/Dyck_language

[absd]: https://raganwald.com/2018/11/14/dyck-joke.html "Alice and Bobbie and Sharleen and Dyck"