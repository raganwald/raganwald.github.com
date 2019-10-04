"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function automate(_ref) {
  var start = _ref.start,
      accepting = _ref.accepting,
      transitions = _ref.transitions;
  // map from from states to the transitions defined for that from state
  var stateMap = transitions.reduce(function (acc, transition) {
    var from = transition.from;

    if (from === accepting) {
      console.log("Transition ".concat(JSON.stringify(transition), " is a transition from the accepting state. This is not allowed."));
      return;
    }

    if (!acc.has(from)) {
      acc.set(from, []);
    }

    acc.get(from).push(transition);
    return acc;
  }, new Map()); // given a starting state defined by { internal, external, string },
  // returns a set of next states

  function performTransition(_ref2) {
    var string = _ref2.string,
        external = _ref2.external,
        internal = _ref2.internal;
    var transitionsForThisState = stateMap.get(internal);

    if (transitionsForThisState == null) {
      // a deliberate fail
      return [];
    }

    return transitionsForThisState.reduce(function (acc, _ref3) {
      var consume = _ref3.consume,
          pop = _ref3.pop,
          push = _ref3.push,
          to = _ref3.to;
      var string2 = string;

      if (consume === '') {
        if (string !== '') return acc; // not a match
      } else if (consume != null) {
        if (string === '') return acc; // not a match

        if (string[0] !== consume) return acc; // not a match

        string2 = string.substring(1); // match and consume
      }

      var external2 = external.slice(0);

      if (pop != null) {
        if (external2.pop() !== pop) return acc; // not a match
      }

      if (push != null) {
        external2.push(push);
      }

      var internal2 = to != null ? to : internal;
      acc.push({
        string: string2,
        external: external2,
        internal: internal2
      });
      return acc;
    }, []);
  }

  return function (string) {
    var currentStates = [{
      string: string,
      external: [],
      internal: start
    }];

    while (currentStates.length > 0) {
      currentStates = currentStates.flatMap(performTransition);

      if (currentStates.some(function (_ref4) {
        var internal = _ref4.internal;
        return internal === accepting;
      })) {
        return true;
      }
    }

    return false;
  };
}

function test(description, examples) {
  var recognizer = automate(description);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = examples[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var example = _step.value;
      console.log("'".concat(example, "' => ").concat(recognizer(example)));
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function statesOf(description) {
  return description.transitions.reduce(function (states, _ref5) {
    var from = _ref5.from,
        to = _ref5.to;
    if (from != null) states.add(from);
    if (to != null) states.add(to);
    return states;
  }, new Set([description.start, description.accepting]));
}

function renameStates(nameMap, description) {
  var translate = function translate(before) {
    return nameMap[before] != null ? nameMap[before] : before;
  };

  return {
    start: translate(description.start),
    accepting: translate(description.accepting),
    transitions: description.transitions.map(function (_ref6) {
      var from = _ref6.from,
          consume = _ref6.consume,
          pop = _ref6.pop,
          to = _ref6.to,
          push = _ref6.push;
      var transition = {
        from: translate(from)
      };
      if (consume != null) transition.consume = consume;
      if (pop != null) transition.pop = pop;
      if (to != null) transition.to = translate(to);
      if (push != null) transition.push = push;
      return transition;
    })
  };
}

function resolveCollisions(taken, description) {
  var takenNames = new Set(taken);
  var descriptionNames = statesOf(description);
  var nameMap = {};
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = descriptionNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var descriptionName = _step2.value;
      var name = descriptionName;
      var counter = 2;

      while (takenNames.has(name)) {
        name = "".concat(descriptionName, "-").concat(counter++);
      }

      if (name !== descriptionName) {
        nameMap[descriptionName] = name;
      }

      takenNames.add(name);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return renameStates(nameMap, description);
}

function prepareSecondForCatenation(start, accepting, first, second) {
  var uncollidedSecond = resolveCollisions(statesOf(first), second);
  var acceptingSecond = uncollidedSecond.accepting === accepting ? uncollidedSecond : renameStates(_defineProperty({}, uncollidedSecond.accepting, accepting), uncollidedSecond);
  return acceptingSecond;
}

function union() {
  function binaryUnion(first, second) {
    var _renameStates2, _renameStates3;

    var start = "start";
    var accepting = "accepting";
    var conformingFirst = renameStates((_renameStates2 = {}, _defineProperty(_renameStates2, first.start, start), _defineProperty(_renameStates2, first.accepting, accepting), _renameStates2), first);
    var renamedSecond = resolveCollisions(statesOf(conformingFirst), second);
    var conformingSecond = renameStates((_renameStates3 = {}, _defineProperty(_renameStates3, renamedSecond.start, start), _defineProperty(_renameStates3, renamedSecond.accepting, accepting), _renameStates3), renamedSecond);
    return {
      start: start,
      accepting: accepting,
      transitions: conformingFirst.transitions.concat(conformingSecond.transitions)
    };
  }

  for (var _len = arguments.length, descriptions = new Array(_len), _key = 0; _key < _len; _key++) {
    descriptions[_key] = arguments[_key];
  }

  return descriptions.reduce(binaryUnion);
}

function stackablesOf(description) {
  return description.transitions.reduce(function (stackables, _ref7) {
    var push = _ref7.push,
        pop = _ref7.pop;
    if (push != null) stackables.add(push);
    if (pop != null) stackables.add(pop);
    return stackables;
  }, new Set());
}

function isolatedStack(start, accepting, description) {
  var stackables = stackablesOf(description); // this is an FSA, nothing to see here

  if (stackables.size === 0) return description; // this is a PDA, make sure we clean the stack up

  var sentinel = "sentinel";
  var counter = 2;

  while (stackables.has(sentinel)) {
    sentinel = "".concat(sentinel, "-").concat(counter++);
  }

  var renamed = resolveCollisions([start, accepting], description);
  var pushSentinel = {
    from: start,
    push: sentinel,
    to: renamed.start
  };

  var popStackables = _toConsumableArray(stackables).map(function (pop) {
    return {
      from: renamed.accepting,
      pop: pop
    };
  });

  var popSentinel = {
    from: renamed.accepting,
    pop: sentinel,
    to: accepting
  };
  return {
    start: start,
    accepting: accepting,
    transitions: [pushSentinel].concat(_toConsumableArray(renamed.transitions), _toConsumableArray(popStackables), [popSentinel])
  };
}

function isPushdown(description) {
  return stackablesOf(description).size > 0;
}

;

function prepareFirstForCatenation(start, accepting, first, second) {
  var _nameMap;

  var safeFirst = isPushdown(first) && isPushdown(second) ? isolatedStack(start, accepting, first) : first;
  var nameMap = (_nameMap = {}, _defineProperty(_nameMap, safeFirst.accepting, second.start), _defineProperty(_nameMap, safeFirst.start, start), _nameMap);

  var _renameStates4 = renameStates(nameMap, first),
      transitions = _renameStates4.transitions;

  return {
    start: start,
    accepting: accepting,
    transitions: transitions.map(function (_ref8) {
      var from = _ref8.from,
          consume = _ref8.consume,
          pop = _ref8.pop,
          to = _ref8.to,
          push = _ref8.push;
      var transition = {
        from: from
      };
      if (consume != null && consume !== "") transition.consume = consume;
      if (pop != null) transition.pop = pop;
      if (to != null) transition.to = to;
      if (push != null) transition.push = push;
      return transition;
    })
  };
}

function catenation() {
  function binaryCatenation(first, second) {
    var start = "start";
    var accepting = "accepting";
    var catenatableSecond = prepareSecondForCatenation(start, accepting, first, second);
    var catenatableFirst = prepareFirstForCatenation(start, accepting, first, catenatableSecond);
    return {
      start: start,
      accepting: accepting,
      transitions: catenatableFirst.transitions.concat(catenatableSecond.transitions)
    };
  }

  for (var _len2 = arguments.length, descriptions = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    descriptions[_key2] = arguments[_key2];
  }

  return descriptions.reduce(binaryCatenation);
}

function symbol(s) {
  return {
    start: "start",
    accepting: "accepting",
    transitions: [{
      from: "start",
      consume: s,
      to: s
    }, {
      from: s,
      consume: "",
      to: "accepting"
    }]
  };
}

function any(charset) {
  return union.apply(void 0, _toConsumableArray(charset.split('').map(symbol)));
}

var EMPTY = {
  start: "start",
  accepting: "accepting",
  transitions: [{
    from: "start",
    consume: "",
    to: "accepting"
  }]
};

function zeroOrMore(description) {
  var start = description.start,
      accepting = description.accepting,
      transitions = description.transitions;
  var loopsBackToStart = {
    start: start,
    accepting: accepting,
    transitions: transitions.map(function (_ref9) {
      var from = _ref9.from,
          consume = _ref9.consume,
          pop = _ref9.pop,
          to = _ref9.to,
          push = _ref9.push;
      var transition = {
        from: from
      };
      if (pop != null) transition.pop = pop;
      if (push != null) transition.push = push;

      if (to === accepting && consume === "") {
        transition.to = start;
      } else {
        if (consume != null) transition.consume = consume;
        if (to != null) transition.to = to;
      }

      return transition;
    })
  };
  return union(EMPTY, loopsBackToStart);
} // console.log(union(symbol('0'), symbol('1'), symbol('2')))
// console.log(any("10"))
// const binary = union(
//   any("0"),
//   catenation(
//     any("1"),
//     zeroOrMore(any("01"))
//   )
// );
// test(binary, [
//   '', '0', '1', '00', '01', '10', '11',
//   '000', '001', '010', '011', '100',
//   '101', '110', '111',
//   '10100011011000001010011100101110111'
// ]);


function string() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  return catenation.apply(void 0, _toConsumableArray(str.split('').map(symbol).concat([EMPTY])));
} // test(string("r"), [
//   '', 'r', 'reg'
// ]);


function oneOrMore(description) {
  return catenation(description, zeroOrMore(description));
}

function zeroOrOne(recognizer) {
  return union(EMPTY, recognizer);
}

function permute() {
  function permuteArray(permutation) {
    var length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0);
    var i = 1;

    while (i < length) {
      if (c[i] < i) {
        var k = i % 2 && c[i];
        var p = permutation[i];
        permutation[i] = permutation[k];
        permutation[k] = p;
        ++c[i];
        i = 1;
        result.push(permutation.slice());
      } else {
        c[i] = 0;
        ++i;
      }
    }

    return result;
  }

  for (var _len3 = arguments.length, descriptions = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    descriptions[_key3] = arguments[_key3];
  }

  return union.apply(void 0, _toConsumableArray(permuteArray(descriptions).map(function (elements) {
    return catenation.apply(void 0, _toConsumableArray(elements));
  })));
}

///////////////////////////////////////////////////////////////////////


var startMap = symbol('{');
var endMap = symbol('}');
var whitespace = oneOrMore(any(' \t\r\n'));
var optionalWhitespace = zeroOrOne(whitespace);
var colon = symbol(':');
var startLabel = union(catenation(string('start'), optionalWhitespace, colon), catenation(string('"start"'), optionalWhitespace, colon), catenation(string("'start'"), optionalWhitespace, colon));
var singleSymbol = any(" \t\r\n:,[]{}-" + '0123456789' + 'abcdefghijklmnopqrstuvwxyz');
var state = oneOrMore(singleSymbol);
var singleQuotedState = catenation(symbol("'"), state, symbol("'"));
var doubleQuotedState = catenation(symbol('"'), state, symbol('"'));
var quotedState = union(singleQuotedState, doubleQuotedState);
var startClause = catenation(optionalWhitespace, startLabel, optionalWhitespace, quotedState, optionalWhitespace);
var acceptingLabel = union(catenation(string('accepting'), optionalWhitespace, colon), catenation(string('"accepting"'), optionalWhitespace, colon), catenation(string("'accepting'"), optionalWhitespace, colon));
var acceptingClause = catenation(optionalWhitespace, acceptingLabel, optionalWhitespace, quotedState, optionalWhitespace);
var transitionsLabel = union(catenation(string('transitions'), optionalWhitespace, colon), catenation(string('"transitions"'), optionalWhitespace, colon), catenation(string("'transitions'"), optionalWhitespace, colon));
var fromLabel = union(catenation(string('from'), optionalWhitespace, colon), catenation(string('"from"'), optionalWhitespace, colon), catenation(string("'from'"), optionalWhitespace, colon));
var fromClause = catenation(optionalWhitespace, fromLabel, optionalWhitespace, quotedState, optionalWhitespace);
var singleQuotedSymbol = catenation(symbol("'"), singleSymbol, symbol("'"));
var doubleQuotedSymbol = catenation(symbol('"'), singleSymbol, symbol('"'));
var quotedSymbol = union(singleQuotedSymbol, doubleQuotedSymbol);
var consumeLabel = union(catenation(string('consume'), optionalWhitespace, colon), catenation(string('"consume"'), optionalWhitespace, colon), catenation(string("'consume'"), optionalWhitespace, colon));
var consumable = union(quotedSymbol, string("''"), string('""'));
var consumeClause = catenation(optionalWhitespace, consumeLabel, optionalWhitespace, consumable, optionalWhitespace);
var popLabel = union(catenation(string('pop'), optionalWhitespace, colon), catenation(string('"pop"'), optionalWhitespace, colon), catenation(string("'pop'"), optionalWhitespace, colon));
var popClause = catenation(optionalWhitespace, popLabel, optionalWhitespace, quotedSymbol, optionalWhitespace);
var toLabel = union(catenation(string('to'), optionalWhitespace, colon), catenation(string('"to"'), optionalWhitespace, colon), catenation(string("'to'"), optionalWhitespace, colon));
var toClause = catenation(optionalWhitespace, toLabel, optionalWhitespace, quotedState, optionalWhitespace);
var pushLabel = union(catenation(string('push'), optionalWhitespace, colon), catenation(string('"push"'), optionalWhitespace, colon), catenation(string("'push'"), optionalWhitespace, colon));
var pushClause = catenation(optionalWhitespace, pushLabel, optionalWhitespace, quotedSymbol, optionalWhitespace);
var comma = symbol(',');
var startsWithFrom = catenation(fromClause, union(permute(catenation(comma, optionalWhitespace, consumeClause), zeroOrOne(catenation(comma, optionalWhitespace, popClause)), zeroOrOne(catenation(comma, optionalWhitespace, toClause)), zeroOrOne(catenation(comma, optionalWhitespace, pushClause))), permute(catenation(comma, optionalWhitespace, popClause), zeroOrOne(catenation(comma, optionalWhitespace, toClause)), zeroOrOne(catenation(comma, optionalWhitespace, pushClause))), permute(catenation(comma, optionalWhitespace, toClause), zeroOrOne(catenation(comma, optionalWhitespace, pushClause)))));
var startsWithConsume = catenation(consumeClause, permute(catenation(comma, optionalWhitespace, fromClause), zeroOrOne(catenation(comma, optionalWhitespace, popClause)), zeroOrOne(catenation(comma, optionalWhitespace, toClause)), zeroOrOne(catenation(comma, optionalWhitespace, pushClause))));
var startsWithPop = catenation(popClause, permute(catenation(comma, optionalWhitespace, fromClause), zeroOrOne(catenation(comma, optionalWhitespace, consumeClause)), zeroOrOne(catenation(comma, optionalWhitespace, toClause)), zeroOrOne(catenation(comma, optionalWhitespace, pushClause))));
var startsWithTo = catenation(toClause, permute(catenation(comma, optionalWhitespace, fromClause), zeroOrOne(catenation(comma, optionalWhitespace, consumeClause)), zeroOrOne(catenation(comma, optionalWhitespace, popClause)), zeroOrOne(catenation(comma, optionalWhitespace, pushClause))));
var startsWithPush = catenation(pushClause, union(permute(catenation(comma, optionalWhitespace, fromClause), catenation(comma, optionalWhitespace, consumeClause), zeroOrOne(catenation(comma, optionalWhitespace, popClause)), zeroOrOne(catenation(comma, optionalWhitespace, toClause))), permute(catenation(comma, optionalWhitespace, fromClause), catenation(comma, optionalWhitespace, popClause), zeroOrOne(catenation(comma, optionalWhitespace, toClause))), permute(catenation(comma, optionalWhitespace, fromClause), catenation(comma, optionalWhitespace, toClause))));
var stateDescription = catenation(startMap, union(startsWithFrom, startsWithConsume, startsWithPop, startsWithTo, startsWithPush), endMap);
var stateElement = catenation(optionalWhitespace, stateDescription, optionalWhitespace);
var stateList = catenation(symbol('['), stateElement, zeroOrMore(catenation(comma, stateElement)), symbol(']'));
var transitionsClause = catenation(transitionsLabel, optionalWhitespace, stateList, optionalWhitespace);
var description = catenation(startMap, union(catenation(startClause, permute(catenation(comma, acceptingClause), catenation(comma, transitionsClause))), catenation(acceptingClause, permute(catenation(comma, startClause), catenation(comma, transitionsClause))), catenation(transitionsClause, permute(catenation(comma, startClause), catenation(comma, acceptingClause)))), endMap);

////////////////////////////////////////////////////////////////////////////////////////////

var stringDescription = JSON.stringify(description, null, 2);

const fs = require('fs');

fs.writeFile("./description.pp.json", stringDescription, function(err) {

    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});