const Web3 = require("web3");
const config = require("./config.js");

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

const {
  abi,
  bytecode
} = require("../../node_modules/certificate-contract/build/contracts/CertificateStore.json");

function CertificateStore(issuerAccount, address) {
  this.gas = process.env.GAS || config.defaults.gas;
  this.gasPrice = process.env.GAS_PRICE || config.defaults.gasPrice;
  this.account = issuerAccount;
  this.contract = new web3.eth.Contract(abi, address);
}

CertificateStore.prototype.name = function _name() {
  return this.contract.methods.name().call();
};

CertificateStore.prototype.verificationUrl = function _verificationUrl() {
  return this.contract.methods.verificationUrl().call();
};

CertificateStore.prototype.owner = function _owner() {
  return this.contract.methods.owner().call();
};

CertificateStore.prototype.getIssuedBlock = function _getIssuedBlock(
  merkleRoot
) {
  return this.contract.methods.getIssuedBlock(merkleRoot).call();
};

CertificateStore.prototype.isBatchIssued = function _isBatchIssued(merkleRoot) {
  return this.contract.methods.isBatchIssued(merkleRoot).call();
};

CertificateStore.prototype.isRevoked = function _isRevoked(merkleRoot) {
  return this.contract.methods.isRevoked(merkleRoot).call();
};

CertificateStore.prototype.transferOwnership = function _transferOwnership(
  newOwner
) {
  return this.contract.methods
    .transferOwnership(newOwner)
    .send({ from: this.account })
    .then(tx => {
      const { status, transactionHash } = tx;
      if (web3.utils.hexToNumber(status) === 1) {
        return tx;
      } else if (web3.utils.hexToNumber(status) === 0) {
        return Promise.reject(
          new Error(`Transaction has failed, check tx hash: ${transactionHash}`)
        );
      }
      return Promise.reject(new Error(`Unknown transaction status: ${tx}`));
    });
};

CertificateStore.prototype.issueBatch = function _issueBatch(hash) {
  return this.contract.methods
    .issueBatch(hash)
    .send({ from: this.account })
    .then(tx => {
      const { status, transactionHash } = tx;
      if (web3.utils.hexToNumber(status) === 1) {
        return tx;
      } else if (web3.utils.hexToNumber(status) === 0) {
        return Promise.reject(
          new Error(`Transaction has failed, check tx hash: ${transactionHash}`)
        );
      }
      return Promise.reject(new Error(`Unknown transaction status: ${tx}`));
    });
};

CertificateStore.prototype.revokeClaim = function _revokeClaim(
  merkleRoot,
  claim,
  reason
) {
  return this.contract.methods
    .revokeClaim(merkleRoot, claim, reason)
    .send({ from: this.account })
    .then(tx => {
      const { status, transactionHash } = tx;
      if (web3.utils.hexToNumber(status) === 1) {
        return tx;
      } else if (web3.utils.hexToNumber(status) === 0) {
        return Promise.reject(
          new Error(`Transaction has failed, check tx hash: ${transactionHash}`)
        );
      }
      return Promise.reject(new Error(`Unknown transaction status: ${tx}`));
    });
};

CertificateStore.prototype.deployStore = function _deployStore(
  verificationUrl,
  name
) {
  return this.contract
    .deploy({
      data: bytecode,
      arguments: [verificationUrl, name]
    })
    .send({ from: this.account, gas: this.gas, gasPrice: this.gasPrice })
    .then(contract => {
      // eslint-disable-next-line no-underscore-dangle
      const address = contract._address;
      this.contract = new web3.eth.Contract(abi, address);
      return address;
    });
};

module.exports = CertificateStore;
