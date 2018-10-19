---
tags: [recursion,allonge]
---

A  popular programming "problem" is to determine whether a string of parentheses is "balanced:"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

For example:

|Input|Output|Comment|
|:----|:-----|:------|
|`'()'`|`true`||
|`'(())'`|`true`|parentheses can nest|
|`'()()'`|`true`|multiple pairs are acceptable|
|`'()()())()'`|`true`|multiple pairs can nest|
|`'((()'`|`false`|missing closing parentheses|
|`'()))'`|`false`|missing opening parentheses|
|`')('`|`false`|close before open|

<br/>

There are a number of approaches to solving this problem. Some optimize for brevity of the solution, others optimize for space and/or running time.

Naturally, everyone also attempts to optimize for understandability. Most of the time, this means optimizing for understanding what the code does and how it does it. But an interesting approach to writing code is to attempt to make the "shape" of the solution match the "shape" of the problem.

Let's consider this approach--matching the shape of the solution to the shape of the problem--for balanced parentheses.

---

[![helvetica Parentheses](/assets/images/balanced/helvetica.jpg)](https://www.flickr.com/photos/veganstraightedge/5533215141)

### the shape of the balanced parentheses problem

If we take a certain kind of "mathematical" approach to defining the problem we're trying to solve, we can reduce the definition of a balanced string of parentheses to:

1. `()` is balanced.
2. `()`, followed by a balanced string, is balanced.
3. `(`, followed by a balanced string, followed by `)`, is balanced.
4. `(`, followed by a balanced string, followed by `)`, followed by a balanced string, is balanced.

The "shape" of this definition is that there are four cases. The first is a "base" or "irreducible" case. The second, third, and fourth cases are self-referential: They define ways to build more complex balanced strings from simpler balanced strings.

Definitions like this are *declarative*: They describe rules or patterns for recognizing a balanced string, not a step-by-step algorithm for determining whether a string is balanced.

So what would a solution look like if we tried to make it the same shape as this definition? It would:

1. Describe a pattern, not a step-by-step algorithm, and;
2. It would have two cases, one recursive, one repeated.

Of course, there's one obvious way to implement a pattern that recognizes particular strings.

---

[![regex, because a computer is a terrible thing to waste](/assets/images/balanced/waste.jpg)](https://www.flickr.com/photos/lugola/1424686646)

### regular expressions

 > Some people, when confronted with a problem, think "I know, I'll use regular expressions." Now they have two problems.—Jamie Zawinski

When it comes to recognizing strings, [regular expressions][regex] are the usual go-to tool. However, regular expressions define [regular languages], and regular languages cannot match balanced parentheses.

[regular languages]: http://en.wikipedia.org/wiki/Regular_Language

[regex]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

Two of the three cases in our pattern include a recursive self-reference, and standard regular expressions—including JavaScript's regular expression implementation—cannot implement self-references. Perl and some other languages include non-standard extensions to regular expressions, including features for creating recursive patterns.

In such languages, `(?:(\((?R)\))+` matches balanced parentheses, and for people who understand regular expressions well, the shape of the expression matches the shape of problem we're solving. That being said, there are two problems with this solution. First, JavaScript isn't one of those languages, so we can't use that extended regular expression.

But even if it was, regular expressions optimize for compactness, but aren't always obvious and clear, even if the expression's shape matches the problem's shape. So, what can we do?

[Greenspun] our own pattern-matching, that's what we can do.

[Greenspun]: https://en.wikipedia.org/wiki/Greenspun's_tenth_rule

---

[![Bletchley Quilt](/assets/images/balanced/quilt.jpg)](https://www.flickr.com/photos/inkyswot/6454615343)

### greenspunning our own pattern-matching

Let's posit that instead of using an embedded pattern-matching language like regular expressions, we use functions.

We'll start by defining our "api" for functions that match strings. With regular expressions, patterns can be set up to match anywhere in a string, just the beginning of the string, just the end, or the entire string.

We'll start with the idea of a function that matches a string based on the beginning of the string. If it matches, it returns what it matched. If it doesn't match, it returns `false`. For example:

```javascript
const isGreeting =
  input =>
    input.startsWith('hello') &&
    'hello';

isGreeting('fubar')
  //=> false

isGreeting('hello world')
  //=> 'hello'
```

We don't want to write all that out every time we want to match something, so we can make a higher-order function that makes simple string match functions:

```javascript
const just =
  target =>
    input =>
      input.startsWith(target) &&
      target;

just('(')('((()))')
  //=> '('

just(')')('((()))')
  //=> false
```

This is not enough, of course.

---

[![2222 holes](/assets/images/balanced/holes.jpg)](https://www.flickr.com/photos/generated/1279482588)

### composing patterns

We have written `just`, a function that makes a simple pattern matching the start of a string. We'll also need a way to *compose* patterns. Let's review the shape of our problem:

1. `()` is balanced.
2. `()`, followed by a balanced string, is balanced.
3. `(`, followed by a balanced string, followed by `)`, is balanced.
4. `(`, followed by a balanced string, followed by `)`, followed by a balanced string, is balanced.

For the first case, we can use `just` right out of the box. This will only match balanced substrings strings at the start of a string, but we'll address matching the entire string later:

```javascript
const case1 = just('()');

case1('(()')
  //=> false

case1('(())')
  //=> false

case1('()')
  //=> '()'
```

Writing the second case involves two new ideas. First, we need to have a way of describing a pattern that matches two or more other patterns in succession:

```javascript
const follows =
  (...patterns) =>
    input => {
      let matchLength = 0;
      let remaining = input;

      for (const pattern of patterns) {
        const matched = pattern(remaining);

        if (matched === false) return false;

        matchLength = matchLength + matched.length;
        remaining = input.slice(matchLength);
      }

      return input.slice(0, matchLength);
    };

follows(just('fu'), just('bar'))('foobar')
  //=> false

follows(just('fu'), just('bar'))('fubar\'d')
  //=> 'fubar'
```

Next, we'll need a way to describe a pattern that is made out of other patterns, each of which represents one case.

There are multiple ways to interpret the semantics of matching multiple cases. For example, if two or more cases match, we could take the first match, or the longest match. For this problem, two or more cases can easily both match, e.g. `()()` could match either the first or second cases. We're going to write our function such that when two or more cases match, it picks the longest match.

```javascript
const cases =
  (...patterns) =>
    input => {
      const matches = patterns.map(p => p(input)).filter(m => m !== false);

      if (matches.length === 0) {
        return false;
      } else {
        return matches.sort((a, b) => a.length > b.length ? -1 : +1)[0]
      }
    };

const badNews = cases(
  just('fubar'),
  just('snafu')
)

badNews('snafu')
  //=> '()'
```

And now to describe the second case. We'll use `cases` to define `balanced` from the first two cases, and we'll reply on JavaScript's name binding to implement recursion in the second case:

```javascript
const balanced =
  input => cases(
    just('()'),
    follows(just('()'), balanced)
  )(input);

balanced('()')
  //=> '()'

balanced('()()()')
  //=> '()()()'
```

Adding support for the third and fourth cases is straightforward:

```javascript
const balanced =
  input => cases(
    just('()'),
    follows(just('()'), balanced),
    follows(just('('), balanced, just(')')),
    follows(just('('), balanced, just(')'), balanced)
  )(input);

balanced('(())(')
  //=> '(())('

balanced('(()())()')
  //=> '(()())()'
```

Before we go on, a digression about recursion.

---

[![children's choice](/assets/images/balanced/carts.jpg)](https://www.flickr.com/photos/thadz/26640191682)

### recursion vs iteration

The snippets `follows(just('()'), balanced)` and `follows(just('('), balanced, just(')'), balanced)` are very interesting. they handle cases like `()`, `()()`, `()()()`, and so forth, without any need for a special higher-order pattern meaning "match one or more of this pattern."

Our code does this using recursion. Which is not surprising, recursion is a way to implement what most programming languages implement with iteration and repetition. What's intersting is that repeating patterns are very common, and yet regular expressions can't implement recursion. So how do they handle repeating patterns?

Standard regular expressions use the postfix operators, `*` and `+` to handle the cases where we need zero or more of a pattern, or one or more of a pattern. So in a regular expression, we would write `(?:\(\))+` to define a patterns matching one or more instances of `()` in succession.

Although it's not strictly necessary, we could write such pattern modifiers ourselves. For example, here's "one or more" (equivalent to `+`):

```javascript
const oneOrMore =
  pattern =>
    input => {
      let matchedLength = 0;
      let remaining = input;

      while (remaining.length > 0) {
        const matched = pattern(remaining);

        if (matched === false || matched.length === 0) break;

        matchedLength = matchedLength + matched.length;
        remaining = remaining.slice(matched.length);
      }

      return matchedLength > 0 && input.slice(0, matchedLength);
    };
```

"Zero or more" is almost exactly the same, only the last line changes:

```javascript
const zeroOrMore =
  pattern =>
    input => {
      let matchedLength = 0;
      let remaining = input;

      while (remaining.length > 0) {
        const matched = pattern(remaining);

        if (matched === false || matched.length === 0) break;

        matchedLength = matchedLength + matched.length;
        remaining = remaining.slice(matched.length);
      }

      return input.slice(0, matchedLength);
    };
```

If we want to use `oneOrMore`, instead of writing:

```javascript
const balanced =
  input => cases(
    just('()'),
    follows(just('()'), balanced),
    follows(just('('), balanced, just(')')),
    follows(just('('), balanced, just(')'), balanced)
  )(input);
```

We can write:

```javascript
const balanced =
  input =>
    oneOrMore(
      cases(
        just('()'),
        follows(just('('), balanced, just(')'))
      )
    )(input);
```

This is more compact. Is it better? Perhaps. It does change our definition. Instead of saying that a balanced string conforms to one of four cases, we're now saying: *A balanced string conforms to one of two cases, repeated one or more times.* If, in our opinion, this is equally understandable, or even superior, that's what we should use.

---

[![construction](/assets/images/balanced/construction.jpg)](https://www.flickr.com/photos/erh1103/7173288223)

### extending our pattern to handle multiple types of parentheses

A common extension to the problem is to match multiple types of parentheses. We can handle this requirement with both the recursive and "oneOrMore" implementations:

```javascript
const balanced =
  input => cases(
    just('()'),
    follows(just('()'), balanced),
    follows(just('('), balanced, just(')')),
    follows(just('('), balanced, just(')'), balanced),
    just('[]'),
    follows(just('[]'), balanced),
    follows(just('['), balanced, just(']')),
    follows(just('['), balanced, just(']'), balanced),
    just('{}'),
    follows(just('{}'), balanced),
    follows(just('{'), balanced, just('}')),
    follows(just('{'), balanced, just('}'), balanced)
  )(input);
```

It's a little wordy,[^wordy] but the code clearly describes what kinds of patterns it matches. And here's the `oneOrMore` implementation:

[^wordy]: It's just JavaScript, so it's easy enough to make this more compact using functions that write patterns for us.

```javascript
const balanced =
  input =>
    oneOrMore(
      cases(
        just('()'),
        follows(just('('), balanced, just(')')),
        just('[]'),
        follows(just('['), balanced, just(']')),
        just('{}'),
        follows(just('{'), balanced, just('}'))
      )
    )(input);
```

We'll need one more thing to complete our solution: We need to match strings that are entirely balanced, not just strings that have a balanced prefix:

To complete the problem we need to match strings that are entirely balanced, not just starting with balanced:

```javascript
const entirely =
  pattern =>
    input => {
      const matched = pattern(input);

      return matched !== false &&
        matched === input &&
        matched;
    };

const fubar = entirely(just('fubar'));

fubar('fubar stands for effed up beyond recognition')
  //=> false

fubar('fubar')
  //=> 'fubar'
```

And putting it all together:

```javascript
const entirelyBalanced = entirely(balanced);

entirelyBalanced('({}(()))(()')
  //=> false

entirelyBalanced('({()[]})[[(){}]]')
  //=> ({()[]})[[(){}]]
```

Success!

---

[![Finish](/assets/images/balanced/finish.jpg)](https://www.flickr.com/photos/craigmoulding/8532680078)

### the complete solution

The supporting functions we need to implement our pattern-matching abstraction is:

```javascript
const just =
  target =>
    input =>
      input.startsWith(target) &&
      target;

const cases =
  (...patterns) =>
    input => {
      const matches = patterns.map(p => p(input)).filter(m => m !== false);

      if (matches.length === 0) {
        return false;
      } else {
        return matches.sort((a, b) => a.length > b.length ? -1 : +1)[0]
      }
    };

const follows =
  (...patterns) =>
    input => {
      let matchLength = 0;
      let remaining = input;

      for (const pattern of patterns) {
        const matched = pattern(remaining);

        if (matched === false) return false;

        matchLength = matchLength + matched.length;
        remaining = input.slice(matchLength);
      }

      return input.slice(0, matchLength);
    };

const zeroOrMore =
  pattern =>
    input => {
      let matchedLength = 0;
      let remaining = input;

      while (remaining.length > 0) {
        const matched = pattern(remaining);

        if (matched === false || matched.length === 0) break;

        matchedLength = matchedLength + matched.length;
        remaining = remaining.slice(matched.length);
      }

      return input.slice(0, matchedLength);
    };

const entirely =
  pattern =>
    input => {
      const matched = pattern(input);

      return matched !== false &&
        matched === input &&
        matched;
    };
```

With these in hand, we can implement our solution with either:

```javascript
const balanced =
  input => cases(
    just('()'),
    follows(just('()'), balanced),
    follows(just('('), balanced, just(')')),
    follows(just('('), balanced, just(')'), balanced),
    just('[]'),
    follows(just('[]'), balanced),
    follows(just('['), balanced, just(']')),
    follows(just('['), balanced, just(']'), balanced),
    just('{}'),
    follows(just('{}'), balanced),
    follows(just('{'), balanced, just('}')),
    follows(just('{'), balanced, just('}'), balanced)
  )(input);

const entirelyBalanced = entirely(balanced);
```

Or:

```javascript
const balanced =
  input =>
    oneOrMore(
      cases(
        just('()'),
        follows(just('('), balanced, just(')')),
        just('[]'),
        follows(just('['), balanced, just(']')),
        just('{}'),
        follows(just('{'), balanced, just('}'))
      )
    )(input);

const entirelyBalanced = entirely(balanced);
```

Are these good? Bad? Terrible?

---

[![In the balance](/assets/images/balanced/balance.jpg)](https://www.flickr.com/photos/58827557@N06/37056877150)

### the good, the bad, and the ugly

The very good news about our solution is that the form of the solution exactly replicates the form of the problem statement as we defined it.

The bad news is that we require much more supporting code for our abstraction than code describing the solution. This is generally thought to be fine when we reuse this abstraction multiple times, amortizing the cost of the implementation across multiple uses. But for a one-off, it requires the reader of the code to grok our solution and the implementation of pattern-matching. That can be a bit much.

The ugly is that this particular implementation of pattern matching is slow and wasteful of memory. There is a silver lining, though: If we write some code in one place, and it is slow, when we optimize that code, it gets faster.

When we write an abstraction layer that is used by many pieces of code, and it is slow, all of those pieces of code are slow. Terrible! But that same leverage applies when we optimize that abstraction layer's code. All of the code that uses it gets faster, "for free."

At the end of the day, when we have a problem that looks like a pattern, we should at least consider writing a solution structured to match the structure of the pattern. And if the structure of the problem is recursive, then we should likewise consider making the structure of our solution recursive.

*the end*

---

[![Image taken from page 161 of 'The Odyssey of Homer'](/assets/images/balanced/ps.jpg)](https://www.flickr.com/photos/mechanicalcuratorcuttings/10410067513)

### postscript

When this puzzle is given as an interview question, interviewers are often looking for insights such as "The given requirements for balancing one type of parenthesis is functionally equivalent to the following definition: A string is balanced if:"

1. The number of opening parentheses is exactly equal to the number of closed parentheses, **and**;
2. For every prefix of a balanced string, the number of opening parentheses is equal to or greater than the number of closing parentheses.

Form there, we can write a very fast solution that executes in constant space with linear time, simply by iterating through the string while incrementing a counter for each opening parenthesis, and decrementing it for each closing parenthesis. If the counter ever goes negative, the string is not balanced. If it stays zero or positive up to the penultimate character, and is zero at the end, then the string is balanced.

That is very fast, but is certainly not optimizing for understandability. Besides studying commonly asked interview questions, the usual road to this optimization is greenspunning our own stack of parentheses, and then noticing that all we care about is whether the we ever try to pop a non-existant character off the stack. A counter is equivalent for the simple case where we only have one type of parenthesis to manage.

That being said, we'll never get to that "optimization" if we begin with pattern matching. Is that a bad thing? Probably not.

---

# Notes
