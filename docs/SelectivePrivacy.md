## Selective Privacy

Storing more data on the certificate may mean the user is exposing too much information than he want to other parties. Say that a student does not want to share his transcript, he will not be able to verify his entire certificate using the current blockcert implementation. 

Suggestion is to hash each line of the canoncalised version of the certificate (less the signature) before hashing all the results. This allow the certificate to be validated even without the original content of the certificate. 

**Sample Certificate** 

```
{
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
}
```

**Normalized Data**

```
<https://example.org/assertions/123> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/openbadges#Assertion> .
<https://example.org/assertions/123> <https://w3id.org/openbadges#badge> <https://example.org/badges/5> .
<https://example.org/assertions/123> <https://w3id.org/openbadges#evidence> <https://example.org/beths-robot-photos.html> .
<https://example.org/assertions/123> <https://w3id.org/openbadges#evidence> <https://example.org/beths-robot-work.html> .
<https://example.org/assertions/123> <https://w3id.org/openbadges#issueDate> "2016-12-31T23:59:59+00:00"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<https://example.org/assertions/123> <https://w3id.org/openbadges#recipient> _:c14n3 .
<https://example.org/assertions/123> <https://w3id.org/openbadges#verify> _:c14n2 .
<https://example.org/badges/5> <http://schema.org/description> "This badge is awarded for passing the 3-D printing knowledge and safety test." .
<https://example.org/badges/5> <http://schema.org/image> <https://example.org/badges/5/image> .
<https://example.org/badges/5> <http://schema.org/name> "3-D Printmaster" .
<https://example.org/badges/5> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/openbadges#BadgeClass> .
<https://example.org/badges/5> <https://w3id.org/openbadges#criteria> _:c14n0 .
<https://example.org/badges/5> <https://w3id.org/openbadges#issuer> <https://example.org/issuer> .
<https://example.org/beths-robot-photos.html> <http://schema.org/description> "A gallery of photos of the student's robot" .
<https://example.org/beths-robot-photos.html> <http://schema.org/genre> "Photography" .
<https://example.org/beths-robot-photos.html> <http://schema.org/name> "Robot Photoshoot" .
<https://example.org/beths-robot-work.html> <http://schema.org/description> "Reflective writing about the first week of a robotics learning journey." .
<https://example.org/beths-robot-work.html> <http://schema.org/name> "Robotics Reflection #1" .
<https://example.org/issuer> <http://schema.org/email> "contact@example.org" .
<https://example.org/issuer> <http://schema.org/name> "Example Maker Society" .
<https://example.org/issuer> <http://schema.org/url> <https://example.org> .
<https://example.org/issuer> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/openbadges#Profile> .
<https://example.org/issuer> <https://w3id.org/openbadges#verify> _:c14n1 .
_:c14n0 <https://w3id.org/openbadges#narrative> "Students are tested on knowledge and safety, both through a paper test and a supervised performance evaluation on live equipment" .
_:c14n1 <https://w3id.org/openbadges#allowedOrigins> "example.org" .
_:c14n2 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/openbadges#HostedBadge> .
_:c14n3 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/email> .
_:c14n3 <https://w3id.org/openbadges#identityHash> "alice@example.org" .
```

**Sorted SHA256 Results (New steps to add selective privacy to Blockcert)**

```
[ '00025dc34052dc80c7284591a24aee7f7fa38bf598f799bf394054ecd154ede0',
  '0611cf9cc83ed6c7faf419cff8608133a3d896d267a1f8a0f1ad6a3fdfbe41df',
  '11f543e27a02b23514d36395b91b8c87b72775aa1de80deca56f6f88cb4074c0',
  '171e2557a69c66c90b7a541b990ef19e13629327de6e66da363e882d8eca8880',
  '1d94a1315659be022f2faba837e8dd80fead1350e7956f25a450af5dc7a6979d',
  '23d3e9632ca97b4d8d922004e52bcd022e835dada7908977c6aa571d7cd15c52',
  '28cea87b87aab3bce2d24fef1ad7f0a50e7beb117f4122dd75eceafcad93cce3',
  '3afdb5792056e6102987fedb56919e64efbb61ca33207112a821e5f67a77cf33',
  '5aba95ba1b44b01ef081af7473a439b4e153132f2c1f71bb1e108e82cc9c3542',
  '5c0afb405ab88cab24c1156aab2745ef66e4862455d3c41a5f781750ed690412',
  '65bc2f14c33f5baaf5dab56cbc5fa1719fc81818b09e2814b2540fa28796e8b4',
  '65d755ce457c05f430c27199fd4785a9ee74c57995a656e2b5e91a828e480916',
  '69e434742c09ecdcbfe05feb5bd302a2ac42ee230d666d3149632fec63010202',
  '6a3887e673c1b4942d584734f6b1f8f9c76093e5d6369da1abeefea7a0b91a1f',
  '6a5765a788f4e637790bb1e68862a94deec2880c367468f690311260806f50d8',
  '7e9915045a7fd1c0e10d281798aa317ce731c28cfd70aea5864294fe821056d8',
  '8f4f16cb32bdd0317a78a73920fcf6a6912142411d497743ba91a9fb49eed309',
  '93e246a62d44f8da072bbba35015d9b1277870a4f206e4d47747e57f92c260a6',
  'a78e632098c2218b8265f065209740912b164e60d16c76d0f103c21a89b7d938',
  'ad903bf969312170c79164ca5768ce8d5d682939f0cd529241559ec261696db6',
  'b2fe74f5bacdf2805e501eb5b052fd5d8998c620f63a0ebad0f4ae7351ead660',
  'caceb425a4dbb20f9f6666a341104d72d3a3368a038f9e86d06965e6ee4d24df',
  'd37d9f338595e3d514a3229a1f1f7ce3f83878156f5083b5c0ecd1bc2d54569c',
  'd732f2b238d6129f1a90d12b335f5ed7210a74fa992c6ec4f4c474139a5eb6e6',
  'de91db4cc6ec36bfcf55b7496579438bfc04fc8b2b5d1982c84e72716e67be11',
  'ecc9769a06115181795c4378fe5e12a8f9f8948c2960e45930226156f11066b5',
  'edab91324a99271637bcab4512ba28e09f131a2ed975d5c6df191714e8c98536',
  'f6928f3bec7dc858f33c80b1390e97c4925c2522a3aa1ced36941062e72e1d66' ]
```

**Target Hash**

```
08747f48db1ed91a532f6040ff42b7e1af0ce684c8f7e031f9c7287fc9ea8bb8
```

**Sample Private Certificate**

```
{
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
  }
}
```

```
[
  'd37d9f338595e3d514a3229a1f1f7ce3f83878156f5083b5c0ecd1bc2d54569c',
  '93e246a62d44f8da072bbba35015d9b1277870a4f206e4d47747e57f92c260a6',
  '23d3e9632ca97b4d8d922004e52bcd022e835dada7908977c6aa571d7cd15c52',
  'de91db4cc6ec36bfcf55b7496579438bfc04fc8b2b5d1982c84e72716e67be11',
  '28cea87b87aab3bce2d24fef1ad7f0a50e7beb117f4122dd75eceafcad93cce3'
]
```
> All evidence information are now hidden in the hash and the new certificate can still be validated on the blockchain. 


**Suggested Improvements to Blockcert Schema**

1. MerkleProof2017 Algorithm
	* Hashing normalised JSON-LD results 
2. Privacy Schema
	
	```
	{
	  "@context": "https://w3id.org/openbadges/v2",
	  "id": "https://example.org/assertions/123",
	  "type": "Assertion",
	  "recipient": {
	    "type": "email",
	    "identity": "alice@example.org"
	  },
	  "issuedOn": "2016-12-31T23:59:59+00:00",
	  "verification": {
	    "type": [
	      "MerkleProofPrivacyExtension2018",
	      "Extension"
	    ]
	  },
	  "signature": {
	    "anchors": [
	      {
	        "chain": "ethereumRopsten",
	        "type": "ETHContract",
	        "sourceId": "0xc4e7c98867e7eff0ec33c01ae0c14d881a94d65508961aebf77faf4da2746bf6"
	      }
	    ],
	    "type": [
	      "MerkleProofPrivacyExtension2018",
	      "Extension"
	    ],
	    "proof": [
	      "51b4e22ed024ec7f38dc68b0bf78c87eda525ab0896b75d2064bdb9fc60b2698",
	      "51b4e22ed024ec7f38dc68b0bf78c87eda525ab0896b75d2064bdb9fc60b2698"
	    ],
	    "concealed":[
		  "d37d9f338595e3d514a3229a1f1f7ce3f83878156f5083b5c0ecd1bc2d54569c",
		  "93e246a62d44f8da072bbba35015d9b1277870a4f206e4d47747e57f92c260a6",
		  "23d3e9632ca97b4d8d922004e52bcd022e835dada7908977c6aa571d7cd15c52",
		  "de91db4cc6ec36bfcf55b7496579438bfc04fc8b2b5d1982c84e72716e67be11",
		  "28cea87b87aab3bce2d24fef1ad7f0a50e7beb117f4122dd75eceafcad93cce3"
		],
	    "merkleRoot": "57a9f493cad16f3a12839a8cb2c460d54e950121dccec9a57c9014a08604ef7e",
	    "targetHash": "08747f48db1ed91a532f6040ff42b7e1af0ce684c8f7e031f9c7287fc9ea8bb8"
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
	  }
	  ]
	}
	```
	
	> Added concealed in signature
	
	> Added "ETHContract" as enum for anchor type