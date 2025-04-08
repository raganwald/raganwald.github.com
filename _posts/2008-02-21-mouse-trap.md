---
title: "The Mouse Trap"
quote: "A+ story. Can't believe how much this stuff happens."
quoteauthor: "Xichekolas"
tags: [allonge]
---

![Mouse Trap](/assets/mousetrap/mouse-trap.jpg)

---

In the board game [Mouse Trap], players build an elaborate [Rube Goldberg Machine](https://www.rubegoldberg.com/). Wikipedia explains:

> The player turns the crank (A) which rotates the gears (B) causing the lever (C) to move and push the stop sign against the shoe (D), which tips the bucket holding the metal ball (E) which rolls down the stairs (F) and into the pipe (G) which leads it to hit the rod held by the hands (H), causing the bowling ball (I) to fall from the top of the rod, roll down the groove (J), fall into and then out of the bottom of the bathtub (K), landing on the diving board (L). The weight of the bowling ball catapults the diver (M) through the air and right into the bucket (N), causing the cage (O) to fall from the top of the post (P) and trap the unsuspecting mouse (i.e. the player who occupies the spot on the board at that time).

[Mouse Trap]: https://en.wikipedia.org/wiki/Mouse_Trap_(board_game)

Software sometimes suffers from a **Mouse Trap Architecture**, it becomes a chain of fundamentally incompatible components used for purposes far removed from their core competencies, incomprehensibly connected to each other with brittle technologies.

Here is the story of how one such system came about.

---

![Architecture](/assets/mousetrap/architecture.jpeg)

---

## The Project

The project was originally designed by a Business Analyst who had been a DBA in her younger days. One of the key requirements of the system was that it be completely flexible: it was designed to accommodate almost any change in business requirements without reprogramming.

Her approach to designing a program that would be very nearly Turing-complete was to make a data-driven design: nearly none of the business logic was to be written in code, it was to exist in various tables in the database. Changes to business logic would be accomplished by updating the database.

Of course, the application would just be an empty shell, so the actual business analysis would consist of gathering requirements and generating data for the tables. The program was obviously trivial and could be generated in parallel with the business analysis, delivering a huge time saving over her company’s traditional waterfall model where analysis was completed in its entirety before the first line of code was written.

Delighted with this breakthrough methodology, all parties signed off on a seven figure contract and she started by building a large Excel workbook with the business rules, one sheet per table. The plan was to simply export her workbook to CSVs and import them into the database when they were ready to deploy the finished application. And in the mean time, the customer could sign off on the business rules by inspecting the Excel workbook.

Meanwhile, the trivial job of designing a web application for two hundred internal users plus a substantial public site to handle millions of users with unpredictable peak loads was handed off to the Architect. While her [Golden Hammer] was the database, his was XML and Java.

The Architect's first order of business was to whistle up a Visual Basic for Applications script that would export the workbook to XML. From there, he wrote another script that would generate the appropriate configuration files for [Struts](https://struts.apache.org/) in Java. His work done, he moved along to another project, leaving some impressive presentations that delighted the customer immensely.

[Golden Hammer]: https://en.wikipedia.org/wiki/Golden_hammer 'Law of the Instrument'

Implementation being an obvious slam dunk, the company put a few people on the project more-or-less part time while they completed the final easy stages of other delivery projects. Thanks to the company’s signature up-front analysis and rigid waterfall model, they were confident that customer [UAT] and delivery into production on other projects would not generate any meaningful bugs or requirements changes, so the resources would have plenty of time for this new project.

[UAT]: https://en.wikipedia.org/wiki/Acceptance_testing

---

![Hello New Guy](/assets/mousetrap/hello-new-guy.png)

---

## The New Guy

But just to be sure, they hired the New Guy (not to be confused with the [New Girl]). The New Guy had a lot of New Ideas. Generally, his ideas fit into one of two categories: Some were sound but unworkable in the company’s environment, and the others were unsound and still unworkable in the company’s environment.

His early days were marked by attempts to hook up his own wifi so he could surf on his shiny new Tablet PC during meetings, attempts to disconnect the loud pager that would interrupt all programming in the cubicle farm whenever the receptionist was paging a salesperson, and attempts to get the project to fix all bugs on completed features before moving on to write new features.

[New Girl]: https://www.joeydevilla.com/2003/04/07/what-happened-to-me-and-the-new-girl-or-the-girl-who-cried-webmaster/ 'What happened to me and the new girl (or: “The girl who cried Webmaster”)'

When he saw the design of the system, he immediately grasped its deepest flaw: Changes to business requirements in the Excel workbook could cause problems at run time. For example, what if some business logic in Java was written for a Struts action that vaporized when a business rule was rewritten?

Today, we can sympathize with his obsession. He was deeply discouraged by the company’s insistence that development run at full speed developing new features with the actual business of making the features work deferred to UAT at the end of the project. One developer claimed that she had a working dynamic web page switching back and forth between English and Inuktitut, but the English version was generated by a JSP backed by a stub class and the Inuit version was actually a static HTML page. Management gave this a green light to be considered “feature complete” after the customer failed to ask any pertinent questions during the Friday-afternoon-after-a-heavy-steak-lunch-and-before-a-long-weekend demonstration

Depressed and quite pessimistic about the team’s ability to orchestrate Java development in parallel with the rapid changes to the workbook, he came up with the solution: a series of XSLT files that would automatically build Java classes to handle the Struts actions defined by the XML that was built by Visual Basic from the workbook that was written in Excel.

Any changes that were not properly synchronized with the Java code would cause a compiler error, and the team would be forced to update the Java code immediately, instead of ignoring problems until the end of the project.

---

<iframe width="420" height="315" src="https://www.youtube.com/embed/qybUFnY7Y8w" frameborder="0" allowfullscreen></iframe><br/>

---

## Excel >> VBA >> XML >> XSLT >> Java!

The New Guy ripped his phone out of its socket, ignored all emails, and worked around the clock. When management came looking for him, he hid in vacant conference rooms, feverishly tapping away on his tablet. A few days later, he emerged triumphantly with his working build system. Saving a change to the excel workbook automatically generated the XML, which in turn automatically generated the Java classes and rebuilt the entire application, along with regenerating the database tables in a style what would presage Rails migrations.

He presented this nightmare of dependencies and fragile scripts to management and waited for the response. They had shot down every single one of his ideas without exception, and now he was promoting a daring scheme that owed its existence to the proposition that their management style was [craptacular](http://www.urbandictionary.com/define.php?term=craptacular). But he was a man of principle, and was committed to do the right thing in the face of any opposition.

Management wasted no time in responding: *It's Brilliant!* He was obviously far too valuable a resource to waste time on implementation. He was promoted to a Junior Architect role where he could deliver demonstrations to clients. His very first job? To write a white paper explaining the new technology.

Expecting to get the axe, he was shocked by their warm reception. He had failed to realize that management was indifferent to the idea’s actual development value, but had a keen sense of what played well with clients in Enterprise environments. These companies lived and breathed integration between wildly disparate technologies, many of which didn’t work, had never worked, and never would work.

Alas, this is typical of Mouse Trap Architectures everywhere. Built with the best of intentions, they survive for reasons their creators could never have anticipated.

---

![Epilogue](/assets/mousetrap/epilogue.png)

---

## Epilogue

The company adopted the new build scripts immediately and assigned a junior programmer who was working on several other projects to maintain them. Within months they had been dismantled, in no little part because the team hated the idea that every time the business analyst changed the business rules, their Java code that was carefully constructed for a previous version would stop compiling.

The New Guy lasted a few months longer before realizing that his sudden accord with management was illusory, and that nothing really had changed. He has now forsworn his love for static typing and is now wandering a production Ruby code base [muttering about software development](https://raganwald.com/creative-works.html) the way the very old sit in their easy chairs muttering about the government.

All that remains of his work are a few XSL files [somewhere](https://raganwald.com/source/actions.xsl), like old game pieces that are rolling around the bottom of a drawer at the cottage hoping that someone will open a bottle of wine and call for a game of Mouse Trap to pass the time.

---

_The story depicted here is 100% true. Any similarities in tone and style to [The Daily WTF](https://thedailywtf.com) are intentional. Originally published 2008-02-21._
