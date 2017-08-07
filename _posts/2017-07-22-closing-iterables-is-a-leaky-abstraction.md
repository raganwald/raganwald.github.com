---
title: "Closing Iterables is a Leaky Abstraction"
layout: default
tags: [allonge]
---

### iterators and iterables, a quick recapitulation

In JavaScript, iterators and iterables provide an abstract interface for sequentially accessing values, such as you might find in a collection.[^collections]

[^collections]: For a more thorough discussion of iterators and iterables, have a look at the [Collections](https://leanpub.com/javascriptallongesix/read#collections) chapter of [JavaScript Allongé](https://leanpub.com/javascriptallongesix)

An iterator is an object with a `.next()` method. When you call it, you get a Plain Old JavaScript Object (or “POJO”) that has a `done` property. If the value of `done` is `false`, you are also given a `value` property that represents, well, a value. If the value of `done` is `true`, you may or may not be given a `value` property.

Iterators are stateful by design: Repeatedly invoking the `.next()` method usually results in a series of values until `done` (although some iterators continue indefinitely).

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

And now, let's get started. We'll begin with a simple problem: How do we iterate over the lines of a text file?

### reading lines from a file

We wish to create an iterable that successively yields the lines from a text file. Presuming we have some kind of library for opening, reading from, and closing files, we might write something a little like this:
  
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

Whenever we want to iterate over all the lines of a file, we call our function, e.g. `lines('./README.md’)`, and we get an iterable for the lines in the file.

When we invoke `[Symbol.iterator]()` on our iterable, we get an iterator that opens the file, reads the file line by line when we call `.next()`, and then closes the file when there are no more lines to be read.

So we could output all the lines containing a particular word like this:

```javascript
for (const line of lines('./README.md’)) {
  if (line.match(/raganwald/)) {
    console.log(line);
  }
}
```

The expression lines('./README.md’)` would create a new iterator with an open file, we’d iterate over each line, and eventually we’d run out of lines, close the file, and exit the loop.

What if we only want to find the first line with a particular word in it?

```javascript
for (const line of lines('./README.md’)) {
  if (line.match(/raganwald/)) {
    console.log(line);
    break;
  }
}
```

Now we have a problem. How are we going to close the file? The only way it will exhaust the iterations and invoke `this.fileDescriptor.close()` is if the file doesn’t contain `raganwald`. If the file *does* contain `raganwald`, our program will happily carry on while leaving the file open.

This is not good. And it's not the only case. We might write iterators that act as coroutines, communicating with other processes over ports. Once again, we'd want to explicitly close the port when we are done with the iterator. We don't want to just garbage-collect the memory we're using.

What we need is some way to explicitly "close" iterators, and then each iterator could dispose of any resources it is holding. Then we could exercise a little caution, and explicitly close every iterator when we were done with them. We wouldn't need to know whether the iterator was holding on to an open file or socket or whatever, the iterator would deal with that.

Fortunately, there is a mechanism for closing iterators, and it was designed for the express purpose of dealing with iterators that must hold onto some kind of resource like a file descriptor, an open port, a tremendous amount of memory, anything at all, really.

Iterables that need to dispose of resources introduce a problem. To solve it, the language introduced a mechanism for closing iterators, but we will still need to work out patterns and protocols of our own.

Let’s take a look at the mechanism.

### return to forever

We’ve seen that the interface for iterators includes a mandatory `.next()` method. It also includes an optional `.return()` method. The contract for `.return(optionalReturnValue)` is that when invoked:

- it should return `{ done: true }` is no optional return value is provided, or `{ done: true, value: optionalReturnValue }` if an optional return value is provided.
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

There is some duplication of logic around returning `{ done: true }` and setting `this.done = true`, and this duplication will be more acute when we deal with disposing of resources, so let’s clean it up:

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

Now we can see how to write a loop that breaks before it exhausts the entire iteration:

```javascript
count iCountdown = countdown[Symbol.iterator]();

while (true) {
  const { done, value: count } = iCountdown.next();
  
  if (done) break;
  
  console.log(count);
  
  if (count === 6) {
    iCountdown.return();
    break;
  }
}
```

Calling `.return()` ensures that `iCountdown` disposes of any resources it has or otherwise cleans itself up. Of course, this is a PITA if we have to work directly with iterators and give up the convenience of things like `for... of` loops and destructuring.

It would be really nice if they followed the same pattern. Do they? Let's find out. We can use a breakpoint in the `.return()` method, or insert an old-school `console.log` statement:

```javascript
return(value) {
  if (!this.done) {
    console.log('Return to Forever');
    this.done = true;
  }
  if (arguments.length === 1) {
    return { done: true, value };
  } else {
    return { done: true };
  }
}
```

And now let's try:

```javascript
for (const count of countdown) {
  console.log(count);
  if (count === 6) break;
}
  //=>
    10
    9
    8
    7
    6
    Return to Forever
```

And also:

```javascript
const [ten, nine, eight] = countdown;
  //=> Return to Forever
```

JavaScript's built-in constructs for consuming iterators from iterables invoke `.return()` if we don't consume the entire iteration.

Also, we can see that the `.return()` method is optional: JavaScript's built-in constructs will not call `.return()` on an iterator that doesn't implement `.return()`.

### invoking return isn't always simple

So, now we see that we should write our iterators to have a `.return()` method when they have resources that need to be disposed of, and that we can use this method ourselves or rely on JavaScript's built-in constructs to call it for us.

This can be tricky. Here's a function that returns the first value (if any) of an iterable:

```javascript
function first (iterable) {
  const [value] = iterable;
  
  return value;
}
```

Because destructuring always closes the iterator extracted from the iterable it is given, this flavour of `first` can be counted on to close its parameter. If we get fancy and try to do everything by hand:

```javascript
function first (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value } = iterator.next();
  
  if (!done) return value;
}
```

We might neglect closing the iterator we extracted. We have to do *everything* ourselves:

```javascript
function first (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value } = iterator.next();
  
  if (typeof iterator.return === 'function') {
    iterator.return();
  }
  
  if (!done) return value;
}
```

A good heuristic is, *If we can use JavaScript's built-in constructs to close a the iterator extracted from an iterable, we should.*

As we can see, destructuring handles closing an iterator for us. We've already seen that breaking a `for... of` loop also closes an iterator for us, whether we exhaust the iterator or break from inside the loop.

This is also true if we `yield` from inside a `for... of` loop within a generator. For example, we have previously seen functions like `mapWith`:

```javascript
function * mapWith (mapFn, iterable) {
  for (const value of iterable) {
    yield mapFn(value);
  }
}
```

This is a generator that takes an iterable as an argument and returns an iterable. We can see that if we exhaust the iterable it returns, it will exhaust the iterable it is passed. But what happens if we terminate the iteration prematurely? For example, what if we break from inside a `for... of` loop?

We can test this directly:

```javascript
const countdownInWords = mapWith(n => words[n], countdown);

for (const word of countdownInWords) {
  break;
}
  //=> Return to Forever
```

Invoking `break` inside this `for... of` loop is also invoking `break` inside of `mapWith`'s `for... of` loop, because that is where execution pauses when it invokes `yield`. So this will close the iterator that `mapWith`'s `for... of` loop extracts.

Unfortunately, we cannot always arrange for JavaScript's built-in constructs to close our iterators for us.

### more about closing iterators explicitly

The `zipWith` function takes two or more iterables, and "zips" them together with a function. There's no easy way to write this as a generator, because there's no easy way to arrange for JavaScript's built-in constructs to close all of the iterators we extract from its parameters.

Here's an example that won't work properly for iterators that need to dispose of a resource:

```javascript
function * zipWith (zipper, ...iterables) {
  const iterators = iterables.map(i => i[Symbol.iterator]());
  
  while (true) {
    const pairs = iterators.map(j => j.next()),
          dones = pairs.map(p => p.done),
          values = pairs.map(p => p.value);
          
    if (dones.indexOf(true) >= 0) {
      for (const iterator of iterators) {
        if (typeof iterator.return === 'function') {
          iterator.return();
        }
      }
      return;
    }
    
    yield zipper(...values);
  }
}
const fewWords = ['alper', 'bethe', 'gamow'];
               
for (const pair of zipWith((l, r) => [l, r], countdown, fewWords)) {
  //... diddley
}
  //=> Return to Forever
```

This code will explicitly close every iterator if and when any one of them is exhausted. However, if we prematurely terminate the iteration, such as using incomplete destructuring or invoking `break` from inside a loop, it will not close any of the iterators:

```javascript
const [[firstCount, firstWord]] = zipWith((l, r) => [l, r], countdown, fewWords);
  //=>
```

This snippet does not log `Return to Forever`. Although JavaScript's built-in behaviour attempts to close the iterator created by our generator function, it never invokes the code we wrote to close all the iterators.

One sure way to close all the iterators is to take 100% control of `zipWith`. Instead of writing it as a generator function, we can write it as a function that returns an iterable object:

```javascript
function zipWith (zipper, ...iterables) {
  return {
    [Symbol.iterator]() {
      return {
        done: false,
        iterators: iterables.map(i => i[Symbol.iterator]()),
        zipper,
        next() {
          const pairs = this.iterators.map(j => j.next()),
                dones = pairs.map(p => p.done),
                values = pairs.map(p => p.value);
                
          if (dones.indexOf(true) >= 0) {
            return this.return();
          } else {
            return { done: false, value: this.zipper(...values) };
          }
        },
        return(optionalValue) {
          if (!this.done) {
            this.done = true;
          
            for (const iterable of this.iterators) {
              if (typeof iterable.return === 'function') {
                iterable.return();
              }
            }
          }
          
          if (arguments.length === 1) {
            return { done: true, value:optionalValue };
          } else {
            return { done: true };
          }
        }
      };
    }
  };
}
```

Now, when we close the iterable returned by `zipWith`, we are going to explicitly close each and every one of the iterables we pass into it, provided that they implement `.return()`. Let's try it:

```javascript
const [[firstCount, firstWord]] = zipWith((l, r) => [l, r], countdown, fewWords);
  //=> Return to Forever
```

We have now arranged things such that `zipWith` takes care to close its iterators when its own iterator is closed.

### hidden affordances

We've seen that iterators need to be closed. We've also seen that the affordance for closing an iterator is invisible. There's a `.return()` method we may need to invoke. We also may need to implement it. But it's usually invisible, and the most convenient way to work with iterables--writing generators and using constructs like `for... of` loops or destructuring--hides `.return()` from us.

This conscious design choice does make learning about iterables particularly easy. It's easy to write generators, and when we encounter code like this in a [blog post]:

[blog post]: http://raganwald.com/2016/03/17/programs-must-be-written-for-people-to-read.html "“Programs must be written for people to read, and only incidentally for machines to execute”"

```javascript
function * take (numberToTake, iterable) {
  const iterator = iterable[Symbol.iterator]();

  for (let i = 0; i < numberToTake; ++i) {
    const { done, value } = iterator.next();
    if (!done) yield value;
  }
}
```

We can grasp the fundamental idea of what the code is trying to accomplish very quickly. But it's not obvious to the untrained eye why this code is preferred:

```javascript
function * take (numberToTake, iterable) {
  let i = 0;

  for (const value of iterable) {
    if (i++ === numberToTake) {
      return;
    } else {
      yield value;
    }
  }
}
```

Is the `for... of` loop more elegant? What if `for (let i = 0; i < numberToTake; ++i)` is faster? Unfortunately, the important difference between these two implementations is hidden from view.

### chesterton's fence and leaky abstractions

> In the matter of reforming things, as distinct from deforming them, there is one plain and simple principle; a principle which will probably be called a paradox. There exists in such a case a certain institution or law; let us say, for the sake of simplicity, a fence or gate erected across a road. The more modern type of reformer goes gaily up to it and says, "I don't see the use of this; let us clear it away." To which the more intelligent type of reformer will do well to answer: "If you don't see the use of it, I certainly won't let you clear it away. Go away and think. Then, when you can come back and tell me that you do see the use of it, I may allow you to destroy it." --G.K. Chesterton

Imagine that some code included the "correct" implementation of `take`. An engineer sees it, decides it could be faster, and optimizes it, therein removing its ability to correctly close an iterable it is handed. Is this wrong? How would anybody know, if there is no mechanism to discover why it was written that way to begin with?

Many patterns are like this. They include code for solving problems that are not evident on the first read: We have to have encountered the problem in the past in order to appreciate why the code we're looking at solves it. And to be fair, the problem being solved may not apply to us today.

The implementation of `take` given in the blog post is fine for the code in the blog post, and for most code. But when it isn't fine, it's broken.

This is the state of affairs with all code, whether functional, OO, whatever. We have "leaky abstractions" like iterables. They are fine as longa s we are well within the most common case, but when we stray near the edges,we need to understand what is going on "under the hood" in order to appreciate interactions such as whether a `for... of` loop inside a generator closes its iterator if the enclosing iterator is closed while it yields.

### in closing

In closing, we find that closing iterables introduces an aspect of how to write correct iterables code that is not always visibly evident. Sometimes we must choose one construct sometimes another. Sometimes we are safe to use generators, sometimes we must write functions that return iterable objects.

In the end, the safest way to proceed is to understand our tools really, really well. Abstractions are useful for writing code that eliminates accidental complexity, but that does not mean that we as programmers do not need to understand what is happening beneath the abstractions. It is just that we don't always need to clutter our code up with what is happening beneath the abstractions