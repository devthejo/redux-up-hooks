const path = require('path');

const config = {
  entry: __dirname + '/src/index.js',
  devtool: 'inline-source-map',
  output: {
    path: __dirname + '/lib',
    filename: 'index.js',
    library: '@redux-up/hooks',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/
      },
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.js']
  },
  externals: {
    react : {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
    },
  },
};

module.exports = config;
