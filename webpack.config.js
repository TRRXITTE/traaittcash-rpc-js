'use strict'

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    filename: 'traaittCASHRPC.js',
    library: 'traaittCASHRPC',
    libraryTarget: 'umd'
  },
  node: {
    fs: 'empty',
    tls: 'empty',
    net: 'empty'
  },
  target: 'web'
}
