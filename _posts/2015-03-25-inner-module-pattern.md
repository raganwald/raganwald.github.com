---
layout: default
title: "The Inner Module Pattern"
tags: ["allonge"]
published: false
---

*Encapsulation* is one of the basic patterns for organizing complexity. In its most generic form, "encapsulation" refers to taking a quantum of functionality and separating it into its interface and implementation. The interface is the part that interacts with other parts of a program. The impementation is the part that does the actual work.

All non-trivial programs can be divided up into units of functionality. A very simple example is a function:

{% highlight javascript %}
function largest (largestNumber, ...remainingNumbers) {  
  for (let otherNumber of remainingNumbers) {
    if (otherNumber > largestNumber) largestNumber = otherNumber;
  }
  return largestNumber;
}

largest(2,3,1)
  //=> 3
{% endhighlight %}

The interface between this function and the rest of any program is the mechanism for invoking the function and returning a result. The implementation is all the code inside the function. As we have written it, the rest of a program cannot interact with this program in any other way.

One of the principles of this division is that it should be possible to change the implementation without changing the interface. For example, we can rewrite the names of the parameters without changing the interface:

{% highlight javascript %}
function largest (x, ...y) {  
  for (let z of y) {
    if (z > x) x = z;
  }
  return x;
}

largest(2,3,1)
  //=> 3
{% endhighlight %}

The names of parameters are part of the implementation, not the interface. Likewise, we could change our function's algorithm entirely without changing the interface:

{% highlight javascript %}
function largest (x, ...y) {  
  if (y.length === 0)
    return x;
  else {
    const z = largest(...y);
    return x > z ? x : z;
  }
}

largest(2,3,1)
  //=> 3
{% endhighlight %}

The implementation is defined as the parts we can change without affecting the rest of the program. The interface is the parts we can't change without affecting the rest of the program.

---

Now let's consider this function that has been written in tail-recursive style:

{% highlight javascript %}
function factorial (n) {  
  return factorialHelper(n, 1)
}

function factorialHelper (n, accumulator) {
  if (n < 2) {
    return accumulator;
  }
  else return factorialHelper(n - 1, n * accumulator);
}

factorial(5)
  //=> 5
{% endhighlight %}

Now here we have a slightly more complex interface. If you ask a human abut its interface, the answer is that the interface consists of calling the `factorial` function. But what about the `factorialHelper`? To a human, this is part of `factorial`'s implementation, a matter of no concern to the rest of the program. But 