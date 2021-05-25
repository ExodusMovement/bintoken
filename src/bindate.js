const assert = require('./assert')

// A bindate is a big-endian binary encoding of a uint32 unix timestamp.
const bindate = {
  toBuffer: (msTime) => {
    const unixTime = Math.floor(msTime / 1000)
    assert(Number.isInteger(unixTime) && unixTime > 0 && unixTime <= 0xffffffff, 'invalid time')
    const buf = Buffer.alloc(4)
    buf.writeUInt32BE(unixTime)
    return buf
  },

  fromBuffer: (buf) => buf.readUInt32BE() * 1000,
}

module.exports = bindate
