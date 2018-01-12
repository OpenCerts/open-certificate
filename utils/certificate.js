const {MerkleTree, checkProof} = require('./merkle');
const {flattenJson, hashArray, hashToBuffer, toBuffer} = require('./utils');

function Certificate(certificate) {
  this.certificate = certificate;

  const flattenedObject = flattenJson(certificate);
  const hashedArray = hashArray(flattenedObject);
  
  this.merkleTree = new MerkleTree(hashedArray);
}

Certificate.prototype.getRoot = function(){
  return this.merkleTree.getRoot();
}

Certificate.prototype.proofCertificate = function(claims, proofs){
  let elements = [];

  if(claims && !(claims instanceof Array)) claims = flattenJson(claims);

  claims && claims.forEach(claim => {
    elements.push(toBuffer(claim));
  });

  proofs && proofs.forEach(proof => {
    elements.push(hashToBuffer(proof));
  });

  const treeToCompare = new MerkleTree(elements);

  return treeToCompare.getRoot().equals(this.merkleTree.getRoot());
}

Certificate.prototype.proofClaim = function(claim, proofs){
  const proofsBuf = proofs.map(p => hashToBuffer(p));
  return checkProof(proofsBuf, this.merkleTree.getRoot(), toBuffer(claim));
}

Certificate.prototype.getProof = function(claim){
  let proof = null;

  const flattenedClaim = flattenJson(claim);
  const claimToValidate = flattenedClaim[0];

  try {
    proof = this.merkleTree.getProof(toBuffer(claimToValidate))
  }catch(err){}

  return proof;
}

module.exports = Certificate;