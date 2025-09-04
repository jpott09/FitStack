import { Network } from "./network.js";
import { Display } from "./display.js";

const WIPE_LOCAL = false;
const DATA_PATH = "repo/master.json";
const DATA = await Network.jsonRequest(DATA_PATH);
if (!DATA) {
    
} else {
    console.log(`Received data from ${DATA_PATH}`);
    new Display(document, DATA, WIPE_LOCAL);
}
