# Open Certificate

This library supplies the schemas used for OpenCerts standards, in the form of [json schemas](http://json-schema.org)

## Installation

Using npm:

```bash
npm install @govtechsg/open-certificate
```

## Usage

If you are writing a **certificate issuer**: you probably want to [issue a certificate](#issuing-a-certificate) or [issue multiple certificates](#issue-multiple-certificates)

If you are writing a **certificate verifier or viewer**: you probably want to
1. [validate that a certificate is well-formed](#validate-schema)
1. [verify that a certificate has not been tampered with](#verifying-certificate-signature) 
1. [retrieve certificate contents](#retrieving-certificate-contents)
1. [obfuscate fields](#obfuscating-fields-in-a-certificate)

### Validate Schema
### Verifying Certificate Signature
### Issue a Certificate
### Issue Multiple Certificates
### Retrieving Certificate contents
### Obfuscating Fields in a Certificate

# Developers

The code is written to ES6 specs with stage-3 presets and is compiled by Babel.


## Test

```bash
npm run test
```
## Build

```bash
npm run build
```