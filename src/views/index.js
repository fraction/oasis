"use strict";

const debug = require("debug")("oasis");
const ssbMarkdown = require("ssb-markdown");
const highlightJs = require("highlight.js");

const {
  a,
  article,
  body,
  button,
  details,
  div,
  em,
  footer,
  form,
  h1,
  h2,
  h3,
  head,
  header,
  html,
  img,
  input,
  label,
  li,
  link,
  main,
  meta,
  nav,
  option,
  p,
  pre,
  progress,
  section,
  select,
  span,
  summary,
  textarea,
  title,
  ul
} = require("hyperaxe");

const lodash = require("lodash");
const markdown = require("./markdown");

const i18nBase = require("./i18n");
let i18n = null;
let selectedLanguage = null;

exports.setLanguage = language => {
  selectedLanguage = language;
  i18n = Object.assign({}, i18nBase.en, i18nBase[language]);
};

const markdownUrl = "https://commonmark.org/help/";
const doctypeString = "<!DOCTYPE html>";

const toAttributes = obj =>
  Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join(", ");

// non-breaking space
const nbsp = "\xa0";

const navLink = ({ href, emoji, text }) =>
  li(a({ href }, span({ class: "emoji" }, emoji), nbsp, text));

const template = (...elements) => {
  const nodes = html(
    { lang: "en" },
    head(
      title("Oasis"),
      link({ rel: "stylesheet", href: "/theme.css" }),
      link({ rel: "stylesheet", href: "/assets/style.css" }),
      link({ rel: "stylesheet", href: "/assets/highlight.css" }),
      link({ rel: "icon", type: "image/svg+xml", href: "/assets/favicon.svg" }),
      meta({ charset: "utf-8" }),
      meta({
        name: "description",
        content: i18n.oasisDescription
      }),
      meta({
        name: "viewport",
        content: toAttributes({ width: "device-width", "initial-scale": 1 })
      })
    ),
    body(
      nav(
        ul(
          navLink({
            href: "/publish",
            emoji: "📝",
            text: i18n.publish
          }),
          navLink({
            href: "/public/latest/extended",
            emoji: "🗺️",
            text: i18n.extended
          }),
          navLink({ href: "/", emoji: "📣", text: i18n.popular }),
          navLink({ href: "/public/latest", emoji: "🐇", text: i18n.latest }),
          navLink({
            href: "/public/latest/topics",
            emoji: "📖",
            text: i18n.topics
          }),
          navLink({ href: "/profile", emoji: "🐱", text: i18n.profile }),
          navLink({ href: "/mentions", emoji: "💬", text: i18n.mentions }),
          navLink({ href: "/inbox", emoji: "✉️", text: i18n.private }),
          navLink({ href: "/search", emoji: "🔍", text: i18n.search }),
          navLink({ href: "/settings", emoji: "⚙", text: i18n.settings }),
          navLink({ href: "/raw_json", emoji: "👽", text: i18n.manualMode })
        )
      ),
      main({ id: "content" }, elements)
    )
  );

  const result = doctypeString + nodes.outerHTML;

  return result;
};
const post = ({ msg }) => {
  const encoded = {
    key: encodeURIComponent(msg.key),
    author: encodeURIComponent(msg.value.author),
    parent: encodeURIComponent(msg.value.content.root)
  };

  const url = {
    author: `/author/${encoded.author}`,
    likeForm: `/like/${encoded.key}`,
    link: `/thread/${encoded.key}#${encoded.key}`,
    parent: `/thread/${encoded.parent}#${encoded.parent}`,
    avatar: msg.value.meta.author.avatar.url,
    json: `/json/${encoded.key}`,
    reply: `/reply/${encoded.key}`,
    comment: `/comment/${encoded.key}`
  };

  const isPrivate = Boolean(msg.value.meta.private);
  const isRoot = msg.value.content.root == null;
  const isThreadTarget = Boolean(
    lodash.get(msg, "value.meta.thread.target", false)
  );

  // TODO: I think this is actually true for both replies and comments.
  const isReply = Boolean(lodash.get(msg, "value.meta.thread.reply", false));

  const { name } = msg.value.meta.author;
  const timeAgo = msg.value.meta.timestamp.received.since.replace("~", "");

  const depth = lodash.get(msg, "value.meta.thread.depth", 0);

  const markdownContent = markdown(
    msg.value.content.text,
    msg.value.content.mentions
  );

  const hasContentWarning =
    typeof msg.value.content.contentWarning === "string";

  const likeButton = msg.value.meta.voted
    ? { value: 0, class: "liked" }
    : { value: 1, class: null };

  const likeCount = msg.value.meta.votes.length;

  const messageClasses = [];

  if (isPrivate) {
    messageClasses.push("private");
  }

  if (isThreadTarget) {
    messageClasses.push("thread-target");
  }

  if (isReply) {
    // True for comments too, I think
    messageClasses.push("reply");
  }

  const isFork = msg.value.meta.postType === "reply";

  // TODO: Refactor to stop using strings and use constants/symbols.
  const postOptions = {
    post: null,
    comment: i18n.commentDescription({ parentUrl: url.parent }),
    reply: i18n.replyDescription({ parentUrl: url.parent }),
    mystery: i18n.mysteryDescription
  };

  const emptyContent = "<p>undefined</p>\n";
  const articleElement =
    markdownContent === emptyContent
      ? article(
          { class: "content" },
          pre({
            innerHTML: highlightJs.highlight(
              "json",
              JSON.stringify(msg, null, 2)
            ).value
          })
        )
      : article({ class: "content", innerHTML: markdownContent });

  const articleContent = hasContentWarning
    ? details(summary(msg.value.content.contentWarning), articleElement)
    : articleElement;

  const fragment = section(
    {
      id: msg.key,
      class: messageClasses.join(" "),
      style: `margin-left: ${depth}rem;`
    },
    header(
      span(
        { class: "author" },
        a(
          { href: url.author },
          img({ class: "avatar", src: url.avatar, alt: "" }),
          name
        ),
        postOptions[msg.value.meta.postType]
      ),
      span(
        { class: "time" },
        isPrivate ? "🔒" : null,
        a({ href: url.link }, timeAgo)
      )
    ),
    articleContent,

    // HACK: centered-footer
    //
    // Here we create an empty div with an anchor tag that can be linked to.
    // In our CSS we ensure that this gets centered on the screen when we
    // link to this anchor tag.
    //
    // This is used for redirecting users after they like a post, when we
    // want the like button that they just clicked to remain close-ish to
    // where it was before they clicked the button.
    div({ id: `centered-footer-${encoded.key}`, class: "centered-footer" }),

    footer(
      form(
        { action: url.likeForm, method: "post" },
        button(
          {
            name: "voteValue",
            type: "submit",
            value: likeButton.value,
            class: likeButton.class
          },
          `❤ ${likeCount}`
        )
      ),
      a({ href: url.comment }, i18n.comment),
      isPrivate || isRoot || isFork ? null : a({ href: url.reply }, i18n.reply),
      a({ href: url.json }, i18n.json)
    )
  );

  return fragment;
};

exports.authorView = ({
  avatarUrl,
  description,
  feedId,
  messages,
  name,
  relationship
}) => {
  const mention = `[@${name}](${feedId})`;
  const markdownMention = highlightJs.highlight("markdown", mention).value;

  const areFollowing =
    relationship !== null &&
    relationship.following === true &&
    relationship.blocking === false;

  const contactFormType = areFollowing ? i18n.unfollow : i18n.follow;

  const contactForm =
    relationship === null
      ? null // We're on our own profile!
      : form(
          {
            action: `/${contactFormType}/${encodeURIComponent(feedId)}`,
            method: "post"
          },
          button(
            {
              type: "submit"
            },
            contactFormType
          )
        );

  const relationshipText = (() => {
    if (relationship === null) {
      return i18n.relationshipYou;
    } else if (
      relationship.following === true &&
      relationship.blocking === false
    ) {
      return i18n.relationshipFollowing;
    } else if (
      relationship.following === false &&
      relationship.blocking === true
    ) {
      return i18n.relationshipBlocking;
    } else if (
      relationship.following === false &&
      relationship.blocking === false
    ) {
      return i18n.relationshipNone;
    } else if (
      relationship.following === true &&
      relationship.blocking === true
    ) {
      return i18n.relationshipConflict;
    } else {
      throw new Error(`Unknown relationship ${JSON.stringify(relationship)}`);
    }
  })();

  const prefix = section(
    { class: "message" },
    header(
      { class: "profile" },
      img({ class: "avatar", src: avatarUrl }),
      h1(name)
    ),
    pre({
      class: "md-mention",
      innerHTML: markdownMention
    }),
    description !== "" ? article({ innerHTML: markdown(description) }) : null,
    footer(
      a({ href: `/likes/${encodeURIComponent(feedId)}` }, i18n.viewLikes),
      span(relationshipText),
      contactForm
    )
  );

  return template(
    prefix,
    messages.map(msg => post({ msg }))
  );
};

exports.commentView = async ({ messages, myFeedId, parentMessage }) => {
  let markdownMention;

  const messageElements = await Promise.all(
    messages.reverse().map(message => {
      debug("%O", message);
      const authorName = message.value.meta.author.name;
      const authorFeedId = message.value.author;
      if (authorFeedId !== myFeedId) {
        if (message.key === parentMessage.key) {
          const x = `[@${authorName}](${authorFeedId})\n\n`;
          markdownMention = x;
        }
      }
      return post({ msg: message });
    })
  );

  const action = `/comment/${encodeURIComponent(messages[0].key)}`;
  const method = "post";

  const isPrivate = parentMessage.value.meta.private;

  const publicOrPrivate = isPrivate ? "private" : "public";
  const maybeReplyText = isPrivate ? [null] : i18n.commentWarning;

  return template(
    messageElements,
    p(
      ...i18n.commentLabel({ publicOrPrivate, markdownUrl }),
      ...maybeReplyText
    ),
    form(
      { action, method },
      textarea(
        {
          autofocus: true,
          required: true,
          name: "text"
        },
        isPrivate ? null : markdownMention
      ),
      button(
        {
          type: "submit"
        },
        i18n.comment
      )
    )
  );
};

exports.mentionsView = ({ messages }) => {
  return messageListView({
    messages,
    viewTitle: i18n.mentions,
    viewDescription: i18n.mentionsDescription
  });
};

exports.privateView = ({ messages }) => {
  return messageListView({
    messages,
    viewTitle: i18n.private,
    viewDescription: i18n.privateDescription
  });
};

exports.rawJsonView = async () => {
  const action = `/publish_json`;
  const method = "post";

  return template(
    p(
      "Publish any  ",
      a({ href: "https://en.wikipedia.org/wiki/JSON" }, "JSON"),
      " message on your feed. This can be useful for prototyping,",
      " or for doing things that Oasis doesn't support (yet). ",
      "To insert line breaks into strings, use \\n instead of ",
      'just hitting enter, and \\" for quotes.'
    ),
    form(
      { action, method },
      textarea(
        {
          autofocus: true,
          required: true,
          name: "text"
        },
        "{\n",
        '    "type": "test_type",\n',
        '    "your_field_name": "whatever you want!"\n',
        "}"
      ),
      button(
        {
          type: "submit"
        },
        "Publish"
      )
    )
  );
};

exports.listView = ({ messages }) =>
  template(messages.map(msg => post({ msg })));

exports.markdownView = ({ text }) => {
  const rawHtml = ssbMarkdown.block(text);

  return template(section({ class: "message" }, { innerHTML: rawHtml }));
};

exports.publishView = () => {
  const publishForm = "/publish/";

  return template(
    section(
      h1(i18n.publish),
      form(
        { action: publishForm, method: "post" },
        label(
          { for: "text" },
          i18n.publishLabel({ markdownUrl, linkTarget: "_blank" })
        ),
        textarea({ required: true, name: "text" }),
        label({ for: "contentWarning" }, i18n.contentWarningLabel),
        input({
          name: "contentWarning",
          type: "text",
          class: "contentWarning",
          placeholder: "Optional warning for the post"
        }),
        button({ type: "submit" }, i18n.submit)
      )
    )
  );
};

exports.settingsView = ({ status, peers, theme, themeNames }) => {
  const max = status.sync.since;

  const progressElements = Object.entries(status.sync.plugins).map(e => {
    const [key, val] = e;
    const id = `progress-${key}`;
    return div(label({ for: id }, key), progress({ id, value: val, max }, val));
  });

  const startButton = form(
    { action: "/settings/conn/start", method: "post" },
    button({ type: "submit" }, i18n.startNetworking)
  );

  const restartButton = form(
    { action: "/settings/conn/restart", method: "post" },
    button({ type: "submit" }, i18n.restartNetworking)
  );

  const stopButton = form(
    { action: "/settings/conn/stop", method: "post" },
    button({ type: "submit" }, i18n.stopNetworking)
  );

  const connButtons = div({ class: "form-button-group" }, [
    startButton,
    restartButton,
    stopButton
  ]);

  const peerList = (peers || []).map(([, data]) => {
    return li(
      a(
        { href: `/author/${encodeURIComponent(data.key)}` },
        data.name || data.host || data.key
      )
    );
  });

  const themeElements = themeNames.map(cur => {
    const isCurrentTheme = cur === theme;
    if (isCurrentTheme) {
      return option({ value: cur, selected: true }, cur);
    } else {
      return option({ value: cur }, cur);
    }
  });

  const base16 = [
    // '00', removed because this is the background
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "0A",
    "0B",
    "0C",
    "0D",
    "0E",
    "0F"
  ];

  const base16Elements = base16.map(base =>
    div({
      style: {
        "background-color": `var(--base${base})`,
        width: `${(1 / base16.length) * 100}%`,
        height: "1em",
        "margin-top": "1em",
        display: "inline-block"
      }
    })
  );

  const languageOption = (shortName, longName) =>
    shortName === selectedLanguage
      ? option({ value: shortName, selected: true }, longName)
      : option({ value: shortName }, longName);

  return template(
    section(
      { class: "message" },
      h1(i18n.settings),
      p(i18n.settingsIntro({ readmeUrl: "/settings/readme" })),
      h2(i18n.theme),
      p(i18n.themeIntro),
      form(
        { action: "/theme.css", method: "post" },
        select({ name: "theme" }, ...themeElements),
        button({ type: "submit" }, i18n.setTheme)
      ),
      base16Elements,
      h2(i18n.language),
      p(i18n.languageDescription),
      form(
        { action: "/language", method: "post" },
        select({ name: "language" }, [
          languageOption("en", "English"),
          languageOption("es", "Español")
        ]),
        button({ type: "submit" }, i18n.setLanguage)
      ),
      h2(i18n.status),
      h3(i18n.peerConnections),
      p(i18n.connectionsIntro),
      peerList.length > 0 ? ul(peerList) : i18n.noConnections,
      p(i18n.connectionActionIntro),
      connButtons,
      h3(i18n.invites),
      p(i18n.invitesDescription),
      form(
        { action: "/settings/invite/accept", method: "post" },
        input({ name: "invite", type: "text" }),
        button({ type: "submit" }, i18n.acceptInvite)
      ),
      h3(i18n.indexes),
      progressElements
    )
  );
};

const viewInfoBox = ({ viewTitle = null, viewDescription = null }) => {
  if (!viewTitle && !viewDescription) {
    return null;
  }
  return section(
    { class: "viewInfo" },
    viewTitle ? h1(viewTitle) : null,
    viewDescription ? em(viewDescription) : null
  );
};

exports.likesView = async ({ messages, feed, name }) => {
  const authorLink = a(
    { href: `/author/${encodeURIComponent(feed)}` },
    "@" + name
  );

  return template(
    viewInfoBox({
      viewTitle: span(authorLink, i18n.likedBy)
    }),
    messages.map(msg => post({ msg }))
  );
};

const messageListView = ({
  messages,
  prefix = null,
  viewTitle = null,
  viewDescription = null,
  viewElements = null
}) => {
  return template(
    section(h1(viewTitle), p(viewDescription), viewElements),
    messages.map(msg => post({ msg }))
  );
};

exports.popularView = ({ messages, prefix }) => {
  return messageListView({
    messages,
    viewElements: prefix,
    viewTitle: i18n.popular,
    viewDescription: i18n.popularDescription
  });
};

exports.extendedView = ({ messages }) => {
  return messageListView({
    messages,
    viewTitle: i18n.extended,
    viewDescription: i18n.extendedDescription
  });
};

exports.latestView = ({ messages }) => {
  return messageListView({
    messages,
    viewTitle: i18n.latest,
    viewDescription: i18n.latestDescription
  });
};

exports.topicsView = ({ messages }) => {
  return messageListView({
    messages,
    viewTitle: i18n.topics,
    viewDescription: i18n.topicsDescription
  });
};

exports.replyView = async ({ messages, myFeedId }) => {
  const replyForm = `/reply/${encodeURIComponent(
    messages[messages.length - 1].key
  )}`;

  let markdownMention;

  const messageElements = await Promise.all(
    messages.reverse().map(message => {
      debug("%O", message);
      const authorName = message.value.meta.author.name;
      const authorFeedId = message.value.author;
      if (authorFeedId !== myFeedId) {
        if (message.key === messages[0].key) {
          const x = `[@${authorName}](${authorFeedId})\n\n`;
          markdownMention = x;
        }
      }
      return post({ msg: message });
    })
  );

  return template(
    messageElements,
    p(i18n.replyLabel({ markdownUrl })),
    form(
      { action: replyForm, method: "post" },
      textarea(
        {
          autofocus: true,
          required: true,
          name: "text"
        },
        markdownMention
      ),
      button(
        {
          type: "submit"
        },
        i18n.reply
      )
    )
  );
};

exports.searchView = ({ messages, query }) => {
  const searchInput = input({
    name: "query",
    required: false,
    type: "search",
    value: query
  });

  // - Minimum length of 3 because otherwise SSB-Search hangs forever. :)
  //   https://github.com/ssbc/ssb-search/issues/8
  // - Using `setAttribute()` because HyperScript (the HyperAxe dependency has
  //   a bug where the `minlength` property is being ignored. No idea why.
  //   https://github.com/hyperhype/hyperscript/issues/91
  searchInput.setAttribute("minlength", 3);

  return template(
    section(
      h1(i18n.search),
      form(
        { action: "/search", method: "get" },
        label({ for: "query" }, i18n.searchLabel),
        searchInput,
        button(
          {
            type: "submit"
          },
          i18n.submit
        )
      )
    ),
    messages.map(msg => post({ msg }))
  );
};
