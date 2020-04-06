// HACK: Prevent Oasis from opening the web browser.
process.argv.push("--no-open", "--offline");

// This test just ensures that Oasis can open and close cleanly.

const app = require("../src");
const tap = require("tap");

tap.plan(1);

tap.ok(app, "app exists");

setImmediate(() => {
  app.close();
  app._close();
});
