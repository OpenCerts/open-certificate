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
  id: "Example-minimal-2018-001",
  schema: "testimonials/1.0",
  name: "Certificate Name",
  issuedOn: "2018-08-01T00:00:00+08:00",
  recipient: {
    name: "Recipient Name",
  },
  testimonial: { achievementYear: "2016" },
  referee: { name: "Jon Referee" },
  issuers: [
    {
      name: "Issuer Name",
      did: "DID:SG-UEN:U18274928E",
      uen: "U18274928E",
      documentStore: "0x0000000000000000000000000000000000000000",
      identityProof: {
        type: "DNS-TXT",
        location: "example.com",
      },
    },
  ],
};

describe("schema/v2.0", () => {
  beforeAll(async () => {
    validator = await ajv.compileAsync(schema);
  });
  it("should be valid with minimum data", () => {
    expect(validator(initialData)).toBe(true);
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
            "schemaPath": "#/definitions/Testimonial/required",
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
            "schemaPath": "#/definitions/Testimonial/required",
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
                "testimonials/1.0",
              ],
            },
            "schemaPath": "#/definitions/Testimonial/properties/schema/enum",
          },
        ]
      `);
    });
    it("should fail when content is a number", () => {
      const data = set(cloneDeep(initialData), "content", 5);

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/content",
            "keyword": "type",
            "message": "must be string",
            "params": {
              "type": "string",
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf/0/type",
          },
          {
            "instancePath": "/content",
            "keyword": "type",
            "message": "must be object",
            "params": {
              "type": "object",
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf/1/type",
          },
          {
            "instancePath": "/content",
            "keyword": "type",
            "message": "must be array",
            "params": {
              "type": "array",
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf/2/type",
          },
          {
            "instancePath": "/content",
            "keyword": "type",
            "message": "must be array",
            "params": {
              "type": "array",
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf/3/type",
          },
          {
            "instancePath": "/content",
            "keyword": "oneOf",
            "message": "must match exactly one schema in oneOf",
            "params": {
              "passingSchemas": null,
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf",
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
            "schemaPath": "#/definitions/Testimonial/required",
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
            "schemaPath": "#/definitions/Testimonial/properties/issuedOn/format",
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
            "schemaPath": "#/definitions/Testimonial/required",
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
            "schemaPath": "#/definitions/Testimonial/properties/issuers/items/required",
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
            "schemaPath": "#/definitions/Testimonial/properties/issuers/items/required",
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
            "schemaPath": "#/definitions/Testimonial/properties/recipient/required",
          },
        ]
      `);
    });
  });

  describe("testimonial", () => {
    it("should fail when achievementYear and achievementDate are missing", () => {
      const data = omit(cloneDeep(initialData), [
        "testimonial.achievementDate",
        "testimonial.achievementYear",
      ]);

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/testimonial",
            "keyword": "required",
            "message": "must have required property 'achievementYear'",
            "params": {
              "missingProperty": "achievementYear",
            },
            "schemaPath": "#/definitions/Testimonial/properties/testimonial/anyOf/0/required",
          },
          {
            "instancePath": "/testimonial",
            "keyword": "required",
            "message": "must have required property 'achievementDate'",
            "params": {
              "missingProperty": "achievementDate",
            },
            "schemaPath": "#/definitions/Testimonial/properties/testimonial/anyOf/1/required",
          },
          {
            "instancePath": "/testimonial",
            "keyword": "anyOf",
            "message": "must match a schema in anyOf",
            "params": {},
            "schemaPath": "#/definitions/Testimonial/properties/testimonial/anyOf",
          },
        ]
      `);
    });
    it("should fail when achievementDate is not a valid date", () => {
      const data = set(
        cloneDeep(initialData),
        "testimonial.achievementDate",
        "abc"
      );

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/testimonial/achievementDate",
            "keyword": "format",
            "message": "must match format "date"",
            "params": {
              "format": "date",
            },
            "schemaPath": "#/definitions/Testimonial/properties/testimonial/properties/achievementDate/format",
          },
        ]
      `);
    });
    it("should fail when achievementYear is not a valid date", () => {
      const data = set(
        cloneDeep(initialData),
        "testimonial.achievementYear",
        "20222"
      );

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/testimonial/achievementYear",
            "keyword": "pattern",
            "message": "must match pattern "^[0-9]{4}$"",
            "params": {
              "pattern": "^[0-9]{4}$",
            },
            "schemaPath": "#/definitions/Testimonial/properties/testimonial/properties/achievementYear/pattern",
          },
        ]
      `);
    });
  });

  describe("referee", () => {
    it("should fail when name is missing", () => {
      const data = omit(cloneDeep(initialData), "referee.name");

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        [
          {
            "instancePath": "/referee",
            "keyword": "required",
            "message": "must have required property 'name'",
            "params": {
              "missingProperty": "name",
            },
            "schemaPath": "#/definitions/Testimonial/properties/referee/required",
          },
        ]
      `);
    });
  });
});
