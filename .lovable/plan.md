## Diagnosis

The dev 500 on `GET /src/routeTree.gen.ts` is caused by a stale generated route tree that references files no longer on disk:

- `src/routeTree.gen.ts` still imports `./routes/landlord.signup` and declares `LandlordSignupRouteImport`, but `src/routes/landlord.signup.tsx` does not exist in the project.
- Only `src/routes/signup.tsx` exists (route `/signup`), plus `src/routes/landlord.tsx` (route `/landlord`, no children).
- The TanStack Router Vite plugin fails during its route crawl (that's the "Crawling result not available" error at `start-router-plugin/plugin.js:69`), so it can't regenerate `routeTree.gen.ts` to match the real filesystem — the stale file keeps failing to transform, returning 500.

A secondary bug: `src/routes/login.tsx` links to `/landlord/signup`, which never existed as a route after the previous cleanup.

## Fix

1. **Delete `src/routeTree.gen.ts`.** The TanStack Router Vite plugin regenerates it on the next dev run from the actual files in `src/routes/` (`index`, `applications`, `browse`, `forgot-password`, `landlord`, `login`, `signup`, `rooms.$roomId`, `settings.notifications`, `sitemap[.]xml`). Do not hand-edit it.
2. **Update `src/routes/login.tsx`** — change the landlord signup link target from `/landlord/signup` to `/signup` (the existing unified signup page handles both roles).
3. **Restart the dev server** so the router plugin runs a fresh crawl and rewrites `routeTree.gen.ts`.
4. **Verify**: hit `/`, `/login`, `/signup`, `/browse`, `/landlord` in the preview and confirm no 500 on `routeTree.gen.ts` and no console errors.

No other files or business logic change.
