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

import { ApiPromise, Keyring } from '@polkadot/api'
import axios from 'axios'
import { MurmurClient } from '../../src/MurmurClient'

jest.mock('axios')
jest.mock('@polkadot/api')

describe('MurmurClient', () => {
  let murmurClient: MurmurClient

  beforeAll(async () => {
    const httpClient = axios.create()
    const api = await ApiPromise.create()
    const keyring = new Keyring({ type: 'sr25519' })
    const alice = keyring.addFromUri('//Alice')

    murmurClient = new MurmurClient(httpClient, api, alice)
  })

  it('should initialize correctly', () => {
    expect(murmurClient).toBeDefined()
  })

  it('should authenticate user', async () => {
    const username = 'testuser'
    const password = 'testpassword'

    await murmurClient.authenticate(username, password)

    expect(axios.post).toHaveBeenCalledWith('/authenticate', {
      username,
      password,
    })
  })

  it('should create a new instance of MurmurClient', async () => {
    const httpClient = axios.create()
    const api = await ApiPromise.create()
    const keyring = new Keyring({ type: 'sr25519' })
    const alice = keyring.addFromUri('//Alice')

    const client = new MurmurClient(httpClient, api, alice)

    expect(client).toBeInstanceOf(MurmurClient)
  })
})
