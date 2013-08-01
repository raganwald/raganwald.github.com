---
layout: default
tags: [javascript]
---

As programmers, it is our job to build software out of abstractions. Logic gates are connected to form a "Von Neumann Computer." An assembler creates an interface that can be programmed with instructions like `MOV 12345, 567890`. A compiler lets us write `x = y`, and so on up to `has_and_belongs_to_many :roles`.

When programming in a particular language, we often want to borrow an abstraction from another language, much as English speakers will murmur "C'est la vie" when the build breaks. In JavaScript, the [Underscore] library includes a function called `pluck`. Compare `_.pluck(users, 'lastName')` in JavaScript to using String#to_proc in Ruby: `users.map(&:lastName)`. The mechanisms and syntaxes are different, but the underlying ideas are similar.

For small idioms, other languages can be a fertile source of abstractions. But we struggle when we become ambitious and attempt to [Greenspun] new semantics that are a poor fit with our primary tool.

[Underscore]: http://underscorejs.org
[Greenspun]: https://en.wikipedia.org/wiki/Greenspun%27s_Tenth_Rule

In Ruby, for example, [Benjamin Stein] and I wrote a little thing called [andand]. It emulates the existential (or "elvis") operator from Groovy and CoffeeScript. On the surface, it's as simple as String#to_proc. You can write something like `user.andand.lastName`, and if `user` is `null`, the expression evaluates to `null` without any exceptions being thrown.

[Benjamin Stein]: http://www.mobilecommons.com/author/ben/
[andand]: https://github.com/raganwald/andand

### a leaky abstraction

But let's draw the curtain back, shall we? The `andand` method that's mixed into all objects is not too tough to parse once you realize there's a special case for passing a block:

{% highlight ruby %}
def andand (p = nil)
  if self
    if block_given?
      yield(self)
    elsif p
      p.to_proc.call(self)
    else
      self
    end
  else
    if block_given? or p
      self
    else
      MockReturningMe.new(self)
    end
  end 
end

class MockReturningMe < BlankSlate
  def initialize(me)
    super()
    @me = me
  end
  def method_missing(*args)
    @me
  end
end
{% endhighlight %}

But what is this `MockReturningMe` thingummy? Well, if the receiver of `.andand` is falsey, the method `.andand` returns a special proxy object that returns the original object no matter what method you send it. This works just fine for the "normal case" of writing something like `raganwald.andand.braythwayt`, but introduces icky[^icky] edge cases.

In CoffeeScript, the compiler will complain if you write `object?.` instead of `object?.method`. But `object.andand` is perfectly acceptable Ruby code that returns either the receiver or one of these proxy objects. All sorts of unpleasant bugs can arise from a simple mistake, bugs that can't be caught in a dynamically typed language like Ruby.

As Joel Spolsky would say, "andand is a leaky abstraction."

[^icky]: The quality of being as obscure as Ick, an obscure Ruby library.