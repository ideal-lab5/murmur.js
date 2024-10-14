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

import { SubmittableExtrinsic } from '@polkadot/api/types'
import { ISubmittableResult } from '@polkadot/types/types'

export type CreateRequest = {
  validity: number
  current_block: number
  round_pubkey: string
}

export type ExecuteRequest = {
  // SCALE encoded runtime call
  runtime_call: number[]
  current_block: number
}

export type CreateData = {
  root: number[]
  size: bigint
  mmr_store: any
}

export type CreateResponse = {
  username: string
  create_data: CreateData
}

export type ProxyData = {
  position: bigint
  // The hash of the commitment
  hash: number[]
  ciphertext: number[]
  proof_items: number[][]
  size: bigint
}

export type ExecuteResponse = {
  username: string
  proxy_data: ProxyData
}

export type Call = SubmittableExtrinsic<'promise', ISubmittableResult>
