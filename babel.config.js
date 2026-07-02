// Project-wide Babel config (applies to node_modules too, unlike .babelrc).
// Needed so babel-jest can transpile the ES-module dependencies of TrustVC
// (e.g. @digitalbazaar/*) that are whitelisted in jest's transformIgnorePatterns.
module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};
