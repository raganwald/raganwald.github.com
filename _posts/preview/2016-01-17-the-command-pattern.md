---
layout: default
tags: [allonge, noindex]
---

> In object-oriented programming, the command pattern is a behavioral design pattern in which an object is used to encapsulate all information needed to perform an action or trigger an event at a later time.—[Wikipedia](https://en.wikipedia.org/wiki/Command_pattern)

### functional commands

### higher-order commands

Undo/Redo

### Histories

Undo via Replay

Limitation: Cannot undo an arbitrary command in the history

### functional commands are opaque

- No composition

## Naked Objects

0. All business logic should be encapsulated onto the domain objects. This principle is not unique to naked objects: it is just a strong commitment to encapsulation.
0. The user interface should be a direct representation of the domain objects, with all user actions explicitly consist in the creating or the retrieving of domain objects and/or invoking methods on those objects. This principle is also not unique to naked objects: it is just a specific interpretation of an object-oriented user interface (OOUI).
0. The original idea in the naked objects pattern arises from the combination of these two which form the third principle:
    - The user interface shall be 100% automatically created from the definition of the domain objects. This may be done using several different technologies, including source code generation; implementations of the naked objects pattern to date have favoured the technology of reflection.

Describe pattern
Reflective UI
Operations become objects
