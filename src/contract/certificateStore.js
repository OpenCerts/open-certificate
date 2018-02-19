const Web3 = require("web3");

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

const {
  abi,
  bytecode
} = require("../../node_modules/certificate-contract/build/contracts/CertificateStore.json");

function CertificateStore(issuerAccount, address) {
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

CertificateStore.prototype.isCertificateIssued = function _isCertificateIssued(
  merkleRoot
) {
  return this.contract.methods.isCertificateIssued(merkleRoot).call();
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

CertificateStore.prototype.issueCertificate = function _issueCertificate(hash) {
  return this.contract.methods
    .issueCertificate(hash)
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

CertificateStore.prototype.revokeCertificate = function _revokeCertificate(
  merkleRoot,
  reason
) {
  return this.contract.methods
    .revokeCertificate(merkleRoot, reason)
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

CertificateStore.prototype.deployStore = async function _deployStore(
  verificationUrl,
  name
) {
  const deployParams = {
    data: bytecode,
    arguments: [verificationUrl, name]
  };

  const gasRequired = await this.contract.deploy(deployParams).estimateGas();

  const contractAddress = await this.contract
    .deploy(deployParams)
    .send({ from: this.account, gas: gasRequired })
    .then(contract => {
      // eslint-disable-next-line no-underscore-dangle
      const address = contract._address;
      this.contract = new web3.eth.Contract(abi, address);
      return address;
    });

  return contractAddress;
};

module.exports = CertificateStore;
