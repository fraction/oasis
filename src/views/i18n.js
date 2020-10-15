const { a, em, strong } = require("hyperaxe");

const i18n = {
  en: {
    // navbar items
    extended: "Extended",
    extendedDescription: [
      "Posts from ",
      strong("people you don't follow"),
      ", sorted by recency. When you follow someone you may download messages from the people they follow, and those messages show up here.",
    ],
    popular: "Popular",
    popularDescription: [
      "Posts from people in your network, sorted by ",
      strong("hearts"),
      " in a given period. Hearts are counted from ",
      em("everyone"),
      ", including people you don't follow, so this shows posts from your friends that are popular in your extended network.",
    ],
    latest: "Latest",
    latestDescription:
      "Posts from yourself and people you follow, sorted by recency.",
    topics: "Topics",
    topicsDescription: [
      strong("Topics"),
      " from yourself and people you follow, sorted by recency. Select the timestamp of any post to see the rest of the thread.",
    ],
    summaries: "Summaries",
    summariesDescription: [
      strong("Topics and some comments"),
      " from yourself and people you follow, sorted by recency. Select the timestamp of any post to see the rest of the thread.",
    ],
    threads: "Threads",
    threadsDescription: [
      strong("Posts that have comments"),
      " from people you follow and your extended network, sorted by recency. Select the timestamp of any post to see the rest of the thread.",
    ],
    profile: "Profile",
    manualMode: "Manual Mode",
    mentions: "Mentions",
    mentionsDescription: [
      strong("Posts that mention you"),
      " from ",
      strong("anyone"),
      " sorted by recency. Sometimes people may forget to @mention you, and those posts won't show up here.",
    ],
    private: "Private",
    privateDescription: [
      "The latest comment from ",
      strong("private threads that include you"),
      ", sorted by recency. Private posts are encrypted for your public key, and have a maximum of 7 recipients. Recipients cannot be added after the thread has started. Select the timestamp to view the full thread.",
    ],
    search: "Search",
    imageSearch: "Image Search",
    settings: "Settings",
    // post actions
    comment: "Comment",
    subtopic: "Subtopic",
    json: "JSON",
    // relationships
    unfollow: "Unfollow",
    follow: "Follow",
    block: "Block",
    unblock: "Unblock",
    newerPosts: "Newer posts",
    olderPosts: "Older posts",
    feedRangeEmpty: "The given range is empty for this feed. Try viewing the ",
    seeFullFeed: "full feed",
    feedEmpty: "The local client has never seen posts from this account.",
    beginningOfFeed: "This is the beginning of the feed",
    noNewerPosts: "No newer posts have been received yet.",
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
    attachFiles: "Attach files",
    preview: "Preview",
    publish: "Publish",
    contentWarningPlaceholder: "Optional content warning for this post",
    publishCustomDescription: [
      "Publish a custom message by entering ",
      a({ href: "https://en.wikipedia.org/wiki/JSON" }, "JSON"),
      " below. This may be useful for prototyping or publishing messages that Oasis doesn't support. This message cannot be edited or deleted.",
    ],
    commentWarning: [
      " Published comments cannot be edited or deleted. To respond to an individual message, select ",
      strong("subtopic"),
      " instead.",
    ],
    commentPublic: "public",
    commentPrivate: "private",
    commentLabel: ({ publicOrPrivate, markdownUrl }) => [
      "Write a ",
      strong(`${publicOrPrivate} comment`),
      " on this thread with ",
      a({ href: markdownUrl }, "Markdown"),
      ". Preview shows attached media.",
    ],
    publishLabel: ({ markdownUrl, linkTarget }) => [
      "Write a new public post in ",
      a(
        {
          href: markdownUrl,
          target: linkTarget,
        },
        "Markdown"
      ),
      ". Published posts cannot be edited or deleted. Preview to see attached media before publishing.",
    ],
    publishCustomInfo: ({ href }) => [
      "If you're an advanced user, you can also ",
      a({ href }, "publish a custom message"),
      ".",
    ],
    publishBasicInfo: ({ href }) => [
      "If you're not an advanced user, you should ",
      a({ href }, "publish a post"),
      ".",
    ],
    publishCustom: "Publish custom",

    subtopicLabel: ({ markdownUrl }) => [
      "Create a ",
      strong("public subtopic"),
      " of this message with ",
      a({ href: markdownUrl }, "Markdown"),
      ". Messages cannot be edited or deleted. To respond to an entire thread, select ",
      strong("comment"),
      " instead. Preview shows attached media.",
    ],
    // settings
    settingsIntro: ({ readmeUrl, version }) => [
      `You're using Oasis ${version}. Check out `,
      a({ href: readmeUrl }, "the readme"),
      ", configure your theme, or view debugging information below.",
    ],
    theme: "Theme",
    themeIntro:
      "Choose from any theme you'd like. The default theme is Atelier-SulphurPool-Light. You can also set your theme in the default configuration file.",
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
    sync: "Connect and Sync",
    indexes: "Indexes",
    invites: "Invites",
    invitesDescription:
      "Redeem an invite by pasting it below. If it works, you'll follow the feed and they'll follow you back.",
    acceptInvite: "Accept invite",
    // search page
    searchLabel: "Add word(s) to look for in downloaded messages.",
    // image search page
    imageSearchLabel: "Enter words to search for images labelled with them",
    // posts and comments
    commentDescription: ({ parentUrl }) => [
      " commented on ",
      a({ href: parentUrl }, " thread"),
    ],
    commentTitle: ({ authorName }) => [`Comment on @${authorName}'s message`],
    subtopicDescription: ({ parentUrl }) => [
      " created a subtopic from ",
      a({ href: parentUrl }, " a message"),
    ],
    subtopicTitle: ({ authorName }) => [`Subtopic on @${authorName}'s message`],
    mysteryDescription: "posted a mysterious message",
    // misc
    oasisDescription: "Friendly neighborhood scuttlebutt interface",
    submit: "Submit",
    editProfile: "Edit profile",
    editProfileDescription:
      "Edit your profile with Markdown. Old versions of your profile information still exist and can't be deleted, but most SSB apps don't show them.",
    profileName: "Profile name (plain text)",
    profileImage: "Profile image",
    profileDescription: "Profile description (Markdown)",
    hashtagDescription:
      "Posts from people in your network that reference this hashtag, sorted by recency.",
  },
  /* spell-checker: disable */
  es: {
    latest: "Novedades",
    profile: "Mi Perfil",
    search: "Buscar",
    settings: "Configuración",
    // navbar items
    extended: "Red extendida",
    extendedDescription: [
      "Publicaciones de ",
      strong("personas que no seguís"),
      ", ordenadas por las más recientes. Quando seguís una persona poderás descargar publicaciones de otras personas que esta siga y esos mensajes aparecen aquí.",
    ],
    popular: "Populares",
    popularDescription: [
      "Publicaciones de personas de tu red, ordenadas por cantidad de ",
      strong("Me Gusta"),
      " en determinados periodos. Se cuentan los Me Gusta de ",
      em("todos"),
      ", incluindo aquellos que no seguís. Esta es una lista de publicaciones más populares de tu red de contacto.",
    ],
    latestDescription:
      "Publicaciones que aquellos que seguís, ordenadas por las más recientes.",
    topics: "Topicos",
    topicsDescription: [
      strong("Topicos"),
      " de las personas que seguís, ordenadas por las más recientes. Seleccioná la hora de una publicación para leer el hilo completo.",
    ],
    summaries: "Resumen",
    summariesDescription: [
      strong("Topicos y algunos comentarios"),
      " de las personas que seguís, ordenadas por las más recientes. Seleccioná la hora de una publicación para leer el hilo completo.",
    ],
    manualMode: "Modo manual",
    mentions: "Menciones",
    mentionsDescription: [
      strong("Publicaciones de "),
      strong("cualquier persona"),
      " que te mencionan, ordenadas por las más recientes. Solo figuran menciones en el formato @mención.",
    ],
    private: "Privado",
    privateDescription: [
      "Los comentarios más recientes de ",
      strong("hilos privados que te incluyen"),
      ". Las publicaciones privadas están encriptadas para tu llave privada, y contienen el máximo de 7 destinatarios. No se podrán adicionar nuevos destinarios después que empieze el hilo. Seleccioná la hora de una publicación para leer el hilo completo.",
    ],
    // post actions
    comment: "Comentar",
    reply: "Responder",
    json: "JSON",
    // relationships
    unfollow: "Dejar de seguir",
    follow: "Seguir",
    relationshipFollowing: "Siguiendo",
    relationshipYou: "Vos",
    relationshipBlocking: "Bloqueado",
    relationshipNone: "No estás siguiendo ni bloqueando",
    relationshipConflict: "De alguna forma le estás siguiendo y bloqueando",
    // author view
    viewLikes: "Ver Me Gusta ",
    // likes view
    likedBy: "le gusta",
    // composer
    attachFiles: "Agregar archivos",
    preview: "Vista previa",
    publish: "Publicar",
    contentWarningPlaceholder: "Advertencia opcional para esta publicación",
    publishCustomDescription: [
      "Compone un mensaje custom usando ",
      a({ href: "https://en.wikipedia.org/wiki/JSON" }, "JSON"),
      ". Esto puede ser util para prototipar o componer tipos de mensaje que Oasis aún no soporta. Este mensaje no podrá ser editado o borrado.",
    ],
    commentWarning: [
      " Los mensajes no podrán ser editados o borrados. Para responde a mensajes, seleccione ",
      strong("Responder"),
      ".",
    ],
    commentPublic: "publico",
    commentPrivate: "privado",
    commentLabel: ({ publicOrPrivate, markdownUrl }) => [
      "Escribí un ",
      strong(`${publicOrPrivate} comentário`),
      " con ",
      a({ href: markdownUrl }, "Markdown"),
      " en este hilo.",
    ],
    publishLabel: ({ markdownUrl, linkTarget }) => [
      "Escribí mensaje publico con ",
      a(
        {
          href: markdownUrl,
          target: linkTarget,
        },
        "Markdown"
      ),
      ". Los mensajes no podrán ser editados o borrados.",
    ],
    publishCustomInfo: ({ href }) => [
      "Si sos un usário avanzado, podrás ",
      a({ href }, "publicar un mensaje custom"),
      ".",
    ],
    publishBasicInfo: ({ href }) => [
      "Si no sos un usuário avanzado, podés ",
      a({ href }, "publicar un mensaje basico."),
      ".",
    ],
    publishCustom: "Publicar custom",

    replyLabel: ({ markdownUrl }) => [
      "Escribí una ",
      strong("respuesta publica"),
      " a este mensaje con ",
      a({ href: markdownUrl }, "Markdown"),
      ". Los mensajes no podrán ser editados o borrados. Para responder a todo un hilo, seleccioná ",
      strong("comentário"),
      ".",
    ],
    // settings
    settingsIntro: ({ readmeUrl, version }) => [
      `Estás usando Oasis ${version}. Leé `,
      a({ href: readmeUrl }, "el Readme"),
      ", configura un tema, o consultá información de debug abajo.",
    ],
    theme: "Tema",
    themeIntro:
      "Eligí un tema. Atelier-SulphurPool-Light és el tema por defecto.",
    setTheme: "Eligí el tema",
    language: "Idioma",
    languageDescription:
      "Sí queres usar Oasis en otro idioma, eligí acá. Atención, que esta funcionalidad és aún nueva y básica. Necesitamos ayuda con traducciones para otros idiomas y formatos.",
    setLanguage: "Seleccionar idioma",

    status: "Status",
    peerConnections: "Conexiones de pares 💻⚡️💻",
    connectionsIntro:
      "Tu computadora está sincronizando con las siguientes computadoras. Se conectará con cualquier par de scuttlebutt que encuentre a medida que busque informacion de tus amigos, mismo que no hayas establecido una relación prévia.",
    noConnections: "Sin pares conectados.",
    connectionActionIntro:
      "Podrás decidir cuando conectar tu computadora a la red de pares. Podrás arrancar, detener o reiniciar las conexiones siempre que quieras.",
    startNetworking: "Arrancar las conexiones",
    stopNetworking: "Detener las conexiones",
    restartNetworking: "Reiniciar las conexiones",
    indexes: "Indices",
    invites: "Invitaciones",
    invitesDescription:
      "Utilizá una invitación pegando abajo. Sí funcionar, empezarás a seguir esa persona y ella te seguirá a vós también.",
    acceptInvite: "Aceptar la invitación",
    // search page
    searchLabel:
      "Buscá las siguientes palabras por los mensajes que tenés descargados.",
    // posts and comments
    commentDescription: ({ parentUrl }) => [
      " comentado en el hilo ",
      a({ href: parentUrl }, ""),
    ],
    replyDescription: ({ parentUrl }) => [
      " respondido al ",
      a({ href: parentUrl }, "mensaje "),
    ],
    mysteryDescription: "publicó un mensaje misterioso",
    // misc
    oasisDescription: "Interface del vecinario amistoso scuttlebutt",
    submit: "Enviar",
    editProfile: "Editar perfil",
    editProfileDescription:
      "Editá tu perfil con Markdown. Los mensajes no podrán ser editados o borrados. La información en tu perfil será siempre publico, mismo aquella de versiones antiguas. La mayoria de los clientes de ssb no presentarán versiones antiguas de tu perfil",
    profileName: "Nombre de perfil (texto)",
    profileImage: "Imagen de perfil",
    profileDescription: "Descripción de perfil (Markdown)",
    hashtagDescription:
      "Publicaciones de personas en tu red que mencionan este hashtag, ordenadas por las más recientes.",
  },
  de: {
    extended: "Erweitert",
    extendedDescription: [
      "Beiträge von ",
      strong("Leuten denen du nicht folgst"),
      ", sortiert nach Aktualität. Wenn du jemandem folgst lädst du eventuell auch Beiträge von Leuten herunter denen diese Person folgt, hier erscheinen diese Beiträge.",
    ],
    popular: "Beliebt",
    popularDescription: [
      "Beiträge von Leuten in deinem Netzwerk, sortiert nach ",
      strong("Herzen"),
      " in der angegebenen Periode. Herzen werden von ",
      em("jedem"),
      " gezählt, auch von Personen denen du nicht folgst. D.h. hier werden Beiträge von deinen Freund*innen angezeigt die in deinem erweiterten Netzwerk populär sind.",
    ],
    latest: "Aktuell",
    latestDescription:
      "Beiträge von Leuten denen du folgst, sortiert nach Aktualität.",
    topics: "Themen",
    topicsDescription: [
      strong("Themen"),
      " von Leuten denen du folgst, sortiert nach Aktualität. Klicke auf den Zeitstempel eines Beitrages um den Rest des Threads zu sehen.",
    ],
    summaries: "Übersicht",
    summariesDescription: [
      strong("Themen und einige Kommentare"),
      " von Leuten denen du folgst, sortiert nach Aktualität. Klicke auf den Zeitstempel eines Beitrages um den Rest des Threads zu sehen.",
    ],
    profile: "Profil",
    manualMode: "Manueller Modus",
    mentions: "Erwähnungen",
    mentionsDescription: [
      strong("Beiträge in denen du erwähnt wirst"),
      " von ",
      strong("allen"),
      ", sortiert nach Aktualität. Manchmal vergessen Leute dich zu @erwähnen, diese Beiträge werden hier nicht erscheinen.",
    ],
    private: "Privat",
    privateDescription: [
      "Die letzten Kommentare aus ",
      strong("privaten Threads die dich beinhalten"),
      ", sortiert nach Aktualität. Private Beiträge werden mit deinem öffentlichen Schlüssel verschlüsselt und haben maximal 7 Empfänger*innen. Empfänger*innen können nicht hinzugefügt werden nachdem ein Thread gestartet wurde. Klicke auf den Zeitstämpel um einen komplette Thread anzuzeigen.",
    ],
    search: "Suche",
    settings: "Einstellungen",
    // post actions
    comment: "Kommentieren",
    reply: "Antworten",
    json: "JSON",
    // relationships
    unfollow: "Entfolgen",
    follow: "Folgen",
    relationshipFollowing: "Du folgst",
    relationshipYou: "Das bist du",
    relationshipBlocking: "Du blockierst",
    relationshipNone: "Weder folgst noch blockst du",
    relationshipConflict: "Irgendwie folgst und blockst du gleichzeitig",
    // author view
    viewLikes: "Likes ansehen",
    // likes view
    likedBy: "'s Likes",
    // composer
    attachFiles: "ATTACH FILES",
    preview: "PREVIEW",
    publish: "Veröffentlichen",
    contentWarningPlaceholder: "Optionale Inhaltswarnung für diesen Beitrag",
    publishCustomDescription: [
      "Veröffentliche eine benutzerdefinierte Nachricht durch das Eingeben von ",
      a({ href: "https://en.wikipedia.org/wiki/JSON" }, "JSON"),
      " unten. Dies kann zum Prototyping oder dem veröffentlichen von Nachrichten die Oasis nicht unterstützt nützlich sein. Diese Nachricht kann nicht bearbeitet oder gelöscht werden.",
    ],
    commentWarning: [
      " Nachrichten können nicht bearbeitet oder gelöscht werden. Um auf eine einzelne Nachricht zu antworten, wähle ",
      strong("antworten"),
      " stattdessen.",
    ],
    commentPublic: "öffentlichen",
    commentPrivate: "privaten",
    commentLabel: ({ publicOrPrivate, markdownUrl }) => [
      "Verfasse einen ",
      strong(`${publicOrPrivate} Kommentar`),
      " in diesem Thread mit ",
      a({ href: markdownUrl }, "Markdown"),
      ".",
    ],
    publishLabel: ({ markdownUrl, linkTarget }) => [
      "Verfasse einen neuen öffentlichen Beitrag in ",
      a(
        {
          href: markdownUrl,
          target: linkTarget,
        },
        "Markdown"
      ),
      ". Beiträge können nicht bearbeitet oder gelöscht werden.",
    ],
    publishCustomInfo: ({ href }) => [
      "Wenn du ein erfahrener Benutzer bist kannst du auch ",
      a({ href }, "eine benutzerdefinierte Nachricht veröffentlichen"),
      ".",
    ],
    publishBasicInfo: ({ href }) => [
      "Wenn du kein erfahrener Benutzer bist, solltest du ",
      a({ href }, "einen einfachen Beitrag veröffentlichen"),
      ".",
    ],
    publishCustom: "Benutzerdefinierte Veröffentlichung",
    replyLabel: ({ markdownUrl }) => [
      "Verfasse eine ",
      strong("öffentliche Antwort"),
      " zu dieser Nachricht mit ",
      a({ href: markdownUrl }, "Markdown"),
      ". Nachrichten können nicht bearbeitet oder gelöscht werden. Um auf einen kompletten Thread zu antworten, klicke auf ",
      strong("kommentieren"),
      " stattdessen.",
    ],
    // settings
    settingsIntro: ({ readmeUrl, version }) => [
      `Du verwendest Oasis ${version}. Lese `,
      a({ href: readmeUrl }, "die Readme"),
      ", konfiguriere dein Theme oder schaue dir Debugging-Informationen weiter unten an.",
    ],
    theme: "Theme",
    themeIntro:
      "Wähle ein Theme das dir gefällt. Das Standard-Theme ist Atelier-SulphurPool-Light.",
    setTheme: "Theme einstellen",
    language: "Sprache",
    languageDescription:
      "Wenn du Oasis in einer anderen Sprache nutzen möchtest, wähle unten eine aus. Bitte beachte, dass dies sehr neu und noch am Anfang ist. Wir freuen uns über deine Hilfe bei der Übersetzung von Oasis in andere Sprachen.",
    setLanguage: "Sprache einstellen",
    status: "Status",
    peerConnections: "Verbindungen zu Peers 💻⚡️💻",
    connectionsIntro:
      "Dein Computer synchronisiert Daten mit diesen anderen Computern. Auf der Suche nach Daten von deinen Freund*innen werden Verbindungen zu allen Scuttlebutt Pubs und Peers aufgenommen die gefunden werden, auch wenn du keine Beziehung mit diesen hast.",
    noConnections: "Keine Peers verbunden.",
    connectionActionIntro:
      "Du kannst entscheiden wann dein Computer mit Peers netzwerken soll. Du kannst das Netzwerken starten, stoppen oder neustarten wann immer du willst.",
    startNetworking: "Netzwerken starten",
    stopNetworking: "Netzwerken stoppen",
    restartNetworking: "Netzwerken neustarten",
    indexes: "Indizes",
    invites: "Einladungen",
    invitesDescription:
      "Löse eine Einladung durch einfügen unten ein. Wenn es geklappt hat wirst du dem Feed folgen und sie werden dir folgen.",
    acceptInvite: "Einladung annehmen",
    // search page
    searchLabel:
      "Füge Wörte hinzu nach denen in heruntergeladenen Nachrichten gesucht werden soll.",
    // posts and comments
    commentDescription: ({ parentUrl }) => [
      " kommentierte auf ",
      a({ href: parentUrl }, " Thread"),
    ],
    replyDescription: ({ parentUrl }) => [
      " antwortete auf ",
      a({ href: parentUrl }, " Nachricht"),
    ],
    mysteryDescription: "veröffentlichte eine mysteriöse Nachricht",
    // misc
    oasisDescription: "Freundliches Scuttlebutt Interface",
    submit: "Abschicken",
    editProfile: "Profil bearbeiten",
    editProfileDescription:
      "Bearbeite dein Profil mit Markdown. Nachrichten können nicht bearbeitet oder gelöscht werden. Alte Versionen deiner Profilinformationen bleiben existieren und sind öffentliche Informationen, aber die meisten SSB-Apps zeigen diese nicht an.",
    profileName: "Profilname (Text)",
    profileDescription: "Profilbeschreibung (Markdown)",
    hashtagDescription:
      "Beiträge von Leuten in deinem Netzwerk die dieses Hashtag referenzieren, sortiert nach Aktualität.",
  },
  it: {
    // navbar items
    extended: "Rete estesa",
    extendedDescription: [
      "Cronologia dei post scritti da  ",
      strong("persone che non segui"),
      ". Quando segui qualcuno potresti scaricare post pubblicati da persone a te estranee ma seguite da loro, e questi messaggi compariranno qui.",
    ],
    popular: "In evidenza",
    popularDescription: [
      "Posts dalle persone nel tuo network, ordinati per ",
      strong("like"),
      " in un dato periodo. I like vengono contati tra i post di ",
      em("chiunque"),
      ", incluse le persone che non segui, quindi qui vedrai i post dei tuoi amici che sono più popolari nella tua rete estesa.",
    ],
    latest: "Novità",
    latestDescription:
      "Post scritti da te e dalle persone che segui, ordinati per data.",
    topics: "Argomenti",
    topicsDescription: [
      strong("Argomenti"),
      " scritti da te e dalle persone che segui, ordinati per data. Seleziona il timestamp di un post per visualizzarne il thread.",
    ],
    summaries: "Riassunti",
    summariesDescription: [
      strong("Argomenti e qualche commento"),
      " scritto da te e dalle persone che segui, in ordine cronologico. Clicca il timestamp di un post per visualizzarne il thread.",
    ],
    threads: "Thread",
    threadsDescription: [
      strong("Posts che hanno commenti"),
      " scritti da persone che segui e dalla tua rete estesa, ordinati cronologicamente. from people you follow and your extended network, sorted by recency. Clicca il timestamp di un post per visualizzarne il thread.",
    ],
    profile: "Profilo",
    manualMode: "Modalità manuale",
    mentions: "Menzioni",
    mentionsDescription: [
      strong("Post che ti menzionano,"),
      " scritti da ",
      strong("chiunque"),
      ", ordinati cronologicamente. A volte le persone dimenticano di @menzionarti, in quel caso i loro post non verranno mostrati qui.",
    ],
    private: "Privato",
    privateDescription: [
      "Gli ultimi commenti su ",
      strong("thread privati di cui fai parte"),
      ", ordinati cronologicamente. I post privati sono crittati con la tua chiave pubblica, e possono avere un massimo di 7 destinatari. Non è possibile aggiungere destinatari una volta che il thread è iniziato. Clicca il timestamp di un post per visualizzarne il thread.",
    ],
    search: "Cerca",
    settings: "Impostazioni",
    // post actions
    comment: "Commenta",
    reply: "Rispondi",
    json: "JSON",
    // relationships
    unfollow: "Non seguire più",
    follow: "Segui",
    relationshipFollowing: "Stai seguendo",
    relationshipYou: "Sei tu",
    relationshipBlocking: "Stai bloccando",
    relationshipNone: "Non stai né seguendo né bloccando",
    relationshipConflict:
      "In qualche modo non meglio precisato stai seguendo e bloccando allo stesso tempo",
    // author view
    viewLikes: "Visualizza like",
    // likes view
    likedBy: "Like di ", // here the subject of the sentence should be put at the end (as if it were "liked by X" instead of "X's likes"
    // composer
    attachFiles: "Aggiungere i file",
    preview: "Visualizza l'anteprima",
    publish: "Pubblica",
    contentWarningPlaceholder:
      "Avviso su possibili contenuti per adulti nel post, opzionale",
    publishCustomDescription: [
      "Pubblica un messaggio su misura inserendo dati ",
      a({ href: "https://en.wikipedia.org/wiki/JSON" }, "JSON"),
      " qui sotto. Torna utile per realizzare prototipi o per pubblicare post ancora non supportati da Oasis.  Questo messaggio non potrà essere modificato né rimosso.",
    ],
    commentWarning: [
      " I commenti non possono essere modificati né rimossi. Per rispondere ad un messaggio, seleziona ",
      strong("rispondi"),
      " invece.",
    ],
    commentPublic: "pubblico",
    commentPrivate: "privato",
    commentLabel: ({ publicOrPrivate, markdownUrl }) => [
      "Scrivi un ",
      strong(`${publicOrPrivate} commento`),
      " su questo thread con ",
      a({ href: markdownUrl }, "Markdown"),
      ".",
    ],
    publishLabel: ({ markdownUrl, linkTarget }) => [
      "Scrivi un post pubblico in ",
      a(
        {
          href: markdownUrl,
          target: linkTarget,
        },
        "Markdown"
      ),
      ". I post non possono essere modificati né rimossi.",
    ],
    publishCustomInfo: ({ href }) => [
      "Se sei uno smanettone puoi anche ",
      a({ href }, "pubblicare un messaggio su misura"),
      ".",
    ],
    publishBasicInfo: ({ href }) => [
      "Se non sei uno smanettone ti consigliamo di ",
      a({ href }, "pubblicare un post"),
      ".",
    ],
    publishCustom: "Pubblica su misuram",

    replyLabel: ({ markdownUrl }) => [
      "Scrivi una ",
      strong("risposta pubblica"),
      " a questo messaggio con ",
      a({ href: markdownUrl }, "Markdown"),
      ". I messaggi non possono essere modificati né rimossi. Per rispondere ad un intero thread seleziona ",
      strong("commenta"),
      " invece.",
    ],
    // settings
    settingsIntro: ({ readmeUrl, version }) => [
      `Stai usando Oasis ${version}. Dai un'occhiata al `,
      a({ href: readmeUrl }, "file readme"),
      ", configura il tuo tema o leggi i log di debugging qui sotto.",
    ],
    theme: "Tema",
    themeIntro:
      "Scegli il tema che più ti piace. Il tema predefinito si chiama Atelier-SulphurPool-Light. Puoi anche selezionare il tuo tema nel file di configurazione.",
    setTheme: "Set theme",
    language: "Lingua",
    languageDescription:
      "Se vuoi utilizzare Oasis in un'altra lingua, puoi sceglierla qui sotto. Attenzione, è una nuova funzionalità e la traduzione potrebbe non essere perfetta. Se parli una lingua straniera ci piacerebbe che ci aiutassi a tradurre Oasis in altre lingue.",
    setLanguage: "Seleziona lingua",

    status: "Stato attuale",
    peerConnections: "Connessioni coi peer 💻⚡️💻",
    connectionsIntro:
      "Il tuo computer sincronizza i dati con questi computer e si connetterà a qualsiasi pub o utente scuttlebutt con cui riesce ad entrare in contatto. Dato che preleva dati dalla tua cerchia di amici, potresti vedere dati scritti da utenti che non conosci.",
    noConnections: "Nessun peer connesso.",
    connectionActionIntro:
      "Puoi decidere se vuoi che il tuo computer entri in contatto con peer connessi alla stessa intranet in cui ti trovi ora. Puoi far partire, fermare o far ripartire questo tipo di connessioni quando vuoi.",
    startNetworking: "Inizia networking locale",
    stopNetworking: "Ferma networking locale",
    restartNetworking: "Ricarica networking locale",
    indexes: "Indici",
    invites: "Inviti",
    invitesDescription:
      "Utilizza un invito che hai ricevuto incollandolo qui sotto. Se viene accettato ne seguirai il feed e ne riceverai il follow.",
    acceptInvite: "Accetta l'invito",
    // search page
    searchLabel: "Cerca tra i messaggi che hai scaricato.",
    // posts and comments
    commentDescription: ({ parentUrl }) => [
      " ha commentato il ",
      a({ href: parentUrl }, " thread"),
    ],
    replyDescription: ({ parentUrl }) => [
      " ha risposto al  ",
      a({ href: parentUrl }, " messaggio "),
    ],
    mysteryDescription: "ha postato un messaggio misterioso",
    // misc
    oasisDescription: "Interfaccia per scuttlebutt facile da usare",
    submit: "Vai",
    editProfile: "Modifica profilo",
    editProfileDescription:
      "Modifica il tuo profilo usando Markdown. Le versioni precedenti del tuo profilo continueranno ad esistere e non possono essere eliminate, ma la maggior parte dei client per SSB non le mostreranno.",
    profileName: "Nome profilo (testo non formattato)",
    profileImage: "Immagine di profilo",
    profileDescription: "Descrizione del profilo (Markdown)",
    hashtagDescription:
      "Post da persone nella tua rete che menzionano questo hashtag, ordinati cronologicamente.",
  },
  fr: {
    // navbar items
    extended: "Étendue",
    extendedDescription: [
      "Messages de ",
      strong("quelqu'un que vous ne suivez pas"),
      ", triées ancienneté. Lorsque vous suivez quelqu'un, vous pouvez télécharger les messages des personnes qu'il suit, et ces messages apparaissent ici.",
    ],
    popular: "Populaire",
    popularDescription: [
      "Messages des personnes de votre réseau, triés par ",
      strong("votes"),
      " dans une période donnée. Les votes sont comptés à partir de ",
      em("tous"),
      ", y compris les personnes que vous ne suivez pas, donc cela montre les messages de vos amis qui sont populaires dans votre réseau étendu.",
    ],
    latest: "Dernières nouvelles",
    latestDescription:
      "Les messages de vous-même et des personnes que vous suivez, triés par ancienneté.",
    topics: "Sujets",
    topicsDescription: [
      strong("Sujets"),
      " de vous-même et des personnes que vous suivez, classés par ancienneté. Sélectionnez l'horodatage de n'importe quel message pour voir le reste du fil de discussion.",
    ],
    summaries: "Résumés",
    summariesDescription: [
      strong("Sujets et commentaires"),
      " de vous-même et des personnes que vous suivez, classés par ancienneté. Sélectionnez l'horodatage de n'importe quel message pour voir le reste du fil de discussion.",
    ],
    threads: "Fils de discussion",
    threadsDescription: [
      strong("Messages avec commentaires"),
      " des personnes que vous suivez et de votre réseau étendu, classés par ancienneté. Sélectionnez l'horodatage de n'importe quel message pour voir le reste du fil de discussion.",
    ],
    profile: "Profil",
    manualMode: "Mode Manuel",
    mentions: "Mentions",
    mentionsDescription: [
      strong("Postes qui vous mentionnent"),
      " from ",
      strong("n'importe qui"),
      " triées par ancienneté. Parfois, les gens peuvent oublier de vous @mentionner, et ces messages n'apparaîtront pas ici.",
    ],
    private: "Privé",
    privateDescription: [
      "Le dernier commentaire de ",
      strong("des fils de discussion privés qui vous incluent"),
      ", triées par ancienneté. Les messages privés sont cryptés par clé publique, et ont un maximum de 7 destinataires. Les destinataires ne peuvent pas être ajoutés après le démarrage du fil de discussion. Sélectionnez l'horodatage pour voir le fil de discussion complet.",
    ],
    search: "Rechercher",
    settings: "Paramètres",
    // post actions
    comment: "Commentaire",
    reply: "Réponse",
    json: "JSON",
    // relationships
    unfollow: "Ne plus suivre",
    follow: "Suivre",
    block: "Bloquer",
    unblock: "Débloquer",
    relationshipFollowing: "Vous suivez",
    relationshipYou: "C'est vous",
    relationshipBlocking: "Vous bloquez",
    relationshipNone: "Vous ne suivez ni ne bloquez",
    relationshipConflict:
      "D'une certaine manière, vous suivez et bloquez à la fois",
    // author view
    viewLikes: "Voir les votes",
    // likes view
    likedBy: "a voté",
    // composer
    attachFiles: "Ajouter des fichiers",
    preview: "Examiner",
    publish: "Publier",
    contentWarningPlaceholder:
      "Avertissement de contenu facultatif pour ce poste",
    publishCustomDescription: [
      "Publier un message personnalisé en entrant ",
      a({ href: "https://en.wikipedia.org/wiki/JSON" }, "JSON"),
      " ci-dessous. Cela peut être utile pour le prototypage ou la publication de messages qu'Oasis ne prend pas en charge. Ce message ne peut pas être modifié ou supprimé.",
    ],
    commentWarning: [
      " Les commentaires ne peuvent être ni modifiés ni supprimés. Pour répondre à un message individuel, sélectionnez ",
      strong("répondre"),
      " à la place.",
    ],
    commentPublic: "public",
    commentPrivate: "privé",
    commentLabel: ({ publicOrPrivate, markdownUrl }) => [
      "Ecrire un ",
      strong(`${publicOrPrivate} commentaire`),
      " sur ce fil avec ",
      a({ href: markdownUrl }, "Markdown"),
      ".",
    ],
    publishLabel: ({ markdownUrl, linkTarget }) => [
      "Rédiger un nouveau poste public dans ",
      a(
        {
          href: markdownUrl,
          target: linkTarget,
        },
        "Markdown"
      ),
      ". Les messages ne peuvent être ni modifiés ni supprimés.",
    ],
    publishCustomInfo: ({ href }) => [
      "Si vous êtes un utilisateur avancé, vous pouvez également ",
      a({ href }, "publier un message personnalisé"),
      ".",
    ],
    publishBasicInfo: ({ href }) => [
      "Si vous n'êtes pas un utilisateur avancé, vous devez ",
      a({ href }, "publier un message"),
      ".",
    ],
    publishCustom: "Publier un type particulier",

    replyLabel: ({ markdownUrl }) => [
      "Ecrire un ",
      strong("réponse publique"),
      " à ce message avec ",
      a({ href: markdownUrl }, "Markdown"),
      ". Les messages ne peuvent être ni modifiés ni supprimés. Pour répondre à un fil de discussion entier, sélectionnez ",
      strong("commentaire"),
      " en remplacement.",
    ],
    // settings
    settingsIntro: ({ readmeUrl, version }) => [
      `Vous utilisez Oasis ${version}. Consultez `,
      a({ href: readmeUrl }, "le lisez-moi"),
      ", configurez votre thème, ou consultez les informations de débogage ci-dessous.",
    ],
    theme: "Thème",
    themeIntro:
      "Choisissez le thème que vous souhaitez. Le thème par défaut est Atelier-SulphurPool-Light. Vous pouvez également définir votre thème dans le fichier de configuration par défaut.",
    setTheme: "Choisir thème",
    language: "Langue",
    languageDescription:
      "Si vous souhaitez utiliser Oasis dans une autre langue, choisissez l'une des langues ci-dessous. Sachez qu'il s'agit d'une langue très nouvelle et très basique. Nous aimerions que vous nous aidiez à traduire Oasis dans d'autres langues et d'autres lieux.",
    setLanguage: "Choisir la langue",

    status: "Status",
    peerConnections: "Connexions pair à pair 💻⚡️💻",
    connectionsIntro:
      "Votre ordinateur synchronise les données avec ces autres ordinateurs. Il se connecte à n'importe quel pub de ragots et peer-to-peer qu'il peut trouver, même si vous n'avez pas de relation avec eux, en cherchant des données de vos amis.",
    noConnections: "Aucun pair n'est connecté.",
    connectionActionIntro:
      "Vous pouvez décider quand vous voulez que votre ordinateur soit en réseau avec vos pairs. Vous pouvez démarrer, arrêter ou redémarrer votre réseau quand vous le souhaitez.",
    startNetworking: "Activer le réseau",
    stopNetworking: "Désactiver le réseau",
    restartNetworking: "Redémarrer le réseau",
    indexes: "Index",
    invites: "Invitations",
    invitesDescription:
      "Utilisez une invitation en la collant ci-dessous. Si cela fonctionne, vous suivrez le flux et ils vous suivront en retour.",
    acceptInvite: "Accepter l'invitation",
    // search page
    searchLabel:
      "Ajouter un ou plusieurs mots à rechercher dans les messages téléchargés.",
    // posts and comments
    commentDescription: ({ parentUrl }) => [
      " a commenté ",
      a({ href: parentUrl }, " fil de discussion"),
    ],
    replyDescription: ({ parentUrl }) => [
      " a répondu à ",
      a({ href: parentUrl }, " message"),
    ],
    mysteryDescription: "a posté un message mystérieux",
    // misc
    oasisDescription: "Une interface conviviale pour des bavardages entre amis",
    submit: "Soumettre",
    editProfile: "Modifier le profil",
    editProfileDescription:
      "Modifiez votre profil en Markdown. Les anciennes versions des informations de votre profil existent toujours et ne peuvent pas être supprimées, mais la plupart des applications SSB ne les affichent pas.",
    profileName: "Nom du profil (texte en clair)",
    profileImage: "Image du profil",
    profileDescription: "Description du profil (Markdown)",
    hashtagDescription:
      "Les messages des personnes de votre réseau qui font référence à ce hashtag, triés par ordre de récence.",
  },
};

module.exports = i18n;
