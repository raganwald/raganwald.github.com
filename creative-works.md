---
title: Reginald Braithwaite
subtitle: Creative Works
layout: default
tags: [allonge]
twentytwentytodate: ["2025", "2024", "2023", "2022", "2021", "2020"]
twentyfifteentwentytwenty: ["2019", "2018", "2017", "2016", "2015"]
twentytentwentyfourteen: ["2014", "2013", "2012", "2011", "2010"]
beforetwentyten: ["2009", "2008", "2007", "2006", "2005", "2004"]
---

## Quotes on JavaScript Allongé

---

> [JavaScript Allongé](/assets/javascriptallongesix.pdf) will make you a better programmer, regardless of whether you use JS regularly or not. But if you do, I think this book is as close to capturing the true soul of Javascript as anything I've read. The examples are very well thought out, and the writing style is a joy to read.  
> —[acjohnson55](https://news.ycombinator.com/item?id=6480649)

---

> Spent the afternoon reading raganwald's JavaScript Allongé, The Six Edition. Highly recommended. Let the refactoring begin!  
> —Marcus Vorwaller

---

> I think it’s one of the best tech books I’ve read since Sedgewick’s Algorithms in C.  
> —Andrey Sidorov

---

> Your explanation of closures in JavaScript Allongé is the best I've read.  
> —Emehrkay

---

> This book is awesome and blowing my mind in a great way.”  
> —Johnathan Mukai

---

> The best discussion of functional programming in js I've found so far.  
> —Nicholas Faiz

---

> Reading JavaScript Allongé by raganwald. This book is so good that it's blowing my mind.  
> —Guillermo Pascual

---

## Quotes on essays

> [A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata](http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html) is amazingly well written. You covered a good deal of any introduction to computational theory course in a straightforward, well motivated matter. This is definitely something I'll be passing around to some of my bootcamp friends who are curious taste some of the theory they don't get exposure to.  
> —[kjeetgil](https://news.ycombinator.com/item?id=19228668)

---

> [Why Y? Deriving the Y Combinator in JavaScript](http://raganwald.com/2018/09/10/why-y.html) sounds like poetry. Beautifully written!  
> —[nikodunk](https://news.ycombinator.com/item?id=17956855)

---

> I really enjoyed [Why Recursive Data Structures](http://raganwald.com/2016/12/27/recursive-data-structures.html) because it introduced me to a new data structure and some very elegant and (subjectively) beautiful algorithms.  
> —[johnfn](https://news.ycombinator.com/item?id=13308232)

---

> What a thoroughly enjoyable yarn which took me on a journey from the periodic table, star formation, islands of stability and a good old Wikipedia vortex.  
> —[teh_klev](https://news.ycombinator.com/item?id=16036986) on [How Raganwald Lost His Crown](http://braythwayt.com/2017/12/29/crown.html)

---

## 2020 - current

### essays

<div class="related">
  <ul>
    {% for oldyear in page.twentytwentytodate %}
      {% for post in site.posts %}
        {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
        {% unless post.tags contains "noindex" or postyear != oldyear %}
          <li>
            <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>){% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
          </li>
        {% endunless %}
      {% endfor %}
    {% endfor %}
  </ul>
</div>

## 2015 - 2019

### books

- [JavaScript Allongé, The "Six" Edition](https://leanpub.com/javascriptallongesix) ([pdf](/assets/javascriptallongesix.pdf), [podcast](https://topenddevs.com/podcasts/javascript-jabber/episodes/070-jsj-book-club-javascript-allonge-with-reginald-braithwaite/))

### talks

- [Optimism and the Growth Mindset](https://www.youtube.com/embed/Zh_2OHgYdvg) from [NDC Conferences][NDC]
- [Optimism II](https://www.youtube.com/watch?v=wYPp4nG7qw4) from [DevDay](http://devday.pl)
- [JavaScript Combinators](https://www.youtube.com/watch?v=3t75HPU2c44) from [DevDay](http://devday.pl)
- [Optimism](https://www.youtube.com/watch?v=8xjntzo-mYc) from [Nordic Ruby](nordicruby.org)
- [JavaScript Combinators, The Six Edition](https://player.vimeo.com/video/153097877) from [NDC Conferences][NDC]
- [First-Class Commands: An unexpectedly fertile design pattern](https://vimeo.com/157132267) from [NDC Conferences][NDC]

[NDC]: https://vimeo.com/ndcconferences

### essays

<div class="related">
  <ul>
    {% for oldyear in page.twentyfifteentwentytwenty %}
      {% for post in site.posts %}
        {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
        {% unless post.tags contains "noindex" or postyear != oldyear %}
          <li>
            <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>){% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
          </li>
        {% endunless %}
      {% endfor %}
    {% endfor %}
  </ul>
</div>

## 2010 - 2014

### code

- [HashLife in the Browser](/hashlife), computing qudrillions of generations of Conway's Game of Life in a browser.
- [allong.es](https://github.com/raganwald/allong.es), a library for writing ES5 in a functional style.
- [oscin.es](https://github.com/raganwald/oscin.es), a library for playing with combinatorial logic puzzles such as those found in [To Mock a Mockingbird](https://en.wikipedia.org/wiki/To_Mock_a_Mockingbird)

### books

- [JavaScript Allongé (ES5)](https://leanpub.com/javascript-allonge) ([podcast](https://topenddevs.com/podcasts/javascript-jabber/episodes/070-jsj-book-club-javascript-allonge-with-reginald-braithwaite/))
- [CoffeeScript Ristretto](https://leanpub.com/coffeescript-ristretto) ([pdf](/assets/coffeescript-ristretto.pdf))
- [Kestrels, Quirky Birds, and Hopeless Egocentricity](https://leanpub.com/combinators)

### talks

- [The Art of the JavaScript Metaobject Protocol: Duck Typing, Compatibility, and the Adaptor Pattern](http://www.youtube.com/watch?v=hp7sgLVepF8) from [Nordic JS](http://nordicjs.com).
- [Javascript Combinators](https://vimeo.com/97408202) from [NDC Conferences][NDC]
- [The Art of the Javascript Metaobject Protocol](https://vimeo.com/97415345) from [NDC Conferences][NDC]
- [Invent the future, don't recreate the past](http://www.youtube.com/watch?v=uYcAjr2J_rU) from [Future JS](http://fullstackfest.com)
- [The Not-So-Big Software Design](http://www.youtube.com/watch?v=arsK-CN5YDg) from [`wroc_love.rb`](http://www.wrocloverb.com).
- [I have a good feeling about this - Why tooling is poised to make the jump to hyperspace](https://youtube.com/watch?v=Re2SKhaK73I) from [Web Rebels](https://www.webrebels.org)
- [The Rebellion Imperative](https://vimeo.com/53265664) from [Øredev](https://vimeo.com/user4280938)

### essays

<div class="related">
  <ul>
    {% for oldyear in page.twentytentwentyfourteen %}
      {% for post in site.posts %}
        {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
        {% unless post.tags contains "noindex" or postyear != oldyear %}
          <li>
            <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>){% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
          </li>
        {% endunless %}
      {% endfor %}
    {% endfor %}
  </ul>
</div>

### bonus essay

- [How Raganwald Lost His Crown](http://braythwayt.com/2017/12/29/crown.html)

## Selected beforetwentyten works

### code

- [andand](https://github.com/raganwald/andand), the Maybe monad in idiomatic Ruby
- [JQuery Combinators](https://github.com/raganwald/JQuery-Combinators), composition-oriented tooling based on combinatory logic 
- [You Are 'Da Chef](https://github.com/raganwald/YouAreDaChef), aspect-oriented programming tooling for Underscore projects
- [rewrite_rails](https://github.com/raganwald-deprecated/rewrite_rails), add syntactic abstractions like `andand` and String-to-Block to Rails projects without monkey-patching
- [ick](https://github.com/raganwald-deprecated/ick), an ad hoc, informally-specified, bug-ridden, slow implementation of half of Monads, written in ES5
- [String#to_proc](https://github.com/raganwald/string-to-proc-dot-rb), a port of the String Lambdas from Oliver Steele’s Functional Javascript library

### books

- [What I've Learned From Failure](https://leanpub.com/shippingsoftware)

### talks

- [Beautiful Failure](https://vimeo.com/9967063) from [CUSEC](https://vimeo.com/cusec)
- [Bullshit](https://vimeo.com/22957263) from [Unspace Interactive](https://vimeo.com/user6029958)

### essays

<div class="related">
  <ul>
    {% for oldyear in page.beforetwentyten %}
      {% for post in site.posts %}
        {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
        {% unless post.tags contains "noindex" or postyear != oldyear %}
          <li>
            <a href="{{ post.url }}">{{ post.title }}</a>
          </li>
        {% endunless %}
      {% endfor %}
    {% endfor %}
  </ul>
</div>

---

These creative works are licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a> except where copyright is otherwise asserted.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a>
