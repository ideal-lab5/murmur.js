import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

export type NewRequest = {
  validity: number;
  current_block: number;
  round_pubkey: string;
};

export type ExecuteRequest = {
  // SCALE encoded runtime call
  runtime_call: number[];
  current_block: number;
};

export type Payload = {
  pallet_name: string;
  call_name: string;
  call_data: any;
};

export type CreateResponse = {
  payload: Payload;
};

export type ExecuteResponse = {
  payload: Payload;
};

export type Extrinsic = SubmittableExtrinsic<"promise", ISubmittableResult>;
