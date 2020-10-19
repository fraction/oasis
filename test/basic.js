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
  supertest(app)
    .get("/inbox")
    .set("Host", "example.com")
    .expect(400)
    .end((err) => {
      t.equal(err, null);
      t.end();
    });
});

tap.test("CSRF attack should fail with no referer", (t) => {
  supertest(app).post("/conn/settings/stop").expect(400).end(t.end);
});

tap.test("CSRF attack should fail with wrong referer", (t) => {
  supertest(app)
    .post("/conn/settings/stop")
    .set("Host", "example.com")
    .expect(400)
    .end((err) => {
      t.equal(err, null);
      t.end();
    });
});

paths.forEach((path) => {
  tap.test(path, (t) => {
    supertest(app)
      .get(path)
      .set("Host", "localhost")
      .expect(200)
      .end((err) => {
        t.equal(err, null);
        console.log("done:" + path);
        t.end();
      });
  });
});

// HACK: This closes the database.
tap.teardown(() => {
  app.close();
  app._close();
});
