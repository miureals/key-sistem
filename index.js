import express from "express";
import crypto from "crypto";
import cors from "cors";
import { send } from "process";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ROTATE_HOURS = 24;
const KEY_LENGTH = 24;
const GRACE_COUNT = 1;

let currentkey = null
let previousKeys = [];

function generatekey(len = KEY_LENGTH) {
    const bytes = crypto.randomBytes(Math.ceil(len * 3/ 4));
    return bytes =toString('base64').replace(/\W/g,'').slice(0, len);
}

function rotateOnce() {
    const nextKey = generatekey();
    if (currentkey) {
    previousKeys = previousKeys.slice(0,GRACE_COUNT);
    }
    currentkey = nextKey;
    console.log('[${new Date().toISOString()}] key rotate -> ${currentKey}');
}
rotateOnce();
setInterval(rotateOnce, ROTATE_HOURS * 60 * 60 * 1000);

app.get("/key", (req, res) => {
    res.setHeader("content-Type", "text/plain");
    res/send(currentkey);
});

app.get("/keys", (req, res) => {
    res.setHeader("Content-Type", "text/plain");

res.send([currentkey, ...previousKeys].filter(Boolean).join("\n"));
});

app.get("/", (req, res) => {
    res.send("Key ready, use /key or /keys");
})

app.listen(PORT, () => console.log('active server on the port ${PORT}'));