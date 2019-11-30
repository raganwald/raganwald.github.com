console.log('14-enhancements.js');

function kleenePlus (description) {
  return catenation(description, kleeneStar(description));
}

const operators2 = new Map(
  [...formalOperators.entries()].concat([
    ['+', { symbol: Symbol('+'), precedence: 3, arity: 1, fn: kleenePlus }]
  ])
);

const SYMBOLIC = `~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`;
const WHITESPACE = ` \r\n\t`;
const EVERYTHING = any(ALPHANUMERIC + SYMBOLIC + WHITESPACE);

const operators3 = new Map(
  [...formalOperators.entries()].concat([
    ['.', { symbol: Symbol('.'), precedence: 99, arity: 0, fn: () => EVERYTHING }]
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

const oddLength = toFiniteStateRecognizer('.(..)*', operators3);

verify(oddLength, {
  '': false,
  '1': true,
  '{}': false,
  '[0]': true,
  '()()': false,
  'x o x': true
});
