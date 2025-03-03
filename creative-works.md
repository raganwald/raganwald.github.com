---
title: Writing and other creative works by Reginald Braithwaite
layout: default
tags: [allonge]
recent: ["2025", "2024", "2023", "2022", "2021", "2020"]
twentyfifteen: ["2019", "2018", "2017", "2016", "2015"]
twentytwenty: ["2014", "2013", "2012", "2011", "2010"]
older: ["2009", "2008"]
---

## 2020 - current

### essays

<div class="related">
  <ul>
    {% for oldyear in page.recent %}
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

- [JavaScript Allongé, The "Six" Edition](https://leanpub.com/javascriptallongesix) ([pdf](/assets/javascriptallongesix.pdf))

### talks

- [Optimism and the Growth Mindset](https://www.youtube.com/embed/Zh_2OHgYdvg) from NDC Oslo
- [Optimism II](https://www.youtube.com/watch?v=wYPp4nG7qw4) from [DevDay](http://devday.pl)
- [JavaScript Combinators](https://www.youtube.com/watch?v=3t75HPU2c44) from [DevDay](http://devday.pl)
- [Optimism](https://www.youtube.com/watch?v=8xjntzo-mYc) from [Nordic Ruby](nordicruby.org)
- [JavaScript Combinators, The Six Edition](https://player.vimeo.com/video/153097877) from [NDC Conferences](https://vimeo.com/ndcconferences)
- [First-Class Commands: An unexpectedly fertile design pattern](https://vimeo.com/157132267) from [NDC Conferences](https://vimeo.com/ndcconferences)

### essays

<div class="related">
  <ul>
    {% for oldyear in page.twentyfifteen %}
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

## 2020 - 2014

### code

- [HashLife in the Browser](/hashlife), computing qudrillions of generations of Conway's Game of Life in a browser.
- [allong.es](https://github.com/raganwald/allong.es), a library for writing ES5 in a functional style.

### books

- [JavaScript Allongé (ES5)](https://leanpub.com/javascript-allonge)
- [CoffeeScript Ristretto](https://leanpub.com/coffeescript-ristretto) ([pdf](/assets/coffeescript-ristretto.pdf))
- [Kestrels, Quirky Birds, and Hopeless Egocentricity](https://leanpub.com/combinators)

### talks

- [The Art of the JavaScript Metaobject Protocol: Duck Typing, Compatibility, and the Adaptor Pattern](http://www.youtube.com/watch?v=hp7sgLVepF8) from [Nordic JS](http://nordicjs.com).
- [Javascript Combinators](https://vimeo.com/97408202) from [NDC Conferences](https://vimeo.com/ndcconferences)
- [The Art of the Javascript Metaobject Protocol](https://vimeo.com/97415345) from <a href="https://vimeo.com/ndcconferences">NDC Conferences</a>
- [Invent the future, don't recreate the past](http://www.youtube.com/watch?v=uYcAjr2J_rU) from [Future JS](http://fullstackfest.com)
- [The Not-So-Big Software Design](http://www.youtube.com/watch?v=arsK-CN5YDg) from [`wroc_love.rb`](http://www.wrocloverb.com).
- [I have a good feeling about this - Why tooling is poised to make the jump to hyperspace](https://youtube.com/watch?v=Re2SKhaK73I) from [Web Rebels](https://www.webrebels.org)
- [The Rebellion Imperative](https://vimeo.com/53265664) from [Øredev](https://vimeo.com/user4280938)

### essays

<div class="related">
  <ul>
    {% for oldyear in page.twentytwenty %}
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

## Selected older works

### code

- [andand](https://github.com/raganwald/andand), the Maybe monad in idiomatic Ruby
- [JQuery Combinators](https://github.com/raganwald/JQuery-Combinators), composition-oriented tooling based on combinatory logic 
- [You Are 'Da Chef](https://github.com/raganwald/YouAreDaChef), aspect-oriented programming tooling for Underscore projects
- [rewrite_rails](https://github.com/raganwald-deprecated/rewrite_rails), add syntactic abstractions like `andand` and String-to-Block to Rails projects without monkey-patching
- [ick](https://github.com/raganwald-deprecated/ick), an ad hoc, informally-specified, bug-ridden, slow implementation of half of Monads, written in ES5

### books

- [What I've Learned From Failure](https://leanpub.com/shippingsoftware)

### talks

- [Beautiful Failure](https://vimeo.com/9967063) from [CUSEC](https://vimeo.com/cusec)
- [Bullshit](https://vimeo.com/22957263) from [Unspace Interactive](https://vimeo.com/user6029958)

### essays

<div class="related">
  <ul>
    {% for oldyear in page.older %}
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
