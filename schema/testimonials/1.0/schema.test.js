/* eslint-disable */
const schema = require("./schema.json");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const axios = require("axios");
const { omit, cloneDeep, set } = require("lodash");
const example = require("./example.json");

function loadSchema(uri) {
  return axios.get(uri).then((res) => {
    return res.data;
  });
}
const ajv = new Ajv({ loadSchema: loadSchema, strictSchema: false });
addFormats(ajv);

let validator;

const initialData = {
  id: "Example-minimal-2018-001",
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
        Array [
          Object {
            "instancePath": "",
            "keyword": "required",
            "message": "must have required property 'id'",
            "params": Object {
              "missingProperty": "id",
            },
            "schemaPath": "#/definitions/Testimonial/required",
          },
        ]
      `);
    });
    it("should fail when content is a number", () => {
      const data = set(cloneDeep(initialData), "content", 5);

      expect(validator(data)).toBe(false);
      expect(validator.errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "instancePath": "/content",
            "keyword": "type",
            "message": "must be string",
            "params": Object {
              "type": "string",
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf/0/type",
          },
          Object {
            "instancePath": "/content",
            "keyword": "type",
            "message": "must be object",
            "params": Object {
              "type": "object",
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf/1/type",
          },
          Object {
            "instancePath": "/content",
            "keyword": "type",
            "message": "must be array",
            "params": Object {
              "type": "array",
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf/2/type",
          },
          Object {
            "instancePath": "/content",
            "keyword": "type",
            "message": "must be array",
            "params": Object {
              "type": "array",
            },
            "schemaPath": "#/definitions/Testimonial/properties/content/oneOf/3/type",
          },
          Object {
            "instancePath": "/content",
            "keyword": "oneOf",
            "message": "must match exactly one schema in oneOf",
            "params": Object {
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
        Array [
          Object {
            "instancePath": "",
            "keyword": "required",
            "message": "must have required property 'issuedOn'",
            "params": Object {
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
        Array [
          Object {
            "instancePath": "/issuedOn",
            "keyword": "format",
            "message": "must match format \\"date-time\\"",
            "params": Object {
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
        Array [
          Object {
            "instancePath": "",
            "keyword": "required",
            "message": "must have required property 'name'",
            "params": Object {
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
          Array [
            Object {
              "instancePath": "",
              "keyword": "required",
              "message": "must have required property 'issuers'",
              "params": Object {
                "missingProperty": "issuers",
              },
              "schemaPath": "#/required",
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
          Array [
            Object {
              "instancePath": "/recipient",
              "keyword": "required",
              "message": "must have required property 'name'",
              "params": Object {
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
          Array [
            Object {
              "instancePath": "/testimonial",
              "keyword": "required",
              "message": "must have required property 'achievementYear'",
              "params": Object {
                "missingProperty": "achievementYear",
              },
              "schemaPath": "#/definitions/Testimonial/properties/testimonial/anyOf/0/required",
            },
            Object {
              "instancePath": "/testimonial",
              "keyword": "required",
              "message": "must have required property 'achievementDate'",
              "params": Object {
                "missingProperty": "achievementDate",
              },
              "schemaPath": "#/definitions/Testimonial/properties/testimonial/anyOf/1/required",
            },
            Object {
              "instancePath": "/testimonial",
              "keyword": "anyOf",
              "message": "must match a schema in anyOf",
              "params": Object {},
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
          Array [
            Object {
              "instancePath": "/testimonial/achievementDate",
              "keyword": "format",
              "message": "must match format \\"date\\"",
              "params": Object {
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
          Array [
            Object {
              "instancePath": "/testimonial/achievementYear",
              "keyword": "pattern",
              "message": "must match pattern \\"^[0-9]{4}$\\"",
              "params": Object {
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
        Array [
          Object {
            "instancePath": "/referee",
            "keyword": "required",
            "message": "must have required property 'name'",
            "params": Object {
              "missingProperty": "name",
            },
            "schemaPath": "#/definitions/Testimonial/properties/referee/required",
          },
        ]
      `);
    });
  });
});
