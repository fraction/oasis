// HACK: Prevent Oasis from opening the web browser.
process.argv.push("--no-open", "--offline");

const app = require("../src");
const supertest = require("supertest");
const tap = require("tap");

// TODO: Generate programmatically?
const paths = [
  "/inbox",
  "/mentions",
  "/profile",
  "/profile/edit",
  "/public/latest",
  "/public/latest/extended",
  "/public/latest/summaries",
  "/public/latest/threads",
  "/public/latest/topics",
  "/public/popular/day",
  "/public/popular/week",
  "/publish",
  "/publish/custom",
  "/search",
  "/search?query=foo",
  "/settings",
  "/settings/readme",
];

tap.setTimeout(0);

paths.forEach((path) => {
  tap.test(path, (t) => {
    t.plan(1);
    supertest
      .agent(app)
      .host("localhost") // supertest workaround
      .get(path)
      .expect(200)
      .end((err) => {
        console.log(path);
        t.error(err);
      });
  });
});

// HACK: This closes the database.
tap.teardown(() => {
  app.close();
  app._close();
});
