---
title: A program to compute the nth Fibonacci number
layout: default
tags: [homoiconic, ruby]
---

Since [I'm looking for a job again](http://braythwayt.com/reginald/RegBraithwaite20120423.pdf "Reginald Braithwaite's Resume") and people often like to ask for a [fizzbuzz](https://raganwald.com/2007/01/dont-overthink-fizzbuzz.html "Don't Overthink FizzBuzz") program to weed out the folks who can't string together a few lines of code, I thought I'd write up a program to compute the *n*th Fibonacci number. There's an intriguing bit of matrix math involved, so I learned something while implementing it.[^closed]

[^closed]: There is a [closed-form solution](http://en.wikipedia.org/wiki/Fibonacci_number#Closed-form_expression) to the function `fib`, but floating point math has some limitations you should be aware of before [using it in an interview](https://raganwald.com/2013/03/26/the-interview.html).

Recently I was having lunch with [some of Toronto's most interesting Ruby developers](http://unspace.ca), and the subject of interview questions came up. Specifically, writing a program to compute the nth Fibonacci number. Unsurprisingly, we agreed it might be useful as a screener for weeding out the people who were completely delusional about their prospects as a professional programmer. You know, the type of person who stares blankly at the screen and has no idea where to start, even when told that all we wanted was a program that correctly prints an answer. No tests, no specs, no shouldas, no passengers, no CSS, just prove you actually can write something, anything.

We also agreed that any [Guess the answer I'm thinking of](http://www.nomachetejuggling.com/2008/12/11/my-least-favorite-interview-question/ "My Least Favorite Interview Question &raquo; Absolutely No Machete Juggling") problem is terrible, including Fibonacci. Should it iterate? Recurse? Memoize? Is it overkill to use advanced math to be really fast? Or will you get tossed out of the interview for writing a naive recursive solution? Unless the interviewer is very specific that they just want you to prove that you actually have written ten or more lines of working Ruby code in your life, there could be any number of reasons to disqualify any solution.

But we batted around a few ideas for how to gild the lily, and since I have just found myself contemplating the prospect of being asked to write a program to compute the nth Fibonacci number, I thought I'd get some practice and write one in advance. Since I'm doing it for myself, I'm going to optimize for maximum personal growth.

Here we go...

## Enter The Matrix

One problem with calculating a Fibonacci number is that naive algorithms require _n_ addition operations. There are some interesting things we can do to improve on this. One way is to transform _n_ additions into raising something to the power of *n*. This turns _n_ additions into _n_ multiplications. That seems retrograde, but hold on to your disbelief.

This is actually nice, because there is a trick about raising something to a power that we can exploit. But first things first. As explained in [Sum of Fibonacci numbers?](http://expertvoices.nsdl.org/cornell-cs322/2008/03/25/sum-of-fibonacci-numbers/), we can express the Fibonacci number `F(n)` using a 2x2 matrix:

    [ 1 1 ] n      [ F(n+1) F(n)   ]
    [ 1 0 ]    =   [ F(n)   F(n-1) ]

[Multiplying two matrices](http://www.maths.surrey.ac.uk/explore/emmaspages/option1.html "Matrices and Determinants") is a little interesting if you have never seen it before:

    [ a b ]       [ e f ]   [ ae + bg  af + bh ]
    [ c d ] times [ g h ] = [ ce + dg  cf + dh ]

Our matrices always have diagonal symmetry, so we can simplify the calculation because _c_ is always equal to _b_:

    [ a b ]       [ d e ]   [ ad + be  ae + bf ]
    [ b c ] times [ e f ] = [ bd + ce  be + cf ]

Now we are given that we are multiplying two matrices with diagonal symmetry. Will the result have diagonal symmetry? In other words, will `ae + bf` always be equal to `bd + ce`? Remember that `a = b + c` at all times and `d = e + f` provided that each is a power of `[[1,1], [1,0]]`. Therefore:

    ae + bf = (b + c)e + bf
            = be + ce + bf
    bd + ce = b(e + f) + ce
            = be + bf + ce
	
That simplifies things for us, we can say:

    [ a b ]       [ d e ]   [ ad + be  ae + bf ]
    [ b c ] times [ e f ] = [ ae + bf  be + cf ]

And thus, we can always work with three elements instead of four. Let's express this as operations on arrays:

    [a, b, c] times [d, e, f] = [ad + be, ae + bf, be + cf]

Which we can code in Ruby:

```ruby
def times(*ems)
  ems.inject do |product, matrix|
  	a,b,c = product; d,e,f = matrix
  	[a*d + b*e, a*e + b*f, b*e + c*f]
  end
end

times([1,1,0]) # => [1, 1, 0]
times([1,1,0], [1,1,0]) # => [2, 1, 1]
times([1,1,0], [1,1,0], [1,1,0]) # => [3, 2, 1]
times([1,1,0], [1,1,0], [1,1,0], [1,1,0]) # => [5, 3, 2]
times([1,1,0], [1,1,0], [1,1,0], [1,1,0], [1,1,0]) # => [8, 5, 3]
```
	
Very interesting. We could write out a naive implementation that constructs a long array of copies of `[1,1,0]` and then calls `times`:

```ruby
def naive_power(m, n)
  times(*(1..n).map { |n| m })
end

naive_power([1,1,0], 1) # => [1, 1, 0]
naive_power([1,1,0], 2) # => [2, 1, 1]
naive_power([1,1,0], 3) # => [3, 2, 1]
naive_power([1,1,0], 4) # => [5, 3, 2]
naive_power([1,1,0], 5) # => [8, 5, 3]
```

Now let's make an observation: instead of accumulating a product by iterating over the list, let's [Divide and Conquer](http://www.cs.berkeley.edu/~vazirani/algorithms/chap2.pdf). Let's take the easy case: Don't you agree that `times([1,1,0], [1,1,0], [1,1,0], [1,1,0])` is equal to `times(times([1,1,0], [1,1,0]), times([1,1,0], [1,1,0]))`? And that this saves us an operation, since `times([1,1,0], [1,1,0], [1,1,0], [1,1,0])` is implemented as:

```ruby
times([1,1,0],
	times([1,1,0],
		times([1,1,0],[1,1,0]))
```

Whereas `times(times([1,1,0], [1,1,0]), times([1,1,0], [1,1,0]))` can be implemented as:

```ruby
begin
	double = times([1,1,0], [1,1,0])
	times(double, double)
end
```

This only requires two operations rather than three. Furthermore, it is recursive. `naive_power([1,1,0], 8)` requires seven operations. However, it can be formulated as:

```ruby
begin
	quadruple = begin
		double = times([1,1,0], [1,1,0])
		times(double, double)
	end
	times(quadruple, quadruple)
end			
```

Now we only need three operations compared to seven. Of course, we left out how to deal with odd numbers. Fixing that also fixes how to deal with even numbers that aren't neat powers of two:

```ruby
def power(m, n)
  if n == 1
    m
  else
    halves = power(m, n / 2)
    if n % 2 == 0
      times(halves, halves)
    else
      times(halves, halves, m)
    end
  end
end

power([1,1,0], 1) # => [1, 1, 0]
power([1,1,0], 2) # => [2, 1, 1]
power([1,1,0], 3) # => [3, 2, 1]
power([1,1,0], 4) # => [5, 3, 2]
power([1,1,0], 5) # => [8, 5, 3]
```

And we can write our complete fibonacci function:

```ruby
def fib(n)
  return n if n < 2
  power([1,1,0], n - 1).first
end
```

And dress things up in idiomatic Ruby using the anonymous module pattern:

```ruby
class Integer

  include(Module.new do
  
    times = lambda do |*ems|
      ems.inject do |product, matrix|
      	a,b,c = product; d,e,f = matrix
      	[a*d + b*e, a*e + b*f, b*e + c*f]
      end
    end
  
    power = lambda do |m, n|
      if n == 1
        m
      else
        halves = power.call(m, n / 2)
        if n % 2 == 0
          times.call(halves, halves)
        else
          times.call(halves, halves, m)
        end
      end
    end
  
    define_method :matrix_fib do
      return self if self < 2
      power.call([1,1,0], self - 1).first
    end
  
  end)

end

(0..20).map { |n| n.matrix_fib }
	# => [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765]
```

We're done!

p.s. No we're not done: [Another program to compute the nth Fibonacci number](http://github.com/raganwald/homoiconic/tree/master/2008-12-17/another_fibonacci.md#readme).

p.p.s. No, this isn't [the fastest implementation](http://blade.nagaokaut.ac.jp/cgi-bin/scat.rb/ruby/ruby-talk/194815 "Fast Fibonacci method") by far. But it beats the pants off of a naïve iterative implementation.

---

notes: