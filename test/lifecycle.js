// HACK: Prevent Oasis from opening the web browser.
process.argv.push("--no-open", "--offline");

// This test just ensures that Oasis can open and close cleanly.

const app = require("../src");
const tap = require("tap");

tap.test("lifecycle", (t) => {
  t.plan(1);
  t.ok(app, "app exists");
});

tap.teardown(() => {
  app.close();
  app._close();
});
