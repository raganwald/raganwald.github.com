---
title: Detecting whether a linked list has a cycle
published: true
tags: [noindex, allonge, mermaid]
---

Once upon a time, it was common in software job interviews to be asked to write code to solve some small problem. There were various philosophies aorund this practice, from [it's a quick way to filter out those with no programming ability whatsoever](https://en.wikipedia.org/wiki/Fizz_buzz#Programming) to a pretext for "having a conversation about what is important in programming."

Twenty years ago, a programmer named Konge got an interview with a Toronto Bank. His interviewer asked Konge to write a function that would determine whether a linked list has a cycle or not. Konge had never heard of this problem, but he had dabbled in Lisp and was very familiar witrh cons cells, so he tried to think hard about how to detect a cycle while the clock ticked and the interviewer started at him.

No pressure!

---

# Linked Lists

> “A linked list is a sequence of nodes that contain two fields: data, and a link to the next node. The last node is linked to a terminator used to signify the end of the list.”--[Wikipedia](https://en.wikipedia.org/wiki/Linked_list)

Here is one common way to diagram a linked list:

<div class="mermaid">
  graph LR
    b["1"]
    c["2"]
    d["3"]
    Empty["🚫"]

    b-->c-->d-->Empty
</div>

We can see that there are three nodes. The "data" for the nodes are the numbers 1, 2, and 3 respectively. The links between them are shown as arrows. The third and last node in the list does not link to another node. We show this as an arrow to a crossed circle, which signifies "empty."

We need a way to diagram an empty list, and a crossed circle is what we choose to use. So if we have an empty list, we show it like this:

<div class="mermaid">
  graph LR
    Empty["🚫"]
</div>

Linked lists support a primitive operation of prepending a new node to the beginning of the list, in constant time. So if we prepending "3" to the list, we get:

<div class="mermaid">
  graph LR
    d["3"]
    Empty["🚫"]

    d-->Empty
</div>

`3` is now the head of the list, and it links to empty, not to another node.

### well-formed linked lists

A well-formed linked list consists of:

1. Empty by itself
2. A head node that links to the head node of a well-formed linked list, becoming the new head node of the result.

So these linked lists fit that description:

<div class="mermaid">
  graph LR
    b["1"]
    c["2"]
    d["3"]
    d2["3"]
    Empty["🚫"]
    Empty2@{ shape: cross-circ }
    Empty3@{ shape: cross-circ }

    Empty

    d2--> Empty2

    b-->c-->d-->Empty3
</div>

Provided such a list has a finite set of nodes, it can be traversed in finite time by starting at the head and following the links from node to node until we reach Empty at the end.

### cycles in linked lists

It is possible to wire nodes together in a way that does not match this definition. One such way is to introduce a cycle or loop into the list. Here are a few examples

<div class="mermaid">
  graph LR
    a["4"]

    a-->a

    b["5"]
    c["6"]
    d["7"]

    b-->c-->d-->b

    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
</div>

`4` is a node that links to itself. It is its own head, and has no link to Empty `5-6-7` is a "cicular" list, the last node links back to the first. Any of these nodes could be used as a head, and again, no link to Empty. And `8-9-A-B-C` is not a cycle, but `8` is its head, which links to `9`, which links to `A`. `A`, `B`, and `C` form a cycle.

In all of these cases, attempting to enumerate the list by following the links between nodes will never halt. And thus, detecting whether a purported linked list contains a cycle is a useful tool to have.

---

# Detecting Cycles

### floyd's cycle detection

The solution the interviewer as looking for is called Floyd's Cycle-Finding Algorithm, or, "The Tortoise and the Hare" more colloquially. I prefer The Tortoise and the Hare because it describes exactly what the algorithm does.

The Tortoise and the Hare uses two pointers or cursors, each of which advances through the linked list. We will demonstrate the alorithm on three linked lists. We beging by placing the tortoise pointer on the first node in the list, and the hare pointer on the second. To place the hare pointer on the second node, we have to follow the link, which may lead us to Empty, or if there is just one node that links to itself, it remains on the only node.

(We will not show it here, but in the degenerate case where the list is empty, we report it does not contain a cycle).

<div class="mermaid">
  graph LR

    tortoise2["🐢"]
    hare2["🐰"]
    a["4"]

    a-->a
    tortoise2-->a
    hare2-->a
    
    tortoise["🐢"]
    hare["🐰"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    tortoise-->e
    hare-->f

    tortoise3["🐢"]
    hare3["🐰"]
    b["1"]
    c["2"]
    d["3"]
    Empty["🚫"]

    b-->c-->d-->Empty
    tortoise3-->b
    hare3-->c
</div>

And then we compare to see if both pointers point to the same node. This is the case for one of the three lists:

<div class="mermaid">
  graph LR

    tortoise2["🐢"]
    hare2["🐰"]
    a["4"]

    a-->a
    tortoise2-->a
    hare2-->a
</div>

We can report that this list has a cycle and stop.

For the other two lists, their pointers do not point to the same node, so we continue as follows: We simultaneously advance the tortoise by one step, and the hare by two. For one of our two lists, the hare now points to Empty, so we can report that this list does _not_ have a cycle, and stop:

<div class="mermaid">
  graph LR
    
    tortoise3["🐢"]
    hare3["🐰"]
    b["1"]
    c["2"]
    d["3"]
    Empty["🚫"]

    b-->c-->d-->Empty
    tortoise3-->c
    hare3-->Empty
</div>

The remaining list has its pointers pointing to different nodes, neither of which are empty. So we advance the tortoise one and the hare two nodes again. In fact, we will repeat advancing the tortoise on and the hare two until we detect a cycle or exhaust the list.

<div class="mermaid">
  graph LR
    
    tortoise["🐢"]
    hare["🐰"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    tortoise-->g
    hare-->g
</div>

This time the tortoise advances from `9` to `A`, while the hare advances from `B` to `C` and then to `A`. Bingo! Both pointers point to the same node, so this also contains a cycle.

And that is [The Tortoise and the Hare](https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_tortoise_and_hare). As it happens, that's what the interviewer wanted to Konge to come up with.

### brent's cycle detection algorithm

The first solution Konge offered—maintaining a set of links already visited—was rejected. He was told that the problem can be solved in constant space. During the interview, Konge couldn't solve the problem in constant space, and the interview ended.

Konge thougt about it on the subway home, and had an "Aha!" He wrote up his solution in Java and emailed it to the interviewer. The interviewer emailed right back: "Sorry, that is not the answer I was looking for."

The interviewer was looking for The Tortoise and the Hare, but Konge had unwittingly reinvented [Brent's Cycle Dectection Algorithm](https://www.geeksforgeeks.org/dsa/brents-cycle-detection-algorithm/), which is based on exponential search.
