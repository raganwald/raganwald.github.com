function automate (description) {
  const {
    stateMap,
    start,
    acceptingSet,
    transitions
  } = validatedAndProcessed(description);

  return function (string) {
    let state = start;
    let unconsumed = string;

    while (unconsumed !== '') {
      const transitionsForThisState = stateMap.get(state) || [];
      const transition =
      	transitionsForThisState.find(
          ({ consume }) => consume === unconsumed[0]
      	);

      if (transition == null) {
        // the machine stops
      	break;
      }

      const { to } = transition;
      unconsumed = unconsumed.substring(1);

      state = to;
    }

    // machine has reached a terminal state.
    if (unconsumed === '') {
      // reached the end. do we accept?
      return acceptingSet.has(state);
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
