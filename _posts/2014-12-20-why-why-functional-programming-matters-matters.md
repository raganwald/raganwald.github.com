---
layout: default
---

(*This was originally posted on Sunday, March 11, 2007*)

I recently re-read the amazing paper [Why Functional Programming Matters](http://www.math.chalmers.se/~rjmh/Papers/whyfp.html) (&#8220;WhyFP&#8221;). Although I thought that I understood WhyFP when I first read it a few years ago, when I had another look last weekend I suddenly understood that I had missed an important message.[^1]

Now obviously (can you guess from the title?) the paper is about the importance of one particular style of programming, functional programming. And when I first read the paper, I took it at face value: I thought, &#8220;Here are some reasons why functional programming languages matter.&#8221;

On re-reading it, I see that the paper contains insights that apply to programming in general. I don&#8217;t know why this surprises me. The fact is, programming language design revolves around program design. A language&#8217;s design reflects the opinions of its creators about the proper design of programs.

In a very real sense, the design of a programming language is a strong expression of the opinions of the designer about good programs. When I first read WhyFP, I thought the author was expressing an opinion about the design of good programming languages. Whereas on the second reading, I realized he was expressing an opinion about the design of good programs.

### Can we add though subtraction?

> It is a logical impossibility to make a language more powerful by omitting features, no matter how bad they may be.
Is this obvious? So how do we explain that one reason Java is considered &#8220;better than C++&#8221; is because it omits manual memory management? And one reason many people consider Java &#8220;better than Ruby&#8221; is because you cannot open base classes like `String` in Java? So no, it is not obvious. Why not?

The key is the word _better_. It&#8217;s not the same as the phrase _more powerful_.[^2] The removal or deliberate omission of these features is an expression about the idea that programs which do not use these features are better than programs which do. Any feature (or removal of a feature) which makes the programs written in the language better makes the language better. Thus, it _is_ possible to make a language &#8220;better&#8221; by removing features that are considered harmful,[^3] if by doing so it makes programs in the language better programs.

In the opinion of the designers of Java, programs that do not use `malloc` and `free` are safer than those that do. And the opinion of the designers of Java is that programs that do not modify base classes like `String` are safer than those that do. The Java language design emphasizes a certain kind of safety, and to a Java language designer, safer programs are better programs.

&#8220;More powerful&#8221; is a design goal just like &#8220;safer.&#8221; But yet, what does it mean? We understand what a safer language is. It&#8217;s a language where programs written in the language are safer. But what is a &#8220;more powerful&#8221; language? That programs written in the language are more powerful? What does that mean? Fewer symbols (the &#8220;golf&#8221; metric)?

WhyFP asserts that you cannot make a language more powerful through the removal of features. To paraphrase an argument from the paper, _if removing harmful features was useful by itself, C and C++ programmers would simply have stopped using_ `malloc` _and_ `free` _twenty years ago_. Improving on C/C++ was not just a matter of removing `malloc` and `free`, it was also a matter of adding automatic garbage collection.

> This space, wherein the essay ought to argue that Java compensates for its closed base classes by providing a more powerful substitute feature, left intentionally blank.

At the same time, there is room for arguing that some languages are improved by the removal of harmful features. To understand why they may be improved but not more powerful, we need a more objective definition of what it means for a language to be &#8220;more powerful.&#8221; Specifically, what quality does a more powerful programming language permit or encourage in programs?

When we understand what makes a program &#8220;better&#8221; in the mind of a language designer, we can understand the choices behind the language.

### Factoring

Factoring a program is the act of dividing it into units that are composed to produce the working software.[^4] Factoring happens as part of the design. (_Re_-factoring is the act of rearranging an existing program to be factored in a different way). If you want to compare this to factoring in number theory, a well designed program has lots of factors, like the number `3,628,800` (`10!`). A [Big Ball of Mud](http://www.laputan.org/mud/) is like the number `3,628,811`, a prime.

Composition is the construction of programs from smaller programs. So factoring is to composition as division is to multiplication.

Factoring programs isn&#8217;t really like factoring simple divisors. The most important reason is that programs can be factored in orthogonal ways. When you break a program into subprograms (using methods, subroutines, functions, what-have-you), that&#8217;s one axis of factoring. When you break an a modular program up into modules, that&#8217;s another, orthogonal axis of factoring.

Programs that are well-factored are more desirable than programs that are poorly factored.

> In computer science, **separation of concerns** (SoC) is the process of breaking a program into distinct features that overlap in functionality as little as possible. A concern is any piece of interest or focus in a program.
> 
>   SoC is a long standing idea that simply means a large problem is easier to manage if it can be broken down into pieces; particularly so if the solutions to the sub-problems can be combined to form a solution to the large problem.
> 
>   The term separation of concerns was probably coined by Edsger W. Dijkstra in his paper [On the role of scientific thought](http://www.cs.utexas.edu/users/EWD/transcriptions/EWD04xx/EWD447.html).
&#8212;Excerpts from the Wikipedia entry on [Separation of Concerns](http://en.wikipedia.org/wiki/Separation_of_concerns)

Programs that separate their concerns are well-factored. There&#8217;s a principle of software development, [responsibility-driven design](http://www.amazon.com/gp/product/0201379430?ie=UTF8&amp;tag=raganwald001-20&amp;linkCode=as2&amp;camp=211189&amp;creative=374929&amp;creativeASIN=0201379430 "Object Design: Roles, Responsibilities, and Collaborations"). Each component should have one clear responsibility, and it should have everything it needs to carry out its responsibility.

This is the separation of concerns again. Each component of a program having one clearly defined responsibility means each concern is addressed in one clearly defined place.

> Let’s ask a question about Monopoly (and Enterprise software). Where do the rules live? In a noun-oriented design, the rules are smooshed and smeared across the design, because every single object is responsible for knowing everything about everything that it can ‘do’. All the verbs are glued to the nouns as methods.&#8212;[My favourite interview question](http://raganwald.github.com/2006/06/my-favourite-interview-question.html)

In a game design where you have important information about a rule smeared all over the object hierarchy, you have very poor separation of concerns. It looks at first like there&#8217;s a clear factoring &#8220;Baltic Avenue has a method called `isUpgradableToHotel`,&#8221; but when you look more closely you realize that every object representing a property is burdened with knowing almost all of the rules of the game.

The concerns are not clearly separated: there&#8217;s no one place to look and understand the behaviour of the game.

Programs that separate their concerns are better programs than those that do not. And languages that facilitate this kind of program design are better than those that hamper it.

### Power through features that separate concerns

One thing that makes a programming language &#8220;more powerful&#8221; in my opinion is the provision of more ways to factor programs. Or if you prefer, _more axes of composition_. The more different ways you can compose programs out of subprograms, the more powerful a language is. 

Do you remember [Structured Programming](http://en.wikipedia.org/wiki/Structured_programming)? The gist is, you remove `goto` and you replace it with well-defined control flow mechanisms: some form of subroutine call and return, some form of selection mechanism like Algol-descendant `if`, and some form of repetition like Common Lisp&#8217;s `loop` macro.

Dijkstra&#8217;s view on structured programming was that it promoted the separation of concerns. The factoring of programs into blocks with well-defined control flow made it easy to understand blocks and rearrange programs in different ways. Programs with indiscriminate jumps did not factor well (if at all): they were difficult to understand and often could not be rearranged at all.

Structured [68k ASM](http://dmoz.org/Computers/Programming/Languages/Assembly/68k/) programming is straightforward in theory. You just need a lot of boilerplate, design patterns, and the discipline to stick to your convictions. But of course, lots of 68k ASM programming in practice is only partially structured. Statistically speaking, 68k ASM is not a structured programming language even though structured programming is possible in 68k ASM.

Structured Pascal programming is straightforward both in theory and in practice. Pascal facilitates separation of concerns through structured programming. So we say that Pascal &#8220;is more powerful than 68k ASM&#8221; to mean that in practice, programs written in Pascal are more structured than programs written in 68k ASM because Pascal provides facilities for separating concerns that are missing in 68k ASM.

### For example: working with lists

Consider this snippet of iterative code:

{% highlight java %}
int numberOfOldTimers = 0;
for (Employee emp: employeeList) {
    for (Department dept: departmentsInCompany) {
        if (emp.getDepartmentId() == dept.getId() && emp.getYearsOfService() > dept.getAge()) {
            ++numberOfOldTimers;
        }
    }
}
{% endhighlight %}

This is an improvement on older practices.[^5] [^6] For one thing, the `for` loops hide the implementation details of iterating over `employeeList` and `departmentsInCompany`. Is this better because you have less to type? Yes. Is it better because you eliminate the fence-post errors associated with loop variables? Of course.

But most interestingly, you have the beginnings of a _separation of concerns_: how to iterate over a single list is separate from what you do in the iteration.

> Try calling a colleague on the telephone and explaining what we want as succinctly as possible. Do you say &#8220;We want a loop inside a loop and inside of that an if, and&#8230;&#8221;? Or do you say &#8220;We want to count the number of employees that have been with the company longer than their departments have existed.&#8221;
One problem with the `for` loop is that it can only handle one loop at a time. We have to nest loops to work with two lists at once. This is patently wrong: there&#8217;s nothing inherently nested about what we&#8217;re trying to do. We can demonstrate this easily: try calling a colleague on the telephone and explaining what we want as succinctly as possible. Do you say &#8220;We want a loop inside a loop and inside of that an if, and&#8230;&#8221;?

No, we say, &#8220;We want to count the number of employees that have been with the company longer than their departments have existed.&#8221; There&#8217;s no discussion of nesting.

In this case, a limitation of our tool has caused our concerns to intermingle again. The concern of &#8220;How to find the employees that have been with the company longer than their departments have existed&#8221; is intertwined with the concern of &#8220;count them.&#8221; Let&#8217;s try a different notation that separates the details of _how to find_ from the detail of _counting what we&#8217;ve found_:

{% highlight ruby %}
old_timers = (employees * departments).select do |emp, dept|
  emp.department_id == dept.id && emp.years_of_service > dept.age
end
number_of_old_timers = old_timers.size
{% endhighlight %}

Now we have separated the concern of finding from counting. And we have hidden the nesting by using the `*` operator to create a Cartesian product of the two lists. Now let&#8217;s look at what we used to filter the combined list, `select`. The difference is more than just semantics, or counting characters, or the alleged pleasure of fooling around with closures.

`*` and `select` facilitates separating the concerns of how to filter things (like iterate over them applying a test) from the concern of what we want to filter. So languages that make this easy are more powerful than languages that do not. In the sense that they facilitate additional axes of factoring.

### The Telephone Test

Let&#8217;s look back a few paragraphs. We have an example of the &#8220;Telephone Test:&#8221; when code very closely resembles how you would explain your solution over the telephone, we often say it is &#8220;very high level.&#8221; The usual case is that such code expresses a lot more _what_ and a lot less _how_. The concern of what has been very clearly separated from the concern of how: you can&#8217;t even _see_ the how if you don&#8217;t go looking for it.

In general, we think this is a good thing. But it isn&#8217;t free: somewhere else there is a mass of code that supports your brevity. When that extra mass of code is built into the programming language, or is baked into the standard libraries, it is nearly free and obviously a Very Good Thing. A language that doesn&#8217;t just separate the concern of how but does the work for you is very close to &#8220;something for nothing&#8221; in programming.

But sometimes you have to write the _how_ as well as the _what_. It isn&#8217;t always handed to you. In that case, it is still valuable, because the resulting program still separates concerns. It still factors into separate components. The components can be changed.

I recently separated the concern of describing &#8220;how to generate sample curves for some data mining&#8221; from the concern of &#8220;managing memory when generating the curves.&#8221; I did so by writing my own lazy evaluation code (Both the [story](http://raganwald.github.com/2007/02/haskell-ruby-and-infinity.html) and the [code](http://raganwald.com/assets/media/source/lazy_lists.html) are on line). Here&#8217;s the key &#8220;what&#8221; code that generates an infinite list of parameters for sample bezi&eacute;r curves:

{% highlight ruby %}
def magnitudes
  LazyList.binary_search(0.0, 1.0)
end

def control_points
  LazyList.cartesian_product(magnitudes, magnitudes) do |x, y|
    Dictionary.new( :x => x, :y => y )
  end
end

def order_one_flows args = {}
  height, width = (args[:height] || 100.0), (args[:width] || 100.0)
  LazyList.cartesian_product(
      magnitudes, control_points, control_points, magnitudes
  ) do |initial_y, p1, p2, final_y|
    FlowParams.new(
      height, width, initial_y * height,
      CubicBezierParams.new(
        :x => width,          :y => final_y * height,
        :x1 => p1.x * width,  :y1 => p1.y * height,
        :x2 => p2.x * width,  :y2 => p2.y * height
      )
    )
  end
end
{% endhighlight %}

That&#8217;s it. Just as I might tell you on the phone: &#8220;Magnitudes&#8221; is a list of numbers between zero and one created by repeatedly dividing the intervals in half, like a binary search. &#8220;Control Points&#8221; is a list of the Cartesian product of magnitudes with itself, with one magnitude assigned to `x` and the other to `y`. And so forth.

I will not say that the sum of this code and the code that actually implements infinite lists is shorter than imperative code that would intermingle loops and control structures, [entangling](http://www.amazon.com/gp/product/B000002J27?ie=UTF8&amp;tag=raganwald001-20&amp;linkCode=as2&amp;camp=1789&amp;creative=9325&amp;creativeASIN=B000002J27 "A Trick of the Tail by Genesis, Track 2, Entangled")![](http://www.assoc-amazon.com/e/ir?t=raganwald001-20&amp;l=as2&amp;o=1&amp;a=B000002J27) _what_ with _how_. I will say that it separates the concerns of what and how, and it separates them in a different way than `select` separated the concerns of what and how.

### So why does &#8220;Why Functional Programming Matters&#8221; matter again?

The great insight is that better programs separate concerns. They are factored more purely, and the factors are naturally along the lines of responsibility (rather than in Jenga piles of `abstract` `virtual` `base` `mixin` `module` `class` `proto_` `extends` `private` `implements`). Languages that facilitate better separation of concerns are more powerful in practice than those that don&#8217;t.

WhyFP illustrates this point beautifully with the same examples I just gave: [first-class functions](http://raganwald.github.com/2007/01/closures-and-higher-order-functions.html) and [lazy evaluation](http://raganwald.github.com/2007/02/haskell-ruby-and-infinity.html), both prominent features of modern functional languages like Haskell.

WhyFP&#8217;s value is that it expresses an opinion about what makes programs better. It backs this opinion up with reasons why modern functional programming languages are more powerful than imperative programming languages. But even if you don&#8217;t plan to try functional programming tomorrow, the lessons about better programs are valuable for your work in _any_ language today.

That&rsquo;s why [Why Functional Programming Matters](http://www.math.chalmers.se/~rjmh/Papers/whyfp.html) matters.

---

[^1]: And now I&#8217;m worried: what am I _still_ missing?

[^2]: Please let&#8217;s not have a discussion about [Turing Equivalence](http://en.wikipedia.org/wiki/Turing-complete). Computer Science &#8220;Theory&#8221; tells us &#8220;there&#8217;s no such thing as more powerful.&#8221; Perhaps we share the belief that _In theory, there&#8217;s no difference between theory and practice. But in practice, there is_.

[^3]: I am not making the claim that _I_ consider memory management or unsealed base classes harmful, but I argue that there exists at least one person who does.

[^4]: The word &#8220;factor&#8221; has been a little out of vogue in recent times. But thanks to an excellent [post on reddit](http://programming.reddit.com/info/18td4/comments), it could make a comeback.

[^5]: So much so that we won&#8217;t even bother to show what loops looked like in the days of `for (int i = 0; i < employeeList.size(); ++i)`.

[^6]: Another organization might merge employees and departments, or have each department &ldquo;own&rdquo; a collection of employees. This makes our example easier, but now the _data_ doesn&rsquo;t factor well. Everything we&rsquo;ve learned from databases in the last forty years tells us that we often need to find new ways to compose our data. The relational model factors well. The network model factors poorly.