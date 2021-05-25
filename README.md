# Bintoken

A bintoken is an encoded binary message of a fixed length, meant to serve as a message which can be signed. Depending on the type byte, and who signed the bintoken, the message may hold different meanings.

For example, if the type indicates the message is an authentication token, and the bintoken is signed by a server's private key, this might provide a guarantee that the server verified some information at the time indicated in the bintoken.

The encoding format of the token is specified in-advance by instantiating the `BintokenEncoding` class exported by this package. The encoding is specified with property names and lengths for each property. The key names are sorted alphabetically when encoding and decoding bintokens.

The deterministic binary format simplifies signature verification. Its fixed length simplifies decoding & validation, and thus reduces the chance for malicious exploitation. Unlike with other formats such as JSON, there is only _one_ way to encode a message within a bintoken encoding scheme.

Here is the generic serialization format of any bintoken encoding:

- type (1 byte) : a version number which can be used to identify the context of the message.
- [...payload properties]
- time (4 bytes) : the timestamp (in unix seconds) when the message was created, encoded as a big-endian uint32.

## Example

Here is an example of a bintoken encoding which encodes only a 32-byte public key as the payload:

```js
const BintokenEncoding = require('@exodus/bintoken')

const tokenEncoding = new BintokenEncoding({ publicKey: 32, hash: 20 })

const token = tokenEncoding.toBuffer({
  type: 1,
  publicKey: randomBytes(32),
  hash: randomBytes(20),
})

/*
  // Erroneous use
  const token = tokenEncoding.toBuffer({ type: 1, publicKey: randomBytes(32), hash: randomBytes(20), otherProp: Buffer.alloc(0) })
  const token = tokenEncoding.toBuffer({ type: 1, publicKey: randomBytes(31), hash: randomBytes(20) })
  const token = tokenEncoding.toBuffer({ type: 1, publicKey: 'foo', hash: randomBytes(20) })
  const token = tokenEncoding.toBuffer({ type: 1 })
*/

const { type, time, publicKey, hash } = tokenEncoding.fromBuffer(token)

/*
  // Error, wrong length
  const { type, time, publicKey } = tokenEncoding.fromBuffer(
    Buffer.concat([token, Buffer.alloc(1)])
  )
*/
```

In this example, the serialization format is:

- type (1 byte) : a version number which can be used to identify the context of the message.
- hash (20) bytes : a hash over which the message holds meaning (as implied by the type).
- public key (32 bytes) : the public key over which the message holds meaning (as implied by the type).
- time (4 bytes) : the timestamp (in seconds) when the message was created, encoded as a big-endian uint32.

Notice that `hash` is written _before_ `publicKey` in the payload, as the properties are sorted alphabetically before being written to, or read from, a bintoken. This means **the keys you choose for your message must be the same for different applications using the same bintokens.**
