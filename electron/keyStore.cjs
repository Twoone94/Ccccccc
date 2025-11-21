const os = require('os')
let keytar = null
try { keytar = require('keytar') } catch {}

const SERVICE = 'BananaGO'

const mem = new Map()

async function setSecret(account, secret) {
  if (keytar) return keytar.setPassword(SERVICE, account, secret)
  mem.set(account, secret)
}

async function getSecret(account) {
  if (keytar) return keytar.getPassword(SERVICE, account)
  return mem.get(account) || null
}

async function deleteSecret(account) {
  if (keytar) return keytar.deletePassword(SERVICE, account)
  return mem.delete(account)
}

async function listAccounts() {
  if (keytar) {
    const creds = await keytar.findCredentials(SERVICE)
    return creds.map(c => c.account)
  }
  return Array.from(mem.keys())
}

module.exports = { setSecret, getSecret, deleteSecret, listAccounts }