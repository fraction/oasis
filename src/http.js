const Koa = require("koa");
const koaStatic = require("koa-static");
const path = require("path");
const mount = require("koa-mount");

/**
 * @type function
 * @param {{ host: string, port: number, middleware: any[], allowHost: string | null }} input
 * @return function
 */
module.exports = ({ host, port, middleware, allowHost }) => {
  const assets = new Koa();
  assets.use(koaStatic(path.join(__dirname, "assets")));

  const app = new Koa();

  const validHosts = [];

  // All non-GET requests must have a path that doesn't start with `/blob/`.
  const isValidRequest = (request) => {
    // All requests must use our hostname to prevent DNS rebind attacks.
    if (validHosts.includes(request.hostname) !== true) {
      console.log(`Invalid HTTP hostname: ${request.hostname}`);
      return false;
    }

    // All non-GET requests must ...
    if (request.method !== "GET") {
      // ...have a referer...
      if (request.header.referer == null) {
        console.log("No referer");
        return false;
      }

      try {
        const refererUrl = new URL(request.header.referer);
        // ...with a valid hostname...
        if (validHosts.includes(refererUrl.hostname) !== true) {
          console.log(`Invalid referer hostname: ${refererUrl.hostname}`);
          return false;
        }

        // ...and must not originate from a blob path.
        if (refererUrl.pathname.startsWith("/blob/")) {
          console.log(`Invalid referer path: ${refererUrl.pathname}`);
          return false;
        }
      } catch (e) {
        console.log(`Invalid referer URL: ${request.header.referer}`);
        return false;
      }
    }

    // If all of the above checks pass, this is a valid request.
    return true;
  };

  app.on("error", (err, ctx) => {
    // Output full error objects
    console.error(err);

    // Avoid printing errors for invalid requests.
    if (isValidRequest(ctx.request)) {
      err.message = err.stack;
      err.expose = true;
    }

    return null;
  });

  app.use(mount("/assets", assets));

  // headers
  app.use(async (ctx, next) => {
    const csp = [
      "default-src 'none'",
      "img-src 'self'",
      "form-action 'self'",
      "media-src 'self'",
      "style-src 'self'",
    ].join("; ");

    // Disallow scripts.
    ctx.set("Content-Security-Policy", csp);

    // Disallow <iframe> embeds from other domains.
    ctx.set("X-Frame-Options", "SAMEORIGIN");

    const isBlobPath = ctx.path.startsWith("/blob/");

    if (isBlobPath === false) {
      // Disallow browsers overwriting declared media types.
      //
      // This should only happen on non-blob URLs.
      // See: https://github.com/fraction/oasis/issues/138
      ctx.set("X-Content-Type-Options", "nosniff");
    }

    // Disallow sharing referrer with other domains.
    ctx.set("Referrer-Policy", "same-origin");

    // Disallow extra browser features except audio output.
    ctx.set("Feature-Policy", "speaker 'self'");

    const validHostsString = validHosts.join(" or ");

    ctx.assert(
      isValidRequest(ctx.request),
      400,
      `Request must be addressed to ${validHostsString} and non-GET requests must contain non-blob referer.`
    );

    await next();
  });

  middleware.forEach((m) => app.use(m));

  const server = app.listen({ host, port });

  // `server.address()` returns null unless you wait until the next tick.
  setImmediate(() => {
    const address = server.address();

    if (typeof address === "string") {
      // This shouldn't happen, but TypeScript was complaining about it.
      throw new Error("HTTP server should never bind to Unix socket");
    }

    if (allowHost !== null) {
      validHosts.push(allowHost);
    }

    validHosts.push(address.address);

    if (validHosts.includes(host) === false) {
      validHosts.push(host);
    }
  });

  return server;
};
