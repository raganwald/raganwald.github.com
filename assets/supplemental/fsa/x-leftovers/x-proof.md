A demonstration aims to appeal to intuition, rather than formal reasoning. For example, the canonical proof that "If a finite-state automaton recognizes a language, that language is regular" runs along the following lines:[^cs390]

[cs390]: This explanation of the proof is taken from Shunichi Toida's notes for [CS390 Introduction to Theoretical Computer Science Structures ](https://www.cs.odu.edu/~toida/courses/TE.CS390.13sp/index.html). The proof of this aspect of Kleene's Theorem can be found [here](https://www.cs.odu.edu/~toida/nerzic/390teched/regular/fa/kleene-2.html).

> Given a finite automaton, first relabel its states with the integers 1 through n, where n is the number of states of the finite automaton. Next denote by L(p, q, k) the set of strings representing paths from state p to state q that go through only states numbered no higher than k. Note that paths may go through arcs and vertices any number of times.
Then the following lemmas hold.

> **Lemma 1**: L(p, q, k+1) = L(p, q, k)  L(p, k+1, k)L(k+1, k+1, k)*L(k+1, q, k) .

> What this lemma says is that the set of strings representing paths from p to q passing through states labeled with k+1 or lower numbers consists of the following two sets:
> 1. L(p, q, k) : The set of strings representing paths from p to q passing through states labeled with k or lower numbers.
> 2. L(p, k+1, k)L(k+1, k+1, k)*L(k+1, q, k) : The set of strings going first from p to k+1, then from k+1 to k+1 any number of times, then from k+1 to q, all without passing through states labeled higher than k.

> ![Illustrating Kleene's Theorem © Shunichi Toida](/assets/images/fsa/kleene2.jpg)

> **Lemma 2**: L(p, q, 0) is regular.

> **Proof**: L(p, q, 0) is the set of strings representing paths from p to q without passing any states in between. Hence if p and q are different, then it consists of single symbols representing arcs from p to q. If p = q, then  is in it as well as the strings representing any loops at p (they are all single symbols). Since the number of symbols is finite and since any finite language is regular, L(p, q, 0) is regular.

> From Lemmas 1 and 2 by induction the following lemma holds.

> **Lemma 3**: L(p, q, k) is regular for any states p and q and any natural number k.

> Since the language accepted by a finite automaton is the union of L(q0, q, n) over all accepting states q, where n is the number of states of the finite automaton, we have the following converse of the part 1 of Kleene Theorem.

> **Theorem 2** (Part 2 of Kleene's Theorem): **Any language accepted by a finite automaton is regular**.

The above proof takes the approach of describing--in words and diagrams--an algorithm.[^algo] Given any finite-state automaton that recognizes a language, this algorithm produces an equivalent regular expression. Froma  programmer's perspective, if you want to prove taht for any `A`, there is an equivalent `B`, writing a working `A --> B` compiler is a very powerful demonstration..

[^algo]: Lots of proofs attest to the existence of some thing, but not all are algorithms for actually finding/making the thing they attest exists. For example, there is a proof that a standard Rubik's Cube can be solved with at most 20 moves, although nobody has yet developed an algorithm to find the 20 (or fewer) move solution for any cube.

Of course, algorithms described in words and diagrams have the advantage of being universal, like pseudo-code. But the disadvantage of algorithms described in words and diagrams is that we can't play with them, optimize them, and learn by doing. For example, here is the core of the above proof, expressed as an algorithm (the complete code is [here](/assetssupplemental/fsa/13-regular-expression.js))

```javascript
function L (p, q, k) {
  if (k === 0) {
    // degenerate case, doesn't go through any other states
    // just look for direct transitions
    const pqTransitions = transitions.filter(
      ({ from, to }) => from === stateList[p] && to === stateList[q]
    );

    const pqDirectExpressions =
      pqTransitions.map(
        ({ consume }) => quote(consume)
      );

    if (p === q) {
      return unionOf('ε',  ...pqDirectExpressions);
    } else {
      return unionOf(...pqDirectExpressions);
    }
  } else {
    const pq = L(p, q, k-1);

    const pk = L(p, k, k-1);
    const kk = kleeneStarOf(L(k, k, k-1));
    const kq = L(k, q, k-1);
    const pkkq = catenationOf(pk, kk, kq);

    const pqMaybeThroughK = unionOf(pq, pkkq);

    return pqMaybeThroughK;
  }
}
```