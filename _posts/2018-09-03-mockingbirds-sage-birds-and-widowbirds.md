---
title: Using the Mockingbird to Derive the Y Combinator
tags: [recursion]
---

In [To Grok a Mockingbird], we were introduced to the Mockingbird, a recursive combinator that decouples recursive functions from themselves. Decoupling recursive functions from themselves allows us to compose them more flexibly, such as with decorators.

[To Grok a Mockingbird]: http://raganwald.com/2018/08/30/to-grok-a-mockingbird.html

We also saw that the mockingbird separates the concern of the recursive algorithm to be performed from the mechanism of implementing recursion. This allowed us to implement the Jackson's Widowbird, a variation of the mockingbird that uses trampolining to execute tail-recursive functions in constant space.

In this essay, we're going to look at the Sage Bird, known most famously as the [Y Combinator]. The sage bird provides all the benefits of the mockingbird, but allows us to write more idiomatic code.

[Y Combinator]: https://en.wikipedia.org/wiki/Fixed-point_combinator

We'll then derive the Long-tailed Widowbird, a sage bird adapted to use trampolining just like the Jackson's Widowbird.

---

[![Hood Mockingbird copyright 2007](/assets/images/hood-mockingbird.jpg)](https://www.flickr.com/photos/putneymark/1225867875)

---

### a quick review of mockingbirds

To review what we saw in [To Grok a Mockingbird], a typical recursive function calls itself by name, like this:

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

Given a function written in mockingbird form, we use a JavaScript implementation of the Mockingbird, or M Combinator, to turn it into a recursive function, like this:

```javascript
const mockingbird = fn => (...args) => fn(fn, ...args);

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

The good news is that we can now do things like memoize our recursive function, without it knowing anything about memoization.

---

[![Sage Thrasher © 2016 Bettina Arrigoni](/assets/images/sage-thrasher.jpg)](https://www.flickr.com/photos/barrigoni/25566626012)

---

### deriving the y combinator from the mockingbird

The Mockingbird is excellent, but it has one drawback: In addition to rewriting our functions to take themselves as a parameter, we also have to rewrite them to pass themselves along. So in addition to this:

```javascript
(myself, x, n) => ...
```

We must also write this:


```javascript
myself(myself, x * x, Math.floor(n / 2))
```

The former is the whole point of decoupling. The latter is nonsense! Having written a function in mockingbird form, when we invoke it we don't include itself as a parameter. If we can call it from outside with `exponent(3, 3)`, why can't it call itself with `myself(x * x, Math.floor(n / 2))`?

