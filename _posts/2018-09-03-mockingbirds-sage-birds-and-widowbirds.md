---
title: Deriving the Y Combinator from the Mockingbird
tags: [recursion]
---

In [To Grok a Mockingbird], we were introduced to the Mockingbird, a recursive combinator that decouples recursive functions from themselves. Decoupling recursive functions from themselves allows us to compose them more flexibly, such as with decorators.[^m]

[To Grok a Mockingbird]: http://raganwald.com/2018/08/30/to-grok-a-mockingbird.html

[^m]: The mockingbird is more formally known as the M Combinator. Our naming convention is that when discussing formal combinators from combinatory logic, or direct implementations in JavaScript, we will use the formal name. But when using variations designed to work more idiomatically in JavaScript--such as versions that work with functions taking more than one argument), we will use Raymond Smullyan's ornithological nicknames.<br/><br/>For a formalist, the M Combinator's direct translation is `const M = fn => fn(fn)`. This is only useful if `fn` is implemented in "curried" form, e.g. `const isEven = myself => n => n === 0 || !myself(n - 1)`. If we wish to use a function written in idiomatic JavaScript form, such as `const isEven = (myself, n) => n === 0 || !myself(n - 1)`, we use the mockingbird, which is given later as `const mockingbird = fn => (...args) => fn(fn, ...args)`. This is far more practical for programming purposes.

We also saw that the mockingbird separates the concern of the recursive algorithm to be performed from the mechanism of implementing recursion. This allowed us to implement the Jackson's Widowbird, a variation of the mockingbird that uses trampolining to execute tail-recursive functions in constant space.

In this essay, we're going to look at the Sage Bird, known most famously as the [Y Combinator]. The sage bird provides all the benefits of the mockingbird, but allows us to write more idiomatic code.

[Y Combinator]: https://en.wikipedia.org/wiki/Fixed-point_combinator

We'll then derive the Long-tailed Widowbird, a sage bird adapted to use trampolining, just like the Jackson's Widowbird.

---

[![Hood Mockingbird copyright 2007](/assets/images/hood-mockingbird.jpg)](https://www.flickr.com/photos/putneymark/1225867875)

---

### revisiting the mockingbird

To review what we saw in [To Grok a Mockingbird], a typical recursive function calls itself by name, like this:[^realism]

[^realism]: The paradox of instructional explorations is that if we wish to illustrate a mechanism like recursive combinators, choosing trivial functions like exponentiation makes it easier to focus on the thing we're exploring, the combinators. The tradeoff is that with such simple functions, it will always feel over-complicated to use recursive combinators. Whereas, if we work with functions with real-world implications, the mechanism we're exploring gets lost in the complexity of the functions it operates upon.

```javascript
function exponent (x, n) {
  if (n === 0) {
    return 1;
  } else if (n % 2 === 1) {
    return x * exponent(x * x, Math.floor(n / 2));
  } else {
    return exponent(x * x, n / 2);
  }
}

exponent(2, 7)
  //=> 128
```

Because it calls itself by name, it is tightly coupled to itself. This means that if we want to decorate it--such as by memoizing its return values, or if we want to change its implementation strategy--like employing [trampolining]--we have to rewrite the function.

[trampolining]: http://raganwald.com/2013/03/28/trampolines-in-javascript.html

We saw that we can decouple a recursive function from itself. Instead of calling itself by name, we arrange to pass the recursive function to itself as a parameter. We begin by rewriting our function to take itself as a parameter, and also to pass itself as a parameter.

We call that writing a recursive function in mockingbird form. It looks like this:

```javascript
(myself, x, n) => {
  if (n === 0) {
    return 1;
  } else if (n % 2 === 1) {
    return x * myself(myself, x * x, Math.floor(n / 2));
  } else {
    return myself(myself, x * x, n / 2);
  }
};
```

Given a function written in mockingbird form, we use a JavaScript implementation of the mockingbird to turn it into a recursive function:

```javascript
const mockingbird =
  fn =>
    (...args) =>
      fn(fn, ...args);

const exponent = 
  mockingbird(
    (myself, x, n) => {
      if (n === 0) {
        return 1;
      } else if (n % 2 === 1) {
        return x * myself(myself, x * x, Math.floor(n / 2));
      } else {
        return myself(myself, x * x, n / 2);
      }
    }
  );

exponent(3, 3)
  //=> 27
```

Because the recursive function has been decoupled from itself, we can do things like memoize it:

```javascript
const memoized = (fn, keymaker = JSON.stringify) => {
  const lookupTable = new Map();

  return function (...args) {
    const key = keymaker.call(this, args);

    return lookupTable[key] || (lookupTable[key] = fn.apply(this, args));
  }
};

const ignoreFirst = ([_, ...values]) => JSON.stringify(values);

const exponent = 
  mockingbird(
    memoized(
      (myself, x, n) => {
        if (n === 0) {
          return 1;
        } else if (n % 2 === 1) {
          return x * myself(myself, x * x, Math.floor(n / 2));
        } else {
          return myself(myself, x * x, n / 2);
        }
      },
      ignoreFirst
    )
  );
```

Memoizing our recursive function does not require any changes to its code. We can easily reuse it elsewhere if we wish.The mockingbird is excellent, but it has one drawback: In addition to rewriting our functions to take themselves as a parameter, we also have to rewrite them to pass themselves along. So in addition to this:

```javascript
(myself, x, n) => ...
```

We must also write this:


```javascript
myself(myself, x * x, n / 2)
```

The former is the whole point of decoupling. The latter is nonsense! Having written a function in mockingbird form, when we invoke it we don't include itself as a parameter. If we can call it from outside with `exponent(3, 3)`, why can't it call itself with `myself(x * x, Math.floor(n / 2))`?

What we want is a function *like* the mockingbird, but while it will support writing `(myself, x, n) => ...`, it must also support writing `myself(myself, x * x, n / 2)`.

Let's build that function!

---

[![Sage Grouse Lek © 2006 BLM Wyoming](/assets/images/lek.jpg)](https://www.flickr.com/photos/134389515@N06/38964205040)

---

### a few ground rules

Before we begin, let's visualize how we want things to end up. With the mockingbird, we could write:

```javascript
const exponent = 
  mockingbird(
    (myself, x, n) => {
      if (n === 0) {
        return 1;
      } else if (n % 2 === 1) {
        return x * myself(myself, x * x, Math.floor(n / 2));
      } else {
        return myself(myself, x * x, n / 2);
      }
    }
  );
```

We want a function that let's us write:

```javascript
const exponent = 
  _____(
    (myself, x, n) => {
      if (n === 0) {
        return 1;
      } else if (n % 2 === 1) {
        return x * myself(x * x, Math.floor(n / 2));
      } else {
        return myself(x * x, n / 2);
      }
    }
  );
```

And there are some rules we have to follow if we are to take the mockingbird and derive another combinator from it. Every combinator has the following properties:

1. It is a function.
2. It can only use its parameters. This means it cannot refer to anything from its environment, like a function or object from the global namespace.
3. It cannot be a named function declaration or named function expression.
4. It cannot create a named function expression.
5. It cannot declare any bindings other than via parameters.
6. It can invoke a function in its implementation.

In combinatory logic, all combinators take exactly one parameter, as do all of the functions that combinators create. Combinatory logic also eschews all gathering and spreading of parameters. When creating an idiomatic JavaScript combinator (like `mockingbird`), we eschew these limitations. Idiomatic JavaScript combinators can:

* Gather parameters, and;
* Spread parameters.

---

[![Sage Thrasher © 2016 Bettina Arrigoni](/assets/images/sage-thrasher.jpg)](https://www.flickr.com/photos/barrigoni/25566626012)

---

### deriving the sage bird from the mockingbird

Step zero: We begin with the mockingbird:

```javascript
const mockingbird =
  fn =>
    (...args) =>
      fn(fn, ...args);
```

Step one, we name our combinator. Honouring Raymond Smullyan's choice, we shall call it the sage bird:

```javascript
const sagebird =
  fn =>
    (...args) =>
      fn(fn, ...args);
```

Step two, we identify the key change we have to make:

```javascript
const sagebird =
  fn =>
    (...args) =>
      fn(?, ...args);
```

We've replaced that one `fn` with a placeholder. Why? Well, our `fn` is a function that looks like this: `(myself, arg0, arg1, ..., argn) => ...`. But whatever we pass in for `myself` will look like this: `(arg0, arg1, ..., argn) => ...`. So it can't be `fn`.

But what will it be?

Well, the approach we are going to take is to think about the mockingbird. What does it do? It takes a function like `(myself, arg0, arg1, ..., argn) => ...`, and returns a function that looks like `(arg0, arg1, ..., argn) => ...`. 

The mockingbird isn't what we want, but let's airily assume that there is such a function. We'll call it `maker`, because it makes the function we want.

Step three, we replace `?` with `maker(??)`. We know it will make the function we want, but we don't yet know what we must pass to it:

```javascript
const sagebird =
  fn =>
    (...args) =>
      fn(maker(??), ...args);
```

This leaves us two things to figure out:

1. Where do we get `maker`, and;
2. What parameter(s) do we pass to it.

For `1`, we could define `maker` as an anonymous function expression. Another option arises. In the days before ES6, if we wanted to define variables within a scope smaller than a function, we created an immediately invoked function expression.

Step four, we could, after some experimentation, consider this format that binds a function expression to `maker` with an immediately invoked function expression;

```javascript
const sagebird =
  fn =>
    (
      maker =>
        (...args) =>
          fn(maker(??), ...args)
    )(???);
```

This still leaves us two things to work out: `??` is what we pass to `maker`, and `???` is maker's expression. Here's the "Eureka!" moment:

`maker` is a function that takes one or more parameters and returns a function that looks like `(...args) => fn(maker(??), ...args)`. That's the function we want to pass to `fn` as `myself`. The mockingbird isn't such a function, but we can see one right in front of us:

`maker => (...args) => fn(maker(??), ...args)` is a function that takes one parameter(`maker`) and returns a function that looks like `(...args) => fn(maker(??), ...args)`!

Step five, let's fill that in for `???`:

```javascript
const sagebird =
  fn =>
    (
      maker =>
        (...args) =>
          fn(maker(??), ...args)
    )(
      maker =>
        (...args) =>
          fn(maker(??), ...args)
    );
```

Now what about `??`? Well, we have just decided two things:

1. `maker` takes one or more parameters and returns a function that looks like `(...args) => fn(maker(??), ...args)`, and;
2. `maker => (...args) => fn(maker(??), ...args)` is a function that takes one parameter(`maker`) and returns a function that looks like `(...args) => fn(maker(??), ...args)`.

Conclusion: `maker` takes one parameter, `maker`, and returns a function that looks like `(...args) => fn(maker(??), ...args)`. Therefore, the expression we want is `maker(maker)`, and `??` is nothing more than `maker`!

Step six:

```javascript
const sagebird =
  fn =>
    (
      maker =>
        (...args) =>
          fn(maker(maker), ...args)
    )(
      maker =>
        (...args) =>
          fn(maker(maker), ...args)
    );
```

Let's test it:

```javascript
const exponent = 
  sagebird(
    (myself, x, n) => {
      if (n === 0) {
        return 1;
      } else if (n % 2 === 1) {
        return x * myself(x * x, Math.floor(n / 2));
      } else {
        return myself(x * x, n / 2);
      }
    }
  );

exponent(2, 9)
  //=> 512
```

Voila! A working sage bird!!

---

[![Underwood Typewriter Keys ©2010 Steve Depolo](/assets/images/typewriter-keys.jpg)](https://www.flickr.com/photos/stevendepolo/4550901923)

---

### from sage bird to y combinator

Our sage bird is written in--and for--idiomatic JavaScript, especially with respect to employing functions that take more than one parameter. A direct implementation of a formal combinator only takes one parameter and only works with functions that take one parameter.

We can translate our sage bird to its formal combinator, the **y combinator**. To aid us, let's first imagine a recursive function:

```javascript
const isEven =
  n =>
    (n === 0) || !isEven(n - 1);
```

In sage bird form, it becomes:

```javascript
const isEven =
  (myself, n) =>
    (n === 0) || !myself(n - 1);
```

Alas, it now takes two parameters. We fix this by [currying] it:

[currying]: http://raganwald.com/2013/03/07/currying-and-partial-application.html


```javascript
const isEven =
  myself =>
    n =>
      (n === 0) || !myself(n - 1);
```

Instead of taking two parameters (`myself` and `n`), it is now a function taking one parameter, `myself`, and returning a function that takes another parameter, `n`.

To accommodate functions in this form, we take our sage bird and perfom some similar modifications. We'll start as above by renaming it:

```javascript
const Y =
  fn =>
    (
      maker =>
        (...args) =>
          fn(maker(maker), ...args)
    )(
      maker =>
        (...args) =>
          fn(maker(maker), ...args)
    );
```

Next, we observe that `(...args) => fn(maker(maker), ...args)` is not allowed, we do not gather and spread parameters. First, we change `...args` into just `arg`, since only one parameter is allowed:

```javascript
const Y =
  fn =>
    (
      maker =>
        arg => fn(maker(maker), arg)
    )(
      maker =>
        arg => fn(maker(maker), arg)
    );
```

`fn(maker(maker), arg)` is also not allowed, we do not pass two parameters to any function. Instead, we pass one parameter, get a function back, and pass the second parameter to that function. Like this:

```javascript
const Y =
  fn =>
    (
      maker =>
        arg => fn(maker(maker))(arg)
    )(
      maker =>
        arg => fn(maker(maker))(arg)
    );
```

Let's try it:

```javascript
Y(
  myself =>
    n =>
      (n === 0) || !myself(n - 1)
)(1962)
```

It works too, and now we have derived one of the most important results in theoretical computer science. The Y Combinator matters so deeply, because in the kind of formal computation models that are simple enough to prove results (like the Lambda Calculus and Combinatory Logic), we do not have any iterative constructs, and must use recursion for nearly everything non-trivial.

The Y Combinator makes recursion possible without requiring variable declarations. As we showed above, we can even make an anonymous function recursive, which is necessary in systems where functions do not have names.

---

*to be continued...*


---

## Notes