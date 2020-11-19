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
  "/profile?gt=0",
  "/profile?lt=100",
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

tap.test("DNS rebind attack fails", (t) => {
  t.plan(1);
  supertest(app)
    .get("/inbox")
    .set("Host", "example.com")
    .expect(400)
    .end(t.error);
});

tap.test("CSRF attack should fail with no referer", (t) => {
  t.plan(1);
  supertest(app).post("/conn/settings/stop").expect(400).end(t.error);
});

tap.test("CSRF attack should fail with wrong referer", (t) => {
  t.plan(1);
  supertest(app)
    .post("/conn/settings/stop")
    .set("Host", "example.com")
    .expect(400)
    .end(t.error);
});

paths.forEach((path) => {
  tap.test(path, (t) => {
    t.plan(1);
    supertest(app)
      .get(path)
      .set("Host", "localhost")
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
