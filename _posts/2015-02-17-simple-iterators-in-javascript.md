---
layout: default
title: "Iterables in JavaScript"
tags: [allonge]
---

### from

Having iterated over a collection, are we limited to `for..do` and/or gathering the elements in an array literal and/or gathering the elements into the parameters of a function? No, of course not, we can do anything we like with them.

One useful thing is to write a `.from` function that gathers an iterable into a particular collection type. JavaScript's built-in `Array` class already has one:

{% highlight javascript %}
Array.from(compose(untilTooBig, oddsOf, squaresOf)(Numbers))
  //=> [1, 9, 25, 49, 81]
{% endhighlight %}

We can do the same with our own collections. As you recall, functions are mutable objects. And we can assign properties to functions with a `.` or even `[` and `]`. And if we assign a function to a property, we've created a method.

So let's do that:

{% highlight javascript %}
Stack3.from = function (iterable) {
  const stack = this();
  
  for (let element of iterable) {
    stack.push(element);
  }
  return stack;
}

Pair1.from = (iterable) =>
  (function interationToList (iteration) {
    const {done, value} = iteration.next();
    
    return done ? EMPTY : Pair1(value, interationToList(iteration));
  })(iterable[Symbol.iterator]())
{% endhighlight %}

Now we can go "end to end," If we want to map a linked list of numbers to a linked list of the squares of some numbers, we can do that:

{% highlight javascript %}
const numberList = Pair1.from(until((x) => x > 10, Numbers));

Pair1.from(squaresOf(numberList))
  //=> {"first":0,
        "rest":{"first":1,
                "rest":{"first":4,
                        "rest":{ ...
{% endhighlight %}

### why operations on iterables?

The operations on iterables are interesting, but let's reiterate why we care: In JavaScript, we build single-responsibility objects, and single-responsibility functions, and we compose these together to build more full-featured objects and algorithms.

> Composing an iterable with a `mapIterable` method cleaves the responsibility for knowing how to map from the fiddly bits of how a linked list differs from a stack

in the older style of object-oriented programming, we built "fat" objects. Each collection knew how to map itself (`.map`), how to fold itself (`.reduce`), how to filter itself (`.filter`) and how to find one element within itself (`.find`). If we wanted to flatten collections to arrays, we wrote a `.toArray` method for each type of collection.

Over time, this informal "interface" for collections grows by accretion. Some methods are only added to a few collections, some are added to all. But our objects grow fatter and fatter. We tell ourselves that, well, a collection ought to know how to map itself.

But we end up recreating the same bits of code in each `.map` method we create, in each `.reduce` method we create, in each `.filter` method we create, and in each `.find` method. Each one has its own variation, but the overall form is identical. That's a sign that we should work at a higher level of abstraction, and working with iterables is that higher level of abstraction.

This "fat object" style springs from a misunderstanding: When we say a collection should know how to perform a map over itself, we don't need for the collection to handle every single detail. That would be like saying that when we ask a bank teller for some cash, they personally print every bank note.

Object-oriented collections should definitely have methods for mapping, reducing, filtering, and finding. And they should know how to accomplish the desired result, but they should do so by delegating as much of the work as possible to operations like `mapIterableWith`.

Composing an iterable with a `mapIterable` method cleaves the responsibility for knowing how to map from the fiddly bits of how a linked list differs from a stack. And if we want to create convenience methods, we can reuse common pieces:

{% highlight javascript %}
const extend = function (consumer, ...providers) {
  for (let i = 0; i < providers.length; ++i) {
    const provider = providers[i];
    for (let key in provider) {
      if (provider.hasOwnProperty(key)) {
        consumer[key] = provider[key]
      }
    }
  }
  return consumer
};
  
const mapIterableWith = (fn, iterable) =>
  extend({
    [Symbol.iterator]: () => {
      const iterator = iterable[Symbol.iterator]();
      
      return {
        next: () => {
          const {done, value} = iterator.next();
    
          return ({done, value: done ? undefined : fn(value)});
        }
      }
    }
  }, LazyIterable);
  
const reduceIterableWith = (fn, seed, iterable) => {
  const iterator = iterable[Symbol.iterator]();
  let iterationResult,
      accumulator = seed;
  
  while ((iterationResult = iterator.next(), !iterationResult.done)) {
    accumulator = fn(accumulator, iterationResult.value);
  }
  return accumulator;
};
  
const filterIterableWith = (fn, iterable) =>
  extend({
    [Symbol.iterator]: () => {
      const iterator = iterable[Symbol.iterator]();
      
      return {
        next: () => {
          do {
            const {done, value} = iterator.next();
          } while (!done && !fn(value));
          return {done, value};
        }
      }
    }
  }, LazyIterable);

const until = (fn, iterable) =>
  extend({
    [Symbol.iterator]: () => {
      const iterator = iterable[Symbol.iterator]();
    
      return {
        next: () => {
          let {done, value} = iterator.next();
        
          done = done || fn(value);
  
          return ({done, value: done ? undefined : value});
        }
      }
    }
  }, LazyIterable);
  
const firstIterable = (iterable) =>
  iterable[Symbol.iterator]().next().value;

const restIterable = (iterable) => 
  extend({
    [Symbol.iterator]: () => {
      const iterator = iterable[Symbol.iterator]();
      
      iterator.next();
      return iterator;
    }
  }, LazyIterable);
  
const takeIterable = (numberToTake, iterable) =>
  extend({
    [Symbol.iterator]: () => {
      const iterator = iterable[Symbol.iterator]();
      let remainingElements = numberToTake;
    
      return {
        next: () => {
          let {done, value} = iterator.next();
        
          done = done || remainingElements-- > 0;
  
          return ({done, value: done ? undefined : value});
        }
      }
    }
  }, LazyIterable);
    
const LazyIterable = {
   map: function (fn) {
     return mapIterableWith(fn, this);
   },
   reduce: function (fn, seed) {
     return reduceIterableWith(fn, seed, this);
   },
   filter: function (fn) {
     return filterIterableWith(fn, this);
   },
   find: function (fn) {
     return filterIterableWith(fn, this).first();
   },
   first: function () {
     return firstIterable(this);
   },
   rest: function () {
     return restIterable(this);
   },
   take: function (numberToTake) {
     return takeIterable(numberToTake, this);
   }
}

// Pair, a/k/a linked lists

const EMPTY = {
  isEmpty: () => true
};

const isEmpty = (node) => node === EMPTY;

const Pair = (car, cdr = EMPTY) =>
  extend({
    car,
    cdr,
    isEmpty: () => false,
    [Symbol.iterator]: function () {
      let currentPair = this;
      
      return {
        next: () => {
          if (currentPair.isEmpty()) {
            return {done: true}
          }
          else {
            const value = currentPair.car;
            
            currentPair = currentPair.cdr;
            return {done: false, value}
          }
        }
      }
    }
  }, LazyIterable);

Pair.from = (iterable) =>
  (function interationToList (iteration) {
    const {done, value} = iteration.next();
    
    return done ? EMPTY : Pair(value, interationToList(iteration));
  })(iterable[Symbol.iterator]());
  
// Stack

const Stack = () =>
  extend({
    array: [],
    index: -1,
    push: function (value) {
      return this.array[this.index += 1] = value;
    },
    pop: function () {
      const value = this.array[this.index];
    
      this.array[this.index] = undefined;
      if (this.index >= 0) { 
        this.index -= 1 
      }
      return value
    },
    isEmpty: function () {
      return this.index < 0
    },
    [Symbol.iterator]: function () {
      let iterationIndex = this.index;
      
      return {
        next: () => {
          if (iterationIndex > this.index) {
            iterationIndex = this.index;
          }
          if (iterationIndex < 0) {
            return {done: true};
          }
          else {
            return {done: false, value: this.array[iterationIndex--]}
          }
        }
      }
    }
  }, LazyIterable);
  
Stack.from = function (iterable) {
  const stack = this();
  
  for (let element of iterable) {
    stack.push(element);
  }
  return stack;
}

// Pair and Stack in action
  
Stack.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .map((x) => x * x)
  .filter((x) => x % 2 == 0)
  .first()

//=> 100
  
Pair.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .map((x) => x * x)
  .filter((x) => x % 2 == 0)
  .reduce((seed, element) => seed + element, 0)
  
//=> 220
{% endhighlight %}

### lazy and eager iterables

"Laziness" is a very pejorative word when applied to people. But it can be an excellent strategy for efficiency in algorithms. Let's be precise: *Laziness* is the characteristic of not doing any work until you know you need the result of the work.

Here's an example. Compare these two:

{% highlight javascript %}
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .map((x) => x * x)
  .filter((x) => x % 2 == 0)
  .reduce((seed, element) => seed + element, 0)
  
Pair.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .map((x) => x * x)
  .filter((x) => x % 2 == 0)
  .reduce((seed, element) => seed + element, 0)
{% endhighlight %}

Both expressions evaluate to `220`. And they array is faster in practice, because it is a built-in data type that performs its work in the engine, while the linked list does its work in JavaScript.

But it's still illustrative to dissect something important: Array's `.map` and `.filter` methods gather their results into new arrays. Thus, calling `.map.filter.reduce` produces two temporary arrays that are discarded when `.reduce` performs its final computation.

Whereas the `.map` and `.filter` methods on `Pair` work with iterators. They produce small iterable objects that refer back to the original iteration. This reduces the memory footprint. When working with very large collections and many operations, this can be important.

The effect is even more pronounced when we use methods like `first`, `until`, or `take`:

{% highlight javascript %}
Stack.from([ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
            10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28, 29])
  .map((x) => x * x)
  .filter((x) => x % 2 == 0)
  .first()
{% endhighlight %}

This expression begins with a stack containing 30 elements. The top two are `29` and `28`. It maps to the squares of all 30 numbers, but our code for mapping an iteration returns an iterable that can iterate over the squares of our numbers, not an array or stack of the squares. Same with `.filter`, we get an iterable that can iterate over the even squares, but not an actual stack or array.

finally, we take the first element of that filtered, squared iterable and now JavaScript actually iterates over the stack's elements, and it only needs to square two of those elements, `29` and `28`, to return the answer.

We can confirm this:

{% highlight javascript %}
Stack.from([ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
            10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28, 29])
  .map((x) => {
    console.log(`squaring ${x}`);
    return x * x
  })
  .filter((x) => {
    console.log(`filtering ${x}`);
    return x % 2 == 0
  })
  .first()

//=>
  squaring 29
  filtering 841
  squaring 28
  filtering 784
  784
{% endhighlight %}

If we write the almost identical thing with an array, we get a different behaviour:

{% highlight javascript %}
[ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
  .reverse()
  .map((x) => {
    console.log(`squaring ${x}`);
    return x * x
  })
  .filter((x) => {
    console.log(`filtering ${x}`);
    return x % 2 == 0
  })[0]

//=>
  squaring 0
  squaring 1
  squaring 2
  squaring 3
  ...
  squaring 28
  squaring 29
  filtering 0
  filtering 1
  filtering 4
  ...
  filtering 784
  filtering 841
  784
{% endhighlight %}

Arrays copy-on-read, so every time we perform a map or filter, we get a new array and perform all the computations. This might be expensive. Balanced against that, our "lazy iterables" use structure sharing, so if we pop something off a stack after taking an iterable, we might get an unexpected result.

Arrays have *eager* semantics for `.map`, `.filter`, `.rest` and `.take`. They return another array, not a lazy iterable. Whereas, the `Stack` and `Pair` collections we wrote have *lazy* semantics: They return a lazy iterable and when we want a true collection, we have to gather the elements into an array or another collection using `.from`:

{% highlight javascript %}
const evenSquares = Pair.from(
  Pair.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .map((x) => x * x)
    .filter((x) => x % 2 == 0)
  );

[...evenSquares]
  //=> [4,16,36,64,100]
{% endhighlight %}

Or if we want to design a collection with eager semantics for `.map`, `.filter`, `.rest` and `.take`, we can do that:

{% highlight javascript %}
const EagerIterable = (gatherable) =>
  ({
     map: function (fn) {
       return gatherable.from(mapIterableWith(fn, this));
     },
     reduce: function (fn, seed) {
       return reduceIterableWith(fn, seed, this);
     },
     filter: function (fn) {
       return gatherable.from(filterIterableWith(fn, this));
     },
     find: function (fn) {
       return filterIterableWith(fn, this).first();
     },
     first: function () {
       return firstIterable(this);
     },
     rest: function () {
       return gatherable.from(restIterable(this));
     },
     take: function (numberToTake) {
       return gatherable.from(takeIterable(numberToTake, this));
     }
  })
  
const EagerStack = () =>
  extend({
    array: [],
    index: -1,
    push: function (value) {
      return this.array[this.index += 1] = value;
    },
    pop: function () {
      const value = this.array[this.index];
    
      this.array[this.index] = undefined;
      if (this.index >= 0) { 
        this.index -= 1 
      }
      return value
    },
    isEmpty: function () {
      return this.index < 0
    },
    [Symbol.iterator]: function () {
      let iterationIndex = this.index;
      
      return {
        next: () => {
          if (iterationIndex > this.index) {
            iterationIndex = this.index;
          }
          if (iterationIndex < 0) {
            return {done: true};
          }
          else {
            return {done: false, value: this.array[iterationIndex--]}
          }
        }
      }
    }
  }, EagerIterable(EagerStack));
  
EagerStack.from = function (iterable) {
  const stack = this();
  
  for (let element of iterable) {
    stack.push(element);
  }
  return stack;
}

EagerStack
  .from([1, 2, 3, 4, 5])
  .map((x) => x * 2)
  
//=> {"array":[10,8,6,4,2],"index":4}
{% endhighlight %}

And we can go back and forth between them. For example, if we want a lazy map of an array, we can use the `mapIterableWith` function to return a lazy iterable. And as we just noted, we can use `.from` to eagerly gather any iterable into a collection.

### summary

Iterators are a JavaScript feature that allow us to separate the concerns of how to iterate over a collection from what we want to do with the elements of a collection. *Iterable* collections can be iterated over or gathered into another collection, either lazily or eagerly.

Separating concerns with iterators speaks to JavaScript's fundamental nature: It's a language that *wants* to compose functionality out of small, singe-responsibility pieces, whether those pieces are functions or objects built out of functions.

---

*postscript*:

This post was extracted from the in-progress book, [JavaScript Allongé, The "Six" Edition][ja6]. Your feedback helps everyone, so please, join the discussion or submit an edit directly. Thank you!

[ja6]: https://leanpub.com/b/buy-allonge-get-thesixedition-free