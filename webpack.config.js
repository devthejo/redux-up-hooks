const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    library: '@redux-up/hooks',
    libraryTarget: 'commonjs2'
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
            "@babel/plugin-transform-runtime",
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
}
