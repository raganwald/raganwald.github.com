---
title: Hilbert's Grand JavaScript School
layout: dark
---

Dr. Hilbert "Bertie" David grows tired of blogging about JavaScript, and decides to cash in on the seemingly inexhaustible supply of impressionable young minds seeking to "Learn JavaScript in Five Days."

He opens his *Grand JavaScript School* on the shores of the Andaman Sea in Thailand, and with some clever engineering, he is able to install a countably infinite[^count] number of seats in his lecture hall.

[^count]: Meaning, he is able to put the seats in a one-to-one correspondence with the whole numbers. He does this by numbering the seats from zero.

<a href="http://www.flickr.com/photos/quinet/6105449498/" title="Island panorama 3 by quinet, on Flickr"><img src="http://farm7.staticflickr.com/6079/6105449498_2bb67e2fd2_z.jpg" width="640" height="289" alt="Island panorama 3"></a>

### day one

Well, an infinite number of students show up on the first day. "Line up please!" he calls out to them with a bullhorn of his own invention. "Line up! Good. Each of you has a number. The first person in line is zero, the next person is one, and so on. The machine will call out a number. When you hear your number, step forward, pay your fee in bitcoins, take your receipt, then you may enter the lecture hall and find the seat with your number on it. Thank you, the lecture will begin when everyone has been seated."

Bertie quickly whips out a JavaScript IDE he has devised, and he writes himself a functional iterator. Instead of iterating over a data structure in memory, it generates seat numbers on demand:

{% highlight javascript %}
function Numbers () {
  var number = 0;
  return function () {
    return number++;
  };
};

var seats = Numbers();
while (true)
  console.log(seats());

//=> 0, 1, 2, 3, ...
{% endhighlight %}

He simply calls out the numbers as they are printed, and the students file into the auditorium in an orderly fashion, filling it completely. Well, the first day is very long indeed. But Bertie has an infinite supply of bitcoins and things go well.

Avoiding the well-travelled road of explaining "this," "closures," or "monads," he decides to explain functional iterators using the Tortoise and Hare algorithm[^tortoise] as an example. People are scratching their heads, but on the second day, all of the students from the first day return. So it must have been a decent lecture.

[^tortoise]: [http://raganwald.com/2013/02/15/turtles-and-iterators.js.html](http://raganwald.com/2013/02/15/turtles-and-iterators.js.html)

### day two

In fact, a few people liked the lecture so much that they recommended it to their friends, and one million additional students are lined up for seats in his class on the morning of the second day. He has an infinite number of seats in the auditorium, but they are all full. What can he do?

Out comes the IDE and the bullhorn. This time, he uses the [allong.es] library and writes the following:

{% highlight javascript %}
map = require('allong.es').iterators.map

var oldSeats = Numbers(),
    newSeats = map(Numbers(), function (n) { return n + 1000000; });
    
function MoveToSeat (from, to) {
  return function () {
    return '' + from() + ' -> ' + to();
  }
}

var i = MoveToSeat(oldSeats, newSeats);

i();
  //=> 0 -> 1000000
i();
  //-> 1 -> 1000001
i();
  //-> 2 -> 1000002
i();
  //=> 3 -> 1000003

// ...
{% endhighlight %}

He has constructed an iterator with instructions for moving seats. he tells the first person to move from seat zero to seat one million, the second from one to one million and one, and so forth. This means that seats 0 through 999,999 become vacant, so the 1,000,000 new students have a place to sit. Day Two goes well, and he is very pleased with his venture.

### day three

His fame spreads, and Jeff Atwood starts a discussion about Bertie's JavaScript school on his new [Discourse](http://www.discourse.org) discussion platform. There's so much interest, Jeff charters a bus with an infinite number of seats and brings his infinite number of fans to Bertie's school for Day Three. The bus's seats have numbers from zero just like the auditorium.

All of the students from Day Two have returned, so the auditorium is already full. Bertie is perplexed, but after scratching his head for a few moments, whips out his bullhorn and write the following JavaScript. To save electrons, he uses shorthand notation this time:

{% highlight javascript %}
var EvenNumbers = function () {
  return map(Numbers(), function (n) { return n * 2; });
}

var i = MoveToSeat(Numbers(), EvenNumbers());

i();
  //=> 0 -> 0
i();
  //-> 1 -> 2
i();
  //-> 2 -> 4
i();
  //=> 3 -> 6

// ...
{% endhighlight %}

Now all the existing students are in the even numbered seats, so he's ready to seat Jeff's fans:

{% highlight javascript %}
var OddNumbers = function () {
  return map(Numbers(), function (n) { return n * 2 + 1; });
}

var i = MoveToSeat(Numbers(), OddNumbers());

i();
  //=> 0 -> 1
i();
  //-> 1 -> 3
i();
  //-> 2 -> 5
i();
  //=> 3 -> 7

// ...
{% endhighlight %}

he calls out the seat numbers on Jeff's bus and the number of an odd-numbered (and therefore vacant) seat in the auditorium for them to occupy. Bertie has managed to add an infinite number of students to an infinitely large but full auditorium.

He's so pleased, he let's Jeff be the guest lecturer. The audience has loved Bertie's abstract approach to programming so far, but they're hungry for practical knowledge and Jeff enthrals them  with a walkthrough of how the Discourse User Experience is implemented.

As a bonus, Jeff shares his insights into programming productivity.[^jeff] By the end of the day, everyone is typing over 100wpm and has placed an order for multiple wall-sized monitors on eBay.

[^jeff]: "As far as I'm concerned, you can never be too rich, too thin, or have too much screen space."--[Three Monitors For Every User](http://www.codinghorror.com/blog/2010/04/three-monitors-for-every-user.html)

<a href="http://www.flickr.com/photos/raver_mikey/4118859026/" title="Nice selection of REAL buses! by Gene Hunt, on Flickr"><img src="http://farm3.staticflickr.com/2516/4118859026_ee4f8ce254_z.jpg" width="640" height="480" alt="Nice selection of REAL buses!"></a>

### day four

Day Three went well, so all the students return and the auditorium remains full. Everyone is very pleased and looking forward to Day Four.

But the excitement has a downside: Reddit hears about what's going on and an infinite number of subreddits, each of which has an infinite number of redditors, all decide to show up on day four to disrupt his lecture with trolling about how lame JavaScript is as a programming language. Each sends an infinitely large bus, with every seat full. Like Jeff's bus, each bus numbers its seat from zero and as luck would have it, each bus has has a number and the buses are numbered from zero.

Bertie has to seat an infinite number of infinite groups of people, in an infinite auditorium that is already full! Now what? Out comes the bullhorn and yesterday's program, and he quickly moves all of his existing students into the even-numbered seats, leaving an infinite number of odd seats available for newcomers.

He writes a new program:

{% highlight javascript %}
var Diagonals = function () {
  return map(Numbers(), function (n) {
    var bus = 0;
    return function () {
      var seat = n - bus;
      if (bus <= n) {
        return {
          bus: bus++,
          seat: seat
        }
      }
      else return void 0;
    };
  });
};
{% endhighlight %}

He has an Espresso Allongé and contemplates his work so far. `Diagonals` is an iterator over an infinite collection of iterators, each of which uniquely identifies a bus and seat on that bus. They look something like this:

{% highlight javascript %}
{ bus: 0, seat: 0}
{ bus: 0, seat: 1}, { bus: 1, seat: 0}
{ bus: 0, seat: 2}, { bus: 1, seat: 1}, { bus: 2, seat: 0}
{ bus: 0, seat: 3}, { bus: 1, seat: 2}, { bus: 2, seat: 1}, { bus: 3, seat: 0 }
...
{% endhighlight %}

If you think of the buses and seats forming a square, the diagonals iterator makes a path from one corner and works its way out, enumerating over every possible combination of bus and seat. Thus, given countably infinite time, it will list every one of the countably infinite number of Redditors on each of the countably infinite number of buses.

To move forward, Bertie needs a `concatenate` iterator for iterators:

{% highlight javascript %}
function concatenate (iteratorOfIterators) {
  var thisIterator = iteratorOfIterators();
  return function myself () {
    var value;
    if (thisIterator == null)
      return void 0
    value = thisIterator();
    if (value != null) {
      return value;
    }
    else {
      thisIterator = iteratorOfIterators();
      return myself();
    }
  };
};

var PeopleOnTheBuses = function () {
  return concatenate(Dialognals());
};

var i = PeopleOnTheBuses();

i();
  //=> { bus: 0, seat: 0 }
i();
  //=> { bus: 0, seat: 1 }
i();
  //=> { bus: 1, seat: 0 }
  
// ...
{% endhighlight %}

Bertie is satisfied, but the natives are restless, so he keeps coding, then reaches for his bullhorn:

{% highlight javascript %}
var RedditorSeats = map(PeopleOnTheBuses(), function (o) { 
      return 'bus: ' + o.bus + ', seat: ' + o.seat; 
    }),
    i = MoveToSeat(RedditorSeats, OddNumbers());

i();
  //=> 'bus: 0, seat: 0 -> 1'
i();
  //=> 'bus: 0, seat: 1 -> 3'
i();
  //=> 'bus: 1, seat: 0 -> 5'
i();
  //=> 'bus: 0, seat: 2 -> 7'
i();
  //=> 'bus: 1, seat: 1 -> 9'
i();
  //=> 'bus: 2, seat: 0 -> 11'
  
// ...
{% endhighlight %}

Well, this seats an infinite number of Redditors on an infinite number of buses in an infinite auditorium that was already full. He does a code walkthrough with the students, then segues on to talk about other interesting aspects of Georg Cantor[^cantor]'s work and a digression into Hotel Management.[^grand] By the time he finishes with a discussion of the Hypergame[^kongregate] proof of the infinite number of infinities, everyone has forgotten that they came to scoff.

[^cantor]: [https://en.wikipedia.org/wiki/Georg_Cantor](https://en.wikipedia.org/wiki/Georg_Cantor)
[allong.es]: http://allong.es "Free recipes from JavaScript Allongé"
[^kongregate]: [http://www.kongregate.com/forums/9/topics/93615](http://www.kongregate.com/forums/9/topics/93615)
[^grand]: [https://en.wikipedia.org/wiki/Hilbert's_paradox_of_the_Grand_Hotel](https://en.wikipedia.org/wiki/Hilbert's_paradox_of_the_Grand_Hotel)

### day five

On Day Five, everyone is back and he announces that there will be a test. *"Outside our doors,"* he announces, *"Are a countably infinite number of aircraft carriers, each of which has a countably infinitely large flight deck. Parked on each flight deck are a countably infinite number of buses, each of which contains--you guessed it--a countably infinite number of sailors and air crew eager to join our school for the next semester."*

*"Write a JavaScript program to seat them all in our lecture hall. If your program works, you may come up to the front and receive your signed diploma. Good luck!"*

### post scriptum

While the students busy themselves writing the test, he sends a pull request to integrate his `concatenate` function into [allong.es].

### end notes