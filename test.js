const assert = require('./src/assert')
const { randomBytes } = require('crypto')
const BintokenEncoding = require('.')

const time = 1621977646000

{
  const encoding = new BintokenEncoding({ value: 10 })
  assert(encoding.tokenSize === 15, 'encoding length is expected')

  const type = 0
  const value = randomBytes(10)

  const token = encoding.toBuffer({ type, value, time })
  assert(token.length === encoding.tokenSize, 'token length must match encoding')

  const decoded = encoding.fromBuffer(token)
  assert(decoded.type === type, 'decoded type matches')
  assert(decoded.time === time, 'decoded time matches')
  assert(decoded.value.equals(value), 'decoded value matches')

  assert(encoding.toBuffer(decoded).equals(token), 're-encoding matches original token')
}

{
  let encoding = new BintokenEncoding({ c: 1, b: 1, a: 1 })
  assert(encoding.tokenSize === 8, 'encoding length is expected')

  const type = 0
  const a = Buffer.from([1])
  const b = Buffer.from([2])
  const c = Buffer.from([3])

  const token = encoding.toBuffer({ type, a, c, b, time })
  assert(token.length === encoding.tokenSize, 'token length must match encoding')

  // change order of keys, but since keys are sorted alphabetically
  // prior to decoding, this should still read the token correctly.
  encoding = new BintokenEncoding({ a: 1, c: 1, b: 1 })

  const decoded = encoding.fromBuffer(token)
  assert(decoded.type === type, 'decoded type matches')
  assert(decoded.time === time, 'decoded time matches')
  assert(decoded.a.equals(a), 'decoded a matches')
  assert(decoded.b.equals(b), 'decoded b matches')
  assert(decoded.c.equals(c), 'decoded c matches')

  assert(encoding.toBuffer(decoded).equals(token), 're-encoding matches original token')
}

const throws = (fn, message) => {
  try {
    fn()
    throw new Error(`${message} - expected error to be thrown`)
  } catch (e) {
    // successful test
  }
}

{
  const encoding = new BintokenEncoding({ value: 10 })
  const type = 0
  const value = randomBytes(10)

  throws(() => encoding.toBuffer({ value }), 'type byte required')
  throws(() => encoding.toBuffer({ type }), 'value payload required')
  throws(() => encoding.toBuffer({ type, value: randomBytes(9) }), 'value payload not long enough')
  throws(() => encoding.toBuffer({ type, value: value.toString() }), 'value payload wrong type')
  throws(() => encoding.toBuffer({ type, value, time: 'foo' }), 'time wrong type')

  const token = encoding.toBuffer({ type, value, time })

  throws(() => encoding.fromBuffer(token.slice(1)), 'incorrect token length')
  throws(() => encoding.fromBuffer('foo'), 'incorrect token type')
  throws(() => encoding.fromBuffer(null), 'incorrect token type')
}

console.log('\x1b[92mTests Passed!\x1b[39m')
