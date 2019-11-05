function dfa (description) {
  const {
    start,
    transitions,
    states: nfaStates,
    acceptingSet: nfaAcceptingSet,
    stateMap: nfaStateMap
  } = validatedAndProcessed(description, true);

  const transitionsGroupedByOrigin =
    [...nfaStateMap.values()];

  const consumptions =
    transitionsGroupedByOrigin
      .map(
        transitions => transitions.map( ({ consume }) => consume )
      );

  const isDeterministic =
    consumptions.every(
      consumes => consumes.length === new Set(consumes).size
    );

  if (isDeterministic) {
    return description;
  }

  const nameMap =
    [...nfaStates]
      .reduce(
        (acc, s) => (acc.set(s, `(${s})`), acc),
        new Map()
      );

  function name (states) {
    const key = states.sort().map(s => `(${s})`).join('');

    if (nameMap.has(key)) {
      return nameMap.get(key);
    } else {
      const base = states.join(',');
      let readable = base;
      let n = 1;

      const existingStates = new Set([...nameMap.values()]);

      while (existingStates.has(readable)) {
        readable = `${base}${++n}`;
      }

      return readable;
    }
  }

  console.log({ nameMap });

  const dfaStateMap = new Map();
  const dfaAcceptingSet = new Set();

  const R = new Map();
  R.set(name([start]), [start]);

  while (R.size > 0) {
    const [[state, states]] = [...R.entries()];
    R.delete(state);

    // get the aggregate transitions
    const transitions =
      states.flatMap(s => nfaStateMap.get(s) || []);

    const distinctConsumptions =
      new Set(transitions.map(({ consume }) => consume));

    const routes =
      transitions.reduce(
        (acc, { consume, to }) => {
          acc.set(consume, (acc.get(consume) || []).concat([to]));
          return acc;
        },
        new Map()
      );

    const nfaTransitions = [];
  	for (const [consume, destinations] of routes.entries()) {
      const destination = name(destinations);

      nfaTransitions.push({ from: state, consume, to: destination });
      if (!dfaStateMap.has(destination) && !R.has(destination)) {
        R.set(destination, destinations);
      }
    }

    dfaStateMap.set(state, nfaTransitions);

    const anyStateIsAccepting =
      states.find(s => nfaAcceptingSet.has(s));
    if (anyStateIsAccepting) {
      dfaAcceptingSet.add(state);
    }

  }

  return {
    start,
    accepting: [...dfaAcceptingSet],
    transitions:
      [...dfaStateMap.values()]
        .flatMap(tt => tt)
  };
}