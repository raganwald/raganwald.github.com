function union (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab =
    mergeEquivalentStates(
      reachableFromStart(
        powerset(
          removeEpsilonTransitions(
            epsilonUnion(a, b)
          )
        )
      )
    );

  return union(ab, ...rest);
}

function intersection (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = mergeEquivalentStates(productIntersection(a, b));

  return intersection(ab, ...rest);
}

function catenation (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab =
    mergeEquivalentStates(
      powerset(
        reachableFromStart(
          removeEpsilonTransitions(
            epsilonCatenate(a, b)
          )
        )
      )
    );

  return catenation(ab, ...rest);
}
