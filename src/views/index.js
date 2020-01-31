"use strict";

const debug = require("debug")("oasis");
const ssbMarkdown = require("ssb-markdown");
const highlightJs = require("highlight.js");

const {
  a,
  article,
  button,
  code,
  details,
  div,
  footer,
  form,
  h1,
  h2,
  h3,
  header,
  img,
  input,
  label,
  li,
  option,
  p,
  pre,
  progress,
  section,
  select,
  span,
  strong,
  summary,
  textarea,
  ul
} = require("hyperaxe");

const template = require("./template");
const markdown = require("./markdown");

const lodash = require("lodash");

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

  const postOptions = {
    post: null,
    comment: ["commented on ", a({ href: url.parent }, " thread")],
    reply: ["replied to ", a({ href: url.parent }, " message")],
    mystery: "posted a mysterious message"
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
      a({ href: url.comment }, "Comment"),
      isPrivate || isRoot || isFork ? null : a({ href: url.reply }, "Reply"),
      a({ href: url.json }, "JSON")
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

  const areFollowing = relationship === "You are following";

  const contactFormType = areFollowing ? "Unfollow" : "Follow";

  // We're on our own profile!
  const contactForm =
    relationship !== null
      ? form(
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
        )
      : null;

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
      a({ href: `/likes/${encodeURIComponent(feedId)}` }, "View likes"),
      span(relationship),
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
  const maybeReplyText = isPrivate
    ? null
    : [
        " Messages cannot be edited or deleted. To respond to an individual message, select ",
        strong("reply"),
        " instead."
      ];

  return template(
    messageElements,
    p(
      "Write a ",
      strong(`${publicOrPrivate} comment`),
      " on this thread with ",
      a({ href: "https://commonmark.org/help/" }, "Markdown"),
      ".",
      maybeReplyText
    ),
    form(
      { action, method },
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
        "Comment"
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

exports.metaView = ({ status, peers, theme, themeNames }) => {
  const max = status.sync.since;

  const progressElements = Object.entries(status.sync.plugins).map(e => {
    const [key, val] = e;
    const id = `progress-${key}`;
    return div(label({ for: id }, key), progress({ id, value: val, max }, val));
  });

  const startButton = form(
    { action: "/meta/conn/start", method: "post" },
    button({ type: "submit" }, "Start networking")
  );

  const restartButton = form(
    { action: "/meta/conn/restart", method: "post" },
    button({ type: "submit" }, "Restart networking")
  );

  const stopButton = form(
    { action: "/meta/conn/stop", method: "post" },
    button({ type: "submit" }, "Stop networking")
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

  return template(
    section(
      { class: "message" },
      h1("Meta"),
      p(
        "Check out ",
        a({ href: "/meta/readme" }, "the readme"),
        ", configure your theme, or view debugging information below."
      ),
      h2("Theme"),
      p(
        "Choose from any theme you'd like. The default theme is Atelier-SulphurPool-Light."
      ),
      form(
        { action: "/theme.css", method: "post" },
        select({ name: "theme" }, ...themeElements),
        button({ type: "submit" }, "Set theme")
      ),
      base16Elements,
      h2("Status"),
      h3("Peer Connections 💻⚡️💻"),
      p(
        "Your computer is syncing data with these other computers. It will connect to any scuttlebutt pub and peer it can find, even if you have no relationship with them, as it looks for data from your friends."
      ),
      peerList.length > 0 ? ul(peerList) : code("no peers connected"),
      p(
        "You can decide when you want your computer to network with peers. You can start, stop, or restart your networking whenever you'd like."
      ),
      connButtons,
      h3("Indexes"),
      progressElements
    )
  );
};

exports.publicView = ({ messages, prefix = null }) => {
  const publishForm = "/publish/";

  return template(
    prefix,
    section(
      header(strong("🌐 Publish")),
      form(
        { action: publishForm, method: "post" },
        label(
          { for: "text" },
          "Write a new message in ",
          a(
            {
              href: "https://commonmark.org/help/",
              target: "_blank"
            },
            "Markdown"
          ),
          ". Messages cannot be edited or deleted."
        ),
        textarea({ required: true, name: "text" }),
        button({ type: "submit" }, "Submit")
      )
    ),
    messages.map(msg => post({ msg }))
  );
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
    p(
      "Write a ",
      strong("public reply"),
      " to this message with ",
      a({ href: "https://commonmark.org/help/" }, "Markdown"),
      ". Messages cannot be edited or deleted. To respond to an entire thread, select ",
      strong("comment"),
      " instead."
    ),
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
        "Reply"
      )
    )
  );
};

exports.searchView = ({ messages, query }) =>
  template(
    section(
      form(
        { action: "/search", method: "get" },
        header(strong("Search")),
        label(
          { for: "query" },
          "Add word(s) to look for in downloaded messages."
        ),
        input({ required: true, type: "search", name: "query", value: query }),
        button(
          {
            type: "submit"
          },
          "Submit"
        )
      )
    ),
    messages.map(msg => post({ msg }))
  );
