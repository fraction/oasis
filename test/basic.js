// HACK: Prevent Oasis from opening the web browser.
process.argv.push("--no-open", "--offline");
process.env.OASIS_TEST = true;

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

tap.test("edit profile", (t) => {
  supertest(app)
    .post("/profile/edit")
    .field("name", "allison-wonderland")
    .field("description", "example description **published**")
    .attach("image", __filename)
    .set("Referer", "http://localhost:3000/")
    .set("Host", "localhost")
    .expect(302)
    .end(t.end);
});

tap.test("preview", (t) => {
  supertest(app)
    .post("/publish/preview")
    .field("text", "example message **previewed**")
    .field("contentWarning", "")
    .set("Referer", "http://localhost:3000/")
    .set("Host", "localhost")
    .expect(200)
    .expect(({ text }) =>
      text.includes("example message <strong>previewed</strong>")
    )
    .end(t.end);
});

tap.test("publish", (t) => {
  supertest(app)
    .post("/publish")
    .field("text", "example message **published**")
    .set("Referer", "http://localhost:3000/")
    .set("Host", "localhost")
    .expect(302)
    .end(t.end);
});

tap.test("profile", (t) => {
  supertest(app)
    .get("/profile")
    .set("Host", "localhost")
    .expect(200)
    .expect(({ text }) => text.includes("allison-wonderland"))
    .expect(({ text }) =>
      text.includes("example description <strong>published</strong>")
    )
    .expect(({ text }) =>
      text.includes("example message <strong>published</strong>")
    )
    .end(t.end);
});

tap.test("DNS rebind attack fails", (t) => {
  supertest(app)
    .get("/inbox")
    .set("Host", "example.com")
    .expect(400)
    .end(t.end);
});

tap.test("CSRF attack should fail with no referer", (t) => {
  supertest(app).post("/conn/settings/stop").expect(400).end(t.end);
});

tap.test("CSRF attack should fail with wrong referer", (t) => {
  supertest(app)
    .post("/conn/settings/stop")
    .set("Host", "example.com")
    .expect(400)
    .end(t.end);
});

paths.forEach((path) => {
  tap.test(path, (t) => {
    supertest(app).get(path).set("Host", "localhost").expect(200).end(t.end);
  });
});

// HACK: This closes the database.
tap.teardown(() => {
  app.close();
  app._close();
});
