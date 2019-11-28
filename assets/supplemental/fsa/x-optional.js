// x-optional.js

const optional =
  recognizer => union(EMPTY, recognizer);

// ----------

const regMaybeReginald = catenation(
  just('reg'),
  optional(just('inald'))
);

verify(regMaybeReginald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});