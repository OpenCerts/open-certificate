const fs = require('fs');
const program = require('commander');
const {issueCertificates} = require('./utils/certificateBatch');
const Certificate = require('./utils/certificate');
const {checkProof} = require('./utils/merkle');
const {randomCertificate} = require('./test/utils');


function generateRandomCertificate(num){
  for (let i = 0; i < num; i++) {
    const cert = randomCertificate();
    const certId = cert.id;
    fs.writeFileSync(`./certificates/raw-certificates/${certId}.json`, JSON.stringify(cert, null, 2));
  }

  return num;
}

function batchIssueCertificates(inputDir, outputDir){
  function getRawCertificates (path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, function (err, items) {
        if (err) return reject(err);
        const certificates = items.map(i => require(path + i));
        resolve(certificates);
      });
    });
  }

  return getRawCertificates(inputDir)
    .then(certificates => {
      const batch = issueCertificates(certificates);
      const batchRoot = batch.getRoot().toString('hex');

      certificates.forEach(c => {
        const proof = batch.getProof(c).map(p => p.toString('hex'));

        const receipt = Object.assign({}, c, {
          signature:{
            type:'SHA3MerkleProof',
            targetHash: new Certificate(c).getRoot().toString('hex'),
            proof,
            merkleRoot: batchRoot,
          }
        });

        const fileName = c.id;

        fs.writeFileSync(`${outputDir}${fileName}.json`, JSON.stringify(receipt, null, 2));
      });

      return batchRoot;
    });
}

function verifyCertificate(certificate){  
  // Checks the signature of the certificate
  if(!certificate.signature) throw new Error('Certificate does not have a signature');
  if(certificate.signature.type != 'SHA3MerkleProof') throw new Error('Signature algorithm is not supported');
  if(!certificate.signature.targetHash) throw new Error('Certificate does not have a targetHash');
  if(!certificate.signature.merkleRoot) throw new Error('Certificate does not have a merkleRoot');

  const generatedCertificate = new Certificate(certificate);
  const targetHash = generatedCertificate.getRoot().toString('hex');

  // Check the target hash of the certificate matches the signature's target hash
  if(targetHash != certificate.signature.targetHash) throw new Error('Certificate hash does not match signature\'s targetHash');

  // Check if target hash resolves to merkle root
  if(!checkProof(
    certificate.signature.proof,
    certificate.signature.merkleRoot,
    certificate.signature.targetHash
  )) throw new Error('Certificate proof is invalid for merkle root');

  return true;
}

program
  .version('0.1.0', '-v, --version')
  .option('-i, --input <inputDir>', 'Raw certificates directory')
  .option('-o, --output <outputDir>', 'Output directory')

  .option('-V, --verify <certificateFile>', 'Verify authencity of certificate')

  .option('-g, --generate <certificatesToGenerator>', 'Generate sample raw certificates', parseInt)
  .parse(process.argv);


if(program.input && program.output){
  console.log('============================== Issuing certificates ==============================\n');

  batchIssueCertificates(program.input, program.output)
    .then(merkleRoot => {
      console.log('Batch Certificate Root:\n' + merkleRoot + '\n');

      console.log('===================================================================================\n');
    });

}else if(program.verify){
  console.log('============================== Verifying certificate ==============================\n');

  const certificate = require(program.verify);

  try{
    verifyCertificate(certificate);

    console.log('Certificate\'s signature is valid!\n');

    console.log('Warning: Please verify this certificate on the blockchain with the issuer\'s certificate store.\n');
  }catch(e){
    console.log('Certificate\'s signature is invalid!');
    console.log(`Reason: ${e.message}\n`);
  }
  
  console.log('===================================================================================\n');
  
}else if(program.generate){
  console.log('========================== Generating random certificate ==========================\n');

  const generated = generateRandomCertificate(program.generate, './certificates/raw-certificates');
  console.log(`Generated ${generated} certificates.\n`);
  console.log('===================================================================================\n');
}else{
  program.help();
}

/*
// Not sure if require this ..
if (require.main === module) {
  console.log('called directly');
}*/

// Export as npm package
module.exports = {
  // TBD
};