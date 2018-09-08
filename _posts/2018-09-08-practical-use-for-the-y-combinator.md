---
title: "A practical (albeit infrequently needed) use for the Y Combinator"
tags: [noindex,allonge,recursion]
---

The Y Combinator is an important result in theoretical computer science. A famous technology investment firm and startup incubator takes its name from the Y Combinator, likely because the Y Combinator acts as a kind of "bootstrap" to allow a function to build upon itself.

In this essay, after a brief review of the work we've already done on the mockingbird, why bird, M Combinator, and Y Combinator, we'll derive the "Decoupled Trampoline," a/k/a "Long-Tailed Widowbird." The decoupled trampoline builds ion the why bird and Y Combinator to allow us to write tail-recursive functions that execute in constant stack space, while hewing closely to idomatic JavaScript.

While this use case is admittedly rare in production code, it does arise from time to time and it is pleasing to contemplate a direct connection between one of programming's most cerebrally theoretical constructs and a tool for overcoming the limitations of today's JavaScript implementations.

---

[![Y (Washington, DC) ©2010 takomabibelot](/assets/images/y2.jpg)](https://www.flickr.com/photos/takomabibelot/4410714841)

---

### revisiting the why bird

*This review of the why bird recapitulates the material from [To Grok a Mockingbird] and [Deriving the Y Combinator and Why Bird from the Mockingbird]. Readers familiar with these two essays can skim it quickly.*

In [To Grok a Mockingbird], we explored the _mockingbird_, a recursive combinator that decouples recursive functions from themselves. We explored how writing recursive functions "in mockingbird form" decreases couplingand helps us increase reuse and composition.[^m]

[To Grok a Mockingbird]: http://raganwald.com/2018/08/30/to-grok-a-mockingbird.html

[^m]: The mockingbird is more formally known as the M Combinator. Our naming convention is that when discussing formal combinators from combinatory logic, or direct implementations in JavaScript, we will use the formal name. But when using variations designed to work more idiomatically in JavaScript--such as versions that work with functions taking more than one argument), we will use Raymond Smullyan's ornithological nicknames.<br/><br/>For a formalist, the M Combinator's direct translation is `const M = fn => fn(fn)`. This is only useful if `fn` is implemented in "curried" form, e.g. `const isEven = myself => n => n === 0 || !myself(n - 1)`. If we wish to use a function written in idiomatic JavaScript form, such as `const isEven = (myself, n) => n === 0 || !myself(n - 1)`, we use the mockingbird, which is given later as `const mockingbird = fn => (...args) => fn(fn, ...args)`. This is far more practical for programming purposes.

[thunk]: https://en.wikipedia.org/wiki/Thunk_(functional_programming)
[cps]: https://en.wikipedia.org/wiki/Continuation-passing_styleer a 
[tail-recursive]: https://en.wikipedia.org/wiki/Tail-recursive_function
[trampolining]: https://en.wikipedia.org/wiki/Trampoline_(computing)

We then moved on to [Deriving the Y Combinator and Why Bird from the Mockingbird], where we derived the Why Bird. Although it has tremendous application to combinatory logic as a fixed point combinator, our interest in the why bird was how it helps us obtain all of the benefits of the mockingbird, but we saw that functions written"in why bird form" were much closer to idiomatic JavaScript.

[Deriving the Y Combinator and Why Bird from the Mockingbird]: /2018/09/03/mockingbirds-sage-birds-and-widowbirds.html

The compact expression of why bird in JavaScript looks like this:

```javascript
const why =
  fn =>
    (x => x(x))(
      maker =>
        (...args) =>
          fn(maker(maker), ...args)
    );
```

With the why bird, instead of writing a recursive function like this:

```javascript
const isEven =
  n =>
    (n === 0) || !isEven(n - 1);
```

In why bird form, we write it like this:

```javascript
const _isEven =
  (myself, n) =>
    (n === 0) || !myself(n - 1);
```

We use the why bird in conjunction with a function written "in why bird form" like this:

```javascript
why(_isEven)(42)
  //=> true
```

This arrangement decouples the recursive function from itself, allowing us to use an anonymous function if we wish, like this:

```javascript
why(
  (myself, n) =>
    (n === 0) || !myself(n - 1)
)(42)
  //=> true
```

It also allows us to decorate the recursive function easily, whether anonymous or not.

The why bird is an idiomatic JavaScript version of combinatorial logic's Y Combinator. The Y Combinator works with functions in _curried_ form, i.e. functions that take only one argument.

The full expression of the Y Combinator looks like this:

```javascript
const Y =
  fn =>
    (m => a => fn(m(m))(a))(
      m => a => fn(m(m))(a)
    );
```

Its compact form, like the compact why bird, makes use of the M Combinator, reduced to `x => x(x)`:

```javascript
const Y =
  fn =>
    (x => x(x))(m => a => fn(m(m))(a));
```

Either expression of the Y Combinator is used with functions in curried form:

```javascript
Y(
  myself =>
    n =>
      (n === 0) || !myself(n - 1)
)(1962)
```

We will work with the why bird in this essay, however everything we do can also be done with the Y Combinator, albeit by writing functions in a form that is not usual for JavaScript.

---

[![Spiral©2012 Renzo Borgatti](/assets/images/spiral.jpg)](https://www.flickr.com/photos/reborg/9222072041)

---

### tail recursion

This function for determining whether a number is even is extremely slow, and it has another problem:

```javascript
const isEven =
  n =>
    (n === 0) || !isEven(n - 1);

IsEven(1000042)
  //=> Maximum call stack exceeded
```

Revising it to work with the why bird does not fix the issue:

```javascript
why(
  (myself, n) =>
    (n === 0) || !myself(n - 1)
)(1000042)
  //=> Maximum call stack exceeded
```

Our function consumes stack space equal to the magnitude of the argument `n`. Naturally, this is a contrived example, but recursive functions that consume the entire stack to occur from time to time, and it is not always appropriate to rewrite them in iterative form.

One solution to this problem is to rewrite the function in tail-recursive form. If the JavaScript engine supports tail-call optimization, the function will execute in constant stack space:

```javascript
// Safari Browser, c. 2018

why(
  (myself, n) => {
    if (n === 0)
      return true;
    else if (n === 1)
      return false;
    else return myself(n - 2);
  }
)(1000042)
  //=> true
```

However, not all engines support tail-call optimization, despite it being part of the JavaScript specification. If we wish to execute such a function in constant stack space, one of our options is to "greenspun" tail-call optimization ourselves by implementing a [trampoline]:[^recursion]

[trampoline]: http://raganwald.com/2013/03/28/trampolines-in-javascript.html

[^recursion]: A more complete exploration of ways to convert recursive functions to non-recusrives functions can be found in [Recursion? We don't need no stinking recursion!](/2018/05/20/we-dont-need-no-stinking-recursion.html), and its follow-up, [A Trick of the Tail](/2018/05/27/tail).

> A trampoline is a loop that iteratively invokes [thunk]-returning functions ([continuation-passing style][cps]). A single trampoline is sufficient to express all control transfers of a program; a program so expressed is trampolined, or in trampolined style; converting a program to trampolined style is trampolining. Trampolined functions can be used to implement [tail-recursive] function calls in stack-oriented programming languages.--[Wikipedia][trampolining]

[thunk]: https://en.wikipedia.org/wiki/Thunk_(functional_programming)
[cps]: https://en.wikipedia.org/wiki/Continuation-passing_style
[tail-recursive]: https://en.wikipedia.org/wiki/Tail-recursive_function
[trampolining]: https://en.wikipedia.org/wiki/Trampoline_(computing)

As we saw in [To Grok a Mockingbird], this necessitates having our recursive function become tightly coupled to its execution strategy. In other words, above and beyond being rewritten in tail-recursive form, it must explicitly return thunks rather than call `myself`:

```javascript
class Thunk {
  constructor (delayed) {
    this.delayed = delayed;
  }

  evaluate () {
    return this.delayed();
  }
}

const trampoline =
  fn =>
    (...initialArgs) => {
      let value = fn(...initialArgs);

      while (value instanceof Thunk) {
        value = value.evaluate();
      }

      return value;
    };

const isEven =
  trampoline(
    function myself (n, parity = 0) {
      if (n === 0) {
        return parity === 0;
      } else {
        return new Thunk(() => myself(n - 1, 1 - parity));
      }
    }
  );

isEven(1000001)
  //=> false
```

In [To Grok a Mockingbird], we solved this problem for functions written "in mockingbird form" with the Jackson's Widowbird function. We created a function with the same contract as the mockingbird, but its implementation used a trampoline to execute recursive functions in constant stack space.

Functions written "in why bird form" are more idiomatically JavaScript than functions written in mockingbird form. If we can create a similar function that has the same contract as the why bird, but uses a trampoline to evaluate the recursive function, we could execute tail-recursive functions in constant stack space.

We will call this function the "Long-tailed Widowbird." Let's derive it.

---

![Long-Tailed Widowbird](/assets/images/long-tailed-widowbird.jpg)

---

### deriving the long-tailed widowbird from the why bird

Our goal is to create a trampolining function. So let's start with the basic outline of a trampoline, and call it `longtailed`:

```javascript
class Thunk {
  constructor (delayed) {
    this.delayed = delayed;
  }

  evaluate () {
    return this.delayed();
  }
}

const longtailed =
  fn =>
    (...initialArgs) => {
      let value = fn(...initialArgs);

      while (value instanceof Thunk) {
        value = value.evaluate();
      }

      return value;
    };
```

We won't even bother trying this, we know that `fn(...initialArgs)` is not going to work without injecting a function for `myself`. But we do know a function that we can call with `...initialArgs`:

```javascript
class Thunk {
  constructor (delayed) {
    this.delayed = delayed;
  }

  evaluate () {
    return this.delayed();
  }
}

const longtailed =
  fn =>
    (...initialArgs) => {
      let value = why(fn)(...initialArgs);

      while (value instanceof Thunk) {
        value = value.evaluate();
      }

      return value;
    };
```

This works, but never actually creates any thunks. To do that, let's reduce `why(fn)`:

```javascript
class Thunk {
  constructor (delayed) {
    this.delayed = delayed;
  }

  evaluate () {
    return this.delayed();
  }
}

const longtailed =
  fn =>
    (...initialArgs) => {
      let value =
        (x => x(x))(
          maker =>
            (...args) =>
              fn(maker(maker), ...args)
        )(...initialArgs);

      while (value instanceof Thunk) {
        value = value.evaluate();
      }

      return value;
    };
```

Now we see where the value for `myself` comes from, it's `maker(maker)`. Let's replace that with  a function that, given some arguments, returns a new thunk that—when evaluated—returns `maker(maker)` invoked with those arguments:

```javascript
class Thunk {
  constructor (delayed) {
    this.delayed = delayed;
  }

  evaluate () {
    return this.delayed();
  }
}

const longtailed =
  fn =>
    (...initialArgs) => {
      let value =
        (x => x(x))(
          maker =>
            (...args) =>
              fn((...argsmm) => new Thunk(() => maker(maker)(...argsmm)), ...args)
        )(...initialArgs);

      while (value instanceof Thunk) {
        value = value.evaluate();
      }

      return value;
    };

longtailed(
  (myself, n) => {
    if (n === 0)
      return true;
    else if (n === 1)
      return false;
    else return myself(n - 2);
  }
)(1000042)
  //=> true
```

It works! And it executes in constant stack space! But this Is code that only its author could love.

---

[![Ink & Water ©2010 Gagneet Parmar](/assets/images/ink-and-water.jpg)](https://www.flickr.com/photos/45818813@N05/4785640636)

---

### from long-tailed widowbird to decoupled trampoline

Let's begin our cleanup by moving `Thunk` inside our function. This has certain technical advantages if we ever create a recursive program that itself returns thunks. Since it is now a special-purpose class that only ever invokes a single function, we'll give it a more specific implementation:

```javascript
const longtailed =
  fn => {
    class Thunk {
      constructor (fn, ...args) {
        this.fn = fn;
        this.args = args;
      }

      evaluate () {
        return this.fn(...this.args);
      }
    }

    return (...initialArgs) => {
      let value =
        (x => x(x))(
          maker =>
            (...args) =>
              fn((...argsmm) => new Thunk(maker(maker), ...argsmm), ...args)
        )(...initialArgs);

      while (value instanceof Thunk) {
        value = value.evaluate();
      }

      return value;
    };
  };
```

Next, let's extract the creation of a function that delays the invocation of `maker(maker)`:

```javascript
const longtailed =
  fn => {
    class Thunk {
      constructor (fn, ...args) {
        this.fn = fn;
        this.args = args;
      }

      evaluate () {
        return this.fn(...this.args);
      }
    }

    const thunkify =
      fn =>
        (...args) =>
          new Thunk(fn, ...args);

    return (...initialArgs) => {
      let value =
        (x => x(x))(
          maker =>
            (...args) =>
              fn(thunkify(maker(maker)), ...args)
        )(...initialArgs);

      while (value instanceof Thunk) {
        value = value.evaluate();
      }

      return value;
    };
  };
```

And now we have a considerably less ugly long-tailed widowbird. Well, actually, we are ignoring "the elephant in the room," _the name of the function_. "Long-tailed Widowbird" is a touching tribute to the genius of Raymond Smullyan, and there is an amusing correlation between its long tail and the business of optimizing tail-recursive functions.

Nevertheless, if we are to work with others, we might want to consider the possibility that they would prefer a less poetic approach:

```javascript
const decoupledTrampoline =
  fn => {
    class Thunk {
      constructor (fn, ...args) {
        this.fn = fn;
        this.args = args;
      }

      evaluate () {
        return this.fn(...this.args);
      }
    }

    const thunkify =
      fn =>
        (...args) =>
          new Thunk(fn, ...args);

    return (...initialArgs) => {
      let value =
        (x => x(x))(
          maker =>
            (...args) =>
              fn(thunkify(maker(maker)), ...args)
        )(...initialArgs);

      while (value instanceof Thunk) {
        value = value.evaluate();
      }

      return value;
    };
  };
```

---

*picture3*

---

### the use case for the decoupled trampoline

To recapitulate the use case for the decoupled trampoline, in the rare but nevertheless valid case where we wish to refactor a singly recursive function into a trampolined function to ensure that it does not consume the stack, we previously had to:

1. Refactor the function into tail-recursive form;
2. Refactor the tail-recursive version to explicitly invoke a trampoline;
3. Wrap the result in a trampoline function.

With the decoupled trampoline, we can:

1. Refactor the function into tail-recursive form;
2. Refactor the function into "why bird form," then; 
3. Wrap the result in the long-tailed widowbird

Why is this superior? We're going to refactor into tail-recursive form either way, and we're going to wrap the function either way, however:

1. Refactoring into "why bird form" is less intrusive than rewriting the code to explicitly return thunks, and;
2. The refactored code is decoupled from trampolining, so it is easier to reverse the procedure if need be, or even just used with the why bird;

If we compare and contrast:

```javascript
const isEven =
  trampoline(
    function myself (n) {
      if (n === 0)
        return true;
      else if (n === 1)
        return false;
      else return new Thunk(() => myself(n - 2));
    }
  );
```

With:

```javascript
const isEven =
  decoupledTrampoline(
    (myself, n) => {
      if (n === 0)
        return true;
      else if (n === 1)
        return false;
      else return myself(n - 2);
    }
  );
```

The latter has clearer separation of concerns and is thus easier to grok at first sight. And thus, we have articulated a practical (albeit infrequently needed) use for the Y Combinator.

---

## Notes