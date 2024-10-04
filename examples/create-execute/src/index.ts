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
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* MurmurClient initialization */
const murmurClient = new MurmurClient(httpClient, api);
console.log("MurmurClient initialized");

const loguinResult = await murmurClient.authenticate("admin", "password");
console.log(loguinResult);

await murmurClient.new(100, async (result: any) =>{
  console.log(`Tx Block Hash: ${result.status.asFinalized}`);
  const executeResult = await murmurClient.execute(
    BigInt(999999),
    "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty" // Bob
  );
});
