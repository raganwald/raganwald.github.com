


### types and alphabets

Dyck languages are not restricted to literal parentheses. The symbols we use comprise a language's *alphabet*. Just like the basic 26-character "Western" alphabet, every symbol in a language's alphabet must be unique. Our simplest example of balanced parentheses uses `(` and `()`, so its alphabet is `()`. And although we will talk about languages having "balanced parentheses," the symbols can be anything we choose, even things we don't usually call parentheses, such as `↗↙` or `«»`.

---

[![Typeface created by Theo Van Doesburg, 1919](/assets/de-stijl/theo-van-doesburg-font.png)](https://www.1001fonts.com/theo-van-doesburg-font.html)
*Typeface created by Theo Van Doesburg, 1919*

---

Languages with one pair of parentheses are called Dyck-1 languages. Can a Dyck language have more than one pair of parentheses? Of course! Dyck languages with more than one pair of parentheses are called *typed* Dyck languages, because the type of parentheses must match as well as the open and closed parentheses must match. And Dyck-1 languages are *untyped*, because the only matching to be done is open versus closed.

Here are a few alphabets and their characteristics:

|Alphabet                    |Class  |Typed?   |Example        |
|:---------------------------|:------|:--------|:--------------|
|`()`                        |Dyck-1 | Untyped |`((()()))(())` |
|`10`                        |Dyck-1 | Untyped |`101010111000` |
|`↗↙`, `↑↓`                  |Dyck-2 | Typed   |`↗↗↙↑↓↙`       |
|`()`, `[]`, `{}`            |Dyck-3 | Typed   |`{()[]}{}`     |
|`«»`, `⸘‽`, `<>`, `¿?`, `¡!`|Dyck-5 | Typed   |`⸘<>‽«»`       |

<br>

For the remainder of our discussion, we'll use standard parentheses, but everything we do will also apply to Dyck languages that use different alphabets.

### properties of dyck languages

Dyck languages have a few interesting properties:

1. Dyck languages have [context-sensitive grammars][A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata].
2. Dyck languages can be recognized with both [pushdown automata][A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata] and [recursive regular expressions][A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata].
3. Dyck languages are *concatenative*: If `A₁` and `A₂` are words in the Dyck language with vocabulary `Vᴬ`, then the word `A₁A₂` is also a word in the Dyck language with alphabet `Vᴬ`.
4. Likewise, if `D` is a word in the Dyck language with alphabet `Vᴰ`, and `E` is a word in the Dyck language with alphabet `Vᴱ`, then the word`DE` will be a word in the Dyck language with alphabet `Vᴰ ∪ Vᴱ`, the *union* of the two alphabets.
5. There are several ways to express the grammar of Dyck languages, but we will use `S → ε | "(" S ")" S` for Dyck-1 languages, and `S → ε | "(" S ")" S | "[" S "]" S | "{" S "}" S` for Dyck-3 languages.

Now that we've reviewed balanced parentheses, we're ready to solve some problems.

---

[![Gerrit Thomas Rietveld, Chauffeur’s workhome, ©Pedro Kok](/assets/de-stijl/gerrit-rietveld-chauffeur-house-pedro-kok-3.jpg.webp)](https://marcelogardinetti.wordpress.com/2013/01/07/gerrit-rietveld-casa-del-chofer/#jp-carousel-2644)
*Gerrit Thomas Rietveld, Chauffeur’s workhome, ©Pedro Kok*

---

# Generating Balanced Parentheses

---

The first problem we will solve is the following: Given an alphabet for a Dyck language, generate every word in that language (eventually). *Every word of finite length must be output in finite time.* Our strategy will start with generating every word with untyped balanced parentheses, `S → ε | "(" S ")" S`. We will then expand our algorithm to generate typed balanced parentheses.

But before we do, let's not forget that this isn't a particularly hard problem. We may solve it in an interesting way, but

### hilbert's hotel

The grammar `S → ε | "(" S ")" S` says that every word in untyped balanced parentheses is either:

1. The empty string (`ε`), or;
2. Composed of two shorter words

[Hilbert's paradox of the Grand Hotel][hh] is a thought experiment which illustrates a counterintuitive property of infinite sets: It demonstrates that a fully occupied hotel with infinitely many rooms may still accommodate additional guests, even infinitely many of them, and this process may be repeated infinitely often.

[hh]: https://en.wikipedia.org/wiki/Hilbert%27s_paradox_of_the_Grand_Hotel

[deterministic, context-free grammar]: https://raganwald.com/2019/02/14/i-love-programming-and-programmers.html#balanced-parentheses-is-a-deterministic-context-free-language

There are a few ways to define "balanced parentheses." The one we will use as the basis of our generator is:

1. The atom `''` is a balanced string.
2. Given any two balanced strings b<sub>x</sub> and b<sub>y</sub>, The string `(`b<sub>x</sub>`)`b<sub>x</sub> is balanced.

The second of these two rules defines a composition operation for balanced strings: For any two balanced strings, there is a third balanced string that composes them together.



- De Stijl theme
- do balanced parens recursively
- show bug
- fix with diagonalization
- now do tuples of numbers
- extract the pattern into a diagonalization operator
- typescript


### notes on recursion

Dyck words are `Xd₁Yd₂` where `d₁` and `d₂` are empty or a Dyck words, and `X != Y`. If the empty string – ε (lower-case epsilon) – is a Dyck word, then we can build a tree of Dyck words by diagonalizing `d₁` (horizontal) and `d₂` (vertical). When they are both empty (as defined), the resulting Dyck word is `XY`:

|   | ε  |
| ε | XY |

---

### a bonus problem

Enthusiastic readers can try their hand at writing a function or generator that prints/generates all possible valid balanced parentheses strings. Yes, such a function will obviously run to infinity if left unchecked, a generator will be easier to work with.

The main thing to keep in mind is that such a generator must be arranged so that every finite balanced parentheses string must be output after a finite number of iterations. The following pseudo-code will not work:

```javascript
function * balanced () {
  yield ''; // the only valid string with no top-level pairs

  for (let p = 0, true; ++p) {
    // yield every balanced parentheses string with p top-level parentheses
  }
}
```

A generator function written with this structure would first yield an infinite number of strings with a single top-level pair of balanced parentheses, e.g. `(), (()), ((())), (((()))), ...`. Therefore, strings like `()()` and `()()()`, which are both valid, would not appear within a finite number of iterations.

It's an interesting exercise, and very much related to grammars and production rules.

---

[![Birmingham Central Library](/assets/images/pushdown/birmingham.jpg)](https://www.flickr.com/photos/frmark/5308847783)

[Pattern Matching and Recursion]: https://raganwald.com/2018/10/17/recursive-pattern-matching.html


[A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata]: https://raganwald.com/2019/02/14/i-love-programming-and-programmers.html

[Dyck Language]: https://en.wikipedia.org/wiki/Dyck_language