---
title: index.html
layout: default
---

Technical essays by Reginald "raganwald" Braithwaite, author of:

* [JavaScript Spessore](http://leanpub.com/javascript-spessore)
* [JavaScript Allongé](http://leanpub.com/javascript-allonge)
* [CoffeeScript Ristretto](http://leanpub.com/coffeescript-ristretto)
* [Kestrels, Quirky Birds, and Hopeless Egocentricity](http://leanpub.com/combinators)

And host of:

* [allong.es](http://allong.es): Functional Utility Belt for JavaScript/CoffeeScript.
* [ristrettolo.gy](http://ristrettolo.gy): CoffeeScript Ristretto online.
* [combinators.info](http://combinators.info): Kestrels, Quirky Birds, and Hopeless Egocentricity online.
* [recursiveuniver.se](recursiveuniver.se): HashLife implementation of Conway's Game of Life.
* [oscin.es](oscin.es): Work in Progress on Combinatory Logic in JavaScript.

[w]: ./2011/11/01/williams-master-of-the-comefrom.html

Other links:

* email: reg@braythwayt.com
* github: https://github.com/raganwald
* lanyrd: http://lanyrd.com/profile/raganwald/

### essays

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

### selected reposts of earlier works

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

### conference bio

> "Raganwald" is proof that somewhere, a village is missing its idiot. Either that, or a combinatory forest is missing its Idiot Bird, nobody is really sure. His interests include constructing surreal numbers, deconstructing hopelessly egocentric nulls, and celebrating the joy of programming.

### disclaimer

Nothing written here represents the opinions of any person, group, or organization, except by coïncidence. These essays may represent actual experience, speculation, or even a vigorous advocacy of a position opposite to the author's beliefs and experience.