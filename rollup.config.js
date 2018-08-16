import commonjs from "rollup-plugin-commonjs"; // for resolving require()
import json from "rollup-plugin-json"; // for loading json files
import pkg from "./package.json";

export default [
  {
    input: "src/index.js",
    output: [
      {
        name: "open-certificate",
        file: pkg.browser,
        format: "umd"
      },
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" }
    ],
    plugins: [commonjs(), json()]
  }
];
