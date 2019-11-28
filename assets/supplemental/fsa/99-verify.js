const binary = {
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ],
  "accepting": ["zero", "notZero"]
};

verify(binary, {
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

const reg = {
  "start": "empty",
  "accepting": ["reg"],
  "transitions": [
    { "from": "empty", "consume": "r", "to": "r" },
    { "from": "empty", "consume": "R", "to": "r" },
    { "from": "r", "consume": "e", "to": "re" },
    { "from": "r", "consume": "E", "to": "re" },
    { "from": "re", "consume": "g", "to": "reg" },
    { "from": "re", "consume": "G", "to": "reg" }
  ]
};

verify(reg, {
  '': false,
  'r': false,
  'R': false,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
});

const uppercase = {
  "start": "uppercase",
  "accepting": ["uppercase"],
  "transitions": [
    { "from": "uppercase", "consume": "A", "to": "uppercase" },
    { "from": "uppercase", "consume": "B", "to": "uppercase" },
    { "from": "uppercase", "consume": "C", "to": "uppercase" },
    { "from": "uppercase", "consume": "D", "to": "uppercase" },
    { "from": "uppercase", "consume": "E", "to": "uppercase" },
    { "from": "uppercase", "consume": "F", "to": "uppercase" },
    { "from": "uppercase", "consume": "G", "to": "uppercase" },
    { "from": "uppercase", "consume": "H", "to": "uppercase" },
    { "from": "uppercase", "consume": "I", "to": "uppercase" },
    { "from": "uppercase", "consume": "J", "to": "uppercase" },
    { "from": "uppercase", "consume": "K", "to": "uppercase" },
    { "from": "uppercase", "consume": "L", "to": "uppercase" },
    { "from": "uppercase", "consume": "M", "to": "uppercase" },
    { "from": "uppercase", "consume": "N", "to": "uppercase" },
    { "from": "uppercase", "consume": "O", "to": "uppercase" },
    { "from": "uppercase", "consume": "P", "to": "uppercase" },
    { "from": "uppercase", "consume": "Q", "to": "uppercase" },
    { "from": "uppercase", "consume": "R", "to": "uppercase" },
    { "from": "uppercase", "consume": "S", "to": "uppercase" },
    { "from": "uppercase", "consume": "T", "to": "uppercase" },
    { "from": "uppercase", "consume": "U", "to": "uppercase" },
    { "from": "uppercase", "consume": "V", "to": "uppercase" },
    { "from": "uppercase", "consume": "W", "to": "uppercase" },
    { "from": "uppercase", "consume": "X", "to": "uppercase" },
    { "from": "uppercase", "consume": "Y", "to": "uppercase" },
    { "from": "uppercase", "consume": "Z", "to": "uppercase" }
  ]
};

verify(uppercase, {
  '': true,
  'r': false,
  'R': true,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});

verify(productUnion(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});

verify(productIntersection(reg, uppercase), {
  '': false,
  'r': false,
  'R': false,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
});

const zeroes = {
  "start": 'empty',
  "accepting": ['zeroes'],
  "transitions": [
    { "from": 'empty', "consume": '0', "to": 'zeroes' },
    { "from": 'zeroes', "consume": '0', "to": 'zeroes' }
  ]
};

const nondeterministic =
  reachableFromStart(
    removeEpsilonTransitions(
      epsilonCatenate(zeroes, binary)
    )
  );

const deterministic = powerset(nondeterministic);

verify(deterministic, {
  '': false,
  '0': false,
  '1': false,
  '00': true,
  '01': true,
  '10': false,
  '11': false,
  '000': true,
  '001': true,
  '010': true,
  '011': true,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});
