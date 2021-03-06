const path = require("path");

// the path(s) that should be cleaned
let pathsToClean = ["dist"];

// the clean options to use
let cleanOptions = {
  root: path.resolve(__dirname),
  // exclude: ['shared.js'],
  verbose: true,
  dry: false,
};

module.exports = {
  resolve: {
    extensions: [".js", ".ts", ".json"],
  },
  devtool: "source-map",
  mode: "production",
  entry: {
    index: "./index.ts",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ["babel-loader", "ts-loader"],
      },
    ],
  },
};
