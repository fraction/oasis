#!/usr/bin/env node

"use strict";

// Koa application to provide HTTP interface.

const cli = require("./cli");
const config = cli();

if (config.debug) {
  process.env.DEBUG = "oasis,oasis:*";
}

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
const { themeNames } = require("@fraction/base16-css");

const ssb = require("./ssb");

// Create "cooler"-style interface from SSB connection.
// This handle is passed to the models for their convenience.
const cooler = ssb({ offline: config.offline });

const { about, blob, friend, meta, post, vote } = require("./models")(cooler);

const {
  authorView,
  commentView,
  listView,
  markdownView,
  metaView,
  publicView,
  replyView,
  searchView
} = require("./views");

let sharp;

try {
  sharp = require("sharp");
} catch (e) {
  // Optional dependency
}

const defaultTheme = "atelier-sulphurPool-light".toLowerCase();

// TODO: refactor
const start = async () => {
  const filePath = path.join(__dirname, "..", "README.md");
  config.readme = await fs.readFile(filePath, "utf8");
};
start();

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

      return publicView({
        messages,
        prefix
      });
    };
    ctx.body = await publicPopular({ period });
  })
  .get("/public/latest", async ctx => {
    const publicLatest = async () => {
      const messages = await post.latest();
      return publicView({ messages });
    };
    ctx.body = await publicLatest();
  })
  .get("/author/:feed", async ctx => {
    const { feed } = ctx.params;
    const author = async feedId => {
      const description = await about.description(feedId);
      const name = await about.name(feedId);
      const image = await about.image(feedId);
      const messages = await post.fromFeed(feedId);
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
    const { query } = ctx.query;
    const search = async ({ query }) => {
      if (typeof query === "string") {
        // https://github.com/ssbc/ssb-search/issues/7
        query = query.toLowerCase();
      }

      const messages = await post.search({ query });

      return searchView({ messages, query });
    };
    ctx.body = await search({ query });
  })
  .get("/inbox", async ctx => {
    const inbox = async () => {
      const messages = await post.inbox();

      return listView({ messages });
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

      const messages = await post.fromFeed(myFeedId);

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
  .get("/json/:message", async ctx => {
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
    ctx.body = await getBlob({ blobId });

    if (ctx.body.length === 0) {
      ctx.response.status = 404;
    } else {
      ctx.set("Cache-Control", "public,max-age=31536000,immutable");
    }

    // This prevents an auto-download when visiting the URL.
    ctx.attachment(blobId, { type: "inline" });
  })
  .get("/image/:imageSize/:blobId", async ctx => {
    const { blobId, imageSize } = ctx.params;
    ctx.type = "image/png";
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
  .get("/meta/", async ctx => {
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

      return metaView({ status, peers: peersWithNames, theme, themeNames });
    };
    ctx.body = await getMeta({ theme });
  })
  .get("/likes/:feed", async ctx => {
    const { feed } = ctx.params;

    const likes = async ({ feed }) => {
      const messages = await post.likes({ feed });
      return listView({ messages });
    };
    ctx.body = await likes({ feed });
  })
  .get("/meta/readme/", async ctx => {
    const status = async text => {
      return markdownView({ text });
    };
    ctx.body = await status(config.readme);
  })
  .get("/mentions/", async ctx => {
    const mentions = async () => {
      const messages = await post.mentionsMe();

      return listView({ messages });
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
    const publish = async ({ text }) => {
      const mentions =
        ssbMentions(text).filter(mention => mention != null) || undefined;

      return post.root({
        text,
        mentions
      });
    };
    ctx.body = await publish({ text });
    ctx.redirect("/");
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
  });

const { host } = config;
const { port } = config;
const routes = router.routes();

http({ host, port, routes });

const uri = `http://${host}:${port}/`;

const isDebugEnabled = debug.enabled;
debug.enabled = true;
debug(`Listening on ${uri}`);
debug.enabled = isDebugEnabled;

if (config.open === true) {
  open(uri);
}
