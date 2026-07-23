const fs = require("fs");
const path = require("path");
const redis = require("../config/redis");

const script = fs.readFileSync(
  path.join(__dirname, "../lua/slidingWindow.lua"),
  "utf8",
);

let sha = null;

async function loadScript() {
  sha = await redis.script("LOAD", script);
  console.log("Lua Script Loaded");
}

function getSha() {
  return sha;
}

module.exports = {
  loadScript,
  getSha,
};
