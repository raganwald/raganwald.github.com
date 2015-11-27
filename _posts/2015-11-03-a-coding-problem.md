---
title: "Solving a Coding Problem with Iterators and Generators"
layout: default
tags: [allonge]
---

### a fizz-buzz problem

Job interviews sometimes contain simple programming tasks. Often called "fizz-buzz problems," the usual purpose is to quickly weed out hopefuls who can't actually program anything.

Here's an example, something that might be used in a phone screen or an in-person interview with programmers early in their career: *Write a `merge` function, that given two sorted lists, produces a sorted list containing the union of each list's elements*. For example:

{% highlight javascript %}
merge ([1, 7, 11, 17], [3, 5, 13])
  //=> [1, 3, 5, 7, 11, 13, 17]

merge([2, 3, 5, 7, 11], [2, 4, 6, 8, 10, 12, 14])
  //=> [2, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14]
{% endhighlight %}

In a language with convenient array semantics, and with a reckless disregard for memory and performance, a solution is straightforward to compose:

{% highlight javascript %}
function merge (originalA, originalB) {
  const merged = [],
        tempA = originalA.slice(0),
        tempB = originalB.slice(0);

  while (tempA.length > 0 && tempB.length > 0) {
    merged.push(
      tempA[0] < tempB[0] ? tempA.shift() : tempB.shift()
    );
  }
  return merged.concat(tempA).concat(tempB);
}
{% endhighlight %}

The usual hazards to navigate are cases like either array being empty or having a single element. In a follow-up discussion, an interview might explore why this implementation takes a beating from the ugly memory stick, and how to use indices to make it better.

### taking it up a level

Sometimes, the interviewer will then move on to a follow-up that adds some complexity. Whereas the previous problem was given just to eliminate the (hopefully few) candidates who really should have been filtered out before getting an interview of any type, now we are looking for an opportunity to discuss approaches to problem solving.

Follow-up problems often incorporate a few extra elements to manage. They shouldn't be "gotchas," just things that require some careful consideration and the ability to juggle several problems at the same time.

For example: *Write a function that given an arbitrary number of ordered streams of elements, produces an ordered stream containing the union of each stream's elements*.

### let's write it

In ECMAScript 2015, we can represent the streams we have to merge as [Iterables]. We'll write a generator, a function that `yield`s values. Our generator will take the iterables as arguments, and `yield` the values in the correct order to represent an ordered merge.

[Iterables]: https://leanpub.com/javascriptallongesix/read#collections

The skeleton will look like this:

{% highlight javascript %}
function * merge (...iterables) {

  // setup

  while (our_iterables_are_not_done) {

    // find the iterator with the lowest value

    yield lowestIterator.next().value;
  }
}
{% endhighlight %}

Our first problem is handling more than two iterables. Our second is that to iterate over an iterable, we have to turn it into an iterator. That's easy, every iterable has a method named `Symbol.iterator` that returns a new iterator over that iterable.

{% highlight javascript %}
function * merge (...iterables) {

  const iterators = iterables.map(
    i => i[Symbol.iterator]()
  );

  while (our_iterables_are_not_done) {

    // find the iterator with the lowest value

    yield lowestIterator.next().value;
  }
}
{% endhighlight %}

Our third problem is thorny: To test whether an iterator has one or more values to return, we call `.next()`. But doing so actually fetches the value and changes the state of the iterator. If we write:

{% highlight javascript %}
while (iterators.some(i => !i.next().done))
{% endhighlight %}

We will fetch the first element of each iterator and discard it. That's a problem. What we want is a magic iterator that lets us peek at the next element (and whether the iterator is done), while allowing us to grab the element later.

So let's write an iterator adaptor class that does that:

{% highlight javascript %}
const _iterator = Symbol('iterator');
const _peeked = Symbol('peeked');

class PeekableIterator {
  constructor (iterator) {
    this[_iterator] = iterator;
    this[_peeked] = iterator.next();
  }

  peek () {
    return this[_peeked];
  }

  next () {
    const returnValue = this[_peeked];
    this[_peeked] = this[_iterator].next();
    return returnValue;
  }
}
{% endhighlight %}

Our `PeekableIterator` class wraps around an existing iterator, but in addition to a `next` method that advances to the next value (if any), it also provides a `peek` method that doesn't advance the iterator.

Now we can back up and use `PeekableIterator`s instead of plain iterators:

{% highlight javascript %}
function * merge (...iterables) {

  const iterators = iterables.map(
    i => new PeekableIterator(i[Symbol.iterator]())
  );

  while (iterators.some(i => !i.peek().done)) {

    // find the iterator with the lowest value

    yield lowestIterator.next().value;
  }
}
{% endhighlight %}

We can also use our `peek` method to find the iterator with the lowest value. We'll take our iterators, filter out any that are done, sort them according to the value we `peek`, and the first iterator has the lowest value:

{% highlight javascript %}
function * merge (...iterables) {

  const iterators = iterables.map(
    i => new PeekableIterator(i[Symbol.iterator]())
  );

  while (iterators.some(i => !i.peek().done)) {

    const lowestIterator =
      iterators
        .filter(
          i => !i.peek().done
        ).sort(
          (a, b) => a.peek().value - b.peek().value
        )[0];

    yield lowestIterator.next().value;
  }
}
{% endhighlight %}

We're done!

### the complete solution

{% highlight javascript %}
const _iterator = Symbol('iterator');
const _peeked = Symbol('peeked');

class PeekableIterator {
  constructor (iterator) {
    this[_iterator] = iterator;
    this[_peeked] = iterator.next();
  }

  peek () {
    return this[_peeked];
  }

  next () {
    const returnValue = this[_peeked];
    this[_peeked] = this[_iterator].next();
    return returnValue;
  }
}

function * merge (...iterables) {

  const iterators = iterables.map(
    i => new PeekableIterator(i[Symbol.iterator]())
  );

  while (iterators.some(i => !i.peek().done)) {

    const lowestIterator =
      iterators
        .filter(
          i => !i.peek().done
        ).sort(
          (a, b) => a.peek().value - b.peek().value
        )[0];

    yield lowestIterator.next().value;
  }
}
{% endhighlight %}

This is reasonably straightforward for programmers comfortable with iterators and generators.[^js] Since our `merge` function is a generator, we can easily iterate over its contents or spread them into an array. In fact, it's *almost* interchangeable with the solution for arrays, we just need to remember to spread the result.

[^js]: And if iterators and generators are fairly new to you, you can read [JavaScript Allongé](https://leanpub.com/javascriptallongesix) for free!

{% highlight javascript %}
const primes = [2, 3, 5, 7, 11];
const evens = function * () {
  for (let n of [1, 2, 3, 4, 5, 6, 7]) {
    yield n * 2;
  }
}

for (let value of merge(primes, evens())) {
  console.log(value);
}
  //=>
    2
    2
    3
    4
    5
    6
    7
    8
    10
    11
    12
    14

[...merge(primes, evens())]
  //=> [2, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14]
{% endhighlight %}

There is plenty to discuss about this solution. Here are a few to start things off:

- What are the performance implications of having lots and lots of iterables, maybe a few hundred or a few thousand?
- What happens if you have one iterable that produces thousands of values, along with a few hundred that only produce a few hundred each? Or more generally, what if there is an inverse power law relationship between the number of iterables and the number of values they produce?

As an exercise, we can ask ourselves what other questions we would ask a candidate who wrote this solution within the confines of a forty-minute time slot.

---

[![Servers](/assets/images/servers.jpg)](https://www.flickr.com/photos/sfllaw/78981814/)

### but what if i hate cs-style puzzles?

Given the first problem, the more experienced candidate might roll their eyes. But could it be a mistake to dismiss fizz-buzz problems out of hand? Consider what happens if the interview proceeds to merging an arbitrary number of streams as we've discussed here. It's clearly related to the first problem. But is it "Impractical Computer Science?"

Let's try wrapping it in a story:

> You work for a company that manages alerting and event remediation. You have a large, distributed cluster of servers, each of which emits a huge number of events tagged with a customer id, type, timestamp, and so forth. You are looking for certain patterns of events. Write a function that creates an alert when it sees a certain pattern of evens occurring within a certain time frame.

Naturally, the first thing to do is to get all the alerts for a customer into a single stream, ordered by timestamp. We can't get them all and sort them, because they won't fit into memory. So what do we do?

That's right, we create a stream of events that merges the streams from each server. We can then write filters and pattern matchers that operates on the merged stream.

Now perhaps this won't happen in JavaScript. And perhaps there will be some mechanism other than an ECMAScript Iterator for representing a real time stream. But somewhere, there will be some code that merges streams, and demonstrating an aptitude for understanding such algorithms is certainly demonstrating on-the-job skills.

### conclusion

Coding in job interviews doesn't seem to be going away any time soon. Until it does, it behooves engineers to be competent at writing code in real time, and it behooves employers to choose problems that have a reasonable relationship to the problems they solve at work.

And if we encounter a programming problem that seems "Way out there..." Maybe we should solve it brilliantly, then ask a question of our own: "Say, if this works out and I come to work for you, when would I be working with algorithms like this?"

We might be pleasantly surprised by the answer.

(discuss on [hacker news](https://news.ycombinator.com/item?id=10533372))

---

[![PagerDuty](/assets/images/pagerduty.jpg)](https://www.pagerduty.com/company/work-with-us/)

Note: At [PagerDuty], we do indeed work with streams of data on highly-available and distributed clusters of systems. We have great problems to solve with the engines that keep everything going, and with developing user-facing tooling. If that piques your intellectual curiosity, we're hiring engineers for our applications and real-time teams. There are positions in both San Francisco and Toronto.

[Come work with us](https://www.pagerduty.com/company/work-with-us/)!

[PagerDuty]: https://www.pagerduty.com

---
