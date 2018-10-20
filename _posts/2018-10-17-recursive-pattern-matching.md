---
title: "Pattern Matching and Recursion"
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
|`'(()()())()'`|`true`|multiple pairs can nest|
|`'((()'`|`false`|missing closing parentheses|
|`'()))'`|`false`|missing opening parentheses|
|`')('`|`false`|close before open|

<br/>

There are a number of approaches to solving this problem. Some optimize for brevity of the solution, others optimize for space and/or running time.

Naturally, everyone also attempts to optimize for understandability. Most of the time, this means optimizing for understanding what the code does and how it does it. For example, this code is quite readable in the sense of understanding what the code does:

```javascript
const balanced =
  input => {
    let openParenthesesCount = 0;
    let closeParenthesesCount = 0;

    for (let i = 0; i < input.length; ++i) {
      const c = input[i];

      if (c === '(') {
        ++openParenthesesCount;
      } else if (c === ')') {
        ++closeParenthesesCount;
      } else return false;

      if (closeParenthesesCount > openParenthesesCount) return false;
    }

    return closeParenthesesCount === openParenthesesCount;
  };
```

There's a small optimization available to use just one counter that increments and decrements, but it is not to difficult to understand what this code *does*, and from there we might be able to deduce that a balanced string is one where:

1. There are an equal number of open and closed parentheses, and;
2. For any prefix (i.e. a substring that includes the first character), there are at least as many open as closed parentheses.

But even if we make this deduction, does that really help us understand that the problem we're trying to solve is handling well-formed parenthetical expressions? These facts about the counts of parentheses are true of balanced strings, but they aren't what we're trying to communicate.

The "shape" of the problem does not really represent the shape of the solution presented.

Let's consider a different approach--matching the shape of the solution to the shape of the problem--for balanced parentheses.

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
2. It would have four cases.

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

And now to describe the second case. We'll use `cases` to define `balanced` from the first two cases, and we'll rely on JavaScript's name binding to implement recursion in the second case:

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
  //=> '(())'

balanced('(()())()')
  //=> '(()())()'
```

And here we come to a place to evaluate the way we've formulated our rules.

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

The original depiction of the problem requirements was the following four rules:

1. `()` is balanced.
2. `()`, followed by a balanced string, is balanced.
3. `(`, followed by a balanced string, followed by `)`, is balanced.
4. `(`, followed by a balanced string, followed by `)`, followed by a balanced string, is balanced.

That led to this implementation:

```javascript
const balanced =
  input => cases(
    just('()'),
    follows(just('()'), balanced),
    follows(just('('), balanced, just(')')),
    follows(just('('), balanced, just(')'), balanced)
  )(input);
```
If we change the problem statement such that a balanced string is:

1. A balanced string is a sequence of one or more strings conforming to either of the following cases:
  1. `()`
  2. `(`, followed by a balanced string, followed by `)`

That leads to this compact implementation:

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

Is this better? Sometimes a more compact definition is considerably better. Sometimes, as with playing code golf, the code is correct, but actually harder to understand. This general problem--how compact is too compact--crops up with recursion all the time. It is mathematically advantageous to be able to implement things like iteration with recursion, and even to [implement recursion without name binding][ToGrokAMockingbird], but in practice, our code is clearer with name binding and looping constructs.

[ToGrokAMockingbird]: http://raganwald.com/2018/08/30/to-grok-a-mockingbird.html "To Grok a Mockingbird"

The same is true of composing patterns. Sometimes, the most compact form is most elegant, but less readable than one that lists more cases explicitly. Since most of us are familiar with regular expressions, we'll continue this essay presuming that using `oneOrMore` or `zeroOrMore` is advantageous.

---

[![nothing is nothing](/assets/images/balanced/nothing.jpg)](https://www.flickr.com/photos/darwinbell/272818496)

### another look at the degenerate case

Both the original and "compact" implementation included the "base" case of `just('()')`. With recursive problems, there's always some kind of base case that is irreducible, and if we presume that an empty string is not balanced, `()` is our irreducible case.

But why do we assume that? It isn't one of the cases given at the top of the essay, and as this problem is usually presented, what to do with an empty string is usually not mentioned one way or the other.[^pizzarollexpert]

[^pizzarollexpert]: This discussion of treating the empty string as balanced was provoked by [pizzarollexpert](https://www.reddit.com/user/PizzaRollExpert)'s excellent comment on Reddit.

In a production environment, sometimes we are given all of the requirements and have no flexibility. If we aren't told how to handle something like the empty string, we ask and have to implement whatever answer we are given. Of course, sometimes the missing requirement is entirely up to us to implement as we see fit. This is actually the usual case. Every time we implement something non-trivial, it implements its stated requirements, and then there are a bunch of "undocumented behaviours" outside of the requirements.[^conspiracy]

[^conspiracy]: That undocumented behaviour becomes the source of headaches when the code evolves and changes the undocumented behaviour while remaining compatible with the documented requirements. For decades, one of the reasons that it was very difficult to emulate the Windows environment on on-Windows platforms was that even if the implementation replicated the documented API in every respect, production applications had become dependent upon undocumented behaviour, to the point that the only real specification for Windows was Windows. Did Microsoft encourage application developers to depend on undocumented behaviour, because it was a competitive advantage preventing competition from making Windows-compatible platforms? Hmmm...

But let's consider the possibility that we can unilaterally declare that the empty string is balanced. It certainly isn't unbalanced! If the empty string is balanced, we can actually make an even more compact rule:

1. A balanced string is a sequence of **zero** or more strings conforming to the following rule:
  1. . `(`, followed by a balanced string, followed by `)`

And our implementation is:

```javascript
const balanced =
  input =>
    zeroOrMore(
      follows(just('('), balanced, just(')'))
    )(input);
```

Notice that although we introduced the `oneOrMore` and `zeroOrMore` higher-order-patterns, and although we interpreted an unstated requirement requirements in such a way to produce a more compact implementation, we are still employing the same approach of determining the shape of the problem and then creating an implementation that matches the shape of the problem as we understand it.

---

[![construction](/assets/images/balanced/construction.jpg)](https://www.flickr.com/photos/erh1103/7173288223)

### extending our pattern to handle multiple types of parentheses

A common extension to the problem is to match multiple types of parentheses. We can handle this requirement with two more cases:

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

const entirely =
  pattern =>
    input => {
      const matched = pattern(input);

      return matched !== false &&
        matched === input &&
        matched;
    };
```

With these in hand, we implement our solution with:

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

Is this good? Bad? Terrible?

---

[![In the balance](/assets/images/balanced/balance.jpg)](https://www.flickr.com/photos/58827557@N06/37056877150)

### the good, the bad, and the ugly

The very good news about our solution is that the form of the solution exactly replicates the form of the problem statement as we defined it.

The bad news is that we require much more supporting code for our abstraction than code describing the solution. This is generally thought to be fine when we reuse this abstraction multiple times, amortizing the cost of the implementation across multiple uses. But for a one-off, it requires the reader of the code to grok our solution and the implementation of pattern-matching. That can be a bit much.

The ugly is that this particular implementation of pattern matching is slow and wasteful of memory. There is a silver lining, though: If we write some code in one place, and it is slow, when we optimize that code, it gets faster.

When we write an abstraction layer that is used by many pieces of code, and it is slow, all of those pieces of code are slow. Terrible! But that same leverage applies when we optimize that abstraction layer's code. All of the code that uses it gets faster, "for free."

At the end of the day, when we have a problem that looks like a pattern, we should at least consider writing a solution structured to match the structure of the pattern. And if the structure of the problem is recursive, then we should likewise consider making the structure of our solution recursive.

*the end*

(discuss on [reddit](https://www.reddit.com/r/javascript/comments/9pmabr/pattern_matching_and_recursion/))

---

# Notes
