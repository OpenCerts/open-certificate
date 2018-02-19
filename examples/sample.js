/* eslint-disable no-console, no-unused-vars */

// Run ganache with the following mnemonic to run this script
// candy maple cake sugar pudding cream honey rich smooth crumble sweet treat

const CertificateStore = require("../src/contract/certificateStore.js");

const address0 = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
const address1 = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";

const contractName = "GovTech DLT";
const contractUrl = "https://tech.gov.sg";

const certificate1 = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";
const certificate2 = "0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc";

async function main() {
  const store = new CertificateStore(address0);

  // Deploy a new certificate store
  console.log(`Deploying new contract...`);
  const address = await store.deployStore(contractUrl, contractName);
  console.log(`New contract deployed at ${address}`);
  console.log();

  // Retrieve name and url from the store
  console.log(`Checking contract parameters...`);
  const name = await store.name();
  console.log(`Contract name: ${name}`);
  const url = await store.verificationUrl();
  console.log(`Contract url: ${url}`);
  console.log();

  // Issuing certificate
  console.log(`Issuing certificate 1...`);
  const tx0 = await store.issueCertificate(certificate1);
  console.log(`Certificate 1 is issued`);
  // console.log(JSON.stringify(tx0));
  console.log();

  // Transfer ownership
  console.log(`Transferring ownership...`);
  const tx1 = await store.transferOwnership(address1);
  console.log(`Ownership is transferred`);
  // console.log(JSON.stringify(tx1,null,2));
  console.log();

  const store2 = new CertificateStore(address1, address);
  // Issuing certificate
  console.log(`Issuing certificate 2...`);
  const tx2 = await store2.issueCertificate(certificate2);
  console.log(`Certificate 2 is issued`);
  // console.log(JSON.stringify(tx2, null, 2));
  console.log();

  process.exit(0);
}

main();
