/**
 * @file Minimal HTTP service: one Node.js `http` listener on the loopback bind.
 * Its handler answers every dispatched request by assigning status `200`,
 * setting `Content-Type: text/plain` and writing the same greeting bytes - a
 * body the runtime suppresses for `HEAD`. Requiring this file builds and binds
 * that listener at module evaluation and exports nothing: run `node server.js`.
 * @requires module:http
 * @see README.md
 */

/**
 * Node.js core HTTP module and this file's sole `require`. Installing Node.js is
 * a machine prerequisite; this module ships with it, so no project dependency
 * install exists: no `npm install`, manifest, lockfile or third-party package.
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
 * Dispatch is the runtime's decision, so this is not the same as "every request
 * gets a body": an unrecognized method draws a parser-level `400 Bad Request`
 * before the handler runs, `CONNECT` raises `'connect'` and never reaches the
 * handler, and `HEAD` runs the handler unchanged while the runtime suppresses
 * the body and `Content-Length`. Whole-response identity is neither guaranteed
 * nor excluded: runtime-generated headers can vary, and `Date` was observed
 * cached at one-second granularity on Node.js v22.23.2. The invariants are the
 * application-controlled status, media type and fourteen payload bytes.
 * @callback RequestHandler
 * @param {http.IncomingMessage} req Inbound request, accepted because the
 *   runtime supplies it but never inspected; the reply does not depend on it.
 * @param {http.ServerResponse} res Response being written: the status, then the
 *   one header, then the body, ended by the handler.
 * @returns {void} Nothing is returned; the reply is delivered by ending `res`.
 */

/**
 * Bind address: the IPv4 loopback literal, so the service is reachable only
 * through this loopback bind, from clients in the listener's own network
 * namespace; the listener accepts nothing through a routable interface. Fixed
 * at authoring time and not overridable at runtime: no environment variable is
 * read, so `HOST` has no effect, and there is no configuration file.
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
 * listener is bound. Its single stdout line is the sole readiness indicator -
 * there is no health endpoint, and the application logs nothing further. A
 * failed bind emits `'error'` instead, so this callback never runs: no readiness
 * line, a runtime stderr trace and a non-zero exit follow.
 * @callback ReadyCallback
 * @listens module:http~Server#event:listening
 * @returns {void} Nothing is returned; readiness is signalled by the log line.
 */
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
