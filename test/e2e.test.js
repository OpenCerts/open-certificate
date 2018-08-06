const _ = require("lodash");
const testCerts = require("./fixtures/testCerts");
const openCert = require("../src");

describe("E2E Test", () => {
  let certificate;
  let certificates;

  it("can issue one certificate", () => {
    const data = testCerts[0];
    certificate = openCert.issueCertificate(data);
    expect(certificate.schema).to.exist;
    expect(certificate.data).to.exist;
    expect(certificate.privacy).to.exist;
    expect(certificate.signature).to.exist;
  });

  it("can issue multiple certificates", () => {
    const data = testCerts;
    certificates = openCert.issueCertificates(data);

    expect(certificates.length).to.be.equal(testCerts.length);
    certificates.forEach(c => {
      expect(c.schema).to.exist;
      expect(c.data).to.exist;
      expect(c.privacy).to.exist;
      expect(c.signature).to.exist;
    });
  });

  it("can validate schema of certificates", () => {
    const isValid = openCert.validateSchema(certificate);
    expect(isValid).to.be.true;

    certificates.forEach(c => {
      expect(openCert.validateSchema(c)).to.be.true;
    });
  });

  it("can detect invalidate schema", () => {
    const certificateInvalid = _.cloneDeep(certificate);
    certificateInvalid.data["some-invalid-key"] = "invalid value";
    const isValid = openCert.validateSchema(certificateInvalid);
    expect(isValid).to.be.false;
  });

  xit("can obfuscate fields", () => {
    // TODO: Fix open attestation's salt function
    const obfuscatedCert = openCert.obfuscateFields(certificate, [
      "recipient.email",
      "recipient.phone"
    ]);
    expect(obfuscatedCert).to.exist;
  });
});
