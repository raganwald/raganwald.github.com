---
title: "Going Under the Hood with Balanced Parentheses"
tags: [recursion,allonge,mermaid]
---

As we discussed in both [Pattern Matching and Recursion], a popular programming "problem" is to determine whether a string of parentheses is "balanced:"[^dyck]

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html "Pattern Matching and Recursion"

> Given a string that consists of open and closed parentheses, write a function that determines whether the parentheses in the string are **balanced**. "Balanced" parentheses means that each opening symbol has a corresponding closing symbol and the pairs of parentheses are properly nested.

[^dyck]: We also discussed this problem in [Alice and Bobbie and Sharleen and Dyck], albeit in a different form that doesn't directly contribute to the subject of this essay. In that essay, we noted that strings of balanced parentheses are known more formally as [Dyck Words](https://en.wikipedia.org/wiki/Walther_von_Dyck).

[Alice and Bobbie and Sharleen and Dyck]: http://raganwald.com/2018/11/14/dyck-joke.html "Alice and Bobbie and Sharleen and Dyck"

Before we reach for JavaScript or any other general-purpose tool, there is already a specific text pattern-matching tool available, and it's built right into most popular languages.

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

---

### nested parentheses

Of all the strings that contain zero or more parentheses, there is a set that contains zero or more opening parentheses followed by zero or more closed parentheses, _and where the number of opening parentheses exactly equals the number of closed parentheses_.

The strings that happen to contain exactly the same number of opening parentheses as closed parentheses can just as easily be described as follows: _A string belongs to the language if the string is `()`, or if the string is `(` and `)` wrapped around a string that belongs to the language._

We call these strings "nested parentheses," and it is related to balanced parentheses: _All nested parentheses strings are also balanced parentheses strings._ Our approach to determining whether balanced parentheses is a regular language will use nested parentheses.

First, we will assume that there exists a finite state machine that can recognized balanced parentheses. Since nested parentheses are balanced parentheses, our machine must recognize nested parentheses. Next, we will use nested parentheses strings to show that by presuming that such a machine has a finite number of states leads to a logical contradiction.

This will establish that our assumption that there is a finite state machine that recognizes balanced parentheses is faulty, which in turn establishes that balanced parentheses is not a regular language.[^reductio]

[^reductio]: This type of proof is known as "Reductio Ad Absurdum," and it is a favourite of logicians, because _quidquid Latine dictum sit altum videtur_.

Okay, we are ready to prove that a finite state machine cannot recognize nested parentheses, which in turn establishes that a finite state machine cannot recognize balanced parentheses.

---

### balanced parentheses is not a regular language

Let's start with the assumption that there is a finite state machine that can recognize balanced parentheses, we'll call this machine **B**. We don't know how many states B has, it might be a very large number, but we know that there are a finite number of these states.

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

These three examples show that when we encounter a problem that we know is equivalent to recognizing a language that is not a regular language, we can anticipate that our solution will need to incorporate some form of state that grows with some aspect of the size of the input. Our language implementation or hardware may impose some limits on our implementation, but _in principle_ we are solving the problem.

In these cases, the state is explicit. But we can make the state implicit, too.

---

### balanced parentheses with implicit state

We saw that we can encode state with an explicit stack. Almost all conventional programming languages have an _implicit_ stack, the call stack.[^implicit]

[^implicit]: There may be other implicit stacks too, such as the stack that happens when a generator function uses `yield` or `yield *`.

Here's an implicit implementation of balanced parentheses:

```javascript
function balanced (string) {
  const iterator = string[Symbol.iterator]();

  return balancedIterator(iterator) === true;
}

function balancedIterator(iterator) {
  const { value: token, done } = iterator.next();

  if (done) {
    return true;
  } else if (token === '(') {
    const nextToken = balancedIterator(iterator);

    if (nextToken === ')') {
      return balancedIterator(iterator);
    } else {
      return false;
    }
  } else {
    return token;
  }
}
```

The `balanced` function extracts an iterator from the string, and then invokes `balancedIterator`, which actually scans the string. When it encounters an open parenthesis, it then calls itself recursively to consume balanced parentheses before returning.

There is no counter or stack or list, but we know that behind the scenes, JavaScript's call stack is tracking the depth of nested parentheses. The function thus only works for strings with unclosed parentheses up to the maximim allowable depth of the call stack, but again in principle the algorithm works on infinitely long strings.

---

### recursive pattern matching

But possibly the best way to use implicit state is to let something else handle all of the work. In [Pattern Matching and Recursion], we built pattern matchers out of JavaScript functions, and then combined them with combinators made out of javaScript functions.

Making pattern matchers and combinators out of functions afforded us a number of advantages. First and foremost, we had access to the power of a fully operational <strike>battle station</strike> programming language.

Not counting the definitions of `just`, `follows`, `case`, and so forth, our solution to the balanced parentheses problem showed this:

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

Behind the scenes, it is using the JavaScript stack to track the state of unclosed parentheses, juts like out implicit solution above. But even though we don't explicitly have a stack anywhere, we are still using one.

---

### recursive regular expressions

We noted above that formal regular expressions cannot handle balanced parentheses, because balanced parentheses are not a regular language.

But programmers being programmers, the regular expressions we find built into various programming languages have been expanded over the years, and some of them provide a way to specify recursive regular expressions (a formal oxymoron).

JavaScript is not one of those languages, and PERL is not spoken here, but the Oniguruma regular expression engine used by Ruby (and PHP) does support recursion. Here's an implementation of balanced parentheses written in Ruby:


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

Once again, something does all the work for us. In this case, it's a high-performance pattern-matching engine that is going to be faster and use less memory than our functional pattern matchers and functional combinators.

And once again, even though we have no explicit stack, we are guaranteed that _somewhere_ in Oniguruma, there is a stack tracking the recursion, and thus tracking the state of the machine as it consumes characters.

---

### what can we learn from the theory behind recognizing balanced parentheses?

Let's review what we've just done:

1. We worked our way up from the theory behind regular languages to proving that balanced parentheses could not be a regular language.
2. Given that balanced parentheses is not a regular language, we knew that we would have to represent a state for each unclosed parenthesis. This provided a hint that we would need some kind of linear state, such as a counter, stack, or list.
3. We implemented a couple of recognizers that had explicit state.
4. We also implemented a recognizer that used the call stack to use implicit state.
5. Finally, we returned to our recursive pattern from [Pattern Matching and Recursion], and also looked at a "recursive regular expression" implemented in Ruby. Both of these had implicit state as well.

The small takeaway is that one of the uses for recursion is to make state implicit, rather than explicit. That can aid clarity in some cases, but hide it in others. The implementations using patterns and regular expressions aid clarity, because the shape of the pattern is isomorphic to the shape of the strings being matched.

The implicit state solution using iterators is compact and does not rely on external libraries or engines. On the other hand, it is not nearly as elegant.

> Starting from the most abstract principles is a good way to relearn something, but a bad way to learn something.—Paul Graham

But these are small learnings. There's a bigger one here that is tangental to the actual computer science. This problem is often given as a test during job interviews. Is it a good one?

We went from first principles to code in this essay. That is unrealistic for any normal human under the time pressure of an interview. Universities don't even ask you to do this in exams. Instead, they give problems like this as homework exercises, and then after you have worked them out for yourself, a test is given to see if you figured out the answers.

If you haven't been exposed to the underlying math recently, coming up with a solution to balanced parentheses is going to be extremely difficult. It reminds one of Nabakov's line, "Genius is an African who dreams up snow."

In most actual cases, what happens is that either a programmer is already familiar with  the general principles and shape of the problem and its solution, or they are going to have a hard time with the problem.

Some programmers are very familiar with the problem. For example, if this problem is posed to computer science students who are seeking employment on work-terms, if the material is covered in their curriculum, they will know the basic idea, and they will spend most of their time writing the code to implement an idea they already understand.

For certain schools, this is fine, and the problem could be useful for such students.

But for other schools that have a different emphasis, or for working programmers who may have done a lot of good work but haven't had need to review the specifics of DFAs, context-free languages, and so forth recently...

This problem is asking them to reinvent the basic research of people like Kleene and Dyck, extemporaneously. And then write code under the interviewer's watching eye. That is unlikely to show these candidates in their best light, and the results become very uneven.

Outside of a special-case like certain CS students, this question is likely to give very inconsistent results, and those results are going to be dominated by a candidate's recent familiarity with the underlying problem, rather than their coding skills.

In most cases, that makes for a bad interview question.

---

# Notes