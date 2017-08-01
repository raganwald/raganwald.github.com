---
title: "Resource Management is the third-hardest problem in Computer Science"
layout: default
tags: [allonge, noindex]
---

This post is about resource management: Keeping track of entities so we can dispose of them when they are no longer needed, and not a moment before.

In languages like C++, resource management dominates every line of code, because the programmer is responsible for allocating and deallocating the memory for every data structure on the heap, and for taking care that variables are not referenced after they are no longer in scope.

Languages like JavaScript solve man–but not all–resource management problems for us. All objects are stored on the heap, so we never have to wrry about having a reference to a data structure that is no longer in scope.[

Some of us are lucky enough to have never struggled with the problem this paragraph says that JavaScript solves. As you know, variables have scopes. In ES6, for example, when we write:

```javascript
function outer (something) {
  return function inner () { return something; };
}

const lifeTheUniverseAndEverything = outer(42);

lifeTheUniverseAndEverything()
  //=> 42
```

The variable `something` is scoped to the function `outer`. It has no meaning outside of `outer`’s lexical scope. When we invoke `outer`, it creates a function `inner` that refers to `something` in `outer`’s scope. Even though `outer` has already returned, JavaScript creates a *closure* that preserves `something`.

Thus, when we invoke `inner` via `lifeTheUniverseAndEverything()`, it can return `42` (the value bound to `something` when we invoked `outer(42)`), because `something` is bound to `42` in `inner`’s scope.

This is completely unlike languages like C++, where the values bound to variables like `something` are stored on the *stack*. When a function returns, the space on the stack taken up by its parameters and local variables is deallocated, and references to them could not point to absolute garbage.

The problem, in its basic form,has two complementary aspects. First, knowing when we no longer need to use some resource–like a data structure, an open file, &c.–so that we can safely destroy or close it, rendering it unusable. Second, knowing when a resource has been destroyed or closed so that we do not attempt to use it.

C++ programmers spend a lot of time thinking about both aspects of this problem, and the vast majority of the time, it’s just [accidental complexity].

Thanks to lexical scoping and automatic memory management, programmers using languages like JavaScript don’t have to spend nearly as much time thinking about either aspect of the problem. But “not nearly as much” doesn’t mean “never.”

[accidental complexity]: http://weblog.raganwald.com/2007/07/abbreviation-accidental-complexity-and.html

### first and butFirst

Consider the humble but [highly useful] iterable.[^collections] [[[*Explain iterables semantically here*]]]

Let’s imagine that we are gaining some familiarity with iterables with a [code kata]: We have decided to implement various fundamental computer science collection algorithms using iterables instead of Lisp’s [cons cells] or JavaScript’s arrays.

[highly useful]: http://raganwald.com/2017/04/19/incremental
[code kata]: https://en.wikipedia.org/wiki/Kata_(programming)
[cons cells]: https://en.wikipedia.org/wiki/Cons

[^collections]: For a more thorough discussion of iterators and iterables, have a look at the [Collections](https://leanpub.com/javascriptallongesix/read#collections) chapter of [JavaScript Allongé](https://leanpub.com/javascriptallongesix)

For example, we might decide to implement `first` and `butFirst` for iterables. Just so we’re clear, this is how they would work for arrays:

```javascript
first(['Gödel', 'Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid'])
  //=> 'Gödel'
  
butFirst(['Gödel', 'Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid'])
  //=> ['Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid']
```

And here’s a simple implementation for arrays:

```javascript
function first (array) {
  return array[0];
}

function butFirst (array) {
  return array.slice(1);
}
```

Armed with these two, we can do all sorts of things with arrays. Here’s one that we will look at a few times:

```javascript
function second (something) {
  return first(butFirst(something));
}

second(['Gödel', 'Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid'])
  //=> 'Escher'
```

This expresses the unsportsmanlike maxim, “Second is first amongst the losers.”

But we were going to work with iterables, not arrays. Let’s do it in two steps. First, we’ll implement `first` and `butFirst` for iterators, then for iterables.

### first and butFirst for iterators

An iterator is an object with a `.next()` method. When you call it, you get a Plain Old JavaScript Object (or “POJO”) tht has a `done` property. If the value of `done` is `false`, you are also given a `value` property that represents, well, a value.

Knowing this, an implementation of `first` for iterators is simple:

```javascript
function first (iterator) {
  const { done, value } = iterator.next();
  
  if (!done) return value;
}
```

We really ought to test our work before moving along. Here’s a contrived iterator that returns a sequence of words:

```javascript
const iGEB = {
  position: 0,
  words: ['Gödel', 'Escher', 'Bach'],
  
  next() {
    const done = this.position >= this.words.length;
    const value = this.words[this.position++];
    
    return done ? { done } : { done, value };
  }
};

first(iGEB)
  //=> ‘Gödel’
```

What about `butFirst`? Well, we might reason along the following lines: *An iterator is a stateful object. After calling `.next()`, subsequent calls will return the remaining values of the iteration. Therefore, an iterator could be used as its own `butFirst`, provided we call `.next()` first.*

Something like this:

```javascript
function butFirst (iterator) {
  iterator.next();
  return iterator;
}

const iAEGB = {
  position: 0,
  words: ['An', 'Eternal', 'Golden', 'Braid'],
  
  next() {
    const done = this.position >= this.words.length;
    const value = this.words[this.position++];
    
    return done ? { done } : { done, value };
  }
};

const iEGB = butFirst(iAEGB);

iEGB.next().value
  //=> ‘Eternal’
  
iEGB.next().value
  //=> ‘Golden’
  
iEGB.next().value
  //=> ‘Braid’
```

That’s fine. Now let’s make them work for iterables.

### first and butFirst for iterables

Our second version of `first` takes an iterator as an argument and returns a value. We want it to take an iterable as an argument and return a value. What is an iterable? It’s an object with a `[Symbol.iterator]` method that returns an iterator.

Ah! If we have a function that consumes an iterator, and we have an iterable, we can extract the iterator from the iterable and use our existing code. Like this:

```javascript
function first (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value } = iterator.next();
  
  if (!done) return value;
}
```

We can turn our sample iterators into iterables by wrapping them in objects, that way we can test our code:

```javascript
const iGEB = {
  position: 0,
  words: ['Gödel', 'Escher', 'Bach'],
  
  next() {
    const done = this.position >= this.words.length;
    const value = this.words[this.position++];
    
    return done ? { done } : { done, value };
  }
};

const geb = {
  [Symbol.iterator]() { return iGEB; }
};
```

This business of wrapping an iterator is going to be handy, so let’s make ourselves a helper function:

```javascript
const iterableFor = iterator => ({
  [Symbol.iterator]() { return iterator; }
});

const geb = iterableFor(iGEB);

first(geb)
  //=> ‘Gödel’
```

That’s nice, but actually, arrays in ES6 are *already* iterables, there’s no need to wrap them in our own handwritten code:

```javascript
first(['Gödel', 'Escher', 'Bach'])
  //=> ‘Gödel’
```

Fine. Now how about `butFirst`?

`butFirst` is similar, but we have to not just take an iterable as a parameter and convert it to an iterator but also convert the iterator back to an iterable when we’re done. We can’t just pass the iterable back out.

We’ll use our `iterableFor` convenience function:

```javascript
function butFirst (iterable) {
  const iterator = iterable[Symbol.iterator]();
  
  iterator.next();
  
  return iterableFor(iterator);
}
```

### destructuring

It’s very precise, but awkward to get the elements of an iteration by calling `.next()` and fooling around with `.value` and `.done`. Let’s use something we know about JavaScript: *destructuring*.

We know that we can destructure objects and arrays into variables. With arrays, we can destructure one or more elements like this:

```javascript
const [first, second, third] = ['Gödel', 'Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid'];

first
  //=> ‘Gödel’
  
second
  //=> ‘Escher’

third
  //=> ‘Bach’
```

It so happens that destructuring isn’t just for arrays: We can destructure iterators exactly the same way, like this:

```javascript
function first (iterator) {
  const [value] = iterator;
  
  return value;
}

const i = ['Gödel', 'Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid'][Symbol.iterator]();


first(i)
  //=> ‘Gödel’
```

And while we could write a version of `second` that uses destructuring, the one we already have works just fine with our new implementation of `first`:

```javascript
function first (iterator) {
  const [value] = iterator;
  
  return value;
}

function butFirst (iterator) {
  iterator.next();
  return iterator;
}

function second (something) {
  return first(butFirst(something));
}

const i = ['Gödel', 'Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid'][Symbol.iterator]();

second(i)
  //=> ‘Escher’
```

### oops

Sooner or later, we’ll get enthusiastic about using laziness to implement infinite iterators. For example, here’s a hand-coded iterator that provides the natural numbers:

[laziness]: https://en.wikipedia.org/wiki/Lazy_evaluation “Lazy Evaluation”

```javascript
const numbers = {
  done: false,
  value: 1,
  
  next() {
    const done = this.done;
    const value = this.value++;
    
    return { done, value }
  }
};

second(numbers)

