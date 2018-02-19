# Certificate CLI tool

## Setup

```bash
yarn
```

## Generate Sample Certificates

Generates a number of sample certificates based on the specification by open badge
v2 with our extension.

```bash
./index.js generate <dir> --count 20
```

Example:

```bash
./index.js generate certificates/raw-certificates --count 50

========================== Generating random certificate ==========================

Generated 50 certificates.

===================================================================================
```

## Batching Certificates

This command process all certificates in the input directory and issue all of them in a single
batch. It will then add the signature to the individual certificates.

```bash
./index.js batch <PathToUnsignedCertificates> <PathToSignedCertificates>
```

Example:

```bash
./index.js batch ./certificates/raw-certificates/ ./certificates/processed-certificates/

============================== Batching certificates ==============================

Batch Certificate Root:
458a80232eda8a816972be8ac731feb50727149aff6287d70142821ae160caf7

===================================================================================
```

## Verifying Signed Certificate

This command verifies that the certificate (and all it's evidence) is valid and is part of the certificate batch. However, it does not verify that the batch's merkle root is stored on the blockchain. User will need to verify that the certificate has indeed been issued by checking with the issuer's smart contract.

```bash
./index.js verify <PathToCertificate>
```

Example:

```bash
./index.js verify ./certificates/processed-certificates/urn:uuid:08b1f10a-6bf0-46c8-bbfd-64750b0d73ef.json

============================== Verifying certificate ==============================

Certificate's signature is valid!

Warning: Please verify this certificate on the blockchain with the issuer's certificate store.

===================================================================================
```

## Deploy Certificate Store

This command deploys a copy of the current version of certificate store on the blockchain. The name of the organisation and verification url is needed to initialise the store.

```bash
./index.js deploy <issuerAddress> <storeName> <verificationUrl>
```

Example:

```bash
./index.js deploy 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 "GovTech DLT" https://tech.gov.sg

========================== Deploying new contract store ==========================

Contract deployed at 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0.

===================================================================================
```

## Commit Certificate Batch on Certificate Store

This command issues the certificate batch on the blockchain using the given certificate store.

```bash
./index.js commit <merkleRoot> <issuerAddress> <storeAddress>
```

Example:

```bash
./index.js commit 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0

=================== Committing certificate on contract store ====================

Certificate batch issued: 0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE
by 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 at contract address 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0

===================================================================================
```

## Transferring Ownership of Contract Store

```bash
./index.js transfer <originalOwner> <newOwner> <contractAddress>

```

Example:

```bash
./index.js transfer 0xf17f52151EbEF6C7334FAD080c5704D77216b732 0x627306090abaB3A6e1400e9345bC60c78a8BEf57  0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0

=================== Transfering ownership of contract store ====================

Contract at 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0 transfered from 0xf17f52151EbEF6C7334FAD080c5704D77216b732 to 0x627306090abaB3A6e1400e9345bC60c78a8BEf57.

===================================================================================
```

## Smart Contract Sample Interaction

This script automatically deploys a certificate store and runs all the functions available in the smart contract.

Before running the script be sure to connect to ganache cli/ui with the following mnemonic: `candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
`

```bash
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
yarn test
```
