const {
  issueDocument,
  issueDocuments,
  addSchema,
  verifySignature,
  validateSchema,
  obfuscateDocument
} = require("@govtechsg/open-attestation");

const schemaV1 = require("../schema/v1/schema.json");

const defaultSchema = schemaV1;

// Start - Initialise all valid schema
addSchema(schemaV1);
// End - Initialise all valid schema

const issueCertificate = data => issueDocument(data, defaultSchema);

const issueCertificates = dataArray => issueDocuments(dataArray, defaultSchema);

const obfuscateFields = (document, fields) =>
  obfuscateDocument(document, fields);

module.exports = {
  issueCertificate,
  issueCertificates,
  verifySignature,
  validateSchema,
  obfuscateFields
};
