---
title: Hilbert's Grand JavaScript School (2015 Edition)
layout: default
tags: javascript
---

(*This material originally appeared, using ECMAScript-5 semantics, in [2013](http://raganwald.com/2013/02/21/hilberts-school.html).*)

---

Dr. Hilbert "Bertie" David grows tired of blogging about JavaScript, and decides to cash in on the seemingly inexhaustible supply of impressionable young minds seeking to "Learn JavaScript in Five Days."

He opens his *Grand JavaScript School* on the shores of the Andaman Sea in Thailand, and with some clever engineering, he is able to install a countably infinite[^count] number of seats in his lecture hall.

[^count]: Meaning, he is able to put the seats in a one-to-one correspondence with the natural numbers. He does this by numbering the seats from zero. See [Countable Sets](https://en.wikipedia.org/wiki/Countable_set).

<a href="http://www.flickr.com/photos/quinet/6105449498/" title="Island panorama 3 by quinet, on Flickr"><img src="http://farm7.staticflickr.com/6079/6105449498_2bb67e2fd2_z.jpg" width="640" height="289" alt="Island panorama 3"></a>

### day one

Well, an infinite number of students show up on the first day. "Line up please!" he calls out to them with a bullhorn of his own invention. "Line up! Good. Each of you has a number. The first person in line is zero, the next person is one, and so on. The machine will call out a number. When you hear your number, step forward, pay your fee in bitcoins, take your receipt, then you may enter the lecture hall and find the seat with your number on it. Thank you, the lecture will begin when everyone has been seated."

Bertie quickly whips out a JavaScript IDE he has devised, and he writes himself a generator. Instead of iterating over a data structure in memory, it generates seat numbers on demand:

{% highlight javascript %}
function* Numbers (from = 0) {
  let number = from;
  while (true)
    yield number++;
};

const seats = Numbers();

for (let seat of seats) {
  console.log(seat);
}

//=>
  0
  1
  2
  3
  ...
{% endhighlight %}

He simply calls out the numbers as they are printed, and the students file into the auditorium in an orderly fashion, filling it completely. Well, the first day is very long indeed. But Bertie has an infinite supply of bitcoins and things go well.

Avoiding the well-travelled road of explaining "this," "closures," or "monads," he decides to explain  the difference between functional iterators and iterables.[^lazy] People are scratching their heads, but on the second day, all of the students from the first day return. So it must have been a decent lecture.

[^lazy]: [Lazy Iterables in JavaScript](http://raganwald.com/2015/02/17/lazy-iterables-in-javascript.html)

### day two

In fact, a few people liked the lecture so much that they recommended it to their friends, and one million additional students are lined up for seats in his class on the morning of the second day. He has an infinite number of seats in the auditorium, but they are all full. What can he do?

Out comes the IDE and the bullhorn. This time, he digs into his copy of [JavaScript Allonge, The "Six" Edition](https://leanpub.com/b/buyjavascriptallongthesixeditiongetjavascriptallongfree) and writes the following:

{% highlight javascript %}
const zipIterables = (...iterables) =>
  ({
    [Symbol.iterator]: function * () {
      const iterators = iterables.map(i => i[Symbol.iterator]());
      
      while (true) {
        const pairs = iterators.map(j => j.next()),
              dones = pairs.map(p => p.done),
              values = pairs.map(p => p.value);
        
        if (dones.indexOf(true) >= 0) break;
        yield values;
      }
    }
  });

const oldSeats = Numbers(0),
      newSeats = Numbers(1000000),
      correspondence = zipIterables(oldSeats, newSeats);

for (let pair of correspondence) {
  const [from, to] = pair;
  console.log(`${from} -> ${to}`);
}

//=>
  0 -> 1000000
  1 -> 1000001
  2 -> 1000002
  3 -> 1000003
  ...
{% endhighlight %}

He's constructed an iterable with instructions for moving seats. Bertie tells the first person to move from seat zero to seat one million, the second from one to one million and one, and so forth. This means that seats 0 through 999,999 become vacant, so the 1,000,000 new students have a place to sit. Day Two goes well, and he is very pleased with his venture.

### day three

His fame spreads, and Jeff Atwood starts a discussion about Bertie's JavaScript School on his new [Discourse](http://www.discourse.org) discussion platform. There's so much interest, Jeff charters a bus with an infinite number of seats and brings his infinite number of fans to Bertie's school for Day Three. The bus's seats have numbers from zero just like the auditorium.

All of the students from Day Two have returned, so the auditorium is already full. Bertie is perplexed, but after scratching his head for a few moments, whips out his bullhorn and write the following JavaScript:

{% highlight javascript %}
const mapIterableWith = (fn, iterable) =>
  ({
    [Symbol.iterator]: function* () {
      for (let element of iterable) {
        yield fn(element);
      }
    }
  });

const oldSeats = Numbers(0),
      newSeats = mapIterableWith(n => n * 2, Numbers(0)),
      correspondence = zipIterables(oldSeats, newSeats);

for (let pair of correspondence) {
  const [from, to] = pair;
  console.log(`${from} -> ${to}`);
}

//=>
  0 -> 0
  1 -> 2
  2 -> 4
  3 -> 6
  4 -> 8
  5 -> 10
  ...
{% endhighlight %}

Now all the existing students are in the even numbered seats, so he's ready to seat Jeff's fans:

{% highlight javascript %}

const oldSeats = Numbers(0),
      newSeats = mapIterableWith(n => n * 2 + 1, Numbers(0)),
      correspondence = zipIterables(oldSeats, newSeats);

for (let pair of correspondence) {
  const [from, to] = pair;
  console.log(`${from} -> ${to}`);
}

//=>
  0 -> 1
  1 -> 3
  2 -> 5
  3 -> 7
  4 -> 9
  5 -> 11
  ...
{% endhighlight %}

Bertie calls out the seat numbers on Jeff's bus and the number of an odd-numbered (and therefore vacant) seat in the auditorium for them to occupy. Bertie has managed to add an infinite number of students to an infinitely large but full auditorium.

He's so pleased, Bertie lets Jeff be the guest lecturer. The audience has loved Bertie's abstract approach to programming so far, but they're hungry for practical knowledge and Jeff enthrals them  with a walkthrough of how the Discourse User Experience is implemented.

As a bonus, Jeff shares his insights into programming productivity.[^jeff] By the end of the day, everyone is typing over 100wpm and has placed an order for multiple wall-sized monitors on eBay.

[^jeff]: "As far as I'm concerned, you can never be too rich, too thin, or have too much screen space."--[Three Monitors For Every User](http://www.codinghorror.com/blog/2010/04/three-monitors-for-every-user.html)

<a href="http://www.flickr.com/photos/raver_mikey/4118859026/" title="Nice selection of REAL buses! by Gene Hunt, on Flickr"><img src="http://farm3.staticflickr.com/2516/4118859026_ee4f8ce254_z.jpg" width="640" height="480" alt="Nice selection of REAL buses!"></a>

### day four

Day Three went well, so all the students return and the auditorium remains full. Everyone is very pleased and looking forward to Day Four.

But the excitement has a downside: Reddit hears about what's going on and an infinite number of subreddits, each of which has an infinite number of redditors, all decide to show up on day four to disrupt his lecture with trolling about how lame JavaScript is as a programming language. Each sends an infinitely large bus, with every seat full. Like Jeff's bus, each bus numbers its seat from zero and as luck would have it, each bus has has a number and the buses are numbered from zero.

Bertie has to seat an infinite number of infinite groups of people, in an infinite auditorium that is already full! Now what? Out comes the bullhorn and yesterday's program, and he quickly moves all of his existing students into the even-numbered seats, leaving an infinite number of odd seats available for newcomers.

He starts with the obvious: If you have three buses with three seats each, you can put the students into a one-to-one correspondence with the odd numbers by nesting iterators, like this:

{% highlight javascript %}
function * seatsOnBuses(buses, seats) {
  for (let bus of buses) {
    for (let seat of seats) {
      yield [bus, seat];
    }
  }
};
{% endhighlight %}

He writes a quick test:

{% highlight javascript %}
const seatAndBus = seatsOnBuses([0, 1, 2], [0, 1, 2]),
      newSeats = mapIterableWith(n => n * 2 + 1, Numbers(0)),
      correspondence = zipIterables(seatAndBus, newSeats);

for (let pair of correspondence) {
  const [[bus, seat], to] = pair;
  console.log(`bus ${bus}, seat ${seat} -> seat ${to}`);
}

//=>
  bus 0, seat 0 -> seat 1
  bus 0, seat 1 -> seat 3
  bus 0, seat 2 -> seat 5
  bus 1, seat 0 -> seat 7
  bus 1, seat 1 -> seat 9
  bus 1, seat 2 -> seat 11
  bus 2, seat 0 -> seat 13
  bus 2, seat 1 -> seat 15
  bus 2, seat 2 -> seat 17
{% endhighlight %}

Looks good, he grabs the bullhorn and writes:

{% highlight javascript %}
const seatAndBus = seatsOnBuses(Numbers(), Numbers()),
      newSeats = mapIterableWith(n => n * 2 + 1, Numbers(0)),
      correspondence = zipIterables(seatAndBus, newSeats);

for (let pair of correspondence) {
  const [[bus, seat], to] = pair;
  console.log(`bus ${bus}, seat ${seat} -> seat ${to}`);
}

//=>
  bus 0, seat 0 -> seat 1
  bus 0, seat 1 -> seat 3
  bus 0, seat 2 -> seat 5
  bus 0, seat 3 -> seat 7
  bus 0, seat 4 -> seat 9
  bus 0, seat 5 -> seat 11
  bus 0, seat 6 -> seat 13
  bus 0, seat 7 -> seat 15
  bus 0, seat 8 -> seat 17
  bus 0, seat 9 -> seat 19
  ...
{% endhighlight %}

After he has been seating people from bus `0` for a good long while, people from the other buses get restless. When will they be seated? What seat will they have? Bertie realizes that although there are infinite numbers of people involved, up to this point, he could point to any one student and tell them exactly where they would end up being seated.

But with this scheme, he can't really put anyone from any of the other buses into a particular seat. He calls for order, and tries again:

{% highlight javascript %}
function * Diagonals () {
  for (let n of Numbers()) {
    for (let i = 0; i <= n; ++i) {
      yield [i, n-i];
    }
  }
};

const seatAndBus = Diagonals(),
      newSeats = mapIterableWith(n => n * 2 + 1, Numbers(0)),
      correspondence = zipIterables(seatAndBus, newSeats);

for (let pair of correspondence) {
  const [[bus, seat], to] = pair;
  console.log(`bus ${bus}, seat ${seat} -> seat ${to}`);
}

//=>
  bus 0, seat 0 -> seat 1
  bus 0, seat 1 -> seat 3
  bus 1, seat 0 -> seat 5
  bus 0, seat 2 -> seat 7
  bus 1, seat 1 -> seat 9
  bus 2, seat 0 -> seat 11
  bus 0, seat 3 -> seat 13
  bus 1, seat 2 -> seat 15
  bus 2, seat 1 -> seat 17
  bus 3, seat 0 -> seat 19
  ...
{% endhighlight %}

If you think of the buses and seats forming a square, the diagonals iterator makes a path from one corner and works its way out, enumerating over every possible combination of bus and seat. Thus, given countably infinite time, it will list every one of the countably infinite number of Redditors on each of the countably infinite number of buses.

Well, this seats an infinite number of Redditors on an infinite number of buses in an infinite auditorium that was already full. He does a code walkthrough with the students, then segues on to talk about other interesting aspects of Georg Cantor[^cantor]'s work and a digression into Hotel Management.[^grand] By the time he finishes with a discussion of the Hypergame[^kongregate] proof of the infinite number of infinities, everyone has forgotten that they came to scoff.

He finishes with a summary of what he learned seating students:

1. You can put a countably infinite number of seats into a one-to-one correspondence with the numbers, therefore they have the same *cardinality*.
2. You can add a finite number to an countably infinite number and put your new number into a one-to-one correspondence with the numbers, therefore infinity plus a finite number has the same cardinality as the numbers.
3. You can add infinity to infinity and put your new number into a one-to-one correspondence with the numbers, therefore infinity plus infinity has the same cardinality as the numbers. By induction, you can add a finite number of infinities together and have the same cardinality as the numbers.
4. You can add an infinite number of infinities to infinity and put your new number into a one-to-one correspondence with the numbers, therefore an infinity times infinity has the same cardinality as the numbers.

[^cantor]: [https://en.wikipedia.org/wiki/Georg_Cantor](https://en.wikipedia.org/wiki/Georg_Cantor)
[allong.es]: http://allong.es "Free recipes from JavaScript Allongé"
[^kongregate]: [http://www.kongregate.com/forums/9/topics/93615](http://www.kongregate.com/forums/9/topics/93615)
[^grand]: [https://en.wikipedia.org/wiki/Hilbert's_paradox_of_the_Grand_Hotel](https://en.wikipedia.org/wiki/Hilbert's_paradox_of_the_Grand_Hotel)

### day five

On Day Five, everyone is back and he announces that there will be a test: *"Outside our doors,"* he announces, *"Are an infinite number of aircraft carriers, each of which has an infinitely large flight deck. Parked on each flight deck are an infinite number of buses, each of which contains--you guessed it--an infinite number of sailors and air crew eager to join our school for the next semester."*

*"Write a JavaScript program to seat them all in our lecture hall. If your program works, you may come up to the front and receive your signed diploma. If you can prove that no program works, you will also receive your diploma. Good luck!"*

Before long, the students have figured out that yes, the school can accommodate a countably infinite number of aircraft carriers, each carrying a countably infinite number of buses, each carrying a countably infinite number of students.

The simplest way to infer that this is true is to observe that each aircraft carrier contains a countably infinite number of buses, each carrying a countably infinite number of students. We already know how to put that into a one-to-one correspondence with a countably infinite set of numbers using the diagonalization above. So step one is to take each aircraft carrier's students and put them into a one-to-one correspondence with the numbers counting from zero.

Now that we have done this, we have an infinite number of aircraft carriers, each containing a countably infinite number of students. We can put this into a one-to-one correspondence with the seat numbers using diagonalization, so now we have all the students in seats.

But as an exercise, it is valuable to try writing a singe diagonalization that operates directly on three iterators (aircraft carriers, buses, and seats). You may use the [Babel REPL](http://babeljs.io/repl/) online, or make an [ES-6 Fiddle](http://www.es6fiddle.net) you can share.

### day six

Bertie goes home, exhausted, and dreams that having graduated everyone at the end of Day Five, things are busier than ever. In his dreams he imagines an infinite number of galactic superclusters, each containing an infinite number of galaxies, each containing an infinite number of stars, each containing an infinite number of worlds, each containing an infinite number of oceans, each containing an infinite number of aircraft carriers, each containing an infinite number of buses, each containing an infinite number of students.

He awakens and reasons that what he is dealing with are *powers of infinity*. A simple infinity is infinity to the first power. Two infinities (buses and students) is infinity to the second power. Three infinities (aircraft carriers, buses, and students) is infinity to the third power. And so forth up to galactic superclusters, infinity to the eighth power.

He quickly observes that no matter what finite power he chooses, he can put the total number of students into a one-to-one correspondence with the countable number of seats in his auditorium. But then he wonders... What if he has *infinity raised to the power of infinity?*

He imagines some kind of crazy infinite series of ever-greater cosmological containers, universes contained within the atoms of other universes, time and space folding over unto itself. In such a crazy circumstance, can all the students be accommodated?

[read his answer here](https://gist.github.com/raganwald/0880ccce85eafd60d38f)

---

| [reddit](http://www.reddit.com/r/javascript/comments/33vcbq/hilberts_grand_javascript_school_2015_edition/) | [hacker news](https://news.ycombinator.com/item?id=9439479) | [edit this page](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2015-04-24-hilberts-school.md) |

---
