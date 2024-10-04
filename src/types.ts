export type NewRequest = {
  validity: number;
  current_block: number;
  round_pubkey: string;
};

export type ExecuteRequest = {
  // We should be able to fit a u128 in `amount`, this is not possible in a
  // `number` type. We could use a bigint, but it can't be serialized to JSON.
  // Therefore, we use a string.
  amount: string;
  to: string;
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
