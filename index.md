---
title: index.html
layout: default
---

### about

Texhnical essays by [Reginald "raganwald" Braithwaite](http://braythwayt.com), author of [JavaScript Allongé](http://leanpub.com/javascript-allonge), [CoffeeScript Ristretto](http://ristrettolo.gy), and [Kestrels, Quirky Birds, and Hopeless Egocentricity](http://combinators.info).

### index

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% unless post.tags contains "noindex" or post.tags contains "posterous" or post.tags contains "homoiconic" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y-%m-%d" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

### homoiconic reposts

<div class="related">
  <ul>
    {% for post in site.tags.homoiconic %}
      {% unless post.tags contains "noindex" %}
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
    {% for post in site.tags.posterous %}
      {% unless post.tags contains "noindex" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>