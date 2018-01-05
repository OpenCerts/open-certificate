const {sha3} = require('ethereumjs-util');

function MerkleTree(_elements) {
  const elements = _elements.map(e => toBuffer(e));

  if (!(this instanceof MerkleTree)) {
    return new MerkleTree(elements)
  }

  this.elements = elements;

  // check buffers
  if (this.elements.some((e) => !(e.length === 32 && Buffer.isBuffer(e)))) {
    throw new Error('elements must be 32 byte buffers')
  }

  this.layers = getLayers(this.elements)
}

MerkleTree.prototype.getRoot = function() {
  return this.layers[this.layers.length - 1][0]
}

MerkleTree.prototype.getProof = function(_element, hex) {
  const element = toBuffer(_element);

  const index = getBufIndex(element, this.elements)
  if (index === -1) {
    throw new Error('element not found in merkle tree')
  }
  return getProof(index, this.layers, hex)
}

const checkProof = function(_proof, _root, _element) {
  const proof = _proof.map(step => toBuffer(step));
  const root = toBuffer(_root);
  const element = toBuffer(_element);

  return root.equals(proof.reduce((hash, pair) => {
    return combinedHash(hash, pair);
  }, element))
}

function combinedHash(first, second) {
  if (!second) { return first }
  if (!first) { return second }
  return sha3(bufSortJoin(first, second))
}

function getNextLayer(elements) {
  return elements.reduce((layer, element, index, arr) => {
    if (index % 2 === 0) { layer.push(combinedHash(element, arr[index + 1])) }
    return layer
  }, [])
}

function getLayers(elements) {
  if (elements.length === 0) {
    return [['']]
  }
  const layers = []
  layers.push(elements)
  while (layers[layers.length - 1].length > 1) {
    layers.push(getNextLayer(layers[layers.length - 1]))
  }
  return layers
}

function getProof(index, layers) {
  const proof = layers.reduce((proof, layer) => {
    let pair = getPair(index, layer)
    if (pair) { proof.push(pair) }
    index = Math.floor(index / 2)
    return proof
  }, [])
  return proof;
}

function getPair(index, layer) {
  let pairIndex = index % 2 ? index - 1 : index + 1
  if (pairIndex < layer.length) {
    return layer[pairIndex]
  } else {
    return null
  }
}

function getBufIndex(element, array) {
  for (let i = 0; i < array.length; i++) {
    if (element.equals(array[i])) { return i }
  }
  return -1
}

function bufToHex(element) {
  return Buffer.isBuffer(element) ? '0x' + element.toString('hex') : element
}

function bufSortJoin(...args) {
  return Buffer.concat([...args].sort(Buffer.compare))
}

function toBuffer(element){
  if(!(Buffer.isBuffer(element) && element.length === 32)){
    return sha3(JSON.stringify(element));
  }
  return element;
}

module.exports = {
  MerkleTree,
  checkProof
};