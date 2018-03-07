---

[![Tree](/assets/images/state-machine/tree.jpg)](https://www.flickr.com/photos/29233640@N07/14724197800)

### inheritance, the easy way

Our `StateMachine` function doesn't respect inheritance. Let's say, for example, that our banking software has an idea of objects that have customers:[^notreally]

[^notreally]: Again, this is absolutely not how real banking software should be written. Come to think of it, it's probably not how _any_ software should really be written, at least not without intentionally [considering and discarding](http://raganwald.com/2016/07/16/why-are-mixins-considered-harmful.html "Why are mixins considered harmful?") the possibility of using a mixin or other technique for sharing the functionality of "having a customer."

```javascript
const CUSTOMER = Symbol("customer");

class HasCustomer {
  constructor (customer) {
    this[CUSTOMER] = customer;
  }

  customer () {
    return this[CUSTOMER];
  }

  setCustomer (customer) {
    return this[CUSTOMER] = customer;
  }
}
```

Unfortunately, we use this with our `account` state machine, because our prototype mongling implementation sets its prototype to its current state. To correctly set up the prototype chain, we'd need to correctly set the prototype of each state to be our `HasCustomer`'s prototype, *and* we'll need to have it invoke the constructor properly:

```javascript
function StateMachine (
    description,
    superclass = Object,
    ...constructorArguments
) {
  const machine = {};

  // Handle all the initial states and/or methods
  const propertiesAndMethods = Object.keys(description).filter(property => !RESERVED.includes(property));
  for (const property of propertiesAndMethods) {
    machine[property] = description[property];
  }

  // set the transitions for later reflection
  machine[TRANSITIONS] = description[TRANSITIONS]

  // now its states
  machine[STATES] = Object.create(null);

  for (const state of Object.keys(description[TRANSITIONS])) {
    const stateDescription = description[TRANSITIONS][state];

    // set the prototype of each state
    machine[STATES][state] = Object.create(Object.getPrototypeOf(superclass));

    for (const destinationState of Object.keys(stateDescription)) {
      const methods = stateDescription[destinationState];

      for (const methodName of Object.keys(methods)) {
        const value = stateDescription[destinationState][methodName];

        if (typeof value === 'function') {
          machine[STATES][state][methodName] = transitionsTo(destinationState, value);
        }
      }
    }
  }

  // set state method
  machine[SET_STATE] = function (state) {
    Object.setPrototypeOf(this, this[STATES][state]);
  }

  // set the starting state
  machine[STARTING_STATE] = description[STARTING_STATE];
  machine[SET_STATE].call(machine, machine[STARTING_STATE]);

  // and invoke the constructor
  superclass.apply(machine, constructorArguments);

  // we're done
  return machine;
}
```

```javascript
const account = StateMachine({
  balance: 0,

  [STARTING_STATE]: 'open',
  [TRANSITIONS]: {

    // ...

    closed: {
      open: {
        reopen () {
          // ...restore balance if applicable
        }
      }
    }
  }
}, HasCustomer, 'Reg Braithwaite');

account.getCustomer()
  //=> 'Reg Braithwaite'
```

This works, and might be all we need for our immediate purposes. But once we incorporate the idea of inheriting _from_ a class, it seems like we ought to go all the way and make a way to declare an `Account` class.

How hard could that be?

---

[![Ford Assembly Line, 1953](/assets/images/state-machine/ford-1953.jpg)](https://www.flickr.com/photos/autohistorian/27393923970)

### defining classes of state machines

What if we want to define an `Account` _class_, not just one account? Our `StateMachine` function took as its argument an object, and returned an object. So we'll write a `StateMachineClassFrom` function that takes a class (usually a class expression) as an argument and returns a class. The definitions for our state machine will be transformed into static methods, like this:

```javascript
const Account = StateMachineClassFrom(class extends HasCustomer {
  constructor (...args) {
    super(...args);

    this.balance = 0;
  }

  static [STARTING_STATE] () { return 'open' }

  static [TRANSITIONS] () {
    return {

      // ...

      closed: {
        open: {
          reopen () {
            // ...restore balance if applicable
          }
        }
      }
    };
  }
});

const act = new Account('Reg');
const act2 = new Account('Scott');

act.deposit(96);
act2.deposit(108);
act.placeHold();

console.log(act.availableToWithdraw())
  //=> 0
console.log(act2.availableToWithdraw());
  //=> 108
```

Here's a naïve implementation doesn't require too much change from our existing `StateMachine` function:

```javascript
function StateMachineClassFrom (clazzDefinition) {
  const startingState = clazzDefinition[STARTING_STATE]();

  const clazz = class extends clazzDefinition {
    constructor (...args) {
      super(...args);
      this[SET_STATE].call(this, startingState);
    }
  };
  const transitions = clazzDefinition[TRANSITIONS]();
  const clazzPrototype = clazz.prototype;

  // now its states
  clazzPrototype[STATES] = Object.create(null);

  for (const state of Object.keys(transitions)) {
    const stateDescription = transitions[state];

    // set the prototype of each state
    clazzPrototype[STATES][state] = Object.create(clazzPrototype);

    for (const destinationState of Object.keys(stateDescription)) {
      const methods = stateDescription[destinationState];

      for (const methodName of Object.keys(methods)) {
        const value = stateDescription[destinationState][methodName];

        if (typeof value === 'function') {
          clazzPrototype[STATES][state][methodName] = transitionsTo(destinationState, value);
        }
      }
    }
  }

  // set state method
  clazzPrototype[SET_STATE] = function (state) {
    Object.setPrototypeOf(this, this[STATES][state]);
  }

  // set the starting state
  clazzPrototype[STARTING_STATE] = startingState;

  // we're done
  return clazz;
}
```

Great, we can now create classes, and they work just like JavaScript's built-in classes. Or do they?

---

[![My First Computer: LX Edition](/assets/images/state-machine/my-first-computer-lx-edition.jpg)](https://powerpig.ecwid.com/#!/My-First-Computer-LX-Edition/p/99371870/category=15326690)

### the problem with extending state machines

Our new Account class can extend any ordinary class we like. It's tempting to think that we have "solved the class problem." But we haven't really. We've solved it in a technical sense, but semantically, our solution has holes.

We earlier posited a (terrible) superclass, `HasCustomer`. Let's consider something that might be more useful for building accounts:

```javascript
const BALANCE = Symbol("balance");
const CUSTOMER = Symbol("customer");

const AbstractAccount = StateMachineClassFrom(class {
  constructor (customer) {
    this[BALANCE] = 0;
    this[CUSTOMER] = customer;
  }

  balance () {
    return this[BALANCE];
  }

  customer () {
    return this[CUSTOMER];
  }

  setCustomer (customer) {
    return this[CUSTOMER] = customer;
  }

  static [STARTING_STATE] () { return 'open' }

  static [TRANSITIONS] () {
    return {
      open: {
        open: {
          deposit (amount) { this[BALANCE] = this[BALANCE] + amount; },
          withdraw (amount) { this[BALANCE] = this[BALANCE] - amount; },
          availableToWithdraw () { return (this[BALANCE] > 0) ? this[BALANCE] : 0; }
        },
        closed: {
          close () {
            if (this[BALANCE] > 0) {
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
    };
  }
});
```

`AbstractAccount` is responsible for the code implementing accounts that have a balance, a customer, and can be opened and closed. Now we'll write our `Account` class. It's the same as `AbstractAccount`, but it adds the `held` state, something like:

```javascript
const ConcreteAccount = StateMachineClassFrom(class extends AbstractAccount {

  static [TRANSITIONS] () {
    return {
      open: {
        held: {
          placeHold () {}
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
      }
    };
  }
});

const justin = new ConcreteAccount('Trudeau');
justin.deposit(1000000);
  //=> justin.deposit is not a function.
```

Whoops! Our `StateMachineClassFrom` function simply takes our definition and implements it in the current class. All the machinery of manipulating state in `AbstractAccount` is there in the prototype, but completely ignored. If we want to be able to selectively add new events and states, we need our inheritance mechanism to know something about state machines.

> Let's pause for a moment and recognize why frameworks like [Ember] often end up reinventing classes from the ground up, with special ways to extend classes or reopen them after being defined: Once you invent a new kind of behaviour in classes, you'll wind up having to reimplement nearly everything that existing classes already do.

[Ember]: https://emberjs.com

Once again, we're running into this general problem: When we set out to create a new kind of programming entity, it's fairly easy to get the first cut right, but if we want it to have the same rich affordances as existing constructs, there is a surprising amount of work required, and we often end up reimplementing basic features from scratch. In this case, it looks like we have to write our own `extends` feature.

---

[![Trees](/assets/images/state-machine/trees.jpg)](https://www.flickr.com/photos/rbh/14431865903)

### extending state machines

Let's reiterate what we were trying to do: We wanted to be able to extend a state machine class, and extend behaviour within states, such as adding new events to handle. We didn't want to have to recreate all of the existing code for any of the states.

Now, we could look at some scheme like having the state objects for a state machine class extend the state objects for any state machine class it extends. This would require changing the `StateMachineClassFrom` function to wire up the correct prototypes, and we'd have to do some hard thinking about what to do with methods that are not part of states.

We could also think about writing a mixin capability, so that instead of inheriting the idea of an account that has a customer, a balance, and open/closed states, we could mix them into class, something like:

```
