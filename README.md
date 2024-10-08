# Murmur.js

A wrapper to enable easy usage of murmur wallets in web apps.

More coming soon.

## Usage

The Murmur Client depends on:

- Axios for making HTTP requests to the Murmur API
- Polkadot-js for interacting with the Ideal Network

You need to configure an `axios` and a `polkadot-js` instances to be injected in the Murmur Client.

```javascript
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import axios from 'axios'
import { MurmurClient } from 'murmur.js'

/* Polkadot API initialization */
const provider = new WsProvider('ws://127.0.0.1:9944')
console.log('Provider initialized')
const api = await ApiPromise.create({ provider })
console.log('API initialized')

/* Axios initialization */
const httpClient = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

/* Define the master account (optional, it falls back to `alice`) */
const keyring = new Keyring({ type: 'sr25519' })
const alice = keyring.addFromUri('//Alice')

/* MurmurClient initialization */
const murmurClient = new MurmurClient(httpClient, api, alice)
console.log('MurmurClient initialized')

// Use the MurmurClient instance to make requests
murmurClient
  .authenticate('username', 'password')
  .then((response) => {
    console.log(response)
  })
  .catch((error) => {
    console.error(error)
  })
```
