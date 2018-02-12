const Certificate = require("./certificate");
const { MerkleTree } = require("./merkle");

function CertificateBatch(certificates) {
  this.certificates = certificates
    .map(c => new Certificate(c).getRoot())
    .sort(Buffer.compare);

  this.merkleTree = new MerkleTree(this.certificates);
}

CertificateBatch.prototype.getRoot = function() {
  return this.merkleTree.getRoot();
};

CertificateBatch.prototype.getProof = function(certificate) {
  // if certificate is a cert object, change to cert, if its
  let buf = null;
  if (Buffer.isBuffer(certificate) && certificate.length === 32) {
    buf = certificate;
  } else {
    buf = new Certificate(certificate).getRoot();
  }

  return this.merkleTree.getProof(buf);
};

function issueCertificates(certificates) {
  if (!Array.isArray(certificates)) {
    throw new Error("Certificates must be in an array");
  }
  return new CertificateBatch(certificates);
}

module.exports = {
  issueCertificates
};
