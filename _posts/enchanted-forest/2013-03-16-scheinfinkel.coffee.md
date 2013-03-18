---
layout: default
tags: [coffeescript, combinators]
title: Schönfinkel's Forest
categories: enchanted-forest
permalink: /enchanted-forest/scheinfinkel.html
---

Previous: [A long time ago, in a village far, far away](/enchanted-forest/a-long-time-ago-in-a-village-far-far-away.html)

---

Moses spoke, preening himself proudly:

### songbirds

"All of us songbirds are descended from common ancestors. We have evolved various differences to suit our micro-habitats and temperaments, but we share a common behaviour. Each of us has a song we like to sing to attract a mate or warn others of our territory or communicate our feelings. We are sensitive to subtle variations in tone and pitch.

"But each of us has our own unique song. Mine, for example, brings to mind the sparkle of the sun on the water in a babbling brook."

And here Moses let out a raucous and intemperate cawing. Maude politely smiled. "Most scintillating!" she said, and Moses continued.

"Chicks learn the songs of their parents, and as they mature they develop their own song that is a combination of the songs their parents sing. One of the things I am researching is the connection between songs and variations. I conjecture that there are more possible songs than grains of sand on a riverbank.

"But my main interest is another thing. Each of us, when we hear the song of some bird, will call back the song of another bird. We are mostly great mimics. So if you sing to me the song of a Bluebird, I might sing back the song of a Robin. We all have our own particular habits of responses, and we are always consistent.

"If indeed I do respond to the song of a Bluebird with the song of a Robin, you can trust me to always respond to the song of a Bluebird with the song of a Robin. Now we are very aware of the birds in this forest, so I can tell you that if a you call out to a bird and it responds with a song, it is responding with the song of a bird that actually exists in the forest. And furthermore, every bird responds to every song of another bird.

"To a certain extend, a bird's  personality can be defined once you understand its particular habit of responses to songs. In fact, our entire society is governed by our responses to each other's songs, and my lifelong study has been the rules of behaviour of songbirds.

"For I have discovered that there are rules and that the consequences of these rules lead to some deep and fascinating insights into the nature of thought itself."

Maude thought Moses was very vain and was doubtful that songbirds in a forest held the key to understanding thought itself, but she didn't like to interrupt a good story, so she carried on listening politely.

<a href="http://www.flickr.com/photos/pepemichelle/3642644339/" title="Magnificent Bird of Paradise by mpujals, on Flickr"><img src="http://farm3.staticflickr.com/2435/3642644339_742f2269f8_b.jpg" alt="Magnificent Birds of Paradise"></a>

### the basis

"Look!" said Moses suddenly, "Do you see that?"

Maude saw a bird flying awkwardly through the trees. After several near misses, it ran headlong into a tree and feel to the ground, stunned. It then picked itself up and fluttered off, striking branches as it went.

Moses shook his head sadly. "That idiot!" he said. "Well, I might as well start with him. I would grow tired if I were to constantly say things like 'The song of a Cardinal' or 'The song of an Idiot,' so I will abbreviate matters. When I say that the Idiot's response to the Cardinal is the Cardinal, you will understand me to be speaking of the songs of the birds and that I mean that the Idiot's response to the song of the Cardinal is to sing the Song of the Cardinal."

Maude asked politely: "Is the Idiot's response to the Cardinal an actual Cardinal?"

"Yes," Moses continued, "and in fact, the Idiot's response to any bird's song is to sing that bird's song. He is a most unimaginative vocalist with no long-term memory. Not much more intelligent than a hairy creature."

Maude decided she was not going to allow Moses to malign her species at will. "I don't know where you get these ideas, but we mammals do have a few brains to rub together for warmth," she said. Moses considered.

"Okay," he said, "Here comes the Idiot again. I'd like to hear its own song. What song should I sing to it?"

Maude thought this a very simple question and answered immediately.

### maude's notation

"Very good!" said Moses, "I admit you are smarter than the Idiot, at least, I never could make him understand his own behaviour. But what is that you are scratching in the dust?"

"Oh," Maude explained, "I have a own notation for solving certain types of problems. To being with, I write:"

    describe "idiots", ->

      I = (x) -> x
    
"Meaning, that the Idiot, which I will call I for short, responds to any bird's song, denoted `x`, with that same bird's song, again `x`. I use `x`, `y`, `z`, `w`, and other letters for unknowns."

Maude carried on: "I like to make a note of what things mean with some examples, so I write:"
    
      it "should respond to any bird with the same bird", ->
      
        expect( I('polly') ).toEqual 'polly'

"I thought about it for a while and realized that the Idiot's response to itself must be its own song, so I also wrote:"

        expect( I(I) ).toEqual I
        
"And indeed, that is the case by your rule."

Moses hopped around a bit, staring at her writing for a few moments. "And what do you call this system of writing?"

"CoffeeScript," said Maude, "because when it gets complicated, I need to drink a lot of coffee to work it out by hand."[^cs] She laughed, but stopped when she realized that Moses either did not get the joke or was incapable of understanding humour.

"Actually," she said, "My uncle Brendan[^be] devised a notation for solving certain problems to deal with the appearance and behaviour of web spiders. He called it JavaScript, no doubt because of our family's coffee plantation business. My cousin Jeremy[^jeremy] liked Brendan's ideas, but found them awkward for certain classes of problems and streamlined it somewhat. He called his variation CoffeeScript, and he taught it to me."

[^cs]: These stories are written in [Markdown](http://daringfireball.net/projects/markdown/) and interpreted in place as [Literate CoffeeScript](http://coffeescript.org) files. They are translated to JavaScript and then [jasmine-node](https://github.com/mhevery/jasmine-node) is used to evaluate them as specifications.

[^be]: [Brendan Eich](http://brendaneich.com) is the inventor of JavaScript.

[^jeremy]: [Jeremy Ashkenas](http://www.ashkenas.com) invented CoffeeScript,

"Interesting," said Moses, "I wasn't going to mention it but I have a notation of my own. I would write: `Ia.a`, but if you prefer to use all those symbols, go right ahead."

### the kestrel

Suddenly a raptor swooped down and made a strike at the bumbling Idiot. But the Idiot was saved by its own awkwardness, for the raptor made a strike at where the Idiot out to be flying, but just at that moment the befuddled bird's wingtip was caught in a vine, and the raptor's strike missed.

The Idiot fumbled its way into some brambles and the raptor flew off. "What was that?" asked Maude.

"Ah!" said Moses, "That is a formidable bird, and I tend to refuse invitations to be the guest of honour at its dinner table... That is the Kestrel. It has an interesting behaviour..."
      
"You see," said Moses, "To understand the Kestrel you need to understand *fixation*, or what some call *constancy*. Some birds are such that they only ever respond with the song of a single bird. For example, a certain bird might only ever respond with the song of the Idiot. So if you call out a Bluebird to it, it will respond 'Idiot.' Then you call out 'Cardinal,' and it responds 'Idiot' again."

Maude nodded. "So what," she asked, "Is the significance of the kestrel?" Moses seemed annoyed. "Have some patience, land-crawler!" he snapped, "I was just about to get to that! The significance of the Kestrel is that he knows the song of every fixated bird in the forest!"

Maude must have been staring blankly, for Moses continued: "Meaning, if you call out the Cardinal to the Kestrel, he responds by singing the song of a bird that is fixated on the Cardinal."

Maude held up her hand to ask for time and scratched in the dirt for a bit. After writing and erasing her work for a while, she wrote:

    describe "Kestrels", ->

      K = (x) -> (y) -> x
      
Then she continued with Moses's example:

      it "responds to the Cardinal with a bird fixated on the Cardinal", ->
        
        C = 'Cardinal'
        R = 'Robin'
        B = 'Bluebird'
        FC = K(C)
        
        expect( FC(C) ).toEqual C
        expect( FC(R) ).toEqual C
        expect( FC(B) ).toEqual C
        expect( FC(FC) ).toEqual C
        
### hopeless egocentricity

Maude still didn't see the significance of the Kestrel, so Moses decided to test her intelligence. "Look," he said, "I will share with you something that I learned from the Magnificent Smullyan Bird.[^rs] Even as a chick the Smullyan Bird was magnificent, you could sing a note to him and he would sing back the exact note in perfect pitch.[^note] We expected great things of him and were not disappointed.

"Now it so happens that some birds are such that if you call out their own song to them, they call it right back to you. You saw one such bird, the Idiot. The Smullyan Bird calls such birds *egocentric*. Given the Kestrel and the Idiot, is there another egocentric bird in the forest?"

Maude scribbled with her notes for a few moments and then answered the question. Moses continued:

"The Smullyan Bird would call a bird *hopelessly egocentric* if it was the case that no matter what bird you called out to it, it would call back its own song. In other words, is there a bird that is *fixated on itself* in this forest?"

Maude needed a few more minutes to answer this question.

[^rs]: [Raymond Merrill Smullyan](https://en.wikipedia.org/wiki/Raymond_Smullyan) is an American mathematician, concert pianist, logician, Taoist philosopher, and magician. He has his own [Youtube channel](http://www.youtube.com/profile?user=rsmullyan&view=videos).

[^note]: This story is [taken from the Piano Society and other sources](http://mysite.verizon.net/vzeeaya7/raymondsmullyan/).

---

Next: [Horton Hatches Surreal Numbers](./horton.html)

---

notes: