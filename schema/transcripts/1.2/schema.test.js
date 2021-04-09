/* eslint-disable */
const schema = require("./schema.json");
let {
  issueDocument,
  addSchema,
  validateSchema
} = require("@govtechsg/open-attestation");

describe("schema/v1.2", () => {
  beforeEach(() => {
    addSchema(schema);
  });

  afterEach(() => {
    delete require.cache[require.resolve("@govtechsg/open-attestation")];
    let {
      issueDocument,
      addSchema,
      validateSchema
    } = require("@govtechsg/open-attestation");
  });

  it("is not valid with missing data", () => {
    const data = {};
    const signing = () => issueDocument(data, schema);
    expect(signing).to.throw("Invalid document");
  });

  it("is not valid with additional data", () => {
    const data = {
      name: "Certificate Name",
      issuedOn: "2018-08-01T00:00:00+08:00",
      issuers: [
        {
          name: "Issuer Name",
          certificateStore: "0x0000000000000000000000000000000000000000"
        }
      ],
      recipient: {
        name: "Recipient Name"
      },
      invalidKey: "value"
    };
    const signing = () => issueDocument(data, schema);
    expect(signing).to.throw("Invalid document");
  });

  it("is valid with minimum data", () => {
    const data = {
      id: "Example-minimal-2018-001",
      name: "Certificate Name",
      issuedOn: "2018-08-01T00:00:00+08:00",
      issuers: [
        {
          name: "Issuer Name",
          certificateStore: "0x0000000000000000000000000000000000000000"
        }
      ],
      recipient: {
        name: "Recipient Name"
      }
    };

    const signedDocument = issueDocument(data, schema);
    const valid = validateSchema(signedDocument);
    assert(valid);
  });

  it("is valid with standard data", () => {
    const data = {
      id: "Example-standard-2018-002",
      issuedOn: "2018-08-01T00:00:00+08:00",
      expiredOn: "2118-08-01T00:00:00+08:00",
      name: "Master of Blockchain",
      issuers: [
        {
          name: "Blockchain Academy",
          did: "DID:SG-UEN:U18274928E",
          url: "https://blockchainacademy.com",
          email: "registrar@blockchainacademy.com",
          certificateStore: "0xd9580260be45c3c0c2fb259a82f219b513054012"
        }
      ],
      recipient: {
        name: "Mr Blockchain",
        did: "DID:SG-NRIC:S99999999A",
        email: "mr-blockchain@gmail.com",
        phone: "+65 88888888"
      },
      transcript: [
        {
          name: "Bitcoin",
          grade: "A+",
          courseCredit: 3,
          courseCode: "BTC-01",
          url: "https://blockchainacademy.com/subject/BTC-01",
          description: "Everything and more about bitcoin!"
        },
        {
          name: "Ethereum",
          grade: "A+",
          courseCredit: "3.5",
          courseCode: "ETH-01",
          url: "https://blockchainacademy.com/subject/ETH-01",
          description: "Everything and more about ethereum!"
        }
      ]
    };
    const signedDocument = issueDocument(data, schema);
    const valid = validateSchema(signedDocument);
    assert(valid);
  });

  it("is valid with extra metadata data", () => {
    const data = {
      id: "Example-extrameta-2018-003",
      name: "Certificate Name",
      issuedOn: "2018-08-01T00:00:00+08:00",
      issuers: [
        {
          name: "Issuer Name",
          certificateStore: "0x0000000000000000000000000000000000000000"
        }
      ],
      recipient: {
        name: "Recipient Name"
      },
      transcript: [
        {
          "name": "Bitcoin",
          "random-key": "Is Valid"
        },
      ],
      additionalData: {
        array: [
          {
            key: "value"
          },
          {
            key: "value2"
          }
        ],
        number: 2,
        string: "hello",
        object: {
          hello: "world"
        }
      }
    };
    const signedDocument = issueDocument(data, schema);
    const valid = validateSchema(signedDocument);
    assert(valid);
  });

  it("validates the example document", () => {
    const data = require("./example.json");
    const signedDocument = issueDocument(data, schema);
    const valid = validateSchema(signedDocument);
    assert(valid);
  });
});
