---
title: Reginald Braithwaite
layout: default
tags: [allonge]
recent: ["2023", "2022", "2021", "2020"]
years: ["2019", "2018", "2017", "2016", "2015", "2014", "2013"]
older: ["2012", "2011", "2010", "2009", "2008"]
---

*This is a repository of essays and presentations by [Reginald "Raganwald" Braithwaite](http://braythwayt.com)*

<iframe width="560" height="315" src="https://www.youtube.com/embed/3t75HPU2c44" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<p><a href="https://www.youtube.com/watch?v=3t75HPU2c44">JavaScript Combinators, the &ldquo;six&rdquo; edition</a> from <a href="https://devconf.pl">DevDay 2016</a>.</p>

ℹ️: [Reginald "raganwald" Braithwaite](http://braythwayt.com)  
📫: <a href="mailto:reg@braythwayt.com">reg@braythwayt.com</a>
🐘: <a href="https://social.bau-ha.us/@raganwald">social.bau-ha.us/@raganwald</a>  
👨‍💻: <a href="https://github.com/raganwald">https://github.com/raganwald</a>  
📚: <a href="https://leanpub.com/u/raganwald/">https://leanpub.com/u/raganwald/</a>  
🎤: <a href="http://braythwayt.com/talks.html">http://braythwayt.com/talks.html</a>

---

### Free Downloads

* <a href="/assets/javascriptallongesix.pdf">JavaScript Allongé, The "Six" Edition</a>;
* An antiquarian edition of <a href="/assets/coffeescript-ristretto.pdf">CoffeeScript Ristretto</a>.

---

### This Decade

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

{% for sectionyear in page.years %}

### {{ sectionyear }}

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

### selected older essays

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

This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a> except where copyright is otherwise asserted.

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a>
