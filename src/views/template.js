"use strict";

const {
  a,
  body,
  head,
  html,
  li,
  link,
  main,
  meta,
  nav,
  title,
  ul
} = require("hyperaxe");

const doctypeString = "<!DOCTYPE html>";

const toAttributes = obj =>
  Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join(", ");

module.exports = (...elements) => {
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
        content: "friendly neighborhood scuttlebutt interface"
      }),
      meta({
        name: "viewport",
        content: toAttributes({ width: "device-width", "initial-scale": 1 })
      })
    ),
    body(
      nav(
        ul(
          li(a({ href: "/" }, "📣 Popular")),
          li(a({ href: "/public/latest" }, "🆕 Latest")),
          li(a({ href: "/public/latest/following" }, "👭 Following")),
          li(a({ href: "/profile" }, "🐱 Profile")),
          li(a({ href: "/mentions" }, "💬 Mentions")),
          li(a({ href: "/inbox" }, "✉️ Private")),
          li(a({ href: "/search" }, "🔍 Search")),
          li(a({ href: "/meta" }, "⚙ Settings"))
        )
      ),
      main({ id: "content" }, elements)
    )
  );

  const result = doctypeString + nodes.outerHTML;

  return result;
};
