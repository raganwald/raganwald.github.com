---
title: "Resource Management is the third-hardest problem in Computer Science"
layout: default
tags: [allonge, noindex]
---

In JavaScript, iterators and iterables provide an asbtract interface for sequentially acessing values, such as you might find in a collection.[^collections]

[^collections]: For a more thorough discussion of iterators and iterables, have a look at the [Collections](https://leanpub.com/javascriptallongesix/read#collections) chapter of [JavaScript Allongé](https://leanpub.com/javascriptallongesix)

An iterator is an object with a `.next()` method. When you call it, you get a Plain Old JavaScript Object (or “POJO”) tht has a `done` property. If the value of `done` is `false`, you are also given a `value` property that represents, well, a value. If the value of `done` is `true`, you may or may not be given a `value` property.

Iterators are stateful by design: Repeatedly invoking the `.next()` method usually results in a series of values until `done` (although some iterators continue indefinately).

Here’s an iterator that counts down:

```javascript
const iCountdown = {
  value: 10,
  done: false,
  next() {
    this.done = this.done || this.value < 0;
    
    if (this.done) {
      return { done: true };
    } else {
      return { done: false, value: this.value-- };
    }
  }
};

iCountdown.next()
  //=> { done: false, value: 10 }

iCountdown.next()
  //=> { done: false, value: 9 }

iCountdown.next()
  //=> { done: false, value: 8 }
  
  // ...

iCountdown.next()
  //=> { done: false, value: 1 }
  

iCountdown.next()
  //=> { done: true } 
```

An *iterable* is an object with a `[Symbol.iterator]` object. when invoked, `[Symbol.iterator]()` returns an iterator. The idea is that we can have objects like arrays, and whenever we want to iterate over them, we call their `[Symbol.iterator]` method and get an iterator we can use to iterate over the contents.

For example:

```javascript
const countdown = {
  [Symbol.iterator]() {
    const iterator = {
      value: 10,
      done: false,
      next() {
        this.done = this.done || this.value < 0;
        
        if (this.done) {
          return { done: true };
        } else {
          return { done: false, value: this.value-- };
        }
      }
    };
    
    return iterator;
  }
};
```

We can do interesting things with iterables, like iterate over them using a `for... of` loop:

```javascript
for (const count of countdown) {
  console.log(count);
}
  //=>
    10
    9
    8
    ...
    1
```

Or destructure them:

```javascript
const [ten, nine, eight, ...rest] = countdown;

ten
  //=> 10
nine
  //=> 9
eight
  //=> 8
rest
  //=> [7, 6, 5, 4, 3, 2, 1]
```

### reference and constructing iterables

JavaScript is a pass-by-value-of-a-reference language. Two different variables can be bound to references to the same underlying object. This matter=s with iterators, because they are inherently stateful.

For example:

```javascript
const iCountdown = {
  value: 10,
  done: false,
  next() {
    this.done = this.done || this.value < 0;
    
    if (this.done) {
      return { done: true };
    } else {
      return { done: false, value: this.value-- };
    }
  }
};

iCountdown2 = iCountdown;

iCountdown.next()
  //=> { done: false, value: 10 }

iCountdown2.next()
  //=> { done: false, value: 9 }

iCountdown.next()
  //=> { done: false, value: 8 }

iCountdown2.next()
  //=> { done: false, value: 7 }
```

Both `iCountdown` and `iCountdown2` refer to the same iterator, so calling `.next()` on one variable affects the behaviour of calling `.next()` on the other.

That much is obvious in JavaScript. But now consider:

```javascript
const countdown = {
  [Symbol.iterator]() {
    const iterator = {
      value: 10,
      done: false,
      next() {
        this.done = this.done || this.value < 0;
        
        if (this.done) {
          return { done: true };
        } else {
          return { done: false, value: this.value-- };
        }
      }
    };
    
    return iterator;
  }
};

const iCountdown = countdown[Symbol.iterator]();
const iCountdown2 = countdown[Symbol.iterator]();

iCountdown.next()
  //=> { done: false, value: 10 }

iCountdown2.next()
  //=> { done: false, value: 10 }

iCountdown.next()
  //=> { done: false, value: 9 }

iCountdown2.next()
  //=> { done: false, value: 9 }
```

Now `iCountdown` and `iCountdown2` refer to separate iterators that were created independently of each other when `countdown[Symbol.iterator]()` was invoked.

But not all iterables work this way. We could, for example, write:

```javascript
const countdown = {
  iterator: null,
  
  [Symbol.iterator]() {
    this.iterator = this.iterator || {
      value: 10,
      done: false,
      next() {
        this.done = this.done || this.value < 0;
        
        if (this.done) {
          return { done: true };
        } else {
          return { done: false, value: this.value-- };
        }
      }
    };
    
    return this.iterator;
  }
};

const iCountdown = countdown[Symbol.iterator]();
const iCountdown2 = countdown[Symbol.iterator]();

iCountdown.next()
  //=> { done: false, value: 10 }

iCountdown2.next()
  //=> { done: false, value: 9 }

iCountdown.next()
  //=> { done: false, value: 8 }

iCountdown2.next()
  //=> { done: false, value: 7 }
```

Now we have contrived things such that invoking `[Symbol.iterator]()` more than once does not create a new iterator, we simply return a reference to the same iterator. And thus, `iCountdown` and `iCountdown2` refer to the same iterator, and calling `.next()` on one will affect the other.

The distinction between these two types of iterables is important. The first type of iterable, one that returns a new iterator every time its `Symbol.iterator]()` method is invoked, is sometimes called a “fresh” iterable, because it provides a fresh iterator every time. The second would have to be a stale iterable to keep the metaphor consistent.

In this post, we will use different words. We will call the first type of iterable a *reference* iterable, because what it provides is a reference to some permanent iterable. 

And we will call the second type of iterator a *constructing* iterable, because every time we invoke `[Symbol.iterator]()`, it constructs a brand new iterator for us.

### are javascript’s built-in iterables reference or constructing?

JavaScript has several kinds of built-in iterables. For example, arrays are iterables. Are they reference iterables or constructing iterables? Let’s find out:

```javascript
const countdown = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const iCountdown = countdown[Symbol.iterator]();
const iCountdown2 = countdown[Symbol.iterator]();

iCountdown.next()
  //=> { done: false, value: 10 }

iCountdown2.next();
  //=> { done: false, value: 10 }

iCountdown.next()
  //=> { done: false, value: 9 }

iCountdown2.next()
  //=> { done: false, value: 9 }
```

Ah! Arrays are constructing iterables, you get a new iterable every time. That matters, even if you aren’t in the habit of extracting iterators from them using `[Symbol.iterator]` yourself. You might, for example, want to partially destructure an array and then later, iterate over it using `for... of`:

```javascript
const words = ['Gödel', 'Escher', 'Bach', 'An', 'Eternal', 'Golden', 'Braid'];

const [firstWord] = words;

firstWord
  //=> Gödel
  
for (const word of words) {
  if (word.length === 5) {
    console.log(word);
  }
}
  //=>
    Gödel
    Braid
```

That’s what we’d expect, that every time we iterate over an array, we iterate over the whole thing.

But are there any reference iterables built into JavaScript? It would be important to know this, because we would know *not* to expectto be able to iterate over them more than once.

Yes, there are. *Generators* produce reference iterators:

```javascript
function * wordGenerator () {
  yield 'Gödel';
  yield 'Escher';
  yield 'Bach';
  yield 'An';
  yield 'Eternal';
  yield 'Golden';
  yield 'Braid';
}

const words = wordGenerator();

const [firstWord] = words;

firstWord
  //=> Gödel
  
for (const word of words) {
  if (word.length === 5) {
    console.log(word);
  }
}
  //=>
```

A generator, when invoked, returns an iterable that provides a reference to an iterator. (Interestingly, the result of invoking a generator is an iterable that is also an iterator, and invoking its `[Symbol.iterator]()` returns itself!)

Thus, if we want to iterate over the contents of a generator, we have to invoke the generator again, and get a new reference iterable again, like this:

```javascript
const [firstWord] = wordGenerator();

firstWord
  //=> Gödel
  
for (const word of wordGenerator()) {
  if (word.length === 5) {
    console.log(word);
  }
}
  //=>
    Gödel
    Braid
```

It is not a particularly hard problem for us to remember to reinvoke generators every time we want to iterate over their contents. So it doesn’t look like the difference between reference iterables and constructing iterables is going to be much of a problem.

However.

### local and non-local scope

In these examples, the entire lifetime of the iterable is visible in the same piece of code. The iterables have local scope.

Now when we use the word *scope* in programming, we are often talking about the bindings of values to variable names. We say that such-and-such a variable has function scope, or block scope, or global scope.

But values themselves have scopes. The scope of a value is all of the places where it might appear in an expression or be bound to a variable. That might be quite a small area: In this expression, the variable `word` is local to the `for... of` block, and so is the value we bind to it: We test it in an `if` statement, and then never use it again:

```javascript
function countWordsOfLengthFive (words) {
  let count = 0;
  
  for (const word of words) {
    if (word.length === 5) {
      count++;
    }
  }
  
  return count;
}
```
We can say that the values bound to `word` are local to the `for... of` loop.

On the other hand, in this generator that acts as a kind of iterable filter, the values bound to `word` have *non-local scope*:

```javascript
function * wordsOfLengthFive (words) {
  for (const word of words) {
    if (word.length === 5) {
      yield word;
    }
  }
}
```

We can’t tell the scope of each of the values bound to `word`, because some of them are going to be yielded from this generator, and we can’t tell where they might be used without inspecting the rest of the program. They ‘escape’ the geneator by being yielded.

A similar thing happens when we return a value from a function:

```javascript
function * firstWordOfLengthFive (words) {
  for (const word of words) {
    if (word.length === 5) {
      return word;
    }
  }
}
```

The values bound to the first word of length five has non-local scope. And something similar happens when we pass a value to another function:

```javascript
function forEach(fn, iterable) {
  let index = 0;
  
  for (const v of iterable) {
    fn(value, index);
  }
}
```

We have no idea what the function bound to `fn` will do with the value bound to the variable `v`, so while `v` is local to the `for... of` loop, its *value* has non-local scope.

And finally, in all of our examples, we have parameters. Parameters are variables that are by definition local to their function, but the values bound to the variables are *by definition* non-local, because some other piece of code is going to call our function and pass in the values.[^recursion]

[^recursion]: The exception is that recursive function call themselves, so there is a case where the values bound to the parameter values were generated by a different invocation of the same function. 

### non-local scopes and iterable types
    
But what, we may well wonder, do non-local scopes have to do with whether an iterable is a reference iterable or a constructing iterable?

Obviously, if we write a function—like `forEach` above—that takes as its argument an iterable, we have no idea whether it is a reference iterable or not. We should not assume that we can iterate over it twice.

But what about when we create our own iterable, so we know for a fact whether it is a reference iterable or not? Well, if that iterable has local scope, no problem.

But if it has non-local scope, such as when we pass it as an argument to another function, we don’t know what the other function will do with it. If our iterable is a reference iterable, we can probably assume that whatever we pass it to may iterate over it.

This still isn’t a massive problem, with some careful thought about what is going to be used and how, we can write code that never attempts to iterate twice over reference iterables like the iterables returned from generators.

But things are about to get thornier.

### reading lines from a file

Consider this problem: We wish to create an iterable that successively yields the lines from a text file. Presuming we have some kind of library for opening, reading from, and closing files, we might write something a little like this:
  
```javascript
function lines (path) {
  return {
    [Symbol.iterator]() {
      return {
        done: false;
        fileDescriptor: File.open(path);
        next() {
          if (this.done) return { done: true };
          const line = this.fileDescriptor.readLine();
          
          this.done = line == null;
          
          if (this.done) {
            fileDescriptor.close();
            return { done: true };
          } else {
            return { done: false, value: line };
          }
        }
      };
    }
  };
}
```

Whenever we want to iterate over all the lines of a file, we call our function, e.g. `lines(‘./README.md’)`, and we get an iterable for the lines in the file.

When we invoke `[Symbol.iterator]()` on our iterable, we get an iterator that opens the file, reads the file line by line when we call `.next()`, and then closes the file when there are no more lines to be read.

So we could output all the lines containing a particular word like this:

```javascript
for (const line of lines(‘./README.md’)) {
  if (line.match(/raganwald/)) {
    console.log(line);
  }
}
```

The expression lines(‘./README.md’)` would create a new iterator with an open file, we’d iterate over each line, and eventually we’d run out of lines, close the file, and exit the loop.

What if we only want to find the first line with a particular word in it?

```javascript
for (const line of lines(‘./README.md’)) {
  if (line.match(/raganwald/)) {
    console.log(line);
    break;
  }
}
```

Now we have a problem. How are we going to close the file? The only way it will exhaust the iterations and invoke `this.fileDescriptor.close()` is if the file doesn’t contain `raganwald`.

There is a mechanism for closing iterators, and it was designed for the express purpose of dealing with iterators that must hold onto some kind of resource like a file descriptor, an open port, a tremendous amount of memory, anything at all, really.

But before we dive into the mechanism, let’s reflect on the relationship between non-local values and the need to manage resources like open files: When we have an object like an iterator that holds a resource like an open file, we need to write code that takes care of disposing of the resource when we know we no longer need it.

This is fine for local resources. In the code above, we know we are dealing with an iterator over the lines of a file and could easily close it ourselves. But what about non-local iterators? Do we know if they are iterating over lines in a file? How do we know whether we have to close them in some way? What if we pass an iterable to a function. Will the function close our iterable’s iterator? Or should we?

Iterables that need to dispose of resources introduce a new problem when working with non-local iterables and iterators. To solve it, the language introduced a mechanism for closing iterators, but we will still need to work out patterns and protocols of our own.

Let’s take a look at the mechanism.

### return to forever

We’ve seen that the interface for iterators includes a mandatory `.next()` method. It also includes an optional `.return()` method. The contract for `.return(optionalReturnValue)` is that when invoked:

- it should return `{ done: true }` is no optional retun value is provided, or `{ done: true, value: optionalReturnValue }` if an optional return value is provided.
- thereafter, the iterator should permanently return `{ done: true }` should `.next()` be called.
- as a consequence of the above, the iterator can and should dispose of any resources it is holding.

Looking back at our countdown iterable, we can implement `.return()` for it:

```javascript
const countdown = {
  [Symbol.iterator]() {
    const iterator = {
      value: 10,
      done: false,
      next() {
        this.done = this.done || this.value < 0;
        
        if (this.done) {
          return { done: true };
        } else {
          return { done: false, value: this.value-- };
        }
      },
      return(value) {
        this.done = true;
        if (arguments.length === 1) {
          return { done: true, value };
        } else {
          return { done: true };
        }
      }
    };
    
    return iterator;
  }
};
```

There is some duplication of logic around returning `{ done: true }` and setting `this.done = true`, and this dusplication will be more acute when we deal with disposing of resources, so let’s clean it up:

```javascript
const countdown = {
  [Symbol.iterator]() {
    const iterator = {
      value: 10,
      done: false,
      next() {
        if (this.done) {
          return { done: true };
        } else if (this.value < 0) {
          return this.return();
        } else {
          return { done: false, value: this.value-- };
        }
      },
      return(value) {
        this.done = true;
        if (arguments.length === 1) {
          return { done: true, value };
        } else {
          return { done: true };
        }
      }
    };
    
    return iterator;
  }
};
```

Using a breakpoint or an old-fashioned `console.log(“EREIAM”)`

Back in the C++ days, the question of whether what appeared to be different variables held references to the same data structure or different data structures was extremely pertinent, because we had to sort out which piece of code was responsible for freeing the data’s memory when it was no longer needed.

The concept of every piece of data having an *owner* was developed. Let’s pretend for a moment that JavaScript does not have garbage collection. We write:

```javascript
function A (a) {
 const aa = a.concat[‘foo’];
 
 return aa;
}

function B () {
  const b = [‘bar’];
  const bb = A(b);
}

B()
```

In this code, when `B` creates `b`, it obviously owns `b`, and is responsible for freeing its memory. But then it passes `b` to `A`. Can `B` now safely free `b`? Maybe, maybe not. We have to look at the code for `A` and see that once `A` finishes executing, it no longer needs `b`.

We would say that `B` owns `b`, and `A` does not. We’d also say that when `A` returns `aa`, whomever calls `A`, `B` in this case, now owns it.

Putting all that together, we



Languages like JavaScript that incorporate automatic garbage collection have made this consideration go away, but the general probl



This post is about resource management: Keeping track of entities so we can dispose of them when they are no longer needed, and not a moment before.

In languages like C++, resource management dominates every line of code, because the programmer is responsible for allocating and deallocating the memory for every data structure on the heap, and for taking care that variables are not referenced after they are no longer in scope.

Languages like JavaScript solve many–but not all–resource management problems for us. All objects are stored on the heap, so we never have to wrry about having a reference to a data structure that is no longer in scope.[

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

We’ll test our code by taking advantage of *destructuring*: We can destructure any iterable with a finite number of values into an array:

```javascript
[...butFirst(['An', 'Eternal', 'Golden', 'Braid'])]
  //=> ['Eternal', 'Golden', 'Braid']
```

We have other options. We could iterate over our iterable using a `for...of` loop:

```javascript
for (const w of butFirst(['An', 'Eternal', 'Golden', 'Braid'])) {
    console.log(w);
}
  //=>
    Eternal
    Golden
    Braid
```

Here’s a quick question: Does our `second` function still work?

```javascript

function second (something) {
  return first(butFirst(something));
}

second(‘alpher’, ‘bethe’, ‘gamow’)
  //=> ‘bethe’
```

Yes it does. Great!

### generators and iterables

in JavaScript, *generators* are functions that can be used as data producers, data consumers, or even coroutines.[^generating-iterables]

[^generating-iterables]: There’s more about generators in the [Generating Iterables](https://leanpub.com/javascriptallongesix/read#generating-iterables section of [JavaScript Allongé](https://leanpub.com/javascriptallongesix/read)

As data producers, they produce iterables when invoked. For example, we could write:

```javascript
function * combinators () {
  yield 'starling';
  yield 'kestrel';
  yield 'idiot';
  yield 'virago';
  yield 'thrush';
}

first(combinators())
  //=> ‘starling’
```

And also:

```javascript
[...butFirst(combinators())]
  //=> [‘kestrel’, ‘idiot’, ‘virago’, ‘thrush’]
```

And, of course:

```javascript
second(combinators())
  //=> ‘kestrel’
```

This is going great, if a little obvious considering how basic this ought to be.

### destructuring
 
### well, actually

Sooner or later, we’ll get enthusiastic about using laziness to implement infinite iterators. For example, here’s a hand-coded iterator that provides the natural numbers:

[laziness]: https://en.wikipedia.org/wiki/Lazy_evaluation “Lazy Evaluation”

```javascript
function * combinators () {
  yield 'starling';
  yield 'kestrel';
  yield 'idiot';
  yield 'virago';
  yield 'thrush';
}

const iterableFor = iterator => ({
  [Symbol.iterator]() { return iterator; }
});

function first (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value } = iterator.next();
  
  if (!done) return value;
}

function butFirst (iterable) {
  const iterator = iterable[Symbol.iterator]();
  
  iterator.next();
  
  return iterableFor(iterator);
ring}

function second (something) {
  return first(butFirst(something));
}

console.log(second(combinators()))
```
