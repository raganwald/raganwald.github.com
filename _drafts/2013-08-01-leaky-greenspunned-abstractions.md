---
layout: default
tags: [javascript]
---

As programmers, it is our job to build software out of abstractions. Logic gates are connected to form a "Von Neumann Computer." An assembler creates an interface that can be programmed with instructions like `MOV 12345, 567890`. A compiler lets us write `x = y`, and so on up to `has_and_belongs_to_many :roles`.

When programming in a particular language, we often want to borrow an abstraction from another language, much as English speakers will murmur "C'est la vie" when the build breaks. In JavaScript, the [Underscore] library includes a function called `pluck`. Compare `_.pluck(users, 'lastName')` in JavaScript to using String#to_proc in Ruby: `users.map(&:lastName)`. The mechanisms and syntaxes are different, but the underlying ideas are similar.

For small idioms, other languages can be a fertile source of abstractions. But we struggle when we become ambitious and attempt to [Greenspun] new semantics that are a poor fit with our primary tool.

[Underscore]: http://underscorejs.org
[Greenspun]: https://en.wikipedia.org/wiki/Greenspun%27s_Tenth_Rule

In Ruby, for example, [Benjamin Stein] and I wrote a little thing called [andand]. It emulates the existential (or "elvis") operator from Groovy and CoffeeScript. On the surface, it's as simple as String#to_proc. You can write something like `user.andand.lastName`, and if `user` is `null`, the expression evaluates to `null` without any exceptions being thrown.

[Benjamin Stein]: http://www.mobilecommons.com/author/ben/
[andand]: https://github.com/raganwald/andand

### a leaky abstraction

But let's draw the curtain back, shall we? The `andand` method that's mixed into all objects is not too tough to parse once you realize there's a special case for passing a block:

```ruby
def andand (p = nil)
  if self
    if block_given?
      yield(self)
    elsif p
      p.to_proc.call(self)
    else
      self
    end
  else
    if block_given? or p
      self
    else
      MockReturningMe.new(self)
    end
  end 
end

class MockReturningMe < BlankSlate
  def initialize(me)
    super()
    @me = me
  end
  def method_missing(*args)
    @me
  end
end
```

But what is this `MockReturningMe` thingummy? Well, if the receiver of `.andand` is falsey, the method `.andand` returns a special proxy object that returns the original object no matter what method you send it. This works just fine for the "normal case" of writing something like `raganwald.andand.braythwayt`, but introduces icky[^icky] edge cases.

In CoffeeScript, the compiler will complain if you write `object?.` instead of `object?.method`. But `object.andand` is perfectly acceptable Ruby code that returns either the receiver or one of these proxy objects. All sorts of unpleasant bugs can arise from a simple mistake, bugs that can't be caught in a dynamically typed language like Ruby.

As Joel Spolsky would say, "andand is a leaky abstraction."

[^icky]: The quality of being as obscure as Ick, an obscure Ruby library.

### the blockhead programmer

Implementing a programming language is an incredibly valuable exercise. Some time ago I wrote a toy Scheme, one where everything was built up from unhygienic macros and just five special forms. `let` isn't one of those five, so I wrote a macro that rewrote
 
    (let ((foo 1) (bar 2))
      (+ foo bar))

into:

    ((lambda (foo bar)
      (+ foo bar)) 
      1 2)

If you're somewhat familiar with JavaScript and Lisp, you'll recognize the second expression as an [Immediately Invoked Function Expression][iife]. The macro provides the illusion that `let` defines and binds local variables in my toy Scheme the way `var` does in JavaScript. But that isn't what happens: In reality, parameters to lambdas are the only mechanism for defining variables.

It's an interesting mechanism, and it has been borrowed for the CoffeeScript language's `do` keyword. JavaScript programmers are often tempted to use it to implement block scoping. In JavaScript, a new scope is only introduced by functions. Take this terrible code:

```javascript
function whatDoesThisDo (n) {
  result = '';
  for (var i = 0; i < n; ++i ) {
    if (i % 2 === 0) {
      for (var i = 0; i < n; ++i ) {
        result = result + 'x';
      }
    }
  }
  return result;
}

whatDoesThisDo(6)
  //=> "xxxxxx"
```

It seems contrived for the purpose of hazing University graduates that interview for programming jobs. The key point for our purposes is that despite the `var` declaration and the fact that `for (var i = 0; i < result.length; ++i )` is nested inside of `if (i % 2 === 0) { ... }`, the `i` indexing the inner loop is the exact same `i` as the one that indexes the outer loop, and that is going to produce problems.

Some languages have [block scope]: The introduction of a block like `{ ... }` introduces a new scope, and therefore you can create a new `i` that *shadows* the original. This is possible in Scheme with the `let` form, and if you have a taste for having one variable mean different things in different places, you can *appear* to create the same effect in JavaScript with an IIFE:

```javascript
function whatDoesThisDo (n) {
  result = '';
  for (var i = 0; i < n; ++i ) {
    if (i % 2 === 0) (function () {
      for (var i = 0; i < n; ++i ) {
        result = result + 'x';
      }
    })();
  }
  return result;
}

whatDoesThisDo(6)
  //=> "xxxxxxxxxxxxxxxxxx"
```

[iife]: https://en.wikipedia.org/wiki/Immediately-invoked_function_expression
[block scope]: https://en.wikipedia.org/wiki/Scope_(programming)#Block_scope

By using `(function () { ... })();` instead of plain `{ ... }`, we're creating a new JavaScript scope. Passing rapidly over the performance implications of creating a new function only to execute it once and then throw it away, have we implemented block scope as you might find in a language like C#?

Almost.

### more leaks

Once again, we have a leaky abstraction. The enthusiastic programmer, having rediscovered how to implement block scope in JavaScript with IIFEs, might decide that IIFEs are the new go-to idiom for block scoping:

```javascript
function oddsAndEvens (n) {
  var result;
  if (n % 2 == 0) {
    (function () {
      for (var i = 0; i < n; ++i) {
        result = result + 'even';
      }
      return result;
    })()
  }
  else {
    (function () {
      for (var i = 0; i < n; ++i) {
        result = result + 'odd';
      }
      return result;
    })()
  }
}

oddsAndEvens(4)
  //=> undefined
```

The reasoning behind this code is beyond dubious, but the problem is apparent: The intention was that `return result` return the result from the `oddsAndEvens` function, but in reality it returns the result from the anonymous function enclosing it. In languages like Ruby and C++, blocks are lighter weight than lambdas precisely because the semantics of things like `return` are different from within a block than from within a function body.

It doesn't matter that `let` is implemented with a lambda in our toy Scheme because our toy Scheme doesn't have a `return` form. But it matters greatly in JavaScript. Imagine, for example, that you use [Esprima] to write a preprocessor. You could lose all grip with reality and translate ES5 code like this:

```javascript
let(x = 1, y = 2) do {
  x + y;
} while(true);
```

into:

```javascript
(function (x, y) {
  return x + y;
})(1, 2);
```

Besides the vestigial `while(true)`, this will break badly whenever someone tries to use a `return` inside our pretend-let, just as we saw above. And it gets worse: What is the meaning of `this` inside our so-called blocks?

[Esprima]: http://esprima.org

Now, many of these problems can be fixed. You could write `.call(this, 1, 2)` instead of `(1, 2)` to preserve `this`. You could even use try and catch to establish a new scope for a single variable, as [let-er] does. But once again, we find that when we try to bolt the features from one language onto another, we create a leaky abstraction that falls down for anything but the obvious cases.

[let-er]: https://github.com/getify/let-er

### are we doomed?

Now these examples are contrived, but they reproduce actual bugs I've encountered when writing code using similar mechanisms. And my experience so far is that the more complex the abstraction being borrowed form one language and Greenspunned onto another, the more annoying the abstraction leaks become. Don't get me started on lazy collections in Ruby!

It's natural to wonder if all such efforts should be dismissed as a bad idea. They can be unfamiliar to uniglot programmers, and if my contention is correct, they are fraught with edge cases and subtle bugs. Must we always try to "cut with the grain" and use a language's "natural" idioms?

Personally, I embrace features from other languages. But recognizing that they have limitations, I avoid embracing them to the point that they become prevalent. Something like [trampolining] can be a very useful tool for surgically solving a particular problem in a language that lacks Tail Call Elimination, but trampolining all of a code base's method calls would be an act of masochism.

[trampolining]: https://en.wikipedia.org/wiki/Trampoline_%28computing%29#High_level_programming

And perhaps, we can learn from this that languages *are* limited. While it might seem like we can implement any feature from another language we like, the reality is that we can write code that *looks like* another language's code, but under the hood it's still our original language, and trouble awaits those who blindly embrace the abstraction.

**If another language's abstractions are so convenient, maybe we should consider switching rather than writing an ad hoc, informally-specified, bug-ridden, slow implementation of half of a better idea.**

([discuss](http://www.reddit.com/r/programming/comments/1jk8vg/leaky_greenspunned_abstractions/))