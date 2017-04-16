---
title: "Turing Machines and Tooling, Part II"
layout: default
tags: [allonge]
---

[![monk at work](/assets/images/Scriptorium-monk-at-work.jpg)](https://commons.wikimedia.org/wiki/File:Scriptorium-monk-at-work.jpg)

*Note well: This is an unfinished work-in-progress.*

---

# Turing Machines and Tooling, Part II

Much is made of "functional" programming in JavaScript. People get very excited talking about how to manage, minimize, or even eliminate mutation and state. But what if, instead of trying to avoid state and mutation, we _embrace_ it? What if we "turn mutation up to eleven?"

We know the rough answer without even trying. We'd need a lot of tooling to manage our programs. Which is interesting in its own right, because we might learn a lot about tools for writing software.

So with that in mind, we began in [Part I] by looking at a simple Turing Machine, the "a-machine," and then built a more expressive version, the "sequence-machine." we saw that we could implement the sequence-machine either by upgrading the a-machine with new capabilities, or by compiling programs written for the sequence-machine into programs written for the a-machine.

[Part I]: http://raganwald.com/2017/04/06/turing-machines.html

We ended [Part I] by suggesting that as we added even more complexity, the compiler approach would help us manage that complexity, despite the compiler being mroe complicated to implement than the additions we made to the a-machine's code. Let's follow through and add more power to our machine.

---

### notes


