const path = require("path");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
require("dotenv").config();
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isDev = process.env.ENV === "development";
const entry = ["./src/frontend/index.js"];
if (isDev) {
  entry.push(
    "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&reload=true"
  );
}
module.exports = {
  // entry: ['./src/frontend/index.js', 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&reload=true'],
  entry,
  // mode: 'development',
  mode: process.env.ENV, //Toma el modo que esta establecido en las variables de entorno
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  output: {
    // path: path.resolve(__dirname, 'dist'),
    path: path.resolve(__dirname, "src/server/public"),
    filename: "assets/app.js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(s*)css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|gif|jpg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "assets/[hash].[ext]",
            },
          },
        ],
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    isDev ? new webpack.HotModuleReplacementPlugin() : () => {},
    isDev
      ? () => {}
      : new CompressionWebpackPlugin({
          test: /\.js$|\css$/,
          filename: "[path].gz",
        }),
    new MiniCssExtractPlugin({
      filename: "assets/app.css",
    }),
  ],
};
