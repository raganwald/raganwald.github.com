---
tags: [recursion,allonge]
---

A  popular programming "problem" is to determine whether a string of parentheses is "balanced:"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

For example:

|Input|Output|Comment|
|:----|:-----|:------|
|`''`|`true`|the degenerate case|
|`'()'`|`true`||
|`'(())'`|`true`|parentheses can nest|
|`'()()'`|`true`|multiple pairs are acceptable|
|`'((()'`|`false`|missing closing parentheses|
|`'()))'`|`false`|missing opening parentheses|
|`')('`|`false`|close before open|

There are a number of approaches to solving this problem. Some optimize for brevity of the solution, others optimize for space and/or running time.

Naturally, everyone also attempts to optimize for understandability. Most of the time, this means optimizing for understanding what the code does and how it does it. But an interesting approach to writing code is to attempt to make the "shape" of the solution match the "shape" of the problem.

Let's consider this approach for balanced parentheses.

---

### the shape of the balanced parentheses problem

If we take a certain kind of "mathematical" approach to defining the problem we're trying to solve, we can reduce the definition of a balanced string of parentheses to:

1. A sequence of zero or more balanced strings is balanced, and;
2. An opening parenthesis, followed by a balanced string, followed by a closing parenthesis, is balanced.

The "shape" of this definition is that there are two cases, and both of those cases is recursive. And most interestingly, this definition is declarative: It describes a rule or pattern for recognizing a balanced string, not a step-by-step algorithm for determining whether a string is balanced.

So what would a solution look like if we tried to make it the same shape as this definition? It would:

1. Describe a pattern, not a step-by-step algorithm, and;
2. It would have two cases, one recursive, one repeated.

Of course, there's one obvious way to implement a pattern that recognizes particular strings.

---

### regular expressions

 > Some people, when confronted with a problem, think "I know, I'll use regular expressions." Now they have two problems.—Jamie Zawinski

When it comes to recognizing strings, [regular expressions][regex] are the usual go-to tool. However, regular expressions define [regular languages], and regular languages cannot have balanced parentheses.

[regular languages]: http://en.wikipedia.org/wiki/Regular_Language

[regex]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

Both of the cases in our pattern include a recursive self-reference, and standard regular expressions—including JavaScript's regular expression implementation—cannot implement self-references. Perl and some other languages include non-standard extensions to regular expressions, including features for creating recursive patterns.

In such languages, `(?:(\((?R)\))*` matches balanced parentheses, and for people who understand regular expressions well, the shape of the expression matches the shape of problem we're solving. That being said, there are two problems with this solution. First, JavaScript isn't one of those languages, so we can't use that extended regular expression.

But even if it was, regular expressions optimize for compactness, but aren't always obvious and clear, even if the expression's shape matches the problem's shape. So, what can we do?

[Greenspun] our own pattern-matching, that's what we can do.

[Greenspun]: https://en.wikipedia.org/wiki/Greenspun's_tenth_rule

---

### greenspunning our own pattern-matching

Let's posit that instead of using an embedded pattern-matching language like regular expressions, we use functions. 

We'll start by defining our "api" for functions that match strings. With regular expressions, patterns can be set up to match anywhere in a string, just the beginning of the string, just the end, or the entire string.

We'll start with the idea of a function that matches a string based on the beginning of the string. If it matches, it returns what it matched. If it doesn't match, it returns `false`. For example:

```javascript
const isGreeting =
  input =>
    typeof input === 'string' &&
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
      typeof input === 'string' &&
      input.startsWith(target) &&
      target;

just('(')('((()))')
  //=> '('

just(')')('((()))')
  //=> false
```

This is not enough, of course.

---

### composing patterns

We have written `just`, a function that makes a simple pattern matching the start of a string. We'll also need a way to *compose* patterns. Let's review the shape of our problem:

1. A sequence of zero or more balanced strings is balanced, and;
2. An opening parenthesis, followed by a balanced string, followed by a closing parenthesis, is balanced.

For the first rule, we need some way of making a new pattern out of zero or more of the same pattern, following each other:

```javascript
const zeroOrMore =
  pattern =>
    input => {
      let matchedLength = 0;
      let remaining = input;
      
      while (remaining.length > 0) {
        const matched = pattern(remaining);
        
        if (matched === false || matched.length === 0) {
          return input.slice(0, matchedLength);
        }
        matchedLength = matchedLength + matched.length;
        remaining = remaining.slice(matched.length);
      }
      
      return input.slice(0, matchedLength);;
    };

const openingParentheses = zeroOrMore(just('('));

openingParentheses(')))(((')
  //=> '' 

openingParentheses('((()))')
  //=> '(((' 
```

Notice that in the first case, `)))(((`, the result is `''`, because it successfully matches zero opening parentheses. So we have a way to make a pattern out of a single pattern that repeats zero or more times.

For the second rule, we need some way of making a new pattern out of any arbitrary set of patterns that follow each other, not just one pattern, repeated:

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

console.log(follows(just('fu'), just('bar'))('foobar'))
  //=> false

console.log(follows(just('fu'), just('bar'))('fubar\'d'))
  //=> 'fubar'
```

Using both `zeroOrMore` and `follows`, we can get almost all the way there:

```javascript
const balanced =
  input =>
    zeroOrMore(follows(just('('), balanced, just(')')))(input);

balanced('((()))')
  //=> '((()))'

balanced('((()()))()((')
  //=> '((()()))()'
```

As we can see from the second case, we need to match strings that are entirely balanced, not just starting with balanced:

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

entirelyBalanced('((()))')
  //=> '((()))'

entirelyBalanced('((()()))()((')
  //=> false
```

Success!

---

### the complete solution

The supporting functions we need to implement our pattern-matching abstraction is:

```javascript
const just =
  target =>
    input =>
      typeof input === 'string' &&
      input.startsWith(target) &&
      target;

const zeroOrMore =
  pattern =>
    input => {
      let matchedLength = 0;
      let remaining = input;
      
      while (remaining.length > 0) {
        const matched = pattern(remaining);
        
        if (matched === false || matched.length === 0) {
          return input.slice(0, matchedLength);
        }
        matchedLength = matchedLength + matched.length;
        remaining = remaining.slice(matched.length);
      }
      
      return input.slice(0, matchedLength);;
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

const entirely =
  pattern =>
    input => {
      const matched = pattern(input);
      
      return matched !== false &&
        matched === input &&
        matched;
    };
```

With these in hand, we can implement our solution with:

```javascript
const balanced =
  input =>
    zeroOrMore(follows(just('('), balanced, just(')')))(input);

const entirelyBalanced = entirely(balanced);
```

Is this good? Bad? Terrible?

---

### the good, the bad, and the ugly

The very good news about this solution is that the form of the solution exactly replicates the form of the problem statement.

The bad news is that we require much more supporting code for our abstraction than code describing the solution. This is generally thought to be fine when we reuse this abstraction multiple times, amortizing the cost of the implementation across multiple uses. But for a one-off, it requires the reader of the code to grok our solution and the implementation of pattern-matching. That can be a bit much.

The ugly is that this particular implementation of pattern matching is slow and wasteful of memory. There is a silver lining, though: If we write some code in one place, and it is slow, when we optimize that code, it gets faster.

When we write an abstraction layer that is used by many pieces of code, and it is slow, all of those pieces of code are slow. Terrible! But that same leverage applies when we optimize that abstraction layer's code. All of the code that uses it gets faster, "for free."