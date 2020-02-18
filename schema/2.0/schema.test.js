/* eslint-disable */
const schema = require("./schema.json");
let {
  issueDocument,
  addSchema,
  validateSchema
} = require("@govtechsg/open-attestation");

describe("schema/v2.0", () => {
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
          documentStore: "0x0000000000000000000000000000000000000000",
          identityProof: {
            type: "DNS-TXT",
            location: "example.com"
          }
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

  it("is not valid with empty issuer array (issue with 1.3)", () => {
    const data = {
      name: "Certificate Name",
      issuedOn: "2018-08-01T00:00:00+08:00",
      issuers: [],
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
          documentStore: "0x0000000000000000000000000000000000000000",
          identityProof: {
            type: "DNS-TXT",
            location: "example.com"
          }
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

  describe("schema 2.0 specific additions", () => {
    it("should work with new $template format", () => {
      const data = {
        id: "new $template",
        name: "Certificate Name",
        issuedOn: "2018-08-01T00:00:00+08:00",
        issuers: [
          {
            name: "Issuer Name",
            documentStore: "0x0000000000000000000000000000000000000000",
            identityProof: {
              type: "DNS-TXT",
              location: "example.com"
            }
          }
        ],
        recipient: {
          name: "Recipient Name"
        },
        $template: {
          name: "GOVTECH_DEMO",
          type: "EMBEDDED_RENDERER",
          url: "https://demo-renderer.opencerts.io"
        },
        qualificationLevel: [
          {
            frameworkName: "singapore/ssec-eqa",
            frameworkVersion: "2015",
            code: "51",
            description: "Polytechnic Diploma"
          }
        ],
        fieldOfStudy: [
          {
            frameworkName: "singapore/ssec-fos",
            frameworkVersion: "2015",
            code: "0897",
            description: "Biomedical Science"
          }
        ]
      };

      const signedDocument = issueDocument(data, schema);
      const valid = validateSchema(signedDocument);
      assert(valid);
    });

    it("should fail with empty $template format", () => {
      const data = {
        id: "new $template",
        name: "Certificate Name",
        issuedOn: "2018-08-01T00:00:00+08:00",
        issuers: [
          {
            name: "Issuer Name",
            documentStore: "0x0000000000000000000000000000000000000000",
            identityProof: {
              type: "DNS-TXT",
              location: "example.com"
            }
          }
        ],
        recipient: {
          name: "Recipient Name"
        },
        $template: {},
        qualificationLevel: [
          {
            frameworkName: "singapore/ssec-eqa",
            frameworkVersion: "2015",
            code: "51",
            description: "Polytechnic Diploma"
          }
        ],
        fieldOfStudy: [
          {
            frameworkName: "singapore/ssec-fos",
            frameworkVersion: "2015",
            code: "0897",
            description: "Biomedical Science"
          }
        ]
      };

      const signing = () => issueDocument(data, schema);
      expect(signing).to.throw("Invalid document");
    });

    it("should fail with invalid $template name field", () => {
      const data = {
        id: "new $template",
        name: "Certificate Name",
        issuedOn: "2018-08-01T00:00:00+08:00",
        issuers: [
          {
            name: "Issuer Name",
            documentStore: "0x0000000000000000000000000000000000000000",
            identityProof: {
              type: "DNS-TXT",
              location: "example.com"
            }
          }
        ],
        recipient: {
          name: "Recipient Name"
        },
        $template: {
          name: 5,
          type: "EMBEDDED_RENDERER",
          url: "https://demo-renderer.opencerts.io"
        },
        qualificationLevel: [
          {
            frameworkName: "singapore/ssec-eqa",
            frameworkVersion: "2015",
            code: "51",
            description: "Polytechnic Diploma"
          }
        ],
        fieldOfStudy: [
          {
            frameworkName: "singapore/ssec-fos",
            frameworkVersion: "2015",
            code: "0897",
            description: "Biomedical Science"
          }
        ]
      };

      const signing = () => issueDocument(data, schema);
      expect(signing).to.throw("Invalid document");
    });

    it("should fail with invalid $template type field", () => {
      const data = {
        id: "new $template",
        name: "Certificate Name",
        issuedOn: "2018-08-01T00:00:00+08:00",
        issuers: [
          {
            name: "Issuer Name",
            documentStore: "0x0000000000000000000000000000000000000000",
            identityProof: {
              type: "DNS-TXT",
              location: "example.com"
            }
          }
        ],
        recipient: {
          name: "Recipient Name"
        },
        $template: {
          name: "GOVTECH_DEMO",
          type: "IFRAME_RENDERER",
          url: "https://demo-renderer.opencerts.io"
        },
        qualificationLevel: [
          {
            frameworkName: "singapore/ssec-eqa",
            frameworkVersion: "2015",
            code: "51",
            description: "Polytechnic Diploma"
          }
        ],
        fieldOfStudy: [
          {
            frameworkName: "singapore/ssec-fos",
            frameworkVersion: "2015",
            code: "0897",
            description: "Biomedical Science"
          }
        ]
      };

      const signing = () => issueDocument(data, schema);
      expect(signing).to.throw("Invalid document");
    });

    it("should fail with invalid $template url field", () => {
      const data = {
        id: "new $template",
        name: "Certificate Name",
        issuedOn: "2018-08-01T00:00:00+08:00",
        issuers: [
          {
            name: "Issuer Name",
            documentStore: "0x0000000000000000000000000000000000000000",
            identityProof: {
              type: "DNS-TXT",
              location: "example.com"
            }
          }
        ],
        recipient: {
          name: "Recipient Name"
        },
        $template: {
          name: "GOVTECH_DEMO",
          type: "EMBEDDED_RENDERER",
          url: 5
        },
        qualificationLevel: [
          {
            frameworkName: "singapore/ssec-eqa",
            frameworkVersion: "2015",
            code: "51",
            description: "Polytechnic Diploma"
          }
        ],
        fieldOfStudy: [
          {
            frameworkName: "singapore/ssec-fos",
            frameworkVersion: "2015",
            code: "0897",
            description: "Biomedical Science"
          }
        ]
      };

      const signing = () => issueDocument(data, schema);
      expect(signing).to.throw("Invalid document");
    });

    it("should fail with $template name missing", () => {
      const data = {
        id: "new $template",
        name: "Certificate Name",
        issuedOn: "2018-08-01T00:00:00+08:00",
        issuers: [
          {
            name: "Issuer Name",
            documentStore: "0x0000000000000000000000000000000000000000",
            identityProof: {
              type: "DNS-TXT",
              location: "example.com"
            }
          }
        ],
        recipient: {
          name: "Recipient Name"
        },
        $template: {
          type: "EMBDEDDED_RENDERER",
          url: "https://demo-renderer.opencerts.io"
        },
        qualificationLevel: [
          {
            frameworkName: "singapore/ssec-eqa",
            frameworkVersion: "2015",
            code: "51",
            description: "Polytechnic Diploma"
          }
        ],
        fieldOfStudy: [
          {
            frameworkName: "singapore/ssec-fos",
            frameworkVersion: "2015",
            code: "0897",
            description: "Biomedical Science"
          }
        ]
      };

      const signing = () => issueDocument(data, schema);
      expect(signing).to.throw("Invalid document");
    });

    it("should fail with $template type missing", () => {
      const data = {
        id: "new $template",
        name: "Certificate Name",
        issuedOn: "2018-08-01T00:00:00+08:00",
        issuers: [
          {
            name: "Issuer Name",
            documentStore: "0x0000000000000000000000000000000000000000",
            identityProof: {
              type: "DNS-TXT",
              location: "example.com"
            }
          }
        ],
        recipient: {
          name: "Recipient Name"
        },
        $template: {
          name: "GOVTECH_DEMO",
          url: "https://demo-renderer.opencerts.io"
        },
        qualificationLevel: [
          {
            frameworkName: "singapore/ssec-eqa",
            frameworkVersion: "2015",
            code: "51",
            description: "Polytechnic Diploma"
          }
        ],
        fieldOfStudy: [
          {
            frameworkName: "singapore/ssec-fos",
            frameworkVersion: "2015",
            code: "0897",
            description: "Biomedical Science"
          }
        ]
      };

      const signing = () => issueDocument(data, schema);
      expect(signing).to.throw("Invalid document");
    });

    it("should fail with $template url missing", () => {
      const data = {
        id: "new $template",
        name: "Certificate Name",
        issuedOn: "2018-08-01T00:00:00+08:00",
        issuers: [
          {
            name: "Issuer Name",
            documentStore: "0x0000000000000000000000000000000000000000",
            identityProof: {
              type: "DNS-TXT",
              location: "example.com"
            }
          }
        ],
        recipient: {
          name: "Recipient Name"
        },
        $template: {
          name: "GOVTECH_DEMO",
          type: "EMBEDDED_RENDERER"
        },
        qualificationLevel: [
          {
            frameworkName: "singapore/ssec-eqa",
            frameworkVersion: "2015",
            code: "51",
            description: "Polytechnic Diploma"
          }
        ],
        fieldOfStudy: [
          {
            frameworkName: "singapore/ssec-fos",
            frameworkVersion: "2015",
            code: "0897",
            description: "Biomedical Science"
          }
        ]
      };

      const signing = () => issueDocument(data, schema);
      expect(signing).to.throw("Invalid document");
    });
  });

  it("is valid with additional properties in issuer", () => {
    const data = {
      id: "Example-minimal-2018-001",
      name: "Certificate Name",
      issuedOn: "2018-08-01T00:00:00+08:00",
      issuers: [
        {
          name: "Issuer Name",
          documentStore: "0x0000000000000000000000000000000000000000",
          additionalProp: true,
          identityProof: {
            type: "DNS-TXT",
            location: "example.com"
          }
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

  it("is valid with additional properties in recipient", () => {
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
            location: "example.com"
          }
        }
      ],
      recipient: {
        name: "Recipient Name",
        additionalProp: true
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
      expiresOn: "2118-08-01T00:00:00+08:00",
      name: "Master of Blockchain",
      description: "some description",
      issuers: [
        {
          name: "Blockchain Academy",
          did: "DID:SG-UEN:U18274928E",
          url: "https://blockchainacademy.com",
          email: "registrar@blockchainacademy.com",
          documentStore: "0xd9580260be45c3c0c2fb259a82f219b513054012",
          identityProof: {
            type: "DNS-TXT",
            location: "example.com"
          }
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
      description: "some description",
      issuedOn: "2018-08-01T00:00:00+08:00",
      issuers: [
        {
          name: "Issuer Name",
          documentStore: "0x0000000000000000000000000000000000000000",
          identityProof: {
            type: "DNS-TXT",
            location: "example.com"
          }
        }
      ],
      recipient: {
        name: "Recipient Name"
      },
      transcript: [
        {
          name: "Bitcoin",
          "random-key": "Is Valid"
        }
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
