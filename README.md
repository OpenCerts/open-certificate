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

```js
const {randomCertificate, Certificate} from '@govtechsg/open-certificate';

const CERTIFICATE_STORE_ADDRESS = '0x000000000000000000';
const randomlyGeneratedCertificate = randomCertificate(CERTIFICATE_STORE_ADDRESS);

const certificate = new Certificate(randomlyGeneratedCertificate);
const filteredCertificate = certificate.privacyFilter(['transcript.0.grade']);

console.log(filteredCertificate.certificate);
```

### Redact Identity

```js
const {randomCertificate, Certificate} from '@govtechsg/open-certificate';

const CERTIFICATE_STORE_ADDRESS = '0x000000000000000000';
const randomlyGeneratedCertificate = randomCertificate(CERTIFICATE_STORE_ADDRESS);

const certificate = new Certificate(randomlyGeneratedCertificate);

// Hide all the identity profile
const filteredCertificate = certificate.identityFilter();
console.log(filteredCertificate.certificate);

// Hide only the first identity
const filteredCertificate2 = certificate.identityFilter(0);
console.log(filteredCertificate2.certificate);
```


### Verify Identity

```js
const cert = <SOME_CERTIFICATE_HERE>;

const isCorrectIdentity = Certificate.identityCheck(cert.recipient[0], "someone@example.com");
console.log(isCorrectIdentity);
```


## Test

```bash
yarn test
```
