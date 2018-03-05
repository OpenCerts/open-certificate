const Certificate = require("./src/certificate");
const { randomCertificate } = require("./src/randomCertificateGenerator");
const {
  CertificateBatch,
  issueCertificates
} = require("./src/certificateBatch");

module.exports = {
  Certificate,
  randomCertificate,
  CertificateBatch,
  issueCertificates
};
