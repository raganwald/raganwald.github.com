console.log('14-enhancements.js');

function kleenePlus (description) {
  return catenation(description, kleeneStar(description));
}

const operators2 = new Map(
  [...formalOperators.entries()].concat([
    ['+', { symbol: Symbol('+'), precedence: 3, arity: 1, fn: kleenePlus }]
  ])
);

function optional (description) {
  return union(EMPTY_STRING, description);
}

const operators3 = new Map(
  [...formalOperators.entries()].concat([
    ['?', { symbol: Symbol('?'), precedence: 3, arity: 1, fn: optional }]
  ])
);

const SYMBOLIC = `~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`;
const WHITESPACE = ` \r\n\t`;
const EVERYTHING = any(ALPHANUMERIC + SYMBOLIC + WHITESPACE);

const operators4 = new Map(
  [...formalOperators.entries()].concat([
    ['.', { symbol: Symbol('.'), precedence: 99, arity: 0, fn: () => EVERYTHING }]
  ])
);

const withDotAndIntersection = new Map(
  [...formalOperators.entries()].concat([
    ['.', { symbol: Symbol('.'), precedence: 99, arity: 0, fn: () => EVERYTHING }],
    ['∩', { symbol: Symbol('∩'), precedence: 99, arity: 2, fn: intersection }]
  ])
);


// ----------

verify(kleenePlus(Aa), {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

const zeroOrMoreAs = toFiniteStateRecognizer('(a|A)*', operators2);
const oneOrMoreAs = toFiniteStateRecognizer('(a|A)+', operators2);

verify(zeroOrMoreAs, {
  '': true,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

verify(oneOrMoreAs, {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

const regMaybeReginald = toFiniteStateRecognizer('reg(inald)?', operators3);

verify(regMaybeReginald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});

const oddLength = toFiniteStateRecognizer('.(..)*', operators4);

verify(oddLength, {
  '': false,
  '1': true,
  '{}': false,
  '[0]': true,
  '()()': false,
  'x o x': true
});

const oddBinary = toFiniteStateRecognizer('(0|(1(0|1)*))∩(.(..)*)', withDotAndIntersection);

verify(oddBinary, {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true
});
