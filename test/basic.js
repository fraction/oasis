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

// basic blob
tap.test("preview with blob", (t) => {
  // TODO: i bet there must be something like beautfiul soup for nodejs, right?
  let textRe = /hello testworld!/;
  let blobRe = /\[128zeros\]\((&amp;[0-9a-zA-Z]+=.sha256)\)/;
  supertest(app)
    .post("/publish/preview")
    .field("text", "hello testworld!")
    .attach("blob", "test/fixtures/128zeros")
    .set("Referer", "http://localhost/publish/preview")
    .set("Host", "localhost")
    .set("Accept", "text/html")
    .expect(200, textRe)
    .expect((res) => {
      let found = res.text.match(blobRe);
      t.notEqual(found, null, "body did not match blob regexp");
      t.true(found.length >= 1, `expected ${found.length} >= 1`);
      t.equal(
        found[1],
        "&amp;OHI6Ll6KF6p5UNwAggmUTomPaae9EKI8g500HpNf1co=.sha256"
      );
    })
    .end((err) => {
      t.equal(err, null);
      console.log("done: preview with blob");
      t.end();
    });
});

// HACK: This closes the database.
tap.teardown(() => {
  app.close();
  app._close();
});
