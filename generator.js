const fs = require('fs');
const {randomCertificate} = require('./test/utils');
const NUM_CERTS_GENERATED = 50;

for(let i=0; i<NUM_CERTS_GENERATED; i++){
  const cert = randomCertificate();
  const certId = cert.id.substring(31);
  fs.writeFileSync(`./certificates/raw-certificates/${certId}.json`, JSON.stringify(cert, null, 2));
}

console.log(`${NUM_CERTS_GENERATED} certificates generated.`);
