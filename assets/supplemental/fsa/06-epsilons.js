function epsilonJoin (first, second) {
  const unconflictedSecond =  resolveConflicts(first, second);

  const joinTransitions =
    first.accepting.map(
      from => ({ from, to: unconflictedSecond.start })
    );

  return {
    start: first.start,
    accepting: unconflictedSecond.accepting,
    transitions:
      first.transitions
        .concat(joinTransitions)
        .concat(unconflictedSecond.transitions)
  };
}

function epsilonsRemoved ({ start, accepting, transitions }) {
  const transitionsWithoutEpsilon =
    transitions
      .filter(({ consume }) => consume != null);
  const stateMapWithoutEpsilon = toStateMap(transitionsWithoutEpsilon);
  const epsilonMap =
    transitions
      .filter(({ consume }) => consume == null)
      .reduce((acc, { from, to }) => (acc.set(from, to), acc), new Map());
  const acceptingSet = new Set(accepting);

  while (epsilonMap.size > 0) {
    let [[epsilonFrom, epsilonTo]] = [...epsilonMap.entries()];

    const seen = new Set([epsilonFrom]);

    while (epsilonMap.has(epsilonTo)) {
      if (seen.has(epsilonTo)) {
        const display =
          [...seen]
            .map(f => `${f} -> ${epsilonMap.get(f)}`)
            .join(', ');
        error(`The epsilon path { ${display} } includes a loop. This is invalid.`);
      }
      epsilonFrom = epsilonTo;
      epsilonTo = epsilonMap.get(epsilonFrom);
      seen.add(epsilonFrom);
    }

    // from -> to is a valid epsilon transition
    // remove it by making a copy of the destination
    // (destination must not be an epsilon, by viture of above code)

    const source =
      stateMapWithoutEpsilon.get(epsilonTo) || [];
    const moved =
      source.map(
        ({ consume, to }) => ({ from: epsilonFrom, consume, to })
      );

    const existingTransitions = stateMapWithoutEpsilon.get(epsilonFrom) || [];

    // now add the moved transitions
    stateMapWithoutEpsilon.set(epsilonFrom, existingTransitions.concat(moved));

    // special case!
    if (acceptingSet.has(epsilonTo)) {
      acceptingSet.add(epsilonFrom);
    }

    // and remove the original from our epsilonMap
    epsilonMap.delete(epsilonFrom);
  }

  return {
    start,
    accepting: [...acceptingSet],
    transitions: [
      ...stateMapWithoutEpsilon.values()
    ].flatMap( tt => tt )
  };
}

function reachableFromStart ({ start, accepting, transitions: allTransitions }) {
  const stateMap = toStateMap(allTransitions);
  const reachableMap = new Map();
  const R = new Set([start]);

  while (R.size > 0) {
    const [state] = [...R];
    R.delete(state);
    const transitions = stateMap.get(state) || [];

    // this state is reacdhable
    reachableMap.set(state, transitions);

    const reachableFromThisState =
      transitions.map(({ to }) => to);

    const unprocessedReachableFromThisState =
      reachableFromThisState
        .filter(to => !reachableMap.has(to) && !R.has(to));

    for (const reachableState of unprocessedReachableFromThisState) {
      R.add(reachableState);
    }
  }

  return {
    start,
    accepting,
    transitions: [...reachableMap.values()].flatMap(tt => tt)
  };
}