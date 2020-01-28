"use strict";

const debug = require("debug")("oasis");
const ssbMarkdown = require("ssb-markdown");
const highlightJs = require("highlight.js");

const {
  a,
  article,
  button,
  code,
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
  textarea,
  ul
} = require("hyperaxe");

const template = require("./template");
const post = require("./post");

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
    description !== "<p>null</p>\n"
      ? article({ innerHTML: description })
      : null,
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
    div({ class: `theme-demo theme-demo-${base}` })
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
