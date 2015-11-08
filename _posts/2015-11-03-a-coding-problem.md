---
layout: default
---

Job interviews sometimes contain simple programming puzzles. Often called "fizz-buzz problems," the usual purpose is to quickly weed out hopefuls who can't actually program anything.

[![Frustrated](/assets/images/frustrated.jpg)](https://www.flickr.com/photos/marvin_lee/3254923387)

Here's an example, something that might be used in a phone screen or an in-person interview with programmers early in their career: *Write a function that given two sorted lists, produces a sorted list containing the union of each list's elements*. For example, given: `[1, 7, 11, 17]` and `[3, 5, 13]`, produce `[1, 3, 5, 7, 11, 13, 17]`. And given `[1, 3, 5, 7, 11, 13, 17]` and `[1, 3, 5, 7, 11, 13, 17]`, produce `[1, 1, 3, 3, 5, 5, 7, 7, 11, 11, 13, 13, 17, 17]`.

In a language with convenient array semantics, and with a reckless disregard for memory and performance, the answer is very easy to compose:

{% highlight javascript %}
function merge (originalA, originalB) {
  const merged = [], tempA = originalA.slice(0), tempB = originalB.slice(0);

  while (tempA.length > 0 && tempB.length > 0) {
    merged.push(
      tempA[0] < tempB[0] ? tempA.shift() : tempB.shift()
    );
  }
  return merged.concat(tempA).concat(tempB);
}
{% endhighlight %}

The usual hazards to navigate are so-called edge cases like either array being empty or having a single element.

In a follow-up discussion, an interview might explore why this implementation takes a beating from the ugly memory stick, and how to use indices to make it better.

[![Coding](/assets/images/coding.jpg)](https://www.flickr.com/photos/mpa/4369776892)

### taking it up a level

Sometimes, the interviewer will then move on to a follow-up that adds some complexity. Whereas the previous problem was given just to eliminate the (hopefully few) candidates who really should have been filtered out before getting an interview of any type, now we are looking for an opportunity to discuss approaches to problem solving.

Follow-up problems often incorporate a few extra elements to keep track off. They shouldn't be "gotchas," just things that require some careful consideration and the ability to juggle several problems at the same time.

For example: *Write a function that given an arbitrary number of ordered streams of elements, produces an ordered stream containing the union of each stream's elements*.

In JavaScript, we can represent streams as [Iterators]. The answer is once again easy to compose in ECMAScript 2015. We'll write a generator that takes iterables as arguments. Thus you can collect its results into an array or iterate over them as you see fit:

[Iterators]: https://leanpub.com/javascriptallongesix/read#collections

{% highlight javascript %}
function * merge (...iterables) {

  const iterators = iterables.map(i => i[Symbol.iterator]());
  const values = iterators
    .map(
      function(iterator) {
        const n = iterator.next();
        if (!n.done) return { iterator, value: n.value };
      }
    )
    .filter(x => !!x);

  while ( values.length > 0 ) {
    let lowestIndex = 0;

    for (let iValue = 1; iValue < values.length; ++iValue) {
      if (values[iValue].value < values[lowestIndex].value) {
        lowestIndex = iValue;
      }
    }

    yield values[lowestIndex].value;

    const n = values[lowestIndex].iterator.next();
    if (n.done) {
      values.splice(lowestIndex, 1);
    }
    else {
      values[lowestIndex].value = n.value;
    }
  }
}
{% endhighlight %}

We can try it in something like [Babel](http://babeljs.io/repl):

{% highlight javascript %}
function* fivePrimes () { yield 2; yield 3; yield 5; yield 7; yield 11; }
const fiveEvens = [2, 4, 6, 8, 10]

console.log(...merge(fiveEvens, fivePrimes()))
  //=> 2 2 3 4 5 6 7 8 10 11
{% endhighlight %}

The hazards to navigate here are dealing with the fact that you can't "peek" at the head element of an iterator in JavaScript, writing a generator so that you can lazily deal with elements, and handling an arbitrary number of streams.

[![Servers](/assets/images/servers.jpg)](https://www.flickr.com/photos/sfllaw/78981814/)

### but what if i hate cs-style puzzles?

Given the first problem, the more experienced candidate might roll their eyes and prepare to be asked to write a [Merge Sort](https://en.wikipedia.org/wiki/Merge_sort) as the obvious, algorithm-centric follow-up question.

But I suggest it's a mistake to dismiss such things out of hand. Consider the follow-up question given here, merging two streams. It's clearly related to the first problem. But is it "impractical CS-wankery?"

Let's wrap it in a story. *You work for a company that manages alerting and event remediation. You have a large, distributed cluster of servers, each of which emits a huge number of events tagged with a customer id, type, timestamp, and so forth. You are looking for certain patterns of events. Write a function that creates an alert when it sees a certain pattern of evens occurring within a certain time frame.*

Naturally, the first thing to do is to get all the alerts for a customer into a single stream, ordered by timestamp. You can't get them all and sort them, because they won't fit into memory. So what do you do?

That's right, you create a stream of events that merges the streams from each server. You can then write filters and pattern matchers that operates on the merged stream.

Now perhaps this won't happen in JavaScript. And perhaps there will be some mechanism other than an ECMAScript Iterator for representing a real time screen. But somewhere, there will be some code that merges streams, and demonstrating an aptitude for understanding such algorithms is certainly demonstrating on-the-job skills.

### conclusion

Coding in job interviews doesn't seem to be going away any time soon. Until it does, it behooves engineers to be competent at writing code in real time, and it behooves employers to choose problems that have a reasonable relationship to the problems they solve at work.

And if you get a problem that seems "way out there..." Maybe solve it brilliantly, then ask a question of your own: "Say, if this works out and I come to work for you, when would I be working with algorithms like this?"

You might be pleasantly surprised by the answer.

---

Note: At [PagerDuty], we do indeed work with streams of data on highly-available and distributed clusters of systems. We have great problems to solve with the engines that keep everything going, and with developing user-facing tooling. If that piques your intellectual curiosity, we're hiring applications and real-time engineers in San Francisco and Toronto. Come [work with us](https://www.pagerduty.com/company/work-with-us/)!

[PagerDuty]: https://www.pagerduty.com
