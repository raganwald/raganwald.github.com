---
title: "Avian Technology, a Long and Winding Story"
layout: default
tags: [allonge, noindex]
---

### a true story

Once upon a time, I went for a round of job interviews with an interesting company. Things went well in the behavioural and technical segments, then I sat down with the President, who introduced themselves as an industry veteran who provided the "adult supervision" for the company.

"I see you worked at LeMond?"[^pseudonyms] Of course I had, my referral to these interviews was from a colleague there.

[^pseudonyms]: All names are pseudonyms, of course, and some other details have been fictionalized.

"Do you know a programmer named Rijkert Byrd?" Everyone at LeMond knew Rijkert. So yes I did.

"Then tell me: What do you think about Rijkert? Be as specific as possible." I felt a yawning chasm open up under my feet, and my sixth, seventh, and eighth senses were all screaming that this question was a trap.

I took a long sip from my water to buy myself time, composed my emotions, and decided, as usual, to be truthful. But Rijkert's story was far from simple. Before answering, I cast my mind back over Rijkert's history with the company.

---

## LeMond

LeMond was an interesting company. It made software tools for businesses and other organizations, and it had survived, even thrived, as several waves of technology had washed over the business computing industry.

LeMond had been formed by two college roommates. They had been taught that businesses used IBM and DEC hardware, but in the university everyone used Unix, and programmers seemed to vastly prefer working in "The Unix Style."

The marketplace seemed to feel that Unix was inferior for business processing purposes, but LeMond's founders mixed a little idealism with a dash of "If programmers are more productive, businesses will buy it," and topped it all off with, "We want to play with this stuff, so let's try it and see if we can make a go of a company."

As things worked out, minicomputers running Unix became a small but significant thing, and LeMond did well making something called "Business Components" for businesses writing their own in-house software. Rijkert was one of LeMond's first hires, and he quickly earned a reputation for turning assignments around very, very quickly.

Things went well for quite a while, until the IBM PC arrived, and LeMond had its first real test of maturity as a company. Their existing customers were all very happy with their Unix systems, and most of the software they were running would not run on a PC: It was either too big and sophisticated, or was multi-user.

Serious businesses considered the PC a toy, even if it was backed by IBM. Oh sure, businesses bought a few PCs, and paid analysts for case studies and white papers, and somebody would be assigned to write up a report about the opportunities and costs of adopting PC technology. But absolutely none of LeMond's customers were asking LeMond to write PC software.

So they didn't. They carried on working on a long list of features and enhancements dictated by perfectly rational win/loss marketing analysis, feedback from customers, and the dictates of industry analysts.

### rijkert 's pc

But a funny thing happened. Rijkert bought an IBM-PC. I don't know the story behind it, maybe it was for playing with "Flight Simulator," or maybe there was a thought that a PC could support "Unix on the Desktop." But however it came to be, Rijkert had a PC and actually set it up in the office.

It wasn't long before Rijkert was fooling around with writing software for the PC. Coffee break conversations began to include monologues from Rijkert about somebody called Philippe Kahn, and debates about the benefits of coding in C and assembler versus the UCSD p-system. Rijkert's regular work suffered, and it wasn't long before Rijkert was programming the PC full time.

One day, the company founders decided that Rijkert simply had to get back to work. They were nice people, so instead of chewing Rijkert out about the IBM-PC obsession, the founders decided to begin diplomatically by asking what the PC was doing to make LeMond money.

"Ah!" Rijkert beamed, finally someone was listening. "I'll be right back!"

Rijkert left the conference room and returned with the PC. Rijkert needed a few more trips, but after some fiddling the PC was set up in the conference room and everyone was clustered around the 12-inch colour display.

Rijkert booted everything up and then typed the magic incantation: `lemond.exe`. With much squeaking and grinding, the PC laboriously booted... A programming editor!

The founders were silent. At long last, one spoke: "What is this good for?"

### lemond.exe

Rijkert was enthusiastic. "Well, I wanted to see if we could get our suite of Business Components running on a PC. But frankly, the tooling is TERRIBLE, just awful. Nobody can work like this. So before I could write a business component, I had to write a programming editor."

The founders were, well, dumbfounded. There were so many reasons why this was a terrible waste of time that they crowded the mind like a traffic jam, shutting down the ability to pick one and speak. Rijkert, oblivious to their body language, continued.

"I mean, the PC is such a terrible platform, there is no way anybody is going to do any serious programming on it without a programming editor. And without serious programmers, there won't be anybody to buy Business Components. So I wrote one. Obvious, really."

Finally, one of the founders managed to speak. "This is all very nice, but what made you think it would sell?"

Rijkert beamed. "Oh, that's no problem. I mentioned it on a BBS, and I have ten preorders already. Well, not invoices or anything, but they say they'll buy it, and even if only half of them want it, that's five sales."[^five]

[^five]: Five sales isn't very much, but in those days, software on a PC might sell for $400, $500, $700, $900, even $1,100, $1,400, or more. I recall paying nearly $3,000 for a certain programming environment to run on a Macintosh. So five presales was evidence that somebody was taking `lemond.exe` seriously, a lot more evidence than if there were five presales at a more modern price like $9.99.

The other founder, who hadn't spoken yet, wanted to ask what a "BBS" was, but decided that things were surreal enough, and there was a definite risk that the conversation would veer even further off base.

Now it would be nice if the founders in this story clapped Rijkert on the back, broke open a bottle of champagne, and then devoted 40% of their marketing budged to `lemond.exe`, but that's not what really happened. There was much back-and-forth, much hand-wringing, and yes, five sales.

And `lemond.exe` became a product, and from those five sales there were more sales, and then LeMond put some money into marketing it, and there were more sales, and `lemond.exe` became a modest hit, and as the PC market grew, sales grew.

And no, Business Components did not become a big thing on the PC, a funny thing called VisiCalc did, and then another funny thing called Excel, but `lemond.exe` spawned a few other programming tools for PC programmers, and LeMond was happy making money from Business Components for Unix, and from programming tools for PCs, and Rijkert went back to working on things that everybody agreed were priorities.

And then Windows happened.

### the windows adventure

LeMond had very purposely avoided writing software for Macintosh, because all of their customers agreed that nobody wanted a Mac. And people tried to bring weird [Graphical User Interfaces] to PCs, and the results were uninspiring. [TopView], [GEM], [OS/2 Presentation Manager]... None got any traction.

[GUI]: https://en.wikipedia.org/wiki/History_of_the_graphical_user_interface
[TopView]: https://en.wikipedia.org/wiki/IBM_TopView
[GEM]: https://en.wikipedia.org/wiki/Graphical_Environment_Manager
[OS/2 Presentation Manager]: https://en.wikipedia.org/wiki/Presentation_Manager

Microsoft's own forays into a graphical user interfaces were widely acknowledged as being terrible clones of Mac OS. It was obvious to everyone that their strategy was to produce something, andything, no matter how embarassing, just so that they could reassure customers that if they wanted mice and clicking, they could have mice and clicking.

Most customers on IBM-PCs gave it a try, and went back to using the command line, unimpressed by this "WIMP" metaphor. This has been played out many times in the technology world: Somebody brings out something revolutionary, the legacy players make a terrible copy of it, and customers judge the new idea on the terrible copy, but not on the original.

Manwhile, LeMond had matured as a company. It had people called "product managers," who were busy producing "win-loss" reports and "segmentation diagams." The product managers were not ignorant of the technology market, and they were not going to allow LeMond's "Next Big Thing" to emerge from somebody's hobby.

So they were constantly watching developments, trying to sort out what was going to be the Next Big Platform, so that LeMond could get in on the ground floor, as it had with its programming editor and other tools for IBM-PC programmers.

When [Windows 95] finally dropped, LeMond correctly guessed that the full-court press by Microsoft's marketing machine and developer evangelists was a signal that they were finally serious about GUIs. They sprang into action, recruiting many of the company's more talented developers for a new "Windows Technology" group.

[Windows 95]: https://en.wikipedia.org/wiki/Windows_95

In an action unprecedented for LeMond, simultaneous releases were planned for Windows 95 versions of its Business Components and Programming Tool products. Rijkert, who had a reputation for being able to either turn something around in a few days or not at all, was left off the project. They wanted to optimize for reliabile and predictabile team delivery.

With much fanfare, marketecture, glossy brochures, advertising, golden discs, trade show booths, and paid advertorials, the launch went almost exactly as planned. Thousands of Trial Version discs were distributed. Major customers signed up for betas. Everything went according to plan.

Except for the sales. Sales were tepid. The marketplace yawned. Windows 95 urned out to be a consumer release. Solitaire and Minesweeper were all the rage. People played with [CompuServe]. But nobody wanted to pay serious money for Business Components or WIMP-based programming tools.

[CompuServe]: http://news.microsoft.com/1996/06/04/access-to-compuserve-online-services-to-be-included-in-windows-95-operating-system/#sm.0016um7b212pvf11yvu2r7qhgbr8x

LeMond licked its wounds. The founders huddled at an executive offsite and formulated plans for a new product development pipeline festooned with "gates" and other process features designed to prevent the risk of ever launching something so big without a 100% guarantee of success.

Privately, the product managers correctly forecasted that this process would also prevent the risk of launching anything except minor variations of things LeMond was already making. But this was no time to argue, so they put their heads down and schemed for ways to route around the rapidly growing bureaucracy.

Meanwhile, oblivious to all that was happening, the Windows Technology group was working on version 1.1 of Business Components for Windows.

### a byrd hits the windows

Although Rijkert had initially been excluded from the Windows Technology Group, he found himself roped into helping out. what happened was that despite their best intentions to use predictable developers to create a predictable, sustainable delivery pace, they reckoned without the pragmatic realities of the product management and sales teams.

While they were trying to simultaneously ship version 1.1 of the Business Components for Windows and Programming Tools for Windows, they were dealing with bug reports from the few customers they had, as well as a stream of "urgent and critical" feature requests from prodct management and sales.

It seemed that once a product escaped the pure development environment and was shown to the marketplace, the only thing we could forsee with certainty, is that we would be unable to forsee what would happen, with certainty.

Faced with constant interruptions, the development manager had Rijkert transferred onto the team, and piped all non-scheduled work to Rijkert. That way, the origianlly planned releases could proceed on schedule, and Rijkert could work on everything else in whatever capricious order product management and sales dictated.

Rijkert dived into the code with relish, and as was his wont, quickly became dissatisfied with the development environment. He was very familiar with the company's Business Components, but the Windows technology Group had implemented them using some new-fangled greenspunned pseudo-OO code. There were these synthetic classes and dispatch functions and it was very hard to keep track of what was going on.

As Dr. Adele Goldberg famously said (about Smalltalk): "In OO, everything happens somewhere else."

Rijkert thought about it, and then set about coding up his own solution to the problem: He wrote a visual viewer for the company's proprietary OO code. He had written a rudimentary [Entity-relationship Model][ERM] Viewer. In Windows 95. In a little over a week-end.

[ERM]: https://en.wikipedia.org/wiki/Entity-relationship_model

And while the requests for "actual work" piled up, Rijkert embellished his viewer and turned it into an editor: Making changes to the model in the viewer would write changes to the source code.

This state of affairs could not continue indefinitely, and it wasn't long before Adam Strong, LeMond's head of product management, was at Rijkert's demanding to know when he could expect to see some customer-requested features for Business Components.

Rijkert was pleased to see Adam. "Tell me," Rijkert asked, "What are those changes again?"

Adam was not pleased to have to repeat what had already been entered into the company's task and time tracking application, but he knew that honey would catch more flies than vinegar. As Adam explained the change request point-by-point, Rijkert was making the changes, live, in the diagram on his PC.

When they were done, Adam asked Rijkert to validate that things were as they should be. There were a few missed points, and Rijkert corrected those on the spot. Finally, Adam agreed that the diagram was correct.

"This diagram is really helpful. When can I expect you to implement the changes?"

Rijkert grinned. "They're done! Of course, we need to run some tests and so on, but..."

The news that Rijkert had made the changes by editing a diagram on the screen went off like a bombshell, and it took some time for Adam to reassemble the major pieces of his brain. When he left Rijkert's office, he was already planning a new line of OO analysis tools.

### adam's generation

While LeMond had been busy trying to make business components a success in the Windows 95 world, a different revolution was sweeping businesses. The [Unified Modelling Language][UML] ("UML") was becoming a standard way for businesses to visualize system designs, and the related [Rational Unified Process][RUP] was all the rage amongst LeMond's market.

[UML]: https://en.wikipedia.org/wiki/Unified_Modeling_Language
[RUP]: https://en.wikipedia.org/wiki/Rational_Unified_Process

Adam quickly realized that providing components to plug into hand-written code was not particularly exciting to companies in the midst of trying to adopt a standardized process and tooling. But if LeMond could get into the tooling and code generation business, and sell it as being compatible with UML, then they could sell some diagrammers, and make LeMond's business components particularly easy to integrate from within the tool.

Adam managed to talk the founders into making amodest bet on this, and a new team was formed to productize Rijkert's work as the "LeMond Business Modelling Suite." The team's experience getting to 1.0 becamame a legend within the company. The founders took one look at Rijkert's prototype and figured that shipping a product was, if not a slam dunk, and easy layup.

So the team was given constrained resources, a tight timeline, and a list of new features to add, not the least of which was a nearly complete redesign of the terminology and visualization to match UML. Meanwhile, they struggled to even read Rijkert's code, much less work with it.

The tech lead would later lament that had they known what they were up against, they would have considered Rijkert's code to be a proof-of-concept, thrown it right out, and written the LeMond Business Modelling Suite from scratch.

Several death marches and missed dealines later, LeMond's Business Modelling Suite shipped, and the company had another hit on its hand. Customers gobbled it up, and it worked like a charm to sell business components licenses.

There was more to LeMond's story, and Rijkert's involvement, but as I turned events over in my head, the theme was consistent: Rijkert had real trouble focusing on the company's priorities. Teams didn't really like working with Rijkert, and they hated working with Rijkert's code.

---

## Rijkert Byrd

But behind closed doors, the founders once summed Rijkert up by pointing out that one way or another, Rijkert had kickstarted every single success they had since they wrote the original business components. Lots of programmers would "yak-shave" and spend a lot of time trying to make their work more efficient. But Rijkert had a bias for productizing his yak shaving.

When he discovered some defect in the way things were done, he'd make a tool for doing things "The Right Way." As with `lemond.exe` and the Business Modelling Suite, sometimes those tools became successful products. Sometimes, as with his continuous integration testing tools, they became internal tools.

Meanwhile, the company's product management


The trick was to give him work to do

---

### notes
