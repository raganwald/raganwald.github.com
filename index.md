---
title: index.html
layout: default
ad: combinators
---

### about

This is the new technical weblog for [Reginald "raganwald" Braithwaite](http://braythwayt.com), author of [JavaScript Allongé](http://leanpub.com/javascript-allonge), [CoffeeScript Ristretto](http://ristrettolo.gy), and [Kestrels, Quirky Birds, and Hopeless Egocentricity](http://combinators.info).

### writing

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% unless post.categories contains "noindex" or post.categories contains "homoiconic" %}
        <li>
    <span>{{ post.date | date: "%B %e, %Y" }}</span> <a href="{{ post.url }}">{{ post.title }}</a>
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

### reposts of earlier material

<div class="related">
  <ul>
    {% for post in site.categories.homoiconic %}
      {% unless post.categories contains "noindex" %}
        <li>
    <span>{{ post.date | date: "%B %e, %Y" }}</span> <a href="{{ post.url }}">{{ post.title }}</a>
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>