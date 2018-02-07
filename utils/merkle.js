const {sha3} = require('ethereumjs-util');
const {bufSortJoin, toBuffer, hashToBuffer} = require('./utils');

function MerkleTree (_elements) {
  const elements = _elements
    .map(e => toBuffer(e))
    .sort(Buffer.compare);

  if (!(this instanceof MerkleTree)) {
    return new MerkleTree(elements);
  }

  this.elements = elements;

  // check buffers
  if (this.elements.some((e) => !(e.length === 32 && Buffer.isBuffer(e)))) {
    throw new Error('elements must be 32 byte buffers');
  }

  this.layers = getLayers(this.elements);
}

MerkleTree.prototype.getRoot = function () {
  return this.layers[this.layers.length - 1][0];
};

MerkleTree.prototype.getProof = function (_element) {
  const element = toBuffer(_element);

  const index = getBufIndex(element, this.elements);
  if (index === -1) {
    throw new Error('Element not found');
  }
  return getProof(index, this.layers);
};

const checkProof = function (_proof, _root, _element) {
  const proof = _proof.map(step => hashToBuffer(step));
  const root = hashToBuffer(_root);
  const element = toBuffer(_element);

  const proofRoot = proof.reduce((hash, pair) => {
    return combinedHash(hash, pair);
  }, element);

  return root.equals(proofRoot);
};

function combinedHash (first, second) {
  if (!second) { return first; }
  if (!first) { return second; }
  return sha3(bufSortJoin(first, second));
}

function getNextLayer (elements) {
  return elements.reduce((layer, element, index, arr) => {
    if (index % 2 === 0) { layer.push(combinedHash(element, arr[index + 1])); }
    return layer;
  }, []);
}

function getLayers (elements) {
  if (elements.length === 0) {
    return [['']];
  }
  const layers = [];
  layers.push(elements);
  while (layers[layers.length - 1].length > 1) {
    layers.push(getNextLayer(layers[layers.length - 1]));
  }
  return layers;
}

function getProof (index, layers) {
  const proof = layers.reduce((proof, layer) => {
    let pair = getPair(index, layer);
    if (pair) { proof.push(pair); }
    index = Math.floor(index / 2);
    return proof;
  }, []);
  return proof;
}

function getPair (index, layer) {
  let pairIndex = index % 2 ? index - 1 : index + 1;
  if (pairIndex < layer.length) {
    return layer[pairIndex];
  } else {
    return null;
  }
}

function getBufIndex (element, array) {
  for (let i = 0; i < array.length; i++) {
    if (element.equals(array[i])) { return i; }
  }
  return -1;
}

module.exports = {
  MerkleTree,
  checkProof
};
