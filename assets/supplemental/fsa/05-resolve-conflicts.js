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

const allStates =
  ({ start, transitions }) => {
    const stateSet = toStateSet(transitions);
    stateSet.add(start);
    return stateSet;
  };

function resolveConflictsWithNames (conflictingStates, description) {
  const conflictingStatesSet = new Set(conflictingStates);
  const descriptionStatesSet = allStates(description);

  const nameMap = new Map();

  // build the map to resolve overlaps with reserved names
  for (const descriptionState of descriptionStatesSet) {
    const match = /^(.*)-(\d+)$/.exec(descriptionState);
    let base = match == null ? descriptionState : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = descriptionState;
    while (conflictingStatesSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== descriptionState) {
  		nameMap.set(descriptionState, resolved);
    }
    conflictingStatesSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, description);
}

// given an iterable of names that are reserved,
// renames any states in a name so that they no longer
// overlap with reserved names
function resolveConflicts (first, second) {
  return resolveConflictsWithNames(allStates(first), second);
}
