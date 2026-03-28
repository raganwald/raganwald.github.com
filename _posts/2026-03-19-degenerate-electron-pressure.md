---
title: More Pattern Matching, Recursion, and Problem-Solution Isomorphisms
published: true
tags:
  - noindex
  - allonge
---

# Introduction

---

As discussed in [Pattern Matching and Recursion], a one-time popular programming problem was to write a function that would recognize “Balanced Parentheses,” a [Dyck Language]. A fast solution uses a counter to keep track of the difference between the number of open and closed parentheses it encounters as it scans a word from left to right:

```typescript
function isBalanced (candidate: string): boolean {
  let openCount = 0;

  for (let cursor = 0; cursor < word.length; ++cursor) {
    if (openCount < 0) {
      return false;
    }
    else if (word[cursor] === '(') {
      openCount++;
    }
    else if (word[cursor] === ')') {
      openCount--;
    }
    else return false;
  }

  return openCount === 0;
}

test("isBalanced", () => {
  expect(isBalanced('')).toEqual(true);
  expect(isBalanced('(')).toEqual(false);
  expect(isBalanced(')')).toEqual(false);
  expect(isBalanced('()')).toEqual(true);
  expect(isBalanced('(()')).toEqual(false);
  expect(isBalanced('())')).toEqual(false);
  expect(isBalanced('()))')).toEqual(false);
  expect(isBalanced('(())')).toEqual(true);
  expect(isBalanced('(())(')).toEqual(false);
  expect(isBalanced('(())()')).toEqual(true);
});
```

---

### Differences and Prefixes

The code above closely matches a "prefixes and differences" definition of balanced parentheses. A word is balanced if:

1. It has no symbols other than `(` or `)`, and;
1. It has an equal number of `(` and `)`, and;
1. It has no prefixes with more `)` than `(`.

With the balanced word `(()())()`, we can list the prefixes and differences:

| Prefix     | Difference |
| :--------- | :--------- |
| `(`        | 1          |
| `((`       | 2          |
| `(()`      | 1          |
| `(()(`     | 2          |
| `(()()`    | 1          |
| `(()())`   | 0          |
| `(()())(`  | 1          |
| `(()())()` | 0          |

<br/>

We can also visualize a word's differences with a "mountain diagram." To make a mountain diagram, we use `/` and `\` as our "parentheses," instead of `(` and `)`.  Then we "raise" each `/` and "lower" each `\` to make a two-dimensional "mountain range" where the vertical distance represents the difference or level of nesting:

```
 /\/\
/    \/\
```

We can see at a glance that the path traced along the "mountain tops" never drops below the origin point, which is a consequence of the differences never being below zero. And since it ends even with the origin, we know that the difference for the entire word is zero.

---

# Composing and decomposing balanced words

---

Balanced words can be composed through insertions and removals. If we insert a balanced word at the beginning, end, or anywhere within another balanced word, the result is a balanced word. And if we remove a balanced word from the beginning, end, or from within another balanced word, the remainder will be a balanced word.

*Balance is preserved through both insertion and removal.*

These properties of composition and decomposition follow directly from the differences and prefixes definition of balanced words.

### Why balance is preserved through both insertion and removal
#### Concatenation preserves balance
Consider two balanced words, `(()())` and `()`. Their mountain diagrams are:

```
 /\/\
/    \  /\
```

Since they are both balanced, they end at the same level where they begin. What happens if we concatenate them? We get our example balanced word:

```
 /\/\               /\/\
/    \  + /\  =>   /    \/\
```

This is balanced, because given any two balanced words, they both end with a difference of zero and thus the difference of them together will always be zero. And since none of the prefixes for either word have negative differences, the prefixes of the two concatenated together will also have no negative differences. Thus, concatenating any two balanced words results in a balanced word, preserving balance.[^cl]

[^cl]: Balanced parentheses is a concatenative language.
#### Insertion preserves balance
Concatenation is *outer insertion*, insertion that is either before or after another word. Outer insertion preserves balance.

Inserting one balanced word into another, anywhere within it is *inner insertion*. For example, we can insert `()` into `(()())` between the `((` and `)())`, producing `((())())`:

```
       /\                /\
 /           \/\        /  \/\ 
/   +     +     \  =>  /      \
```

	Because we're inserting a word that has a difference of zero, it has no effect of the difference of the result, just as with concatenation. And because it has a difference of zero, it has no effect on the differences of the existing prefixes before or after the insertion point, and thus the none of the differences for the composed word will be negative. Therefore, inserting a balanced word anywhere within a balanced word produces a balanced word, and thus, inner insertion preserves balance.

```typescript
function insert (insertion: string, index: number, word: string) {
  if (!isBalanced(insertion)) throw new RangeError();
  if (index < 0 || index > word.length) throw new RangeError();
  if (!isBalanced(word)) throw new RangeError();

  return `${word.slice(0, index)}${insertion}${word.slice(index)}`;
}

test("insert", () => {
  expect(insert('()', 0, '')).toBe('()');
  expect(insert('()', 0, '()')).toBe('()()');
  expect(insert('()', 1, '()')).toBe('(())');
  expect(insert('()', 2, '()')).toBe('()()');
});
```

#### Every prefix of a balanced word that has a difference of zero, must itself be a balanced word
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

Note that `(()())()` has two prefixes with a difference of zero: `(()())` and itself `(()())()`. While `(()(()))` has only one prefix with a difference of zero, itself. Since both `(()())()`, and `(()(()))` are balanced, we know that none of their prefixes will have a negative difference. Which tells us that *Every prefix of a balanced word that has a difference of zero, must itself be a balanced word.*
#### If we remove a balanced word from the beginning of a balanced word, what remains is a balanced word
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

If the prefix `(()())` has a difference of zero, and if the entire word has a prefix of zero, then the remainder must also have a difference of zero. The remainder's prefixes are shorter than the original prefixes, but the parentheses we remove add up to zero. The prefixes of the remainder as a standalone word are identical to the prefixes of the original word.

In our example word's case:

| Original <br>Prefix | Original<br>Difference | Remainder<br>Prefix | Remainder<br>Difference |
| :------------------ | ---------------------- | ------------------- | ----------------------- |
| `(()())(`           | 1                      | `(`                 | 1                       |
| `(()())()`          | 0                      | `()`                | 0                       |

Since none of the original prefixes of a balanced word can have a negative difference, it follows that none of the prefixes of the remainder after removing a balanced word can have a negative difference.
  
If a word has a balanced prefix, the remainder of the word following the balanced prefix is also balanced. Which means, *If we remove a balanced word from the beginning of a balanced word, what remains is a balanced word.*
#### If we remove a balanced word from within a balanced word, the remainder must be balanced
Removing a balanced word from the beginning or the end of a word is the inverse of concatenating two words. Can we remove balanced words from within balanced words? And if so, must what remains be balanced?

```
 /\/\        /\/\       
/    \/\  -        => /\/\
```

As with removing words from the beginning or the end, if we remove a substring of a balanced word that has a difference of zero—such as a balanced word—the remainder must also have a difference of zero, whether the substring we remove is balanced or not. Since what remains has no prefixes with negative differences, *If we remove a balanced word from within a balanced word, the remainder must be balanced.*

```typescript
function wordAt (index: number, word: string) {
  if (index < 0 || index > word.length) throw new RangeError();
  if (!isBalanced(word)) throw new RangeError();
 
  let openCount: number = 0;

  for (let cursor = index; cursor < word.length; ++cursor) {
    if (openCount < 0) {
      return '';
    }
    else if (word[cursor] === '(') {
      openCount++;
    }
    else if (word[cursor] === ')') {
			openCount--;
    }
    else return '';

    if (openCount === 0) return word.slice(index, cursor + 1);
  }

  return '';
}

test("wordAt", () => {
  expect(wordAt(0, '')).toBe('');
  expect(wordAt(0, '()')).toBe('()');
  expect(wordAt(1, '()')).toBe('');
  expect(wordAt(0, '(()())()')).toBe('(()())');
  expect(wordAt(1, '(()())()')).toBe('()');
  expect(wordAt(3, '(()())()')).toBe('()');
  expect(wordAt(6, '(()())()')).toBe('()');
});

function remove (index: number, word: string) {
  if (index < 0 || index > word.length) throw new RangeError();
  if (!isBalanced(word)) throw new RangeError();

  return `${word.slice(0, index)}${word.slice(index + wordAt(index, word).length)}`;
}

test("remove", () => {
  expect(remove(0, '')).toBe('');
  expect(remove(0, '()')).toBe('');
  expect(remove(0, '(()())()')).toBe('()');
  expect(remove(1, '(()())()')).toBe('(())()');
  expect(remove(3, '(()())()')).toBe('(())()');
  expect(remove(6, '(()())()')).toBe('(()())');
});
```

Inserting a balanced word at the beginning, end, or within another balanced word always leaves a balanced remainder. And inversely, removing a balanced word from the beginning, end, or within a balanced word always leaves a balanced remainder.

#### Insert and remove are inverse operations.

If we insert some balanced word *x* into balanced word *y* at position *i*, we end up with *z*, a word that contains *x* and *y*, although *y* may be split into two halves. Removing *x* from *y* at the same index restores *w*.

---

## Further consequences of composition and decomposition

---

Here's a [cheeky][absd] function that recognizes balanced parentheses:

```typescript
function isBalanced (candidate: string): boolean {
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

### Why the Cheeky Solution Works

We already know that if we remove a balanced word from a balanced word, what remains will be a shorter, balanced word. It follows that *If every non-empty balanced word contains at least one `()` substring, then recursively removing the first `()` of a non-empty balanced word will reach the empty string in finite time and halt.*

We will prove that that every non-empty balanced word contains at least one `()` substring by contradiction:

1. The first symbol of a non-empty balanced word must be a `(`, and;
2. A balanced word that begins with `(` must contain at least one `()`, and;
3. Recursively removing `()` from a balanced word halts when we reach the empty string.

#### The first symbol of a non-empty balanced word must be a `(`.
The first symbol of a non-empty balanced word is its shortest prefix. Since no prefix may have a negative difference, the first symbol cannot be a `)` as that would give the first prefix a negative difference. Thus, the first prefix's symbol must be `(`:

```
(...
```

#### A balanced word that begins with `(` must contain at least one `()`
Now let's assume that a balanced word exists that does **not** contain a `()` substring. What is this word's second symbol? It can't be a `)`, because then it would begin with `()`, contradicting our claim that this word does not contain a `()`. So the second symbol must also be a `(`:

```
((...
```

How about the third symbol? The foruth? The 19,620,614th? This can continue to infinity, but in a finite word we eventually have to start including some `)))` to bring the difference down to zero, and when we do so, we must introduce a `()`. This establishes a contradiction, therefore it is not possible for a balanced word to not have at least one `()`, thus *Every non-empty balanced word contains at least one `()`*.

#### Recursively removing `()` from a balanced word halts when we reach the empty string
Every balanced string contains a `()`, and since `()` is a balanced string, removing `()` from a balanced string leaves a balanced string that is two characters shorter. Given a finite string, this process must terminate in the empty string or an unbalanced string that does not contain `()`.

This explains why the cheeky solution works: The cheeky solution repeatedly removes every `()` from a word until there is no `()` to remove, at which point it returns `true` if what remains is the empty string, `false` otherwise.

---

### Removals and Insertions

"Remove" and "Insert" are inverse operations:

```typescript
test("inversions", () => {
  expect(remove(1, '(()())()')).toBe('(())()');
  expect(remove(1, '(())()')).toBe('()()');
  expect(remove(0, '()()')).toBe('()');
  expect(remove(0, '()')).toBe('()()');

  expect(insert('()', 0, '')).toBe('()');
  expect(insert('()', 0, '()')).toBe('()()');
  expect(insert('()', 1, '()()')).toBe('(())()');
  expect(insert('()', 1, '(())()')).toBe('(()())()');
});
```

The removals demonstrate that the balanced word `(()())()` can be reduced to the empty string by repeatedly removing a `()`. The insertions undo the removals in reverse order that the removals were applied, restoring the original string.

#### Every Balanced Word can be created by repeatedly inserting `()`

Since every balanced word can be reduced to the empty string with repeated removals, every balanced word can also be created with repeated insertions. This follows logically, but given a balanced word, can we find the necessary insertions to create it? Certainly, using the same approach as the recognizer:

```typescript
function insertionsFor (word: string): number[] {
  if (!isBalanced(word)) throw new RangeError();

  const insertions: number[] = [];
  let wordInProgress = word;

  while (wordInProgress !== '') {
    const nextPairIndex = wordInProgress.indexOf('()');

    insertions.unshift(nextPairIndex);
    wordInProgress = remove(nextPairIndex, wordInProgress);
  }

  return insertions;
}

test("insertionsFor", () => {
  expect(insertionsFor('')).toEqual([]);
  expect(insertionsFor('()')).toEqual([0]);
  expect(insertionsFor('()()')).toEqual([0, 0]);
  expect(insertionsFor('(())()')).toEqual([0, 0, 1]);
  expect(insertionsFor('(()())()')).toEqual([0, 0, 1, 1]);
});

function reconstitute (insertions: number[]): string {
  return insertions.reduce(
    (wordInProgress, index) => insert('()', index, wordInProgress),
    ''
  );
}

test("reconstitute", () => {
  expect(reconstitute(insertionsFor(''))).toBe('');
  expect(reconstitute(insertionsFor('()()'))).toBe('()()');
  expect(reconstitute(insertionsFor('(())()'))).toBe('(())()');
  expect(reconstitute(insertionsFor('(()())()'))).toBe('(()())()');
});
```

---

- conceit could be aware boards with one or no beads in them to indicate left and right untyped
- typed recognizer is below
- the stack-free recognizer using function calls as the stack.
- bijections and insertion lists

## Sw!pe File

#### The first and last symbols of every non-empty balanced word are `(` and `)`
The first symbol of a non-empty balanced word is its shortest prefix. Since no prefix may have a negative difference, the first symbol cannot be a `)` as that would give the first prefix a negative difference. Thus, the first prefix's symbol must be `(` and the first prefix's difference must be one.

The difference of the last prefix of a nonempty balanced word must be zero, and the difference of the penultimate prefix cannot be negative one, therefore the last symbol difference of the penultimate prefix must be one, and the last symbol of a non-empty balanced word must be `)`. We can see this is true with our example word `(()())()`. The first and last symbols are `(` and `)`, the difference of the first prefix is one, and the difference of the penultimate prefix `(()())(` is also one.

#### Every non-empty balanced word has a first balanced prefix
A non-empty balanced word is its own last prefix, therefore every non-empty balanced word has at least one balanced prefix, which by definition is itself a balanced word. One, the shortest, is its first balanced prefix. For our example word `(()())()`, the first balanced prefix is `(()())`.

#### The first balanced prefix is its own first balanced prefix
The first balanced prefix is the shortest balanced prefix, thus there are no shorter balanced prefixes and it is its own first balanced prefix.

#### The first and last symbols of a non-empty balanced word are `(` and `)`
The first symbol of a non-empty balanced word is its shortest prefix. Since no prefix may have a negative difference, the first symbol cannot be a `)` as that would give the first prefix a negative difference. Thus, the first prefix's symbol must be `(` and the first prefix's difference must be one.

The difference of the last prefix of a nonempty balanced word must be zero, and the difference of the penultimate prefix cannot be negative one, therefore the last symbol difference of the penultimate prefix must be one, and the last symbol of a non-empty balanced word must be `)`.

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

The difference of every prefix of the enclosed interior is one less than the difference of the corresponding prefix of the penultimate prefix.

#### If a balanced word is its own first balanced prefix, its enclosed interior will be balanced
If a balanced word is its own first balanced prefix, then none of its prefixes up to and including its penultimate prefix ("penultimate prefixes") will be balanced. And If none of its penultimate prefixes are balanced, then none of the penultimate prefixes have a difference of zero.

If the differences of the prefixes of the balanced word's enclosed interior are one less than the differences of the penultimate prefixes of the balanced word, and if none of the penultimate prefixes of the balanced word have a difference of zero, then none of the prefixes of the balanced word's enclosed interior will have a negative difference.

If the enclosed interior of a balanced word has a difference of zero, and none of its prefixes have a negative difference, then the enclosed interior of a balanced word must be balanced.
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