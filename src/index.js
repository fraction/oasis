#!/usr/bin/env node

"use strict";

// Koa application to provide HTTP interface.

const cli = require("./cli");
const config = cli();

if (config.debug) {
  process.env.DEBUG = "oasis,oasis:*";
}

process.on("uncaughtException", function(err) {
  // This isn't `err.code` because TypeScript doesn't like that.
  if (err["code"] === "EADDRINUSE") {
    const url = `http://${config.host}:${config.port}`;

    throw new Error(
      `Another server is already running at ${url}.
It might be another copy of Oasis or another program on your computer.
You can run Oasis on a different port number with this option:

    oasis --port ${config.port + 1}
`
    );
  } else {
    throw err;
  }
});

// HACK: We must get the CLI config and then delete environment variables.
// This hides arguments from other upstream modules who might parse them.
//
// Unfortunately some modules think that our CLI options are meant for them,
// and since there's no way to disable that behavior (!) we have to hide them
// manually by setting the args property to an empty array.
process.argv = [];

const http = require("./http");

const debug = require("debug")("oasis");
const fs = require("fs").promises;
const koaBody = require("koa-body");
const { nav, ul, li, a } = require("hyperaxe");
const open = require("open");
const path = require("path");
const pull = require("pull-stream");
const requireStyle = require("require-style");
const router = require("koa-router")();
const ssbMentions = require("ssb-mentions");
const ssbRef = require("ssb-ref");
const isSvg = require("is-svg");
const { themeNames } = require("@fraction/base16-css");
const { isFeed, isMsg, isBlob } = require("ssb-ref");

const ssb = require("./ssb");

// Create "cooler"-style interface from SSB connection.
// This handle is passed to the models for their convenience.
const cooler = ssb({ offline: config.offline });

const { about, blob, friend, meta, post, vote } = require("./models")({
  cooler,
  isPublic: config.public
});

const {
  authorView,
  commentView,
  extendedView,
  latestView,
  likesView,
  listView,
  markdownView,
  mentionsView,
  popularView,
  privateView,
  publishCustomView,
  publishView,
  replyView,
  searchView,
  setLanguage,
  settingsView,
  topicsView,
  summaryView
} = require("./views");

let sharp;

try {
  sharp = require("sharp");
} catch (e) {
  // Optional dependency
}

const defaultTheme = "atelier-sulphurPool-light".toLowerCase();

const readmePath = path.join(__dirname, "..", "README.md");
const packagePath = path.join(__dirname, "..", "package.json");

fs.readFile(readmePath, "utf8").then(text => {
  config.readme = text;
});

fs.readFile(packagePath, "utf8").then(text => {
  config.version = JSON.parse(text).version;
});

router
  .param("imageSize", (imageSize, ctx, next) => {
    const size = Number(imageSize);
    const isInteger = size % 1 === 0;
    const overMinSize = size > 2;
    const underMaxSize = size <= 256;
    ctx.assert(isInteger && overMinSize && underMaxSize, "Invalid image size");
    return next();
  })
  .param("blobId", (blobId, ctx, next) => {
    ctx.assert(ssbRef.isBlob(blobId), 400, "Invalid blob link");
    return next();
  })
  .param("message", (message, ctx, next) => {
    ctx.assert(ssbRef.isMsg(message), 400, "Invalid message link");
    return next();
  })
  .param("feed", (message, ctx, next) => {
    ctx.assert(ssbRef.isFeedId(message), 400, "Invalid feed link");
    return next();
  })
  .get("/", async ctx => {
    ctx.redirect("/public/popular/day");
  })
  .get("/robots.txt", ctx => {
    ctx.body = "User-agent: *\nDisallow: /";
  })
  .get("/public/popular/:period", async ctx => {
    const { period } = ctx.params;
    const publicPopular = async ({ period }) => {
      const messages = await post.popular({ period });

      const option = somePeriod => {
        const lowerPeriod = somePeriod.toLowerCase();
        return li(
          period === lowerPeriod
            ? a({ class: "current", href: `./${lowerPeriod}` }, somePeriod)
            : a({ href: `./${lowerPeriod}` }, somePeriod)
        );
      };

      const prefix = nav(
        ul(option("Day"), option("Week"), option("Month"), option("Year"))
      );

      return popularView({
        messages,
        prefix
      });
    };
    ctx.body = await publicPopular({ period });
  })
  .get("/public/latest", async ctx => {
    const messages = await post.latest();
    ctx.body = await latestView({ messages });
  })
  .get("/public/latest/extended", async ctx => {
    const messages = await post.latestExtended();
    ctx.body = await extendedView({ messages });
  })
  .get("/public/latest/topics", async ctx => {
    const messages = await post.latestTopics();
    ctx.body = await topicsView({ messages });
  })
  .get("/public/latest/summaries", async ctx => {
    const messages = await post.latestSummaries();
    ctx.body = await summaryView({ messages });
  })
  .get("/author/:feed", async ctx => {
    const { feed } = ctx.params;
    const author = async feedId => {
      const description = await about.description(feedId);
      const name = await about.name(feedId);
      const image = await about.image(feedId);
      const messages = await post.fromPublicFeed(feedId);
      const relationship = await friend.getRelationship(feedId);

      const avatarUrl = `/image/256/${encodeURIComponent(image)}`;

      return authorView({
        feedId,
        messages,
        name,
        description,
        avatarUrl,
        relationship
      });
    };
    ctx.body = await author(feed);
  })
  .get("/search/", async ctx => {
    let { query } = ctx.query;

    if (isMsg(query)) {
      return ctx.redirect(`/thread/${encodeURIComponent(query)}`);
    }
    if (isFeed(query)) {
      return ctx.redirect(`/author/${encodeURIComponent(query)}`);
    }
    if (isBlob(query)) {
      return ctx.redirect(`/blob/${encodeURIComponent(query)}`);
    }

    if (typeof query === "string") {
      // https://github.com/ssbc/ssb-search/issues/7
      query = query.toLowerCase();
    }

    const messages = await post.search({ query });

    ctx.body = await searchView({ messages, query });
  })
  .get("/inbox", async ctx => {
    const inbox = async () => {
      const messages = await post.inbox();

      return privateView({ messages });
    };
    ctx.body = await inbox();
  })
  .get("/hashtag/:channel", async ctx => {
    const { channel } = ctx.params;
    const hashtag = async channel => {
      const messages = await post.fromHashtag(channel);

      return listView({ messages });
    };
    ctx.body = await hashtag(channel);
  })
  .get("/theme.css", ctx => {
    const theme = ctx.cookies.get("theme") || defaultTheme;

    const packageName = "@fraction/base16-css";
    const filePath = `${packageName}/src/base16-${theme}.css`;
    ctx.type = "text/css";
    ctx.body = requireStyle(filePath);
  })
  .get("/profile/", async ctx => {
    const profile = async () => {
      const myFeedId = await meta.myFeedId();

      const description = await about.description(myFeedId);
      const name = await about.name(myFeedId);
      const image = await about.image(myFeedId);

      const messages = await post.fromPublicFeed(myFeedId);

      const avatarUrl = `/image/256/${encodeURIComponent(image)}`;

      return authorView({
        feedId: myFeedId,
        messages,
        name,
        description,
        avatarUrl,
        relationship: null
      });
    };
    ctx.body = await profile();
  })
  .get("/publish/custom/", async ctx => {
    ctx.body = await publishCustomView();
  })
  .get("/json/:message", async ctx => {
    if (config.public) {
      throw new Error(
        "Sorry, many actions are unavailable when Oasis is running in public mode. Please run Oasis in the default mode and try again."
      );
    }
    const { message } = ctx.params;
    ctx.type = "application/json";
    const json = async message => {
      const json = await meta.get(message);
      return JSON.stringify(json, null, 2);
    };
    ctx.body = await json(message);
  })
  .get("/blob/:blobId", async ctx => {
    const { blobId } = ctx.params;
    const getBlob = async ({ blobId }) => {
      const bufferSource = await blob.get({ blobId });

      debug("got buffer source");
      return new Promise(resolve => {
        pull(
          bufferSource,
          pull.collect(async (err, bufferArray) => {
            if (err) {
              await blob.want({ blobId });
              resolve(Buffer.alloc(0));
            } else {
              const buffer = Buffer.concat(bufferArray);
              resolve(buffer);
            }
          })
        );
      });
    };

    const buffer = await getBlob({ blobId });
    ctx.body = buffer;

    if (ctx.body.length === 0) {
      ctx.response.status = 404;
    } else {
      ctx.set("Cache-Control", "public,max-age=31536000,immutable");
    }

    // This prevents an auto-download when visiting the URL.
    ctx.attachment(blobId, { type: "inline" });

    // If we don't do this explicitly the browser downloads the SVG and thinks
    // that it's plain XML, so it doesn't render SVG files correctly. Note that
    // this library is **not a full SVG parser**, and may cause false positives
    // in the case of malformed XML like `<svg><div></svg>`.
    if (isSvg(buffer)) {
      ctx.type = "image/svg+xml";
    }
  })
  .get("/image/:imageSize/:blobId", async ctx => {
    const { blobId, imageSize } = ctx.params;
    if (sharp) {
      ctx.type = "image/png";
    }

    const fakePixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64"
    );

    const fakeImage = imageSize =>
      sharp
        ? sharp({
            create: {
              width: imageSize,
              height: imageSize,
              channels: 4,
              background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0.5
              }
            }
          })
            .png()
            .toBuffer()
        : new Promise(resolve => resolve(fakePixel));

    const image = async ({ blobId, imageSize }) => {
      const bufferSource = await blob.get({ blobId });
      const fakeId = "&0000000000000000000000000000000000000000000=.sha256";

      debug("got buffer source");
      return new Promise(resolve => {
        if (blobId === fakeId) {
          debug("fake image");
          fakeImage(imageSize).then(result => resolve(result));
        } else {
          debug("not fake image");
          pull(
            bufferSource,
            pull.collect(async (err, bufferArray) => {
              if (err) {
                await blob.want({ blobId });
                const result = fakeImage(imageSize);
                debug({ result });
                resolve(result);
              } else {
                const buffer = Buffer.concat(bufferArray);

                if (sharp) {
                  sharp(buffer)
                    .resize(imageSize, imageSize)
                    .png()
                    .toBuffer()
                    .then(data => {
                      resolve(data);
                    });
                } else {
                  resolve(buffer);
                }
              }
            })
          );
        }
      });
    };
    ctx.body = await image({ blobId, imageSize: Number(imageSize) });
  })
  .get("/settings/", async ctx => {
    const theme = ctx.cookies.get("theme") || defaultTheme;
    const getMeta = async ({ theme }) => {
      const status = await meta.status();
      const peers = await meta.peers();
      const peersWithNames = await Promise.all(
        peers.map(async ([key, value]) => {
          value.name = await about.name(value.key);
          return [key, value];
        })
      );

      return settingsView({
        status,
        peers: peersWithNames,
        theme,
        themeNames,
        version: config.version
      });
    };
    ctx.body = await getMeta({ theme });
  })
  .get("/likes/:feed", async ctx => {
    const { feed } = ctx.params;
    const likes = async ({ feed }) => {
      const pendingMessages = post.likes({ feed });
      const pendingName = about.name(feed);
      return likesView({
        messages: await pendingMessages,
        feed,
        name: await pendingName
      });
    };
    ctx.body = await likes({ feed });
  })
  .get("/settings/readme/", async ctx => {
    const status = async text => {
      return markdownView({ text });
    };
    ctx.body = await status(config.readme);
  })
  .get("/mentions/", async ctx => {
    const mentions = async () => {
      const messages = await post.mentionsMe();

      return mentionsView({ messages });
    };
    ctx.body = await mentions();
  })
  .get("/thread/:message", async ctx => {
    const { message } = ctx.params;
    const thread = async message => {
      const messages = await post.fromThread(message);
      debug("got %i messages", messages.length);

      return listView({ messages });
    };

    ctx.body = await thread(message);
  })
  .get("/reply/:message", async ctx => {
    const { message } = ctx.params;
    const reply = async parentId => {
      const rootMessage = await post.get(parentId);
      const myFeedId = await meta.myFeedId();

      debug("%O", rootMessage);
      const messages = [rootMessage];

      return replyView({ messages, myFeedId });
    };
    ctx.body = await reply(message);
  })
  .get("/publish", async ctx => {
    ctx.body = await publishView();
  })
  .get("/comment/:message", async ctx => {
    const { message } = ctx.params;
    const comment = async parentId => {
      const parentMessage = await post.get(parentId);
      const myFeedId = await meta.myFeedId();

      const hasRoot =
        typeof parentMessage.value.content.root === "string" &&
        ssbRef.isMsg(parentMessage.value.content.root);
      const hasFork =
        typeof parentMessage.value.content.fork === "string" &&
        ssbRef.isMsg(parentMessage.value.content.fork);

      const rootMessage = hasRoot
        ? hasFork
          ? parentMessage
          : await post.get(parentMessage.value.content.root)
        : parentMessage;

      const messages = await post.threadReplies(rootMessage.key);

      messages.push(rootMessage);

      return commentView({ messages, myFeedId, parentMessage });
    };
    ctx.body = await comment(message);
  })
  .post("/reply/:message", koaBody(), async ctx => {
    const { message } = ctx.params;
    const text = String(ctx.request.body.text);
    const publishReply = async ({ message, text }) => {
      // TODO: rename `message` to `parent` or `ancestor` or similar
      const mentions =
        ssbMentions(text).filter(mention => mention != null) || undefined;

      const parent = await post.get(message);
      return post.reply({
        parent,
        message: { text, mentions }
      });
    };
    ctx.body = await publishReply({ message, text });
    ctx.redirect(`/thread/${encodeURIComponent(message)}`);
  })
  .post("/comment/:message", koaBody(), async ctx => {
    const { message } = ctx.params;
    const text = String(ctx.request.body.text);
    const publishComment = async ({ message, text }) => {
      // TODO: rename `message` to `parent` or `ancestor` or similar
      const mentions =
        ssbMentions(text).filter(mention => mention != null) || undefined;
      const parent = await meta.get(message);

      return post.comment({
        parent,
        message: { text, mentions }
      });
    };
    ctx.body = await publishComment({ message, text });
    ctx.redirect(`/thread/${encodeURIComponent(message)}`);
  })
  .post("/publish/", koaBody(), async ctx => {
    const text = String(ctx.request.body.text);
    const rawContentWarning = String(ctx.request.body.contentWarning);

    // Only submit content warning if it's a string with non-zero length.
    const contentWarning =
      rawContentWarning.length > 0 ? rawContentWarning : undefined;

    const publish = async ({ text, contentWarning }) => {
      const mentions =
        ssbMentions(text).filter(mention => mention != null) || undefined;

      return post.root({
        text,
        mentions,
        contentWarning
      });
    };
    ctx.body = await publish({ text, contentWarning });
    ctx.redirect("/public/latest");
  })
  .post("/publish/custom", koaBody(), async ctx => {
    const text = String(ctx.request.body.text);
    const obj = JSON.parse(text);
    ctx.body = await post.publishCustom(obj);
    ctx.redirect(`/public/latest`);
  })
  .post("/follow/:feed", koaBody(), async ctx => {
    const { feed } = ctx.params;
    const referer = new URL(ctx.request.header.referer);
    ctx.body = await friend.follow(feed);
    ctx.redirect(referer);
  })
  .post("/unfollow/:feed", koaBody(), async ctx => {
    const { feed } = ctx.params;
    const referer = new URL(ctx.request.header.referer);
    ctx.body = await friend.unfollow(feed);
    ctx.redirect(referer);
  })
  .post("/like/:message", koaBody(), async ctx => {
    const { message } = ctx.params;
    // TODO: convert all so `message` is full message and `messageKey` is key
    const messageKey = message;

    const voteValue = Number(ctx.request.body.voteValue);

    const encoded = {
      message: encodeURIComponent(message)
    };

    const referer = new URL(ctx.request.header.referer);
    referer.hash = `centered-footer-${encoded.message}`;

    const like = async ({ messageKey, voteValue }) => {
      const value = Number(voteValue);
      const message = await post.get(messageKey);

      const isPrivate = message.value.meta.private === true;
      const messageRecipients = isPrivate ? message.value.content.recps : [];

      const normalized = messageRecipients.map(recipient => {
        if (typeof recipient === "string") {
          return recipient;
        }

        if (typeof recipient.link === "string") {
          return recipient.link;
        }

        return null;
      });

      const recipients = normalized.length > 0 ? normalized : undefined;

      return vote.publish({ messageKey, value, recps: recipients });
    };
    ctx.body = await like({ messageKey, voteValue });
    ctx.redirect(referer);
  })
  .post("/theme.css", koaBody(), async ctx => {
    const theme = String(ctx.request.body.theme);
    ctx.cookies.set("theme", theme);
    const referer = new URL(ctx.request.header.referer);
    ctx.redirect(referer);
  })
  .post("/language", koaBody(), async ctx => {
    const language = String(ctx.request.body.language);
    ctx.cookies.set("language", language);
    const referer = new URL(ctx.request.header.referer);
    ctx.redirect(referer);
  })
  .post("/settings/conn/start", koaBody(), async ctx => {
    await meta.connStart();
    ctx.redirect("/settings");
  })
  .post("/settings/conn/stop", koaBody(), async ctx => {
    await meta.connStop();
    ctx.redirect("/settings");
  })
  .post("/settings/conn/restart", koaBody(), async ctx => {
    await meta.connRestart();
    ctx.redirect("/settings");
  })
  .post("/settings/invite/accept", koaBody(), async ctx => {
    const invite = String(ctx.request.body.invite);
    await meta.acceptInvite(invite);
    ctx.redirect("/settings");
  });

const { host } = config;
const { port } = config;

const routes = router.routes();

const middleware = [
  async (ctx, next) => {
    if (config.public && ctx.method !== "GET") {
      throw new Error(
        "Sorry, many actions are unavailable when Oasis is running in public mode. Please run Oasis in the default mode and try again."
      );
    }
    await next();
  },
  async (ctx, next) => {
    const selectedLanguage = ctx.cookies.get("language") || "en";
    setLanguage(selectedLanguage);
    await next();
  },
  routes
];

http({ host, port, middleware });

const uri = `http://${host}:${port}/`;

const isDebugEnabled = debug.enabled;
debug.enabled = true;
debug(`Listening on ${uri}`);
debug.enabled = isDebugEnabled;

if (config.open === true) {
  open(uri);
}
