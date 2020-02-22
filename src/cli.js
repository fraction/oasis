"use strict";

const yargs = require("yargs");
const _ = require("lodash");

module.exports = presets =>
  yargs
    .scriptName("oasis")
    .env("OASIS")
    .help("h")
    .alias("h", "help")
    .usage("Usage: $0 [options]")
    .options("open", {
      describe:
        "Automatically open app in web browser. Use --no-open to disable.",
      default: _.get(presets, "open", true),
      type: "boolean"
    })
    .options("offline", {
      describe:
        "Don't try to connect to scuttlebutt peers or pubs. This can be changed on the 'settings' page while Oasis is running.",
      default: _.get(presets, "offline", false),
      type: "boolean"
    })
    .options("host", {
      describe: "Hostname for web app to listen on",
      default: _.get(presets, "host", "localhost"),
      type: "string"
    })
    .options("port", {
      describe: "Port for web app to listen on",
      default: _.get(presets, "port", 3000),
      type: "number"
    })
    .options("public", {
      describe:
        "Assume Oasis is being hosted publicly, disable HTTP POST and redact messages from people who haven't given consent for public web hosting.",
      default: _.get(presets, "public", false),
      type: "boolean"
    })
    .options("debug", {
      describe: "Use verbose output for debugging",
      default: _.get(presets, "debug", false),
      type: "boolean"
    }).argv;
