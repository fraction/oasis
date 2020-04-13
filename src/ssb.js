"use strict";

// This module exports a function that connects to SSB and returns an interface
// to call methods over MuxRPC. It's a thin wrapper around SSB-Client, which is
// a thin wrapper around the MuxRPC module.

const { promisify } = require("util");
const ssbClient = require("ssb-client");
const ssbConfig = require("ssb-config");
const flotilla = require("@fraction/flotilla");
const ssbTangle = require("ssb-tangle");
const debug = require("debug")("oasis");
const path = require("path");
const pull = require("pull-stream");
const lodash = require("lodash");

const socketPath = path.join(ssbConfig.path, "socket");
const publicInteger = ssbConfig.keys.public.replace(".ed25519", "");
const remote = `unix:${socketPath}~noauth:${publicInteger}`;

// This is unnecessary when https://github.com/ssbc/ssb-config/pull/72 is merged
ssbConfig.connections.incoming.unix = [
  { scope: "device", transform: "noauth" },
];

/**
 * @param formatter {string} input
 * @param args {any[]} input
 */
const log = (formatter, ...args) => {
  const isDebugEnabled = debug.enabled;
  debug.enabled = true;
  debug(formatter, ...args);
  debug.enabled = isDebugEnabled;
};

/**
 * @param [options] {object} - options to pass to SSB-Client
 * @returns Promise
 */
const connect = (options) =>
  new Promise((resolve, reject) => {
    const onSuccess = (api) => {
      if (api.tangle === undefined) {
        // HACK: SSB-Tangle isn't available in Patchwork, but we want that
        // compatibility. This code automatically injects SSB-Tangle into our
        // stack so that we don't get weird errors when using Patchwork.
        //
        // See: https://github.com/fraction/oasis/issues/21
        api.tangle = ssbTangle.init(api);

        // MuxRPC supports promises but the raw plugin does not.
        api.tangle.branch = promisify(api.tangle.branch);
      }

      resolve(api);
    };

    ssbClient(null, options).then(onSuccess).catch(reject);
  });

let closing = false;
let serverHandle;

/**
 * Attempts connection over Unix socket, falling back to TCP socket if that
 * fails. If the TCP socket fails, the promise is rejected.
 * @returns Promise
 */
const attemptConnection = () =>
  new Promise((resolve, reject) => {
    connect({ remote })
      .then((ssb) => {
        debug("Connected to existing Scuttlebutt service over Unix socket");
        resolve(ssb);
      })
      .catch((e) => {
        if (closing) return;
        debug("Unix socket failed");
        if (e.message !== "could not connect to sbot") {
          throw e;
        }
        connect()
          .then((ssb) => {
            log("Connected to existing Scuttlebutt service over TCP socket");
            resolve(ssb);
          })
          .catch((e) => {
            if (closing) return;
            debug("TCP socket failed");
            if (e.message !== "could not connect to sbot") {
              throw e;
            }
            reject(new Error("Both connection options failed"));
          });
      });
  });

const ensureConnection = (customConfig) =>
  new Promise((resolve) => {
    attemptConnection()
      .then((ssb) => {
        resolve(ssb);
      })
      .catch(() => {
        debug("Connection attempts to existing Scuttlebutt services failed");
        log("Starting Scuttlebutt service");

        // Start with the default SSB-Config object.
        const server = flotilla(ssbConfig);
        // Adjust with `customConfig`, which declares further preferences.
        serverHandle = server(customConfig);

        // Give the server a moment to start. This is a race condition. :/
        setTimeout(() => {
          attemptConnection()
            .then((ssb) => {
              autoStagePeers({ ssb, config: customConfig });
              resolve(ssb);
            })
            .catch((e) => {
              throw new Error(e);
            });
        }, 100);
      });
  });

const autoStagePeers = ({ ssb, config }) => {
  // TODO: This does not start when Oasis is started in --offline mode, which
  // is great, but if you start Oasis in --offline mode and select 'Start
  // networking' then this doesn't come into play.
  //
  // The right place to fix this is in the scheduler, and this entire function
  // should be replaced by: https://github.com/staltz/ssb-conn/pull/17
  if (config.conn.autostart !== true) {
    return;
  }

  const inProgress = {};
  const maxHops = lodash.get(
    ssbConfig,
    "friends.hops",
    lodash.get(ssbConfig, "friends.hops", 0)
  );

  const add = (address) => {
    inProgress[address] = true;
    return () => {
      inProgress[address] = false;
    };
  };

  ssb.friends.hops().then((hops) => {
    pull(
      ssb.conn.stagedPeers(),
      pull.drain((x) => {
        x.filter(([address, data]) => {
          const notInProgress = inProgress[address] !== true;

          const key = data.key;
          const haveHops = typeof hops[key] === "number";
          const hopValue = haveHops ? hops[key] : Infinity;
          // Negative hops means blocked
          const isNotBlocked = hopValue >= 0;
          const withinHops = isNotBlocked && hopValue <= maxHops;

          return notInProgress && withinHops;
        }).forEach(([address, data]) => {
          const done = add(address);
          debug(
            `Connecting to staged peer at ${
              hops[data.key]
            }/${maxHops} hops: ${address}`
          );
          ssb.conn.connect(address, data).then(done).catch(done);
        });
      })
    );
  });
};

module.exports = ({ offline }) => {
  if (offline) {
    log("Offline mode activated - not connecting to scuttlebutt peers or pubs");
    log(
      "WARNING: offline mode cannot control the behavior of pre-existing servers"
    );
  }

  const customConfig = {
    conn: {
      autostart: !offline,
    },
  };

  let clientHandle;

  /**
   * This is "cooler", a tiny interface for opening or reusing an instance of
   * SSB-Client.
   */
  const cooler = {
    open() {
      // This has interesting behavior that may be unexpected.
      //
      // If `clientHandle` is already an active [non-closed] connection, return that.
      //
      // If the connection is closed, we need to restart it. It's important to
      // note that if we're depending on an external service (like Patchwork) and
      // that app is closed, then Oasis will seamlessly start its own SSB service.
      return new Promise((resolve, reject) => {
        if (clientHandle && clientHandle.closed === false) {
          resolve(clientHandle);
        } else {
          ensureConnection(customConfig).then((ssb) => {
            clientHandle = ssb;
            if (closing) {
              ssb.close();
              reject(new Error("Closing Oasis"));
            } else {
              resolve(ssb);
            }
          });
        }
      });
    },
    close() {
      closing = true;
      if (clientHandle && clientHandle.closed === false) {
        clientHandle.close();
      }
      if (serverHandle) {
        serverHandle.close();
      }
    },
  };

  // Important: This ensures that we have an SSB connection as soon as Oasis
  // starts. If we don't do this, then we don't even attempt an SSB connection
  // until we receive our first HTTP request.
  cooler.open();

  return cooler;
};
