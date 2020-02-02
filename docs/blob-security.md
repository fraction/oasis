# Blob security

**This is how we secure blob pages from interacting with Oasis. If you notice
any errors or omissions, please follow the steps in the security policy.**

One of the problems we have when hosting content from other people in a P2P
network is avoiding
[arbitrary code execution](https://en.wikipedia.org/wiki/Arbitrary_code_execution).
In the context of Oasis, we need to be very sure that we aren't letting any code
other than Oasis run in the browser. Markdown is a security concern, but it's
got lots of eyeballs on the problem, whereas blob security is a security
concern without any common best practices. The problem we need to solve isn't
super common: hosting arbitrary data, especially HTML, in a safe way that doesn't
open security vulnerabilities.

The way we currently deal with this is a [content security policy (CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP),
which gives Oasis a way to tell the web browser which features can be safely
disabled. Since Oasis doesn't use any front-end JavaScript, we can disable all
JavaScript being run by the web browser. This is _huge_ and massively reduces
the surface area that might be vulnerable to attack. You can find all of the
CSP code in [`http.js`](https://github.com/fraction/oasis/blob/master/src/http.js).

With JavaScript out of the way, the only attack vector that we should worry
about is an [HTML form](https://developer.mozilla.org/en-US/docs/Learn/Forms#See_also).
If one of these were embedded in a blob, they would be able to send HTTP POST
requests to our API endpoints, impersonating the user. A button called "click
me", could publish posts, change follow status, make changes to our settings
page, or other bad behavior that we want to avoid.

The mitigation for this is a referrer check on all POST endpoints, which helps
us guarantee that all form submissions came from a non-blob page. If we receive
an HTTP POST without a referrer, we throw an error. If we receive a referrer from
a blob page, we throw an error. If a form submission passes these two checks,
we can safely assume that the POST request came from a legitimate person using
Oasis.
