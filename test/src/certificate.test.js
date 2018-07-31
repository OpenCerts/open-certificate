const Certificate = require("../../src/certificate");
const { sha256 } = require("../../src/utils");
const _ = require("lodash");

const rawCertificate = {
  type: "Assertion",
  issuedOn: "2017-05-01",
  id: "urn:uuid:8e0b8a28-beff-43de-a72c-820bc360db3d",
  "@context": [
    "https://openbadgespec.org/v2/context.json",
    "https://govtechsg.github.io/certificate-schema/schema/1.0/context.json"
  ],
  badge: {
    type: "BadgeClass",
    issuer: {
      type: "Profile",
      id: "https://www.nus.edu.sg/profile.json",
      url: "https://www.nus.edu.sg",
      name: "National University of Singapore"
    },
    name: "BACHELOR OF ARTS",
    criteria: {
      narrative: "Student must complete all require academic units"
    },
    evidencePrivacyFilter: {
      type: "SaltedProof",
      saltLength: "10"
    },
    evidence: {
      transcript: [
        {
          name: "AUSJDLEOFP:AN INTRODUCTION TO LITERARY STUDIES",
          grade: "DUEJFOSDEL:C+",
          courseCredit: "UDIFMCJSPD:4.00",
          courseCode: "EPDUSJCNZL:EN1101E"
        },
        {
          name: "FKSIDKFLXO:HIDDEN COURSE NAME",
          grade: "DUFOEPLIID:D",
          courseCredit: "UDIFMCJSPD:4.00",
          courseCode: "EPDUSJCNZL:HID001"
        },
        {
          name: "PAJSUDJCHS:EINSTEIN's UNIVERSE & QUANTUM WEIRDNESS",
          grade: "IWUEJDKZMS:C+",
          courseCredit: "QPWOEKDNZJ:4.00",
          courseCode: "KSIDMAJJAP:PC1325"
        }
      ]
    }
  },
  verification: {
    type: "ETHStoreProof",
    contractAddress: "0x76bc9e61a1904b82cbf70d1fd9c0f8a120483bbb"
  },
  signature: {
    type: "SHA3MerkleProof",
    targetHash:
      "1de4d6b598ea494b400d5b805dc2f8f6928c64cb392506929b3c4f4c795b466f",
    proof: [
      "09017ea119c27f432fcbddf3c01027bb8678949d5c39b103d190f7e34b0a4b7d",
      "c7c153c8c694e3d02a1cae25763a01172a702da69f63c831358a522628880284"
    ],
    merkleRoot:
      "1b5402f3b9100a87dca74a1a7ff64bcfd2f29c5c73857486f663b320caafb45f"
  },
  recipient: [
    {
      type: "email",
      identity: "sample@example.com"
    },
    {
      type: "did",
      identity: "did:example:123456789abcdefghi"
    }
  ]
};

const rawCertificateSingle = {
  type: "Assertion",
  issuedOn: "2017-05-01",
  id: "urn:uuid:8e0b8a28-beff-43de-a72c-820bc360db3d",
  "@context": [
    "https://openbadgespec.org/v2/context.json",
    "https://govtechsg.github.io/certificate-schema/schema/1.0/context.json"
  ],
  badge: {
    type: "BadgeClass",
    issuer: {
      type: "Profile",
      id: "https://www.nus.edu.sg/profile.json",
      url: "https://www.nus.edu.sg",
      name: "National University of Singapore"
    },
    name: "BACHELOR OF ARTS",
    criteria: {
      narrative: "Student must complete all require academic units"
    },
    evidencePrivacyFilter: {
      type: "SaltedProof",
      saltLength: "10"
    },
    evidence: {
      transcript: [
        {
          name: "AUSJDLEOFP:AN INTRODUCTION TO LITERARY STUDIES",
          grade: "DUEJFOSDEL:C+",
          courseCredit: "UDIFMCJSPD:4.00",
          courseCode: "EPDUSJCNZL:EN1101E"
        },
        {
          name: "FKSIDKFLXO:HIDDEN COURSE NAME",
          grade: "DUFOEPLIID:D",
          courseCredit: "UDIFMCJSPD:4.00",
          courseCode: "EPDUSJCNZL:HID001"
        },
        {
          name: "PAJSUDJCHS:EINSTEIN's UNIVERSE & QUANTUM WEIRDNESS",
          grade: "IWUEJDKZMS:C+",
          courseCredit: "QPWOEKDNZJ:4.00",
          courseCode: "KSIDMAJJAP:PC1325"
        }
      ]
    }
  },
  verification: {
    type: "ETHStoreProof",
    contractAddress: "0x76bc9e61a1904b82cbf70d1fd9c0f8a120483bbb"
  },
  signature: {
    type: "SHA3MerkleProof",
    targetHash:
      "1de4d6b598ea494b400d5b805dc2f8f6928c64cb392506929b3c4f4c795b466f",
    proof: [
      "09017ea119c27f432fcbddf3c01027bb8678949d5c39b103d190f7e34b0a4b7d",
      "c7c153c8c694e3d02a1cae25763a01172a702da69f63c831358a522628880284"
    ],
    merkleRoot:
      "1b5402f3b9100a87dca74a1a7ff64bcfd2f29c5c73857486f663b320caafb45f"
  },
  recipient: {
    type: "email",
    identity: "sample@example.com"
  }
};
describe("certificate", () => {
  describe("Certificate", () => {
    const certificate = new Certificate(rawCertificate);

    it("is a pure function", () => {
      expect(rawCertificate.badge.evidenceRoot).to.be.undefined;
      expect(rawCertificate.badge.evidence).to.exist;
    });

    it("resolves a partially private certificate", () => {
      const rawCertificate2 = {
        type: "Assertion",
        issuedOn: "2017-05-01",
        id: "urn:uuid:8e0b8a28-beff-43de-a72c-820bc360db3d",
        "@context": [
          "https://openbadgespec.org/v2/context.json",
          "https://govtechsg.github.io/certificate-schema/schema/1.0/context.json"
        ],
        badge: {
          type: "BadgeClass",
          issuer: {
            type: "Profile",
            id: "https://www.nus.edu.sg/profile.json",
            url: "https://www.nus.edu.sg",
            name: "National University of Singapore"
          },
          name: "BACHELOR OF ARTS",
          criteria: {
            narrative: "Student must complete all require academic units"
          },
          evidencePrivacyFilter: {
            type: "SaltedProof",
            saltLength: "10"
          },
          evidence: {
            // eslint-disable-next-line no-sparse-arrays
            transcript: [
              {
                name: "AUSJDLEOFP:AN INTRODUCTION TO LITERARY STUDIES",
                grade: "DUEJFOSDEL:C+",
                courseCredit: "UDIFMCJSPD:4.00",
                courseCode: "EPDUSJCNZL:EN1101E"
              },
              {},
              {
                name: "PAJSUDJCHS:EINSTEIN's UNIVERSE & QUANTUM WEIRDNESS",
                grade: "IWUEJDKZMS:C+",
                courseCredit: "QPWOEKDNZJ:4.00",
                courseCode: "KSIDMAJJAP:PC1325"
              }
            ]
          },
          privateEvidence: [
            "e8c1585967cdff8ccda49d1b715d5e2d5c7358b523fd4931f0004f5f97ac0ad3",
            "79b146d13c5188d6196fd217e219aeff485f2f553b63b6d2764579193d039aea",
            "ff99de3091f27a8c1be3ba693b06e99871f4f7bbaf6dfe9494eb782fbb4b60a9",
            "bd2f72d7197dd8cf80530b1a1558ebb46740b3d5d646d146e9f91df93ad49acc"
          ]
        },
        verification: {
          type: "ETHStoreProof",
          contractAddress: "0x76bc9e61a1904b82cbf70d1fd9c0f8a120483bbb"
        },
        signature: {
          type: "SHA3MerkleProof",
          targetHash:
            "1de4d6b598ea494b400d5b805dc2f8f6928c64cb392506929b3c4f4c795b466f",
          proof: [
            "09017ea119c27f432fcbddf3c01027bb8678949d5c39b103d190f7e34b0a4b7d",
            "c7c153c8c694e3d02a1cae25763a01172a702da69f63c831358a522628880284"
          ],
          merkleRoot:
            "1b5402f3b9100a87dca74a1a7ff64bcfd2f29c5c73857486f663b320caafb45f"
        },
        recipient: [
          {
            type: "email",
            identity: "sample@example.com"
          },
          {
            type: "did",
            identity: "did:example:123456789abcdefghi"
          }
        ]
      };

      const equivalentCert = new Certificate(rawCertificate2);
      expect(certificate.evidenceTree.getRoot().toString("hex")).to.eql(
        equivalentCert.evidenceTree.getRoot().toString("hex")
      );

      expect(certificate.certificateTree.getRoot().toString("hex")).to.eql(
        equivalentCert.certificateTree.getRoot().toString("hex")
      );
    });

    it("resolves a private certificate", () => {
      const rawCertificate2 = {
        type: "Assertion",
        issuedOn: "2017-05-01",
        id: "urn:uuid:8e0b8a28-beff-43de-a72c-820bc360db3d",
        "@context": [
          "https://openbadgespec.org/v2/context.json",
          "https://govtechsg.github.io/certificate-schema/schema/1.0/context.json"
        ],
        badge: {
          type: "BadgeClass",
          issuer: {
            type: "Profile",
            id: "https://www.nus.edu.sg/profile.json",
            url: "https://www.nus.edu.sg",
            name: "National University of Singapore"
          },
          name: "BACHELOR OF ARTS",
          criteria: {
            narrative: "Student must complete all require academic units"
          },
          evidencePrivacyFilter: {
            type: "SaltedProof",
            saltLength: "10"
          },
          evidenceRoot:
            "ae2b5444f5bbe0cabcd67b7ea902f308f106ee0ae2634007d2e2e14884a74ce1"
        },
        verification: {
          type: "ETHStoreProof",
          contractAddress: "0x76bc9e61a1904b82cbf70d1fd9c0f8a120483bbb"
        },
        signature: {
          type: "SHA3MerkleProof",
          targetHash:
            "1de4d6b598ea494b400d5b805dc2f8f6928c64cb392506929b3c4f4c795b466f",
          proof: [
            "09017ea119c27f432fcbddf3c01027bb8678949d5c39b103d190f7e34b0a4b7d",
            "c7c153c8c694e3d02a1cae25763a01172a702da69f63c831358a522628880284"
          ],
          merkleRoot:
            "1b5402f3b9100a87dca74a1a7ff64bcfd2f29c5c73857486f663b320caafb45f"
        },
        recipient: [
          {
            type: "email",
            identity: "sample@example.com"
          },
          {
            type: "did",
            identity: "did:example:123456789abcdefghi"
          }
        ]
      };

      const equivalentCert = new Certificate(rawCertificate2);

      expect(certificate.certificateTree.getRoot().toString("hex")).to.eql(
        equivalentCert.certificateTree.getRoot().toString("hex")
      );
    });

    describe("verifyCertificate", () => {
      it("should verify a valid cert", () => {
        const validCertJson = _.cloneDeep(rawCertificate);
        const validCert = new Certificate(validCertJson);

        expect(validCert.verify()).to.be.true;
      });

      it("should throw an error if the certificate does not have a signature", () => {
        const invalidCertJson = _.cloneDeep(rawCertificate);
        delete invalidCertJson.signature;
        const invalidCert = new Certificate(invalidCertJson);

        expect(invalidCert.verify.bind(invalidCert)).to.throw(
          "Certificate does not have a signature"
        );
      });

      it("should throw an error if the signature algorithm is not supported", () => {
        const invalidCertJson = _.cloneDeep(rawCertificate);
        invalidCertJson.signature.type = "unsupported signature";
        const invalidCert = new Certificate(invalidCertJson);

        expect(invalidCert.verify.bind(invalidCert)).to.throw(
          "Signature algorithm is not supported"
        );
      });

      it("should throw an error if the certificate does not have a targetHash", () => {
        const invalidCertJson = _.cloneDeep(rawCertificate);
        delete invalidCertJson.signature.targetHash;
        const invalidCert = new Certificate(invalidCertJson);

        expect(invalidCert.verify.bind(invalidCert)).to.throw(
          "Certificate does not have a targetHash"
        );
      });

      it("should throw an error if the certificate does not have a merkleRoot", () => {
        const invalidCertJson = _.cloneDeep(rawCertificate);
        delete invalidCertJson.signature.merkleRoot;
        const invalidCert = new Certificate(invalidCertJson);

        expect(invalidCert.verify.bind(invalidCert)).to.throw(
          "Certificate does not have a merkleRoot"
        );
      });

      it("should throw an error if the certificate hash does not match signature target hash", () => {
        const invalidCertJson = _.cloneDeep(rawCertificate);
        invalidCertJson.signature.targetHash = "wrong target hash";
        const invalidCert = new Certificate(invalidCertJson);

        expect(invalidCert.verify.bind(invalidCert)).to.throw(
          "Certificate hash does not match signature targetHash"
        );
      });

      it("should throw an error if certificate proof is invalid for merkle root", () => {
        const invalidCertJson = _.cloneDeep(rawCertificate);
        invalidCertJson.signature.proof[0] = "0xfail";
        const invalidCert = new Certificate(invalidCertJson);

        expect(invalidCert.verify.bind(invalidCert)).to.throw(
          "Certificate proof is invalid for merkle root"
        );
      });
    });
    describe("privacyFilter", () => {
      it("can remove one key/value from array", () => {
        const cert = new Certificate(rawCertificate);
        const originalRoot = cert.getRoot().toString("hex");

        const filteredCert = cert.privacyFilter("transcript.1.name");
        const newRoot = filteredCert.getRoot().toString("hex");

        expect(filteredCert.getCertificate().badge.evidence.transcript[1].name)
          .to.be.undefined;
        expect(
          filteredCert.getCertificate().badge.privateEvidence.length
        ).to.eql(1, "Incorrect number of private evidences");
        expect(originalRoot).to.eql(newRoot, "Certificate has been changed");
        expect(filteredCert.verify()).to.eql(
          true,
          "Certificate signature is corrupt"
        );
      });

      it("can remove key/value from array", () => {
        const cert = new Certificate(rawCertificate);
        const originalRoot = cert.getRoot().toString("hex");

        const filteredCert = cert.privacyFilter(["transcript.2.name"]);
        const newRoot = filteredCert.getRoot().toString("hex");

        expect(filteredCert.getCertificate().badge.evidence.transcript[2].name)
          .to.be.undefined;
        expect(
          filteredCert.getCertificate().badge.privateEvidence.length
        ).to.eql(1, "Incorrect number of private evidences");
        expect(originalRoot).to.eql(newRoot, "Certificate has been changed");
        expect(filteredCert.verify()).to.eql(
          true,
          "Certificate signature is corrupt"
        );
      });

      it("can remove entire object from array", () => {
        const cert = new Certificate(rawCertificate);
        const originalRoot = cert.getRoot().toString("hex");

        const filteredCert = cert.privacyFilter([
          "transcript.1.name",
          "transcript.1.grade",
          "transcript.1.courseCredit",
          "transcript.1.courseCode"
        ]);
        const newRoot = filteredCert.getRoot().toString("hex");

        expect(
          filteredCert.getCertificate().badge.evidence.transcript[1]
        ).to.eql({});
        expect(
          filteredCert.getCertificate().badge.privateEvidence.length
        ).to.eql(4, "Incorrect number of private evidences");
        expect(originalRoot).to.eql(newRoot, "Certificate has been changed");
        expect(filteredCert.verify()).to.eql(
          true,
          "Certificate signature is corrupt"
        );
      });

      it("does nothing for unpresent fields", () => {
        const cert = new Certificate(rawCertificate);
        const originalRoot = cert.getRoot().toString("hex");

        const filteredCert = cert.privacyFilter("transcript.1.invalidField");

        const newRoot = filteredCert.getRoot().toString("hex");

        expect(filteredCert.getCertificate().badge.privateEvidence).to.be
          .undefined;
        expect(originalRoot).to.eql(newRoot, "Certificate has been changed");
        expect(filteredCert.verify()).to.eql(
          true,
          "Certificate signature is corrupt"
        );
      });
    });

    describe("identityFilter", () => {
      it("hides identity in the index", () => {
        const cert = new Certificate(rawCertificate);
        const filteredCert = cert.identityFilter(1);

        const recipients = filteredCert.getCertificate().recipient;

        expect(recipients[1].hashed).to.be.true;
        expect(recipients[1]).to.have.property("type");
        expect(recipients[1]).to.have.property("identity");
        expect(recipients[1]).to.have.property("salt");

        const correctHash = sha256(
          cert.getCertificate().recipient[1].identity,
          recipients[1].salt
        );
        expect(recipients[1].identity).to.be.eql(correctHash);
      });

      it("hides all identities when no index is passed in", () => {
        const cert = new Certificate(rawCertificate);
        const filteredCert = cert.identityFilter();

        const recipients = filteredCert.getCertificate().recipient;

        recipients.forEach(r => {
          expect(r.hashed).to.be.true;
        });
      });

      it("does not hash an already hashed identity", () => {
        const cert = new Certificate(rawCertificate);
        const filteredCert = cert.identityFilter(0);
        const filteredCert2 = filteredCert.identityFilter(0);

        expect(cert.getCertificate().recipient[0].identity).to.not.eql(
          filteredCert.getCertificate().recipient[0].identity
        );
        expect(filteredCert.getCertificate().recipient[0].identity).to.eql(
          filteredCert2.getCertificate().recipient[0].identity
        );
      });

      it("hides the only identity when no index is passed in", () => {
        const cert = new Certificate(rawCertificateSingle);
        const filteredCert = cert.identityFilter();

        const { recipient } = filteredCert.getCertificate();

        expect(recipient.hashed).to.be.true;
        expect(recipient).to.have.property("type");
        expect(recipient).to.have.property("identity");
        expect(recipient).to.have.property("salt");
      });
    });

    describe("identityCheck", () => {
      const salt = "1234567890";
      const email = "someone@example.com";
      const hashedIdentity = {
        type: "email",
        salt,
        hashed: true,
        identity: sha256(email, salt)
      };

      it("test if the identity is correct", () => {
        expect(Certificate.identityCheck(hashedIdentity, email)).to.be.true;
        expect(Certificate.identityCheck(hashedIdentity, `${email}.sg`)).to.be
          .false;
      });
    });

    describe("unsalt", () => {
      const unsaltedTranscript = [
        {
          name: "AN INTRODUCTION TO LITERARY STUDIES",
          grade: "C+",
          courseCredit: "4.00",
          courseCode: "EN1101E"
        },
        {
          name: "HIDDEN COURSE NAME",
          grade: "D",
          courseCredit: "4.00",
          courseCode: "HID001"
        },
        {
          name: "EINSTEIN's UNIVERSE & QUANTUM WEIRDNESS",
          grade: "C+",
          courseCredit: "4.00",
          courseCode: "PC1325"
        }
      ];

      it("should remove the salt on the certificate correctly", () => {
        const unsaltedCert = new Certificate(rawCertificate).unsalt();
        expect(unsaltedCert.badge.evidence.transcript).to.deep.eql(
          unsaltedTranscript
        );
      });
    });
  });
});
