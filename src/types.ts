export type NewRequest = {
  validity: number;
  current_block_number: number;
  round_pubkey_bytes: string;
};

export type ExecuteRequest = {
  // We should be able to fit a u128 in `amount`, this is not possible in a
  // `number` type. We could use a bigint, but it can't be serialized to JSON.
  // Therefore, we use a string.
  amount: string;
  to: string;
  current_block_number: number;
};
