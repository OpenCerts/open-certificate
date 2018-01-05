const deepReduce = require('deep-reduce');
const {sha3} = require('ethereumjs-util');

function flattenJson(object){
  const reducer = (reduced, value, path) => {
    if (typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
    ) {
      reduced[path] = value;
    }
    return reduced;
  }

  const reduced = deepReduce(object, reducer);

  const flattened = Object.keys(reduced).map((k) => {
    return {[k]:reduced[k]};
  });

  return flattened;
};

function hashArray(arr){
  const stringifiedArray = arr.map(i => JSON.stringify(i));
  let hashedArray = stringifiedArray.map(i => sha3(i));
  hashedArray.sort(Buffer.compare);

  return hashedArray;
}

module.exports = {
  flattenJson,
  hashArray,
}