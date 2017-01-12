---
title: Reginald Braithwaite
layout: default
tags: [allonge]
---

*This is a repository of essays and presentations by [Reginald "Raganwald" Braithwaite](http://braythwayt.com)*

<iframe src="https://player.vimeo.com/video/153097877" width="600" height="337" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

<p><a href="https://vimeo.com/153097877">JavaScript Combinators, the &ldquo;six&rdquo; edition</a> from <a href="https://vimeo.com/ndcconferences">NDC Conferences</a> on <a href="https://vimeo.com">Vimeo</a>.</p>

### elsewhere

* about: [Reginald "raganwald" Braithwaite](http://braythwayt.com)
* contact: <a href="mailto:reg@braythwayt.com">reg@braythwayt.com</a>
* code: <a href="https://github.com/raganwald">https://github.com/raganwald</a>
* books: <a href="https://leanpub.com/u/raganwald/">https://leanpub.com/u/raganwald/</a>
* talks: <a href="http://braythwayt.com/talks.html">http://braythwayt.com/talks.html</a>

### 2017 essays

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear != "2017" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a>
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

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

### older essays

<div class="related">
  <ul>
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%Y'}}{% endcapture %}
      {% unless post.tags contains "noindex" or postyear == "2015" or postyear == "2016" %}
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
