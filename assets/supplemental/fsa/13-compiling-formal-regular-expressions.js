// 13-compiling-formal-regular-expressions.js

// ----------

const binary2 = union(just1('0'), catenation(just1('1'), kleeneStar(union(just('0'), just('1')))));

verify(binary2, {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true,
  '10100011011000001010011100101110111': true
});

const regMaybeInald = catenation(
  just('r'),
  just('e'),
  just('g'),
  union(
    EMPTY_STRING,
    catenation(
      just('i'),
      just('n'),
      just('a'),
      just('l'),
      just('d')
    )
  )
);

verify(regMaybeInald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});
