import { SubmittableExtrinsic } from '@polkadot/api/types'
import { ISubmittableResult } from '@polkadot/types/types'

export type NewRequest = {
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
