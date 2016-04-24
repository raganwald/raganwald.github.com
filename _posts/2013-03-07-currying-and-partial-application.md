---
title: What's the difference between Currying and Partial Application?
layout: default
tags: javascript
---
 
I was participating in [wroc_love.rb] last week-end, and [Steve Klabnik](http://steveklabnik.com) put up a slide mentioning [partial application] and [currying]. "The difference between them is not important right now," he said, pressing on. And it wasn't.

[partial application]: https://en.wikipedia.org/wiki/Partial_application
[currying]: https://en.wikipedia.org/wiki/Currying
[wroc_love.rb]: http://wrocloverb.com

But here we are, it's a brand new day, and we've already read five different explanations of `this` and closures this week, but only three or four about currying, so let's get into it.

### arity

Before we jump in, let's get some terminology straight. Functions have *arity*, meaning the number of arguments they accept. A "unary" function accepts one argument, a "polyadic" function takes more than one argument. There are specialized terms we can use: A "binary" function accepts two, a "ternary" function accepts three, and you can rustle about with greek or latin words and invent names for functions that accept more than three arguments.

Some functions accept a variable number of arguments, we call them *variadic*, although variadic functions and functions taking no arguments aren't our primary focus in this essay.

### partial application

Partial application is straightforward. We could start with addition or some such completely trivial example, but if you don't mind we'll have a look at something from the [allong.es] JavaScript library that is of actual use in daily programming.

[allong.es]: http://allong.es

As a preamble, let's make ourselves a `map` function that maps another function over a list:

```javascript
var __map = [].map;

function map (list, unaryFn) {
  return __map.call(list, unaryFn);
};

function square (n) {
  return n * n;
};

map([1, 2, 3], square);
  //=> [1, 4, 9]
```

`map` is obviously a binary function, `square` is a unary function. When we called `map` with arguments `[1, 2, 3]` and `square`, we *applied* the arguments to the function and got our result.

Since `map` takes two arguments, and we supplied two arguments, we *fully applied* the arguments to the function. So what's partial application? Supplying fewer arguments. Like supplying one argument to `map`.

Now what happens if we supply one argument to `map`? We can't get a result without the other argument, so what we get back is a unary function that takes the other argument and produces the result we want.

If we're going to apply one argument to `map`, let's make it the `unaryFn`. We'll start with the end result and work backwards. First thing we do, is set up a wrapper around map:

```javascript
function mapWrapper (list, unaryFn) {
  return map(list, unaryFn);
};
```

Next we'll break our binary wrapper function into two nested unary functions:

```javascript
function mapWrapper (unaryFn) {
  return function (list) {
    return map(list, unaryFn);
  };
};
```

Now we can supply our arguments one at a time:

```javascript
mapWrapper(square)([1, 2, 3]);
  //=> [1, 4, 9]
```

Instead of a binary `map` function that returns our result, we now have a unary function that returns a unary function that returns our result. So where's the partial application? Let's get our hands on the second unary function:

```javascript
var squareAll = mapWrapper(square);
  //=> [function]

squareAll([1, 2, 3]);
  //=> [1, 4, 9]
squareAll([5, 7, 5]);
  //=> [25, 49, 25]
```

We've just partially applied the value `square` to the function `map`. We got back a unary function, `squareAll`, that we could use as we liked. Partially applying `map` in this fashion is handy, so much so that the [allong.es] library includes a function called `mapWith` that does this exact thing.

[allong.es]: http://allong.es

If we had to physically write ourselves a wrapper function every time we want to do some partial application, we'd never bother. Being programmers though, we can automate this. There are two ways to do it.

### currying

First up, we can write a function that returns a wrapper function. Sticking with binary function, we start with this:

```javascript
function wrapper (unaryFn) {
  return function (list) {
    return map(list, unaryFn);
  };
};
```

Rename `map` and the two arguments:

```javascript
function wrapper (secondArg) {
  return function (firstArg) {
    return binaryFn(firstArg, secondArg);
  };
};
```

And now we can wrap the whole thing in a function that takes `binaryFn` as an argument:

```javascript
function rightmostCurry (binaryFn) {
  return function (secondArg) {
    return function (firstArg) {
      return binaryFn(firstArg, secondArg);
    };
  };
};
```

So now we've 'abstracted' our little pattern. We can use it like this:

```javascript
var rightmostCurriedMap = rightmostCurry(map);

var squareAll = rightmostCurriedMap(square);

squareAll([1, 4, 9]);
  //=> [1, 4, 9]
squareAll([5, 7, 5]);
  //=> [25, 49, 25]
```

Converting a polyadic function into a nested series of unary functions is called **currying**, after Haskell Curry, who popularized the technique. He actually rediscovered the combinatory logic work of [Moses Schönfinkel][moses], so we could easily call it "schönfinkeling."[^birds]

[moses]: https://en.wikipedia.org/wiki/Moses_Schönfinkel
[^birds]: When Raymond Smullyan wrote his seminal introduction to combinatory logic, he called it "To Mock a Mockingbird" and used forests of birds as his central metaphor to pay tribute to Schönfinkel. Schön means "beautiful" and Fink means "finch" in German, although Finkl may be Yiddish for "sparkle." So his name may mean "beautiful finch," or it may mean "beautiful sparkle."

Our `rightmostCurry` function curries any binary function into a chain of unary functions starting with the second argument. This is a "rightmost" curry because it starts at the right.

The opposite order would be a "leftmost" curry. Most logicians work with leftmost currying, so when we write a leftmost curry, most people just call it "curry:"

```javascript
function curry (binaryFn) {
  return function (firstArg) {
    return function (secondArg) {
      return binaryFn(firstArg, secondArg);
    };
  };
};

var curriedMap = curry(map),
    double = function (n) { return n + n; };

var oneToThreeEach = curriedMap([1, 2, 3]);

oneToThreeEach(square);
  //=> [1, 4, 9]
oneToThreeEach(double);
  //=> [2, 4, 6]
```

When would you use a regular curry and when would you use a rightmost curry? It really depends on your usage. In our binary function example, we're emulating a kind of subject-object grammar. The first argument we want to use is going to be the subject, the second is going to be the object.

So when we use a rightmost curry on `map`, we are setting up a "sentence" that makes the mapping function the subject.

So we read `squareAll([1, 2, 3])` as "square all the elements of the array [1, 2, 3]." By using a rightmost curry, we made "squaring" the subject and the list the object. Whereas when we used a regular curry, the list became the subject and the mapper function became the object.

Another way to look at it that is a little more like "patterns and programming" is to think about what you want to name and/or reuse. Having both kinds of currying lets you name and/or reuse either the mapping function or the list.

### partial application

So many words about currying! What about "partial application?" Well, if you have currying you don't need partial application. And conversely, if you have partial application you don't need currying. So when you write this kind of essay, it's easy to spend a lot of words describing one of these two things and then explain everything else on top of what you already have.

Let's look at our rightmost curry again:

```javascript
function rightmostCurry (binaryFn) {
  return function (secondArg) {
    return function (firstArg) {
      return binaryFn(firstArg, secondArg);
    };
  };
};
```

You might find yourself writing code like this over and over again:

```javascript
var squareAll = rightmostCurry(map)(square),
    doubleAll = rightmostCurry(map)(double);
```

This business of making a rightmost curry and then immediately applying an argument to it is extremely common, and when something's common we humans like to name it. And it has a name, it's called a *rightmost unary partial application of the map function*.

What a mouthful. Let's take it step by step:

1. rightmost: From the right.
2. unary: One argument.
3. partial application: Not applying all of the arguments.
4. map: To the map function.

So what we're really doing is applying one argument to the map function. It's a binary function, so that means what we're left with is a unary function. Again, functional languages and libraries almost always include a first-class function to do this for us.

We *could* build one out of a rightmost curry:

```javascript
function rightmostUnaryPartialApplication (binaryFn, secondArg) {
  return rightmostCurry(binaryFn)(secondArg);
};
```

However it is usually implemented in more direct fashion:[^caveat]

```javascript
function rightmostUnaryPartialApplication (binaryFn, secondArg) {
  return function (firstArg) {
    return binaryFn(firstArg, secondArg);
  };
};
```

[^caveat]: All of our implementations are grossly simplified. Full implementations can handle polyadic functions with more than two arguments and are context-agnostic.

`rightmostUnaryPartialApplication` is a bit much, so we'll alias it `applyLast`:

```javascript
var applyLast = rightmostUnaryPartialApplication;
```

And here're our `squareAll` and `doubleAll` functions built with `applyLast`:

```javascript
var squareAll = applyLast(map, square),
    doubleAll = applyLast(map, double);
```

You can also make an `applyFirst` function (we'll skip calling it "leftmostUnaryPartialApplication"):

```javascript
function applyFirst (binaryFn, firstArg) {
  return function (secondArg) {
    return binaryFn(firstArg, secondArg);
  };
};
```

As with leftmost and rightmost currying, you want to have both in your toolbox so that you can choose what you are naming and/or reusing.

### so what's the difference between currying and partial application?

"Currying is the decomposition of a polyadic function into a chain of nested unary functions. Thus decomposed, you can partially apply one or more arguments,[^also] although the curry operation itself does not apply any arguments to the function."

"Partial application is the conversion of a polyadic function into a function taking fewer arguments arguments by providing one or more arguments in advance."

### is that all there is?

Yes. And no. Here are some further directions to explore on your own:

1. We saw how to use currying to implement partial application. Is it possible to use partial application to implement currying? Why? Why not?[^tao]
2. All of our examples of partial application have concerned converting binary functions into unary functions by providing one argument. Write more general versions of `applyFirst` and `applyLast` that provide one argument to any polyadic function. For example, if you have a function that takes four arguments, `applyFirst` should return a function taking three arguments.
3. When you have `applyFirst` and `applyLast` working with all polyadic functions, try implementing `applyLeft` and `applyRight`: `applyLeft` takes a polyadic function and one *or more* arguments and leftmost partially applies them. So if you provide it with a ternary function and two arguments, it should return a unary function. `applyRight` does the same with rightmost application.
4. Rewrite curry and rightmostCurry to accept any polyadic function. So just as a binary function curries into two nested unary functions, a ternary function should curry into three nested unary functions and so on.
5. Review the source code for [allong.es], the functional programming library extracted from [JavaScript Allongé][ja], especially [partial_application.js][pa].

Thanks for reading, if you discover a bug in the code, please either [fork the repo][repo] and submit a pull request, or [submit an issue on Github][issue].

p.s. Another essay you might find interesting: [Practical Applications of Partial Application](http://raganwald.com/2013/01/05/practical-applications-of-partial-application.html).

([discuss](http://www.reddit.com/r/javascript/comments/19urej/whats_the_difference_between_currying_and_partial/))

---

notes:

[^tao]: A Taoist ordered a vegetarian hot dog from a street vendor: "Make me one with everything," he requested politely.
[^also]: There are a lot of other reasons to curry functions, but this is an article about the relationship between currying and partial application, not an introduction to combinatory logic and functional programming :-)
[allong.es]: http://allong.es
[ja]: http://leanpub.com/javascriptallongesix
[pa]: https://github.com/raganwald/allong.es/blob/master/lib/partial_application.js
[repo]: https://github.com/raganwald/raganwald.github.com
[issue]: https://github.com/raganwald/raganwald.github.com/issues
