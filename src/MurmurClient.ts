import { AxiosInstance } from "axios";
import { ApiPromise } from "@polkadot/api";
import { BlockHash } from "@polkadot/types/interfaces/chain";
import { HexString } from "@polkadot/util/types";

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
   * Creates a new wallet with a specified validity period.
   *
   * @param validity - The number of blocks in which the wallet will be valid.
   * @returns A promise that resolves to a string indicating the result of the wallet creation.
   */
  async login(username: string, password: string): Promise<string> {
    try {
      const response = await this.http.post("/login", { username, password });
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
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
    try {
      const response = await this.http.post("/new", { validity });
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
    if (!Number.isInteger(amount)) {
      throw new Error("The amount parameter must be an integer.");
    }
    if (amount < 0 || amount > MAX_U128) {
      throw new Error(
        `The amount parameter must be within the range of 0 to ${MAX_U128}.`
      );
    }
    try {
      const response = await this.http.post("/execute", { amount, to });
      return response.data;
    } catch (error) {
      throw new Error(`Execute failed: ${error}`);
    }
  }

  async getRoundPublic(): Promise<HexString> {
    await this.idn.isReady;
    let roundPublic = await this.idn.query.etf.roundPublic();
    return roundPublic.toHex();
  }

  async getCurrentBlock(): Promise<BlockHash> {
    await this.idn.isReady;
    const { hash } = await this.idn.rpc.chain.getHeader();
    return hash;
  }
}
