console.log('07-merge-equivalent-states.js');

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

// ----------

verifyEvaluateB('(a|A)(b|B)(c|C)', regexD, {
  '': false,
  'a': false,
  'B': false,
  'bc': false,
  'abc': true,
  'abC': true,
  'aBc': true
});
