---
layout: default
title: Destructuring and Recursion in ES-6
tags: [allonge]
---

[![Drink HAND-POURED coffee.](/assets/images/hand-poured.jpg)](https://www.flickr.com/photos/wunderle/8336797898/)

### array literals

Arrays are JavaScript's "native" representation of lists. Lists are important because they represent ordered collections of things, and ordered collections are a fundamental abstraction for making sense of reality.

JavaScript has a literal syntax for creating an array: The `[` and `]` characters. We can create an empty array:

{% highlight javascript %}
[]
  //=> []
{% endhighlight %}
      
We can create an array with one or more *elements* by placing them between the brackets and separating the items with commas. Whitespace is optional:

{% highlight javascript %}
[1]
  //=> [1]
  
[2, 3, 4]
  //=> [2,3,4]
{% endhighlight %}

Any expression will work:

{% highlight javascript %}
[ 2,
  3,
  2 + 2
]
  //=> [2,3,4]
{% endhighlight %}
      
Including an expression denoting another array:

{% highlight javascript %}
[[[[[]]]]]
{% endhighlight %}
    
This is an array with one element that is an array array with one element this an array with one element that is an array with one element that is an empty array. Although that seems like something nobody would ever construct, many students have worked with almost the exact same thing when they explored various means of constructing arithmetic from Set Theory.

Any expression will do, including names:

{% highlight javascript %}
const wrap = (something) => [something];

wrap("lunch")
  //=> ["lunch"]
{% endhighlight %}

Array literals are expressions, and arrays are *reference types*. We can see that each time an array literal is evaluated, we get a new, distinct array, even if it contains the exact same elements:

{% highlight javascript %}
[] === []
  //=> false
  
[2 + 2] === [2 + 2]
  //=> false
  
const array_of_one = () => [1];

array_of_one() === array_of_one()
  //=> false
{% endhighlight %}
      
### destructuring arrays

*Destructuring* is a feature going back to Common Lisp, if not before. We saw how to construct an array literal using `[`, expressions, `,` and `]`. Here's an example of an array literal that uses a name:

{% highlight javascript %}
const wrap = (something) => [something];
{% endhighlight %}
    
Let's expand it to use a block and an extra name:

{% highlight javascript %}
const wrap = (something) => {
  const wrapped = [something];
  
  return wrapped;
}

wrap("package")
  //=> ["package"]
{% endhighlight %}

The line `const wrapped = [something];` is interesting. On the left hand is a name to be bound, and on the right hand is an array literal, a template for constructing an array, very much like a quasi-literal string.

In JavaScript, we can actually *reverse* the statement and place the template on the left and a value on the right:

{% highlight javascript %}
const unwrap = (wrapped) => {
  const [something] = wrapped;
  
  return something;
}

unwrap(["present"])
  //=> "present"
{% endhighlight %}

The statement `const [something] = wrapped;` *destructures* the array represented by `wrapped`, binding the value of its single element to the name `something`. We can do the same thing with more than one element:

{% highlight javascript %}
const surname = (name) => {
  const [first, last] = name;
  
  return last;
}

surname(["Reginald", "Braithwaite"])
  //=> "Braithwaite"
{% endhighlight %}
      
We could do the same thing with `(name) => name[1]`, but destructuring is code that resembles the data it consumes, a valuable coding style.

Destructuring can nest:

{% highlight javascript %}
const description = (nameAndOccupation) => {
  const [[first, last], occupation] = nameAndOccupation;
  
  return `${first} is a ${occupation}`;
}

description([["Reginald", "Braithwaite"], "programmer"])
  //=> "Reginald is a programmer"
{% endhighlight %}
      
### gathering

Sometimes we need to extract arrays from arrays. Here is the most common pattern: Extracting the head and gathering everything but the head from an array:

{% highlight javascript %}
const [car, ...cdr] = [1, 2, 3, 4, 5];

car
  //=> 1
cdr
  //=> [2, 3, 4, 5]
{% endhighlight %}
      
[`car` and `cdr`](https://en.wikipedia.org/wiki/CAR_and_CDR) are archaic terms that go back to an implementation of Lisp running on the IBM 704 computer. Some other languages call them `first` and `butFirst`, or `head` and `tail`. We will use a common convention and call variables we gather `rest`, but refer to the `...` operation as a "gather," follow Kyle Simpson's example.[^getify]

[^getify]: Kyle Simpson is the author of [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS/blob/master/README.md#you-dont-know-js-book-series), available [here](http://search.oreilly.com/?q=you+don%27t+know+js+kyle+simpson)

Alas, the `...` notation does not provide a universal patten-matching capability. For example, we cannot write

{% highlight javascript %}
const [...butLast, last] = [1, 2, 3, 4, 5];
  //=> ERROR
  
const [first, ..., last] = [1, 2, 3, 4, 5];
  //=> ERROR
{% endhighlight %}

Also it's important to note that the `...` can be at the beginning, for example in case of constructors like:

{% highlight javascript %}
const date = new Date(...[2015, 1, 1]);
{% endhighlight %}
      
Now, when we introduced destructuring, we saw that it is kind-of-sort-of the reverse of array literals. So if

{% highlight javascript %}
const wrapped = [something];
{% endhighlight %}
    
Then:

{% highlight javascript %}
const [unwrapped] = something;
{% endhighlight %}
    
What is the reverse of gathering? We know that:

{% highlight javascript %}
const [car, ...cdr] = [1, 2, 3, 4, 5];
{% endhighlight %}
    
What is the reverse? It would be:

{% highlight javascript %}
const cons = [car, ...cdr];
{% endhighlight %}
    
Let's try it:

{% highlight javascript %}
const oneTwoThree = ["one", "two", "three"];

["zero", ...oneTwoThree]
  //=> ["zero","one","two","three"]
{% endhighlight %}
      
It works! We can use `...` to place the elements of an array inside another array. We say that using `...` to destructure is gathering, and using it in a literal to insert elements is called "spreading."
       
### destructuring parameters

Consider the way we pass arguments to parameters:

{% highlight javascript %}
foo()
bar("smaug")
baz(1, 2, 3)
{% endhighlight %}
    
It is very much like an array literal. And consider how we bind values to parameter names:

{% highlight javascript %}
const foo = () => ...
const bar = (name) => ...
const baz = (a, b, c) => ...
{% endhighlight %}
   
It *looks* like destructuring. It acts like destructuring. There is only one difference: We have not tried gathering. Let's do that:

{% highlight javascript %}
const numbers = (...nums) => nums;

numbers(1, 2, 3, 4, 5)
  //=> [1,2,3,4,5]
  
const headAndTail = (head, ...tail) => [head, tail];

headAndTail(1, 2, 3, 4, 5)
  //=> [1,[2,3,4,5]]
{% endhighlight %}
      
Gathering works with parameters! This is very useful indeed, and we'll see more of it in a moment.[^rest]

[^rest]: Gathering in parameters has a long history, and the usual terms are to call gathering "pattern matching" and to call a name that is bound to gathered values a "rest parameter." The term "rest" is perfectly compatible with gather: "Rest" is the noun, and "gather" is the verb. We *gather* the *rest* of the parameters.

[![Stacked Cups](/assets/images/stacked-cups.jpg)](https://www.flickr.com/photos/sankarshan/5165312159)

## Self-Similarity

> Recursion is the root of computation since it trades description for time.—Alan Perlis, [Epigrams in Programming](http://www.cs.yale.edu/homes/perlis-alan/quotes.html)

We saw that the basic idea that putting an array together with a literal array expression was the reverse or opposite of taking it apart with a destructuring assignment.

Let's be more specific. Some data structures, like lists, can obviously be seen as a collection of items. Some are empty, some have three items, some forty-two, some contain numbers, some contain strings, some a mixture of elements, there are all kinds of lists.

But we can also define a list by describing a rule for building lists. One of the simplest, and longest-standing in computer science, is to say that a list is:

0. Empty, or;
1. Consists of an element concatenated with a list .

Let's convert our rules to array literals. The first rule is simple: `[]` is a list. How about the second rule? We can express that using a spread. Given an element `e` and a list `list`, `[e, ...list]` is a list. We can test this manually by building up a list:

{% highlight javascript %}
[]
//=> []

["baz", ...[]]
//=> ["baz"]

["bar", ...["baz"]]
//=> ["bar","baz"]

["foo", ...["bar", "baz"]]
//=> ["foo","bar","baz"]
{% endhighlight %}
  
Thanks to the parallel between array literals + spreads with destructuring + rests, we can also use the same rules to decompose lists:

{% highlight javascript %}
const [first, ...rest] = [];
first
  //=> undefined
rest
  //=> []:

const [first, ...rest] = ["foo"];
first
  //=> "foo"
rest
  //=> []

const [first, ...rest] = ["foo", "bar"];
first
  //=> "foo"
rest
  //=> ["bar"]

const [first, ...rest] = ["foo", "bar", "baz"];
first
  //=> "foo"
rest
  //=> ["bar","baz"]
{% endhighlight %}

For the purpose of this exploration, we will presume the following:[^wellactually]

{% highlight javascript %}
const isEmpty = ([first, ...rest]) => first === undefined;

isEmpty([])
  //=> true

isEmpty([0])
  //=> false

isEmpty([[]])
  //=> false
{% endhighlight %}
    
[^wellactually]: Well, actually, this does not work for arrays that contain `undefined` as a value, but we are not going to see that in our examples. A more robust implementation would be `(array) => array.length === 0`, but we are doing backflips to keep this within a very small and contrived playground.
    
Armed with our definition of an empty list and with what we've already learned, we can build a great many functions that operate on arrays. We know that we can get the length of an array using its `.length`. But as an exercise, how would we write a `length` function using just what we have already?

First, we pick what we call a *terminal case*. What is the length of an empty array? `0`. So let's start our function with the observation that if an array is empty, the length is `0`:

{% highlight javascript %}
const length = ([first, ...rest]) =>
  first === undefined
    ? 0
    : // ???
{% endhighlight %}
      
We need something for when the array isn't empty. If an array is not empty, and we break it into two pieces, `first` and `rest`, the length of our array is going to be `length(first) + length(rest)`. Well, the length of `first` is `1`, there's just one element at the front. But we don't know the length of `rest`. If only there was a function we could call... Like `length`!

{% highlight javascript %}
const length = ([first, ...rest]) =>
  first === undefined
    ? 0
    : 1 + length(rest);
{% endhighlight %}
    
Let's try it!

{% highlight javascript %}
length([])
  //=> 0
  
length(["foo"])
  //=> 1
  
length(["foo", "bar", "baz"])
  //=> 3
{% endhighlight %}
      
Our `length` function is *recursive*, it calls itself. This makes sense because our definition of a list is recursive, and if a list is self-similar, it is natural to create an algorithm that is also self-similar.

### linear recursion

"Recursion" sometimes seems like an elaborate party trick. There's even a joke about this:

> When promising students are trying to choose between pure mathematics and applied engineering, they are given a two-part aptitude test. In the first part, they are led to a laboratory bench and told to follow the instructions printed on the card. They find a bunsen burner, a sparker, a tap, an empty beaker, a stand, and a card with the instructions "boil water."

> Of course, all the students know what to do: They fill the beaker with water, place the stand on the burner and the beaker on the stand, then they turn the burner on and use the sparker to ignite the flame. After a bit the water boils, and they turn off the burner and are lead to a second bench.

> Once again, there is a card that reads, "boil water." But this time, the beaker is on the stand over the burner, as left behind by the previous student. The engineers light the burner immediately. Whereas the mathematicians take the beaker off the stand and empty it, thus reducing the situation to a problem they have already solved.

There is more to recursive solutions that simply functions that invoke themselves. Recursive algorithms follow the "divide and conquer" strategy for solving a problem:

0. Divide the problem into smaller problems
0. If a smaller problem is solvable, solve the small problem
0. If a smaller problem is not solvable, divide and conquer that problem
0. When all small problems have been solved, compose the solutions into one big solution

The big elements of divide and conquer are a method for decomposing a problem into smaller problems, a test for the smallest possible problem, and a means of putting the pieces back together. Our solutions are a little simpler in that we don't really break a problem down into multiple pieces, we break a piece off the problem that may or may not be solvable, and solve that before sticking it onto a solution for the rest of the problem.

A very good recursive algorithm is one that parallels the recursive nature of the data being manipulated. This simpler form of "divide and conquer" is called *linear recursion*. It's very useful and simple to understand, and it parallels the linearly self-similar definition we made for lists. Let's take another example. Sometimes we want to *flatten* an array, that is, an array of arrays needs to be turned into one array of elements that aren't arrays.[^unfold]

[^unfold]: `flatten` is a very simple [unfold](https://en.wikipedia.org/wiki/Anamorphism), a function that takes a seed value and turns it into an array. Unfolds can be thought of a "path" through a data structure, and flattening a tree is equivalent to a depth-first traverse.

We already know how to divide arrays into smaller pieces. How do we decide whether a smaller problem is solvable? We need a test for the terminal case. Happily, there is something along these lines provided for us:

{% highlight javascript %}
Array.isArray("foo")
  //=> false
  
Array.isArray(["foo"])
  //=> true
{% endhighlight %}
      
The usual "terminal case" will be that flattening an empty array will produce an empty array. The next terminal case is that if an element isn't an array, we don't flatten it, and can put it together with the rest of our solution directly. Whereas if an element is an array, we'll flatten it and put it together with the rest of our solution.

So our first cut at a `flatten` function will look like this:

{% highlight javascript %}
const flatten = ([first, ...rest]) => {
  if (first === undefined) {
    return [];
  }
  else if (!Array.isArray(first)) {
    return [first, ...flatten(rest)];
  }
  else {
    return [...flatten(first), ...flatten(rest)];
  }
}

flatten(["foo", [3, 4, []]])
  //=> ["foo",3,4]
{% endhighlight %}
      
Once again, the solution directly displays the important elements: Dividing a problem into subproblems, detecting terminal cases, solving the terminal cases, and composing a solution from the solved portions.

### mapping

Another common problem is applying a function to every element of an array. JavaScript has a built-in function for this, but let's write our own using linear recursion.

If we want to square each number in a list, we could write:

{% highlight javascript %}
const squareAll = ([first, ...rest]) =>
  first === undefined
  ? []
  : [first * first, ...squareAll(rest)];
                                            
squareAll([1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
{% endhighlight %}

And if we wanted to "truthify" each element in a list, we could write:

{% highlight javascript %}
const truthyAll = ([first, ...rest]) =>
  first === undefined
    ? []
    : [!!first, ...truthyAll(rest)];

truthyAll([null, true, 25, false, "foo"])
  //=> [false,true,true,false,true]
{% endhighlight %}
                                                
This specific case of linear recursion is called "mapping," and it is not necessary to constantly write out the same pattern again and again. Functions can take functions as arguments, so let's "extract" the thing to do to each element and separate it from the business of taking an array apart, doing the thing, and putting the array back together.

Given the signature:

{% highlight javascript %}
const mapWith = (fn, array) => // ...
{% endhighlight %}
    
We can write it out using a ternary operator. Even in this small function, we can identify the terminal condition, the piece being broken off, and recomposing the solution.

{% highlight javascript %}
const mapWith = (fn, [first, ...rest]) => 
  first === undefined
    ? []
    : [fn(first), ...mapWith(fn, rest)];
                                              
mapWith((x) => x * x, [1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
  
mapWith((x) => !!x, [null, true, 25, false, "foo"])
  //=> [false,true,true,false,true]
{% endhighlight %}

### folding

With the exception of the `length` example at the beginning, our examples so far all involve rebuilding a solution using spreads.  But they needn't. A function to compute the sum of the squares of a list of numbers might look like this:

{% highlight javascript %}
const sumSquares = ([first, ...rest]) =>
  first === undefined
    ? 0
    : first * first + sumSquares(rest);
                                         
sumSquares([1, 2, 3, 4, 5])
  //=> 55
{% endhighlight %}

There are two differences between `sumSquares` and our maps above:

0. Given the terminal case of an empty list, we return a `0` instead of an empty list, and;
0. We catenate the square of each element to the result of applying `sumSquares` to the rest of the elements.

Let's rewrite `mapWith` so that we can use it to sum squares.

{% highlight javascript %}
const foldWith = (fn, terminalValue, [first, ...rest]) =>
  first === undefined
    ? terminalValue
    : fn(first, foldWith(fn, terminalValue, rest));
{% endhighlight %}
                                                           
And now we supply a function that does slightly more than our mapping functions:

{% highlight javascript %}
foldWith((number, rest) =>
  number * number + rest, 0, [1, 2, 3, 4, 5])
  //=> 55
{% endhighlight %}

Our `foldWith` function is a generalization of our `mapWith` function. We can represent a map as a fold, we just need to supply the array rebuilding code:

{% highlight javascript %}
const squareAll = (array) =>
  foldWith((first, rest) => [first * first, ...rest], [], array);

squareAll([1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
{% endhighlight %}

And if we like, we can write `mapWith` using `foldWith`:

{% highlight javascript %}
const mapWith = (fn, array) =>
  foldWith((first, rest) => [fn(first), ...rest], [], array);
const squareAll = (array) => mapWith((x) => x * x, array);

squareAll([1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
{% endhighlight %}
          
And to return to our first example, our version of `length` can be written as a fold:

{% highlight javascript %}
const length = (array) =>
  foldWith((first, rest) => 1 + rest, 0, array);

length([1, 2, 3, 4, 5])
  //=> 5
{% endhighlight %}
    
### what does it all mean?

Some data structures, like lists, have a can be defined as self-similar. When working with a self-similar data structure, a recursive algorithm parallels the data's self-similarity.

Linear recursion is a basic building block of algorithms. Its basic form parallels the way linear data structures like lists are constructed: This helps make it understandable. Its specialized cases of mapping and folding are especially useful and can be used to build other functions. And finally, while folding is a special case of linear recursion, mapping is a special case of folding.

And last but certainly not least, destructuring, spreading, and gathering make this very natural to express in JavaScript ES-6.

[reddit](http://www.reddit.com/r/javascript/comments/2uirec/destructuring_and_recursion_in_es6/) | [hacker news](https://news.ycombinator.com/item?id=8984508) | [edit this page](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2015-02-02-destructuring.md)

[ja6]: https://leanpub.com/javascriptallongesix

---

*postscript*:

This post was extracted from the in-progress book, [JavaScript Allongé, The "Six" Edition][ja6]. The extracts so far: [Lazy Iterables in JavaScript](http://raganwald.com/2015/02/17/lazy-iteratables-in-javascript.html), [The Quantum Electrodynamics of Functional JavaScript](http://raganwald.com/2015/02/13/functional-quantum-electrodynamics.html), [Tail Calls, Default Arguments, and Excessive Recycling in ES-6](http://raganwald.com/2015/02/07/tail-calls-defult-arguments-recycling.html) and [Destructuring and Recursion in ES-6](http://raganwald.com/2015/02/02/destructuring.html). Your [feedback](https://github.com/raganwald/raganwald.github.com/issues/new) improves the book for everyone, thank you!

[ja6]: https://leanpub.com/b/buy-allonge-get-thesixedition-free

---
    