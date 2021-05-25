const assert = require('./assert')
const bindate = require('./bindate')

class BintokenEncoding {
  constructor(payloadLengths = {}) {
    this.payloadLengths = payloadLengths
    this.tokenSize = 1 + 4 + Object.values(payloadLengths).reduce((sum, length) => sum + length, 0)
  }

  toBuffer({ type, time = Date.now(), ...params }) {
    assert(Number.isInteger(type) && type >= 0 && type <= 0xff, 'invalid bintoken type')
    assert(typeof time === 'number' && time > 0, 'invalid time')

    let i = 0
    const token = Buffer.alloc(this.tokenSize)

    i += token.writeUInt8(type)

    Object.keys(this.payloadLengths)
      .sort()
      .forEach((key) => {
        assert(
          Buffer.isBuffer(params[key]),
          `must provide Buffer for bintoken payload property: ${key}`
        )
        assert(
          params[key].length === this.payloadLengths[key],
          `invalid length for bintoken payload property: ${key}`
        )
        i += params[key].copy(token, i)
        delete params[key]
      })

    i += bindate.toBuffer(time).copy(token, i)

    assert(
      Object.keys(params).length === 0,
      'received unexpected extra bintoken payload properties'
    )

    return token
  }

  fromBuffer(buf) {
    assert(Buffer.isBuffer(buf), 'expected buffer to decode bintoken')
    assert(buf.length === this.tokenSize, 'invalid bintoken length')

    const type = buf[0]

    const decodedToken = { type }

    let i = 1
    Object.keys(this.payloadLengths)
      .sort()
      .forEach((key) => {
        decodedToken[key] = buf.slice(i, (i += this.payloadLengths[key]))
      })
    decodedToken.time = bindate.fromBuffer(buf.slice(i))
    assert(typeof decodedToken.time === 'number' && decodedToken.time > 0, 'invalid time')

    return decodedToken
  }
}

module.exports = BintokenEncoding
