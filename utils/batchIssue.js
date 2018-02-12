const fs = require("fs");
const { issueCertificates } = require("./certificateBatch");
const Certificate = require("./certificate");

function batchIssue(inputDir, outputDir) {
  function getRawCertificates(path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, items) => {
        if (err) return reject(err);

        const certificates = items.map(i =>
          JSON.parse(fs.readFileSync(path + i))
        );
        return resolve(certificates);
      });
    });
  }

  return getRawCertificates(inputDir).then(certificates => {
    const batch = issueCertificates(certificates);
    const batchRoot = batch.getRoot().toString("hex");

    certificates.forEach(c => {
      const proof = batch.getProof(c).map(p => p.toString("hex"));

      const receipt = Object.assign({}, c, {
        signature: {
          type: "SHA3MerkleProof",
          targetHash: new Certificate(c).getRoot().toString("hex"),
          proof,
          merkleRoot: batchRoot
        }
      });

      const fileName = c.id;

      fs.writeFileSync(
        `${outputDir}${fileName}.json`,
        JSON.stringify(receipt, null, 2)
      );
    });

    return batchRoot;
  });
}

module.exports = batchIssue;
