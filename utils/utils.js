const deepReduce = require("deep-reduce");
const { sha3 } = require("ethereumjs-util");

function flattenJson(object) {
  const reducer = (reduced, value, path) => {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      reduced[path] = value;
    }
    return reduced;
  };

  const reduced = deepReduce(object, reducer);

  const flattened = Object.keys(reduced).map(k => ({ [k]: reduced[k] }));

  return flattened;
}

function hashArray(arr) {
  const stringifiedArray = arr.map(i => JSON.stringify(i));
  const hashedArray = stringifiedArray.map(i => sha3(i));
  hashedArray.sort(Buffer.compare);

  return hashedArray;
}

function bufSortJoin(...args) {
  return Buffer.concat([...args].sort(Buffer.compare));
}

// If element is not a buffer, stringify it and then hash it to be a buffer
function toBuffer(element) {
  return Buffer.isBuffer(element) && element.length === 32
    ? element
    : sha3(JSON.stringify(element));
}

// If hash is not a buffer, convert it to buffer (without hashing it)
function hashToBuffer(hash) {
  return Buffer.isBuffer(hash) && hash.length === 32
    ? hash
    : Buffer(hash, "hex");
}

module.exports = {
  flattenJson,
  hashArray,
  bufSortJoin,
  toBuffer,
  hashToBuffer
};
