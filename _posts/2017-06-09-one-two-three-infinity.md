---
title: "One, Two, Three, ... Infinity"
layout: default
tags: [allonge, noindex]
---

Imagine we create intelligent life. Perhaps they are sims in a virtual world. Or if you prefer, they arise spontaneously in miniature as part of a school science experiment.

They are intelligent, social, and self-sufficient. They have their own language. They organize themselves, they solve problems collaboratively, in many ways they are just like us.

However, unlike you and I, their language is [anumeric]: They have no words or notation for numbers! This seems very odd to us, but to them things seem just fine.[^romance] 

[anumeric]: https://theconversation.com/anumeric-people-what-happens-when-a-language-has-no-words-for-numbers-75828 "‘Anumeric’ people: What happens when a language has no words for numbers?"

[^romance]: This essay is inspired by the very first book about mathematics or science I can remember reading, Gamow's "One, Two, Three, Infinity." In it , Gamow gave an account of a supposed primitive human tribe that could only count definitively to three, every larger number was "many." With time and maturity I see that we should be very careful about patronising actual humans who live in or have recently lived in what we may think is a primitive manner. For this reason, I speak only of sims and not of real people. Absolutely no inference should be drawn from our hypothetical sims to real people, if for no other reason than the obvious: Artificial life we might actually program is far more likely to reflect our prejudices about the nature of life than reality.

How do they solve problems without words for numbers?

### solving problems without words for numbers

Our sims grasp the notions of *nothing*, *something*, and *a quantity of something*. Our sims often work with more than one something, like the children in their family, or the fruit in a basket. In their language, a child is a something, the children in their family are a quantity of something: A child, a quantity of children. Likewise, a fruit, a quantity of fruit.

They might need to solve a simple problem involving quantities. For example, are there at least enough fruits in this particular basket such that each child can have one to themselves?

To solve problems like determining whether there as many of one something as there are of another--without distinct numbers--the sims developed the idea of an ordering of things. An ordering is a mechanism for iterating over a collection of things one at a time. There is no way to get the size of an ordering: Not only do they have no concept of numbers one could use for sizes, orderings aren't necessarily finite. For example, days consist on an ordering. There is one today, there will be another tomorrow, and so it goes until the death of our sun and anybody left on our planet will have no concept of dawn or dusk.

Our sims can easily compare the quntity of fruits to the quantity of children via orderings. Plucking a fruit from the basket consists of ordering the quantity of fruit. At some point, the basket goes from having a quantity of fruit to nothing fruit, when that happens, we say the ordering is `done`.

Likewise, ordering the children is trivial. Line them up and have them step forward, one at a time.

So how can a sim determine if there are at at least as many fruits as children?

First, our sim creates an ordering for the fruit, and an ordering for the children. Now the sim plucks a fruit from the basket and simultaneously asks a child to step forward. This is repeated until either the basket is empty, meaning that the ordering of fruit is done, or until there are no more children in line, meaning that the ordering of children is done.

If the ordering of fruit is done, but the ordering of children is not done, there is not enough fruit for each child. Without having a notion for the precise numbers of fruit or children, our sim knows that the quantity of children is larger than the quantity of fruit.

If both are done on the same step, our sim knows that the two quantities are identical.

And if the ordering of children is done, but the ordering of fruit is not done, our sim knows that the quantity of fruit is larger than the quantity of children.

We can implement this algorithm. Let's use generators[^well-actually] to represent orderings.

### generators

Borrowing a page or two from languages like Python, JavaScript provides **generators**, functions that when invoked, return an *iterator*. What's an iterator? Push that question on the stack for a moment and let's see what they do:

The simplest possible generator looks like this:

```javascript
function * Nothing () {}
```

A generator is a function denoted with a special `*`. When a generator is invoked, it always returns an *iterator*.[^iterable] This is not the same as a normal function: A normal function returns whatever we decide it should return, when we use the `return` keyword. And if we don't use the `return` keyword, it doesn't return anything (or if you prefer, it returns `undefined`.)

[^iterable]: Well, actually, the object a generator returns is not just an iterator, it's a self-iterable iterator, but we're getting ahead of ourselves.

So a generator, when invoked, always returns an iterator. So what is an iterator? In JavaScript, an **iterator** is an object that has a `.next()` method, and that we can count on to return something very specific when we invoke the `.next()` method. When we invoke the `.next()` method, an iteraror returns a plain-old-javascript-object ("POJO") that has a `.done` property. `.done` must be either `true` or `false`. If `.done` is `false`, the object must also have a `.value` property.

An iterator is exactly the same thing as the "ordering" our sims use. A very simple iterator looks like this:

```javascript
const iNothing = {
  done: true,
  
  next() {
    const { done } = this;
    
    return { done };
  }
};
```

It's an object with a `.next()` method, the `.next()` method returns a POJO, and the POJO has a `.done` property that is always going to be bound to `true`.

Iterators in JavaScript can be used in a number of ways. The simplest is a loop:

```javascript
while (true) {
  const { value, done } = iNothing.next();
  if (done) break;
  console.log(value);
}
  //=> Outputs nothing.
```

`iNothing` doesn't iterate over anything. Another very simple iterator is the extreme opposite of `iNothing`:

```javascript
const iDays = {
  done: false,
  value: 'day',
  
  next() {
    const { done, value } = this;
    
    return { done, value };
  }
};
```

Iteating over `iDays` is going to take a while. Better brew a really big pot of tea:

```javascript
while (true) {
  const { value, done } = iDays.next();
  if (done) break;
  console.log(value);
}
  //=>
    day
    day
    day
    
    ...
```

Iterators can also return a finite number of values, which is good because that's what we'll need most of the time. Here's one possible example:

```javascript
const iToday = {
  done: false,
  value: 'day',
  next() {
    const { done, value } = this;
    
    if (done) {
      return { done };
    else {
      this.done = true;
      return { done, value } 
    }
  }
}

while (true) {
  const { value, done } = iToday.next();
  if (done) break;
  console.log(value);
}
  //=> 'day'
```

*Conceptually*, `iToday` is simple. The first time we call `.next()`, we get a `value` of `day` and a `done` of `false`. The next and every subsequent call, we get a `done` of `true` and no `value`.

Iterators can be built up from this to handle more complex forms of iteration, and we will look at those presently. But let's get back to generators. The purpose of generators is to make it easier--much easier--to write iterators. Let's return to the generator for `Nothing`:

```javascript
function * Nothing () {}
```

The generator `Nothing`, when invoked, returns an object that is very much like `iNothing` (we will go into the differences later). So when we write:

```javascript
function * Nothing () {}
```

It is as if we wrote:

```javascript
function Nothing () {
  return {
    done: true,
    
    next() {
      const { done } = this;
      
      return { done };
    }
  };
};
```

Of course, `Nothing` is not `iNothing`, `Nothing` is a function that *generates* an iterator that is just like `iNothing`:


```javascript
const iNothing = Nothing();

while (true) {
  const { value, done } = iNothing.next();
  if (done) break;
  console.log(value);
}
  //=> Outputs nothing.
```

Generators that don't generate anything have their uses, but generators that generate things have many more uses, so onwards. Here's a generator that produces an iterator that iterates over one element:

```javascript
function * Today () {
  yield 'day';
}

const iToday = Today();

while (true) {
  const { value, done } = iToday.next();
  if (done) break;
  console.log(value);
}
  //=>
    day
```

Ah! When we write:

```javascript
function * Today () {
  yield 'day';
}
```

It is as if we wrote something equivalent to:

```javascript
function Today {
  return {
    done: false,
    value: '*',
    next() {
      const { done, value } = this;
      
      if (done) {
        return { done };
      else {
        this.done = true;
        return { done, value } 
      }
    }
  };
}
```

We get a function that, when invoked, returns an iterator object that "yields" one value and then is done.

Here's a generator that successively yields three values:

```javascript
function * OneTwoThree () {
  yield '*';
  yield '**';
  yield '***';
}

for (const n of OneTwoThree()) {
  console.log(n);
}
  //=>
    *
    **
    ***
```

This generator returns an iterable that yields three values successively. Anyone who has spent a decade writing software without ever hearing about [coroutines][coroutine] will be amazed. The abstraction being presented to us is that of a function that executes, yields a value, and then suspends its execution until we resume its execution by calling `.next()` on the iterator.

[coroutine]: https://en.m.wikipedia.org/wiki/Coroutine

If it behaves as if it's pausing its execution, does that mean that it is retaining other aspects of its own state, like local variables? Here's one way to test such a hypothesis: what does this code output?

```javascript
function * OneTwoThree () {
  let n = '*';
  
  yield n;
  n += '*';
  yield n;
  n += '*';
  yield n;
}

for (const n of OneTwoThree()) {
  console.log(n);
}
```

Yes, generators return iterables that don't just remember where they left off, they remember their state, including the values of their variables.

We will look at generators in more depth as we go along, but first, we will consider something crucial to working with generators. If a generator is a kind of function that returns an iterable, can we use it in a function-oriented programming style? Can we pass generators to functions and return generators from functions?

The answer is *yes*, as we'll see when we solve the problem of determining whether there is enough fruit for every child to have one to themselves.

### is there enough fruit to feed the children?

Here are two sample generators representing an ordering of a basket of fruit and an ordering of children:

```javascript
function * fruit () {
  yield 'peach';
  yield 'apple';
  yield 'apple';
  yield 'raspberry';
  yield 'raspberry';
  yield 'pear';
  yield 'orange';
}

function * children () {
  yield 'alice';
  yield 'bob';
  yield 'carol';
  yield 'dana';
  yield 'elizabeth';
}
```

We can determine whether there is enough fruit using a loop:

```javascript
const iFruit = fruit();
const iChildren = children();

while (true) {
  const { done: fDone } = iFruit.next();
  const { done: cDone } = iChildren.next();
  
  if (cDone && fDone) {
    console.log("Good news: There is the same quantity of fruit as children.");
    break;
  } else if (cDone) {
    console.log("Good news: The quantity of fruit is larger than the quantity of children");
    break;
  } else if (fDone) {
    console,log("Bad news: The quantity of fruit is smaller than the quantity of children");
    break;
  }
}
  //=> "Good news: The quantity of fruit is larger than the quantity of children"
  
```

Let's extract a function, `ge` ("greater-than or equal-to"), that we can use whenever we like:

```javascript
function ge (iOne, iTwo) {
  while (true) {
    const { done: oneDone } = iOne.next();
    const { done: twoDone } = iTwo.next();
    
    if (oneDone) {
      return twoDone;
    } else if (twoDone) {
      return true;
    }
  } 
}

const iFruit = fruit();
const iChildren = children();

ge(iFruit, iChildren)
  //=> true
```

Great. Now let's get back to our sims.

### another problem sims can solve

It doesn't always work out that sims have enough fruit for all their children. If they don't have enough fruit, they send their children out to pick some more from their orchard. Each child can pick the fruit from one tree. So naturally, they want to know if there are enough children to harvest fruit from all the trees, because if not, they'll have to ask some of the children to pick fruit from more than one tree.

Working out whether there are enough children for all the trees is simple:

```javascript
function * trees () {
  yield "apple";
  yield "pear";
  yield "cherry";
}

const iTrees = trees();

if (ge(iChildren, iTrees)) {
  // send the children to pick fruit
}
```

Let's not worry about what happens when there are more trees than children for the moment. What about sending the children to pick fruit?

Well, our sims need to pair each child up with a tree so that they don't all try to pick from the same tree. We already know how to loop over two iterators, so that's what we'll do:

```javascript
const iTrees = trees();
const iChildren = children();

if (ge(iChildren, iTrees)) {
  while (true) {
    const { done, value: tree } = iTrees.next();
    
    if (done) break;
    
    const { value: child } = iChildren.next();
    console.log(`Child ${child} should pick fruit from the ${tree} tree.`);
  }
}
  //=> no output!
```

But this produces no output! What went wrong?

### iterators are irrevocably consumed

The problem is that _iterators are irrevocably consumed_. We can iterate forward through an iteration, but it retains its state. We cannot back up and consume the values of an iterator again. So in our code above, when we called `ge(iTrees, iChildren)`, we iterated through `iTrees` until it was `done`.

Then, we tried to iterate through `iTrees` again, but it was `done` and it remained `done`. Although in theory we could create an object with a `.next()` method that could return `{ done: true }` at some point, and then subsequently return `{ done: false, value: `must eat brainz` }`, in practice iterators must never do this. Once done, they are **done**.

Had we continued to iterate through `iChild`, a similar problem would occur: `iChild` has already iterated over `alice`, `bob`, and `carol` in tandem with the three trees, and then over `dana` when `iTrees` indicated it was done. Were we to continue iterating over `iChildren`, `elizabeth` is the only value remaining to yield.

### working with generators

The bug is fixed by operating at the level of generators rather than iterators. We could litter our code with `()` invoking generators some more, but instead let's rewrite `ge` to take generators as arguments, instead of iterators:

```javascript
function ge (gOne, gTwo) {
  const iOne = gOne();
  const iTwo = gTwo();
  
  while (true) {
    const { done: oneDone } = iOne.next();
    const { done: twoDone } = iTwo.next();
    
    if (oneDone) {
      return twoDone;
    } else if (twoDone) {
      return true;
    }
  } 
}
```

Now we can use it:

```javascript
if (ge(children, trees)) {
  const iTrees = trees();
  const iChildren = children();
  
  while (true) {
    const { done, value: tree } = iTrees.next();
    
    if (done) break;
    
    const { value: child } = iChildren.next();
    console.log(`Child ${child} should pick fruit from the ${tree} tree.`);
  }
}
  //=>
    "Child alice should pick fruit from the apple tree."
    "Child bob should pick fruit from the pear tree."
    "Child carol should pick fruit from the cherry tree."
```

### zip

Our sims would have plenty of uses for iterating over two orderings at the same time, or as we are implementing them, two generators. For example, one of the adults may ask another to sort out which children should pick fruit from which trees, as abobe. Or another time they may want to build tree houses and name them after the children.

It would be tedious to reiterate (heh) the steps for iterating over two orderings at once, so the sims might come up with an abstract algorithm for doing so, or as we might call it, a function.

A common abstraction in programming for working with two collections or iterators at once is the function `zip`. In its most basic form, `zip` takes two ordered collections of things, iterates over them simultaneously, and returns a collection of pairs of elements.

Here's an example from the [lodash] library:

```javascript
import { zip } from 'lodash';

zip(
  ['alice', 'bob', 'carol', 'dana', elizabeth'],
  ['apple', 'pear', 'cherry']
)
  //=>
    [['alice', 'apple'], ['bob', 'pear'], ['carol', 'dana']]
```

As we can see, the collection `zip` returns is only as long as the shortest of its inputs. Our sims don't have any notion of an array, so we will write a simple form of `zip` that takes generators as its inputs, and returns a generator as its output. Each value it yields will likewise be a generator that returns an iterator over two elements:

```javascript
function zip (gOne, gTwo) {
  return function * zipped () {
    const iOne = gOne();
    const iTwo = gTwo();
    
    while (true) {
      const { done: dOne, value: vOne } = iOne.next();
      const { done: dTwo, value: dTwo } = iTwo.next();
      
      if (dOne || dTwo) break;
      
      yield function * pair () {
        yield vOne;
        yield vTwo;
      };
    }
  };
}

---

# For Later

Iterables have a number of uses. One of them is that we can use a `for...of` loop to iterate over an iterables values.

So when we write:

```javascript
for (const v of Nothing()) {
  console.log(v);
}
  //=> outputs nothing
```

We are invoking the `Nothing` generator and getting an iterable. We then iterate over its values. Since it doesn't have any values, the ` for...of` loop doesn't execute at all.

Notice that we aren't iterating over the generator, it's just a function. We're iterating over what it returns, which is an iterable. Generators that return iterators over nothing are fine, but what about values?

Generators `yield` values. Here's the next-simplest generator:

```javascript
function * JustOne () {
  yield '*';
}

for (const v of JustOne()) {
  console.log(v);
}
  //=>
    *
```

When we invoke `JustOne`, we get an iterator that yields the value `*` and then it stops. When we use a `for...of` loop to iterate over its values, we  execute the loop once, for the solitary value that `JustOne` yields.

But let's get back to iterables and be a little more precise about their semantics.

"Iterator" and "Iterable" are both standard JavaScript terminology. But here's a non-standard term that will be helpful: We will call iterables like `Array.prototype[Symbol.iterator]` that always return a new iterator, *reiterables*.

A "reiterable" is an iterable that can be iterated over and will always start afresh and return iterables over the same values.

It seems odd to explicitly name this, isn't this how all iterables behave? No. An iterables must return an iterator, but as we will see, iterables can return the exact same iterator when called again, and thus not reset the state between calls. Iterables can also return different iterators, which yield different values. We will meet iterables that are not reiterables in the next section.

```javascript

typeof Nothing
  //=> "function"
  
typeof Nothing()
  //=> "object"
  
typeof Nothing()[Symbol.iterator]
  //=> "function"
  
typeof Nothing()[Symbol.iterator]()
  //=> "object"
  
typeof Nothing()[Symbol.iterator]().next
  //=> "function"
```


In a little while, we will verify for ourselves that this pattern works for both finite and infinite iterables. But for now, l


Remember the elegant pattern for using destructuring to get the first element of an iterable? Let's verify that it works with an infinite iterator:

```javascript
const [zero] = Numbers;
zero
  //=> 0
```

Presto! This is very interesting, and we will certainly look at destructuring iterators in more depth another time. 


### generators are functions

Although they have a special syntax with a `*`, and `yield` values rather than returning them, generators are just functions that happen to return iterables. Functions in JavaScript can take arguments. Functions in JavaScript can take functions as arguments. Functions in JavaScript can return functions when invoked.

Can we write a generator that takes an argument? Absolutely. Recall our iterable that produced an infinite succession of `*` values? Here is a generator version:

```javascript
function * Ones () {
  while (true) {
    yield `*`;
  }
}

const [first, second, third] = Ones();
first
  //=> *
second
  //=> *
third
  //=> *
```

And here is a version that yields an infinite number of any arbitrary value:

```javascript
function * InfinityOf (something) {
  while (true) {
    yield something;
  }
}

const [first, second, third] = InfinityOf('.');
first
  //=> .
second
  //=> .
third
  //=> .
```



### iterators and iterables


The implementation is a little awkward, and we'll soon see a much simpler way to write this. But for the moment, let's note the essential nature of an iterator: Most iterators are *stateful*. They return something, then maybe another thing, and another thing, and then they stop returning things.

Or do they? Here's an iterator that never stops returning something:

```javascript
const TodayS = {
  done: false,
  value: '*',
  next() {
    const { done, value } = this;
    
    return { value, done };
  }
};
```

We won't try it here, but if you want to try outputing it's values in a `while` loop, you will find it ouputs `*` to the console indefinitely. We will call this an *infinite* iterable. 

Our sims have no concept of numbers, but we do. Here's another infinite iterator:

```javascript
const ITER_NUMBERS = {
  done: false,
  value: 0,
  next() {
    const { done, value } = this;
    
    this.value++;
    return { value, done };
  }
};
```

So what do we have so far?

- **Iterators** are objects with a `.next()` method that returns an object with a `done` property and, if `done` is `false`, a `value` property.
- Iterators are responsible for managing their own state.
- Some iterators never return `false` for `done`. If we naively loop over their values, we will go on forever.

Iterators in ordinary JavaScript usage are often associated with a collection of values, like an array, list, or set. The distinction between a collectrion and an iterator over its values is very important: *An iterator over the values in a collection is not a collection*.

In JavaScript, collections have a mechanism for providing a default iterator over their contents: If a collection implements a `[Symbol.iterator]` method, it is expected to return an iterator over the collection's contents.

Our sims don't have arrays, but we do, and we can see that arrays implement a [Symbol.iterator] method:

```javascript
typeof Array.prototype[Symbol.iterator]
  //=> "function"
  
const oneTwoThree = [1, 2, 3];
const iterOneTwoThree = oneTwoThree[Symbol.iterator]();

while (true) {
  const { value, done } = iterOneTwoThree.next();
  if (done) break;
  console.log(value);
}
  //=>
    1
    2
    3
```

We can't see how, exactly, the iterator returned by `oneTwoThree[Symbol.iterator]()` is implemented, but we can see that it returns, successively, the values in the array.

Any object that has a `[Symbol.iterator]` method is expected to return an iterator. Such objects are called *iterables*, in the sense that they can be iterated over.

Iterables are quite handy in JavaScript, because there is syntactic support for using them in various ways. One we'll use often is a `for...of` loop:

```javascript
for (const n of oneTwoThree) {
  console.log(n);
}
  //=>
    1
    2
    3
```

There are others that are quite useful in everyday programming, including spreading an iterable into an array, destructing an iterable into variables, and spreading an iterable into arguments for a function call.

For example, here is an elegant way to get the first three elements of an iterable:

```JavaScript
const [first, second, third] = oneTwoThree;
first
  //=> 1
second
  //=> 1
third
  //=> 1
```

But for now, let us note:

- An **iterable** is *any* object that implements a `[Symbol.iterator]` method, and that method should return an iterator.
- Iterables can be used in `for..of` loops, amongst other places.
- It's handy to make collections into iterables.

Before we move along, we should make an important observation. Most iterables that are associated with collections return a *new* iterator every time we call `[Symbol.iterator]()`. We can test this with arrays:

```javascript
for (const n of oneTwoThree) {
  console.log(n);
}
  //=>
    1
    2
    3

for (const n of oneTwoThree) {
  console.log(n);
}
  //=>
    1
    2
    3
```

We loop over `oneTwoThree` twice, and each time JavaScript invokes its `[Symbol.iterator]()` method, and each time we get a new iterator. Since it is a new iterator, each loop starts at the beginning and goes to the end, because each iterator object manages its own state independently.

### writing our own iterables

We can write our own iterables, and they work exactly the same way with things like `for...of` loops:

```javascript
const Nothing = {
  [Symbol.iterator]() {
    return {
      next() {
        return { done: true };
      }
    };
  }
};

for (cont v of Nothing) {
  console.log(v);
}
  //=> outputs nothing
```

Awkward with all those braces, but it shows that we can make iterables at will. Now, let us recall our infinite iterators. We can make an iterable that returns an infinite iterator:

```javascript
const Numbers = {
  [Symbol.iterator]() {
    return {
      value: 0,
       
      next() {
        const value = this.value++;
        
        return { value, done: false };
      }
    };
  }
};

for (cont v of Numbers) {
  console.log(v);
}
  //=>
    1
    2
    3
    ...
    infinity
```

We mentioned *reiterables* earlier. Do generators produce iterables or reiterables? Let's test the hypothesis and find out. When we write:

```javascript
for (const n of OneTwoThree()) {
  console.log(n);
}
  //=>
    1
    2
    3

for (const n of OneTwoThree()) {
  console.log(n);
}
  //=>
    1
    2
    3
```

We are invoking the `OneTwoThree` generator twice, and it gives us two different iterables, each of which has its own fresh state. That is good to know. But is the iterable it returns a reiterable? Or not? Let's find out:

```javascript
const one2three = OneTwoThree();

for (const n of one2three) {
  console.log(n);
}
  //=>
    1
    2
    3

for (const n of one2three) {
  console.log(n);
}
  //=> Nothing!
```

Ah! The iterable returned by a generator is not reiterable, it has one state, and if we "exhaust" it, there will be no more values to yield. This is not the same as something like an array that is also an iterable: Arrays are reiterables, and we must be careful to insure that if a reiterable is what we want, we implement it accordingly.
