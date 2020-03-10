#!/usr/bin/env node

"use strict";

// Minimum required to get config
const path = require("path");
const envPaths = require("env-paths");
const cli = require("./cli");
const fs = require("fs");

const defaultConfig = {};
const defaultConfigFile = path.join(
  envPaths("oasis", { suffix: "" }).config,
  "/default.json"
);
let haveConfig;

try {
  const defaultConfigOverride = fs.readFileSync(defaultConfigFile, "utf8");
  Object.entries(JSON.parse(defaultConfigOverride)).forEach(([key, value]) => {
    defaultConfig[key] = value;
  });
  haveConfig = true;
} catch (e) {
  if (e.code === "ENOENT") {
    haveConfig = false;
  } else {
    console.log(`There was a problem loading ${defaultConfigFile}`);
    throw e;
  }
}

const config = cli(defaultConfig, defaultConfigFile);
if (config.debug) {
  process.env.DEBUG = "oasis,oasis:*";
}

const nodeHttp = require("http");
const debug = require("debug")("oasis");

const log = (...args) => {
  const isDebugEnabled = debug.enabled;
  debug.enabled = true;
  debug(...args);
  debug.enabled = isDebugEnabled;
};

delete config._;
delete config.$0;

const { host } = config;
const { port } = config;
const url = `http://${host}:${port}`;

if (haveConfig) {
  log(`Configuration read defaults from ${defaultConfigFile}`);
} else {
  log(
    `No configuration file found at ${defaultConfigFile}, using built-in default values.`
  );
}

debug("Current configuration: %O", config);
debug(`You can save the above to ${defaultConfigFile} to make \
these settings the default. See the readme for details.`);

const oasisCheckPath = "/.well-known/oasis";

process.on("uncaughtException", function(err) {
  // This isn't `err.code` because TypeScript doesn't like that.
  if (err["code"] === "EADDRINUSE") {
    nodeHttp.get(url + oasisCheckPath, res => {
      let rawData = "";
      res.on("data", chunk => {
        rawData += chunk;
      });
      res.on("end", () => {
        log(rawData);
        if (rawData === "oasis") {
          log(`Oasis is already running on host ${host} and port ${port}`);
          if (config.open === true) {
            log("Opening link to existing instance of Oasis");
            open(url);
          } else {
            log(
              "Not opening your browser because opening is disabled by your config"
            );
          }
          process.exit(0);
        } else {
          throw new Error(`Another server is already running at ${url}.
It might be another copy of Oasis or another program on your computer.
You can run Oasis on a different port number with this option:

    oasis --port ${config.port + 1}

Alternatively, you can set the default port in ${defaultConfigFile} with:

    {
      "port": ${config.port + 1}
    }
`);
        }
      });
    });
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

const koaBody = require("koa-body");
const { nav, ul, li, a } = require("hyperaxe");
const open = require("open");
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
  editProfileView,
  extendedView,
  latestView,
  likesView,
  threadView,
  hashtagView,
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

fs.promises.readFile(readmePath, "utf8").then(text => {
  config.readme = text;
});

fs.promises.readFile(packagePath, "utf8").then(text => {
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
  .get(oasisCheckPath, ctx => {
    ctx.body = "oasis";
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
      if (query.length > 1 && query.startsWith("#")) {
        const hashtag = query.slice(1);
        return ctx.redirect(`/hashtag/${encodeURIComponent(hashtag)}`);
      }
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
  .get("/hashtag/:hashtag", async ctx => {
    const { hashtag } = ctx.params;
    const messages = await post.fromHashtag(hashtag);

    ctx.body = await hashtagView({ hashtag, messages });
  })
  .get("/theme.css", ctx => {
    const theme = ctx.cookies.get("theme") || defaultTheme;

    const packageName = "@fraction/base16-css";
    const filePath = `${packageName}/src/base16-${theme}.css`;
    ctx.type = "text/css";
    ctx.body = requireStyle(filePath);
  })
  .get("/profile/", async ctx => {
    const myFeedId = await meta.myFeedId();

    const description = await about.description(myFeedId);
    const name = await about.name(myFeedId);
    const image = await about.image(myFeedId);

    const messages = await post.fromPublicFeed(myFeedId);

    const avatarUrl = `/image/256/${encodeURIComponent(image)}`;

    ctx.body = await authorView({
      feedId: myFeedId,
      messages,
      name,
      description,
      avatarUrl,
      relationship: null
    });
  })
  .get("/profile/edit", async ctx => {
    const myFeedId = await meta.myFeedId();
    const description = await about.description(myFeedId);
    const name = await about.name(myFeedId);

    ctx.body = await editProfileView({
      name,
      description
    });
  })
  .post("/profile/edit", koaBody({ multipart: true }), async ctx => {
    const name = String(ctx.request.body.name);
    const description = String(ctx.request.body.description);

    const image = await fs.promises.readFile(ctx.request.files.image.path);
    ctx.body = await post.publishProfileEdit({
      name,
      description,
      image
    });
    ctx.redirect("/profile");
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

      return threadView({ messages });
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
      const mentions = ssbMentions(text) || undefined;

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
      const mentions = ssbMentions(text) || undefined;
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
      const mentions = ssbMentions(text) || undefined;

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
  async (ctx, next) => {
    const ssb = await cooler.open();

    const status = await ssb.status();
    const values = Object.values(status.sync.plugins);
    const totalCurrent = Object.values(status.sync.plugins).reduce(
      (acc, cur) => acc + cur,
      0
    );
    const totalTarget = status.sync.since * values.length;

    const left = totalTarget - totalCurrent;

    // Weird trick to get percentage with 1 decimal place (e.g. 78.9)
    const percent = Math.floor((totalCurrent / totalTarget) * 1000) / 10;
    const mebibyte = 1024 * 1024;

    if (left > mebibyte) {
      throw new Error(`Sorry, Oasis has only processed ${percent}% of the messages and needs to catch up.
       Thanks for your patience, please wait for a moment and refresh this page to try again.`);
    } else {
      await next();
    }
  },
  routes
];

http({ host, port, middleware });

log(`Listening on ${url}`);

if (config.open === true) {
  open(url);
}
