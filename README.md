## Setup

```
yarn
```

## Generate Sample Certificates

Generates a number of sample certificates based on the specification by open badge v2 with our extension. Generated samples will be in ./certificates/raw-certificates

```
node index.js -g <CertificatesToGenerate>
```

Example:

```
node index.js -g 50

========================== Generating random certificate ==========================

Generated 50 certificates.

===================================================================================
```

## Issuing Certificates

This command process all certificates in the input directory and issue all of them in a single batch. It will then add the signature to the individual certificates. 

```
node index -i <PathToUnsignedCertificates> -o <PathToSignedCertificates>
```

Example:
```
node index -i ./certificates/raw-certificates/ -o ./certificates/processed-certificates/

============================== Issuing certificates ==============================

Batch Certificate Root:
458a80232eda8a816972be8ac731feb50727149aff6287d70142821ae160caf7

===================================================================================
```

## Verifying Signed Certificate

This command verifies that the certificate (and all it's evidence) is valid and is part of the certificate batch. However, it does not verify that the batch's merkle root is stored on the blockchain. User will need to verify that the certificate has indeed been issued by checking with the issuer's smart contract. 

```
node index -V <PathToCertificate>
```

Example:
```
node index -V ./certificates/processed-certificates/urn:uuid:08b1f10a-6bf0-46c8-bbfd-64750b0d73ef.json

============================== Verifying certificate ==============================

Certificate's signature is valid!

Warning: Please verify this certificate on the blockchain with the issuer's certificate store.

===================================================================================
```

## Deploy Certificate Store

This command deploys a copy of the current version of certificate store on the blockchain. The name of the organisation and verification url is needed to initialise the store.

```
node index -d -a <issuerAddress> -n <storeName> -u <verificationUrl>
```

Example:
```
node index -d -a 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 -n "GovTech DLT" -u https://tech.gov.sg

========================== Deploying new contract store ==========================

Contract deployed at 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0.

===================================================================================
```

## Issue Certificate on Certificate Store

This command issues the certificate batch on the blockchain using the given certificate store. 

```
node index -b <certificateBatchMerkleRoot> -a <issuerAddress> -s <storeAddress>
```

Example:
```
node index -b 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE -a 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 -s 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0

=================== Issuing certificate on contract store ====================

Certificate batch issued: 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE.

===================================================================================
```

## Transferring Ownership of Contract Store

```
node index -t <newOwnerAddress> -a <issuerAddress> -s <storeAddress>
```

Example:
```
node index -t 0xf17f52151EbEF6C7334FAD080c5704D77216b732 -a 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 -s 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0

=================== Transfering ownership of contract store ====================

Contract transfered to 0xf17f52151EbEF6C7334FAD080c5704D77216b732.

===================================================================================
```

## Smart Contract Sample Interaction

This script automatically deploys a certificate store and runs all the functions available in the smart contract.

Before running the script be sure to connect to ganache cli/ui with the following mnemonic: `candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
`

```
node examples/sample.js
```

## TBD

- Test for functions in index.js
- Refactor to allow this package to be used as a npm module
- Checks for certificate structure when issuing certificate
- Add support to batch issue certificate on the contract store
- Add support to verify certificate on the contract store
- Hiding evidences on fully visible certificates

## Test

```
npm run test
```