---
title: index.html
layout: default
ad: b/coffee-kestrels-code
---

### about

Texhnical essays by [Reginald "raganwald" Braithwaite](http://braythwayt.com), author of [JavaScript Allongé](http://leanpub.com/javascript-allonge), [CoffeeScript Ristretto](http://ristrettolo.gy), and [Kestrels, Quirky Birds, and Hopeless Egocentricity](http://combinators.info).

### index

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% unless post.categories contains "noindex" or post.categories contains "posterous" or post.categories contains "homoiconic" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%B %e, %Y" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

### homoiconic reposts

<div class="related">
  <ul>
    {% for post in site.categories.homoiconic %}
      {% unless post.categories contains "noindex" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

### posterous reposts

<div class="related">
  <ul>
    {% for post in site.categories.posterous %}
      {% unless post.categories contains "noindex" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>