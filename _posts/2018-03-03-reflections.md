---
title: "Reflections on State Machines"
layout: default
tags: [allonge, noindex]
---

In "[How I Learned to Stop Worrying and ❤️ the State Machine][forde]," we built an extremely basic [state machine][fsm] to model a bank account.

[forde]: http://raganwald.com/2018/02/23/forde.html

State machines, as we discussed, are a very useful tool for organizing the behaviour of [domain models], representations of meaningful real-world concepts pertinent to a sphere of knowledge, influence or activity (the "domain") that need to be modelled in software.

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[Domain models]: https://en.wikipedia.org/wiki/Domain_model

A state machine is an object, but it has a distinctive "behaviour." It is always in exactly one of a finite number of states, and its behaviour is determined by its state, right down to what methods it has in each state and which other states a method may or may not transition the state machine to.

This is interesting! So interesting, that we are going to spend a few minutes looking strictly at state machine behaviour, and more specifically, at the [interface] a state machine has with the entities that use it.

[interface]: https://en.wikipedia.org/wiki/Interface_(computing)

Let's get started.

---

[![Reflections](/assets/images/state-machine/reflections.jpg)](https://www.flickr.com/photos/hartman045/3503671671)

### our bank account state machine

Here's a small variation on the "bank account" code we wrote:[^account][^weakmap]

[^account]: Banking software is not actually written with objects that have methods like `.deposit` for soooooo many reasons, but this toy example describes something most people understand on a basic level, even if they aren't familiar with the needs of banking infrastructure, correctness, and so forth.

[^weakmap]: We're also using a slightly different pattern for associating state machines with their states, based on [weak maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).

```javascript
// The naïve state machine extracted from http://raganwald.com/2018/02/23/forde.html
// Modified to use weak maps for "private" state

const STATES = Symbol("states");
const STARTING_STATE = Symbol("starting-state");
const RESERVED = [STARTING_STATE, STATES];

const MACHINES_TO_CURRENT_STATE_NAMES = new WeakMap();
const MACHINES_TO_STARTING_STATES = new WeakMap();
const MACHINES_TO_NAMES_TO_STATES = new WeakMap();

function getStateName(machine) {
  return MACHINES_TO_CURRENT_STATE_NAMES[machine];
}

function getState (machine) {
  return MACHINES_TO_NAMES_TO_STATES[machine][getStateName(machine)];
}

function setState (machine, stateName) {
  MACHINES_TO_CURRENT_STATE_NAMES[machine] = stateName;
}

function transitionsTo (stateName, fn) {
  return function (...args) {
    const returnValue = fn.apply(this, args);
    setState(this, stateName);
    return returnValue;
  };
}

function BasicStateMachine (description) {
  const machine = {};

  // Handle all the initial states and/or methods
  const propertiesAndMethods = Object.keys(description).filter(property => !RESERVED.includes(property));
  for (const property of propertiesAndMethods) {
    machine[property] = description[property];
  }

  // now its states
  MACHINES_TO_NAMES_TO_STATES[machine] = description[STATES];

  // what event handlers does it have?
  const eventNames = Object.entries(MACHINES_TO_NAMES_TO_STATES[machine]).reduce(
    (eventNames, [state, stateDescription]) => {
      const eventNamesForThisState = Object.keys(stateDescription);

      for (const eventName of eventNamesForThisState) {
        eventNames.add(eventName);
      }
      return eventNames;
      },
    new Set()
  );

  // define the delegating methods
  for (const eventName of eventNames) {
    machine[eventName] = function (...args) {
      const handler = getState(machine)[eventName];
      if (typeof handler === 'function') {
        return getState(machine)[eventName].apply(this, args);
      } else {
        throw `invalid event ${eventName}`;
      }
    }
  }

  // set the starting state
  MACHINES_TO_STARTING_STATES[machine] = description[STARTING_STATE];
  setState(machine, MACHINES_TO_STARTING_STATES[machine]);

  // we're done
  return machine;
}

const account = BasicStateMachine({
  balance: 0,

  [STARTING_STATE]: 'open',
  [STATES]: {
    open: {
      deposit (amount) { this.balance = this.balance + amount; },
      withdraw (amount) { this.balance = this.balance - amount; },
      availableToWithdraw () { return (this.balance > 0) ? this.balance : 0; },
      placeHold: transitionsTo('held', () => undefined),
      close: transitionsTo('closed', function () {
        if (this.balance > 0) {
          // ...transfer balance to suspension account
        }
      })
    },
    held: {
      removeHold: transitionsTo('open', () => undefined),
      deposit (amount) { this.balance = this.balance + amount; },
      availableToWithdraw () { return 0; },
      close: transitionsTo('closed', function () {
        if (this.balance > 0) {
          // ...transfer balance to suspension account
        }
      })
    },
    closed: {
      reopen: transitionsTo('open', function () {
        // ...restore balance if applicable
      })
    }
  }
});
```

([code](https://gist.github.com/raganwald/e4e92910e3039a5bd513cf36b6a7f95d#file-naive-es6))

It's simple, and it seems to work. What's the problem?

---

[![Evidence](/assets/images/state-machine/evidence.png)](https://www.flickr.com/photos/opensourceway/6006414578)

### reflecting on state machines

> In computer science, [reflection] is the ability of a computer program to examine, introspect, and modify its own structure and behaviour at runtime.--[Wikipedia][reflection]

[reflection]: https://en.wikipedia.org/wiki/Reflection_(computer_programming)

Remember we talked about objects exposing their interface? In JavaScript, we can use code to examine the methods a bank account responds to:

```javascript
function methodsOf (obj) {
  const list = [];

  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      list.push(key);
    }
  }
  return list;
}

methodsOf(account)
  //=> deposit, withdraw, availableToWithdraw, placeHold, close, removeHold, reopen
```

This is technically correct, because we wrote methods that delegated all of these "events" to the current state. But this is *semantically* wrong, because the whole idea behind a state machine is that the methods it responds to vary according to what state it is in.

For example, when an object is created, it is in 'open' state, and `placehold`, `removeHold`, and `reopen` are all invalid methods. Our interface is lying to the outside would about what methods the object truly supports. This is an artefact of our design: We chose to implement methods, but then throw `invalid method` if an object in a particular state was not supposed to respond to a particular event.

The ideal would be for it not to have these methods at all, so that the standard way that we use our programming language to determine whether an object responds to a method--testing for a member that is a function--just works.

One way to go about this is to replace all the delegation methods with prototype mongling. First, the new `setState` method:[^mongle]

[^mongle]: **mongle**: *v*, to molest or disturb.

```javascript
function setState (machine, stateName) {
  MACHINES_TO_CURRENT_STATE_NAMES[machine] = stateName;
  Object.setPrototypeOf(machine, getState(machine));
}
```

Now we can remove all the code that writes the delegation methods:

```javascript
function ReflectiveStateMachine (description) {
  const machine = {};

  // Handle all the initial states and/or methods
  const propertiesAndMethods = Object.keys(description).filter(property => !RESERVED.includes(property));
  for (const property of propertiesAndMethods) {
    machine[property] = description[property];
  }

  // now its states
  MACHINES_TO_NAMES_TO_STATES[machine] = description[STATES];

  // set the starting state
  MACHINES_TO_STARTING_STATES[machine] = description[STARTING_STATE];
  setState(machine, MACHINES_TO_STARTING_STATES[machine]);

  // we're done
  return machine;
}
```

How well does it work? Let's try it with `account = ReflectiveStateMachine({ ... })` more-or-less as before:

```javascript
methodsOf(account)
  //=> deposit, withdraw, availableToWithdraw, placeHold, close

account.placeHold()
methodsOf(account)
  //=> removeHold, deposit, availableToWithdraw, close
```

([code](https://gist.github.com/raganwald/e4e92910e3039a5bd513cf36b6a7f95d#file-simple-reflection-es6))

Now we have a state machine that correctly exposes the shallowest part of its interface, the methods that it responds to at any one time. We'll have a look at its contracted behaviour in a moment, but first, a pleasant diversion.

---

[![Valves](/assets/images/state-machine/valves.jpg)](https://www.flickr.com/photos/thristian/371670597)

### descriptions and diagrams for code

Two things have been proven to be consistently true since the dawn of human engineering:

1. Using a diagram, schematic, blueprint, or other symbolic representation of work to be done helps us plan our work, do our work,  verify that our work is correctly done, and understand our work.
2. Diagrams, schematics, blueprints, and other symbolic representations of work invariably drift from the work over time, until their inaccuracies present more harm than good.

This is especially true of programming, where change happens rapidly and "documentation" lags woefully behind. In early days, researchers toyed with various ways of making executable diagrams for programs: Humans would draw a diagram that communicated the program's behaviour, and the computer would interpret it directly.

With such a scheme, we'd use a special editor to draw something like this:

![Bank account diagram](/assets/images/state-machine/account-final.jpg)

And the machine would simply execute it as a state machine. Naturally, there have been variations over the years, such as having the machine generate a template that humans would fill in, and so forth. But the results have always been unsatisfactory, not least because diagrams often scale well for reading about code, but not for writing code.

Another approach has been to dynamically generate diagrams and comments of one form or another. Many modern programming frameworks can generate documentation from the source code itself, sometimes using special annotations as a kind of markup. The value of this approach is that when the code changes, so does the documentation.

Can we generate state transition diagrams from our source code?

Well, we're not going to write an entire graphics generation engine, although that would be a pleasant diversion. But what we will do is generate a kind of program that another engine can consume to produce our documentation. The diagrams in this essay were generated with [Graphviz], free software that generates graphs specified with the [DOT] graph description language.

[Graphviz]: https://en.wikipedia.org/wiki/Graphviz
[DOT]: https://en.wikipedia.org/wiki/DOT_(graph_description_language)

The dot file to generate the above diagram looks like this:

```dot
digraph Account {

  start [label="", fixedsize="false", width=0, height=0, shape=none];
  start -> open [color=darkslategrey];

  open;

  open -> open [color=blue, label="deposit, withdraw, availableToWithdraw"];
  open -> held [color=blue, label="placeHold"];
  open -> closed [color=blue, label="close"];

  held;

  held -> held [color=blue, label="deposit, availableToWithdraw"];
  held -> open [color=blue, label="removeHold"];
  held -> closed [color=blue, label="close"];

  closed;

  closed -> open [color=blue, label="reopen"];
}
```

We could generate this DOT file if we have a list of states, events, and the states those events transition to. Getting a list of states and events is easy. But what we don't have is the starting state, nor do we have the states these methods (a/k/a "events") transition to.

We could easily store the starting state for each state machine in a weak map. But what to do about the transitions? This is a deep problem. Throughout our programming explorations, we have repeatedly feasted on JavaScript's ability for functions to consume other functions as arguments and return new functions. Using this, we have written many different kinds of decorators, including `transitionsTo`.

The beauty of functions returning functions is that closures form a hard encapsulation: The closure wrapping a function is available only functions created within its scope, not to any other scope. The drawback is that when we want to do some inspection, we cannot pierce the closure. We simply cannot tell from the function that `transitionsTo` returns what state it will transition to.

We have a few options. One is to use a different form of description that encodes the destination states without a `transitionsTo` function.

---

[![Bank of Montréal, in Toronto](/assets/images/state-machine/bank-of-montreal.jpg)](https://www.flickr.com/photos/remedy451/8061881196)

### a new-old kind of notation for bank accounts

When [we first formulated a notation for state machines][forde], we considered a more declarative format that encoded states and transitions using nested objects. It looked a little like this:

```javascript
const TRANSITIONS = Symbol("transitions");
const STARTING_STATE = Symbol("starting-state");

const account = OtherNotationStateMachine({
  balance: 0,

  [STARTING_STATE]: 'open',
  [TRANSITIONS]: {
    open: {
      open: {
        deposit (amount) { this.balance = this.balance + amount; },
        withdraw (amount) { this.balance = this.balance - amount; },
        availableToWithdraw () { return (this.balance > 0) ? this.balance : 0; }
      },
      held: {
        placeHold () {}
      },
      closed: {
        close () {
          if (this.balance > 0) {
            // ...transfer balance to suspension account
          }
        }
      }
    },
    held: {
      open: {
        removeHold () {}
      },
      held: {
        deposit (amount) { this.balance = this.balance + amount; },
        availableToWithdraw () { return 0; }
      },
      closed: {
        close () {
          if (this.balance > 0) {
            // ...transfer balance to suspension account
          }
        }
      }
    },
    closed: {
      open: {
        reopen () {
          // ...restore balance if applicable
        }
      }
    }
  }
});
```

This is more verbose, but we can write a `StateMachine` to do all the interpretation work. It will keep the description but translate the methods to use `transitionsTo` for us:

```javascript
const STATES = Symbol("states");
const RESERVED = [STARTING_STATE, TRANSITIONS];

const MACHINES_TO_CURRENT_STATES = new WeakMap();
const MACHINES_TO_STARTING_STATES = new WeakMap();
const MACHINES_TO_TRANSITIONS = new WeakMap();
const MACHINES_TO_NAMES_TO_STATES = new WeakMap();

function setState (machine, stateName) {
  MACHINES_TO_CURRENT_STATES[machine] = MACHINES_TO_NAMES_TO_STATES[machine][stateName];
  Object.setPrototypeOf(machine, MACHINES_TO_CURRENT_STATES[machine]);
}

function transitionsTo (stateName, fn) {
  return function (...args) {
    const returnValue = fn.apply(this, args);
    setState(this, stateName);
    return returnValue;
  };
}

function StateMachine (description) {
  const machine = {};

  // Handle all the initial states and/or methods
  const propertiesAndMethods = Object.keys(description).filter(property => !RESERVED.includes(property));
  for (const property of propertiesAndMethods) {
    machine[property] = description[property];
  }

  // set the transitions for later reflection
  MACHINES_TO_TRANSITIONS[machine] = description[TRANSITIONS];

  // create its state prototypes
  MACHINES_TO_NAMES_TO_STATES[machine] = Object.create(null);

  for (const state of Object.keys(MACHINES_TO_TRANSITIONS[machine])) {
    const stateDescription = MACHINES_TO_TRANSITIONS[machine][state];

    MACHINES_TO_NAMES_TO_STATES[machine][state] = {};
    for (const destinationState of Object.keys(stateDescription)) {
      const methods = stateDescription[destinationState];

      for (const methodName of Object.keys(methods)) {
        const value = stateDescription[destinationState][methodName];

        if (typeof value === 'function') {
          MACHINES_TO_NAMES_TO_STATES[machine][state][methodName] = transitionsTo(destinationState, value);
        }
      }
    }
  }

  // set the starting state
  MACHINES_TO_STARTING_STATES[machine] = description[STARTING_STATE];
  setState(machine, MACHINES_TO_STARTING_STATES[machine]);

  // we're done
  return machine;
}
```

And now our `transitions` function can generate most of what we want:

```javascript
function transitions (machine) {
  const description = { [STARTING_STATE]: MACHINES_TO_STARTING_STATES[machine] };
  const transitions = MACHINES_TO_TRANSITIONS[machine];

  for (const state of Object.keys(transitions)) {
    const stateDescription = transitions[state];

    description[state] = Object.create(null);
    for (const destinationState of Object.keys(stateDescription)) {
      description[state][destinationState] = Object.keys(stateDescription[destinationState]);
    }
  }

  return description;
}

transitions(account)
  //=> {
    open: {
      open: ["deposit", "withdraw", "availableToWithdraw"],
      held: ["placeHold"],
      closed: ["close"]
    },
    held: {
      open: ["removeHold"],
      held: ["deposit", "availableToWithdraw"],
      closed: ["close"]
    },
    closed: {
      open: ["reopen"]
    },
    Symbol(starting-state): "open"
  }
```

🎉‼️ We're ready to generate a DOT file from the symbolic description:

```javascript
function dot (machine, name) {
  const transitionsForMachine = transitions(machine);
  const startingState = transitionsForMachine[STARTING_STATE];
  const dot = [];

  dot.push(`digraph ${name} {`);
  dot.push('');
  dot.push('  start [label="", fixedsize="false", width=0, height=0, shape=none];');
  dot.push(`  start -> ${startingState} [color=darkslategrey];`);

  for (const state of Object.keys(transitionsForMachine)) {
    dot.push('');
    dot.push(`  ${state}`);
    dot.push('');

    const stateDescription = transitionsForMachine[state];

    for (const destinationState of Object.keys(stateDescription)) {
      const events = stateDescription[destinationState];

      dot.push(`  ${state} -> ${destinationState} [color=blue, label="${events.join(', ')}"];`);
    }
  }

  dot.push('}');

  return dot.join("\r");
}

dot(account, "Account")
  //=>
    digraph Account {

      start [label="", fixedsize="false", width=0, height=0, shape=none];
      start -> open [color=darkslategrey];

      open

      open -> open [color=blue, label="deposit, withdraw, availableToWithdraw"];
      open -> held [color=blue, label="placeHold"];
      open -> closed [color=blue, label="close"];

      held

      held -> open [color=blue, label="removeHold"];
      held -> held [color=blue, label="deposit, availableToWithdraw"];
      held -> closed [color=blue, label="close"];

      closed

      closed -> open [color=blue, label="reopen"];
    }
}
```

([code](https://gist.github.com/raganwald/e4e92910e3039a5bd513cf36b6a7f95d#file-draw-diagrams-es6))

We can feed this `.dot` file to Graphviz, and it will produce the image we see right in this blog post. In fact, the image in this blog post was produced from Graphviz in exactly this way.

So. We now have a way of drawing state transition diagrams for state machines. Being able to extract the semantic structure of an object--like the state transitions for a state machine--is a useful kind of reflection, and one that exists at a higher semantic level than simply reporting on things like the methods an object responds to or the properties it has.

---

[![contract](/assets/images/state-machine/contract.jpg)](https://www.flickr.com/photos/governmentofalberta/23577005941)

### should a state machine hide the fact that it's a state machine?

People talk about [information hiding] as separating the responsibility for an object's "implementation" from its "interface." The question here is whether an object's states, transitions between states, and methods in each state are part of its implementation, or whether they are part of its interface, its contracted behaviour.

One way to tell is to ask ourselves whether changing those things will break other code. If we can change the transitions of a state machine without changing any other code in an app, it's fair to say that the transitions are "just implementation details," Just as changing a HashMap class to use a [Cockoo Hash] instead of a [Hash Table] doesn't require us to change any of the code that interacts with our HashMap.

[Cockoo Hash]: https://en.wikipedia.org/wiki/Cuckoo_hashing
[Hash Table]: https://en.wikipedia.org/wiki/Hash_table

So how about our bank accounts?

Quite clearly, the fact that a bank account has states is part of its contracted behaviour. Take the following sequence:

```javascript
account.availableToWithdraw()
  //=> 0

account.deposit(42)

account.availableToWithdraw()
  //=> ???
```

Does the second `.availableToWithdraw()` return forty-two? Or zero? That depends upon whether the account is open or held, and that isn't a private secret that only the account knows about. We know this, because people openly talk about whether accounts are open, held, or closed. People build processes around the account's state, and it's certainly part of the account's design that the `.placeHold` method transitions an account into `held` state.

From this, we get that accounts should certainly *behave* like state machines. And from that, it's reasonable that other pieces of code ought to be able to dynamically inspect an account's current state, as well as its complete graph of states and transitions. That's as much a part of its public interface as any particular method.[^ofcourse]

[^ofcourse]: Of course, we could implement a state machine in some other way, such that it *behaves like* a state machine but is implemented in some other fashion. That would be changing its implementation and not its interface. We could, for example, rewrite our `StateMachine` function to generate a collection of actors communicating with asynchronous method passing. The value of our curent approach is that the implementation strongly mirrors the interface, which has certain benefits for readability.

So how do we implement this reflection in a more organized fashion? We can keep our `transitions` function. But what about current state?



---

### javascript allongé, the six edition

If you enjoyed this essay, you'll ❤️ [JavaScript Allongé, the Six Edition](http://leanpub.com/javascriptallongesix/c/state-machines). It's 100% free to read online, and for a limited time, if you use [this coupon](http://leanpub.com/javascriptallongesix/c/state-machines), you can buy it for $10 off. That's a whopping 37% savings!

---

[![A clock mechanism](/assets/images/state-machine/field-notes.jpg)](https://www.flickr.com/photos/migreenberg/7155283115)

# notes
