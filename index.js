const fs = require('fs');
const {issueCertificates, getCertificateProof} = require('./utils/certificateBatch');
const Certificate = require('./utils/certificate');

const rawCertificatePath = './certificates/raw-certificates/';
const certificateReceiptPath = './certificates/processed-certificates/';

function getRawCertificates () {
  return new Promise((resolve, reject) => {
    fs.readdir(rawCertificatePath, function (err, items) {
      const certificates = items.map(i => require(rawCertificatePath + i));
      resolve(certificates);
    });
  });
}

getRawCertificates()
  .then(certificates => {
    const batch = issueCertificates(certificates);
    const batchRoot = batch.getRoot().toString('hex');

    console.log('Batch Certificate Root: ', batchRoot);

    certificates.forEach(c => {
      const proof = batch.getProof(c).map(p => p.toString('hex'));

      const receipt = {
        certificate: c,
        merkleRoot: batchRoot,
        targetHash: new Certificate(c).getRoot().toString('hex'),
        proof
      };

      const fileName = c.id.substring(31);

      fs.writeFileSync(`${certificateReceiptPath}${fileName}.json`, JSON.stringify(receipt, null, 2));
    });
  });
