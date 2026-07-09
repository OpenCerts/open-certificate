# CLAUDE.md

Guidance for working in this repo (for developers and for Claude Code).

## What this repo is

`@opencerts/open-certificate` supplies the **JSON Schemas** for OpenCerts documents,
plus a small JS library to issue/validate them. It supports **two document formats**:

| Format | Schema versions | Tooling |
| --- | --- | --- |
| **OpenAttestation** verifiable documents (original) | `transcripts/1.0`–`2.2`, `testimonials/1.0`, `certificate-of-awards/1.0` | `@tradetrust-tt/tradetrust` (the maintained OA engine in the TrustVC stack) |
| **W3C Verifiable Credentials** (Data Model 2.0) | `transcripts/3.0`, `testimonials/2.0`, `certificate-of-awards/2.0` | `@trustvc/trustvc` |

## Repo layout

```
schema/<type>/<version>/
  schema.json      # JSON Schema (draft-07); its $id is the hosted URL
  example.json     # sample document
  context.json     # JSON-LD @context — W3C VC versions ONLY (required for signing)
  changelog        # human notes for the version
  schema.test.js   # tests for that version
src/index.js       # the openCert.* library (issue/validate/verify/obfuscate)
test/oa-compat.js  # Ajv shim used by the OpenAttestation transcript tests
scripts/publishSchema.sh  # builds public/ for hosting
deploy/            # S3/CloudFront deployment (CloudFront function + setup docs)
```

## Prerequisites & commands

- **Node.js >= 22 is required** (enforced by `engines` + `engine-strict` in `.npmrc`; `.nvmrc` pins 22). Run `nvm use`.
  - TrustVC pulls in ES-module-only crypto deps that only load cleanly on Node 22+.
- `npm install` — also runs `prepare` (builds `dist/`), since this package is **not published to npm** and is consumed via git install.
- `npm test` — Jest 29.
- `npm run lint` / `npm run build`.

## The library (`src/index.js`)

Modern OpenAttestation removed custom-schema registration (`addSchema`), so the library is a **hybrid**:
- **Ajv** validates documents against the custom OpenCerts schemas (`validateSchema`, and the pre-wrap check in `issueCertificate`).
- **`@tradetrust-tt/tradetrust`** does the OA document ops: `wrapDocument`/`wrapDocuments`, `getData`, `verifySignature`, `obfuscateDocument`, `MerkleTree`.
- `issueCertificate` seeds an empty `privacy` on the wrapped doc to preserve the legacy document shape.

> We import OA functions from `@tradetrust-tt/tradetrust` (not `@trustvc/trustvc`) on purpose: TrustVC's own OA wrappers are async, drop the `schema` field, and return non-boolean verify results. `@tradetrust-tt/tradetrust` is the same engine TrustVC bundles, but exposes the classic sync API this library needs.

## Testing

- **W3C VC suites** (`*/2.0`, `transcripts/3.0`) use `@trustvc/trustvc` directly: JSON-Schema validation (Ajv) + raw-VC checks (`vc.isRawDocumentV2_0`) + end-to-end **sign → derive → verify**, tamper rejection, and selective disclosure.
- **OpenAttestation transcript tests** use `test/oa-compat.js` — a small Ajv shim that replaces the deprecated `@govtechsg/open-attestation` (`issueDocument`/`addSchema`/`validateSchema`).
- The `1.0` cert/testimonial tests resolve the OpenAttestation v2 schema from the locally-installed `@tradetrust-tt/tradetrust` (no network dependency on `schema.openattestation.com`).
- Jest config (`jest.config.js`) has `transformIgnorePatterns`/`customExportConditions` + a root `babel.config.js` so TrustVC's ESM deps load under the CommonJS suites.

## Adding a new schema version

1. Create `schema/<type>/<version>/` with `schema.json`, `example.json`, `changelog`, `schema.test.js` (+ `context.json` for W3C VC).
2. If it's a transcript version consumed by the library, register it in `src/index.js` `schemas`.
3. Add it to `scripts/publishSchema.sh` (a `copy "<type>" "<version>"` line) so it gets hosted.
4. `npm test` + `npm run lint`.

## Hosting / deployment

- `scripts/publishSchema.sh` builds `public/` from `schema/`: `schema.json` → `index.json`, plus `example.json` and `context.json`. (`public/` is gitignored build output.)
- **`.github/workflows/deploy-schema.yml`** syncs `public/` to S3 (behind CloudFront) and invalidates:
  - **dev**: auto on push to `develop` (`DEV_*` secrets).
  - **prod**: manual only — run the workflow from `master` (`AWS_*` secrets).
- **CloudFront Function** (`deploy/cloudfront-rewrite.js`) rewrites extension-less URLs (`/transcripts/3.0` → `/transcripts/3.0/index.json`). It replaces the old Netlify `_redirects` and must be set up **once per distribution** (see `deploy/README.md`). It is **not** managed by the workflow.
- Repo needs these GitHub **secrets**: `SCHEMA_S3_BUCKET`, `SCHEMA_CLOUDFRONT_DISTRIBUTION_ID`, `DEV_SCHEMA_S3_BUCKET`, `DEV_SCHEMA_CLOUDFRONT_DISTRIBUTION_ID` (in addition to the `AWS_*` / `DEV_AWS_*` credentials).

## Branches

- `master` → production; `develop` → dev/integration. CI (`ci.yml`) runs lint/test/build on Node 22.

## Gotchas (things that have tripped people up)

- **`"@version": 1.1` in `context.json` is the JSON-LD spec version, NOT the schema version.** It must stay `1.1` (there is no JSON-LD 2.0); it enables the 1.1 features the contexts use (`@protected`, scoped `@context`, `@type: "@id"`, `@container: "@set"`, `@type: "@json"`). The schema version lives in the `$id`/folder; the VC Data Model version is the first `@context` entry (`…/credentials/v2`).
- **`ecdsa-sd-2023` (default) is selective-disclosure**, so a signed credential must be **derived** before it verifies. `deriveCredential(signed, ["/credentialSubject/name"], …)` then `verifyCredential`. `verifyDocument` (fragments) auto-derives internally — **but only if the `@context` is resolvable by its loader** (i.e. hosted, or served locally in tests), because its internal derive uses the default document loader, not one you pass in.
- **W3C VC `context.json` must be hosted** at the URL in the credential's `@context` for third parties to sign/verify. In tests we map it locally via `getDocumentLoader({ [url]: context })`.
- **`did:web` needs its DID document hosted** (`https://<domain>/.well-known/did.json`); `did:key` is self-resolving (used in offline tests).
- **`issuer` is `{ id, name }`** (a DID + name), not the old OpenAttestation `issuers[]` array.
- **`additionalData` is freeform** (`@type: "@json"` in the context) — arbitrary content (`images`, `npfa`, …) is valid without defining each field.
- The certificate/testimonial signatory image field is **`signatureImage`**, not `signature` (a JSON-LD term can't redefine itself inside its own scope, which breaks canonicalization).
- **Not published to npm.** Install from git (`npm install github:OpenCerts/open-certificate`); `prepare` builds it. Require it as `@opencerts/open-certificate`.
