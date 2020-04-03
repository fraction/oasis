// HACK: Prevent Oasis from opening the web browser.
process.argv.push("--no-open");

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

tap.plan(paths.length);

paths.map((path) => {
  tap.comment(path);
  supertest(app).get(path).expect(200).end(tap.error);
});

tap.teardown(() => app.close());
