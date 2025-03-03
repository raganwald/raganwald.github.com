---
title: Writing and other creative works by Reginald Braithwaite
layout: default
tags: [allonge]
recent: ["2025", "2024", "2023", "2022", "2021", "2020"]
posttalkyears: ["2019", "2018"]
older: ["2012", "2011", "2010", "2009", "2008"]
---

## 2020+

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

{% for sectionyear in page.posttalkyears %}

## {{ sectionyear }}

### essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != sectionyear %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>{% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

{% endfor %}

## 2017

### talks

- [Optimism and the Growth Mindset](https://www.youtube.com/embed/Zh_2OHgYdvg) from NDC Oslo

### essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != "2017" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>{% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

## 2016

## books

- [JavaScript Allongé, The "Six" Edition](https://leanpub.com/javascriptallongesix) ([free pdf](/assets/javascriptallongesix.pdf))

### talks

- [Optimism II](https://www.youtube.com/watch?v=wYPp4nG7qw4) from [DevDay](http://devday.pl)
- [JavaScript Combinators](https://www.youtube.com/watch?v=3t75HPU2c44) from [DevDay](http://devday.pl)
- [Optimism](https://www.youtube.com/watch?v=8xjntzo-mYc) from [Nordic Ruby](nordicruby.org)
- [JavaScript Combinators, The Six Edition](https://player.vimeo.com/video/153097877) from [NDC Conferences](https://vimeo.com/ndcconferences)
- [First-Class Commands: An unexpectedly fertile design pattern](https://vimeo.com/157132267) from [NDC Conferences](https://vimeo.com/ndcconferences)

### essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != "2016" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>{% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

## 2015

### essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != "2015" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>{% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

## 2014

### talks

- [The Art of the JavaScript Metaobject Protocol: Duck Typing, Compatibility, and the Adaptor Pattern](http://www.youtube.com/watch?v=hp7sgLVepF8) from [Nordic JS](http://nordicjs.com).
- [Javascript Combinators](https://vimeo.com/97408202) from [NDC Conferences](https://vimeo.com/ndcconferences)
- [The Art of the Javascript Metaobject Protocol](https://vimeo.com/97415345) from <a href="https://vimeo.com/ndcconferences">NDC Conferences</a>
- [Invent the future, don't recreate the past](http://www.youtube.com/watch?v=uYcAjr2J_rU) from [Future JS](http://fullstackfest.com)

### essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != "2014" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>{% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

## 2013

### code

- [HashLife in the Browser](/hashlife)

### books

- [JavaScript Allongé (ES5)](https://leanpub.com/javascript-allonge)

### talks

- [The Not-So-Big Software Design](http://www.youtube.com/watch?v=arsK-CN5YDg) from [`wroc_love.rb`](http://www.wrocloverb.com).
- [I have a good feeling about this - Why tooling is poised to make the jump to hyperspace](https://youtube.com/watch?v=Re2SKhaK73I) from [Web Rebels](https://www.webrebels.org)

### essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != "2013" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>{% if post.tags contains "wip"%} <span title="This essay is a work in progress" class="fas fa-edit"></span>{% endif %}
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

## Selected older works

### books

- [CoffeeScript Ristretto](https://leanpub.com/coffeescript-ristretto) ([free pdf](/assets/coffeescript-ristretto.pdf))
- [What I've Learned From Failure](https://leanpub.com/shippingsoftware)

### talks

<iframe src="https://player.vimeo.com/video/53265664" width="600" height="337" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

- [The Rebellion Imperative](https://vimeo.com/53265664) from [Øredev](https://vimeo.com/user4280938)
- [Beautiful Failure](https://vimeo.com/9967063) from [CUSEC](https://vimeo.com/cusec)
- [Buullshit](https://vimeo.com/22957263) from [Unspace Interactive](https://vimeo.com/user6029958)

### essays

<div class="related">
  <ul>
    {% for oldyear in page.older %}
      {% for post in site.posts %}
        {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
        {% unless post.tags contains "noindex" or postyear != oldyear %}
          <li>
            <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>)
          </li>
        {% endunless %}
      {% endfor %}
    {% endfor %}
  </ul>
</div>

---

These creative works are licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a> except where copyright is otherwise asserted.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a>
