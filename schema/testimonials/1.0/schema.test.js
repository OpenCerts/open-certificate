/* eslint-disable */
const schema = require("./schema.json");
const Ajv = require("ajv");
const axios = require("axios");

function loadSchema(uri) {
  return axios.get(uri).then((res) => {
    return res.data;
  });
}
const ajv = new Ajv({ loadSchema: loadSchema, strictSchema: false });
let validator;

describe.only("schema/v2.0", () => {
  before(async () => {
    validator = await ajv.compileAsync(schema);
  });
  it("is valid with minimum data", () => {
    const data = {
      id: "Example-minimal-2018-001",
      name: "Certificate Name",
      issuedOn: "2018-08-01T00:00:00+08:00",
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
      recipient: {
        name: "Recipient Name",
      },
    };

    console.log(validator(data));
    assert(validator(data));
  });
});
