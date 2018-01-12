const Certificate = require('./certificate');
const {flattenJson, hashArray, toBuffer} = require('./utils');

describe('certificate', () => {
  const sampleCertificate = {
    key1: 'value1',
    key2: ['value1', 'value2' , {a: 'b'}],
    key3: {
      a: 1,
      b: 'c',
    }
  };

  describe('Certificate', () => {
    const cert = new Certificate(sampleCertificate);

    it('creates certificate object', () => {
      expect(cert).to.be.an.instanceof(Certificate);
      expect(cert).to.have.keys(['certificate', 'merkleTree']);
    });

    describe('getRoot', () => {
      it('returns the root of the merkle tree', () => {
        const rootBuf = cert.getRoot();
        const rootHex = rootBuf.toString('hex');

        const expectedHash = 'eda23cef95b04640004ab0592c482e26436a3cff399dfdbff1f2c9398c874edf';

        expect(rootHex).to.be.eql(expectedHash);
      });
    });

    describe('proofCertificate', () => {
      it('checks proof for all visible claims', () => {
        const claims = flattenJson(sampleCertificate);
        assert(cert.proofCertificate(claims));
      });

      it('checks proof for some visible claims', () => {
        const claims = flattenJson(sampleCertificate);
        
        let visibleClaims = [];
        let hiddenProofs = [];

        claims.forEach((c, i) => {
          (i % 2 == 0) ? visibleClaims.push(c) : hiddenProofs.push(toBuffer(c));
        });

        assert(cert.proofCertificate(visibleClaims, hiddenProofs));
      });

      it('checks proof for all hidden proofs', () => {
        const claims = flattenJson(sampleCertificate);
        
        let hiddenProofs = claims.map(c => toBuffer(c));

        assert(cert.proofCertificate(null, hiddenProofs));
      });

      it('fails if any claims is invalid', () => {
        const claims = flattenJson(sampleCertificate);
        
        let visibleClaims = [];
        let hiddenProofs = [];

        claims.forEach((c, i) => {
          (i % 2 == 0) ? visibleClaims.push(c) : hiddenProofs.push(toBuffer(c));
        });

        visibleClaims.push({key:'invalid value'});

        expect(cert.proofCertificate(visibleClaims, hiddenProofs))
        .to.eql(false);
      });

      it('fails if any proofs is invalid', () => {
        const claims = flattenJson(sampleCertificate);
        
        let visibleClaims = [];
        let hiddenProofs = [];

        claims.forEach((c, i) => {
          (i % 2 == 0) ? visibleClaims.push(c) : hiddenProofs.push(toBuffer(c));
        });

        hiddenProofs.push(toBuffer('invalid hash'));

        expect(cert.proofCertificate(visibleClaims, hiddenProofs))
        .to.eql(false);
      });

      it('accepts certificate object as claim', () => {
        const claims = sampleCertificate;
        assert(cert.proofCertificate(claims));
      });
    });

    describe('getProof', () => {
      it('returns an array of proofs for valid claim', () => {
        const claims = flattenJson(sampleCertificate);
        const claimToValidate = claims[0];

        const proofs = cert.getProof(claimToValidate);
        expect(proofs[0].toString('hex')).to
        .eql('6d0c0226e52a1632f9f5b72176b81b34efbb27f7244580bc0d4f0172a6b62838');
        expect(proofs[1].toString('hex')).to
        .eql('707ba78e305dc247c51f3e1186f78695fa979a884c38d435a565e37ef8f6eca4');
        expect(proofs[2].toString('hex')).to
        .eql('e1493cf92567c23ba497012854eb51c670b55110e4cf7127008ea2bdcf47dd90');
      });

      it('returns null for invalid claim', () => {
        const claimToValidate = {claim:'invalid claim'};

        const proofs = cert.getProof(claimToValidate);
        expect(proofs).to.be.null;
      });
    });

    describe('proofClaim', () => {
      it('returns true if claim is true', () => {
        const claims = flattenJson(sampleCertificate);
        const claimToValidate = claims[0];
        
        const proofs = [
          '6d0c0226e52a1632f9f5b72176b81b34efbb27f7244580bc0d4f0172a6b62838',
          '707ba78e305dc247c51f3e1186f78695fa979a884c38d435a565e37ef8f6eca4',
          'e1493cf92567c23ba497012854eb51c670b55110e4cf7127008ea2bdcf47dd90'
        ];

        expect(cert.proofClaim(claimToValidate, proofs)).to.eql(true);
      });

      it('returns false if proof is invalid', () => {
        const claims = flattenJson(sampleCertificate);
        const claimToValidate = claims[0];
        
        const proofs = [
          '6d0c0226e52a1632f9f5b72176b81b34efbb27f7244580bc0d4f0172a6b62838',
          '707ba78e305dc247c51f3e1186f78695fa979a894c38d435a565e37ef8f6eca4',
          'e1493cf92567c23ba497012854eb51c670b55110e4cf7127008ea2bdcf47dd90'
        ];

        expect(cert.proofClaim(claimToValidate, proofs)).to.eql(false);
      })

      it('returns false if claim is invalid', () => {
        const claims = flattenJson(sampleCertificate);
        const claimToValidate = {'invalid':'claim'};
        
        const proofs = [
          '6d0c0226e52a1632f9f5b72176b81b34efbb27f7244580bc0d4f0172a6b62838',
          '707ba78e305dc247c51f3e1186f78695fa979a894c38d435a565e37ef8f6eca4',
          'e1493cf92567c23ba497012854eb51c670b55110e4cf7127008ea2bdcf47dd90'
        ];

        expect(cert.proofClaim(claimToValidate, proofs)).to.eql(false);
      })
    });
  });
})