// Compare an event to the provided specification, and print a helpful summary of mismatches.
function checkEvent(index, event, name, args) {
  const failures = [];
  if (event.event != name) {
    failures.push(`Event name should be "${name}", but was "${event.event}"`);
  }
  Object.keys(args).forEach(key => {
    if (event.args[key] == undefined) {
      failures.push(`Key ${key} not found`);
      return;
    }
    const realValue = getValue(event.args[key]);
    const expectedValue = args[key];
    if (expectedValue._receiveValue) {
      expectedValue._receiveValue(realValue);
      return;
    }
    if (realValue != expectedValue) {
      failures.push(`Argument "${key}" should be <${expectedValue}>, but was <${realValue}>`);
    }
  });
  assert(failures.length === 0, `Event ${index} (${event.event}):\n${failures.join("\n")}`);
}

function getValue(value) {
  if (typeof(value) == 'string') return value;
  if (typeof(value) == 'boolean') return value;
  return value.c[0];
}

// Create a function that destructures a tuple into an object with helpful keys.
module.exports.tupleReader = function() {
  const fieldNames = Array.prototype.slice.call(arguments);
  return (tuple) => {
    const result = {};
    let index = 0;
    fieldNames.forEach((fieldName) => result[fieldName] = getValue(tuple[index++]));
    return result;
  };
}

function addContains(result, index) {
  result.contains = (name, args) => {
    return addContains(result.then(logs => {
      checkEvent(index, logs[index], name, args);
      return logs;
    }), index + 1);
  };
  return result;
}

// Perform the supplied action then check the logs.
// Returns a Promise, so always await it or random things will happen.
module.exports.checkLogs = (action) => {
  return addContains(action().then((result) => result.logs), 0);
}

module.exports.instanceFactory = (contract) => {
  return (description, test) => {
    it(description, async() => {
      const instance = await contract.new();
      await test(instance);
    });
  };
}

module.exports.mustFail = async function(failureDescription, action) {
  try {
    await(action());
    assert.failed(failureDescription);
  } catch (e) {}
}

module.exports.getBalance = function(account) {
  return new Promise((resolve, reject) =>
    web3.eth.getBalance(account, (err, hashValue) => {
      if(err)
        return error(err);
      else {
        return resolve(hashValue);
      }
    }));
  };

  module.exports.ref = () => {
    let captured = {};
    return {
      _receiveValue: (value) => { captured.value = value; },
      get: () => captured.value
    };
  }

  module.exports.any = {
    _receiveValue: (value) => {}
  }

  module.exports.matching = function(predicate, failureDescription) {
    return {
      _receiveValue: (value) => {
        if (!predicate(value)) {
          assert.failed(failureDescription);
        }
      }
    };
  }
