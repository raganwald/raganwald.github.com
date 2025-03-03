---
title: Writing and other creative works by Reginald Braithwaite
layout: default
tags: [allonge]
recent: ["2025", "2024", "2023", "2022", "2021", "2020"]
posttalkyears: ["2019", "2018"]
years: ["2016", "2015", "2014", "2013"]
older: ["2012", "2011", "2010", "2009", "2008"]
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/3t75HPU2c44" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<p><a href="https://www.youtube.com/watch?v=3t75HPU2c44">JavaScript Combinators, the &ldquo;six&rdquo; edition</a> from <a href="https://devconf.pl">DevDay 2016</a>.</p>

---

### Free Book Downloads

☕️ <a href="/assets/javascriptallongesix.pdf">JavaScript Allongé, The "Six" Edition</a>  
☕️ An antiquarian edition of <a href="/assets/coffeescript-ristretto.pdf">CoffeeScript Ristretto</a>

### HashLife

<a href="/hashlife" style="text-decoration: none;"><img src="https://raganwald.com/assets/gifs/animated-glider.gif" alt="Animated image of a glider in Conway's Game of Life"/></a>

---

## 2020+

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

<iframe width="560" height="315" src="https://www.youtube.com/embed/Zh_2OHgYdvg?si=jZza3PmJjKKQIXmN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

[Optimism and the Growth Mindset](https://speakerdeck.com/raganwald/optimism-and-the-growth-mindset) from NDC Oslo.

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

{% for sectionyear in page.years %}

## 2016

<iframe width="600" height="337" src="https://www.youtube.com/embed/wYPp4nG7qw4" frameborder="0" allowfullscreen></iframe>

[Optimism II](https://www.youtube.com/watch?v=wYPp4nG7qw4) from [DevDay](http://devday.pl)

---

<iframe width="600" height="337" src="https://www.youtube.com/embed/3t75HPU2c44" frameborder="0" allowfullscreen></iframe>

[JavaScript Combinators](https://www.youtube.com/watch?v=3t75HPU2c44) from [DevDay](http://devday.pl)

---

<iframe width="600" height="337" src="https://www.youtube.com/embed/8xjntzo-mYc" frameborder="0" allowfullscreen></iframe>

[Optimism](https://www.youtube.com/watch?v=8xjntzo-mYc) from [Nordic Ruby](nordicruby.org)

---

<iframe src="https://player.vimeo.com/video/153097877" width="600" height="337" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<p><a href="https://vimeo.com/153097877">JavaScript Combinators, the &ldquo;Six&rdquo; Edition</a> from <a href="https://vimeo.com/ndcconferences">NDC Conferences</a>.</p>

---

<iframe src="https://player.vimeo.com/video/157132267" width="600" height="337" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<p><a href="https://vimeo.com/157132267">&ldquo;First-Class Commands:&rdquo; An unexpectedly fertile design pattern</a> from <a href="https://vimeo.com/ndcconferences">NDC Conferences</a>.</p>

---

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

{% for sectionyear in page.years %}

## {{ sectionyear }}

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

## selected older essays

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
