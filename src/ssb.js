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
  { scope: "device", transform: "noauth" }
];

const log = (...args) => {
  const isDebugEnabled = debug.enabled;
  debug.enabled = true;
  debug(...args);
  debug.enabled = isDebugEnabled;
};

const rawConnect = () =>
  new Promise((resolve, reject) => {
    ssbClient(null, { remote })
      .then(api => {
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
      })
      .catch(reject);
  });

let handle;

const createConnection = config => {
  handle = new Promise(resolve => {
    rawConnect()
      .then(ssb => {
        log("Using pre-existing Scuttlebutt server instead of starting one");
        resolve(ssb);
      })
      .catch(e => {
        if (e.message !== "could not connect to sbot") {
          throw e;
        }
        log("Initial connection attempt failed");
        log("Starting Scuttlebutt server");

        const server = flotilla(ssbConfig);
        server(config);

        const inProgress = {};
        const maxHops = lodash.get(
          config,
          "friends.hops",
          lodash.get(ssbConfig, "friends.hops", 0)
        );

        const add = address => {
          inProgress[address] = true;
          return () => {
            inProgress[address] = false;
          };
        };

        const connectOrRetry = () => {
          rawConnect()
            .then(ssb => {
              log("Retrying connection to own server");
              ssb.friends.hops().then(hops => {
                pull(
                  ssb.conn.stagedPeers(),
                  pull.drain(x => {
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
                      ssb.conn
                        .connect(address, data)
                        .then(done)
                        .catch(done);
                    });
                  })
                );
              });
              resolve(ssb);
            })
            .catch(e => {
              if (e.message !== "could not connect to sbot") {
                log(e);
              }
              connectOrRetry();
            });
        };

        connectOrRetry();
      });
  });

  return handle;
};

module.exports = ({ offline }) => {
  if (offline) {
    log("Offline mode activated - not connecting to scuttlebutt peers or pubs");
    log(
      "WARNING: offline mode cannot control the behavior of pre-existing servers"
    );
  }

  const config = {
    conn: {
      autostart: !offline
    }
  };

  createConnection(config);

  /**
   * This is "cooler", a tiny interface for opening or reusing an instance of
   * SSB-Client.
   */
  return {
    open() {
      // This has interesting behavior that may be unexpected.
      //
      // If `handle` is already an active [non-closed] connection, return that.
      //
      // If the connection is closed, we need to restart it. It's important to
      // note that if we're depending on an external service (like Patchwork) and
      // that app is closed, then Oasis will seamlessly start its own SSB service.
      return new Promise(resolve => {
        handle.then(ssb => {
          if (ssb.closed) {
            createConnection();
          }
          resolve(handle);
        });
      });
    }
  };
};
