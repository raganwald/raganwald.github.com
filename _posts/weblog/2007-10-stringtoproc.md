---
title: `String#to_proc`
layout: default
---

*Breaking news! The irb enhancement gem Utility Belt includes* `String#to_proc`

`String#to_proc` is an addition to Ruby’s core String class to enable point-free hylomorphisms…

I’ll start again. `String#to_proc` adds a method to Ruby’s core String class to make lots of mapping and reducing operations more compact and easier to read by removing boilerplate and focusing on what is to be done. In many cases, the existing black syntax is just fine. But in a few cases, `String#to_proc` can make an expression even simpler.

`String#to_proc` is a port of the String Lambdas from Oliver Steele’s Functional Javascript library. I have modified the syntax to reflect how `String#to_proc` works in Ruby.

We’ll start with the examples from String Lambdas so you can see what is actually going on. Then we’ll look at how to use the `&` coercion to make working with arrays really simple.

`to_proc` creates a function from a string that contains a single expression. This function can then be applied to an argument list, either immediately:

```ruby
'x+1'.to_proc[2];
     → 3
'x+2*y'.to_proc[2, 3];
     → 8
```

or (more usefully) later:

```ruby
square = 'x*x'.to_proc;
square(3);
     → 9
square(4);
     → 16
```

### Explicit parameters

If the string contains a `->`, this separates the parameters from the body.

```ruby
'x y -> x+2*y'.to_proc[2, 3];
     → 8
'y x -> x+2*y'.to_proc[2, 3];
     → 7
```

Otherwise, if the string contains a _, it’s a unary function and _ is name of the parameter:

```ruby
'_+1'.to_proc[2];
     → 3
'_*_'.to_proc[3];
     → 9
```

### Implicit parameters

If the string doesn’t specify explicit parameters, they are implicit.

If the string starts with an operator or relation besides `-`, or ends with an operator or relation, then its implicit arguments are placed at the beginning and/or end:

```ruby
'*2'.to_proc[2];
     → 4
'/2'.to_proc[4];
     → 2
'2/'.to_proc[4];
     → 0.5
'/'.to_proc[2, 4];
     → 0.5
```

’.’ counts as a right operator:

```ruby
'.abs'.to_proc[-1];
 → 1
 ```

Otherwise, the variables in the string, in order of occurrence, are its parameters.

```ruby
'x+1'.to_proc[2];
     → 3
'x*x'.to_proc[3];
     → 9
'x + 2*y'.to_proc[1, 2];
     → 5
'y + 2*x'.to_proc[1, 2];
     → 5
```

### Chaining

Chain `->` to create curried functions.

```ruby
'x y -> x+y'.to_proc[2, 3];
     → 5
'x -> y -> x+y'.to_proc[2][3];
     → 5
plus_two = 'x -> y -> x+y'.to_proc[2];
plus_two[3]
     → 5
```

### Using `String#to_proc` in Idiomatic Ruby

Ruby on Rails popularized `Symbol#to_proc`, so much so that it will be part of Ruby 1.9.

If you like:

```ruby
%w[dsf fgdg fg].map(&:capitalize)
    → ["Dsf", "Fgdg", "Fg"]
```

then `%w[dsf fgdg fg].map(&'.capitalize')` isn’t much of an improvement.

But what about doubling every value in a list:

```ruby
(1..5).map &'*2'
    → [2, 4, 6, 8, 10]
```

Or folding a list:

```ruby
(1..5).inject &'+'
    → 15
```

Or having fun with factorial:

```ruby
factorial = "(1.._).inject &'*'".to_proc
factorial[5]
    → 120
```

`String#to_proc`, in combination with & coercing a value into a proc, lets you write compact maps, injections, selections, detections (and many others!) when you only need a simple expression.

Caveats: `String#to_proc` uses eval. Cue the chorus of people—pounding away on quad 3Ghz systems—complaining about the performance. You’re an adult. Decide for yourself whether this is an issue. After mankying things about to deduce the parameters, `String#to_proc` evaluates its expression in a different binding than where you wrote the String. This matters if you include free variables. My thinking is that it ceases to be a simple, easy-to-understand hack and becomes a cyrptic nightmare once you get too fancy.

> You know that Voight-Kampff test of yours… did you ever take that test yourself?
> —Rachael, Blade Runner


I have been using Functional Javascript for quite some time now, and I use the String Lambdas a lot. However, Ruby and Javascript are very different languages. Once you get out of the browser’s DOM, Javascript is a lot cleaner and more elegant than Ruby. For example, you don’t need to memorize the difference between a block, a lambda, and a proc. Javascript just has functions.

However, Javascript is more verbose: Whereas in Ruby you can write `[1, 2, 3].map { |x| x*2 }`, if Javascript had a map method for arrays, you would still have to write `[1, 2, 3].map(function (x) { return x*2; })`. So it’s a big win to make Javascript less verbose: code is easier to read at a glance when you don’t have to wade through jillions of function keywords.

Nevertheless, I still find myself itching for the String Lambdas when I’m writing Ruby code. It may be a matter of questionable taste, but for certain extremely simple expressions, I vastly prefer the point-free style. `(-3..3).map &:abs` is shorter than `(-3..3).map { |x| x.abs }`.

It is also cleaner to me. `abs` is a message, especially in a language like Ruby that supports the sending arbitrary messages named by symbols. Writing `(-3..3).map &:abs` looks very much like sending the abs message to everything in the list. I don’t need an `x` in there to tell me that.

Thus, I obviously like `(-3..3).map &'.abs'`. But I like `(1..5).map &'*2'` for the same reason. It isn’t just shorter, it hides a temporary variable that really doesn’t mean Jack to me when I’m reading the code. And quite honestly, `(1..10).inject { |acc, mem| acc + mem }` raises more questions than it answers about what `inject` does and how it does it. `(1..10).inject &'+'` gets right down to business for me. I’d prefer that it be called “fold,” but the raw, naked `+` seems to describe what I want done instead of how I want the computer to do it.

`Symbol#to_proc` also supports named parameters, either through implication (`&'x+y'`) or with the arrow `('x y -> x*y')`. I haven’t thought of a case where that would be a win over using a Ruby block: `{ |x, y| x*y }`.

I’m divided about the underscore notation. It seems like a good compromise for expressions where there is a single parameter and it doesn’t fall on the left or the right side of an expression. Standardizing on an unusual variable name is, I think, a win. Underscore often means a “hole” in an expression or a computation, so it feels like a good fit. I would honestly much rather see something like: `&'(1/_)+1'` than `&'(1/x)+1'`. The underscore jumps out in an obvious way, and it wouldn’t be magically clearer to write `{ |x| (1/x)+1 }`.

That being said, I haven’t actually written an underscore expression yet in actual code, so far I’m getting by using the point-free expressions to simplify things and using Ruby blocks for everything else.

### RSpec

```ruby
describe "String to Proc" do

  before(:all) do
    @one2five = 1..5
  end

  it "should handle simple arrow notation" do
    @one2five.map(&'x -> x + 1').should eql(@one2five.map { |x| x + 1 })
    @one2five.map(&'x -> x*x').should eql(@one2five.map { |x| x*x })
    @one2five.inject(&'x y -> x*y').should eql(@one2five.inject { |x,y| x*y })
    'x y -> x**y'.to_proc()[2,3].should eql(lambda { |x,y| x**y }[2,3])
    'y x -> x**y'.to_proc()[2,3].should eql(lambda { |y,x| x**y }[2,3])
  end

  it "should handle chained arrows" do
    'x -> y -> x**y'.to_proc()[2][3].should eql(lambda { |x| lambda { |y| x**y } }[2][3])
    'x -> y z -> y**(z-x)'.to_proc()[1][2,3].should eql(lambda { |x| lambda { |y,z| y**(z-x) } }[1][2,3])
  end

  it "should handle the default parameter" do
    @one2five.map(&'2**_/2').should eql(@one2five.map { |x| 2**x/2 })
    @one2five.select(&'_%2==0').should eql(@one2five.select { |x| x%2==0 })
  end

  it "should handle point-free notation" do
    @one2five.inject(&'*').should eql(@one2five.inject { |mem, var| mem * var })
    @one2five.select(&'>2').should eql(@one2five.select { |x| x>2 })
    @one2five.select(&'2<').should eql(@one2five.select { |x| 2<x })
    @one2five.map(&'2*').should eql(@one2five.map { |x| 2*x })
    (-3..3).map(&'.abs').should eql((-3..3).map { |x| x.abs })
  end

  it "should handle implied parameters as best it can" do
    @one2five.inject(&'x*y').should eql(@one2five.inject(&'*'))
    'x**y'.to_proc()[2,3].should eql(8)
    'y**x'.to_proc()[2,3].should eql(8)
  end

end
```

Go ahead, download the source code for yourself.

### Update: Reg smacks himself in the head!

I had a look at the source code for `Symbol#to_proc`:

```ruby
class Symbol
  # Turns the symbol into a simple proc, which is especially useful for enumerations. Examples:
  #
  #   # The same as people.collect { |p| p.name }
  #   people.collect(&:name)
  #
  #   # The same as people.select { |p| p.manager? }.collect { |p| p.salary }
  #   people.select(&:manager?).collect(&:salary)
  def to_proc
    Proc.new { |*args| args.shift.__send__(self, *args) }
  end
end
```

Look at that: Although the examples are all of unary messages like `.name`, the lambdas created handle methods with arguments. And since almost everything in Ruby is a method, including operators like `+`… You can use `Symbol#to_proc` to do some of the point-free stuff I like:

```ruby
[1, 2, 3, 4, 5].inject(&:+)
     → 15
[{ :foo => 1 }, { :bar => 2 }, { :blitz => 3 }].inject &:merge
     → {:foo=>1, :bar=>2, :blitz=>3}
```

---

Note (2026-06-20): This has been hand-copied from http://weblog.raganwald.com/2007/10/stringtoproc.html