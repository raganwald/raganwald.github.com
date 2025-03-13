---
title: Reginald Braithwaite
subtitle: Creative Works
layout: default
tags: [allonge]
twentytwentytodate: ["2025", "2024", "2023", "2022", "2021", "2020"]
twentyfifteentwentynineteen: ["2019", "2018", "2017", "2016", "2015"]
twentytentwentyfourteen: ["2014", "2013", "2012", "2011", "2010"]
earlyyears: ["2009", "2008", "2007", "2006", "2005", "2004"]
quoted: ["https://raganwald.com/2019/02/14/i-love-programming-and-programmers.html", "https://raganwald.com/2018/09/10/why-y.html", "https://braythwayt.com/2017/12/29/crown.html", "https://raganwald.com/2016/12/27/recursive-data-structures.html"]
---

## Recent

### essays

<div class="related">
  <ul>
    {% for oldyear in page.twentytwentytodate %}
      {% for post in site.posts %}
        {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
        {% unless post.tags contains "noindex" or postyear != oldyear %}
          <li>
            {% if post.quoteprefix %}
              <em>{{ post.quoteprefix }}</em>
            {% endif %}
              <a href="{{ post.url }}">{{ post.title }}</a>
            {% if post.quote %}
              <em>{{ post.quote }}</em>{% if post.quoteauthor %}—{{ post.quoteauthor }}{% endif %}
            {% endif %}
          </li>
        {% endunless %}
      {% endfor %}
    {% endfor %}
  </ul>
</div>

## 2015 - 2019

### books

[JavaScript Allongé] ([pdf], [podcast]) *is as close to capturing the true soul of JavaScript as anything I've read. The examples are very well thought out, and the writing style is a joy to read.*—acjohnson55 • *This book is awesome and blowing my mind in a great way.”*—Johnathan Mukai • *The best discussion of functional programming in js I've found so far.*—Nicholas Faiz • *I think it’s one of the best tech books I’ve read since Sedgewick’s* [Algorithms in C](https://archive.org/details/algorithmsinc0000sedg_e7h2).—Andrey Sidorov

[JavaScript Allongé]: https://leanpub.com/javascriptallongesix
[pdf]: /assets/javascriptallongesix.pdf
[podcast]: https://topenddevs.com/podcasts/javascript-jabber/episodes/070-jsj-book-club-javascript-allonge-with-reginald-braithwaite/
[acjohnson55]: https://news.ycombinator.com/item?id=6480649

### talks

- [Optimism and the Growth Mindset](https://www.youtube.com/embed/Zh_2OHgYdvg) from [NDC Conferences][NDC]
- [Optimism II](https://www.youtube.com/watch?v=wYPp4nG7qw4) from [DevDay](https://devday.pl)
- [Optimism](https://www.youtube.com/watch?v=8xjntzo-mYc) from [Nordic Ruby](nordicruby.org)
- [JavaScript Combinators](https://www.youtube.com/watch?v=3t75HPU2c44) from [DevDay](https://devday.pl)
- [JavaScript Combinators, The Six Edition](https://player.vimeo.com/video/153097877) from [NDC Conferences][NDC]
- [First-Class Commands: An unexpectedly fertile design pattern](https://vimeo.com/157132267) from [NDC Conferences][NDC]

[NDC]: https://vimeo.com/ndcconferences

### essays

<div class="related">
<!--
    <li>
      <a href="https://braythwayt.com/2017/12/29/crown.html">How Raganwald Lost His Crown</a>: <em>What a thoroughly enjoyable yarn which took me on a journey from the periodic table, star formation, islands of stability and a good old Wikipedia vortex.</em> —teh_klev
    </li>
-->
  <ul>
    {% for oldyear in page.twentyfifteentwentynineteen %}
      {% for post in site.posts %}
        {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
        {% unless post.tags contains "noindex" or postyear != oldyear %}
          <li>
            {% if post.quoteprefix %}
              <em>{{ post.quoteprefix }}</em>
            {% endif %}
              <a href="{{ post.url }}">{{ post.title }}</a>
            {% if post.quote %}
              <em>{{ post.quote }}</em>{% if post.quoteauthor %}—{{ post.quoteauthor }}{% endif %}
            {% endif %}
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

- [The Art of the JavaScript Metaobject Protocol: Duck Typing, Compatibility, and the Adaptor Pattern](https://www.youtube.com/watch?v=hp7sgLVepF8) from [Nordic JS](https://nordicjs.com).
- [Javascript Combinators](https://vimeo.com/97408202) from [NDC Conferences][NDC]
- [The Art of the Javascript Metaobject Protocol](https://vimeo.com/97415345) from [NDC Conferences][NDC]
- [Invent the future, don't recreate the past](https://www.youtube.com/watch?v=uYcAjr2J_rU) from [Future JS](https://fullstackfest.com)
- [The Not-So-Big Software Design](https://www.youtube.com/watch?v=arsK-CN5YDg) from [wroc_love.rb](https://www.wrocloverb.com).
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
            {% if post.quoteprefix %}
              <em>{{ post.quoteprefix }}</em>
            {% endif %}
              <a href="{{ post.url }}">{{ post.title }}</a>
            {% if post.quote %}
              <em>{{ post.quote }}</em>{% if post.quoteauthor %}—{{ post.quoteauthor }}{% endif %}
            {% endif %}
          </li>
        {% endunless %}
      {% endfor %}
    {% endfor %}
  </ul>
</div>

## Selected early works

### code

- [andand](https://github.com/raganwald/andand), the Maybe monad in idiomatic Ruby
- [JQuery Combinators](https://github.com/raganwald/JQuery-Combinators), composition-oriented tooling based on combinatory logic 
- [You Are 'Da Chef](https://github.com/raganwald/YouAreDaChef), aspect-oriented programming tooling for Underscore projects
- [rewrite_rails](https://github.com/raganwald-deprecated/rewrite_rails), add syntactic abstractions like `andand` and String-to-Block to Rails projects without monkey-patching
- [ick](https://github.com/raganwald-deprecated/ick), an ad hoc, informally-specified, bug-ridden, slow implementation of half of Monads, written in ES5
- [String#to_proc](https://github.com/raganwald/string-to-proc-dot-rb), a port of the String Lambdas from Oliver Steele’s Functional Javascript library
- [nCrypt Light](https://info-mac.org/viewtopic.php?t=7139), "strong" encryption for the origial Apple Newton in 1994

### books

- [What I've Learned From Failure](https://leanpub.com/shippingsoftware)

### talks

- [Beautiful Failure](https://vimeo.com/9967063) from [CUSEC](https://vimeo.com/cusec)
- [Bullshit](https://vimeo.com/22957263) from [Unspace Interactive](https://vimeo.com/user6029958)

### essays

<div class="related">
  <ul>
    {% for oldyear in page.earlyyears %}
      {% for post in site.posts %}
        {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
        {% unless post.tags contains "noindex" or postyear != oldyear %}
          <li>
            {% if post.quoteprefix %}
              <em>{{ post.quoteprefix }}</em>
            {% endif %}
              <a href="{{ post.url }}">{{ post.title }}</a>
            {% if post.quote %}
              <em>{{ post.quote }}</em>{% if post.quoteauthor %}—{{ post.quoteauthor }}{% endif %}
            {% endif %}
          </li>
        {% endunless %}
      {% endfor %}
    {% endfor %}
  </ul>
</div>

---

These creative works are licensed under a <a rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a> except where copyright is otherwise asserted.

<a rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a>
