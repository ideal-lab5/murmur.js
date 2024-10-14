# Murmur.js

A [Murmur API](https://github.com/ideal-lab5/murmur-api) wrapper to enable easy usage of Murmur wallets in JavaScript projects.

Made with love by [Ideal Labs](https://github.com/ideal-lab5).

## Prerequisites

The Murmur Client depends on:

- **Axios**: For making HTTP requests to the Murmur API.
- **Polkadot-js**: For interacting with the Ideal Network.

Ensure you have these dependencies installed in your project:

```sh
npm install axios @polkadot/api
```

## Usage

### Initialization

You need to configure axios and polkadot-js instances to be injected into the Murmur Client.

### Example

```javascript
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
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

## License

This project is licensed under the Apache-2.0 License
