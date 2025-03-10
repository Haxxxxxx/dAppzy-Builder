// craco.config.js
const webpack = require('webpack');
const NodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add dotenv-webpack to load your .env file explicitly.
      webpackConfig.plugins.push(new DotenvWebpackPlugin());

      // 1) Add NodePolyfillWebpackPlugin to automatically add polyfills
      webpackConfig.plugins.push(new NodePolyfillWebpackPlugin());

      // 2) Disable "fullySpecified" for .m?js files
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      });

      // 3) Set fallbacks for Node modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        timers: require.resolve('timers-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        url: require.resolve('url'),
        util: require.resolve('util'),
        events: require.resolve('events'),
        // Explicitly disable modules that do not have a browser equivalent:
        child_process: false,
        fs: false,
        net: false,
        dgram: false,
      };

      // 4) Also disable "node:"-prefixed modules that have no browser polyfill.
      webpackConfig.resolve.fallback['node:child_process'] = false;
      webpackConfig.resolve.fallback['node:fs'] = false;
      webpackConfig.resolve.fallback['node:net'] = false;
      webpackConfig.resolve.fallback['node:dgram'] = false;
      webpackConfig.resolve.fallback['node:module'] = false;

      // 5) Use ProvidePlugin to define globals
      webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ]);

      return webpackConfig;
    },
  },
};
