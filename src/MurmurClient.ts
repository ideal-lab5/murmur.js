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
import { KeyringPair } from '@polkadot/keyring/types'
import { AxiosInstance } from 'axios'
import type {
  Call,
  CreateResponse,
  ExecuteRequest,
  ExecuteResponse,
  CreateRequest,
} from './types'

export class MurmurClient {
  private http: AxiosInstance
  private idn: ApiPromise
  private masterAccount: KeyringPair
  private finalizedBlockNumber: number | null

  /**
   * Creates an instance of MurmurClient.
   *
   * @param http - The AxiosInstance to be used for HTTP requests.
   * @param idn - The ApiPromise to be used for interacting with the IDN blockchain.
   */
  constructor(
    http: AxiosInstance,
    idn: ApiPromise,
    masterAccount?: KeyringPair
  ) {
    this.http = http
    this.idn = idn
    this.masterAccount = masterAccount ?? this.defaultMasterAccount()
    this.finalizedBlockNumber = null

    const unsub = idn.rpc.chain.subscribeFinalizedHeads((header) => {
      this.finalizedBlockNumber = header.number.toNumber()
    })
  }

  /**
   * Authenticates the user with the specified username and password.
   *
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves to a string indicating the result of the authentication.
   */
  async authenticate(username: string, password: string): Promise<string> {
    try {
      const response = await this.http.post('/authenticate', {
        username,
        password,
      })

      // Extract the Set-Cookie header
      const setCookieHeader = response.headers['set-cookie']
      if (setCookieHeader) {
        // Store the cookies in the Axios instance's default headers to keep the session
        this.http.defaults.headers.Cookie = setCookieHeader.join('; ')
      }

      return response.data
    } catch (error) {
      throw new Error(`Authenticattion failed: ${error}`)
    }
  }

  /**
   * Creates a new wallet with a specified validity period.
   *
   * @param validity - The number of blocks in which the wallet will be valid.
   * @param callback - The callback function to be called when the transaction is finalized.
   * @returns A promise that resolves to a string indicating the block hash of the block in which
   * the transaction was executed, or in which was included if it didn't execute.
   */
  async new(
    validity: number,
    callback: (result: any) => Promise<void> = async () => {}
  ): Promise<void> {
    const MAX_U32 = 2 ** 32 - 1
    if (!Number.isInteger(validity)) {
      throw new Error('The validity parameter must be an integer.')
    }

    if (validity < 0 || validity > MAX_U32) {
      throw new Error(
        `The validity parameter must be within the range of 0 to ${MAX_U32}.`
      )
    }

    const request: CreateRequest = {
      validity,
      current_block: await this.getFinalizedBlockNumber(),
      round_pubkey: await this.getRoundPublic(),
    }

    try {
      const response = (await this.http.post('/create', request))
        .data as CreateResponse

      const call = this.idn.tx.murmur.create(
        response.create_data.root,
        response.create_data.size,
        response.username
      )

      this.submitCall(call, callback)

      return Promise.resolve()
    } catch (error) {
      throw new Error(`New failed: ${error}`)
    }
  }

  /**
   * Executes a transaction to send a specified amount of tokens to a destination account.
   *
   * @param call - A submittable extrinsic.
   * @param callback - The callback function to be called when the transaction is finalized.
   * @returns A promise that resolves to a string indicating the result of the transaction.
   */
  async execute(
    call: Call,
    callback: (result: any) => Promise<void> = async () => {}
  ): Promise<void> {
    const request: ExecuteRequest = {
      runtime_call: this.encodeCall(call),
      current_block: await this.getFinalizedBlockNumber(),
    }
    try {
      const response = (await this.http.post('/execute', request))
        .data as ExecuteResponse

      const outerCall = this.idn.tx.murmur.proxy(
        response.username,
        response.proxy_data.position,
        response.proxy_data.hash,
        response.proxy_data.ciphertext,
        response.proxy_data.proof_items,
        response.proxy_data.size,
        call
      )

      this.submitCall(outerCall, callback)

      return Promise.resolve()
    } catch (error) {
      throw new Error(`Execute failed: ${error}`)
    }
  }

  private async getRoundPublic(): Promise<string> {
    await this.idn.isReady
    let roundPublic = await this.idn.query.etf.roundPublic()
    return roundPublic.toString()
  }

  private defaultMasterAccount(): KeyringPair {
    const keyring = new Keyring({ type: 'sr25519' })
    const alice = keyring.addFromUri('//Alice')
    return alice
  }

  private async submitCall(
    call: Call,
    callback: (result: any) => Promise<void> = async () => {}
  ): Promise<void> {
    const unsub = await call.signAndSend(this.masterAccount, (result: any) => {
      callback(result)
      if (result.status.isFinalized) {
        console.log(
          `Transaction finalized at blockHash ${result.status.asFinalized}`
        )
        unsub()
      }
    })
    return Promise.resolve()
  }

  private encodeCall(ext: Call): number[] {
    return Array.from(ext.inner.toU8a())
  }

  private async getFinalizedBlockNumber(): Promise<number> {
    return new Promise((resolve) => {
      const checkFinalizedBlockNumber = () => {
        if (this.finalizedBlockNumber !== null) {
          resolve(this.finalizedBlockNumber)
        } else {
          setTimeout(checkFinalizedBlockNumber, 100) // Check again after 100ms
        }
      }
      checkFinalizedBlockNumber()
    })
  }
}
