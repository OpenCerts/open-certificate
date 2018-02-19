#!/usr/bin/env node
const fs = require("fs");
const program = require("commander");

const batchIssue = require("./src/batchIssue");
const Certificate = require("./src/certificate");
const CertificateStore = require("./src/contract/certificateStore.js");
const { logger, addConsole } = require("./lib/logger");
const {
  generateRandomCertificate,
  randomCertificate
} = require("./src/randomCertificateGenerator");

const parseArguments = argv => {
  program
    .version("0.1.0", "-v, --version")
    .option("-i, --input <inputDir>", "Raw certificates directory")
    .option("-o, --output <outputDir>", "Output directory")
    .option(
      "-V, --verify <certificateFile>",
      "Verify authencity of certificate"
    )
    .option(
      "-g, --generate <certificatesToGenerator>",
      "Number of random certificates to generate",
      parseInt
    )
    .option("-d, --deploy", "Deploy a new certificate store")
    .option("-a, --issuerAddress <issuerAddress>", "Address of issuer")
    .option(
      "-t, --transfer <newOwnerAddress>",
      "Transfer contract ownership to new owner"
    )
    .option("-n, --name [storeName]", "Name of certificate store")
    .option("-u, --url [url]", "Url of certificate store")
    .option("-b, --issueBatch <batchMerkleRoot>", "Issue certificate")
    .option("-s, --store <storeAddress>", "Address of Certificate Store")
    .option(
      "--log-level <logLevel>",
      "Logging level. Defaults to `info`. " +
        "Possible values are `error`, `warn`, `info`, `verbose`, `debug`, `silly`."
    )
    .parse(argv);
};

const main = argv => {
  parseArguments(argv);
  addConsole(program.logLevel || "info");

  if (program.input && program.output) {
    logger.info(
      "============================== Issuing certificates ==============================\n"
    );

    batchIssue(program.input, program.output).then(merkleRoot => {
      logger.info(`Batch Certificate Root:\n${merkleRoot}\n`);

      logger.info(
        "===================================================================================\n"
      );
    });
  } else if (program.verify) {
    logger.info(
      "============================== Verifying certificate ==============================\n"
    );

    const certificateJson = fs.readFileSync(program.verify);
    const certificate = new Certificate(certificateJson);

    try {
      certificate.verify();

      logger.info("Certificate's signature is valid!\n");

      logger.info(
        "Warning: Please verify this certificate on the blockchain with the issuer's certificate store.\n"
      );
    } catch (e) {
      logger.info("Certificate's signature is invalid!");
      logger.info(`Reason: ${e.message}\n`);
    }

    logger.info(
      "===================================================================================\n"
    );
  } else if (program.generate) {
    logger.info(
      "========================== Generating random certificate ==========================\n"
    );

    const generated = generateRandomCertificate(
      program.generate,
      "./certificates/raw-certificates"
    );
    logger.info(`Generated ${generated} certificates.\n`);
    logger.info(
      "===================================================================================\n"
    );
  } else if (program.deploy && program.issuerAddress) {
    logger.info(
      "========================== Deploying new contract store ==========================\n"
    );

    const store = new CertificateStore(program.issuerAddress);
    store.deployStore(program.name, program.url).then(address => {
      logger.info(`Contract deployed at ${address}.\n`);
      logger.info(
        "===================================================================================\n"
      );
      process.exit(0);
    });
  } else if (program.transfer && program.issuerAddress && program.store) {
    logger.info(
      "=================== Transfering ownership of contract store ====================\n"
    );

    const store = new CertificateStore(program.issuerAddress, program.store);

    store
      .transferOwnership(program.transfer)
      .then(() => {
        logger.info(`Contract transfered to ${program.transfer}.\n`);
        logger.info(
          "===================================================================================\n"
        );
        process.exit(0);
      })
      .catch(err => {
        logger.error(`${err.message}\n`);
        logger.info(
          "===================================================================================\n"
        );
        process.exit(0);
      });
  } else if (program.issueBatch && program.issuerAddress && program.store) {
    logger.info(
      "=================== Issuing certificate on contract store ====================\n"
    );

    const store = new CertificateStore(program.issuerAddress, program.store);

    store
      .issueBatch(program.issueBatch)
      .then(() => {
        logger.info(`Certificate batch issued: ${program.issueBatch}.\n`);
        logger.info(
          "===================================================================================\n"
        );
        process.exit(0);
      })
      .catch(err => {
        logger.error(`${err.message}\n`);
        logger.info(
          "===================================================================================\n"
        );
        process.exit(0);
      });
  } else {
    program.help();
  }
};

if (typeof require !== "undefined" && require.main === module) {
  main(process.argv);
}

module.exports = {
  Certificate,
  batchIssue,
  generateRandomCertificate,
  randomCertificate
};
