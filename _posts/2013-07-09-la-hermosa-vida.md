---
layout: default
tags: [allonge, funjs, noindex]
---

<a href="http://www.flickr.com/photos/98629760@N06/9242551800/" title="spainjs_050 by spainjs, on Flickr"><img src="http://farm3.staticflickr.com/2826/9242551800_3625545180_z.jpg" width="640" height="427" alt="spainjs_050"></a>

*On stage at [SpainJS]*

On July 5th, 2013, I had the privilege of giving a talk at SpainJS called "La Hermosa Vida." SpainJS is a regional conference that emphasizes a laid-back, casual atmosphere and is dedicated to promoting the JavaScript "scene" in Spain. I was given some advice by a friend: The audience will be hungry for technical information they can use.

[SpainJS]: http://spainjs.org

### keynotes

I was happy to hear this. I have been invited to give a few keynote talks, and keynotes are usually supposed to be inspirational talks designed to get the audience hungry and in the mood for the speakers to follow.

It's ironic: Keynote speakers are supposed to be these prestigious people and everyone acts like the keynote is a must-see at any conference, but my observation is that giving a keynote is a lot more like being the opening act at a music festival.

I never get close, but I use Richie Havens as my inspiration. He was the opening act at Woodstock, and although he tried to play a few songs and get off the stage, the audience was so enthusiastic he played until he and the band ran out of material.

<iframe width="640" height="360" src="//www.youtube-nocookie.com/embed/W5aPBU34Fyk?rel=0" frameborder="0"> </iframe>

*Richie Havens opening Woodstock, 1969*

### composing my talk

So, I was getting a promotion from "keynote" to "talk." Great! I then wondered, what should my talk be about? Michael Fogus had just published [Functional JavaScript with Underscore][funjs], and followed that up by collaborating with Jeremy Ashkenas to create [Underscore-Contrib]. Perhaps it was a good time to talk about writing JavaScript in a functional style?

[funjs]: http://www.amazon.com/dp/1449360726/ref=as_li_ss_til?tag=raganwald001-20
[Underscore-Contrib]: https://github.com/documentcloud/underscore-contrib

I didn't want to fall into the trap of discussing generalities. An actual code example would be necessary. I was looking for something big enough to include a range of techniques, but not so complicated that it would be hard to follow.

I also wanted to make sure there was something visual for the audience to identify with. Last year, I wrote [recursiveuniver.se], an implementation of [HashLife] written in [The Williams Style]. It  contained a fairly comprehensive implementation of the algorithm, right down to cache eviction so that it could handle universes with very high entropy.

[recursiveuniver.se]: http://recursiveuniver.se]
[The Williams Style]: /2011/11/01/williams-master-of-the-comefrom.html
[HashLife]: https://en.wikipedia.org/wiki/Hashlife

As a result, recursiveuniver.se has a lot going on. That's great for its purpose, because it is meant to be read and studied. The whole point is to take something with a fair bit of complexity and tame it with a highly literate style.

Unfortunately, it's hard to squeeze something like that through the narrow bandwidth of a talk. Slides on a screen show much less information than a page of code on a monitor. Viewers can't flip back and forth to re-read sections. If you look at successful technical talks, it's surprising how *little* code is shown.

Katrina Owen does a great talk about refactoring:

<iframe src="http://www.slideshare.net/slideshow/embed_code/13358779" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC;border-width:1px 1px 0;margin-bottom:5px" allowfullscreen webkitallowfullscreen mozallowfullscreen> </iframe>

*[Therapeutic Refactoring] by Katrina Owen*

[Therapeutic Refactoring]: http://kytrinyx.com/therapeutic-refactoring

Two hundred and eighty-seven slides. One method. Fourteen lines of code. Somehow, I doubt I can discuss 