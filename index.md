---
title: Reginald Braithwaite
layout: default
---

> Reginald "Raganwald" Braithwaite is proof that somewhere, a village is missing its idiot. Either that, or a combinatory forest is missing its Idiot Bird, nobody is really sure. His interests include constructing surreal numbers, deconstructing hopelessly egocentric nulls, and celebrating the joy of programming.

### elsewhere

* code: <a href="https://github.com/raganwald">https://github.com/raganwald</a>
* contact: <a href="mailto:reg@braythwayt.com">reg@braythwayt.com</a>
* conferences: <a href="http://lanyrd.com/profile/raganwald/">http://lanyrd.com/profile/raganwald/</a>

### featured video

<iframe width="560" height="315" src="https://www.youtube.com/embed/uYcAjr2J_rU" frameborder="0" allowfullscreen></iframe>

<p>&nbsp;</p>

### featured books

<table>
  <tr>
    <td><iframe width="160" height="400" src="https://leanpub.com/javascript-spessore/embed" frameborder="0" allowtransparency="true"></iframe></td>
    <td><iframe width="160" height="400" src="https://leanpub.com/javascript-allonge/embed" frameborder="0" allowtransparency="true"></iframe></td>
    <td><iframe width="160" height="400" src="https://leanpub.com/coffeescript-ristretto/embed" frameborder="0" allowtransparency="true"></iframe></td>
  </tr>
</table>

### recent words

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%sY'}}{% endcapture %}
      {% assign postyear = postyear | plus: 0 %}
      {% unless post.tags contains "noindex" or post.tags contains "posterous" or post.tags contains "homoiconic" or postyear < 2014> %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y-%m-%d" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
  </ul>
</div>

### featured presentation

<script async class="speakerdeck-embed" data-slide="2" data-id="20a98ac01cff01321db1664d3453dee6" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

<p>&nbsp;</p>

[w]: ./2011/11/01/williams-master-of-the-comefrom.html

### older words

<div class="related">
  <ul>
    {% for post in site.posts %}
      {% capture postyear %}{{post.date | date: '%sY'}}{% endcapture %}
      {% assign postyear = postyear | plus: 0 %}
      {% unless post.tags contains "noindex" or post.tags contains "posterous" or post.tags contains "homoiconic" or postyear > 2013> %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y-%m-%d" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
    {% for post in site.tags.homoiconic %}
      {% unless post.tags contains "noindex" %}
        <li>
          <a href="{{ post.url }}">{{ post.title }}</a> (<span>{{ post.date | date: "%Y" }}</span>)
        </li>
      {% endunless %}
    {% endfor %}
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