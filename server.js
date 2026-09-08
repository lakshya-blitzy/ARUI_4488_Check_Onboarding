/**
 * @file Minimal HTTP service: one Node.js `http` listener bound to the loopback
 * interface, answering every dispatched request with the same plain-text
 * greeting. Requiring this file is not side-effect free - `http.createServer`
 * and `server.listen` both run at module evaluation and nothing is exported, so
 * run it with `node server.js` instead of importing it.
 * @requires module:http
 * @see README.md
 */

/**
 * Node.js core HTTP module - the sole `require` in this file and this project's
 * only dependency. It ships with the runtime, so there is no install step: no
 * manifest, no lockfile and no third-party package.
 * @constant {module:http}
 */
const http = require('http');

/**
 * Contract of the inline `'request'` listener passed to `http.createServer`.
 * The handler is unconditional: for every request the runtime dispatches to it
 * it assigns status `200`, sets `Content-Type: text/plain` and writes the same
 * fourteen bytes - `Hello, World!` and a newline. Method, path, query, headers
 * and body are never inspected; there is no routing, no `404` or `405`, and no
 * error path.
 *
 * Dispatch is the runtime's decision, not the handler's, so that is not the same
 * as "every request gets a body": an unrecognized method draws a parser-level
 * `400 Bad Request` before the handler runs, `CONNECT` raises `'connect'` rather
 * than `'request'` and never reaches the handler, and `HEAD` runs the handler
 * unchanged while the runtime suppresses both the body and `Content-Length`.
 * Whole responses are not guaranteed identical between calls either, since the
 * runtime-generated `Date` is cached at one-second granularity; the invariants
 * are the application-controlled status, media type and fourteen payload bytes.
 * @callback RequestHandler
 * @param {http.IncomingMessage} req Inbound request, accepted because the
 *   runtime supplies it but never inspected; the reply does not depend on it.
 * @param {http.ServerResponse} res Response being written: the status, then the
 *   one header, then the body, ended by the handler.
 * @returns {void} Nothing is returned; the reply is delivered by ending `res`.
 */

/**
 * Bind address: the IPv4 loopback literal, which confines the service to its own
 * network namespace - a client on the same host reaches it, while a request to
 * that host's routable address is refused. Fixed at authoring time and not
 * overridable at runtime: no environment variable is read, so `HOST` has no
 * effect, and there is no configuration file.
 * @constant {string}
 * @default
 */
const hostname = '127.0.0.1';

/**
 * TCP port the listener binds. Unprivileged, so no elevated identity is needed,
 * and fixed at authoring time like {@link hostname}: `PORT` is not read and has
 * no effect. No fallback port exists and no `'error'` listener is registered, so
 * a collision is fatal - a second instance started while this address and port
 * are already bound in the same namespace prints an `EADDRINUSE` stack trace to
 * stderr and exits non-zero.
 * @constant {number}
 * @default
 */
const port = 3000;

/**
 * The HTTP server instance, constructed at module evaluation time. The inline
 * arrow on the following line is its sole 'request' listener; its contract is
 * {@link RequestHandler}. The readiness callback it is started with is
 * {@link ReadyCallback}.
 * @constant {http.Server}
 */
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

/**
 * Contract of the inline callback passed to `server.listen`, invoked once the
 * listener is bound and accepting connections. Its single stdout line is this
 * service's sole readiness indicator - there is no health endpoint to poll and
 * no further application output. A failed bind emits `'error'` instead, so this
 * callback never runs then and only a runtime stderr trace remains as evidence.
 * @callback ReadyCallback
 * @listens module:http~Server#event:listening
 * @returns {void} Nothing is returned; readiness is signalled by the log line.
 */
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
