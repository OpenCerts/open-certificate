const _ = require("lodash");
const testCerts = require("./fixtures/testCerts");
const openCert = require("../src");

describe("E2E Test", () => {
  let certificate;
  let certificates;

  it("can issue one certificate", () => {
    const data = testCerts[0];
    certificate = openCert.issueCertificate(data);
    expect(certificate.schema).toEqual("opencerts/v2.0");
    expect(certificate.data).toBeDefined();
    expect(certificate.privacy).toBeDefined();
    expect(certificate.signature).toBeDefined();
  });

  it("can issue multiple certificates", () => {
    const data = testCerts;
    certificates = openCert.issueCertificates(data);

    expect(certificates).toHaveLength(testCerts.length);
    certificates.forEach((c) => {
      expect(c.schema).toBe("opencerts/v2.0");
      expect(c.data).toBeDefined();
      expect(c.privacy).toBeDefined();
      expect(c.signature).toBeDefined();
    });
  });

  it("can get data from the certificate document", () => {
    const data = openCert.certificateData(certificate);
    expect(data).toStrictEqual(testCerts[0]);
  });

  it("can validate schema of certificates", () => {
    const isValid = openCert.validateSchema(certificate);
    expect(isValid).toBe(true);

    certificates.forEach((c) => {
      expect(openCert.validateSchema(c)).toBe(true);
    });
  });

  it("can detect invalidate schema", () => {
    const certificateInvalid = _.cloneDeep(certificate);
    certificateInvalid.data["some-invalid-key"] = "invalid value";
    const isValid = openCert.validateSchema(certificateInvalid);
    expect(isValid).toBe(false);
  });

  it("can obfuscate fields (repeatedly)", () => {
    const obfuscatedCert = openCert.obfuscateFields(certificate, [
      "recipient.email",
      "recipient.phone",
    ]);
    expect(obfuscatedCert).toBeDefined();
    expect(obfuscatedCert.privacy.obfuscatedData).toHaveLength(2);
    expect(obfuscatedCert.data.recipient.email).not.toBeDefined();
    expect(obfuscatedCert.data.recipient.phone).not.toBeDefined();

    const moreObfuscation = openCert.obfuscateFields(
      obfuscatedCert,
      "recipient.did"
    );
    expect(moreObfuscation.privacy.obfuscatedData).toHaveLength(3);
    expect(moreObfuscation.data.recipient.did).not.toBeDefined();

    const isValidStructure = openCert.validateSchema(moreObfuscation);
    expect(isValidStructure).toBe(true);

    const isValidSignature = openCert.verifySignature(moreObfuscation);
    expect(isValidSignature).toBe(true);
  });
});
