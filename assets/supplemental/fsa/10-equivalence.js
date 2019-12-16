console.log('10-equivalence.js');

function alternateExpr(...exprs) {
  const uniques = [...new Set(exprs)];
  const notEmptySets = uniques.filter( x => x !== '∅' );

  if (notEmptySets.length === 0) {
    return '∅';
  } else if (notEmptySets.length === 1) {
    return notEmptySets[0];
  } else {
    return notEmptySets.map(p).join('|');
  }
}

function catenateExpr (...exprs) {
  if (exprs.some( x => x === '∅' )) {
    return '∅';
  } else {
    const notEmptyStrings = exprs.filter( x => x !== 'ε' );

    if (notEmptyStrings.length === 0) {
      return 'ε';
    } else if (notEmptyStrings.length === 1) {
      return notEmptyStrings[0];
    } else {
      return notEmptyStrings.map(p).join('');
    }
  }
}

function zeroOrMoreExpr (a) {
  if (a === '∅' || a === 'ε') {
    return 'ε';
  } else {
    return `${p(a)}*`;
  }
}

function regularExpression (description) {
  const pruned =
    reachableFromStart(
      mergeEquivalentStates(
        description
      )
    );
  const {
    start,
    transitions,
    accepting,
    allStates
  } = validatedAndProcessed(pruned);

  if (accepting.length === 0) {
    return '∅';
  } else {
    const from = start;
    const pathExpressions =
      accepting.map(
        to => expression({ from, to })
      );

    const acceptsEmptyString = accepting.indexOf(start) >= 0;

    if (acceptsEmptyString) {
      return alternateExpr('ε', ...pathExpressions);
    } else {
      return alternateExpr(...pathExpressions);
    }

    function expression({ from, to, viaStates = [...allStates] }) {

      if (viaStates.length === 0) {
        const directExpressions =
          transitions
          .filter( ({ from: tFrom, to: tTo }) => from === tFrom && to === tTo )
          .map( ({ consume }) => toValueExpr(consume) );

        const direct = alternateExpr(...directExpressions);

        return direct;
      } else {
        const [via, ...exceptVia] = viaStates;

        const fromToVia = expression({ from, to: via, viaStates: exceptVia });
        const viaToVia = zeroOrMoreExpr(
          expression({ from: via, to: via, viaStates: exceptVia })
        );
        const viaToTo = expression({ from: via, to, viaStates: exceptVia });

        const throughVia = catenateExpr(fromToVia, viaToVia, viaToTo);
        const notThroughVia = expression({ from, to, viaStates: exceptVia });

        return alternateExpr(throughVia, notThroughVia);
      }
    }
  }
};

// ----------

verifyRecognizer(binary, {
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

const reconstitutedBinaryExpr = regularExpression(binary);

verifyEvaluate(reconstitutedBinaryExpr, formalRegularExpressions, {
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

