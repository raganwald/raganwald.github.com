---
title: Reginald Braithwaite
layout: default
---

> Reginald "Raganwald" Braithwaite is proof that somewhere, a village is missing its idiot. Either that, or a combinatory forest is missing its Idiot Bird, nobody is really sure. His interests include constructing surreal numbers, deconstructing hopelessly egocentric nulls, and celebrating the joy of programming.

Author of:

* [JavaScript Spessore](http://leanpub.com/javascript-spessore)
* [JavaScript Allongé](http://leanpub.com/javascript-allonge)
* [CoffeeScript Ristretto](http://leanpub.com/coffeescript-ristretto)
* [Kestrels, Quirky Birds, and Hopeless Egocentricity](http://leanpub.com/combinators)

And host of:

* [allong.es](http://allong.es): Functional Utility Belt for JavaScript/CoffeeScript.
* [recursiveuniver.se](recursiveuniver.se): HashLife implementation of Conway's Game of Life.
* [oscin.es](oscin.es): Combinatory Logic in JavaScript.

[w]: ./2011/11/01/williams-master-of-the-comefrom.html

Other links:

* code: <a href="https://github.com/raganwald">https://github.com/raganwald</a>
* contact: <a href="mailto:reg@braythwayt.com">reg@braythwayt.com</a>
* conferences: <a href="http://lanyrd.com/profile/raganwald/">http://lanyrd.com/profile/raganwald/</a>

### videos

|<script async class="speakerdeck-embed" data-id="90e12450cecb0131a8cd564ad4407ede" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>|https://speakerdeck.com/raganwald/javascript-combinators|https://speakerdeck.com/raganwald/invent-the-future-dont-recreate-the-past|

### words

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

### older words

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

This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a>