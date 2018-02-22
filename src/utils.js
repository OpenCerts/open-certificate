const { sha3 } = require("ethereumjs-util");

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
    : Buffer.from(hash, "hex");
}

module.exports = {
  hashArray,
  bufSortJoin,
  toBuffer,
  hashToBuffer
};
