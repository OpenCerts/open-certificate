const jsonld = require('jsonld');
const {MerkleTree, checkProof} = require('./merkle');
const {flattenJson, hashArray, hashToBuffer, toBuffer} = require('./utils');

function evidenceTree (certificate) {
  const {
    evidence,
    privateEvidence
  } = certificate.badge;

  let evidenceHashes = [];

  // Flatten visible evidencee and hash each of them
  if (evidence) {
    const flattenedEvidence = flattenJson(evidence);
    const hashedEvidences = flattenedEvidence.map(e => toBuffer(e));
    evidenceHashes = evidenceHashes.concat(hashedEvidences);
  }

  // Include all private evidence hashes
  if (privateEvidence) {
    const hashedPrivateEvidences = privateEvidence.map(e => hashToBuffer(e));
    evidenceHashes = evidenceHashes.concat(hashedPrivateEvidences);
  }

  // Build a merkle tree with all the hashed evidences
  const tree = new MerkleTree(evidenceHashes);

  return tree;
}

function certificateTree (certificate, evidenceTree) {
  if (certificate.signature) delete certificate.signature;
  if (certificate.badge.evidence) delete certificate.badge.evidence;
  if (certificate.badge.privateEvidence) delete certificate.badge.privateEvidence;

  if (evidenceTree) {
    certificate.badge.evidenceRoot = evidenceTree.getRoot().toString('hex');
  }

  const flattenedCertificate = flattenJson(certificate);
  const certificateElements = flattenedCertificate.map(e => toBuffer(e));

  const tree = new MerkleTree(certificateElements);

  return tree;
}

function Certificate (certificate) {
  // Build an evidence tree if either evidence or private evidence is present
  if (certificate.badge.evidence || certificate.badge.privateEvidence) {
    this.evidenceTree = evidenceTree(certificate);
    this.evidenceRoot = this.evidenceTree.getRoot().toString('hex');
  }

  this.certificateTree = certificateTree(certificate, this.evidenceTree);
}

Certificate.prototype.getRoot = function () {
  return this.certificateTree.getRoot();
};

module.exports = Certificate;
