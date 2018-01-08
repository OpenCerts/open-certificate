const Certificate = require('./utils/certificate');
const {checkProof} = require('./utils/merkle');
const {flattenJson, hashArray} = require('./utils/utils');


const certificateData = {
  "@context": "https://w3id.org/openbadges/v2",
  "id": "https://example.org/assertions/123",
  "type": "Assertion",
  "recipient": {
    "type": "email",
    "identity": "alice@example.org"
  },
  "issuedOn": "2016-12-31T23:59:59+00:00",
  "verification": {
    "type": "hosted"
  },
  "badge": {
    "type": "BadgeClass",
    "id": "https://example.org/badges/5",
    "name": "3-D Printmaster",
    "description": "This badge is awarded for passing the 3-D printing knowledge and safety test.",
    "image": "https://example.org/badges/5/image",
    "criteria": {
      "narrative": "Students are tested on knowledge and safety, both through a paper test and a supervised performance evaluation on live equipment"
    },
    "issuer": {
      "id": "https://example.org/issuer",
      "type": "Profile",
      "name": "Example Maker Society",
      "url": "https://example.org",
      "email": "contact@example.org",
      "verification": {
         "allowedOrigins": "example.org"
      }
    }
  },
  "evidence": [
    {
      "id": "https://example.org/beths-robot-photos.html",
      "name": "Robot Photoshoot",
      "description": "A gallery of photos of the student's robot",
      "genre": "Photography"
    },
    {
      "id": "https://example.org/beths-robot-work.html",
      "name": "Robotics Reflection #1",
      "description": "Reflective writing about the first week of a robotics learning journey."
    }
  ]
};

// Creating a certificate
const certificate = new Certificate(certificateData);
const merkleRoot = certificate.getRoot().toString('hex');
console.log("============================== Certificate Root ==============================");
console.log(merkleRoot);

// Create a proof for a single claim
const claim = {'recipient.identity':'alice@example.org'};
const proof = certificate.getProof(claim);
console.log("============================== Claim ==============================");
console.log(claim);
console.log("============================== Proof for Claim ==============================");
console.log(proof);

// Prove the claim
console.log("============================== Claim Check ==============================");
console.log("Claim is valid (using original cert):", certificate.proofClaim(claim, proof));
console.log("Claim is valid (without certificate content):", checkProof(proof, merkleRoot, claim));

// Create a proof for some part of the certificate
const claims = [
  { 'evidence.0.id': 'https://example.org/beths-robot-photos.html' },
  { 'evidence.0.name': 'Robot Photoshoot' },
  { 'evidence.0.description': 'A gallery of photos of the student\'s robot' },
  { 'evidence.0.genre': 'Photography' },
  { 'evidence.1.id': 'https://example.org/beths-robot-work.html' },
  { 'evidence.1.name': 'Robotics Reflection #1' },
  { 'evidence.1.description': 'Reflective writing about the first week of a robotics learning journey.' },
];

const proofs = [
  '04d147f4920441b9f92da6a1bf0dc5331663b6d823eea8316a3ac8c97206bec9',
  '10327d7f904ee3ee0e69d592937be37a33692a78550bd100d635cdea2344e6c7',
  '21f9b352cb6df793a514f7c77478303a28fde2548f1e12eeb359b2142e7ca45e',
  '2ccf1cd105ed42f275a27e7a909b70132b28f27c35d3ef33bf97671aa391bc1a',
  '5a7d3afd94b9fa567455e16fee4292e45ebff121c6ea023331da1c48552d37ed',
  '5d4eb8693b07a4935056d776a35aa66e6b735aa779458ac7598e4cd1f4b21e5e',
  '7a0a292304b0dc6137cdfe7a04f3121a77b8f9067df0a36b703edc01517a0ccb',
  '8138f5303b66c12b178e20460f48c5900e9ed598b0f1ddd014115b89f9264897',
  '827fce004d572c623c1656e4d5ed559d166972b70b1cf4d93287e24992b871d7',
  'a4135cdb7feb99d3cb8205b6ecaa8814138d8ccf319d81bf6600fc7108d70f65',
  'a795c3cc46612a87e9e4625de687f9d49be5e21601f8abb7cf83934de75c3057',
  'accb19f72950a4a2eac90789fbc707502fc4e43cfae96fd0dfc811c2adda6a9a',
  'b36d842776cae7f35f5326f503a3ddf41d10826c2c9869cff8f5bf20c37259f3',
  'c364bd9dbed1dcb85e4a9957468e5c112ed9359f8c35f5ef7701f8f91069cb89',
  'cf36cb679fa61bc3bbb683c1be35861d1ac08c3e517e446fc24883303d1bb722',
  'd23912aae627c0fd5b12cae675f08680fdc9aad9decb19e2f7a30de383268478',
  'f5baaef0b7bddd090f83010321c9564dc69a54c924ab7ad9c7f145a8ec2214bc',
  'fa21ffcb839ead91346e6da5d1b705378dd644b23d7dfa47144f4fe415bfe601',
  'fb6b46ff0ff649926a033836c9b2454d12da8093b64144e3ea62314e703090b8',
]

console.log("============================== Multiple Claims Check ==============================");
console.log("Claim is valid (using original cert):", certificate.proofCertificate(claims, proofs));
console.log("Claim is valid (without certificate content):", "TBD");


