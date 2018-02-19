const Web3Mock = require("../../utils/mockWeb3");
const proxyquire = require("proxyquire");

const CertificateStore = proxyquire("../../../src/contract/certificateStore", {
  web3: Web3Mock
});

const {
  bytecode
} = require("../../../node_modules/certificate-contract/build/contracts/CertificateStore.json");

const address0 = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
const address1 = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";

const contract0 = "0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e";

const certificate0 = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";

describe("certificateStore", () => {
  describe("name", () => {
    it("should return name from contract", () => {
      const store = new CertificateStore(address0, contract0);
      const name = "GovTech DLT";

      store.contract.addMethod("name");
      store.contract.methods.name().setResult(true, name);

      return store.name().should.eventually.deep.equal(name);
    });
  });

  describe("verificationUrl", () => {
    it("should return verificationUrl from contract", () => {
      const store = new CertificateStore(address0, contract0);
      const verificationUrl = "https://tech.gov.sg";

      store.contract.addMethod("verificationUrl");
      store.contract.methods.verificationUrl().setResult(true, verificationUrl);

      return store
        .verificationUrl()
        .should.eventually.deep.equal(verificationUrl);
    });
  });

  describe("owner", () => {
    it("should return owner from contract", () => {
      const store = new CertificateStore(address0, contract0);
      const owner = address0;

      store.contract.addMethod("owner");
      store.contract.methods.owner().setResult(true, owner);

      return store.owner().should.eventually.deep.equal(owner);
    });
  });

  describe("getIssuedBlock", () => {
    it("should return issued block no from contract", () => {
      const store = new CertificateStore(address0, contract0);
      const issuedBlockNo = 15;

      store.contract.addMethod("getIssuedBlock");
      store.contract.methods.getIssuedBlock().setResult(true, issuedBlockNo);
      store.contract.methods.getIssuedBlock().expectParams(certificate0);

      return store
        .getIssuedBlock(certificate0)
        .should.eventually.deep.equal(issuedBlockNo);
    });
  });

  describe("isBatchIssued", () => {
    it("should return isBatchIssued from contract", () => {
      const store = new CertificateStore(address0, contract0);
      const isBatchIssued = true;

      store.contract.addMethod("isBatchIssued");
      store.contract.methods.isBatchIssued().setResult(true, isBatchIssued);

      return store
        .isBatchIssued(certificate0)
        .should.eventually.deep.equal(isBatchIssued);
    });
  });

  describe("isRevoked", () => {
    it("should return isRevoked from contract", () => {
      const store = new CertificateStore(address0, contract0);
      const isRevoked = false;

      store.contract.addMethod("isRevoked");
      store.contract.methods.isRevoked().setResult(true, isRevoked);

      return store
        .isRevoked(certificate0)
        .should.eventually.deep.equal(isRevoked);
    });
  });

  describe("transferOwnership", () => {
    it("should transferOwnership to new address from contract", () => {
      const store = new CertificateStore(address0, contract0);

      const transferTx = {
        transactionHash:
          "0x8f3454ced2bea8359ec7d5313d4eb0d24cf7ec2ec1ecf3c31aeca272158c8206",
        transactionIndex: 0,
        blockHash:
          "0xa5518831acafaaf55110661b041c1122e000caed4e772d606013edf33d4a8af3",
        blockNumber: 39,
        gasUsed: 30394,
        cumulativeGasUsed: 30394,
        contractAddress: null,
        status: "0x01",
        logsBloom:
          "0x00000000000000000000000000000000000000000000000000800000000000000000000000000020000000000040000000000000000000000000000000000000000000000000000010000000000000000001000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000400020000000010000000000000000000000000000000000000000010000000002000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        events: {
          OwnershipTransferred: {
            logIndex: 0,
            transactionIndex: 0,
            transactionHash:
              "0x8f3454ced2bea8359ec7d5313d4eb0d24cf7ec2ec1ecf3c31aeca272158c8206",
            blockHash:
              "0xa5518831acafaaf55110661b041c1122e000caed4e772d606013edf33d4a8af3",
            blockNumber: 39,
            address: "0xdE5491f774F0Cb009ABcEA7326342E105dbb1B2E",
            type: "mined",
            id: "log_d346b683",
            returnValues: {
              "0": "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
              "1": "0xf17f52151EbEF6C7334FAD080c5704D77216b732",
              previousOwner: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
              newOwner: "0xf17f52151EbEF6C7334FAD080c5704D77216b732"
            },
            event: "OwnershipTransferred",
            signature:
              "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
            raw: {
              data: "0x0",
              topics: [
                "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
                "0x000000000000000000000000627306090abab3a6e1400e9345bc60c78a8bef57",
                "0x000000000000000000000000f17f52151ebef6c7334fad080c5704d77216b732"
              ]
            }
          }
        }
      };

      store.contract.addMethod("transferOwnership");
      store.contract.methods.transferOwnership().setResult(true, transferTx);
      store.contract.methods.transferOwnership().expectParams(address1);

      return store
        .transferOwnership(address1)
        .should.eventually.deep.equal(transferTx);
    });

    it("should reject if transfer fails", () => {
      const store = new CertificateStore(address0, contract0);

      // Tx for transferring from non-owner
      const transferTx = {
        transactionHash:
          "0x6dc295f3327dfcfa9da47f444fb44fa3a4369614c8a1b31266024a84ccec1e47",
        transactionIndex: 0,
        blockHash:
          "0xe649a1fdd048c9ad9b6a353d10b49a3b4cc29ee1deccffb3af36299a50d83205",
        blockNumber: 60,
        gasUsed: 23296,
        cumulativeGasUsed: 23296,
        contractAddress: null,
        status: "0x00",
        logsBloom:
          "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        events: {}
      };

      store.contract.addMethod("transferOwnership");
      store.contract.methods.transferOwnership().setResult(true, transferTx);
      store.contract.methods.transferOwnership().expectParams(address1);

      return store
        .transferOwnership(address1)
        .should.be.rejectedWith(/Transaction has failed, check tx hash/);
    });
  });

  describe("issueBatch", () => {
    it("should issue a batch of certificate on contract", () => {
      const store = new CertificateStore(address0, contract0);

      const issueTx = {
        transactionHash:
          "0xd30be4722c4d2f7073afd2d21b4b3f325cf256a2c9a7d65c72356145591dc8db",
        transactionIndex: 0,
        blockHash:
          "0x1741e409538ae880dd4dbbc49bdbfad067d3bffd7f16a78b86030697226f43a7",
        blockNumber: 64,
        gasUsed: 44869,
        cumulativeGasUsed: 44869,
        contractAddress: null,
        status: "0x01",
        logsBloom:
          "0x00020000000000000000000000000000000000000004000000000000000000000080000000000000000800000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        events: {
          BatchIssued: {
            logIndex: 0,
            transactionIndex: 0,
            transactionHash:
              "0xd30be4722c4d2f7073afd2d21b4b3f325cf256a2c9a7d65c72356145591dc8db",
            blockHash:
              "0x1741e409538ae880dd4dbbc49bdbfad067d3bffd7f16a78b86030697226f43a7",
            blockNumber: 64,
            address: "0x059e17cEb15EF8470B7184B858D356317518aAB3",
            type: "mined",
            id: "log_c923147d",
            returnValues: {
              "0":
                "0x6330a553fc93768f612722bb8c2ec78ac90b3bbc000000000000000000000000",
              batchRoot:
                "0x6330a553fc93768f612722bb8c2ec78ac90b3bbc000000000000000000000000"
            },
            event: "BatchIssued",
            signature:
              "0xd46c9cfe26ef3f75ba4182d99d1cef87d8973e2b664e14cf3275d014d8c7c317",
            raw: {
              data: "0x0",
              topics: [
                "0xd46c9cfe26ef3f75ba4182d99d1cef87d8973e2b664e14cf3275d014d8c7c317",
                "0x6330a553fc93768f612722bb8c2ec78ac90b3bbc000000000000000000000000"
              ]
            }
          }
        }
      };

      store.contract.addMethod("issueBatch");
      store.contract.methods.issueBatch().setResult(true, issueTx);
      store.contract.methods.issueBatch().expectParams(certificate0);

      return store
        .issueBatch(certificate0)
        .should.eventually.deep.equal(issueTx);
    });

    it("should reject if issuing fails", () => {
      const store = new CertificateStore(address0, contract0);

      // Tx for issuing same certificate hash twice
      const issueTx = {
        transactionHash:
          "0x59f84f363cece97a9e3458c0cb46b0aefee9c01a10bcab7f1729e34a5f970ee6",
        transactionIndex: 0,
        blockHash:
          "0x3ac57420edc6ab26ff73237e2a0f4186b69b5729885c9d0a222a1a6c1855c002",
        blockNumber: 74,
        gasUsed: 23588,
        cumulativeGasUsed: 23588,
        contractAddress: null,
        status: "0x00",
        logsBloom:
          "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        events: {}
      };

      store.contract.addMethod("issueBatch");
      store.contract.methods.issueBatch().setResult(true, issueTx);
      store.contract.methods.issueBatch().expectParams(certificate0);

      return store
        .issueBatch(certificate0)
        .should.be.rejectedWith(/Transaction has failed, check tx hash/);
    });
  });

  describe("deploy", () => {
    it("should deploy a copy of contract", () => {
      const store = new CertificateStore(address0, contract0);

      const url = "http://tech.gov.sg";
      const name = "GovTech DLT";

      const contractAddress = "0x13274Fe19C0178208bCbee397af8167A7be27f6f";

      store.contract.deploy().setResult(true, {
        _address: contractAddress
      });

      store.contract.deploy().expectParams({
        data: bytecode,
        arguments: [url, name]
      });

      return store
        .deployStore(url, name)
        .should.eventually.deep.equal(contractAddress);
    });
  });

  // TBD Revoke claim, after contract is updated
});
