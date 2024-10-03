import { AxiosHeaderValue, AxiosInstance } from "axios";
import { ApiPromise } from "@polkadot/api";
import type { NewRequest, ExecuteRequest } from "./types";
import type { BlockNumber } from "@polkadot/types/interfaces";

export class MurmurClient {
  private http: AxiosInstance;
  private idn: ApiPromise;

  /**
   * Creates an instance of MurmurClient.
   *
   * @param http - The AxiosInstance to be used for HTTP requests.
   * @param idn - The ApiPromise to be used for interacting with the IDN blockchain.
   */
  constructor(http: AxiosInstance, idn: ApiPromise) {
    this.http = http;
    this.idn = idn;
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
      const response = await this.http.post("/authenticate", { username, password });

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
   * @returns A promise that resolves to a string indicating the result of the wallet creation.
   */
  async new(validity: number): Promise<string> {
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
      current_block_number: (await this.getCurrentBlock()).toNumber(),
      round_pubkey_bytes: this.remove0xPrefix(
        (await this.getRoundPublic()).toString()
      ),
    };
    console.debug("request: ", JSON.stringify(request));
    try {
      const response = await this.http.post("/new", request);
      return response.data;
    } catch (error) {
      throw new Error(`New failed: ${error}`);
    }
  }

  /**
   * Executes a transaction to send a specified amount of tokens to a destination account.
   *
   * @param amount - The amount of tokens to send.
   * @param to - The destination account.
   * @returns A promise that resolves to a string indicating the result of the transaction.
   */
  async execute(amount: bigint, to: string): Promise<string> {
    const MAX_U128 = BigInt(2 ** 128 - 1);
    if (amount < 0 || amount > MAX_U128) {
      throw new Error(
        `The amount parameter must be within the range of 0 to ${MAX_U128}.`
      );
    }
    const request: ExecuteRequest = {
      amount: amount.toString(),
      to,
      current_block_number: (await this.getCurrentBlock()).toNumber(),
    };
    try {
      const response = await this.http.post("/execute", request);
      return response.data;
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

  private remove0xPrefix(hexString: string): string {
    if (hexString.startsWith("0x")) {
      return hexString.slice(2);
    }
    return hexString;
  }
}
