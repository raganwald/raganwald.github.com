if (symbol === '\\') {
      if (input.length === 0) {
        error('Escape character has nothing to follow');
      } else {
        const valueSymbol = input.shift();

        // treat this new symbol as a value,
        // no matter what
        if (awaitingValue) {
          // push the string value of the valueSymbol
          // do not use valueOf

          outputQueue.push(valueSymbol);
          awaitingValue = false;
        } else {
          // implicit catenation

          input.unshift(valueSymbol);
          input.unshift('\\');
          input.unshift('->');
          awaitingValue = false;
        }

      }
    } else 