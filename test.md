---
title: Reginald Braithwaite
layout: default
tags: [allonge]
---

*This is a repository of essays and presentations by [Reginald "raganwald" Braithwaite](http://braythwayt.com)*

<canvas width="600" height="337" id="viewport"></canvas>

### elsewhere

* about: [Reginald "raganwald" Braithwaite](http://braythwayt.com)
* contact: <a href="mailto:reg@braythwayt.com">reg@braythwayt.com</a>
* code: <a href="https://github.com/raganwald">https://github.com/raganwald</a>
* books: <a href="https://leanpub.com/u/raganwald/">https://leanpub.com/u/raganwald/</a>
* conferences: <a href="http://lanyrd.com/profile/raganwald/">http://lanyrd.com/profile/raganwald/</a>

### 2016 essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != "2016" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

### 2015 essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != "2015" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

### talks

* [Invent the future, don't recreate the past](http://youtu.be/uYcAjr2J_rU) [39:16]
* [I have a good feeling about this](https://vimeo.com/76141334) [43:15]
* [The Rebellion Imperative](https://vimeo.com/53265664) [1:12:58]
* The Art of the JavaScript Metaobject Protocol
  * [Part I: Combinators](https://vimeo.com/97408202) [54:55]
  * [Part II: Metaobjects](https://vimeo.com/97415345) [58:06]
  * [Part III: Adaptors](https://www.youtube.com/watch?v=hp7sgLVepF8) [26:29]

### older essays

<div class="related">
  <ul>
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear == "2015" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
  </ul>
</div>

This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a>
