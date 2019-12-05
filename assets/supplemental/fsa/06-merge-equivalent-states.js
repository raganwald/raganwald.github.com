console.log('06-merge-equivalent-states.js');

const keyS =
  (transitions, accepting) => {
    const stringifiedTransitions =
      transitions
        .map(({ consume, to }) => `${consume}-->${to}`)
        .sort()
        .join(', ');
    const acceptingSuffix = accepting ? '-->*' : '';

    return `[${stringifiedTransitions}]${acceptingSuffix}`;
  };

function mergeEquivalentStates (description) {
  searchForDuplicate: while (true) {
    let {
      start,
      transitions: allTransitions,
      accepting,
      states,
      stateMap,
      acceptingSet
    } = validatedAndProcessed(description);

    const statesByKey = new Map();

    for (const state of states) {
      const stateTransitions = stateMap.get(state) || [];
      const isAccepting = acceptingSet.has(state);
      const key = keyS(stateTransitions, isAccepting);

      if (statesByKey.has(key)) {
        // found a dup!
        const originalState = statesByKey.get(key);

        if (start === state) {
          // point start to original
          start = originalState;
        }

        // remove duplicate's transitions
        allTransitions = allTransitions.filter(
          ({ from }) => from !== state
        );

        // rewire all former incoming transitions
        allTransitions = allTransitions.map(
          ({ from, consume, to }) => ({
            from, consume, to: (to === state ? originalState : to)
          })
        );

        if (isAccepting) {
          // remove state from accepting
          accepting = accepting.filter(s => s !== state)
        }

        // reset description
        description = { start, transitions: allTransitions, accepting };

        // and then start all over again
        continue searchForDuplicate;
      } else {
        statesByKey.set(key, state);
      }
    }
    // no duplicates found
    break;
  }

  return description;
}

function union2merged (a, b) {
  return mergeEquivalentStates(
    union2(a, b)
  );
}

const regexD = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: emptyString
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: union2merged
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: catenation2
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

function verifyStateCount (configuration, examples) {
  function countStates (regex) {
    const fsr = evaluateB(regex, configuration);

    const states = toStateSet(fsr.transitions);
    states.add(fsr.start);

    return states.size;
  }

  return verify(countStates, examples);
}

// ----------

const caseInsensitiveABC = "(a|A)(b|B)(c|C)"
const abcde = "(a|b|c|d|e)";
const lowercase =
  "(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)";

const fiveABCDEs =
  `${abcde}${abcde}${abcde}${abcde}${abcde}`;
const twoLowercaseLetters =
  `${lowercase}${lowercase}`;

verifyEvaluateB(caseInsensitiveABC, regexC, {
  '': false,
  'a': false,
  'z': false,
  'ab': false,
  'kl': false,
  'abc': true,
  'AbC': true,
  'edc': false,
  'abcde': false,
  'abCde': false,
  'dcabe': false,
  'abcdef': false
});

verifyEvaluateB(fiveABCDEs, regexC, {
  '': false,
  'a': false,
  'z': false,
  'ab': false,
  'kl': false,
  'abc': false,
  'AbC': false,
  'edc': false,
  'abcde': true,
  'dcabe': true,
  'abcdef': false,
  'abCde': false
});

verifyEvaluateB(twoLowercaseLetters, regexC, {
  '': false,
  'a': false,
  'z': false,
  'ab': true,
  'kl': true,
  'abc': false,
  'AbC': false,
  'edc': false,
  'abcde': false,
  'dcabe': false,
  'abcdef': false,
  'abCde': false
});

verifyStateCount(regexC, {
  [caseInsensitiveABC]: 7,
  [fiveABCDEs]: 26,
  [twoLowercaseLetters]: 53
});

verifyEvaluateB(caseInsensitiveABC, regexD, {
  '': false,
  'a': false,
  'z': false,
  'ab': false,
  'kl': false,
  'abc': true,
  'AbC': true,
  'edc': false,
  'abcde': false,
  'abCde': false,
  'dcabe': false,
  'abcdef': false
});

verifyEvaluateB(fiveABCDEs, regexD, {
  '': false,
  'a': false,
  'z': false,
  'ab': false,
  'kl': false,
  'abc': false,
  'AbC': false,
  'edc': false,
  'abcde': true,
  'dcabe': true,
  'abcdef': false,
  'abCde': false
});

verifyEvaluateB(twoLowercaseLetters, regexD, {
  '': false,
  'a': false,
  'z': false,
  'ab': true,
  'kl': true,
  'abc': false,
  'AbC': false,
  'edc': false,
  'abcde': false,
  'dcabe': false,
  'abcdef': false,
  'abCde': false
});

verifyStateCount(regexD, {
  [caseInsensitiveABC]: 4,
  [fiveABCDEs]: 6,
  [twoLowercaseLetters]: 3
});

