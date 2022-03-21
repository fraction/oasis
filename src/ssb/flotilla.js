const stack = require("secret-stack");
const shuffle = require("lodash.shuffle");
const debug = require("debug")("oasis");
const ssbConfig = require("ssb-config");

const plugins = [
  // Authentication often hooked for authentication.
  require("ssb-master"),
  // Methods often used during init().
  require("ssb-db"),
  require("ssb-ebt"),
  require("ssb-friends"),
  // Method `replicate()` often hooked for improvements.
  require("ssb-replication-scheduler"),
  // Required by ssb-about, ssb-tangle, etc.
  require("ssb-backlinks"),
  // Required by ssb-room
  require("ssb-conn"),
  shuffle([
    require("ssb-about"),
    require("ssb-blobs"),
    require("ssb-invite"),
    require("ssb-lan"),
    require("ssb-logging"),
    require("ssb-meme"),
    require("ssb-no-auth"),
    require("ssb-onion"),
    require("ssb-ooo"),
    require("ssb-plugins"),
    require("ssb-private1"),
    require("ssb-query"),
    require("ssb-room/tunnel/client"),
    require("ssb-search"),
    require("ssb-tangle"),
    require("ssb-unix-socket"),
    require("ssb-ws"),
  ]),
];

module.exports = (config) => {
  const server = stack();

  // TODO: Move this out of the main function.
  const walk = (input) => {
    if (Array.isArray(input)) {
      input.forEach(walk);
    } else {
      debug(input.name || "???");
      server.use(input);
    }
  };

  walk(plugins);

  return server({ ...ssbConfig, ...config });
};
