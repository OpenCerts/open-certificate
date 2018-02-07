const Certificate = require('./Certificate');
const {MerkleTree, checkProof} = require('./merkle');
const {flattenJson, hashArray, hashToBuffer, toBuffer} = require('./utils');

function CertificateBatch (certificates) {
  this.certificates = certificates
    .map(c => { return new Certificate(c).getRoot(); })
    .sort(Buffer.compare);

  this.merkleTree = new MerkleTree(this.certificates);
}

CertificateBatch.prototype.getRoot = function () {
  return this.merkleTree.getRoot();
};

CertificateBatch.prototype.getProof = function (certificate) {
  // if certificate is a cert object, change to cert, if its
  let buf = null;
  if (Buffer.isBuffer(certificate) && certificate.length === 32) {
    buf = certificate;
  } else {
    buf = new Certificate(certificate).getRoot();
  }

  let proof = null;
  try {
    proof = this.merkleTree.getProof(buf);
  } catch (err) {}

  return proof;
};

function issueCertificates (certificates) {
  if (!Array.isArray(certificates)) {
    throw new Error('Certificates must be in an array');
  }
  return new CertificateBatch(certificates);
}

module.exports = {
  issueCertificates
};
