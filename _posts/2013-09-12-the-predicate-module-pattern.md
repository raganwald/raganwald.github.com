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

You can experiment with this pattern. If you find yourself writing a lot of this kidn of code:

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

module Thawed

  def frozen?; false; end

end

module Frozen

  def frozen?; true; end

end

bank_account = BankAccount.new(...).extend(Frozen)

bank_account.kind_of?(Frozen)
  #=> true
{% endhighlight %}

Checking whether an account is a kind of `Frozen` is a matter of taste, of course. But it's no worse in my mind than a `frozen?` method if we do not expect an object to change such a state during its lifetime.

Well, there you have it: The Predicate Module Pattern. Cheers!