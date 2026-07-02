/* eslint-disable */
// Compatibility shim that replaces the deprecated @govtechsg/open-attestation
// API used by the transcript schema tests. Those tests only exercise custom
// OpenCerts schema validation (the behaviour OpenAttestation's removed addSchema
// used to provide), so this is implemented with Ajv. Document wrapping/signing
// is handled by @trustvc/trustvc in src/index.js and is not needed here.
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({ strictSchema: false, allErrors: true });
addFormats(ajv);

const validators = {};
const keyOf = (schema) => schema.$id || schema.id;

const getValidator = (schema) => {
  const key = keyOf(schema);
  if (!validators[key]) validators[key] = ajv.compile(schema);
  return validators[key];
};

// Registers a custom schema (idempotent) — the Ajv replacement for the removed
// OpenAttestation addSchema.
const addSchema = (schema) => {
  const list = Array.isArray(schema) ? schema : [schema];
  list.forEach((s) => getValidator(s));
};

const assertValid = (data, schema) => {
  if (!getValidator(schema)(data)) {
    throw new Error("Invalid document");
  }
};

// Equivalent of the old issueDocument(data, schema): validate against the custom
// schema (throwing "Invalid document" on failure) and return a minimal document
// carrying the data + schema id so validateSchema can re-check it.
const issueDocument = (data, schema) => {
  assertValid(data, schema);
  return { schema: keyOf(schema), data };
};

const issueDocuments = (dataArray, schema) => {
  dataArray.forEach((data) => assertValid(data, schema));
  return dataArray.map((data) => ({ schema: keyOf(schema), data }));
};

const validateSchema = (document, schema) => {
  const data = document && document.data ? document.data : document;
  let validate;
  if (schema) {
    validate = getValidator(schema);
  } else if (document && document.schema && validators[document.schema]) {
    validate = validators[document.schema];
  } else {
    return false;
  }
  return Boolean(validate(data));
};

module.exports = { issueDocument, issueDocuments, addSchema, validateSchema };
