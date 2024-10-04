import { AxiosInstance } from "axios";
import { ApiPromise, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import type {
  NewRequest,
  ExecuteRequest,
  CreateResponse,
  ExecuteResponse,
  Payload,
} from "./types";
import type { BlockNumber } from "@polkadot/types/interfaces";

export class MurmurClient {
  private http: AxiosInstance;
  private idn: ApiPromise;
  private masterAccount: KeyringPair;

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
    this.http = http;
    this.idn = idn;
    this.masterAccount = masterAccount ?? this.defaultMasterAccount();
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
      const response = await this.http.post("/authenticate", {
        username,
        password,
      });

      // Extract the Set-Cookie header
      const setCookieHeader = response.headers["set-cookie"];
      if (setCookieHeader) {
        // Store the cookies in the Axios instance's default headers to keep the session
        this.http.defaults.headers.Cookie = setCookieHeader.join("; ");
      }

      return response.data;
    } catch (error) {
      throw new Error(`Authenticattion failed: ${error}`);
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
    const MAX_U32 = 2 ** 32 - 1;
    if (!Number.isInteger(validity)) {
      throw new Error("The validity parameter must be an integer.");
    }

    if (validity < 0 || validity > MAX_U32) {
      throw new Error(
        `The validity parameter must be within the range of 0 to ${MAX_U32}.`
      );
    }
    const request: NewRequest = {
      validity,
      current_block: (await this.getCurrentBlock()).toNumber(),
      round_pubkey: (await this.getRoundPublic()).toString(),
    };

    try {
      const response = (await this.http.post("/create", request))
        .data as CreateResponse;

      const tx = response.payload;

      this.submitExtrinsic(tx, callback);
    } catch (error) {
      throw new Error(`New failed: ${error}`);
    }
  }

  /**
   * Executes a transaction to send a specified amount of tokens to a destination account.
   *
   * @param amount - The amount of tokens to send.
   * @param to - The destination account.
   * @param callback - The callback function to be called when the transaction is finalized.
   * @returns A promise that resolves to a string indicating the result of the transaction.
   */
  async execute(
    amount: bigint,
    to: string,
    callback: (result: any) => Promise<void> = async () => {}
  ): Promise<void> {
    const MAX_U128 = BigInt(2 ** 128 - 1);
    if (amount < 0 || amount > MAX_U128) {
      throw new Error(
        `The amount parameter must be within the range of 0 to ${MAX_U128}.`
      );
    }
    const request: ExecuteRequest = {
      amount: amount.toString(),
      to,
      current_block: (await this.getCurrentBlock()).toNumber(),
    };
    try {
      const response = (await this.http.post("/execute", request))
        .data as ExecuteResponse;

      const tx = response.payload;

      this.submitExtrinsic(tx, callback);
      return Promise.resolve();
    } catch (error) {
      throw new Error(`Execute failed: ${error}`);
    }
  }

  private async getRoundPublic(): Promise<String> {
    await this.idn.isReady;
    let roundPublic = await this.idn.query.etf.roundPublic();
    return roundPublic.toString();
  }

  private async getCurrentBlock(): Promise<BlockNumber> {
    await this.idn.isReady;
    const { number } = await this.idn.rpc.chain.getHeader();
    return number.unwrap();
  }

  private defaultMasterAccount(): KeyringPair {
    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");
    return alice;
  }

  private async submitExtrinsic(
    tx: Payload,
    callback: (result: any) => Promise<void> = async () => {}
  ): Promise<void> {
    const extrinsic = this.constructExtrinsic(tx);
    const call = eval(extrinsic);
    const unsub = await call.signAndSend(this.masterAccount, (result: any) => {
      if (result.status.isInBlock) {
        console.log(
          `Transaction included at blockHash ${result.status.asInBlock}`
        );
      } else if (result.status.isFinalized) {
        console.log(
          `Transaction finalized at blockHash ${result.status.asFinalized}`
        );
        unsub();
        callback(result);
      }
    });
    return Promise.resolve();
  }

  private constructExtrinsic(tx: Payload): string {
    let extrinsicPath =
      `this.idn.tx.${tx.pallet_name}.${tx.call_name}`.toLocaleLowerCase();
    let parametersPath = "(";

    for (const key in tx.call_data) {
      if (
        isNaN(tx.call_data[key]) &&
        tx.call_data[key] != "true" &&
        tx.call_data[key] != "false"
      ) {
        parametersPath += `"${tx.call_data[key]}", `;
      } else {
        parametersPath += `${tx.call_data[key]}, `;
      }
    }

    parametersPath = parametersPath.slice(0, -2);
    parametersPath += ")";
    extrinsicPath += parametersPath;
    return extrinsicPath;
  }
}
