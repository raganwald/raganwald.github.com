---
layout: default
tags: [programming, gameoflife]
---

The other day, a colleague and I were debating whether to defactor some code. No, not refactor the code, *de*-factor the code.

### what is "factoring?"

Defactoring is the process of removing factoring from code. The word "refactoring" is commonplace, "factoring" is somewhat less common, and "defactoring" is the least commonly discussed as such. Let's define it, starting with what the word "factoring" means:

*Factoring* starts with taking code that does something, and organizing it into parts that work together *or separately*, and without adding or removing functionality. The canonical example would be to take a program consisting of single, monolithic "God Object," and breaking it out into various entities with individual responsibilities.

It's not enough to simply "extract method" repeatedly, turning a single, monolithic object with a single public method into a single, monolithic object with a single method and a series of helper methods that are so hopelessly coupled that they can't be called by anything else, and perhaps can't even by called in a different order.

That's re-organzing, perhaps, but it's more like futzing with whitespace and indentation than it is refactoring. When you factor a number, you extract other numbers that can be recombined. `42` can be factored into three primes: `[2, 3, 7]`. Those factors can be recombined to make different numbers, for example `6` is `2 * 3` and `21` is `3 * 7`.

Here is a method loosely snarfed from [Longest Common Subsequence](http://rosettacode.org/wiki/Longest_common_subsequence#Ruby):

{% highlight ruby %}
def find_common_ends(a, b)
  aa, bb = a.dup, b.dup
  prefix, suffix = Array.new, Array.new
  while (ca = aa.first) && (cb = bb.first) && ca == cb
    aa.shift
    prefix.push bb.shift
  end
  while (ca = aa.last) && (cb = bb.last) && ca == cb
    aa.pop
    suffix.unshift bb.pop
  end
  [prefix, aa, bb, suffix]
end

find_common_ends [1, '2', 3, 4, 5], [1, 2, 4, 3, 5]
  # => [[1], ["2", 3, 4], [2, 4, 3], [5]]
{% endhighlight %}

Here we extract the comparison without factoring it much if at all:

{% highlight ruby %}
def find_common_ends(a, b)
  aa, bb = a.dup, b.dup
  prefix, suffix = Array.new, Array.new
  while (ca = aa.first) && (cb = bb.first) && similar(ca, cb)
    aa.shift
    prefix.push bb.shift
  end
  while (ca = aa.last) && (cb = bb.last) && similar(ca, cb)
    aa.pop
    suffix.unshift bb.pop
  end
  [prefix, aa, bb, suffix]
end

def similar(x,y)
  x == y
end

find_common_ends [1, '2', 3, 4, 5], [1, 2, 4, 3, 5]
  # => [[1], ["2", 3, 4], [2, 4, 3], [5]]
{% endhighlight %}

But here we *factor* the comparison, by allowing you to paramaterize calls to `find_common_ends`:

{% highlight ruby %}
def find_common_ends(a, b, &similar)
  similar ||= lambda { |a, b| a == b }
  aa, bb = a.dup, b.dup
  prefix, suffix = Array.new, Array.new
  while (ca = aa.first) && (cb = bb.first) && similar.call(ca, cb)
    aa.shift
    prefix.push bb.shift
  end
  while (ca = aa.last) && (cb = bb.last) && similar.call(ca, cb)
    aa.pop
    suffix.unshift bb.pop
  end
  [prefix, aa, bb, suffix]
end

find_common_ends [1, '2', 3, 4, 5], [1, 2, 4, 3, 5]
  # => [[1], ["2", 3, 4], [2, 4, 3], [5]]

find_common_ends [1, '2', 3, 4, 5], [1, 2, 4, 3, 5] { |x, y| x.to_s == y.to_s }
  # => [[1, 2], [3, 4], [4, 3], [5]]
{% endhighlight %}

Now you can use `find_common_ends` in more ways, because you've truly factored the similarity check out of the array scanning method.

Summary: To truly factor something, you have to extract things that can be used independantly of the original. Factoring implies introducing *flexibility*.

### what is "defactoring?"

Defactoring is the opposite of factoring. Defactoring reduces the number of ways we can recombine the pieces of code we have. If we defactored `find_common_ends`, we might take it from having a signature of `find_common_ends(a, b, &similar)` to `find_common_ends(a, b)`. We'd make it *less flexible*.

One way to defactor code is to introduce coupling. You have just as many pieces, but they can't be recombined, they aren't really independant. Another way is to recombine them so you have fewer pieces.

Why would you wnat to defactor code? More flexible is better, right?

### why defactor

Design is a process of making *choices*. Bad design is when you punt on a choice. Microsoft PowerPoint makes money by being everything to everybody, but it is not good design for any one user or for any one kind of presentation. It does too much. It's too flexible. It imposes cognitive overhead sorting out how to use all of its bits and pieces to accomplish a task.

[Haiku Deck](http://www.haikudeck.com) goes the other way. The authors have made design choices. It does less, much less. It is less flexible overall. But within its domain, it is a better product than PowerPoint. And so it is with software design. Sometimes, increased flexibility introduces unnecessary cognitive overhead. There are options that will never be exercised.

Well-written code isn't harder to read on account of the flexibility. We can assume our colleagues know what metaprogramming is, how blocks work, what a method combinator does, and so on. But nevertheless, increased flexibility does mean that the code says far less about how it's intended to work. Whenever you're reading a piece of it, you are thinking, "it might do this, it nmight do that."

This is why there are holy wars over operator overloading. What does `a == b` mean in Ruby? Nobody knows, because `==` is a flexible concept.

Software design is the act of making bets about the future. A well-designed program is a bet on what will change in the future, and what will not change. And a well-designed program communicates the nature of that bet by being relatively flexible about things that the designers think are most likely to change, and being relatively inflexible about the things the designers think are least likely to change.

When you discover you need more flexibility, you factor. When you discover you need less flexibility, you defactor.

### what defactoring tells us about factoring

Good design communicates its intention. Consider the statement "One way to defactor code is to introduce coupling. You have just as many pieces, but they can't be recombined, they aren't really independant." Code that has a lot of coupled pieces is generally held to be a bad idea.

You somnetimes see maxims like limits on the number of lines in a method. Measuring such things is useful, but it's a trap to game the nnumber rather than using such things as hints about where to seek deeper understanding. If we break a big method into a lot of coupled small methods, we sends the wrong signal: It looks like the code is flexible, but it isn't.

We lied, telling our colleagues that we think all these pieces ought to be recombined, and that it was designed with changes in mind. But in reality, we were simply trying to break one coupeld monolithic method into a bunch of small, coupled helper methods.

Things that are coupled ought to be clustered together in an obvious way, either by recombining them or by clustering them together using language features like classes, modules, scopes and so on. That separates the idea of adding mental whitespace from the idea of factoring.

### summary

Factoring is the division of code into independant entities that can be recombined. Defactoring is the reassembly of formerly independant entities. We factor to introduce flexibility. We defactor to reduce flexibility. Flexibility has a cognitive cost, so we apply it wher ewe think we need it and remove it from where we think we don't need it. We attempt to keep the appearance of code flexibility algned with the reality of code flexibility: Things that apear to be independant shoudl not be coupled.