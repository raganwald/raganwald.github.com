const optional =
  recognizer => union(EMPTY, recognizer);

function kleenePlus (description) {
  const { start, transitions, accepting } = avoidReservedNames(['empty'], description);

  const looped = {
    start: "empty",
    transitions:
    	transitions.concat(
          accepting.map(
            state => ({ from: state, to: start })
          )
        ).concat([
          { "from": "empty", "to": start }
        ]),
    accepting
  };

  return deDup(
    powerset(
      removeEpsilonTransitions(
        looped
      )
    )
  );
}

function kleeneStar (description) {
  return optional(kleenePlus(description));
}