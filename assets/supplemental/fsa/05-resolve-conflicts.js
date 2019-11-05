// given a mapping of individual names, renames all the states in
// an fas, including the start and accepting. any names not in the map
// rename unchanged
function renameStates (nameDictionary, { start, accepting, transitions }) {
  const translate =
    before =>
      (nameDictionary[before] != null) ? nameDictionary[before] : before;

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
function resolveConflicts(reserved, description) {
  const reservedSet = new Set(reserved);
  const { states } = validatedAndProcessed(description);

  const nameMap = {};

  // build the map to resolve overlaps with reserved names
  for (const state of states) {
    const match = /^(.*)-(\d+)$/.exec(state);
    let base = match == null ? state : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = state;
    while (reservedSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== state) {
  		nameMap[state] = resolved;
    }
    reservedSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, description);
}