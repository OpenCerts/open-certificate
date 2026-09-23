/* eslint-disable */
const schema = require("./schema.json");
const example = require("./example.json");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { cloneDeep, omit, set, unset } = require("lodash");
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

const ajv = new Ajv({ strictSchema: false, allowUnionTypes: true, strictTuples: false, allErrors: true });
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
    type: ["Transcript"],
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

    // 2.2 had "additionalProperties": false on its root (the payload), so an
    // unknown field at the top of credentialSubject is rejected here too.
    it("should fail with an unknown credentialSubject field", () => {
      const data = set(
        cloneDeep(initialData),
        "credentialSubject.extraKey",
        "value"
      );
      expect(validator(data)).toBe(false);
    });

    // nested objects stay open, exactly as they were in 2.2
    it("should fail with an unknown recipient field", () => {
      const data = set(
        cloneDeep(initialData),
        "credentialSubject.recipient.additionalProp",
        "value"
      );
      expect(validator(data)).toBe(false);
    });

    it("should fail with an unknown issuer field", () => {
      const data = set(cloneDeep(initialData), "issuer.customField", "value");
      expect(validator(data)).toBe(false);
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

      it("should fail when issuer object has no name", () => {
        const data = omit(cloneDeep(initialData), "issuer.name");
        expect(validator(data)).toBe(false);
      });

      it("should be valid when issuer is a bare DID string", () => {
        const data = set(cloneDeep(initialData), "issuer", "did:web:opencerts.io:moe");
        expect(validator(data)).toBe(true);
      });

      // uen / url / email / phone carry over from the OpenAttestation issuers[]
      it("should be valid with the full issuer contact details", () => {
        const data = cloneDeep(initialData);
        Object.assign(data.issuer, {
          url: "https://blockchainacademy.com",
          email: "registrar@blockchainacademy.com",
          phone: "+65 61234567",
        });
        expect(validator(data)).toBe(true);
      });

      // TrustVC mints the credential id while signing and rejects any document
      // that already carries one, so an unsigned credential must not have it.
      it("should fail when an unsigned credential carries an id", () => {
        const data = set(
          cloneDeep(initialData),
          "id",
          "urn:uuid:0198e4a3-b601-7117-9d02-8c9a9a54ab5d"
        );
        expect(validator(data)).toBe(false);
      });

      it("should be valid when a signed credential carries the generated id", () => {
        const data = cloneDeep(initialData);
        data.id = "urn:uuid:0198e4a3-b601-7117-9d02-8c9a9a54ab5d";
        data.proof = { type: "DataIntegrityProof" };
        expect(validator(data)).toBe(true);
      });

      it("should fail when validFrom is not a valid date-time", () => {
        const data = set(cloneDeep(initialData), "validFrom", "abc");
        expect(validator(data)).toBe(false);
      });

      // Every OpenCerts version before the W3C VC migration required an
      // issuance date (`issuedOn`); `validFrom` keeps that requirement.
      it("should fail when validFrom is missing", () => {
        const data = omit(cloneDeep(initialData), "validFrom");
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

      // context.json defines every term inside the type-scoped "Transcript"
      // @context, so a subject without that type cannot be signed. The schema
      // rejects it rather than letting it fail later at issuance time.
      it("should fail when the credentialSubject type is missing", () => {
        const data = omit(cloneDeep(initialData), "credentialSubject.type");
        expect(validator(data)).toBe(false);
      });

      it("should fail when the credentialSubject type does not include Transcript", () => {
        const data = set(cloneDeep(initialData), "credentialSubject.type", ["Other"]);
        expect(validator(data)).toBe(false);
      });

      it("should be valid when the credentialSubject type is a bare string", () => {
        const data = set(cloneDeep(initialData), "credentialSubject.type", "Transcript");
        expect(validator(data)).toBe(true);
      });

      it("should fail when recipient name is missing", () => {
        const data = omit(cloneDeep(initialData), "credentialSubject.recipient.name");
        expect(validator(data)).toBe(false);
      });

      // `transcript` is optional, as it was in every version up to 2.2 — a
      // qualification can be issued without an itemised course list.
      it("should be valid when transcript is missing", () => {
        const data = omit(cloneDeep(initialData), "credentialSubject.transcript");
        expect(validator(data)).toBe(true);
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
    describe("credentialStatus (Bitstring Status List)", () => {
      const status = {
        id: "https://opencerts.io/status/1#42",
        type: "BitstringStatusListEntry",
        statusPurpose: "revocation",
        statusListIndex: "42",
        statusListCredential: "https://opencerts.io/status/1",
      };

      it("should be valid when absent", () => {
        expect(validator(cloneDeep(initialData))).toBe(true);
      });

      it("should be valid with a complete status entry", () => {
        const data = set(cloneDeep(initialData), "credentialStatus", status);
        expect(validator(data)).toBe(true);
      });

      // a partial entry used to pass the schema and then fail at signing
      it.each([
        "statusPurpose",
        "statusListIndex",
        "statusListCredential",
        "type",
      ])("should fail when %s is missing", (field) => {
        const data = set(cloneDeep(initialData), "credentialStatus", omit(status, field));
        expect(validator(data)).toBe(false);
      });

      it("should fail when statusPurpose is not revocation or suspension", () => {
        const data = set(cloneDeep(initialData), "credentialStatus", {
          ...status,
          statusPurpose: "archival",
        });
        expect(validator(data)).toBe(false);
      });

      it("should fail when statusListIndex is not a non-negative integer", () => {
        const data = set(cloneDeep(initialData), "credentialStatus", {
          ...status,
          statusListIndex: "abc",
        });
        expect(validator(data)).toBe(false);
      });

      it("should fail when statusListCredential is not an absolute URL", () => {
        const data = set(cloneDeep(initialData), "credentialStatus", {
          ...status,
          statusListCredential: "/status/1",
        });
        expect(validator(data)).toBe(false);
      });
    });

    describe("renderMethod", () => {
      it("should be valid with the example's renderMethod", () => {
        const data = set(cloneDeep(initialData), "renderMethod", example.renderMethod);
        expect(validator(data)).toBe(true);
      });

      // $template required name/type/url in the OpenAttestation versions; the
      // same three fields are required here as id/type/templateName
      it.each([[{}], [{ id: "https://demo-renderer.opencerts.io" }], [{ hello: "world" }]])(
        "should fail with an underspecified renderMethod entry",
        (entry) => {
          const data = set(cloneDeep(initialData), "renderMethod", [entry]);
          expect(validator(data)).toBe(false);
        }
      );

      it("should fail when the renderer type is not EMBEDDED_RENDERER", () => {
        const data = set(cloneDeep(initialData), "renderMethod", [
          { ...example.renderMethod[0], type: "SOMETHING_ELSE" },
        ]);
        expect(validator(data)).toBe(false);
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

    // The W3C VC v2 context marks "issuer" as @protected, so context.json
    // cannot give it a scoped @context; uen / url / email / phone are declared
    // as top-level terms instead. This proves they survive canonicalisation.
    it("signs and verifies with the full issuer contact details", async () => {
      const documentLoader = await vc.getDocumentLoader({ [CONTEXT_URL]: context });
      const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
      const raw = cloneDeep(example);
      raw.issuer = {
        id: did,
        name: "Blockchain Academy",
        url: "https://blockchainacademy.com",
        email: "registrar@blockchainacademy.com",
        phone: "+65 61234567",
      };

      const signed = await vc.signCredential(raw, didKeyPairs, "ecdsa-sd-2023", {
        documentLoader,
      });
      expect(signed.error).toBeUndefined();

      const derived = await vc.deriveCredential(
        signed.signed,
        ["/credentialSubject/name"],
        { documentLoader }
      );
      expect(derived.error).toBeUndefined();

      const result = await vc.verifyCredential(derived.derived, { documentLoader });
      expect(result.verified).toBe(true);
    }, 30000);

    // credentialStatus used to pass the schema while being rejected at signing.
    // This ties the two together: what the schema accepts, TrustVC can issue.
    it("signs and verifies a credential carrying a status entry", async () => {
      const documentLoader = await vc.getDocumentLoader({ [CONTEXT_URL]: context });
      const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
      const raw = cloneDeep(example);
      raw.issuer = did;
      raw.credentialStatus = {
        id: "https://opencerts.io/status/1#42",
        type: "BitstringStatusListEntry",
        statusPurpose: "revocation",
        statusListIndex: "42",
        statusListCredential: "https://opencerts.io/status/1",
      };
      expect(validator(raw)).toBe(true);

      const signed = await vc.signCredential(raw, didKeyPairs, "ecdsa-sd-2023", {
        documentLoader,
      });
      expect(signed.error).toBeUndefined();
      expect(signed.signed.proof).toBeDefined();
    }, 30000);

    // The schema and the signer must agree: anything the schema accepts must be
    // issuable, and anything it rejects is exactly what the signer would reject.
    it("rejects undeclared properties at validation, as signing would", async () => {
      const documentLoader = await vc.getDocumentLoader({ [CONTEXT_URL]: context });
      const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
      const raw = cloneDeep(example);
      raw.issuer = did;
      raw.credentialSubject.recipient.additionalProp = "value";

      expect(validator(raw)).toBe(false);

      const signed = await vc.signCredential(raw, didKeyPairs, "ecdsa-sd-2023", {
        documentLoader,
      });
      expect(signed.error).toBeDefined();
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

  // The invariant this whole schema depends on: anything schema.json accepts,
  // TrustVC can actually issue. A "trap" is a document the schema calls valid
  // that then fails at signing — the bug class this schema version exists to
  // remove (credentialSubject.type, credentialStatus, undeclared fields, id).
  //
  // The reverse is allowed and intended: schema.json also enforces OpenCerts
  // business rules that TrustVC does not care about (a recipient must have a
  // name, a renderMethod must be complete), so it legitimately rejects some
  // documents that would have signed.
  describe("schema.json accepts nothing that cannot be signed", () => {
    const MUTATIONS = [
      ["example as-is", null],
      ["no @context", (r) => unset(r, "@context")],
      ["wrong first @context", (r) => set(r, "@context[0]", "https://example.com/x")],
      ["type without VerifiableCredential", (r) => set(r, "type", ["Other"])],
      ["no issuer", (r) => unset(r, "issuer")],
      ["issuer without id", (r) => set(r, "issuer", { name: "X" })],
      ["issuer without name", (r) => unset(r, "issuer.name")],
      ["no validFrom", (r) => unset(r, "validFrom")],
      ["validFrom not a date-time", (r) => set(r, "validFrom", "abc")],
      ["no credentialSubject", (r) => unset(r, "credentialSubject")],
      ["credentialSubject without type", (r) => unset(r, "credentialSubject.type")],
      ["credentialSubject with wrong type", (r) => set(r, "credentialSubject.type", ["Other"])],
      ["credentialSubject without name", (r) => unset(r, "credentialSubject.name")],
      ["recipient without name", (r) => unset(r, "credentialSubject.recipient.name")],
      ["unsigned credential carrying an id", (r) => set(r, "id", "urn:uuid:0198e4a3-b601-7117-9d02-8c9a9a54ab5d")],
      ["unknown key in credentialSubject", (r) => set(r, "credentialSubject.zzz", "v")],
      ["unknown key in recipient", (r) => set(r, "credentialSubject.recipient.zzz", "v")],
      ["unknown key in issuer", (r) => set(r, "issuer.zzz", "v")],
      ["renderMethod with an empty entry", (r) => set(r, "renderMethod", [{}])],
      ["renderMethod with an unknown type", (r) => set(r, "renderMethod[0].type", "NOPE")],
      ["credentialStatus with only a type", (r) => set(r, "credentialStatus", { type: "BitstringStatusListEntry" })],
      ["credentialStatus with a bad statusPurpose", (r) =>
        set(r, "credentialStatus", { type: "BitstringStatusListEntry", statusPurpose: "archival", statusListIndex: "42", statusListCredential: "https://opencerts.io/status/1" })],
      ["complete credentialStatus", (r) =>
        set(r, "credentialStatus", { id: "https://opencerts.io/status/1#42", type: "BitstringStatusListEntry", statusPurpose: "revocation", statusListIndex: "42", statusListCredential: "https://opencerts.io/status/1" })],
      ["transcript item without a name", (r) => unset(r, "credentialSubject.transcript[0].name")],
      ["unknown key in a transcript item", (r) => set(r, "credentialSubject.transcript[0].zzz", "v")],
      ["skills item without frameworkUri", (r) => unset(r, "credentialSubject.skills[0].frameworkUri")],
      ["unknown key in a skills item", (r) => set(r, "credentialSubject.skills[0].zzz", "v")],
      ["arbitrary content in additionalData", (r) => set(r, "credentialSubject.additionalData.zzz", { a: [1, 2] })],
    ];

    it("has no document that validates but cannot be signed", async () => {
      const documentLoader = await vc.getDocumentLoader({ [CONTEXT_URL]: context });
      const { did, didKeyPairs } = await generateDidKeyPair(CryptoSuite.EcdsaSd2023);
      const traps = [];
      let signedAtLeastOne = false;

      for (const [label, mutate] of MUTATIONS) {
        const raw = cloneDeep(example);
        raw.issuer = { ...raw.issuer, id: did };
        if (mutate) mutate(raw);

        const schemaSaysValid = validator(raw);
        let signs = false;
        try {
          const signed = await vc.signCredential(raw, didKeyPairs, "ecdsa-sd-2023", { documentLoader });
          signs = !signed.error;
        } catch (e) {
          signs = false;
        }
        if (schemaSaysValid && !signs) traps.push(label);
        if (schemaSaysValid && signs) signedAtLeastOne = true;
      }

      expect(traps).toEqual([]);
      // guards against the assertion passing because everything was rejected
      expect(signedAtLeastOne).toBe(true);
    }, 120000);
  });
});
