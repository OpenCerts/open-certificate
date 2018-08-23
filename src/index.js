const {
  getData,
  issueDocument,
  issueDocuments,
  addSchema,
  verifySignature,
  validateSchema,
  obfuscateDocument
} = require("@govtechsg/open-attestation");

const schema_v1_0 = require("../schema/1.0/schema.json");
const schema_v1_1 = require("../schema/1.1/schema.json");
const schema_v1_2 = require("../schema/1.2/schema.json");

const defaultSchema = schema_v1_2;

// Start - Initialise all valid schema
addSchema(schema_v1_0);
addSchema(schema_v1_1);
addSchema(schema_v1_2);
// End - Initialise all valid schema

const issueCertificate = data => issueDocument(data, defaultSchema);

const issueCertificates = dataArray => issueDocuments(dataArray, defaultSchema);

const obfuscateFields = (document, fields) =>
  obfuscateDocument(document, fields);

const certificateData = document => getData(document);

module.exports = {
  issueCertificate,
  issueCertificates,
  verifySignature,
  validateSchema,
  obfuscateFields,
  certificateData
};
