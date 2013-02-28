---
title: index.html
layout: tactile
---

### about

This is the new technical weblog for [Reginald "raganwald" Braithwaite](http://braythwayt.com), author of [JavaScript Allongé](http://leanpub.com/javascript-allonge), [CoffeeScript Ristretto](http://ristrettolo.gy), and [Kestrels, Quirky Birds, and Hopeless Egocentricity](http://combinators.info).

### recent writing

<div class="related">
  <ul>
    {% for post in site.posts %}
    <li>
<span>{{ post.date | date: "%B %e, %Y" }}</span> <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
    {% endfor %}
  </ul>
</div>