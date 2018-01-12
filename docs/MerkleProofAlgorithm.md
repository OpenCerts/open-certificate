## Merkle Proof Algorithm

Blockcert makes use of [MerkleProof2017](https://w3c-dvcg.github.io/lds-merkleproof2017/) algorithm and the current implementation makes use of a [simpler merkle proof](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/MerkleProof.sol) algorithm.

MerkleProof2017 follows the standards laid out by w3c and chainpoint but takes up more data and is hard to be verified on smart contract. The simpler proof allows for merkle proof to be on the smart contract itself. 

**MerkleProof2017**

```
"signature": {
  "@context": ["http://schema.org/", "https://w3id.org/security/v1"],
  "type": "MerkleProof2017",
  "targetHash": "637ec732fa4b7b56f4c15a6a12680519a17a9e9eade09f5b424a48eb0e6f5ad0",
  "merkleRoot": "f029b45bb1a7b1f0b970f6de35344b73cccd16177b4c037acbc2541c7fc27078",
  "anchors": [
    {
      "sourceId": "d75b7a5bdb3d5244b753e6b84e987267cfa4ffa7a532a2ed49ad3848be1d82f8",
      "type": "BTCOpReturn"
    }
  ],
  "proof": [
    {
      "right": "11174e220fe74de907d1107e2a357e41434123f2948fc6b946fbfd7e3e3eecd1"
    }
  ]
}
```

**Current Implementation**

```
"merkleRoot": "458a80232eda8a816972be8ac731feb50727149aff6287d70142821ae160caf7",
  "targetHash": "9e4480202dada872369b987a9550a4af3f00e5889c542a4caf6f1d22aaff629a",
  "proof": [
    "9321c3437a3057b6b7e2ac560deb36bf35e5de3f37cb205f7202e13e9eee9572",
    "6c0c0f5b71203c93fcb58bfc728f91b952a51767a8c4c2a065bac50112eed67f",
    "1938b479936220efc593ef5b6cc8919cff0a0800b54be49f5fb285d7f28f3ab0",
    "87c332c2a439f52fd41c6d818925776f503b7094e599b74bcd13af2698fa82d4",
    "35414d4dd3c0cd275bfec92cc7ba0cd28b3dbcf40e8074f8672d5bc6195067ef",
    "90de2449c8102ed2ab6334b5fa09b4cb604ca444ddfe77100694d84b09df4bfb"
  ]
```
