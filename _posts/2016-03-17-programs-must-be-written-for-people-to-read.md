---
title: "“Programs must be written for people to read, and only incidentally for machines to execute”"
layout: default
tags: [allonge, noindex]
---

![Hal Abelson](/assets/images/HalAbelson.jpg)

*[Photo by Joi Ito](https://commons.wikimedia.org/w/index.php?curid=4244437)—originally posted to Flickr as Hal Abelson, CC BY 2.0*

---

In mathematics, the Fibonacci numbers or [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_number) were originally the numbers in the following integer sequence: `0, 1, 1, 2, 3, 5, 8, 13, 21, …`.[^hist]

[^hist]: The numbers were originally given as `1, 1, 2, 3, 5, 8, 13, 21, …`, but it is more convenient for modern purposes to begin with `0` and `1`.

The rule for determining the sequence is quite simple to explain:

0. The first number is `0`.
0. The second number is `1`.
0. Every subsequent number is the sum of the two previous numbers.

Thus, the third number is `1` (`0 + 1`), the fourth number is `2` (`1 + 1`), and that makes the fifth number `3` (`1 + 2`), the sixth number `5` (`2 + 3`) and so on _ad infinitum_.

There are many ways to write a program that will output the Fibnacci numbers. each method optimizes for some particular purpose. We'll start by optimizing for being as close as possible to the written description of the numbers:

{% highlight javascript %}
function fibonacci () {
  console.log(0);
  console.log(1);

  let [previous, current] = [0, 1];

  while (true) {
    [previous, current] = [current, current + previous];
    console.log(current);
  }
}
{% endhighlight %}

This is reasonable, but we can do better.

### separating concerns

The sample above prints the numbers out to infinity. Which is the letter of the definition, but not useful for most purposes. If we only wanted, say, the first 10 or first 100, or any arbitrary number of fibonacci numbers? We'd have to weave logic about when to stop into our code:

{% highlight javascript %}
function fibonacci (numberToPrint) {
  console.log(0);

  if (numberToPrint === 1) return;

  console.log(1);

  if (numberToPrint === 2) return;

  let [previous, current] = [0, 1];

  for(let numberPrinted = 2; numberPrinted <= numberToPrint; ++numberPrinted) {
    [previous, current] = [current, current + previous];
    console.log(current);
  }
}
{% endhighlight %}

The logic for the number of results we want is buried inside the middle of our code. Ideally, the definition of the sequence can be written completely independently of the mechanism for figuring out how many numbers we need.

And there's another problem. How do we know what we want to do with the numbers? maybe we want to print them out, but then again, maybe we want to do something else, like stuff them in an array, or count how many are event and how many are odd.

Our code at the moment entangles these concerns, and our first improvement is to deparate the concerns by rewriting our algorthm as a [generator](http://raganwald.com/2015/11/03/a-coding-problem.html "Solving a Coding Problem with Iterators and Generators"):

{% highlight javascript %}
function * fibonacci () {
  yield 0;
  yield 1;

  let [previous, current] = [0, 1];

  while (true) {
    [previous, current] = [current, current + previous];
    yield current;
  }
}
{% endhighlight %}

Now we can take advantage of standard operations on generators and iterators, like `take`. We can find an [npm module](https://github.com/jb55/take-iterator), or just borrow some code from [JavaScript Allongé][ja]:

[ja]: https://leanpub.com/javascriptallongesix

{% highlight javascript %}
function * take (numberToTake, iterable) {
  const iterator = iterable[Symbol.iterator]();

  for (let i = 0; i < numberToTake; ++i) {
    const { done, value } = iterator.next();
    if (!done) yield value;
  }
}
{% endhighlight %}

And then write:

{% highlight javascript %}
for (let n of take(10, fibonacci())) {
  console.log(n);
}
{% endhighlight %}

Or we can splat the values into an array:

{% highlight javascript %}
[...take(10, fibonacci())]
{% endhighlight %}

Of course, doing this requires understanding what a generator is, and how the `take` operation converts a generator with a possibly infinite extent into a generator that produces a fixed number of values.

It's almost certainly not worth learning all this _just_ for Fibonacci numbers, but if we do learn these things and then "internalize" them, it becomes a marvellous win, because we can write something like:

{% highlight javascript %}
function * fibonacci () {
  yield 0;
  yield 1;

  let [previous, current] = [0, 1];

  while (true) {
    [previous, current] = [current, current + previous];
    yield current;
  }
}
{% endhighlight %}

And we are simply and very directly reproducing the definition as it was given to us, without cluttering it up with a lot of other concerns that dilute the basic thing we want to communicate.

### incidentally

Just because
