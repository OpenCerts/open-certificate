const _ = require("lodash");
const { MerkleTree, checkProof } = require("./merkle");
const { flattenJson, hashToBuffer, toBuffer } = require("./utils");

function evidenceTree(certificate) {
  const { evidence, privateEvidence } = certificate.badge;

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

function certificateTree(certificate, evidences) {
  const cert = _.cloneDeep(certificate);

  if (cert.signature) {
    delete cert.signature;
  }
  if (cert.badge.evidence) {
    delete cert.badge.evidence;
  }
  if (cert.badge.privateEvidence) {
    delete cert.badge.privateEvidence;
  }

  if (evidences) {
    cert.badge.evidenceRoot = evidences.getRoot().toString("hex");
  }

  const flattenedCertificate = flattenJson(cert);
  const certificateElements = flattenedCertificate.map(e => toBuffer(e));

  const tree = new MerkleTree(certificateElements);

  return tree;
}

function Certificate(certificate) {
  this.certificate = certificate;

  // Build an evidence tree if either evidence or private evidence is present
  if (certificate.badge.evidence || certificate.badge.privateEvidence) {
    this.evidenceTree = evidenceTree(certificate);
    this.evidenceRoot = this.evidenceTree.getRoot().toString("hex");
  }

  this.certificateTree = certificateTree(certificate, this.evidenceTree);
}

function verifyCertificate(certificate) {
  // Checks the signature of the certificate
  if (!certificate.signature)
    throw new Error("Certificate does not have a signature");
  if (certificate.signature.type !== "SHA3MerkleProof")
    throw new Error("Signature algorithm is not supported");
  if (!certificate.signature.targetHash)
    throw new Error("Certificate does not have a targetHash");
  if (!certificate.signature.merkleRoot)
    throw new Error("Certificate does not have a merkleRoot");

  const generatedCertificate = new Certificate(certificate);
  const targetHash = generatedCertificate.getRoot().toString("hex");

  // Check the target hash of the certificate matches the signature's target hash
  if (targetHash !== certificate.signature.targetHash)
    throw new Error("Certificate hash does not match signature's targetHash");

  // Check if target hash resolves to merkle root
  if (
    !checkProof(
      certificate.signature.proof,
      certificate.signature.merkleRoot,
      certificate.signature.targetHash
    )
  )
    throw new Error("Certificate proof is invalid for merkle root");

  return true;
}

Certificate.prototype.getRoot = function() {
  return this.certificateTree.getRoot();
};

Certificate.prototype.verify = function() {
  return verifyCertificate(this.certificate);
};

module.exports = Certificate;
