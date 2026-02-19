---
title: Detecting whether a linked list has a cycle
published: true
tags: [noindex, allonge, mermaid]
---

> “A linked list is a sequence of nodes that contain two fields: data, and a link to the next node. The last node is linked to a terminator used to signify the end of the list.”--[Wikipedia](https://en.wikipedia.org/wiki/Linked_list)

---

# Linked Lists

---

Before we discuss detecting whether linked lists can have a cycle, a quick review of what a linked list *is*, using graphs

### digraphs, nodes, and links

A [digraph](https://en.wikipedia.org/wiki/Directed_graph) (an abbreviation of “directed graph”) is a finite collection of vertices we will call _nodes_, connected to each other with directed edges we will call _links_. Our digraphs will have the following properties:

- There are a finite number of nodes;
- Nodes have labels that help us identify them in discussions;
- All nodes have an [indegree](https://en.wikipedia.org/wiki/Directed_graph#Indegree_and_outdegree) of zero or more;
- There is one special node, which we will label `Empty`, that has as [outdegree](https://en.wikipedia.org/wiki/Directed_graph#Indegree_and_outdegree) of zero;
- All other nodes will have an outdegree of one.

Here is how we will diagram nodes and the links between them. This is a digraph:

<div class="mermaid">
  graph LR
    star-->lisa-->macintosh-->Empty(("∅"))
    next-->macintosh
</div>

And here are two more:

<div class="mermaid">
  graph LR
    ipod-->iphone-->ipad-->Empty(("∅"))

    eat-->sleep-->wake-->eat
</div>

### linked lists

A [linked list](https://en.wikipedia.org/wiki/Linked_list) consists of taking any node in a digraph that we shall call the _head_, plus all the other nodes that can be reached by following outlinks in order from the head. There are seven linked lists in this digraph:

<div class="mermaid">
  graph LR
    Empty(("∅"))

    A-->E-->F-->Empty
    B-->C-->E
    D-->F
</div>

Here they are:

<div class="mermaid">
  graph LR
    Empty1(("∅"))

    F2["F"]
    Empty2(("∅"))

    F2-->Empty2

    E3["E"]
    F3["F"]
    Empty3(("∅"))

    E3-->F3-->Empty3


    A4["A"]
    E4["E"]
    F4["F"]
    Empty4(("∅"))

    A4-->E4-->F4-->Empty4

    C5["C"]
    E5["E"]
    F5["F"]
    Empty5(("∅"))

    C5-->E5-->F5-->Empty5

    B6["B"]
    C6["C"]
    E6["E"]
    F6["F"]
    Empty6(("∅"))

    B6-->C6-->E6-->F6-->Empty6

    D7["D"]
    F7["F"]
    Empty7(("∅"))

    D7-->F7-->Empty7
</div>

Trivially, every node in a digraph is the head of some linked list.

Diagramming all the linked lists in a digraph can become tedious, so we will use a linear notation for linked lists. The seven lists above can also be written inline as `∅`, `F→∅`, `E→F→∅`, `A→E→F→∅`, `C→E→F→∅`, `B→C→E→F→∅`, `D→F→∅`.

### cycles

Not all linked lists end with `Empty`. For example, a chain of one or more nodes that links back to its head forms a cycle:

<div class="mermaid">
  graph LR
    a-->a

    b-->c-->d-->b
</div>

We can write these inline as `

Cycles are also linked lists. Cycles can have any indegree, but cycles always have no outdegrees, because all the nodes in the cycle link to other nodes in the cycle.

Here are two cycles that have an indegree of one:

<div class="mermaid">
  graph LR
    ex["x"]

    z-->y-->ex-->ex

    w-->v-->u-->t-->s-->u
</div>

In the first example, `z` and `y` form a chain that leads to `x`, which forms a cycle by linking to itself. Likewise `w` and `v` form a chain that leads to `u`, which forms a cycle with `t` and `s`. Since every node in a diagraph is the head of a linked list, and every node that can be reached from the head by following links belongs to that head's linked list, it follows that `y


There are ten linked lists in this digraph, and they all end in a cycle:

<div class="mermaid">
  graph LR
    A-->B-->C-->D-->A

    e-->f-->A

    g-->f

    h-->A
    
    i-->j-->B
</div>

We will list them rather than drawing them, so  that we can use a notation to show a cycle inline: `ABCDA...`, `BCDAB...`, `CDABC...`, `DABCD...`, `fABCDA...`, `efABCDA...`, `gfABCDA...`, `hABCDA...`, `jBCDAB...`, and `ijBCDAB...`

### exercises

Here are a few things to can work out for yourself before moving on.

- Must a linked list contain `Empty` or a cycle?
- Can a linked list contain more than one `Empty`?
- Can a linked list contain more than one cycle?
- Can a linked list contain both `Empty` _and_ a cycle?

---

# Detecting Cycles in Linked Lists

---

[![A tortoise beats a hare in a race](/assets/images/cycles/tortoise-and-hare.png)](https://www.flickr.com/photos/88394234@N04/8139271342/)

---

## The Tortoise and the Hare

The solution the interviewer was looking for is called [Floyd's Cycle-Finding Algorithm](https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_tortoise_and_hare), or more colloquially, "The Tortoise and the Hare."

The Tortoise and the Hare uses two pointers or cursors, each of which advances through the linked list. We will demonstrate the algorithm on three linked lists. We begin by placing the tortoise pointer on the first node in the list, and the hare pointer on the second. To place the hare pointer on the second node, we have to follow the link, which may lead us to `Empty`, or if there is just one node that links to itself, it remains on the only node.

(We will not show it here, but in the degenerate case where the list is empty, we report it does not contain a cycle).

<div class="mermaid">
  graph LR

    tortoise2["🐢"]
    hare2["🐰"]
    a["4"]

    a-->a
    tortoise2-.-a
    hare2-.-a
    
    tortoise["🐢"]
    hare["🐰"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    tortoise-.-e
    hare-.-f

    tortoise3["🐢"]
    hare3["🐰"]
    b["1"]
    c["2"]
    d["3"]
    Empty(("∅"))

    b-->c-->d-->Empty
    tortoise3-.-b
    hare3-.-c
</div>

And then we compare to see if both pointers point to the same node. This is the case for one of the three lists:

<div class="mermaid">
  graph LR

    tortoise2["🐢"]
    hare2["🐰"]
    a["4"]

    a-->a
    tortoise2-.-a
    hare2-.-a
</div>

We can report that this list has a cycle and stop.

For the other two lists, their pointers do not point to the same node, so we continue as follows: We simultaneously advance the tortoise by one step, and the hare by two. For one of our two lists, the hare now points to `Empty`, so we can report that this list does _not_ have a cycle, and stop:

<div class="mermaid">
  graph LR
    
    tortoise3["🐢"]
    hare3["🐰"]
    b["1"]
    c["2"]
    d["3"]
    Empty(("∅"))

    b-->c-->d-->Empty
    tortoise3-.-c
    hare3-.-Empty
</div>

The remaining list has its pointers pointing to different nodes, neither of which are `Empty`. So we advance the tortoise one and the hare two nodes again.

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
    tortoise-.-g
    hare-.-g
</div>

This time the tortoise advances from `9` to `A`, while the hare advances from `B` to `C` and then to `A`. Bingo! Both pointers point to the same node, so this also contains a cycle. And that is The Tortoise and the Hare.

Remember Kóngur? The interviewer had clearly hoped Kóngur would either have already known about or invent in real time The Tortoise and the Hare. Whether it is realistic to expect stressed interviewees to replicate in 30 minutes what the Old Gods of Computer Science took months, years, or decades to discover is a matter for another essay.

But what of Kóngur?

## Kóngur's Solution

Kóngur thought about linked lists and cycles on the subway home, and then he had an "Aha!" moment. He wrote up his solution in Java and emailed it to the interviewer. The interviewer emailed right back: "Sorry, that is not the answer I was looking for."

Kóngur's solution also used two pointers. The first pointer, the base pointer, is placed on the first element of the list, and the second pointer, the search pointer, is placed on the second element of the list. And there is a third addition: A search counter, which we show as the number two on the arc from search to node:

<div class="mermaid">
  graph LR
    
    base["⛺️"]
    search["🔍"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    base-.-e
    search-.-|"2"|f
</div>

We compare the two pointers, they do not match. Then we move the search pointer one node forward, and decrement its counter:

<div class="mermaid">
  graph LR
    
    base["⛺️"]
    search["🔍"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    base-.-e
    search-.-|"1"|g
</div>

We compare the base and search pointers, and again they do not match. But now when we move the search pointer forward and decrement the counter, it becomes zero:

<div class="mermaid">
  graph LR
    
    base["⛺️"]
    search["🔍"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    base-.-e
    search-.-|"0"|h
</div>

When the counter reaches zero, we do three things:

1. We bring the base pointer up to point at the same cell as the search pointer;
2. We move the search pointer one node forward;
3. We double the counter's inital value: Since we started with 2, it now becomes 4. The next time it would become 8, the time after 16, and so forth.

Here's what we have after bringing the base pointer up, advancing teh search pointer, and doubling its initial value:

<div class="mermaid">
  graph LR
    
    base["⛺️"]
    search["🔍"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    base-.-h
    search-.-|"4"|i
</div>

We compare, see that the two nodes don't match, and increment the search pointer while decrementing the count as we did before:

<div class="mermaid">
  graph LR
    
    base["⛺️"]
    search["🔍"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    base-.-h
    search-.-|"3"|g
</div>

The nodes do not match, so we do it again:

<div class="mermaid">
  graph LR
    
    base["⛺️"]
    search["🔍"]
    e["8"]
    f["9"]
    g["A"]
    h["B"]
    i["C"]

    e-->f-->g-->h-->i-->g
    base-.-h
    search-.-|"2"|h
</div>

And now they match, so we report that the linked list does contain a cycle.

---

![Exponential Search](/assets/images/cycles/exponential-search.png)

---

## Exponential Search

> In computer science, an [exponential search](https://en.wikipedia.org/wiki/Exponential_search) (also called doubling search or galloping search or Struzik search) is an algorithm, created by Jon Bentley and Andrew Chi-Chih Yao in 1976, for searching sorted, unbounded/infinite lists.

We won't diagram it here, but as we are given a sorted, infinite list of integers, we have indexed access: It takes the same time to obtain the 76,345th integre as it does the first. That is very different from working with linked lists.

If we had a finite list of sorted integers and we wanted to know if a "target" integer was included in the list, we would use [binary search](https://en.wikipedia.org/wiki/Binary_search). But binary search does not work on an infinite list.

If we could find an integer in the set that is less than the target integer, and another greater than the target inteer, we could use a binary search on that finite range of integers, even if the entire set is infinite. So exponential search is a two step process:

1. Find the indices for an integer less than the target and another greater than the target, then;
2. Do a binary search on that range of indices.

The "exponential" idea is to start by checking the first integer, the one at index `0`. If that is too high, we know the integer is not present in the set. If it is the target integer, we know that it *is* present in the set. But if the first integer is less than the target integer, we then count two forward, to index `2`. If that integer is higher than the taregt integer, we can search the range `[1..2]`. Let's say it's not there.

Well, we move forward and search indices `[3..6]` the same way: Check whether the integer at index `6` is higher than the target. We know that index `2` is les sthan the taret, so we can do a binary search And then `[7..14]`, and so forth, doubling the size of the range we check every time we don't find it and can't rule it out. Eventually, perhaps 

<!-- The interviewer was looking for The Tortoise and the Hare, but Kóngur had unwittingly reinvented [Brent's Cycle Dectection Algorithm](https://en.wikipedia.org/wiki/Cycle_detection#Brent's_algorithm), which is based on exponential search. -->
