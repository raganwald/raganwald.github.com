

[![The Early Bird](/assets/images/state-machine/early-bird.jpg)](https://www.flickr.com/photos/sonstroem/9490151272)

### interlude: early and late binding

We're going to move on to another interesting topic, but before we do, we should note a caveat: *Our code for extracting state diagrams from state machines only works on live objects at runtime*. If we wanted to write something that would document our code as part of our JavaScript toolchain, we'd probably want it to work with more static assets, like source code.

This use case has its own tradeoffs. Code that dynamically inspects an object at runtime allows for objects that are dynamically generated. We could, with relative ease, write functions that add new states to an existing state machine, or add methods to existing state machines complete with transitions.

Constructing state machines at will, in our code, is part of a general philosophy called [late binding]: The specific meaning of an entity like `account` is allowed to be determined as late as we like, up to and including just before it is used at run time.

The converse approach, early binding, has the meanings/definitions of entities be fixed as early as possible, and thereafter they are can be trusted not to change. The ultimate in early binding would be to declare the form of an account in our code, statically, and to not allow any modification or rebinding at run time.

[late binding]: https://en.wikipedia.org/wiki/Late_binding

Late binding gives us enormous flexibility and power as programmers. However, tools that inspect, adapt, or verify our code at "compile" time, such as code that draws diagrams from our source code, will not work with objects that are dynamically constructed at run time.

For this reason, language designers sometimes choose early binding, and build "declarative" constructs that are not meant to be dynamically altered. JavaScript's module system was deliberately built to be declarative and early bound specifically so that tools could inspect module dependencies at build time.

We're not going to develop an early-bound state machine tool, complete with a compiler or perhaps a Babel plug-in to generate diagrams and JavaScript code for us today. But it is important to be intentional about this choice and appreciate the tradeoffs.
