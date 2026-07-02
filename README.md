# Open Certificate

This library supplies the schemas used for OpenCerts standards, in the form of [json schemas](http://json-schema.org).

It supports two document formats:

- **OpenAttestation verifiable documents** — the original format, handled via [`@trustvc/trustvc`](https://github.com/TrustVC/trustvc) (schema versions `transcripts/1.0`–`2.2`, `testimonials/1.0`, `certificate-of-awards/1.0`).
- **W3C Verifiable Credentials** — the newer format following the [W3C VC Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/), signed and verified with [`@trustvc/trustvc`](https://github.com/TrustVC/trustvc) (schema versions `certificate-of-awards/2.0`, `testimonials/2.0`, `transcripts/3.0`). See [W3C Verifiable Credentials](#w3c-verifiable-credentials).

## Installation

### Prerequisites

This package requires **Node.js 22 or above** (enforced via the `engines` field and
`engine-strict`). An `.nvmrc` is provided, so you can run `nvm use` to switch.

> This package is **not published to the npm registry**. Consume it in one of these ways:

**1. Use the JSON schemas / contexts directly** (most common) — reference them by their hosted `$id` URL (e.g. `https://schema.opencerts.io/transcripts/2.2`) or copy the files from the [`schema/`](./schema) folder.

**2. Install the JavaScript library from Git** — to use the `openCert.*` API below:

```bash
npm install github:OpenCerts/open-certificate
```

The `prepare` script builds the library automatically on install.

## Usage

If you are writing a **certificate issuer**: you probably want to [issue a certificate](#issuing-a-certificate) or [issue multiple certificates](#issue-multiple-certificates)

If you are writing a **certificate verifier or viewer**: you probably want to
1. [validate that a certificate is well-formed](#validate-schema)
1. [verify that a certificate has not been tampered with](#verifying-certificate-signature) 
1. [retrieve certificate contents](#retrieving-certificate-contents)
1. [obfuscate fields](#obfuscating-fields-in-a-certificate)

### Using OpenCerts
```javascript
const openCert = require("@opencerts/open-certificate")

const exampleCert = require("exampleCert.json") // reading an example certificate file
openCert.validateSchema(exampleCert) // check the document is well-formed
openCert.verifySignature(exampleCert) // check the document has not been tampered with
```

### Validate Schema

This library comes with the schemas in the `./schema` folder, all of them are loaded as valid schemas upon initialization.

```javascript
openCert.validateSchema(exampleCert)
```
### Verifying Certificate Signature

Certificates are considered untampered-with if they have a valid signature field. Refer to the [TrustVC](https://github.com/TrustVC/trustvc) library for more details on this.

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

## W3C Verifiable Credentials

Newer schema versions follow the [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) and are signed/verified with [`@trustvc/trustvc`](https://github.com/TrustVC/trustvc):

| Document | W3C VC version | OpenAttestation version |
| --- | --- | --- |
| Certificate of Award | `certificate-of-awards/2.0` | `certificate-of-awards/1.0` |
| Testimonials | `testimonials/2.0` | `testimonials/1.0` |
| Transcripts | `transcripts/3.0` | `transcripts/2.2` |

Each W3C VC version folder under `schema/` contains:

- `schema.json` — JSON Schema validating the credential's shape
- `example.json` — a sample W3C VC
- `context.json` — the JSON-LD `@context` defining the `credentialSubject` terms (required for signing/verification)
- `changelog` — notes for the version

> These versions are for **W3C VC documents only**. If you are not using the W3C VC format, use the corresponding OpenAttestation version (e.g. `1.0` or `2.2`).

### Signing and verifying

Signing and verification are done with [`@trustvc/trustvc`](https://github.com/TrustVC/trustvc), which you install separately:

```bash
npm install @trustvc/trustvc
```

The recommended issuer identity is [`did:web`](https://w3c-ccg.github.io/did-method-web/). Two things must be hosted so any verifier can resolve them:

1. The issuer's **DID document**, at `https://<your-domain>/.well-known/did.json`.
2. Each **`context.json`**, at the `@context` URL used by the credential (e.g. `https://schema.opencerts.io/certificate-of-awards/2.0/context.json`).

**Create the issuer DID** (`did:web`) and host the returned DID document:

```javascript
const { issueDID, generateKeyPair, CryptoSuite } = require("@trustvc/trustvc/w3c/issuer");

const keyPair = await generateKeyPair({ type: CryptoSuite.EcdsaSd2023 });
const { wellKnownDid, didKeyPairs } = await issueDID({
  domain: "https://your-domain.example/.well-known/did.json",
  type: CryptoSuite.EcdsaSd2023,
  secretKeyMultibase: keyPair.secretKeyMultibase,
  publicKeyMultibase: keyPair.publicKeyMultibase,
});
// Host `wellKnownDid` at the domain above. Keep `didKeyPairs` secret (used to sign).
```

**Sign** a credential with that key:

```javascript
const { signCredential } = require("@trustvc/trustvc/w3c/vc");
const example = require("@opencerts/open-certificate/schema/certificate-of-awards/2.0/example.json");

const { signed } = await signCredential(
  { ...example, issuer: didKeyPairs.controller },
  didKeyPairs,
  "ecdsa-sd-2023"
);
```

**Verify** it. `verifyDocument` returns verification fragments and auto-derives the credential internally, so no manual derive step is needed; `isValid` reduces the fragments to a boolean:

```javascript
const { verifyDocument, isValid } = require("@trustvc/trustvc");

const fragments = await verifyDocument(signed);
console.log(isValid(fragments)); // true
```

> Verification resolves the issuer's `did:web` DID document and the credential's `@context` over the network, so both must be hosted (above). For local development you can instead use a `did:key` issuer and pass a `documentLoader` (built with `getDocumentLoader({ [contextUrl]: context })`) to `signCredential` / `verifyCredential`, deriving with `deriveCredential` before verifying.

## Developers

This package requires **Node.js 22 or above** (see [Prerequisites](#prerequisites)). The code is compiled by Babel.


### Test

```bash
npm run test
```
### Build

```bash
npm run build
```

### Related Projects

- [TrustVC](https://github.com/TrustVC/trustvc)
- [OpenCerts](https://github.com/OpenCerts)
