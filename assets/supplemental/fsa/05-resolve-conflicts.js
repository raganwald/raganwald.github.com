// given a mapping of individual names, renames all the states in
// an fas, including the start and accepting. any names not in the map
// rename unchanged
function renameStates (nameMap, { start, accepting, transitions }) {
  const translate =
    before =>
      nameMap.has(before) ? nameMap.get(before) : before;

  return {
    start: translate(start),
    accepting: accepting.map(translate),
    transitions:
    	transitions.map(
      	({ from, consume, to }) => {
          const transition = { from: translate(from), to: translate(to || from) };
          if (consume != null) transition.consume = consume;

          return transition;
        }
      )
  };
}

// given an iterable of names that are reserved,
// renames any states in a name so that they no longer
// overlap with reserved names
function resolveConflicts (first, second) {
  const { stateSet: firstStatesSet } = validatedAndProcessed(first);
  const { stateSet: secondStatesSet } = validatedAndProcessed(second);

  const nameMap = new Map();

  // build the map to resolve overlaps with reserved names
  for (const secondState of secondStatesSet) {
    const match = /^(.*)-(\d+)$/.exec(secondState);
    let base = match == null ? secondState : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = secondState;
    while (firstStatesSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== secondState) {
  		nameMap.set(secondState, resolved);
    }
    firstStatesSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, second);
}