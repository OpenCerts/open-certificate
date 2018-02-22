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

## Certificate privacy filter

This allows certificate holders to generate valid certificates which hides certain evidences. Useful for hiding grades lol.

```bash
./index.js filter <inputCertificatePath> <outputCertificatePath> [filters...]
```

Example:

```bash
./index.js filter ./certificates/processed-certificates/urn\:uuid\:060b3c1b-0689-4558-b946-862963641eba.json ./certificates/processed-certificates/urn\:uuid\:060b3c1b-0689-4558-b946-862963641eba.out.json transcript.0.grade transcript.1.grade transcript.2.grade

============================== Filtered Certificate ==============================

{
  "id": "urn:uuid:060b3c1b-0689-4558-b946-862963641eba",
  "type": "Assertion",
  "issuedOn": "2018-02-19T09:12:20.051Z",
  "@context": [
    "https://openbadgespec.org/v2/context.json",
    "https://govtechsg.github.io/certificate-schema/schema/1.0/context.json"
  ],
  "badge": {
    "name": "pibbwa4x2x7fo0a68v18dr4bn",
    "criteria": "1woyqebh30rpkvrnps7j0h8m8tnun0zmmlo46f1d5eo2ctc962g61pmaq1nu7ayxp24nudlwn7x1277r",
    "issuer": {
      "id": "urn:uuid:599fd698-5095-4e4b-8469-ea30a994b420",
      "url": "http://jeffry.name",
      "email": "Karl.Rempel@gmail.com"
    },
    "type": "BadgeClass",
    "evidencePrivacyFilter": {
      "type": "SaltedProof",
      "saltLength": "10"
    },
    "evidence": {
      "transcript": [
        {
          "name": "rxavnnnqwx:d6whoa8c2bryr6w",
          "courseCode": "58ezfx0pgl:1f79g",
          "courseCredit": "8j3qiv8smt:447"
        },
        {
          "name": "3vvhp01ayb:qnk3zhkldkyqa0e",
          "courseCode": "j5xnkor9n6:3hmlm",
          "courseCredit": "xgcqoui543:bsx"
        },
        {
          "name": "e54t99btvq:ogp6zzbb21en9kb",
          "courseCode": "nuj4oj52ow:y9j6j",
          "courseCredit": "jofurno8f6:3pf"
        }
      ]
    },
    "privateEvidence": [
      "17359b28df891116c1c5dbe610f60fb647f0977e803f16b9142c6bda3d0a4b9d",
      "f7261d891a828f8f6dcf5c0455d0dd69700f0e1c6ac7d752d9c39a26d57d33ab",
      "b5db6261eac1c096f3dbc5ecae00262625fad91a6387379d113d74619481bcfc"
    ]
  },
  "verification": {
    "type": "ETHStoreProof",
    "contractAddress": "0x0"
  },
  "profile": [
    {
      "type": "email",
      "identity": "Collin.Dach@hotmail.com",
      "hashed": false
    },
    {
      "type": "did",
      "identity": "sha256$471ef07fbe24fb98520ee75a14581154b19bd62f2b9e1a42fded71fc9183b8be",
      "salt": "2e6sb2v56c",
      "hashed": true
    },
    {
      "type": "url",
      "identity": "sha256$2f4ddbfae9af670d9e4792c8b02484151a1d47a59ef71861131bb098dea9fb8a",
      "salt": "k25y6u7ewh",
      "hashed": true
    }
  ],
  "signature": {
    "type": "SHA3MerkleProof",
    "targetHash": "5550fbc3fa29ff4def2ac59b09e827cce80e937c1489a39096215b8564ac6313",
    "proof": [
      "598e8ca0a2763be8227a0be2ea2441616cc36602db7c8d55e9e69589cf5b3739",
      "71f8b42b995465067d4953bed91f936a3e8a11d6007d0b2aae9ae1193c696d71",
      "0b9d1ef301795d9ce61d06057b6e5afeeb3470aa562a54eae772338a47d8c29d",
      "b25717b934a5aaba8c589b502ee26a5a25d6c246b5be89f8a789c56ac919cbc3",
      "7f817789145683a2652dd5956d21098ba159d0243a77af99f4d793e9376615e0",
      "77f61d9e9f571718745e8120fdddf42dfe48e0b6f366e56d82068395277793ab"
    ],
    "merkleRoot": "64fda71b939cb33d4e437f832b64f24b772e192f60b7ecd60af2ab9173a03aef"
  }
}

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
