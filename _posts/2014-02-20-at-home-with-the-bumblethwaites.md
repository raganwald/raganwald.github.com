---
layout: default
tags: [spessore]
title: "At home with the Bumblethwaites"
---

The word "inheritance" is widely used when talking about object-oriented programming. People will say things like "Objects inherit methods from classes," or perhaps "Subclasses inherit behaviour from superclasses," and sometimes they won't even say what is being inherited: "Cow inherits from Ungulate."

Although languages each provide their own unique combination of features and concepts, There are some ideas common to all object-oriented programming that we can grasp and use as the basis for writing our own programs. Since "inheritance" is a metaphor, we'll explain these concepts using a metaphor. Specifically, we'll talk about a family.

![at home with the braithwaites](/assets/images/braithwaites.jpg)

Consider a fictitious person, Amanda Bumblethwaite. Amanda was born "Amanda Braithwaite," but changed surnames to "Bumblethwaite" in protest against a well-known author of programming books. Amanda has several children, one of whom is Alex Bumblethwaite.

Alex is underage, and there are many questions that Alex would defer to Amanda, such as "Can Alex go on a school trip?" Both Amanda and Alex write software programs, Amanda is a web developer, and Amanda taught Alex how to program Lego Mindstorms, just as Amanda is teaching programming to all of Alex's siblings. All of the Bumblethwaites live in a house together.

What can we say about the Bumblethwaites?

### constructors

First, we can say that *Amanda is Alex's constructor*. Amanda provides 50% of the blueprint for making Alex, and Amanda actually carried out the work of bringing Alex into existence. (We'll hand-wave furiously about David Bumblethwaite's role.)

### formal classes

Second, we can say that "Bumblethwaite" is a *formal class*. Amanda is a member of the Bumblethwaite class, and so is Alex. The formal class itself has no physical existence. Amanda has a physical existence, and there is an understanding that all of Amanda's children are necessarily Bumblethwaites, but the concept of "Bumblethwaite-ness" is abstract.

### expectations

Because Amanda teaches all of her children how to program, knowing that Alex is a Bumblethwaite, we expect Alex to know how to program. Knowing that the Bumblethwaite live at a certain address, knowing that Alex is a Bumblethwaite, we expect Alex to live in the family house.

### delegation

Alex *delegates* a lot of behaviour to Amanda. For example, if a school chum invites Alex for a sleep-over, Alex delegates the question to Amanda to answer.

### ad hoc sets

While it's true that all Bumblethwaites are programmers, the concept of "being a programmer" is different than the concept of "being a Bumblethwaite." Membership in the "set of all programmers" is determined empirically: If a person programs, they are a programmer. It is possible for someone who doesn't program to become a programmer.

Membership in "The Bumblethwaites" is a more formal affair. You must be born a Bumblethwaite, and issued a birth certificate with "Bumblethwaite" on it. Or you must marry into the Bumblethwaites, again getting a piece of paper attesting to your "Bumblethwaite-ness."

Where "Bumblethwaite" is a formal class, "Programmer" is an ad hoc set.

### five things

These five ideas--constructors, formal classes, expectations, delegation, and ad hoc sets--characterize most ideas in object-oriented programming. Each programming language provides tools for expressing these ideas, although the languages tend to use the same words in slightly different ways. For example:

JavaScript provides objects, functions and prototypes. The `new` keyword allows functions to be used as constructors. Prototypes are used for delegating behaviour. Just as Alex delegates behaviour to Amanda *and* Amanda constructs Alex, it is normal in JavaScript that a function is paired with a prototype to produce, through composition, an entity that handles construction and delegation of behaviour.

"Classic" JavaScript does not have the notion of a class, but JavaScript programmers refer to such compositions as classes. JavaScript provides the `instanceof` operator to test whether an object was created by such a composite function. `instanceof` is a leaky abstraction, but it works well enough for treating constructer functions as formal classes.

All that being said, JavaScript does not enforce any constraints around formal classes. There is no "type checking" to ensure that only Bumblethwaites are programmers, for example. Like many dynamic languages, JavaScript treats its "classes" as informal tools for structuring construction and delegation.

Whereas, Ruby provides objects and has a very strong notion of classes: Ruby classes are rich objects in their own right, with many methods for inspecting and modifying the behaviour of objects. Ruby classes are constructors, and objects are created using a `new` method on the class in conjunction with an `initialize` method delegated from the instance to the class.

In one sense, Ruby's classes are very different from JavaScript's classes. But stepping back, in many important ways they are exactly the same. Although you can explicitly test membership with the `instance_of?` method, The language as a whole works on the basis of ad hoc polymorphism: If you write a method that operates on programmers, any programmer will do. There is no way to enforce that a method operates only on Bumblethwaites.

There are other kinds of languages. Java is a *manifestly typed* language. It has classes that handle construction and delegation, just like JavaScript and Ruby. But its classes are formal classes as well: You can write a method that operates on Bumblethwaites, and the compiler checks that you are only working with Bumblethwaites.

There is no reasonable way to have a method that works on programmers that will work with anything that happens to program. You have to create a formal class or interface. Speaking of which, Java's interfaces combine the formal class concept with formalizing expectations. While Ruby and JavaScript have informal expectations, Java codifies them.

![humpty dumpty](/assets/images/humpty-dumpty.gif)

### terminology

Programming is a pop culture. It's informed by practitioners that innovate faster than formal education can keep up. Thus, words like "inheritance," "class," and "interface" can have specific formal meanings to computer scientists that differ substantially from the informal meanings programmers ascribe to them.

"Class" is probably the most overloaded example. A class can be a kind of metaobject (as you find in SmallTalk or Ruby) responsible for construction and delegation. It can be a formal class (as you find in Java or C#). It can be a keyword that has no runtime existence (as you find in CoffeeScript or JavaScript ES6), or it can be a pattern for composing constructors with prototypes (as you find in ordinary JavaScript).

The notion of a "class" is usually loosely bound to the notion of expectations: If something is a "Bumblethwaite," here's what we can rely on it to be or do. Different languages have different ways of expressing or enforcing the relationship between class and expectation, whether it be a compiler checking variable types, a suite of tests, or even assertions and guards bound to function calls in design-by-contract programming style.

In the end, it is not the words that matter so much as the mastery of the underlying concepts: Constructors, formal classes, expectations, delegation, and ad hoc polymorphism.