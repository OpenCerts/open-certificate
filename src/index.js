const {
  getData,
  issueDocument,
  issueDocuments,
  addSchema,
  verifySignature,
  validateSchema,
  obfuscateDocument
} = require("@govtechsg/open-attestation");

const schema = require("../schema/latest/schema.json");

const defaultSchema = schema;

// Start - Initialise all valid schema
addSchema(schema);
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
