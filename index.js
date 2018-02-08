const fs = require('fs');
const program = require('commander');

const batchIssue = require('./utils/batchIssue');
const Certificate = require('./utils/certificate');
const generator = require('./utils/randomCertificateGenerator');

program
  .version('0.1.0', '-v, --version')
  .option('-i, --input <inputDir>', 'Raw certificates directory')
  .option('-o, --output <outputDir>', 'Output directory')

  .option('-V, --verify <certificateFile>', 'Verify authencity of certificate')

  .option('-g, --generate <certificatesToGenerator>', 'Generate sample raw certificates', parseInt)
  .parse(process.argv);


if(program.input && program.output){
  console.log('============================== Issuing certificates ==============================\n');

  batchIssue(program.input, program.output)
    .then(merkleRoot => {
      console.log('Batch Certificate Root:\n' + merkleRoot + '\n');

      console.log('===================================================================================\n');
    });

}else if(program.verify){
  console.log('============================== Verifying certificate ==============================\n');

  const certificate = new Certificate(require(program.verify));

  try{
    certificate.verify();

    console.log('Certificate\'s signature is valid!\n');

    console.log('Warning: Please verify this certificate on the blockchain with the issuer\'s certificate store.\n');
  }catch(e){
    console.log('Certificate\'s signature is invalid!');
    console.log(`Reason: ${e.message}\n`);
  }
  
  console.log('===================================================================================\n');
  
}else if(program.generate){
  console.log('========================== Generating random certificate ==========================\n');

  const generated = generator(program.generate, './certificates/raw-certificates');
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
  Certificate,
  batchIssue,
  generator,
};