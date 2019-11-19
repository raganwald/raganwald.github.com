function avoidReservedNames (reservedStates, second) {
  const reservedStateSet = new Set(reservedStates);
  const { stateSet: secondStatesSet } = validatedAndProcessed(second);

  const nameMap = new Map();

  // build the map to resolve overlaps with reserved names
  for (const secondState of secondStatesSet) {
    const match = /^(.*)-(\d+)$/.exec(secondState);
    let base = match == null ? secondState : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = secondState;
    while (reservedStateSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== secondState) {
  		nameMap.set(secondState, resolved);
    }
    reservedStateSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, second);
}

function epsilonUnion (first, second) {
  const newStartState = 'empty';
  const cleanFirst = avoidReservedNames([newStartState], first);
  const cleanSecond = resolveConflicts(cleanFirst, avoidReservedNames([newStartState], second));

  const concurrencyTransitions = [
    { "from": newStartState, "to": cleanFirst.start },
    { "from": newStartState, "to": cleanSecond.start },
  ];

  return {
    start: newStartState,
    accepting: cleanFirst.accepting.concat(cleanSecond.accepting),
    transitions:
      concurrencyTransitions
    	.concat(cleanFirst.transitions)
        .concat(cleanSecond.transitions)
  };
}
