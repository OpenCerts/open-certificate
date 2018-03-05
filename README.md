# Open Certificate

## Installation

Using npm:

```bash
yarn add @govtechsg/open-certificate
```

## Usage

### Generate Certificate

```js
const {randomCertificate} from '@govtechsg/open-certificate';

const CERTIFICATE_STORE_ADDRESS = '0x000000000000000000';
const randomlyGeneratedCertificate = randomCertificate(CERTIFICATE_STORE_ADDRESS);

console.log(randomlyGeneratedCertificate);
```

### Issue A Batch of Certificate

```js
const {randomCertificate, issueCertificates} from '@govtechsg/open-certificate';

const CERTIFICATE_STORE_ADDRESS = '0x000000000000000000';

const certificates = new Array(10).fill(randomCertificate(CERTIFICATE_STORE_ADDRESS));
const certificateBatch = issueCertificates(certificates);

console.log('Batch Root:', certificateBatch.getRoot());
console.log('Proof for cert #1', certificateBatch.getProof(certificates[0]));
```

### Verify A Certificate

```js
const {randomCertificate, Certificate} from '@govtechsg/open-certificate';

const CERTIFICATE_STORE_ADDRESS = '0x000000000000000000';
const randomlyGeneratedCertificate = randomCertificate(CERTIFICATE_STORE_ADDRESS);

const certificate = new Certificate(randomlyGeneratedCertificate);
certificate.verify();
```

### Redact Evidence

```
const {randomCertificate, Certificate} from '@govtechsg/open-certificate';

const CERTIFICATE_STORE_ADDRESS = '0x000000000000000000';
const randomlyGeneratedCertificate = randomCertificate(CERTIFICATE_STORE_ADDRESS);

const certificate = new Certificate(randomlyGeneratedCertificate);
const filteredCertificate = certificate.privacyFilter(['transcript.0.grade']);

console.log(filteredCertificate.certificate);
```


## Test

```bash
yarn test
```
