const { a, em, strong } = require("hyperaxe");

module.exports = {
  en: {
    // navbar items
    extended: "Extended",
    extendedDescription: [
      "Posts from ",
      strong("people you don't follow"),
      ", sorted by recency. When you follow someone you may download messages from the people they follow, and those messages show up here."
    ],
    popular: "Popular",
    popularDescription: [
      "Posts from people you follow, sorted by ",
      strong("hearts"),
      " in a given period. Hearts are counted from ",
      em("everyone"),
      ", including people you don't follow, so this shows posts from your friends that are popular in your extended network."
    ],
    latest: "Latest",
    latestDescription: "Posts from people you follow, sorted by recency.",
    topics: "Topics",
    topicsDescription: [
      strong("Topics"),
      " from people  you follow, sorted by recency. Select the timestamp of any post to see the rest of the thread."
    ],
    summaries: "Summaries",
    summariesDescription: [
      strong("Topics and some comments"),
      " from people  you follow, sorted by recency. Select the timestamp of any post to see the rest of the thread."
    ],
    profile: "Profile",
    manualMode: "Manual Mode",
    mentions: "Mentions",
    mentionsDescription: [
      strong("Posts that mention you"),
      " from ",
      strong("anyone"),
      " sorted by recency. Sometimes people may forget to @mention you, and those posts won't show up here."
    ],
    private: "Private",
    privateDescription: [
      "The latest comment from ",
      strong("private threads that include you"),
      ", sorted by recency. Private posts are encrypted for your public key, and have a maximum of 7 recipients. Recipients cannot be added after the thread has started. Select the timestamp to view the full thread."
    ],
    search: "Search",
    settings: "Settings",
    // post actions
    comment: "Comment",
    reply: "Reply",
    json: "JSON",
    // relationships
    unfollow: "Unfollow",
    follow: "Follow",
    relationshipFollowing: "You are following",
    relationshipYou: "This is you",
    relationshipBlocking: "You are blocking",
    relationshipNone: "You are neither following or blocking",
    relationshipConflict: "You are somehow both following and blocking",
    // author view
    viewLikes: "View likes",
    // likes view
    likedBy: "'s likes",
    // composer
    publish: "Publish",
    publishCustomDescription: [
      "Publish a custom message by entering ",
      a({ href: "https://en.wikipedia.org/wiki/JSON" }, "JSON"),
      " below. This may be useful for prototyping or publishing messages that Oasis doesn't support. This message cannot be edited or deleted."
    ],
    commentWarning: [
      " Messages cannot be edited or deleted. To respond to an individual message, select ",
      strong("reply"),
      " instead."
    ],
    commentLabel: ({ publicOrPrivate, markdownUrl }) => [
      "Write a ",
      strong(`${publicOrPrivate} comment`),
      " on this thread with ",
      a({ href: markdownUrl }, "Markdown"),
      "."
    ],
    publishLabel: ({ markdownUrl, linkTarget }) => [
      "Write a new message in ",
      a(
        {
          href: markdownUrl,
          target: linkTarget
        },
        "Markdown"
      ),
      ". Messages cannot be edited or deleted."
    ],
    publishCustomInfo: ({ href }) => [
      "If you're an advanced user, you can also ",
      a({ href }, "publish a custom message"),
      "."
    ],
    publishBasicInfo: ({ href }) => [
      "If you're not an advanced user, you should ",
      a({ href }, "publish a basic post"),
      "."
    ],
    publishCustom: "Publish custom",

    replyLabel: ({ markdownUrl }) => [
      "Write a ",
      strong("public reply"),
      " to this message with ",
      a({ href: markdownUrl }, "Markdown"),
      ". Messages cannot be edited or deleted. To respond to an entire thread, select ",
      strong("comment"),
      " instead."
    ],
    // settings
    settingsIntro: ({ readmeUrl, version }) => [
      `You're using Oasis ${version}. Check out `,
      a({ href: readmeUrl }, "the readme"),
      ", configure your theme, or view debugging information below."
    ],
    theme: "Theme",
    themeIntro:
      "Choose from any theme you'd like. The default theme is Atelier-SulphurPool-Light.",
    setTheme: "Set theme",
    language: "Language",
    languageDescription:
      "If you'd like to use Oasis in another language, choose one below. Please be aware that this is very new and very basic. We'd love your help translating Oasis to other languages and locales.",
    setLanguage: "Set language",

    status: "Status",
    peerConnections: "Peer Connections 💻⚡️💻",
    connectionsIntro:
      "Your computer is syncing data with these other computers. It will connect to any scuttlebutt pub and peer it can find, even if you have no relationship with them, as it looks for data from your friends.",
    noConnections: "No peers connected.",
    connectionActionIntro:
      "You can decide when you want your computer to network with peers. You can start, stop, or restart your networking whenever you'd like.",
    startNetworking: "Start networking",
    stopNetworking: "Stop networking",
    restartNetworking: "Restart networking",
    indexes: "Indexes",
    invites: "Invites",
    invitesDescription:
      "Redeem an invite by pasting it below. If it works, you'll follow the feed and they'll follow you back.",
    acceptInvite: "Accept invite",
    // search page
    searchLabel: "Add word(s) to look for in downloaded messages.",
    // posts and comments
    commentDescription: ({ parentUrl }) => [
      "commented on ",
      a({ href: parentUrl }, " thread")
    ],
    replyDescription: ({ parentUrl }) => [
      "replied to ",
      a({ href: parentUrl }, " message")
    ],
    mysteryDescription: "posted a mysterious message",
    // misc
    oasisDescription: "Friendly neighborhood scuttlebutt interface",
    submit: "Submit"
  },
  /* spell-checker: disable */
  es: {
    popular: "Popular",
    latest: "Nuevo",
    profile: "Pagina",
    search: "Buscar",
    settings: "Reglas"
  }
};
