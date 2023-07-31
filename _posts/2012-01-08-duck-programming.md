---
title: "Duck Programming"
tags: [allonge]
---

Prior to joining Unspace Interactive, one of our developers worked on an “interesting” project, a project that taught them many lessons. One of those lessons was to beware of “duck programming.” Before we explain that term, let’s have a look at the project and get a feel for what the designers were trying to accomplish.[^0]

# Prelude: the Project

One of project’s key requirements of the system was that it be flexible enough to accommodate almost any change in business requirements “without reprogramming.” The team decided to build a data-driven rules engine. Most of the business logic was to be encoded as rows in database tables. Changes to business logic would be accomplished by updating the database. The system would read the rows and use their contents to decide what to do.

The system controlled the auditing of apprenticeship programs such as cooking, automobile repair, and plumbing. The system would track all the apprentices in the various programs as well as the educational institutions and working organizations that trained apprentices on the job.

The “rules” for completing an apprenticeship program are elaborate and vary with each program. Those rules do change from time to time, and the designers of the program imagined that the ministry overseeing the apprenticeships would update the rules on the live system on administration screens, and the system would store the rules in the database.

A similar design was imagined for controlling the ministry’s case workers and offices. Each case worker would be tracked along with the individuals or institutions they were auditing. A workflow system was envisaged that would assign audits to offices, case workers and managers.

For example, when a new restaurant was added to the system, a case would be opened at a nearby office, and assigned to a caseworker. The caseworker would visit the office and check that the qualified instructing chefs were employed there. The caseworker would also do an inventory of equipment and facilities, and the system would validate such things as that pastry apprentices work under a proper pastry chefs in kitchens with ovens. And those rules could all be changed at any time in response to changing regulations or practices by the ministry.

The team’s management decided that since the application would just be an empty shell, the actual business analysis would consist of gathering requirements and generating data for the tables. The software itself was obviously trivial[^1] and could be generated in parallel with the business analysis, delivering a huge time saving over her company’s traditional waterfall model where analysis was completed in its entirety before the first line of code was written.

Alas, the project was not the success its customers, managers, and architects expected. There were many reasons it never lived up to their rapturous expectations, but one stands above the others: The success of the system rested on correctly configuring the various tables that controlled its rules engines, but there was very little time, attention, or process devoted to configuration.

The team failed to recognize that they were going to be doing a lot of *duck programming*.

# What is Duck Programming?

Duck Programming is any configuration that defines or controls mission-critical behaviour of a software system that is thought to be “not programming” because it doesn’t appear to involve programmers, programming languages, or programming tools.

> When I see a bird that walks like a duck and swims like a duck and quacks like a duck, I call that bird a duck.[^2]

Duck programmed systems walk like programming, swim like programming, and quack like programming. It’s just that people fool themselves into thinking “it’s not programming” because it isn’t code.

As described, the project’s system was designed to be *nearly entirely* duck programmed through the use of database tables that would be updated live in production. Rules engines aren’t the only software architecture that can be abused through duck programming: “Soft coding” is the practice of extracting values and logic from code and placing it in external resources such as configuration files or database tables. Soft coded systems are also fertile breeding grounds for duck programming.

Duck programming isn’t an architecture or an implementation, it’s a management anti-pattern, the failure to recognize that updating rules or soft coded values is programming just like updating code.

# Why Duck Tastes so Good

When designing systems, the temptation to include duck programming is seductive. For one thing, it’s easy to ignore or vastly underestimate the amount of work required to do the duck programming. In the project described, the team worked hard to estimate the work required to perform the code and implement the various screens. Alas, by “code,” they only meant the shell. The configuration of the system through the various rules was “Left as an exercise for the reader.”

Budgeting time and resources for the “code” programming and hand-waving the effort required for the “duck” programming makes projects appear easier and cheaper than reality will dictate.

Duck programming also exposes projects to “Naked Risk,” the possibility that bad things will happen without safeguards to prevent it or processes for recovering from disaster. Duck programming can be seductive to development teams because it pushes a lot of project risk away from the project team and onto the shoulders of the users. If something goes drastically wrong, the response from the team will be a shrug and the cryptic notation PEBKAC.[^3] The system “works as designed,” thus any problem is the fault of the users for misusing it.

Finally, duck programmed systems seem more “agile” in that major changes can be made “on the fly” without reprogramming. Let’s speak plainly: “Without reprogramming” doesn’t really mean “Without those pesky and expensive programmers.” It really means “Without all the project overhead of writing requirements, writing tests, managing a small project to implement the changes, testing, and signing off that it has been done as specified.”

Project management overhead is necessary because organizations need to plan and budget for things. Most organizations also realize that changing systems involves substantial risks of doing the right things the wrong way (defects), the wrong things the right way (requirements failures), or the wrong things the wrong way (total disaster). Duck programming avoids overhead at the cost of ignoring planning, budgeting, and risk management.

# Dangerous but Manageable

Duck programming is dangerous, for exactly the same reasons that modifying the code of a live application in production is dangerous. Let’s look at the ways in which programming teams manage the danger. Think about the process for “ordinary” programming in code. Hopefully, you agree with the following common-sense practices:[^4]

0. Requirements are documented—whether simply or elaborately—before code is written.
0. Code is reviewed before being deployed.
0. Automated tests are run to validate that the code behaves as expected and no unexpected defects are present.
0. Code changes are first placed in a test or staging environment for human testing before being deployed live.
0. Code can be “reverted” to a previous state. Changes can be quickly highlighted with a “diff” tool.

Now let’s think about a typical duck programmed system or module:

0. Requirements might be hidden in emails requesting changes, but since these are just actions to be performed on the system rather than formal projects to update the system, they may not have the same gravity as requirements for code changes.
0. Changes are live immediately, so there is no review other than double-checking a form and clicking “Yes” in response to “Really foobar the financial administration system?”
0. There are no automated tests, and no way for the end users to write them.
0. Changes are live. Testing on staging is typically limited to verifying that the duck programmable system can be duck programmed, not testing that the duck programming itself works.
0. Reverting is typically very challenging, as in many systems it requires reverting part of a database and carefully managing the consequences with respect to all related data.

There are no controls to minimize the possibility of disasters, and no processes for recovering from disasters. Imagine you were interviewing a software team lead, and they told you, “We don’t use source code, we work directly on the live system, and we don’t test, we simply fix any bugs our users report. If anything really serious goes wrong, I suppose there’s a system backup somewhere, you should ask the Sysadmins about that, it isn’t my department.”

Madness!

# How to Manage Duck Programming

Duck programming *is* manageable. It starts with recognizing that while it may be designed to be carried out by people who are not professional coders, it is still programming, and must be managed with the same processes you use to manage code:

0. Document requirements for the duck programming using the same system the team uses for programming in code.
0. Stage changes through testing and/or staging environments, then deploy the validated changes to production.
0. Build a system that allows users and analysts to write and run automated tests for the duck programmed functionality.
0. Do not allow live changes to duck programmed systems.
0. Build reversions and change management into the duck programming system.

These five simple points are not as difficult as they may seem. Most software systems have a ticket application for managing work on bug fixes and features. Teams can use the exact same system for all “duck programming” changes. Some systems are smart enough to tie a feature request or bug report to code changes in the source code repository. Using techniques described below, duck programming changes can also be checked into source control and tied to tickets.

Most programming tools revolve around text files. One way to bring duck programming in line with code programming is to find a way to manifest the duck programming as text files. For example, Domain-Specific Languages can be written in text files that can be checked into the source code control system just like ordinary code.

Data-driven duck programming can be set up to export to and import from text files. Those same text files can be managed like any other code change. For example, instead of making changes to a live system, changes can be made in staging, validated, and then exported to a text file that is imported into the production system using an automated deploy script.

Most automated testing tools can be set up to allow non-programmers to create stories and scenarios in remarkably readable code, such as `expect(case).toHaveAnOffice().and.toHaveACaseWorker()`.

Writing automated test cases has many benefits, so many that it is nearly ludicrous to propose developing a non-trivial software application without a substantial body of testing code. Besides catching regressions, readable test code documents intent. Test code acts like a double-entry system: Changes must be made in the normal or duck programming “code” and in the tests, and the two must match for the tests to pass.

The process for deploying duck programming to production can also be managed like the process for deploying code. Changes to table-driven systems can be made in staging, tested, and then exported to text files and imported into the live system’s database with automated deployment tools.

# Summary

The project described should not discourage anyone from contemplating building a system around rules engines, programmable workflow or domain-specific languages. There are many successful examples of such systems, and our developer went on to create several duck programmed applications themself.

They learned from their experience that with a little common sense and appropriate process, duck programming can be a successful strategy.

---

### Notes

[^0]: This essay was originally published January 8, 2012, on [unspace.ca]. It has been lightly edited to--amongst other things--remove gendered pronouns.

[^1]: “Trivial” is programmer slang for “I understand what to do and I’m ignoring how much time it will take to do it,” much as one might say that adding two large numbers by representing them as piles of pennies, pushing them into one pile, and then counting the pennies is a “trivial” exercise.

[^2]: James Whitcomb Riley (1849–1916)

[^3]: “Problem exists between keyboard and chair.”

[^4]: Many organizations have even more practices, but these are fairly minimal and commonplace as of this essay's writing (2012).

[unspace.ca]: https://web.archive.org/web/20160304022150/http://unspace.ca/dev/2012/duck-programming
