# Bulk Star service

The homepage lists all 11 GitHub repositories linked in its HTML, including the
seven ecosystem projects, three engine examples and the marketing asset library.
`star-repositories.json` is the server allowlist; update it alongside homepage
links. `node --test qa-stars.cjs` checks coverage and the authorization boundary.

## Configure a project-owned GitHub App

1. Register a public GitHub App with the project's homepage URL. Enable **Device
   Flow**. Disable webhooks if unused. No callback or client secret is needed for
   this flow.
2. Grant **Account permissions → Starring: read and write** and the required
   **Repository permissions → Metadata: read**. Do not grant code-write access.
3. Inject the public Client ID as `GITHUB_STAR_CLIENT_ID` in the server process.
   Do not paste user access tokens or secrets into the page or tracked files.
4. Run `node local-preview.cjs` (Node 22+). Open <http://127.0.0.1:4173/>.
   The first click lists repositories; “Authorize & star all” requests a code.
   The visitor opens GitHub, enters that code, and grants access. The page then
   automatically sends the batch and shows individual results. Retry skips
   successful items; existing stars are preserved by GitHub's idempotent PUT.

## Hosting

GitHub Pages serves static files and cannot run the authorization API. Keep the
static site on Pages and route `/api/stars/*` through a same-origin HTTPS reverse
proxy to a Node service invoking `createStarService` from `star-service.cjs`.
Set `STAR_PUBLIC_ORIGIN` to the exact public HTTPS origin. The included preview
server binds loopback only; a production process can remain behind the local
reverse proxy. Forward API responses unchanged, including `Set-Cookie`, and do
not cache them. Do not enable cross-origin API access or log cookies, tokens,
upstream payloads, or authorization codes. Apply edge request rate limits before
public exposure, especially to `/start`. Host the single-process API separately
from static file delivery; in-memory sessions are not shared between replicas.

Tokens stay only in server memory, bound to a random HttpOnly/SameSite cookie.
Sessions expire within 15 minutes; browser close of the dialog discards the
session, stopping remaining requests after any in-flight request. Successful
stars remain. Server restart requires fresh authorization. No refresh token is
retained. Users can revoke app authorization in GitHub settings. Errors and
limits are reported without exposing GitHub payloads. No real stars are made by
the test suite: it injects a simulated GitHub transport. Production authorization
has not been verified until a project-owned app and hosting are configured.

If the service is unavailable or unconfigured, the page shows a clear notice and
individual repository links. It never substitutes opening tabs for a successful
batch operation.

References: [GitHub App device flow](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app#using-the-device-flow-to-generate-a-user-access-token),
[Starring API and permissions](https://docs.github.com/en/rest/activity/starring#star-a-repository-for-the-authenticated-user).
