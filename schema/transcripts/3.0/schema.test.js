/* eslint-disable */
const schema = require("./schema.json");
const example = require("./example.json");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { cloneDeep, omit, set } = require("lodash");
// W3C Verifiable Credential helpers from the TrustVC library.
// `vc` exposes isRawDocument / isRawDocumentV2_0 which structurally validate a
// W3C VC (v2.0) raw (unsigned) document the same way TrustVC does before signing.
const vc = require("@trustvc/trustvc/w3c/vc");
const { generateDidKeyPair, CryptoSuite } = require("@trustvc/trustvc/w3c/issuer");
const context = require("./context.json");

// URL the example references in its @context for this credential type. We map it
// to the local context.json so signing/verification works fully offline (the URL
// itself does not need to be hosted for this test).
const CONTEXT_URL =
  "https://schema.opencerts.io/transcripts/3.0/context.json";

const ajv = new Ajv({ strictSchema: false, allErrors: true });
addFormats(ajv);
const validator = ajv.compile(schema);

// A minimal W3C VC transcript used as the base for mutation tests.
const initialData = {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://schema.opencerts.io/transcripts/3.0/context.json",
  ],
  type: ["VerifiableCredential"],
  issuer: {
    id: "did:web:opencerts.io:blockchain-academy",
    name: "Blockchain Academy",
  },
  validFrom: "2018-08-01T00:00:00+08:00",
  credentialSubject: {
    name: "Master of Blockchain",
    recipient: { name: "Mr Blockchain" },
    transcript: [{ name: "Bitcoin", grade: "A+" }],
  },
};

describe("transcripts/v3.0 (W3C VC)", () => {
  describe("TrustVC W3C VC validation", () => {
    it("the example is a valid raw W3C Verifiable Credential", () => {
      expect(vc.isRawDocument(example)).toBe(true);
    });

    it("the example uses the W3C VC Data Model 2.0 context", () => {
      expect(vc.isRawDocumentV2_0(example)).toBe(true);
    });

    it("the minimum data is a valid raw W3C Verifiable Credential", () => {
      expect(vc.isRawDocument(initialData)).toBe(true);
      expect(vc.isRawDocumentV2_0(initialData)).toBe(true);
    });

    it("is not a valid W3C VC when the VerifiableCredential type is missing", () => {
      const data = set(cloneDeep(initialData), "type", ["OpenCertsCredential"]);
      expect(vc.isRawDocument(data)).toBe(false);
    });

    it("is not a valid W3C VC when issuer is missing", () => {
      const data = omit(cloneDeep(initialData), "issuer");
      expect(vc.isRawDocument(data)).toBe(false);
    });

    it("is not a valid W3C VC when credentialSubject is missing", () => {
      const data = omit(cloneDeep(initialData), "credentialSubject");
      expect(vc.isRawDocument(data)).toBe(false);
    });
  });

  describe("schema.json validation", () => {
    it("should be valid with minimum data", () => {
      expect(validator(initialData)).toBe(true);
    });

    it("should be valid with the example", () => {
      expect(validator(example)).toBe(true);
    });

    it("should be valid with additional credentialSubject data", () => {
      const data = set(
        cloneDeep(initialData),
        "credentialSubject.extraKey",
        "value"
      );
      expect(validator(data)).toBe(true);
    });

    it("should be valid with validUntil", () => {
      const data = set(cloneDeep(initialData), "validUntil", "2118-08-01T00:00:00+08:00");
      expect(validator(data)).toBe(true);
    });

    describe("base data", () => {
      it("should fail when @context is missing", () => {
        const data = omit(cloneDeep(initialData), "@context");
        expect(validator(data)).toBe(false);
      });

      it("should fail when the first @context is not the W3C VC v2.0 context", () => {
        const data = set(cloneDeep(initialData), "@context[0]", "https://example.com/context");
        expect(validator(data)).toBe(false);
      });

      it("should fail when type does not include VerifiableCredential", () => {
        const data = set(cloneDeep(initialData), "type", ["OpenCertsCredential"]);
        expect(validator(data)).toBe(false);
      });

      it("should fail when issuer is missing", () => {
        const data = omit(cloneDeep(initialData), "issuer");
        expect(validator(data)).toBe(false);
      });

      it("should fail when issuer object has no id", () => {
        const data = set(cloneDeep(initialData), "issuer", { name: "No Id" });
        expect(validator(data)).toBe(false);
      });

      it("should fail when validFrom is not a valid date-time", () => {
        const data = set(cloneDeep(initialData), "validFrom", "abc");
        expect(validator(data)).toBe(false);
      });
    });

    describe("credentialSubject", () => {
      it("should fail when credentialSubject is missing", () => {
        const data = omit(cloneDeep(initialData), "credentialSubject");
        expect(validator(data)).toBe(false);
      });

      it("should fail when name is missing", () => {
        const data = omit(cloneDeep(initialData), "credentialSubject.name");
        expect(validator(data)).toBe(false);
      });

      it("should fail when recipient name is missing", () => {
        const data = omit(cloneDeep(initialData), "credentialSubject.recipient.name");
        expect(validator(data)).toBe(false);
      });

      it("should fail when transcript is missing", () => {
        const data = omit(cloneDeep(initialData), "credentialSubject.transcript");
        expect(validator(data)).toBe(false);
      });

      it("should fail when a transcript item has no name", () => {
        const data = set(cloneDeep(initialData), "credentialSubject.transcript", [
          { grade: "A+" },
        ]);
        expect(validator(data)).toBe(false);
      });

      it("should fail when a skill is missing frameworkUri", () => {
        const data = set(cloneDeep(initialData), "credentialSubject.skills", [
          { frameworkName: "SFw", frameworkVersion: "1.0" },
        ]);
        expect(validator(data)).toBe(false);
      });

      it("should be valid with a complete skill entry", () => {
        const data = set(cloneDeep(initialData), "credentialSubject.skills", [
          {
            frameworkUri: "https://www.skillsfuture.sg/skills-framework",
            frameworkName: "SFw",
            frameworkVersion: "1.0",
          },
        ]);
        expect(validator(data)).toBe(true);
      });
    });
  });

  describe("sign + verify with TrustVC (context.json end-to-end)", () => {
    // Sign the example with a freshly generated did:key (self-resolving, so no
    // network/hosting is needed), then verify and confirm tampering is rejected.
    // This proves the context.json is complete enough for real issuance.
    it("signs, verifies, and rejects tampering", async () => {
      const documentLoader = await vc.getDocumentLoader({ [CONTEXT_URL]: context });
      const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
      const raw = { ...example, issuer: did };

      const signed = await vc.signCredential(raw, didKeyPairs, "ecdsa-sd-2023", {
        documentLoader,
      });
      expect(signed.error).toBeUndefined();
      expect(signed.signed.proof).toBeDefined();

      const derived = await vc.deriveCredential(
        signed.signed,
        ["/credentialSubject/name"],
        { documentLoader }
      );
      const credential = derived.derived || signed.signed;

      const result = await vc.verifyCredential(credential, { documentLoader });
      expect(result.error).toBeUndefined();
      expect(result.verified).toBe(true);

      const tampered = await vc.verifyCredential(
        { ...credential, validFrom: "2099-01-01T00:00:00Z" },
        { documentLoader }
      );
      expect(tampered.verified).toBe(false);
    }, 30000);
  });

  describe("selective disclosure (deriveCredential)", () => {
    it("reveals only the selected fields, hides the rest, and still verifies", async () => {
      const documentLoader = await vc.getDocumentLoader({ [CONTEXT_URL]: context });
      const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
      const signed = await vc.signCredential({ ...example, issuer: did }, didKeyPairs, "ecdsa-sd-2023", { documentLoader });

      const derived = await vc.deriveCredential(
        signed.signed,
        ["/credentialSubject/name"],
        { documentLoader }
      );
      expect(derived.error).toBeUndefined();

      // the selected field is disclosed; an unselected field is withheld
      expect(derived.derived.credentialSubject.name).toBeDefined();
      expect(derived.derived.credentialSubject.transcript).toBeUndefined();

      // the derived credential still verifies
      const result = await vc.verifyCredential(derived.derived, { documentLoader });
      expect(result.verified).toBe(true);
    }, 30000);
  });
});
