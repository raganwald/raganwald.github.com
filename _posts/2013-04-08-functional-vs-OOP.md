---
layout: default
title: When FP? And when OOP?
tags: [management, programming]
---

Very roughly speaking, functional programming ("FP") and object-oriented programming ("OOP") have similar levels of expressive power and similar abilities to encapsulate programs into smaller parts that can be combined and recombined.

The biggest difference between the two "schools of thought" concerns the relationship between data and operations on the data.

The central tenet of OOP is that data and the operations upon it are tightly coupled: An object owns its data and it owns the implementation of the operations on the data. It hides those from other objects via its interface, a collection of methods or messages it responds to. Thus, the central model for abstraction is the data itself, hidden as it is behind a small API in the form of its interface.

The central activity in OOP is composing new objects and extending existing objects by adding new methods to them.

The central tenet of FP is that data is only loosely coupled to functions. You can write different operations on the same data structure, and the central model for abstraction is the function, not the data structure. Functions hide their implementation, and the language's abstractions speak to functions and they way they are combined or expressed, such as generic functions or combinators.

The central activity in FP is writing new functions.

> In a fight between a bear and an alligator, the terrain determines the outcome.

So when is one more appropriate than the other? As this is a practical blog, I will hand-wave all theoretical considerations such as the ability to mechanically reason about code and think of the grubbiest of real-world pragmatic considerations, writing business code in an environment where there is too much to do with inadequate resources in not enough time.

Is one of these two models the overwhelming "winner" in the business environment? Think carefully, take your time. I'll go and press myself an Espresso while you think it over...


[![](http://dieselsweeties.com/hstrips/0/3/2/7/03279.png)](http://dieselsweeties.com)

---

Of course, the answer is, *business programming is dominated by the functional model, not the OO model.* Does this seem like a surprising answer? Only if you are thinking solely of Java, C++, C#, and Ruby.

When you think of it, all that "OO" is usually a thin skin over access to various databases that support SQL, a very functional language. While it is possible to manage a database such that all access to its tables is done through PL/SQL stored procedures, this usually creates a severe programming bottleneck for very little real gain.

The main benefit of a relational database is that it can handle future requirements. When you need new reports, you just write them. Many different applications can talk to the same database. Constraints can be applied programmatically to enforce consistency across all applications.

If you step back, you see that a database is a big data structure, and the applications are bundles of operations acting upon it. The heart of nearly every business application is a big functional database, a data structure with operations acting upon it.

---

And yet, we embrace objects in our applications. Is this just fashion? Or is there something fundamentally different about what we need to do when writing applications and what we need to do when writing databases?

The answer lies in what OO makes easy and what databases make easy.

A well-crafted OO architecture makes changing the way things are put together easy. All that hiding and decoupling allows you to change the relationships between things easily. OO does not make adding new operations particularly easy, you see this whenever you find yourself muttering about "double dispatch and visitors."

But if you have a business process for placing an order that is being refactored to handle new business rules, this is where OO shines. Those things that don't need to know about the change are insulated from those that do.

On the other hand, a well-crafted database makes adding new queries and operations easy. It handles the case where you need to look at the data in new ways or add new kinds of updates to the data. Client applications are decoupled from issues like indexing for performance. 

It doesn't make changing the relationships easy. If you change the management structure such that you go from one manager per report to a many-to-many matrix management structure, that change will break a lot of applications.

So if we had all the things that need to be in business software written on cards, those that represent long-term, relatively changeless relationships go in the database, while those that represent short-term operations that evolve and change over time go in the application.

The stack of application entities is usually four times higher than the stack of database entities, but that's as it should be. Things do change, businesses are supposed to learn, grow and evolve.

---

So what about FP as we usually mean it, code written in a functional style within multi-paradigm languages? What about simply organizing OO programs as collections of operations acting on relatively static data structures?

This is always appropriate, although once again priority must be given to considering the relative longevity of the relationships. Those that are unlikely to change but are subject to being operated upon by a changing cast of entities should be written in a more functional style, while those things that change relatively often can be written in an OO style.

If every manager has one or more reports, and every report has exactly one manager, there is little to be gained by hiding this relationship behind an API where manager objects delegate operations invisibly. This relationship could be better constructed as data with operations acting on it.

But a rule about shipping costs is likely to change, and it should be encapsulated as much as possible to insulate the rest of the program against future alterations.

Good software is written in both styles, because good software has more than one need to satisfy.