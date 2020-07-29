import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export const hash = async (str) => {
  const salt = await genSalt()
  return doHash(salt, str)
}

export const verify = async (str, hash) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(str, hash, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })

const genSalt = () =>
  new Promise((resolve, reject) => {
    bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
      if (err) {
        return reject(err)
      }
      resolve(salt)
    })
  })

const doHash = (salt, str) =>
  new Promise((resolve, reject) => {
    bcrypt.hash(str, salt, (err, hash) => {
      if (err) {
        return reject(err)
      }
      resolve(hash)
    })
  })
