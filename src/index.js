// @tradetrust-tt/tradetrust is the maintained OpenAttestation engine that
// @trustvc/trustvc is built on and bundles. It exposes the classic OpenAttestation
// document API (sync wrap with externalSchemaId, boolean verifySignature,
// MerkleTree) that this library relies on. @trustvc/trustvc's own open-attestation
// wrappers are higher-level (async, no schema field, non-boolean verify) and do
// not preserve this behaviour.
const {
  wrapDocument,
  wrapDocuments,
  getData,
  verifySignature,
  obfuscateDocument,
  MerkleTree,
} = require("@tradetrust-tt/tradetrust");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

/* eslint-disable global-require */
// Disabling eslint for this because it doesn't make sense
const schemas = {
  "1.0": require("../schema/transcripts/1.0/schema.json"),
  1.1: require("../schema/transcripts/1.1/schema.json"),
  1.2: require("../schema/transcripts/1.2/schema.json"),
  1.3: require("../schema/transcripts/1.3/schema.json"),
  1.4: require("../schema/transcripts/1.4/schema.json"),
  1.5: require("../schema/transcripts/1.5/schema.json"),
  "2.0": require("../schema/transcripts/2.0/schema.json"),
  2.1: require("../schema/transcripts/2.1/schema.json"),
  2.2: require("../schema/transcripts/2.2/schema.json"),
};
/* eslint-enable global-require */

const defaultSchema = schemas["2.0"];

// OpenAttestation removed its custom-schema registration (addSchema), so the
// OpenCerts schemas are validated with Ajv here while @tradetrust-tt/tradetrust
// handles wrapping, data extraction, signature verification and obfuscation.
const ajv = new Ajv({ strictSchema: false, allErrors: true });
addFormats(ajv);
const validators = {};
Object.values(schemas).forEach((schema) => {
  validators[schema.$id] = ajv.compile(schema);
});

const getValidator = (schema) => {
  if (schema && validators[schema.$id]) return validators[schema.$id];
  if (schema) return ajv.compile(schema);
  return validators[defaultSchema.$id];
};

const assertValid = (data, schema) => {
  const validate = getValidator(schema);
  if (!validate(data)) {
    const error = new Error("Invalid document");
    error.validationErrors = validate.errors;
    throw error;
  }
};

// Modern OpenAttestation only adds the `privacy` field once a document is
// obfuscated, whereas the legacy library always included an empty one. Seed it
// (it is metadata outside the signed targetHash, so this does not affect the
// signature) to preserve the previous document shape.
const withPrivacy = (document) => ({
  ...document,
  privacy: document.privacy || { obfuscatedData: [] },
});

const issueCertificate = (data, schema = defaultSchema) => {
  assertValid(data, schema);
  return withPrivacy(wrapDocument(data, { externalSchemaId: schema.$id }));
};

const issueCertificates = (dataArray, schema = defaultSchema) => {
  dataArray.forEach((data) => assertValid(data, schema));
  return wrapDocuments(dataArray, { externalSchemaId: schema.$id }).map(
    withPrivacy
  );
};

const obfuscateFields = (document, fields) =>
  obfuscateDocument(document, fields);

const certificateData = (document) => getData(document);

const validateSchema = (document, schema) => {
  const data = document && document.data ? getData(document) : document;
  let validate;
  if (schema) {
    validate = getValidator(schema);
  } else if (document && document.schema && validators[document.schema]) {
    validate = validators[document.schema];
  } else {
    validate = validators[defaultSchema.$id];
  }
  return Boolean(validate(data));
};

module.exports = {
  issueCertificate,
  issueCertificates,
  verifySignature,
  validateSchema,
  obfuscateFields,
  certificateData,
  schemas,
  defaultSchema,
  MerkleTree,
};
