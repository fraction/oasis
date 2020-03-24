"use strict";

const md = require("ssb-markdown");
const ssbMessages = require("ssb-msgs");
const ssbRef = require("ssb-ref");
const { span } = require("hyperaxe");

/** @param {{ link: string}[]} mentions */
const toUrl = (mentions) => {
  /** @type {{name: string, link: string}[]} */
  const mentionNames = [];

  /** @param {{ link: string, name: string}} arg */
  const handleLink = ({ name, link }) => {
    if (typeof name === "string") {
      const atName = name.charAt(0) === "@" ? name : `@${name}`;
      mentionNames.push({ name: atName, link });
    }
  };

  ssbMessages.links(mentions, "feed").forEach(handleLink);

  /** @param {string} ref */
  const urlHandler = (ref) => {
    // @mentions
    const found = mentionNames.find(({ name }) => name === ref);
    if (found !== undefined) {
      return `/author/${encodeURIComponent(found.link)}`;
    }

    if (ssbRef.isFeedId(ref)) {
      return `/author/${encodeURIComponent(ref)}`;
    }
    if (ssbRef.isMsgId(ref)) {
      return `/thread/${encodeURIComponent(ref)}`;
    }
    if (ssbRef.isBlobId(ref)) {
      return `/blob/${encodeURIComponent(ref)}`;
    }
    if (ref && ref[0] === "#") {
      return `/hashtag/${encodeURIComponent(ref.substr(1))}`;
    }
    return "";
  };

  return urlHandler;
};

/**
 * @param {string} input
 * @param {{name: string, link: string}[]} mentions
 */
module.exports = (input, mentions = []) =>
  md.block(input, {
    toUrl: toUrl(mentions),
    emoji: (character) => span({ class: "emoji" }, character).outerHTML,
  });
