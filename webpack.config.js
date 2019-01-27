const path = require('path');

const config = {
  entry: __dirname + '/src/index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    library: '@redux-up/hooks',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            "@babel/preset-react",
            "@babel/preset-env"
          ],
          plugins: [
            "@babel/plugin-proposal-export-default-from",
            "@babel/plugin-proposal-export-namespace-from",
          ]
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
