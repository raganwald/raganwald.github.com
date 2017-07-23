---
title: “Resource Management is the third-hardest problem in Computer Science”
layout: default
tags: [allonge, noindex]
—--

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

Consider the humble but [highly useful] iterator. Let’s imagine that we are gaining some familiarity with iterators with a [code kata]: We have decided to implement various fundamental computer science collection algorithms using iterators instead of Lisp’s [cons cells] or JavaScript’s arrays.

[highly useful]: http://raganwald.com/2017/04/19/incremental
[code kata]: https://en.wikipedia.org/wiki/Kata_(programming)
[cons cells]: https://en.wikipedia.org/wiki/Cons

For example, we might decide to implement `first` and `butFirst` for iterators and iterables. Just so we’re clear, this is how they would work for arrays:

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

But we were going to work with iterators, not arrays.

### first and butFirst for iterators

An iterator is an object with a `.next()` method. When you call it, you get a Plain Old JavaScript Object (or “POJO”) tht has a `done` property. If the value of `done` is `false`, you are also given a `value` property that represents, well, a value.

JavaScript also has *iterable* objects. An iterable has a `[Symbol.iterator]` method that returns an iterator over the object’s contents.

Knowing this, our initial stab at `first` for iterators is simple:

```javascript
function first (iterator) {
  const { done, value } = iterator.next();
  
  if (!done) return value;
}
```

And since arrays are iterables, we can test it:

```javascript
const i = ['Gödel', 'Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid'][Symbol.iterator]();

first(i)
  //=> 'Gödel'
```


