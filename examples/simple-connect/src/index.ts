import { ApiPromise, WsProvider } from "@polkadot/api";
import axios from "axios";
import { MurmurClient } from "murmur.js";

/* Polkadot API initialization */
const provider = new WsProvider("ws://127.0.0.1:9944");
console.log("Provider initialized");
const api = await ApiPromise.create({ provider });
console.log("API initialized");
// Retrieve the chain & node information via rpc calls
const [chain, nodeName, nodeVersion] = await Promise.all([
  api.rpc.system.chain(),
  api.rpc.system.name(),
  api.rpc.system.version(),
]);
console.log(
  `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
);

/* Axios initialization */
const httpClient = axios.create({
  baseURL: "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
});

/* MurmurClient initialization */
const murmurClient = new MurmurClient(httpClient, api);
console.log("MurmurClient initialized");

/* Example usage */
let block = await murmurClient.getCurrentBlock();
console.log(`Current block: ${block}`);

let pubkey = await murmurClient.getRoundPublic();
console.log(`Round public key: ${pubkey}`);
