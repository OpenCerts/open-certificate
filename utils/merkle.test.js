const utils = require('./utils');
const {sha3} = require('ethereumjs-util');
const {MerkleTree, checkProof} = require('./merkle');
const {toBuffer} = require('./utils');

describe('merkle', () => {
  const arr = [
    'item1',
    'item2',
    'item3',
    'item4',
    'item5'
  ];
  const bufferArr = utils.hashArray(arr);
  const tree = MerkleTree(bufferArr);

  describe('MerkleTree', () => {
    it('creates a merkle tree', () => {
      expect(tree.getRoot()).to.not.be.null;
      expect(tree.layers.length).to.equal(4);
    });

    it('has a proof for an element', () => {
      const proof = tree.getProof(arr[0]);
      expect(proof).to.not.be.null;
    });

    it('throws if item does not exist', () => {
      function proof () {
        return tree.getProof('SOMETHING_ELSE');
      }
      expect(proof).to.throw();
    });

    it('check if proof is valid for all items', () => {
      arr.forEach(i => {
        const hash = sha3(JSON.stringify(i));
        const proof = tree.getProof(i);
        assert(checkProof(proof, tree.getRoot(), hash));
      });
    });
  });

  describe('checkProof', () => {
    it('returns true for valid proof', () => {
      const proof = tree.getProof(arr[1]);
      assert(checkProof(proof, tree.getRoot(), toBuffer(arr[1])));
    });

    it('returns false for valid proof', () => {
      const proof = tree.getProof(arr[0]);
      assert(!checkProof(proof, tree.getRoot(), toBuffer(arr[1])));
    });
  });
});
