---
title: Twenty Thirteen
layout: default
---

## Why I've moved back to proper blogging, and how I'm using Github Pages to do it

A little more than four years ago, I tried an experiment: On October 27, 2008 I pushed [some text in markdown format](https://Github.com/raganwald/homoiconic/blob/master/2008-10-27/unfold.markdown) to Github, and a new kind of bloggy thing called [Homoiconic](https://Github.com/raganwald/homoiconic) was born.

As a blog, it was lame. Markdown is seriously limited as a word processor. Github prevented me from doing anything interesting with layouts. A repo has terrible indexing of old posts. No comments or JavaScript to embed anything useful. I didn't own my own domain, a serious flaw.

However.

### distraction-free

You know how people have embraced this idea of "distraction-free writing?" Github gave me that, in Spades, doubled and redoubled with an overtrick. Markdown is inherently distraction-free, there's only so much you can do with it, and if you want more you just have to say no to yourself and keep writing.

The workflow was a little geeky, but no worse than using SFTP or some weird proprietary blog engine web application. And it's kind of my job to use git, so I can't really complain about that.

And my world was changing. Fewer and fewer of my readers were "subscribing" to my blog via RSS. I was getting my "hits" through Reddit and Hacker News and other people's tweets and so on. It seemed like a win to me, so I gave it a try, especially for anything code-u-macated.

### posterous

A while later, Posterous launched. The best thing about Posterous was the workflow: Send an email. The worst thing about Posterous was that once you sent that email, you could format your posts with HTML and fancy styles. I tried it, loved the post-by-email, hated the fact that I would often fiddle with formatting.

One of the nice things about markdown is that it is what it is. There's very little need to fiddle with anything except the actual words and ideas. Time passed, and Posterous got bought by Twitter, and now they're shutting down. Boo hoo.

### and now...

In the last twelve months or so, I've been embracing [Github Pages](http://pages.github.com) for some projects. In exchange for fiddling with a domain registrar, I can host things on my own domains, like:

* [http://allong.es](http://allong.es): A free library of [JavaScript Allongé](https://leanpub.com/javascript-allonge) recipes.
* [http://recursiveuniver.se](http://recursiveuniver.se): An implementation of HashLife, in Literate CoffeeScript.
* [http://oscin.es](http://oscin.es): Combinatory Logic in JavaScript.

I'm even hosting free versions of some of my books:

* [http://combinators.info](http://combinators.info): [Kestrels, Quirky Birds, and Hopeless Egocentricity](https://leanpub.com/combinators).
* [http://ristrettolo.gy](http://ristrettolo.gy): [CoffeeScript Ristretto](https://leanpub.com/coffeescript-ristretto).

And with those under my belt, I took the plunge and moved all of my writing from 2013 over to [http://raganwald.com](http://raganwald.com). I'm now using Jekyll to publish my "bloggy thing" to Github. I get the same lame lack of ability to format my posts, but I can now waste time with layouts.

And I get my own domain, that's a win. And the layouts let me do things like pimp my books on every page without doing a global search-and-replace. Or add analytics to the blog. We'll see if I do much more than just post.

### my workflow

I do a more complicated thing with Jekyll on my [http://ristrettolo.gy](http://ristrettolo.gy) site, where I use an asset pipeline to compile CoffeeScript. It's a book about CoffeeScript, the interactive behaviour should be written in CoffeeScript!

But here on [http://raganwald.com](http://raganwald.com), I use the basic (and free) Jekyll behaviour built into Github Pages. That means absolutely no Jekyll plugins. Which suits me fine.

New posts go into a `_posts` folder, with a special name. This one is `2013-02-20-twenty-thirteen.md`. The top of each post has some YAML junk:

{% highlight yaml %}
---
title: Twenty Thirteen
layout: default
---
{% endhighlight %}

If both of those things are set up correctly, the post is automatically published when I push to Github. It's poured into the "tactile" layout, and the resulting HTML is available at  [http://raganwald.com/2013/02/20/twenty-thirteen.html](http://raganwald.com/2013/02/20/twenty-thirteen.html). I can preview my work by running `jekyll` on the command line, `jekyll --auto` if I want it to rebuild the site locally whenever it detects changes, or `jekyll --server 3333` if I want to run a preview web server on port 3333.

But building locally is optional. The site is rebuilt by Github when I push and that's what's published to the web.

### benefits

Like the old thing, I get the ability to ask for pull requests. That's huge, I get a lot of good corrections that way.

I guess I could embed Disqus comments if I wanted to, but I enjoy outsourcing discussion to Hacker News, Reddit, or wherever. Let *them* play whack-a-mole with incivility.

I am not one of these super-bloggers with his own community. There are people who like my writing, and that's great, but it's a win for everyone if the comments praising my writing are alongside those pointing out where it could be, um, "even better." I think there's more of that when people discuss things elsewhere.

I get one-click publishing, I just have to click in a Github client rather than on some web abomination.

I get a complete edit history. It's git!

Overall, I think this is going to go well.

### my setup

Following Github's instructions, I registered my domain and configured the DNS to resolve to Github's servers at `204.232.175.78`. That takes anywhere from a few hours to a few days before a new domain starts 404-ing at Github, showing that the DNS is set up properly.

For each top-level domain, you have two choices. First, and most complicated, you need a fresh Github account with a special repo. For example, you can set up `whizzbang2000` as a Github free account and then create a repo `whizzbang200.github.com`. I then give my `raganwald` account collaboration privileges and we're off to the races. For [http://raganwald.com](http://raganwald.com), I'm already the guy, so there's no need to set up a separate account.

Second, you can set up an ordinary repo under your own account, but your site must be in the `gh-pages` branch. That's what most people do if they have more than one site to manage.

I drop a `CNAME` file into the repo. For [http://raganwald.com](http://raganwald.com), the file contains the text `raganwald.com`. Once you push that, Github starts resolving hits to `raganwald.com` to whatever you are publishing. You could drop an index.html file in there, or an index.md with some YAML to tell Github how to build it, or go wild with Liquid Tags, it's up to you.

A nice thing about Jekyll is that you can control the Markdown rendering with the `_config.yaml` file:

{% highlight yaml %}
pygments: true
lsi: false
safe: false
markdown: kramdown
exclude: config.rb, README.md
{% endhighlight %}

As you can see, I've turned pygments on to do source highlighting. I also use Kramdown because that's what Leanpub uses when it renders my books, so I want the maximum possible compatibility between the two. And I like being able to use footnotes.[^pg]

[^pg]: Paul Graham has suggested that I can cut down my wordiness by moving a lot of non-core observations into footnotes. He may have something there.

And that, as they say, is that. This is where I'm going to be doing my "raganwald" tech blogging for the next little while. I'll guess four years, since that's about how long it is before the world changes enough to warrant throwing it all out and starting over.

> "You know why I don't play ballads any more? Because I love to play ballads"--Miles Davis

([discuss](http://news.ycombinator.com/item?id=5253592))

### post scriptum

Here is some Jekyll Templating embedded in a markdown file, just to show that if you want to do some yak-shaving, you can. This is a list of posts, dynamically generated:

<div class="related">
  <ul>
    {% for post in site.posts %}
    <li>
<span>{{ post.date | date: "%B %e, %Y" }}</span> <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
    {% endfor %}
  </ul>
</div>

### end note
