// Copyright (c) 2018-2019, Brandon Lehmann, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

'use strict'

const packageInfo = require('../package.json')
const request = require('request-promise-native')
const util = require('util')

class WalletAPI {
  /**
   * Initializes a new WalletAPI object
   * @constructor
   * @param {Object} [opts] - Configuration options
   * @param {string} [opts.host=127.0.0.1] - the address of the daemon
   * @param {string} [opts.port=8070] - the RPC port number of the daemon
   * @param {number} [opts.timeout=30000] - the timeout to use during RPC calls
   * @param {boolean} [opts.ssl=false] - whether the daemon uses SSL (HTTPS) or not
   * @param {string} opts.password - the password for the RPC interface
   * @param {number} [opts.defaultMixin=false] - the default mixin count to use
   * @param {number} [opts.defaultFee=0.1] - the default transaction fee to use
   * @param {number} [opts.decimalDivisor=100000000] - the decimal divisor of atomic amounts
   * @param {number} [opts.defaultUnlockTime=0] - the default unlock time for new transactions
   * @param {string} [opts.userAgent=turtlecoin-rpc/version] - the user agent string to use with requests
   */
  constructor (opts) {
    opts = opts || {}

    this.host = opts.host || '127.0.0.1'
    this.port = opts.port || 8070
    this.timeout = opts.timeout || 30000
    this.ssl = opts.ssl || false
    this.password = opts.password || false
    this.defaultMixin = (opts.defaultMixin !== undefined) ? opts.defaultMixin : false
    this.defaultFee = (opts.defaultFee !== undefined) ? opts.defaultFee : 0.1
    this.decimalDivisor = opts.decimalDivisor || 100000000
    this.defaultUnlockTime = opts.defaultUnlockTime || 0
    this.userAgent = opts.userAgent || util.format('%s/%s', packageInfo.name, packageInfo.version)

    if (!this.password) {
      throw new Error('Must supply a password')
    }
  }

  /**
   * RPC DELETE Request
   * @async
   * @private
   * @param {string} path - the RPC method to call
   * @returns {Object} the response
   */
  _delete (path) {
    return new Promise((resolve, reject) => {
      if (!path) return reject(new Error('Must supply a path'))
      const protocol = (this.ssl) ? 'https' : 'http'

      request({
        uri: util.format('%s://%s:%s%s', protocol, this.host, this.port, path),
        method: 'DELETE',
        json: true,
        timeout: this.timeout,
        headers: {
          'X-API-KEY': this.password,
          'User-Agent': this.userAgent
        }
      }).then((result) => {
        return resolve(result)
      }).catch((error) => {
        return reject(error)
      })
    })
  }

  /**
   * RPC GET Request
   * @async
   * @private
   * @param {string} path - the RPC method to call
   * @returns {Object} the response
   */
  _get (path) {
    return new Promise((resolve, reject) => {
      if (!path) return reject(new Error('Must supply a path'))
      const protocol = (this.ssl) ? 'https' : 'http'

      request({
        uri: util.format('%s://%s:%s%s', protocol, this.host, this.port, path),
        method: 'GET',
        json: true,
        timeout: this.timeout,
        headers: {
          'X-API-KEY': this.password,
          'User-Agent': this.userAgent
        }
      }).then((result) => {
        return resolve(result)
      }).catch((error) => {
        return reject(error)
      })
    })
  }

  /**
   * RPC POST Request
   * @async
   * @private
   * @param {string} path - the RPC method to call
   * @param {Object} payload - the data payload for the request
   * @returns {Object} the response
   */
  _post (path, payload) {
    return new Promise((resolve, reject) => {
      if (!path) return reject(new Error('Must supply a path'))
      const protocol = (this.ssl) ? 'https' : 'http'

      request({
        uri: util.format('%s://%s:%s%s', protocol, this.host, this.port, path),
        method: 'POST',
        json: true,
        timeout: this.timeout,
        headers: {
          'X-API-KEY': this.password,
          'User-Agent': this.userAgent
        },
        body: payload
      }).then((result) => {
        return resolve(result)
      }).catch((error) => {
        return reject(error)
      })
    })
  }

  /**
   * RPC PUT Request
   * @async
   * @private
   * @param {string} path - the RPC method to call
   * @param {Object} payload - the data payload for the request
   * @returns {Object} the response
   */
  _put (path, payload) {
    return new Promise((resolve, reject) => {
      if (!path) return reject(new Error('Must supply a path'))
      const protocol = (this.ssl) ? 'https' : 'http'

      request({
        uri: util.format('%s://%s:%s%s', protocol, this.host, this.port, path),
        method: 'PUT',
        json: true,
        timeout: this.timeout,
        headers: {
          'X-API-KEY': this.password,
          'User-Agent': this.userAgent
        },
        body: payload
      }).then((result) => {
        return resolve(result)
      }).catch((error) => {
        return reject(error)
      })
    })
  }

  /**
   * @memberof WalletAPI
   * @typedef Addresses
   * @property {string[]} - a list of wallet addresses
   */

  /**
   * Gets a list of all addresses in the wallet container
   * @async
   * @returns {Promise<WalletAPI.Addresses>} resolves if success else rejects with error
   */
  addresses () {
    return new Promise((resolve, reject) => {
      this._get('/addresses').then((result) => {
        return resolve(result.addresses)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * @memberof WalletAPI
   * @typedef Balance
   * @property {string} [address] - the wallet address
   * @property {number} locked - the locked balance amount
   * @property {number} unlocked - the unlocked balance amount
   */

  /**
   * Get the balance for the entire wallet container or the specified address
   * @async
   * @param {string} [address=false] - the wallet address to check or false for the entire container
   * @returns {Promise<WalletAPI.Balance>} resolves if success else rejects with error
   */
  balance (address) {
    address = address || false

    return new Promise((resolve, reject) => {
      const url = (address) ? util.format('/balance/%s', address) : '/balance'
      this._get(url).then((result) => {
        /* Convert the amounts to human readable amounts */
        result.unlocked = this.fromAtomicUnits(result.unlocked)
        result.locked = this.fromAtomicUnits(result.locked)

        return resolve(result)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Get the balance for every address in the container
   * @async
   * @returns {Promise<WalletAPI.Balance[]>} resolves if success else rejects with error
   */
  balances () {
    return new Promise((resolve, reject) => {
      this._get('/balances').then((result) => {
        /* Convert the amounts to human readable amounts */
        for (var i = 0; i < result.length; i++) {
          result[i].unlocked = this.fromAtomicUnits(result[i].unlocked)
          result[i].locked = this.fromAtomicUnits(result[i].locked)
        }

        return resolve(result)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Closes the wallet container that is currently open
   * @async
   * @returns {Promise} resolves if success else rejects with error
   */
  close () {
    return new Promise((resolve, reject) => {
      this._delete('/wallet').then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Creates a new wallet container
   * @async
   * @param {string} filename - the filename for the new wallet container
   * @param {string} password - the password for the wallet container
   * @param {string} [host=127.0.0.1] - the node to use for the wallet container
   * @param {number} [port=14486] - the node port to use for the wallet container
   * @param {boolean} [ssl=false] - if the node uses SSL
   * @returns {Promise} resolves if success else rejects with error
   */
  create (filename, password, host, port, ssl) {
    host = host || '127.0.0.1'
    port = port || 14486
    ssl = ssl || false

    return new Promise((resolve, reject) => {
      if (!filename) return reject(new Error('Must supply wallet filename'))
      if (!password) return reject(new Error('Must supply wallet password'))

      this._post('/wallet/create', {
        daemonHost: host,
        daemonPort: port,
        daemonSSL: ssl,
        filename: filename,
        password: password
      }).then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * @memberof WalletAPI
   * @typedef Wallet
   * @property {string} [address] - the wallet address
   * @property {string} privateSpendKey - the wallet private spend key
   * @property {string} publicSpendKey - the wallet public spend key
   */

  /**
   * Creates a new, random address in the wallet container
   * @async
   * @returns {Promise<WalletAPI.Wallet>} resolves if success else rejects with error
   */
  createAddress () {
    return new Promise((resolve, reject) => {
      this._post('/addresses/create').then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Creates an integrated address from an address and payment ID
   * @async
   * @param {string} address - the address to use to generate the integrated address
   * @param {string} paymentId - the payment ID to use to generate the integrated address
   * @returns {Promise<string>} resolves with the integrated address if success else rejects with error
   */
  createIntegratedAddress (address, paymentId) {
    address = address || false
    paymentId = paymentId || false

    return new Promise((resolve, reject) => {
      if (!address) return reject(new Error('Must supply wallet address'))
      if (!paymentId) return reject(new Error('Must supply payment ID'))

      const url = util.format('/addresses/%s/%s', address, paymentId)
      this._get(url).then((result) => {
        return resolve(result.integratedAddress)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Deletes the given subwallet from the container
   * @async
   * @param {string} address - the address to use to generate the integrated address
   * @returns {Promise} resolves if success else rejects with error
   */
  deleteAddress (address) {
    address = address || false
    return new Promise((resolve, reject) => {
      if (!address) return reject(new Error('Must supply wallet address'))

      const url = util.format('/addresses/%s', address)
      this._delete(url).then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Converts atomic units amounts to human readable amounts
   * @param {number} amount - the amount in atomic units
   * @returns {number} the amount in human readable form
   */
  fromAtomicUnits (amount) {
    if (isNaN(parseInt(amount))) throw new Error('Amount is not a number')
    if (amount.toString().indexOf('.') !== -1) return parseFloat(amount)

    return parseFloat(parseInt(amount) / this.decimalDivisor)
  }

  /**
   * @memberof WalletAPI
   * @typedef NodeInfo
   * @property {string} daemonHost - the host of the connected node
   * @property {number} daemonPort - the port of the connected node
   * @property {boolean} daemonSSL - if the connected node uses SSL
   * @property {string} nodeAddress - the node fee address
   * @property {number} nodeFee - the node fee amount
   */

  /**
   * Gets the node address, port, fee, and fee address
   * @async
   * @returns {Promise<WalletAPI.NodeInfo>} resolves if success else rejects with error
   */
  getNode () {
    return new Promise((resolve, reject) => {
      this._get('/node').then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Imports a subwallet with the given private spend key
   * @async
   * @param {string} privateSpendKey - the private spend key of the wallet to import
   * @param {number} [scanHeight=0] - the height to start scanning from upon import
   * @returns {Promise<string>} results with the wallet address if success else rejects with error
   */
  importAddress (privateSpendKey, scanHeight) {
    privateSpendKey = privateSpendKey || false
    scanHeight = scanHeight || 0

    return new Promise((resolve, reject) => {
      if (!privateSpendKey) return reject(new Error('Must supply private spend key'))

      this._post('/addresses/import', {
        privateSpendKey: privateSpendKey,
        scanHeight: scanHeight
      }).then((result) => {
        return resolve(result.address)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Imports a new wallet container using the specified keys and optional params
   * @async
   * @param {string} filename - the filename of the new wallet container
   * @param {string} password - the password of the new wallet container
   * @param {string} prviateViewKey - the private view key to import
   * @param {string} privateSpendKey - the private spend key to import
   * @param {number} [scanHeight=0] - the height to import the wallet from
   * @param {string} [host=127.0.0.1] - the host of the node to use
   * @param {number} [port=14486] - the port of the node to use
   * @param {boolean} [ssl=false] - whether the node uses SSL
   * @returns {Promise} resolves upon success else rejects with error
   */
  importKey (filename, password, privateViewKey, privateSpendKey, scanHeight, host, port, ssl) {
    scanHeight = scanHeight || 0
    host = host || '127.0.0.1'
    port = port || 14486
    ssl = ssl || false

    return new Promise((resolve, reject) => {
      if (!filename) return reject(new Error('Must supply wallet filename'))
      if (!password) return reject(new Error('Must supply wallet password'))
      if (!privateViewKey) return reject(new Error('Must supply private view key'))
      if (!privateSpendKey) return reject(new Error('Must supply private spend key'))

      this._post('/wallet/import/key', {
        daemonHost: host,
        daemonPort: port,
        daemonSSL: ssl,
        filename: filename,
        password: password,
        scanHeight: scanHeight,
        privateViewKey: privateViewKey,
        privateSpendKey: privateSpendKey
      }).then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Imports a new wallet container using the specified keys and optional params
   * @async
   * @param {string} filename - the filename of the new wallet container
   * @param {string} password - the password of the new wallet container
   * @param {string} mnemonicSeed - the mnemonic seed of the wallet to import
   * @param {number} [scanHeight=0] - the height to import the wallet from
   * @param {string} [host=127.0.0.1] - the host of the node to use
   * @param {number} [port=14486] - the port of the node to use
   * @param {boolean} [ssl=false] - whether the node uses SSL
   * @returns {Promise} resolves upon success else rejects with error
   */
  importSeed (filename, password, mnemonicSeed, scanHeight, host, port, ssl) {
    scanHeight = scanHeight || 0
    host = host || '127.0.0.1'
    port = port || 14486
    ssl = ssl || false

    return new Promise((resolve, reject) => {
      if (!filename) return reject(new Error('Must supply wallet filename'))
      if (!password) return reject(new Error('Must supply wallet password'))
      if (!mnemonicSeed) return reject(new Error('Must supply mnemonic seed phrase'))

      this._post('/wallet/import/seed', {
        daemonHost: host,
        daemonPort: port,
        daemonSSL: ssl,
        filename: filename,
        password: password,
        scanHeight: scanHeight,
        mnemonicSeed: mnemonicSeed
      }).then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Imports a view only subwallet with the given publicSpendKey
   * @async
   * @param {string} publicSpendKey - the public spend key of the subwallet to import
   * @param {number} [scanHeight=0] - the height to import the wallet from
   * @returns {Promise} resolves upon success else rejects with error
   */
  importViewAddress (publicSpendKey, scanHeight) {
    publicSpendKey = publicSpendKey || false
    scanHeight = scanHeight || 0

    return new Promise((resolve, reject) => {
      if (!publicSpendKey) return reject(new Error('Must supply public spend key'))

      this._post('/addresses/import/view', {
        publicSpendKey: publicSpendKey,
        scanHeight: scanHeight
      }).then((result) => {
        return resolve(result.address)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Imports a new view-only wallet container using the specified key and optional params
   * @async
   * @param {string} filename - the filename of the new wallet container
   * @param {string} password - the password of the new wallet container
   * @param {string} prviateViewKey - the private view key to import
   * @param {string} address - the wallet address
   * @param {number} [scanHeight=0] - the height to import the wallet from
   * @param {string} [host=127.0.0.1] - the host of the node to use
   * @param {number} [port=14486] - the port of the node to use
   * @param {boolean} [ssl=false] - whether the node uses SSL
   * @returns {Promise} resolves upon success else rejects with error
   */
  importViewOnly (filename, password, privateViewKey, address, scanHeight, host, port, ssl) {
    scanHeight = scanHeight || 0
    host = host || '127.0.0.1'
    port = port || 14486
    ssl = ssl || false

    return new Promise((resolve, reject) => {
      if (!filename) return reject(new Error('Must supply wallet filename'))
      if (!password) return reject(new Error('Must supply wallet password'))
      if (!privateViewKey) return reject(new Error('Must supply private view key'))
      if (!address) return reject(new Error('Must supply wallet address'))

      this._post('/wallet/import/view', {
        daemonHost: host,
        daemonPort: port,
        daemonSSL: ssl,
        filename: filename,
        password: password,
        scanHeight: scanHeight,
        privateViewKey: privateViewKey,
        address: address
      }).then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Gets the wallet containers shared private view key, or if the address is specified, returns the public and private spend keys for the given address
   * @async
   * @param {string} [address] - the wallet address
   * @returns {Promise<string|WalletAPI.Wallet>} resolves upon success else rejects with error
   */
  keys (address) {
    address = address || false

    return new Promise((resolve, reject) => {
      const url = (address) ? util.format('/keys/%s', address) : '/keys'
      this._get(url).then((result) => {
        if (result.privateViewKey) return resolve(result.privateViewKey)
        return resolve(result)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Gets the mnemonic seed for the given address, if possible
   * @async
   * @param {string} address - the wallet address
   * @returns {Promise<string>} resolves with the mnemonic seed upon success else rejects with error
   */
  keysMnemonic (address) {
    address = address || false

    return new Promise((resolve, reject) => {
      if (!address) return reject(new Error('Must supply a wallet address'))

      const url = util.format('/keys/mnemonic/%s', address)
      this._get(url).then((result) => {
        return resolve(result.mnemonicSeed)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * @memberof WalletAPI
   * @typedef TransferDestination
   * @property {string} address - the address of the recipient
   * @property {number} amount - the atomic amount to send to the recipient
   */

  /**
   * Creates a new output destination object
   * @param {string} address - the address of the recipient
   * @param {number} amount - the human readable amount to send to the recipient
   * @returns {WalletAPI.TransferDestination} a transfer destination object
   */
  newDestination (address, amount) {
    return {
      address: address,
      amount: this.toAtomicUnits(amount)
    }
  }

  /**
   * Open an already existing wallet
   * @async
   * @param {string} filename - the filename of the wallet container
   * @param {string} password - the password of the wallet container
   * @param {string} [host=127.0.0.1] - the host of the node to use
   * @param {number} [port=14486] - the port of the node to use
   * @param {boolean} [ssl=false] - whether the node uses SSL
   * @returns {Promise} resolves upon success else rejects with error
   */
  open (filename, password, host, port, ssl) {
    host = host || '127.0.0.1'
    port = port || 14486
    ssl = ssl || false

    return new Promise((resolve, reject) => {
      if (!filename) return reject(new Error('Must supply wallet filename'))
      if (!password) return reject(new Error('Must supply wallet password'))

      this._post('/wallet/open', {
        daemonHost: host,
        daemonPort: port,
        daemonSSL: ssl,
        filename: filename,
        password: password
      }).then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Gets the primary address of the wallet container
   * @async
   * @returns {Promise<string>} resolves with the wallet address or rejects with error
   */
  primaryAddress () {
    return new Promise((resolve, reject) => {
      this._get('/addresses/primary').then((result) => {
        return resolve(result.address)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Resets and saves the wallet, beginning scanning from the height given, if any
   * @async
   * @param {number} [scanHeight=0] - the scan height at which to beging scanning
   * @returns {Promise} resolves upon success else rejects with error
   */
  reset (scanHeight) {
    scanHeight = scanHeight || 0

    return new Promise((resolve, reject) => {
      this._put('/reset', {
        scanHeight: scanHeight
      }).then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Saves the wallet container currently open to disk
   * @async
   * @returns {Promise} resolves upon success else rejects with error
   */
  save () {
    return new Promise((resolve, reject) => {
      this._put('/save').then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Sends a transaction
   * @async
   * @param {WalletAPI.TransferDestination} destinations - the destinations of the transaction
   * @param {number} [mixin] - the number of mixins to use
   * @param {number} [fee] - the transaction fee to payload
   * @param {string[]} [sourceAddresses] - the source addresses, if any, of the funds for the transaction
   * @param {string} [paymentId] - the payment ID to include with the transaction
   * @param {string} [changeAddress] - the address to send transaction change to
   * @param {number} [unlockTime] - the unlock time of the new transaction
   * @returns {Promise<string>} resolves with the transaction hash else rejects with error. This method resolving does not guarantee the completion of the transaction on the network.
   */
  sendAdvanced (destinations, mixin, fee, sourceAddresses, paymentId, changeAddress, unlockTime) {
    destinations = destinations || []
    mixin = mixin || this.defaultMixin
    fee = fee || this.defaultFee
    sourceAddresses = sourceAddresses || []
    paymentId = paymentId || false
    changeAddress = changeAddress || false
    unlockTime = unlockTime || this.defaultUnlockTime

    fee = this.toAtomicUnits(fee)

    return new Promise((resolve, reject) => {
      if (!Array.isArray(destinations)) return reject(new Error('Must supply an array of destinations'))

      for (var i = 0; i < destinations.length; i++) {
        if (!destinations[i].address) return reject(new Error('Must supply a wallet address in destination object'))
        if (typeof destinations[i].amount === 'undefined') return reject(new Error('Must supply an amount in destination object'))
      }

      if (!Array.isArray(sourceAddresses)) return reject(new Error('Must supply an array of source wallet addresses'))

      const request = {
        destinations: destinations,
        mixin: mixin,
        fee: fee,
        sourceAddresses: sourceAddresses,
        paymentID: paymentId,
        changeAddress: changeAddress,
        unlockTime: unlockTime
      }

      if (!request.mixin) delete request.mixin
      if (request.sourceAddresses.length === 0) delete request.sourceAddresses
      if (!request.paymentID) delete request.paymentID
      if (!request.changeAddress) delete request.changeAddress

      this._post('/transactions/send/advanced', request).then((result) => {
        return resolve(result.transactionHash)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Sends a transaction
   * @async
   * @param {string} address - the address to send funds to
   * @param {number} amount - the amount to send in the transaction
   * @param {string} [paymentId] - the payment ID to include with the transaction
   * @returns {Promise<string>} resolves with the transaction hash else rejects with error. This method resolving does not guarantee the completion of the transaction on the network.
   */
  sendBasic (address, amount, paymentId) {
    address = address || false
    amount = amount || false
    paymentId = paymentId || false

    return new Promise((resolve, reject) => {
      if (!address) return reject(new Error('Must supply wallet address'))
      if (typeof amount === 'undefined') return reject(new Error('Must supply amount'))

      amount = this.toAtomicUnits(amount)

      const request = {
        destination: address,
        amount: amount,
        paymentID: paymentId
      }

      if (!request.paymentID) delete request.paymentID

      this._post('/transactions/send/basic', request).then((result) => {
        return resolve(result.transactionHash)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Sends a fusion ransaction
   * @async
   * @param {string} address - the address to send funds to
   * @param {number} [mixin] - the number of mixins to use in the fusion transaction
   * @param {string[]} [sourceAddresses] - the source addresses, if any, of the funds for the fusion transaction
   * @returns {Promise<string>} resolves with the transaction hash else rejects with error. This method resolving does not guarantee the completion of the transaction on the network.
   */
  sendFusionAdvanced (address, mixin, sourceAddresses) {
    address = address || false
    mixin = mixin || this.defaultMixin
    sourceAddresses = sourceAddresses || []

    return new Promise((resolve, reject) => {
      if (!address) return reject(new Error('Must supply a wallet address'))
      if (!Array.isArray(sourceAddresses)) return reject(new Error('Must supply an array of source wallet addresses'))

      const request = {
        destination: address,
        mixin: mixin,
        sourceAddresses: sourceAddresses
      }

      if (!request.mixin) delete request.mixin
      if (request.sourceAddresses.length === 0) delete request.sourceAddresses

      this._post('/transactions/send/fusion/advanced', request).then((result) => {
        return resolve(result.transactionHash)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Sends a fusion ransaction
   * @async
   * @returns {Promise<string>} resolves with the transaction hash else rejects with error. This method resolving does not guarantee the completion of the transaction on the network.
   */
  sendFusionBasic () {
    return new Promise((resolve, reject) => {
      this._post('/transactions/send/fusion/basic').then((result) => {
        return resolve(result.transactionHash)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Sets the node to connect use in syncing operations
   * @async
   * @param {string} host - the host of the node to use
   * @param {number} port - the port of the node to use
   * @param {boolean} [ssl] - whether the node uses SSL
   * @returns {Promise} resolves upon success else rejects with error
   */
  setNode (host, port, ssl) {
    host = host || false
    port = port || false
    ssl = ssl || false

    return new Promise((resolve, reject) => {
      if (!host && !port) return reject(new Error('Must specify a minimum a host or port parameter'))

      const request = {
        daemonHost: host,
        daemonPort: port,
        daemonSSL: ssl
      }

      if (!request.daemonHost) delete request.daemonHost
      if (!request.daemonPort) delete request.daemonPort

      this._put('/node', request).then(() => {
        return resolve()
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * @memberof WalletAPI
   * @typedef StatusInfo
   * @property {number} walletBlockCount - how many blocks the wallet has synced
   * @property {number} localDaemonBlockCount - how many blocks the node has synced
   * @property {number} networkBlockCount - how many blocks the network has synced
   * @property {number} peerCount - the number of peers the node is connected to
   * @property {number} hashrate - the current estimated network hashrate
   * @property {boolean} isViewWallet - whether the current wallet container is a view-only wallet
   * @property {number} subWalletCount - how many subwallets exist in the wallet container
   */

  /**
   * Get the wallet sync status, peer count, and hashrate
   * @async
   * @returns {Promise<WalletAPI.StatusInfo>} resolves upon success else rejects with error
   */
  status () {
    return new Promise((resolve, reject) => {
      this._get('/status').then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Converts human readable units to atomic units
   * @param {number} amount - the amount in human readable units
   * @returns {number} the amount in atomic units form
   */
  toAtomicUnits (amount) {
    if (isNaN(parseFloat(amount))) throw new Error('Amount is not a number')

    return parseInt(parseFloat(amount) * this.decimalDivisor)
  }

  /**
   * @memberof WalletAPI
   * @typedef TransactionInfo
   * @property {number} [blockHeight] - the block height of the block containing the transaction
   * @property {number} fee - the network fee of the transaction
   * @property {string} hash - the transaction hash
   * @property {boolean} isCoinbaseTransaction - whether the transaction is a coinbase transaction
   * @property {string} paymentID - the payment ID of the transaction if any
   * @property {number} [timestamp] - the timestamp of the transaction
   * @property {number} unlockTime - the unlock time (or block height) of the transaction
   * @property {WalletAPI.TransferDestination} transfers - a transfer destination object descripting where the funds went
   */

  /**
   * Gets details on the given transaction, if found
   * @async
   * @param {string} hash - the transaction hash
   * @returns {Promise<WalletAPI.TransactionInfo>} resolves with transaction info else rejects with error
   */
  transactionByHash (hash) {
    hash = hash || false

    return new Promise((resolve, reject) => {
      if (!hash) return reject(new Error('Must supply transaction hash'))

      const url = util.format('/transactions/hash/%s', hash)
      this._get(url).then((result) => {
        /* Convert amounts to human readable amounts */
        result.transaction.fee = this.fromAtomicUnits(result.transaction.fee)

        for (var i = 0; i < result.transaction.transfers.length; i++) {
          result.transaction.transfers[i].amount = this.fromAtomicUnits(result.transaction.transfers[i].amount)
        }

        return resolve(result.transaction)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Gets the transaction private key of the given transaction. This can be used to audit a transaction.
   * @async
   * @param {string} hash - the transaction hash
   * @returns {Promise<string>} resolves with the transaction private key else rejects with error
   */
  transactionPrivateKey (hash) {
    hash = hash || false

    return new Promise((resolve, reject) => {
      if (!hash) return reject(new Error('Must supply transaction hash'))

      const url = util.format('/transactions/privatekey/%s', hash)
      this._get(url).then((result) => {
        return resolve(result.transactionPrivateKey)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Gets a list of all transactions in the wallet container and/or within the supplied constraints
   * @async
   * @param {number} [startHeight] - the height to return transactions from
   * @param {number} [endHeight] - the height to return transactions until
   * @returns {Promise<WalletAPI.TransactionInfo[]>} resolves with array of transaction info or rejects with error
   */
  transactions (startHeight, endHeight) {
    startHeight = startHeight || false
    endHeight = endHeight || false

    return new Promise((resolve, reject) => {
      var url = '/transactions'

      if (startHeight) {
        url += util.format('/%s', startHeight)
        if (endHeight) {
          url += util.format('/%s', endHeight)
        }
      }

      this._get(url).then((result) => {
        /* Convert amounts to human readable amounts */
        for (var i = 0; i < result.transactions.length; i++) {
          result.transactions[i].fee = this.fromAtomicUnits(result.transactions[i].fee)

          for (var j = 0; j < result.transactions[i].transfers.length; j++) {
            result.transactions[i].transfers[j].amount = this.fromAtomicUnits(result.transactions[i].transfers[j].amount)
          }
        }

        return resolve(result.transactions)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Gets a list of transactions in the wallet container by address and/or within the supplied constraints
   * @async
   * @param {string} address - the wallet address
   * @param {number} [startHeight] - the height to return transactions from
   * @param {number} [endHeight] - the height to return transactions until
   * @returns {Promise<WalletAPI.TransactionInfo[]>} resolves with array of transaction info or rejects with error
   */
  transactionsByAddress (address, startHeight, endHeight) {
    address = address || false
    startHeight = startHeight || false
    endHeight = endHeight || false

    return new Promise((resolve, reject) => {
      if (!address) return reject(new Error('Must supply wallet address'))
      if (typeof startHeight === 'undefined') return reject(new Error('Must supply start height'))

      var url = util.format('/transactions/address/%s/%s', address, startHeight)

      if (endHeight) {
        url += util.format('/%s', endHeight)
      }

      this._get(url).then((result) => {
      /* Convert amounts to human readable amounts */
        for (var i = 0; i < result.transactions.length; i++) {
          result.transactions[i].fee = this.fromAtomicUnits(result.transactions[i].fee)

          for (var j = 0; j < result.transactions[i].transfers.length; j++) {
            result.transactions[i].transfers[j].amount = this.fromAtomicUnits(result.transactions[i].transfers[j].amount)
          }
        }

        return resolve(result.transactions)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * Gets a list of all unconfirmed, outgoing transactions in the wallet container
   * @async
   * @param {string} [address] - the wallet address
   * @returns {Promise<WalletAPI.TransactionInfo[]>} resolves with array of transaction info or rejects with error
   */
  unconfirmedTransactions (address) {
    address = address || false

    return new Promise((resolve, reject) => {
      const url = (address) ? util.format('/transactions/unconfirmed/%s', address) : '/transactions/unconfirmed'
      this._get(url).then((result) => {
        /* Convert amounts to human readable amounts */
        for (var i = 0; i < result.transactions.length; i++) {
          result.transactions[i].fee = this.fromAtomicUnits(result.transactions[i].fee)

          for (var j = 0; j < result.transactions[i].transfers.length; j++) {
            result.transactions[i].transfers[j].amount = this.fromAtomicUnits(result.transactions[i].transfers[j].amount)
          }
        }

        return resolve(result.transactions)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }

  /**
   * @memberof WalletAPI
   * @typedef ValidationInfo
   * @property {boolean} isIntegrated - whether the address is an integrated address
   * @property {string} paymentID - the payment ID if the address is an integrated address
   * @property {string} actualAddress - the wallet address supplied
   * @property {string} publicSpendKey - the public spend key of the address
   * @property {string} publicViewKey - the public view key of the address
   */

  /**
   * Validates a given address
   * @async
   * @param {string} address - the wallet address
   * @returns {Promise<WalletAPI.ValidationInfo[]>} resolves with validation information or rejects with error
   */
  validateAddress (address) {
    return new Promise((resolve, reject) => {
      this._post('/addresses/validate', {
        address: address
      }).then((result) => {
        return resolve(result)
      }).catch((err) => {
        return reject(handleError(err))
      })
    })
  }
}

function handleError (err) {
  const errorMessage = (err.error && err.error.errorMessage) ? err.error.errorMessage : ''
  if (errorMessage.indexOf('cannot get a mnemonic seed')) return new Error(errorMessage)

  switch (err.statusCode) {
    case 400: return new Error('A parse error occured, or an error occured processing your request: ' + errorMessage)
    case 401: return new Error('API key is missing or invalid')
    case 403: return new Error('This operation requires a wallet to be open and one has not been opened')
    case 404: return new Error('The item requested does not exist')
    case 500: return new Error('An exception was thrown while processing the request. See the console for logs')
    default: return new Error(err.toString())
  }
}

module.exports = WalletAPI
