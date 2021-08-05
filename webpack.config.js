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
    filename: "[name].js", // 生成的fiename需要与package.json中的main一致
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs",
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [
          {
            loader: "tslint-loader",
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.ts?$/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
};
