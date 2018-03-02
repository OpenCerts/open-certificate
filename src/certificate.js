const _ = require("lodash");
const { MerkleTree, checkProof } = require("./merkle");
const { hashToBuffer, toBuffer } = require("./utils");
const { flatten } = require("flat");

function evidenceTree(certificate) {
  const { evidence, privateEvidence } = certificate.badge;

  let evidenceHashes = [];

  // Flatten visible evidencee and hash each of them
  if (evidence) {
    let flattenedEvidence = flatten(evidence);

    flattenedEvidence = _.omitBy(flattenedEvidence, _.isEmpty);

    const hashedEvidences = Object.keys(flattenedEvidence).map(k => {
      const obj = {};
      obj[k] = flattenedEvidence[k];
      return toBuffer(obj);
    });

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

  const flattenedCertificate = flatten(cert);
  const certificateElements = Object.keys(flattenedCertificate).map(k => {
    const obj = {};
    obj[k] = flattenedCertificate[k];
    return toBuffer(obj);
  });

  const tree = new MerkleTree(certificateElements);

  return tree;
}

function Certificate(certificate) {
  this.certificate = certificate;

  // Build an evidence tree if either evidence or private evidence is present
  if (
    this.certificate.badge.evidence ||
    this.certificate.badge.privateEvidence
  ) {
    this.evidenceTree = evidenceTree(this.certificate);
    this.evidenceRoot = this.evidenceTree.getRoot().toString("hex");
  }

  this.certificateTree = certificateTree(this.certificate, this.evidenceTree);
}

function verifyCertificate(certificate) {
  // Checks the signature of the certificate
  if (!certificate.signature)
    throw new Error("Certificate does not have a signature");
  if (!certificate.signature.targetHash)
    throw new Error("Certificate does not have a targetHash");
  if (certificate.signature.type !== "SHA3MerkleProof")
    throw new Error("Signature algorithm is not supported");
  if (!certificate.signature.merkleRoot)
    throw new Error("Certificate does not have a merkleRoot");

  const generatedCertificate = new Certificate(certificate);
  const targetHash = generatedCertificate.getRoot().toString("hex");

  // Check the target hash of the certificate matches the signature's target hash
  if (targetHash !== certificate.signature.targetHash)
    throw new Error("Certificate hash does not match signature targetHash");

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

Certificate.prototype.privacyFilter = function _privacyFilter(fields) {
  const filteredCertificate = _.cloneDeep(this.certificate);

  const { evidence, privateEvidence } = filteredCertificate.badge;
  const { type, saltLength } = filteredCertificate.badge.evidencePrivacyFilter;
  if (!type) throw new Error("Privacy filter algorithm cannot be found");
  if (!saltLength) throw new Error("Privacy salt length cannot be found");
  if (type !== "SaltedProof") throw new Error("Unsupported privacy filter");

  const valuesToRemove = fields instanceof Array ? fields : [fields];

  // Pick out the evidence we want to privatise
  const privateEvidences = flatten(_.pick(evidence, valuesToRemove));
  const hashedEvidences = Object.keys(privateEvidences).map(k => {
    const obj = {};
    obj[k] = privateEvidences[k];
    return toBuffer(obj).toString("hex");
  });

  // Unset the privatised evidence fields
  valuesToRemove.forEach(path => {
    _.unset(evidence, path);
  });

  let mergedEvidence = [];

  if (privateEvidence) mergedEvidence = mergedEvidence.concat(privateEvidence);
  if (hashedEvidences) mergedEvidence = mergedEvidence.concat(hashedEvidences);

  filteredCertificate.badge.evidence = evidence;
  if (mergedEvidence.length > 0) {
    filteredCertificate.badge.privateEvidence = mergedEvidence;
  }

  return new Certificate(filteredCertificate);
};

Certificate.prototype.getRoot = function _getRoot() {
  return this.certificateTree.getRoot();
};

Certificate.prototype.getCertificate = function _getCertificate() {
  return this.certificate;
};

Certificate.prototype.verify = function _verify() {
  return verifyCertificate(this.certificate);
};

module.exports = Certificate;
