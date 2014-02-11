---
layout: default
tags: ruby
---

Ruby allows you to make private methods:

```ruby
class Sample

  def foo
    :SNAFU
  end

  private

  def private_foo
    :PRIVATE_SNAFU
  end

end

Sample.new.foo
  #=> :SNAFU

Sample.new.private_foo
  #=> NoMethodError: private method `private_foo' called for #<Sample:0x007fa12192e130>
```

Ruby also allows you to make what other languages call "class methods." Class methods are singleton methods of the class object, not instance methods of a Class's object. Got it?

```ruby
class Sample

  def self.bar
    :FUBAR
  end

end

Sample.bar
  #=> :FUBAR

Sample.new.bar
  #=> NoMethodError: undefined method `bar' for #<Sample:0x007fa12190d2a0>
```

Can we combine the two techniques to make private class methods?:

```ruby
class Sample

  private

  def self.private_bar
    :PRIVATE_FUBAR
  end

end

Sample.private_bar
  #=> :PRIVATE_FUBAR
```

Nay nay! You cannot combine these two techniques to make a private class method. The `private` keyword does some modal thing with respect to instance methods being defined in the block, but the syntax `def self.method_name` is a different kind of thing. That different kind of thing applies to any object:

```
three = BasicObject.new

def three.to_i
  3
end

three.to_i
  #=> 3
```

The def `something.method_name` semantics ignores any declaration about privacy. Here's a question: Where are the methods `three.to_i` and `three.to_s` defined? In something called a *singleton class*, also called an *eigenclass*. These methods are called *singleton methods* because they apply to `three` but not to anything else:

```ruby
four = BasicObject.new

four.to_i
  #=> NoMethodError: undefined method `to_i' for #<BasicObject:0x007fa121856d20>
```

There's another way to declare a singleton method. Behold:

```ruby
class << four

  def to_i
    4
  end

end

four.to_i
  #=> 4
```

When you use the `class << x ... end` syntax, the code in the block is evaluated in the context of the singleton class of `x` for any object x. Note that it works just like defining instance methods in a typical class declaration. For example, we can `include` a module:[^extend]

```
module Mathy

  def * that
    self.to_i * that.to_i
  end

end

class << four

  include ::Mathy

end

four * 5
  #=> 20
```

[^extend]: You are thinking that you can `.extend` any object with a module too. Well, you can *extend* any instance of `Object`, but not an instance of `BasicObject` that isn't also an instance of `Object`. Tricky raganwald!

What happens if we create a singleton method for a class object?

```ruby
class << Sample

  def glitch
    'Gremlins Lurking In The Computer Hardware'
  end

end
```

This is *not* an instance method of `Sample` instances:

```ruby
Sample.new.glitch
  #=> NoMethodError: undefined method `glitch' for #<Sample:0x007fa14b0c3340>
```

It's a singleton method of the Sample object itself:

```
Sample.glitch
  #=> "Gremlins Lurking In The Computer Hardware"
```

Hey, what's a *class method* anyways? It's a method on the class, not a method on an instance of the class. In other words... Class methods are singleton methods of class objects, and thus you can define them with either `def Sample.glitch` or `class << Sample`.

Are there any reasons to use `class << Sample`? Consider this:

```ruby
five = BasicObject.new

class << five

  private

  def puddy
    'high five!'
  end

end

five.puddy
  #=> NoMethodError: private method `puddy' called for #<BasicObject:0x007fa14a0279c8>
```

This is very interesting! You can create private singleton methods using the `class << x` syntax. You can't using the `def x.method_name` syntax. So intuition suggests:

```ruby
class << Sample

  private

  def bug
    :MOTH
  end

end

Sample.new.bug
  #=> NoMethodError: undefined method `bug' for #<Sample:0x007fa14b0976c8>

Sample.bug
  #=> NoMethodError: private method `bug' called for Sample:Class
```

Aha! That's how to create private singleton methods for class objects.

### homework

Explain this code:

```ruby
class Sample

  class << self

    def skunkworks
      :ADP
    end

  end

end
```

([discuss](http://www.reddit.com/r/ruby/comments/1xm50i/private_methods_in_ruby/))