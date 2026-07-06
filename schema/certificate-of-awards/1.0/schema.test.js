/* eslint-disable */
const schema = require("./schema.json");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const axios = require("axios");
const { omit, cloneDeep, set } = require("lodash");
const example = require("./example.json");
// OpenAttestation v2.0 schema (referenced by this schema via $ref). Resolve it
// from the locally installed @tradetrust-tt/tradetrust package (bundled by
// @trustvc/trustvc) instead of fetching schema.openattestation.com, so the test
// does not depend on that host being reachable.
const openAttestationV2Schema = require("@tradetrust-tt/tradetrust/dist/cjs/2.0/schema/schema.json");

function loadSchema(uri) {
  if (uri === "https://schema.openattestation.com/2.0/schema.json") {
    return Promise.resolve(openAttestationV2Schema);
  }
  return axios.get(uri).then((res) => {
    return res.data;
  });
}
const ajv = new Ajv({ loadSchema: loadSchema, strictSchema: false });
addFormats(ajv);

let validator;

const initialData = {
  id: "EAG171622",
  schema: "certificate-of-awards/1.0",
  issuedOn: "2018-08-01T00:00:00+08:00",
  name: "Edusave Award for Achievement, Good Leadership and Service (EAGLES) 2017",
  issuers: [
    {
      name: "Ministry of Education",
      did: "DID:SG-UEN:U18274928E",
      uen: "U18274928E",
      documentStore: "0xd9580260be45c3c0c2fb259a82f219b513054012",
      identityProof: {
        type: "DNS-TXT",
        location: "moe.gov.sg",
      },
    },
  ],
  recipient: { name: "John Doe" },
  award: { achievementDate: "2016-11-21" },
  signature: { name: "Vikram Nair" },
};

describe("schema/v1.0", () => {
  beforeAll(async () => {
    validator = await ajv.compileAsync(schema);
  });

  it("should be valid with minimum data", () => {
    expect(validator(initialData)).toBe(true);
  });

  it("should be valid with additional data", () => {
    const data = set(cloneDeep(initialData), "extraKey", "value");
    expect(validator(data)).toBe(true);
  });

  it("should be valid with the example", () => {
    expect(validator(example)).toBe(true);
  });

  describe("base data", () => {
    it("should fail when id is missing", () => {
      const data = omit(cloneDeep(initialData), "id");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "",
            "keyword": "required",
            "message": "must have required property 'id'",
            "params": {
              "missingProperty": "id",
            },
            "schemaPath": "#/definitions/CertificateOfAward/required",
          },
        ]
      `);
    });
    it("should fail when schema is missing", () => {
      const data = omit(cloneDeep(initialData), "schema");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "",
            "keyword": "required",
            "message": "must have required property 'schema'",
            "params": {
              "missingProperty": "schema",
            },
            "schemaPath": "#/definitions/CertificateOfAward/required",
          },
        ]
      `);
    });
    it("should fail when schema value is not allowed", () => {
      const data = set(cloneDeep(initialData), "schema", "abc");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/schema",
            "keyword": "enum",
            "message": "must be equal to one of the allowed values",
            "params": {
              "allowedValues": [
                "certificate-of-awards/1.0",
              ],
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/schema/enum",
          },
        ]
      `);
    });
    it("should fail when issuedOn is missing", () => {
      const data = omit(cloneDeep(initialData), "issuedOn");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "",
            "keyword": "required",
            "message": "must have required property 'issuedOn'",
            "params": {
              "missingProperty": "issuedOn",
            },
            "schemaPath": "#/definitions/CertificateOfAward/required",
          },
        ]
      `);
    });
    it("should fail when issuedOn is not a valid date", () => {
      const data = set(cloneDeep(initialData), "issuedOn", "abc");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/issuedOn",
            "keyword": "format",
            "message": "must match format "date-time"",
            "params": {
              "format": "date-time",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/issuedOn/format",
          },
        ]
      `);
    });
    it("should fail when name is missing", () => {
      const data = omit(cloneDeep(initialData), "name");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "",
            "keyword": "required",
            "message": "must have required property 'name'",
            "params": {
              "missingProperty": "name",
            },
            "schemaPath": "#/definitions/CertificateOfAward/required",
          },
        ]
      `);
    });
  });

  describe("issuers", () => {
    it("should fail when issuers is missing", () => {
      const data = omit(cloneDeep(initialData), "issuers");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "",
            "keyword": "required",
            "message": "must have required property 'issuers'",
            "params": {
              "missingProperty": "issuers",
            },
            "schemaPath": "#/required",
          },
        ]
      `);
    });
    it("should fail when issuers.did is missing", () => {
      const data = omit(cloneDeep(initialData), "issuers[0].did");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/issuers/0",
            "keyword": "required",
            "message": "must have required property 'did'",
            "params": {
              "missingProperty": "did",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/issuers/items/required",
          },
        ]
      `);
    });
    it("should fail when issuers.uen is missing", () => {
      const data = omit(cloneDeep(initialData), "issuers[0].uen");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/issuers/0",
            "keyword": "required",
            "message": "must have required property 'uen'",
            "params": {
              "missingProperty": "uen",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/issuers/items/required",
          },
        ]
      `);
    });
  });

  describe("recipient", () => {
    it("should fail when name is missing", () => {
      const data = omit(cloneDeep(initialData), "recipient.name");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/recipient",
            "keyword": "required",
            "message": "must have required property 'name'",
            "params": {
              "missingProperty": "name",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/recipient/required",
          },
        ]
      `);
    });
  });

  describe("award", () => {
    it("should fail when achievementYear and achievementDate are missing", () => {
      const data = omit(cloneDeep(initialData), [
        "award.achievementDate",
        "award.achievementYear",
      ]);

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/award",
            "keyword": "required",
            "message": "must have required property 'achievementYear'",
            "params": {
              "missingProperty": "achievementYear",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/award/anyOf/0/required",
          },
          {
            "instancePath": "/award",
            "keyword": "required",
            "message": "must have required property 'achievementDate'",
            "params": {
              "missingProperty": "achievementDate",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/award/anyOf/1/required",
          },
          {
            "instancePath": "/award",
            "keyword": "anyOf",
            "message": "must match a schema in anyOf",
            "params": {},
            "schemaPath": "#/definitions/CertificateOfAward/properties/award/anyOf",
          },
        ]
      `);
    });
    it("should fail when achievementDate is not a valid date", () => {
      const data = set(cloneDeep(initialData), "award.achievementDate", "abc");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/award/achievementDate",
            "keyword": "format",
            "message": "must match format "date"",
            "params": {
              "format": "date",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/award/properties/achievementDate/format",
          },
        ]
      `);
    });
    it("should fail when achievementYear is not a valid date", () => {
      const data = set(
        cloneDeep(initialData),
        "award.achievementYear",
        "20222"
      );

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/award/achievementYear",
            "keyword": "pattern",
            "message": "must match pattern "^[0-9]{4}$"",
            "params": {
              "pattern": "^[0-9]{4}$",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/award/properties/achievementYear/pattern",
          },
        ]
      `);
    });
  });

  describe("signature", () => {
    it("should fail when name is missing", () => {
      const data = omit(cloneDeep(initialData), "signature.name");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/signature",
            "keyword": "required",
            "message": "must have required property 'name'",
            "params": {
              "missingProperty": "name",
            },
            "schemaPath": "#/definitions/CertificateOfAward/properties/signature/required",
          },
        ]
      `);
    });
  });
});
