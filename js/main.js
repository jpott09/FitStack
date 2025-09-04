import { Network } from "./network.js";
import { Display } from "./display.js";

const WIPE_LOCAL = false;

const BASE = `/${location.pathname.split('/')[1]}`;
const DATA_PATH = `${BASE}repo/master.json`;
const DATA = await Network.jsonRequest(DATA_PATH);
if(!DATA || DATA == null){console.error(`Error fetching data from ${DATA_PATH}`)}
else{console.log(`Received data from ${DATA_PATH}`)};

const DISPLAY = new Display(document, DATA, WIPE_LOCAL);
