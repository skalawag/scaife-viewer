const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const utils = require('./utils');

const env = {
  NODE_ENV: '"production"',
};

module.exports = merge(common, {
  devtool: 'hidden-source-map',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                utils.resolve('src/scss'),
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    new MiniCssExtractPlugin({
      filename: 'css/site.css',
    }),
    new OptimizeCssAssetsPlugin(),
  ],
});
