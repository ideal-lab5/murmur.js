/*
 * Copyright 2024 by Ideal Labs, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApiPromise, WsProvider } from '@polkadot/api'
import axios from 'axios'
import { MurmurClient } from 'murmur.js'

/* Polkadot API initialization */
const provider = new WsProvider('ws://127.0.0.1:9944')
console.log('Provider initialized')
const api = await ApiPromise.create({ provider })
console.log('API initialized')
// Retrieve the chain & node information via rpc calls
const [chain, nodeName, nodeVersion] = await Promise.all([
  api.rpc.system.chain(),
  api.rpc.system.name(),
  api.rpc.system.version(),
])
console.log(
  `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
)

/* Axios initialization */
const httpClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

/* MurmurClient initialization */
const murmurClient = new MurmurClient(httpClient, api)
console.log('MurmurClient initialized')

const loguinResult = await murmurClient.authenticate('admin', 'password')
console.log(loguinResult)

await murmurClient.new(100, async (result: any) => {
  console.log(`Tx Block Hash: ${result.status.asFinalized}`)
  const bob = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
  const call = api.tx.balances.transferAllowDeath(bob, 1000000000000)
  await murmurClient.execute(call)
})
