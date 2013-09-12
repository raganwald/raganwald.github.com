---
layout: default
tags: [ruby]
---

In Ruby, modules are often used to [mix functionality into][mixin] concrete classes. Another excellent pattern is to [extend objects][e] as a way of avoiding monkey-patching classes you do not "own." There's a third pattern that I find handy and expressive: Using modules as object predicates.

[mixin]: https://en.wikipedia.org/wiki/Mixin
[e]: http://www.ruby-doc.org/docs/ProgrammingRuby/html/classes.html#UD

Let's begin by defining the problem: **Representing object predicates**.

We have some objects that represent entities of some sort. They could be in the domain, they could be in the implementation. For our ridiculously simple example, we will choose bank accounts:

{% highlight ruby %}
class BankAccount

  # ... 

end
{% endhighlight %}

Our bank account instances have lots of state. A really forward-looking way to deal with that is to implement a state machine, but let's hand-wave over that and imagine that we're trying to write Java programs with Ruby syntax, so we use a getter and setter for some attribute:

{% highlight ruby %}
class BankAccount

  attr_accessor :frozen

end

chequing_acct = BankAccount.new(...)
chequing_acct.frozen = false

# ...

if chequeing_acct.frozen
  # do something
end
{% endhighlight %}

If this attribute is always a boolean, we call it a predicate, and in the Ruby style borrowed from Lisp, we suffix its getter with a `?`:

{% highlight ruby %}
class BankAccount

  attr_writer :frozen
  
  def frozen?
    @frozen
  end

end

chequing_acct = BankAccount.new(...)
chequing_acct.frozen = false

# ...

if chequeing_acct.frozen?
  # do something
end
{% endhighlight %}

That's how most of my code is written, and it works just fine. But we should be clear about what this code is saying and what it isn't saying.

### what are we saying with predicate attributes?

Let's compare this:

{% highlight ruby %}
class BankAccount

  attr_writer :frozen
  
  def frozen?
    @frozen
  end

end
{% endhighlight %}

With the following:

{% highlight ruby %}
class BankAccount

end

class Thawed < BankAccount

  def frozen?; false; end

end

class Frozen < BankAccount

  def frozen?; true; end

end

bank_account = Frozen.new(...)
{% endhighlight %}

In the first example, using an attribute *implies* that `frozen` can change during an object's lifespan. In the second example, using classes imples that `frozen` cannot change during an object's lifespan. That is very interesting! People talk about code that communicates its intent, having two ways to implement the `frozen?` method helps us communicate whether the frozen state is expected to change for an object.

### cleaning up with predicate modules

If we do have a predicate that is not expected to change during the object's lifespan, having a pattern to communicate that is a win, provided it's a clean pattern. Subclassing is not clean for this case. And imagine we had four or ten such predicate attributes, subclassing would be insane.

Modules can help us out. Let's try:

{% highlight ruby %}
class BankAccount

end

module Thawed

  def frozen?; false; end

end

module Frozen

  def frozen?; true; end

end

bank_account = BankAccount.new(...).extend(Frozen)

bank_account.frozen?
  #=> true
{% endhighlight %}

Now we're extending an object with a module (not including the module in a class), and we get the module's functionality in that object. It works like a charm, although you do want to be aware there are now *three* states for frozen-ness: `Frozen`, `Thawed`, and `I-Forgot-To-Extend-The-Object`. And we can mix in as many such predicate modules as we like.

### module responsibilities

With classes including modules, each class is responsible for including the modules it needs. Writing `.extend(Foo)` when creating a new object shifts the responsibility to the client creating an object. That's nearly always a bad idea, so we bakeit into the initialize method. I prefer hashes of options and initializers, but you can do this in other ways:

{% highlight ruby %}
class BankAccount

  def initialize options = {}
    self.extend(
      if options[:frozen]
        Frozen
      else
        Thawed
      end
    )
  end

end
{% endhighlight %}

You can experiment with this pattern. If you find yourself writing a lot of this kind of code:

{% highlight ruby %}
if object.frozen?
  raise "Cannot fuggle with a frozen object"
else
  fuggle(object)
end
{% endhighlight %}

You can write:

{% highlight ruby %}
module Thawed

  def frozen?; false; end

  def guard_with_frozen_check desc
    yield self
  end

end

module Frozen

  def frozen?; true; end

  def guard_with_frozen_check desc = 'evaluate code block'
    raise "Cannot #{desc} with a frozen object"
  end

end

bank_account.guard_with_frozen_check('fuggle') do |acct|
  fuggle(acct)
end

{% endhighlight %}

This is much more 'OO' than having code test `frozen?`. Not that there's anything wrong with that! But what if you like to test bank accounts for frozen-ness? Well, you don't really need a `frozen?` method if you don't want one:

{% highlight ruby %}

module Thawed; end

module Frozen; end

bank_account = BankAccount.new(...).extend(Frozen)

bank_account.kind_of?(Frozen)
  #=> true
{% endhighlight %}

Checking whether an account is a kind of `Frozen` is a matter of taste, of course. But it's no worse in my mind than a `frozen?` method if we do not expect an object to change such a state during its lifetime.

Well, there you have it: **The Predicate Module Pattern**. Cheers!

---

### personal commentary

If you make a habit of programming as I do, you will inevitably run into contrary opinions. For example, one widely held opinion is that `#kind_of?` is a "code smell." I agree with this, provided that the expression "code smell" retains it shistorical meaning, namely something that should be double-checked to make sure that it is what you want.

As a general rule, you should be absolutely certain that you are using `.kind_of?` for good rasons, and not because you are unfamiliar with the "Kingdom of Nouns" style of programming where entities are burdened with an every-increasing number of responsibilities because they ought to know everything about how to use them.

In the code above, we're actually presented with three ways to use a bank account's `frozen` predicate attribute:

1. A method called `frozen?`.
2. Using `kind_of?(Frozen)`.
3. Baking flow control into the predicate modules using the `guard_with_frozen_check` method.

If a module is created strictly to communciate a predicate to fellow programmers, it's tru that you can define `frozen?` in a module to show that ths is not expected to change, however there is a problem. The interface of the method `frozen?` is abstract enough that the predicate could be a state that changes, or it could be a state that doesn't change.

That's widely seen as a benefit, but when everything is abstract and could-be-changed in the future, interfaces communicate very little. `kind_of?(Frozen)` pushes the implementation into the interface, true, but it also pushes a contractual promise about the behaviour of `Frozen` into the interface. That can be a benefit when you make a conscious choice that you are trying to make this behaviour obvious.

Generally, modules and classes are used for implementing interfaces, and they shouldn't become the interface. But a predicate module is, IMO, a place where it is worth considering whether the smell is calling out an actual antipattern or whether this is one of those places where a general rule espoused by the mass of the herd doesn't apply.

As for option 3, this speaks to a style of programming that eschews checking predicates or values at all times. The name `guard_with_frozen_check` is good for explaining the mechanism, but terrible in practice. I'd pick *the name* as the smell. Consider instead:

{% highlight ruby %}
class BankAccount

  def initialize options = {}
    self.extend(
      if options[:security_score].andand < 42
        Frozen
      else
        Thawed
      end
    )
  end

end

module Thawed

  def perform_user_action desc
    yield self
  end

end

module Frozen

  def perform_user_action desc = 'perform user action'
    raise "Cannot #{desc} with an object frozen because of a poor security score"
  end

end

bank_account = BankAccount.new security_score: 74

bank_account.perform_user_action('fuggle') do |acct|
  fuggle(acct)
end
{% endhighlight %}

In this code, clients do not know anything about why an account might be froze, they create accounts and provide security scores, and they ask the accounts to perform user actions. The account checks the frozen "state" via a module.

You could do the same thing by saving teh score and checking it, or saving a frozen predicate attribute, but you wouldn't be communicating that security scores don't change in the context of an instantiated `BankAccount` object.

It's up to you what to do with this pattern. Just be aware that if you read essays by people who switched from Java to Ruby at a time when Ruby was unpopular, they may act as if "popularity" isn't their first consideration when choosing how to write programs.

That's neither good, nor bad, it just *is*.