// Doing this because nodejs built-in 'assert' package does not provide stack traces.
const assert = (cond, message = 'failed assertion') => {
  if (!cond) throw new Error(message)
}

module.exports = assert
