const path = require('path');

const config = {
  entry: __dirname + '/src/index.js',
  output: {
    filename: 'lib/[name].js',
    library: '@redux-up/hooks',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          plugins: [

          ],
          presets: [

          ],
          cacheDirectory: true,
          babelrc: true
        }
      }
    ]
  },
  externals: {
    react : {
      commonjs: 'react',
      commonjs2: 'react',
    },
  },
  devtool: 'source-map',
};

module.exports = config;
