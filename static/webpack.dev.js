const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const utils = require('./utils');

const optionalPlugins = [];

if (process.env.BUNDLE_ANALYZER === 'on') {
  optionalPlugins.push(new BundleAnalyzerPlugin({
    openAnalyzer: false,
    analyzerPort: 3001,
  }));
}

module.exports = merge(common, {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
              convertToAbsoluteUrls: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              includePaths: [
                utils.resolve('src/scss'),
              ],
            },
          },
        ],
      },
    ],
  },
  devtool: 'eval-source-map',
  devServer: {
    port: 3000,
    proxy: {
      '/': 'http://localhost:8000',
    },
    hot: true,
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    ...optionalPlugins,
  ],
});
