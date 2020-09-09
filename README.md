# [DEPRECATED]

**This CLI has been deprecated in favor of open-attestation CLI. Please read [OpenCerts documentation](https://docs.opencerts.io/docs/) to find out more.**


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

### Using OpenCerts
```javascript
const openCert = require("@govtechsg/open-certificate")

const exampleCert = require("exampleCert.json") // reading an example certificate file
openCert.verify(exampleCert)
```

### Validate Schema

This library comes with the schemas in the `./schema` folder, all of them are loaded as valid schemas upon initialization.

```javascript
openCert.validateSchema(exampleCert)
```
### Verifying Certificate Signature

Certificates are considered untampered-with if they have a valid signature field. Refer to the [Open Attestation](https://github.com/GovTechSG/open-attestation) library for more details on this.

```javascript
openCert.verifySignature(exampleCert)
```

### Issue a Certificate

A single Certificate can be issued using the `.issueCertificate(certificate)` method.
Issuing a certificate in this manner will append a signature field to the certificate.

The return value of the method will be the signed certificate.

```javascript
const issuedCert = openCert.issueCertificate(exampleCert)
```
### Issue Multiple Certificates

Multiple Certificates can be issued at once with the `.issueCertificates(certificate[])` method.

The return value of the method will be an array of signed certificates.

```javascript
const exampleCerts = [cert1, cert2, cert3, ...]
const issuedCerts = openCert.issueCertificates(exampleCerts)
```
### Retrieving Certificate contents

The raw certificate has salt in the fields to prevent enumeration, we provide a convenience method to retrieve the unsalted contents of the certificate using the method `.certificateData(certificate)`

```javascript
const data = openCert.certificateData(exampleCert)
```

### Obfuscating Fields in a Certificate
To obfuscate fields in a cert, the method `.obfuscateFields(certificate, paths[])` is provided.
The paths[] parameter is simply the JSON path for the fields to be obfuscated.

The method returns the obfuscated certificate.

```javascript
const obfuscatedCert = openCert.obfuscateFields(exampleCert, [
    "recipient.email",
    "recipient.phone"
]);
```

## Developers

The code is written to ES6 specs with stage-3 presets and is compiled by Babel.


### Test

```bash
npm run test
```
### Build

```bash
npm run build
```

### Related Projects
[Open Attestation](https://github.com/GovTechSG/open-attestation)
[Certificate Contract](https://github.com/GovTechSG/certificate-contract)
[OpenCert Web UI](https://github.com/GovTechSG/certificate-web-ui)
