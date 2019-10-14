function toStateMap (transitions) {
  return transitions
      .reduce(
        (acc, transition) => {
          const {
            from,
            consume,
            to
          } = transition;

          if (from == null) {
            console.log(
              `Transition ${JSON.stringify(transition)} does not have a from state. ` +
              `This is not allowed and will be ignored.`
            )
            return acc;
          }

          if (!acc.has(from)) {
            acc.set(from, []);
          }

          const existingTransitions = acc.get(from);

          for (const { consume: existingConsume, to: existingTo } of existingTransitions) {
            if (consume === existingConsume && to === existingTo) {
              console.log(
                `Transition ${JSON.stringify(transition)} already exists. ` +
                `Duplicates will be ignored.`
              )
              return acc;
            }
            if (consume === existingConsume) {
              console.log(
                `Transition ${JSON.stringify(transition)} creates non-determinism ` +
                `between ${to} and ${existingTo}. `
                `This is not allowed and will be ignored.`
              )
              return acc;
            }
            if (consume == null || existingConsume == null) {
              console.log(
                `Transition ${JSON.stringify(transition)} creates an epsilon/~epsilon conflict. ` +
                `This is not allowed and will be ignored.`
              )
              return acc;
            }
          }

          existingTransitions.push(transition);

          return acc;
        },
        new Map()
      );
}

function automate({
  start,
  accepting,
  transitions
}) {
  // map from from states to the transitions defined for that from state
  const stateMap = toStateMap(transitions);
  const acceptingStates = new Set(accepting);
console.log(transitions)

  return function (string) {
    let state = start;
    let uncomsumedString = string;

    while (true) {
      const transitionsForThisState = stateMap.get(state) || [];

      for (const { consume, to } of transitionsForThisState) {
        if (consume == null) {
          // epsilon transition
          state = to;
          continue;
        } else if (uncomsumedString == '') {
          // reached the end of the string
          // no available transitions
          break;
        } else if (consume === string[0]) {
          // consume the token and repeat the loop
          state = to;
          uncomsumedString = uncomsumedString.substring(1);
          continue;
        }
      }

      // no epsilon or consuming transitions
      break;
    }

    // machine has reached a terminal state.
    if (uncomsumedString === '') {
      // reached the end. do we accept?
      return acceptingStates.has(state);
    } else {
      // stopped before reaching the end is a fail
      return false;
    }
  }
}

function test(description, examples) {
  const recognizer = automate(description);

  for (const example of examples) {
    console.log(`'${example}' => ${recognizer(example)}`);
  }
}

const f = {
  start: 'start',
  accepting: ['f'],
  transitions: [
    { from: 'start', consume: 'f', to: 'f' }
  ]
};

const empty = {
  start: 'start',
  accepting: ['start'],
  transitions: []
};

test(f, ['', 'f', 'foo']);