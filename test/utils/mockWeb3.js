const _ = require("lodash");
const utils = require("web3-utils");

function Web3MockContractTxObject() {
  this.resolves = 0;
  this.results = null;
  this.expectedParam = null;
  this.passedParams = null;
}

// Sets the resolved value for this method.
// When `resolves` === true, the method resolves, otherwise it is rejected
// Value from results will be returns in resolve or reject
Web3MockContractTxObject.prototype.setResult = function setResult(
  resolves,
  results
) {
  this.resolves = resolves;
  this.results = results;
};

Web3MockContractTxObject.prototype.expectParams = function expectParams(
  ...args
) {
  this.expectedParam = args;
};

Web3MockContractTxObject.prototype.argumentCheck = function argumentCheck() {
  if (this.expectedParam && !_.isEqual(this.passedParams, this.expectedParam)) {
    throw new Error(`Argument mismatch
      Expected: ${JSON.stringify(this.expectedParam, null, 2)}
      Received: ${JSON.stringify(this.passedParams, null, 2)}`);
  }
};

Web3MockContractTxObject.prototype.call = function call() {
  this.argumentCheck();

  return this.resolves
    ? Promise.resolve(this.results)
    : Promise.reject(this.results);
};

Web3MockContractTxObject.prototype.send = function send() {
  this.argumentCheck();

  return this.resolves
    ? Promise.resolve(this.results)
    : Promise.reject(this.results);
};

function Web3MockContract() {
  this.methodStore = {};
  this.expectedArguments = {};
  this.methods = {};
  this.deployFn = new Web3MockContractTxObject();
  this.deploy = (...args) => {
    this.deployFn.passedParams = args;
    return this.deployFn;
  };
}

Web3MockContract.prototype.addMethod = function addMethod(methodName) {
  this.methodStore[methodName] = new Web3MockContractTxObject();
  this.methods[methodName] = (...args) => {
    this.methodStore[methodName].passedParams = args;
    return this.methodStore[methodName];
  };
};

function Web3Mock() {
  this.eth = {
    Contract: Web3MockContract
  };

  this.utils = utils;
}

module.exports = Web3Mock;
