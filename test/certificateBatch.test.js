const certificateBatch = require("../utils/certificateBatch");
const Certificate = require("../utils/certificate");
const { randomCertificate } = require("../utils/randomCertificateGenerator.js");
const { checkProof } = require("../utils/merkle");

describe("certificateBatch", () => {
  const CERTIFICATES_TO_ISSUE = 500;
  const certificates = [];
  for (let i = 0; i < CERTIFICATES_TO_ISSUE; i++) {
    certificates.push(randomCertificate());
  }

  describe("issueCertificates", () => {
    it("returns merkle root for batch", () => {
      const batchedCerts = certificateBatch.issueCertificates(certificates);
      expect(batchedCerts.certificates).to.exist;
      expect(batchedCerts.merkleTree).to.exist;
    });
  });

  describe("CertificateBatch", () => {
    describe("getProof", () => {
      it("returns proofs for certificate in the batch", () => {
        const batchedCerts = certificateBatch.issueCertificates(certificates);
        const cert = certificates[0];
        const proof = batchedCerts.getProof(cert);
        expect(proof).to.not.be.null;
      });

      it("returns proofs for certificate buffer in the batch", () => {
        const batchedCerts = certificateBatch.issueCertificates(certificates);
        const cert = certificates[0];
        const buf = new Certificate(cert).getRoot();
        const proof = batchedCerts.getProof(buf);
        expect(proof).to.not.be.null;

        assert(checkProof(proof, batchedCerts.getRoot(), buf));
      });

      it("throws when certificate is not in the batch", () => {
        const batchedCerts = certificateBatch.issueCertificates(certificates);
        const cert = randomCertificate();
        const proof = () => batchedCerts.getProof(cert);
        expect(proof).to.throw;
      });
    });
  });
});
